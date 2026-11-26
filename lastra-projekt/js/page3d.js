/* =====================================================================
   Lastra Projekt – shared 3D viewer core + the page scenes
   ---------------------------------------------------------------------
   createViewer(root, scene) is used by every small 3D object on the site
   (services, process, projects, about, contact and – via architect3d.js –
   the architect scale model). Each viewer:
     • creates its WebGL context lazily (only when it approaches the viewport)
       and releases it on page hide, so iOS Safari never runs out of contexts
     • renders inside the single gsap.ticker clock (LP.clock) – no own rAF
     • ACES, sRGB, RoomEnvironment reflections, soft PCF shadows
     • pixelRatio ≤ 2 (≤ 1.5 on phones / touch), paused off-screen + tab hidden
     • damped drag orbit with touch-action: pan-y (page scroll is never trapped)
     • webglcontextlost → clean static image fallback
     • optional .glb from SITE.models[key] (GLTFLoader), procedural fallback
   Elements: <div class="p3d" data-p3d="layers|stages|massing|monolith|pin">
   ===================================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const LP = window.LP || {};
const SITE = window.SITE || {};
export const reduce = !!LP.reduce || matchMedia("(prefers-reduced-motion: reduce)").matches;
export const coarse = matchMedia("(pointer: coarse)").matches;
export const phone = () => innerWidth < 768 || (coarse && Math.min(innerWidth, innerHeight) < 820);
export const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
export const sstep = (a, b, v) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const kdt = (k, dtMs) => 1 - Math.pow(1 - k, (dtMs || 16.7) / 16.7);
const tr = k => { const D = window.I18N || {}, l = document.documentElement.lang || "sq"; return (D[l] && D[l][k]) || (D.sq && D.sq[k]) || k; };

export function webgl2() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2")); } catch (e) { return false; } }

/* ------------------------------------------------------------------ shared material helpers */
const TL = new THREE.TextureLoader();
const texCache = new Map();
export function tex(file, srgb, repeat = 1) {
  const key = file + repeat;
  if (texCache.has(key)) return texCache.get(key);
  const t = TL.load("assets/tex/" + file); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t); return t;
}
export function canvasTexture(size, draw, srgb = true, repeat = 1) {
  const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export function brickTexture(size = 512) {
  return canvasTexture(size, (g, S) => {
    const rows = 12, cols = 4, bh = S / rows, bw = S / cols, j = S / 120;
    g.fillStyle = "#bdb4a8"; g.fillRect(0, 0, S, S);
    for (let r = 0; r < rows; r++) for (let k = -1; k <= cols; k++) {
      const x = k * bw + (r % 2) * bw / 2, y = r * bh;
      g.fillStyle = `hsl(${12 + rnd() * 10},${46 + rnd() * 14}%,${36 + rnd() * 12}%)`; g.fillRect(x + j, y + j, bw - 2 * j, bh - 2 * j);
    }
  });
}

/* ------------------------------------------------------------------ viewer core */
export function createViewer(root, scene) {
  const canvas = root.querySelector("canvas") || root.appendChild(Object.assign(document.createElement("canvas"), { className: "p3d-canvas" }));
  canvas.setAttribute("aria-hidden", "true");
  if (!webgl2()) { root.classList.add("p3d-fallback"); return null; }
  const cam = Object.assign({ fov: 30, dist: 10, target: [0, 1, 0], yaw: -.6, pitch: .42, minPitch: .05, maxPitch: 1.1, auto: .00008, dragX: .008, dragY: .005 }, scene.camera || {});
  const st = { yaw: cam.yaw, yawT: cam.yaw, pitch: cam.pitch, pitchT: cam.pitch, dist: cam.dist, distT: cam.dist, target: new THREE.Vector3(...cam.target), targetT: new THREE.Vector3(...cam.target), auto: !reduce && cam.auto > 0, visible: false, dirty: true, w: 0, h: 0, lost: false, ready: false };
  let R = null;   // renderer bundle, created lazily

  function init() {
    const mobile = phone() || coarse;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: mobile ? "low-power" : "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = scene.exposure || 1.05;
    renderer.shadowMap.enabled = scene.shadows !== false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    const s3 = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
    s3.environment = env;
    const camera = new THREE.PerspectiveCamera(cam.fov, 1, .05, 200);
    /* soft studio light: key (soft shadows) + cool rim + warm/ground hemisphere */
    const key = new THREE.DirectionalLight("#fff4e6", 2.0); key.position.set(6, 10, 6);
    key.castShadow = scene.shadows !== false; key.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024); key.shadow.radius = 5; key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 40 });
    const rim = new THREE.DirectionalLight("#c9d6ff", .5); rim.position.set(-7, 5, -6);
    const hemi = new THREE.HemisphereLight("#fffaf2", "#8a7f72", .35);
    s3.add(key, rim, hemi);
    const disposables = [];
    const ctx = { THREE, scene: s3, camera, renderer, root, st, key, rim, hemi, mobile, track: o => (disposables.push(o), o), dirty: () => { st.dirty = true; }, tr };
    const api = scene.build(ctx) || {};
    R = { renderer, scene: s3, camera, pmrem, env, key, api, disposables, ctx };
    /* optional real model from SITE.models[key] */
    const url = scene.modelKey && SITE.models && SITE.models[scene.modelKey];
    if (url && api.slot) loadGLB(url, api, ctx);
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); st.lost = true; root.classList.add("p3d-fallback"); }, false);
    canvas.addEventListener("webglcontextrestored", () => { st.lost = false; root.classList.remove("p3d-fallback"); st.dirty = true; R.renderer.shadowMap.needsUpdate = true; }, false);
    resize(true);
  }

  /* ---- input: damped drag orbit (horizontal), vertical swipes keep scrolling on touch */
  let drag = null;
  canvas.style.touchAction = "pan-y";
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw: st.yawT, pitch: st.pitchT, id: e.pointerId }; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} st.auto = false; root.classList.add("p3d-touched"); });
  canvas.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    st.yawT = drag.yaw + (e.clientX - drag.x) * cam.dragX;
    st.pitchT = Math.max(cam.minPitch, Math.min(cam.maxPitch, drag.pitch + (e.clientY - drag.y) * cam.dragY));
  });
  const end = () => { drag = null; };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);

  function resize(force) {
    if (!R) return;
    const r = root.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (!force && w === st.w && h === st.h) return; st.w = w; st.h = h;
    R.renderer.setSize(w, h, false); R.camera.aspect = w / h; R.camera.updateProjectionMatrix(); st.dirty = true;
  }
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => resize()) : null;
  ro ? ro.observe(root) : addEventListener("resize", () => resize());
  /* lazy context + pause when off-screen */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => {
    st.visible = e.isIntersecting;
    if (e.isIntersecting && !R) { try { init(); } catch (err) { console.warn("[lastra] 3D viewer unavailable", err); root.classList.add("p3d-fallback"); } }
    if (e.isIntersecting) st.dirty = true;
  }, { rootMargin: "250px 0px" }) : null;
  if (io) io.observe(root); else { st.visible = true; init(); }

  const tgt = new THREE.Vector3();
  function tick(time, dtMs) {
    if (!R || !st.visible || st.lost || document.hidden) return;
    const dt = Math.min(50, dtMs || 16.7), a = reduce ? 1 : kdt(.08, dt);
    if (st.auto && !drag) st.yawT += dt * cam.auto;
    let moving = Math.abs(st.yaw - st.yawT) + Math.abs(st.pitch - st.pitchT) + Math.abs(st.dist - st.distT) + st.target.distanceTo(st.targetT) > 1e-4;
    st.yaw = lerp(st.yaw, st.yawT, a); st.pitch = lerp(st.pitch, st.pitchT, a); st.dist = lerp(st.dist, st.distT, reduce ? 1 : kdt(.06, dt)); st.target.lerp(st.targetT, reduce ? 1 : kdt(.06, dt));
    if (R.api.update && R.api.update(time, dt) === true) moving = true;
    if (!moving && !st.dirty) return;
    const d = st.dist * (R.camera.aspect < .85 ? 1.3 : 1);
    tgt.copy(st.target);
    R.camera.position.set(tgt.x + Math.sin(st.yaw) * Math.cos(st.pitch) * d, tgt.y + Math.sin(st.pitch) * d, tgt.z + Math.cos(st.yaw) * Math.cos(st.pitch) * d);
    R.camera.lookAt(tgt);
    R.renderer.shadowMap.needsUpdate = true;
    R.renderer.render(R.scene, R.camera);
    st.dirty = false;
    if (!st.ready) { st.ready = true; root.classList.add("p3d-ready"); }
  }
  if (LP.clock) LP.clock.add(tick);
  else { st.visible = true; if (!R) init(); tick(0, 16); }

  /* release everything (GPU memory + the WebGL context itself) */
  function destroy() {
    LP.clock && LP.clock.remove(tick); ro && ro.disconnect(); io && io.disconnect();
    if (!R) return;
    const seen = new Set();
    R.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(mm => { if (seen.has(mm)) return; seen.add(mm); Object.values(mm).forEach(v => v && v.isTexture && v.dispose()); mm.dispose(); });
    });
    R.disposables.forEach(o => o && o.dispose && o.dispose());
    R.env.dispose(); R.pmrem.dispose(); R.renderer.dispose(); R.renderer.forceContextLoss(); R = null;
  }
  addEventListener("pagehide", e => { if (!e.persisted) destroy(); });
  return { st, destroy, get api() { return R && R.api; }, dirty: () => { st.dirty = true; } };
}

/* optional .glb: fitted onto the procedural plinth footprint, full environment lighting */
function loadGLB(url, api, ctx) {
  import("three/addons/loaders/GLTFLoader.js").then(({ GLTFLoader }) => new GLTFLoader().load(url, gltf => {
    const root = gltf.scene, box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const fit = (api.fit || 4) / Math.max(size.x, size.z, .001);
    root.scale.setScalar(fit); root.position.set(-c.x * fit, -box.min.y * fit, -c.z * fit);
    root.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    api.slot.add(root); if (api.procedural) api.procedural.visible = false;
    ctx.dirty();
  }, undefined, err => console.info("[lastra] model not found, keeping the procedural one:", url, err && err.message))).catch(() => {});
}

/* stone plinth shared by most scenes */
function plinth(ctx, w = 6, d = 4.4, h = .4) {
  const { THREE: T, scene, track } = ctx;
  const g = new T.Group();
  const stone = track(new T.MeshStandardMaterial({ color: "#bcb3a6", roughness: .95, envMapIntensity: .6, normalMap: tex("stone_nor.jpg", false, 2), normalScale: new T.Vector2(.35, .35) }));
  const top = track(new T.MeshStandardMaterial({ color: "#d3ccc1", roughness: .9, envMapIntensity: .6 }));
  const a = new T.Mesh(track(new T.BoxGeometry(w, h, d)), stone); a.position.y = -h / 2 - .02; a.receiveShadow = a.castShadow = true;
  const b = new T.Mesh(track(new T.BoxGeometry(w - .5, .03, d - .5)), top); b.position.y = -.015; b.receiveShadow = true;
  g.add(a, b); scene.add(g); return g;
}

/* ================================================================== SCENES */
const SCENES = {

  /* ---- services: exploded wall build-up -------------------------------------------- */
  layers: {
    modelKey: "services",
    camera: { dist: 9.2, target: [.6, 1.4, 0], yaw: -.95, pitch: .3, auto: .00005 },
    build(ctx) {
      const { THREE: T, scene, track, root } = ctx;
      plinth(ctx, 6.4, 4.2);
      const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
      const M = {
        concrete: track(new T.MeshStandardMaterial({ map: tex("concrete_diff_1k.jpg", true, 1.2), normalMap: tex("concrete_nor.jpg", false, 1.2), roughness: .95, color: "#d9dbe0", transparent: true })),
        brick: track(new T.MeshStandardMaterial({ map: track(brickTexture()), roughness: .92, transparent: true })),
        insul: track(new T.MeshStandardMaterial({ color: "#efe7c6", roughness: .97, transparent: true, map: track(canvasTexture(256, (g, S) => { g.fillStyle = "#efe7c6"; g.fillRect(0, 0, S, S); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(150,130,80,${.05 + rnd() * .08})`; g.beginPath(); g.arc(rnd() * S, rnd() * S, 1 + rnd() * 2.5, 0, 7); g.fill(); } g.strokeStyle = "rgba(120,100,60,.25)"; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * S / 4); g.lineTo(S, i * S / 4); g.stroke(); } }, true, 1)) })),
        plaster: track(new T.MeshStandardMaterial({ color: "#f4f1ec", roughness: .95, normalMap: tex("plaster_nor.jpg", false, 1), normalScale: new T.Vector2(.5, .5), transparent: true })),
        alu: track(new T.MeshStandardMaterial({ color: "#1d1e21", roughness: .3, metalness: .85, transparent: true })),
        glass: track(new T.MeshPhysicalMaterial({ color: "#b7cbd2", roughness: .03, metalness: 0, transparent: true, opacity: .32, envMapIntensity: 1.6, ior: 1.52, specularIntensity: 1, depthWrite: false }))
      };
      Object.values(M).forEach(m => { m.userData.base = m.opacity; });
      /* wall with a window opening: pieces around [y0,y1] × [z0,z1] */
      const H = 2.6, W = 2.6, oy0 = .9, oy1 = 2.1, oz0 = -.55, oz1 = .55, base = .5;
      const pierced = (mat, thick) => {
        const g = new T.Group(); const add = (h, d, y, z) => { const m = new T.Mesh(track(new T.BoxGeometry(thick, h, d)), mat); m.position.set(0, base + y + h / 2, z); m.castShadow = m.receiveShadow = true; g.add(m); };
        add(H, oz0 + W / 2, 0, (-W / 2 + oz0) / 2); add(H, W / 2 - oz1, 0, (oz1 + W / 2) / 2);
        add(oy0, oz1 - oz0, 0, 0); add(H - oy1, oz1 - oz0, oy1, 0);
        return g;
      };
      const layers = [];
      const L = (key, obj, assembled, exploded) => { obj.userData = { key, a: assembled, e: exploded }; procedural.add(obj); layers.push(obj); return obj; };
      /* 1 footing */
      const foot = new T.Group(); { const m = new T.Mesh(track(new T.BoxGeometry(1.1, base, W + .3)), M.concrete); m.position.y = base / 2; m.castShadow = m.receiveShadow = true; foot.add(m); }
      L("footing", foot, [0, 0, 0], [0, -.05, 0]);
      L("brick", pierced(M.brick, .25), [0, 0, 0], [0, .18, 0]);
      L("insul", pierced(M.insul, .12), [.185, 0, 0], [.95, .3, 0]);
      L("plaster", pierced(M.plaster, .02), [.255, 0, 0], [1.75, .42, 0]);
      /* triple-glazed aluminium window unit */
      const win = new T.Group();
      { const fw = .07, fd = .09, h = oy1 - oy0, w = oz1 - oz0, put = (bw, bh, bd, x, y, z, m) => { const o = new T.Mesh(track(new T.BoxGeometry(bw, bh, bd)), m); o.position.set(x, base + y, z); o.castShadow = m !== M.glass; win.add(o); };
        put(fd, fw, w, 0, oy0 + fw / 2, 0, M.alu); put(fd, fw, w, 0, oy1 - fw / 2, 0, M.alu); put(fd, h, fw, 0, (oy0 + oy1) / 2, oz0 + fw / 2, M.alu); put(fd, h, fw, 0, (oy0 + oy1) / 2, oz1 - fw / 2, M.alu);
        for (const dx of [-.028, 0, .028]) put(.006, h - fw * 2, w - fw * 2, dx, (oy0 + oy1) / 2, 0, M.glass); }
      L("glass", win, [.05, 0, 0], [2.6, .55, 0]);
      const keys = ["footing", "brick", "insul", "plaster", "glass"];
      const st = { ex: 1, exT: 1, focus: -1, f: keys.map(() => 1) };
      /* UI */
      const modeBtns = [...root.querySelectorAll("[data-p3d-mode]")], layerBtns = [...root.parentElement.querySelectorAll("[data-p3d-layer]")], cap = root.parentElement.querySelector(".p3d-caption");
      const sync = () => {
        modeBtns.forEach(b => b.setAttribute("aria-pressed", (b.dataset.p3dMode === "exploded") === (st.exT > .5)));
        layerBtns.forEach((b, i) => b.setAttribute("aria-pressed", i === st.focus));
        if (cap) { const k = st.focus < 0 ? "lay_intro" : `lay_${keys[st.focus]}_d`; cap.dataset.i18n = k; cap.textContent = tr(k); }
        ctx.dirty();
      };
      modeBtns.forEach(b => b.addEventListener("click", () => { st.exT = b.dataset.p3dMode === "exploded" ? 1 : 0; sync(); }));
      layerBtns.forEach((b, i) => b.addEventListener("click", () => { st.focus = st.focus === i ? -1 : i; if (st.focus >= 0) st.exT = 1; sync(); }));
      document.addEventListener("lp:lang", sync); sync();
      const matsOf = o => { const s = new Set(); o.traverse(c => c.material && s.add(c.material)); return [...s]; };
      const layerMats = layers.map(matsOf);
      return {
        procedural, slot, fit: 3.6,
        update(time, dt) {
          const a = reduce ? 1 : kdt(.07, dt);
          const was = st.ex; st.ex = lerp(st.ex, st.exT, a);
          let moving = Math.abs(was - st.ex) > 1e-4;
          layers.forEach((o, i) => {
            const { a: A, e: E } = o.userData; o.position.set(lerp(A[0], E[0], st.ex), lerp(A[1], E[1], st.ex), lerp(A[2], E[2], st.ex));
            const target = st.focus < 0 || st.focus === i ? 1 : .16; const f0 = st.f[i]; st.f[i] = lerp(st.f[i], target, a); if (Math.abs(f0 - st.f[i]) > 1e-4) moving = true;
            layerMats[i].forEach(m => { m.opacity = m.userData.base * st.f[i]; m.depthWrite = m !== M.glass && st.f[i] > .6; });
          });
          return moving;
        }
      };
    }
  },

  /* ---- process: 4-stage block (foundation → structure → roof & glass → finished), scroll-driven */
  stages: {
    modelKey: "process",
    camera: { dist: 11, target: [0, 1.2, 0], yaw: -.7, pitch: .38, auto: .00006 },
    build(ctx) {
      const { THREE: T, scene, track, root } = ctx;
      plinth(ctx, 6.6, 5);
      const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
      const M = {
        concrete: track(new T.MeshStandardMaterial({ map: tex("concrete_diff_1k.jpg", true, 1), color: "#d9dbe0", roughness: .95 })),
        brick: track(new T.MeshStandardMaterial({ map: track(brickTexture()), roughness: .92 })),
        plaster: track(new T.MeshStandardMaterial({ color: "#f3f0ea", roughness: .95, transparent: true, opacity: 0 })),
        stone: track(new T.MeshStandardMaterial({ color: "#c7b9a3", roughness: .9, normalMap: tex("stone_nor.jpg", false, 1), transparent: true, opacity: 0 })),
        glass: track(new T.MeshPhysicalMaterial({ color: "#a9bfc8", roughness: .04, transparent: true, opacity: 0, envMapIntensity: 1.6, depthWrite: false })),
        alu: track(new T.MeshStandardMaterial({ color: "#1d1e21", roughness: .3, metalness: .85 })),
        glow: track(new T.MeshStandardMaterial({ color: "#000", emissive: "#ffb36b", emissiveIntensity: 0 })),
        leaf: track(new T.MeshStandardMaterial({ color: "#56703b", roughness: .9, flatShading: true }))
      };
      const box = (g, m, w, h, d, x, y, z, cast = true) => { const o = new T.Mesh(track(new T.BoxGeometry(w, h, d)), m); o.position.set(x, y + h / 2, z); o.castShadow = cast; o.receiveShadow = true; g.add(o); return o; };
      const F = .95, S = .3;
      const G = { found: new T.Group(), frame: new T.Group(), brick: new T.Group(), roof: new T.Group(), glass: new T.Group(), skin: new T.Group(), land: new T.Group() };
      Object.values(G).forEach(g => procedural.add(g));
      /* foundation */
      box(G.found, M.concrete, 4.4, .12, 3.2, 0, 0, 0);
      for (const x of [-2.1, 0, 2.1]) for (const z of [-1.5, 1.5]) box(G.found, M.concrete, .4, .1, .4, x, -.02, z);
      /* frame: columns + slabs, 2 storeys */
      for (let lv = 0; lv < 2; lv++) {
        for (const x of [-2.1, 0, 2.1]) for (const z of [-1.5, 1.5]) box(G.frame, M.concrete, .12, F - .08, .12, x, .12 + lv * F, z);
        box(G.frame, M.concrete, lv ? 3.6 : 4.4, .08, lv ? 3.4 : 3.2, lv ? -.4 : 0, .12 + (lv + 1) * F - .08, lv ? .1 : 0);
      }
      /* brick infill */
      for (let lv = 0; lv < 2; lv++) { const y = .12 + lv * F; box(G.brick, M.brick, 4.1, F - .1, .1, 0, y, -1.5); box(G.brick, M.brick, .1, F - .1, 2.9, -2.1, y, 0); box(G.brick, M.brick, .1, F - .1, 2.9, 2.1, y, 0); box(G.brick, M.brick, 1.2, F - .1, .1, 1.45, y, 1.5); }
      /* roof + glass */
      box(G.roof, M.concrete, 4.0, .1, 3.8, -.4, .12 + 2 * F, .15);
      box(G.glass, M.glass, 2.6, F - .2, .03, -.7, .14, 1.52, false); box(G.glass, M.glass, 3.0, F - .2, .03, -.6, .14 + F, 1.62, false); box(G.glass, M.glass, .03, F - .2, 1.6, 2.12, .14 + F, -.2, false);
      box(G.glass, M.alu, 2.6, .03, .05, -.7, .12, 1.52); box(G.glass, M.alu, 3.0, .03, .05, -.6, .12 + F, 1.62);
      box(G.glass, M.glow, 2.4, F - .3, .02, -.7, .17, 1.3, false); box(G.glass, M.glow, 2.8, F - .3, .02, -.6, .17 + F, 1.4, false);
      /* finished skin: plaster box + stone base */
      box(G.skin, M.plaster, 4.26, F - .1, .02, 0, .12 + F, -1.57); box(G.skin, M.plaster, .02, F - .1, 3.06, -2.17, .12 + F, 0); box(G.skin, M.plaster, .02, F - .1, 3.06, 2.17, .12 + F, 0); box(G.skin, M.plaster, 4.06, .12, 3.86, -.4, .1 + 2 * F, .15);
      box(G.skin, M.stone, 4.26, F - .1, .02, 0, .12, -1.57); box(G.skin, M.stone, .02, F - .1, 3.06, -2.17, .12, 0); box(G.skin, M.stone, 1.3, F - .1, .02, 1.45, .12, 1.57);
      /* landscaping */
      for (const [x, z, r] of [[-2.7, 1.8, .32], [2.7, -1.9, .4], [2.6, 1.9, .28]]) { const t = new T.Mesh(track(new T.IcosahedronGeometry(r, 1)), M.leaf); t.position.set(x, r + .25, z); t.castShadow = true; G.land.add(t); const tr2 = new T.Mesh(track(new T.CylinderGeometry(.03, .03, .3, 6)), M.alu); tr2.position.set(x, .15, z); G.land.add(tr2); }
      /* stage from scroll through the timeline */
      const st = { s: 0, sT: 0 };
      const tl = document.querySelector(".timeline");
      const btns = [...root.querySelectorAll("[data-p3d-stage]")];
      const STEP_FOR = [0, 3, 4, 5];
      if (tl && window.ScrollTrigger) window.ScrollTrigger.create({ trigger: tl, start: "top 75%", end: "bottom 55%", onUpdate: s => { st.sT = s.progress * 3; ctx.dirty(); } });
      btns.forEach((b, i) => b.addEventListener("click", () => {
        const li = tl && tl.children[STEP_FOR[i]]; st.sT = i; ctx.dirty();
        if (li) LP.scrollTo ? LP.scrollTo(li, { offset: -innerHeight * .35 }) : li.scrollIntoView({ block: "center" });
      }));
      let shown = -1;
      return {
        procedural, slot, fit: 4.4,
        update(time, dt) {
          const was = st.s; st.s = reduce ? st.sT : lerp(st.s, st.sT, kdt(.06, dt)); const s = st.s;
          G.frame.scale.y = Math.max(.001, sstep(0, .7, s)); G.frame.visible = s > .01;
          G.brick.scale.y = Math.max(.001, sstep(.35, 1, s)); G.brick.visible = s > .36;
          G.roof.position.y = (1 - sstep(1, 1.5, s)) * 1.2; G.roof.visible = s > 1.01;
          M.glass.opacity = .34 * sstep(1.4, 2, s); G.glass.visible = s > 1.4;
          M.plaster.opacity = sstep(2, 2.5, s); M.stone.opacity = sstep(2.1, 2.6, s); G.skin.visible = s > 2.01;
          M.plaster.depthWrite = M.stone.depthWrite = s > 2.4;
          M.glow.emissiveIntensity = sstep(2.5, 3, s) * 2.2;
          G.land.scale.setScalar(Math.max(.001, sstep(2.4, 3, s))); G.land.visible = s > 2.41;
          const i = Math.min(3, Math.round(s));
          if (i !== shown) { shown = i; btns.forEach((b, k) => b.setAttribute("aria-pressed", k === i)); }
          return Math.abs(was - s) > 1e-4;
        }
      };
    }
  },

  /* ---- projects: site massing plinth that reacts to the filter ------------------------ */
  massing: {
    modelKey: "projects",
    camera: { dist: 10.5, target: [0, .6, 0], yaw: -.5, pitch: .55, auto: .00005 },
    build(ctx) {
      const { THREE: T, scene, track, key } = ctx;
      plinth(ctx, 7.4, 4.8);
      const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
      const white = () => track(new T.MeshStandardMaterial({ color: "#f2eee7", roughness: .85, transparent: true }));
      const conc = () => track(new T.MeshStandardMaterial({ color: "#a9a49c", roughness: .9, transparent: true }));
      const glassM = track(new T.MeshStandardMaterial({ color: "#3a434b", roughness: .12, metalness: .2, transparent: true }));
      const bronze = track(new T.MeshStandardMaterial({ color: "#b8845a", roughness: .35, metalness: .85, transparent: true, emissive: "#b8845a", emissiveIntensity: 0 }));
      const projects = (window.SITE && SITE.projects) || [];
      const spots = [[-2.2, -.4], [.3, .9], [2.5, -.6], [-.6, -1.5], [2.0, 1.4], [-2.8, 1.3]];
      const items = projects.slice(0, spots.length).map((p, i) => {
        const g = new T.Group(); const [x, z] = spots[i]; g.position.set(x, 0, z); g.rotation.y = (i % 2 ? .25 : -.15);
        const sc = Math.sqrt((p.size || 200) / 200), w = 1.5 * sc, d = 1.1 * sc, floors = p.size > 260 ? 3 : 2, fh = .38;
        const mats = [];
        if (p.status === "finished") {
          for (let f = 0; f < floors; f++) {
            const m = white(); mats.push(m); const o = new T.Mesh(track(new T.BoxGeometry(w * (f === floors - 1 ? .7 : 1), fh, d)), m); o.position.set(f === floors - 1 ? -w * .15 : 0, f * fh + fh / 2, 0); o.castShadow = o.receiveShadow = true; g.add(o);
            const gl = new T.Mesh(track(new T.BoxGeometry(w * .6, fh * .5, .01)), glassM); gl.position.set(0, f * fh + fh * .45, d / 2 + .006); g.add(gl);
          }
        } else {
          const m = conc(); mats.push(m);
          for (let f = 0; f <= floors; f++) { const sl = new T.Mesh(track(new T.BoxGeometry(w, .04, d)), m); sl.position.y = f * fh + .02; sl.castShadow = sl.receiveShadow = true; g.add(sl); }
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c = new T.Mesh(track(new T.BoxGeometry(.05, floors * fh, .05)), m); c.position.set(sx * (w / 2 - .04), floors * fh / 2, sz * (d / 2 - .04)); c.castShadow = true; g.add(c); }
          const crane = new T.Mesh(track(new T.BoxGeometry(.03, 1.9, .03)), bronze); crane.position.set(w / 2 + .25, .95, -d / 2); g.add(crane);
          const jib = new T.Mesh(track(new T.BoxGeometry(1.4, .03, .03)), bronze); jib.position.set(w / 2 - .2, 1.88, -d / 2); g.add(jib);
          mats.push(bronze);
        }
        procedural.add(g);
        return { status: p.status, mats, o: 1, g };
      });
      /* a few neutral context blocks + trees */
      const ctxMat = track(new T.MeshStandardMaterial({ color: "#d8d1c6", roughness: .95 }));
      for (const [x, z, w, d, h] of [[-3.1, -1.8, .7, .6, .2], [3.2, 1.6, .8, .5, .25], [1.1, -1.9, .6, .5, .18]]) { const o = new T.Mesh(track(new T.BoxGeometry(w, h, d)), ctxMat); o.position.set(x, h / 2, z); o.receiveShadow = o.castShadow = true; procedural.add(o); }
      let filter = "all", fT = 0;
      document.addEventListener("lp:filter", e => { filter = e.detail || "all"; ctx.st.auto = false; ctx.st.yawT += filter === "finished" ? -.35 : filter === "progress" ? .35 : 0; ctx.dirty(); });
      const warm = new T.Color("#ffd9b0"), cool = new T.Color("#dfe8ff"), base = new T.Color("#fff4e6");
      return {
        procedural, slot, fit: 6,
        update(time, dt) {
          const a = reduce ? 1 : kdt(.07, dt); let moving = false;
          for (const it of items) {
            const t = filter === "all" || filter === it.status ? 1 : .14, o0 = it.o; it.o = lerp(it.o, t, a);
            if (Math.abs(o0 - it.o) > 1e-4) moving = true;
            it.mats.forEach(m => { m.opacity = it.o; m.depthWrite = it.o > .5; });
            it.g.position.y = lerp(it.g.position.y, filter === it.status ? .06 : 0, a);
          }
          bronze.emissiveIntensity = lerp(bronze.emissiveIntensity, filter === "progress" ? .5 : 0, a);
          const want = filter === "finished" ? warm : filter === "progress" ? cool : base;
          key.color.lerp(want, a); fT = lerp(fT, filter === "all" ? 0 : 1, a);
          return moving;
        }
      };
    }
  },

  /* ---- about: material monolith (bronze, travertine, concrete, glass) ---------------- */
  monolith: {
    modelKey: "about",
    camera: { dist: 9, target: [0, 1.6, 0], yaw: -.5, pitch: .22, auto: .0001 },
    build(ctx) {
      const { THREE: T, scene, track, mobile } = ctx;
      plinth(ctx, 4.2, 4.2, .5);
      const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
      const travertine = track(canvasTexture(512, (g, S) => {
        g.fillStyle = "#d9ccb6"; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 140; i++) { const y = rnd() * S; g.fillStyle = `rgba(${rnd() < .5 ? "150,130,100" : "245,236,220"},${.08 + rnd() * .16})`; g.fillRect(0, y, S, 1 + rnd() * 4); }
        for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,100,75,${.12 + rnd() * .2})`; g.fillRect(rnd() * S, rnd() * S, 2 + rnd() * 10, 1 + rnd() * 2); }
      }));
      const M = {
        bronze: track(new T.MeshPhysicalMaterial({ color: "#b8845a", metalness: 1, roughness: .32, envMapIntensity: 1.3, clearcoat: .3, clearcoatRoughness: .4 })),
        stone: track(new T.MeshStandardMaterial({ map: travertine, roughness: .78, envMapIntensity: .8, normalMap: tex("stone_nor.jpg", false, 1), normalScale: new T.Vector2(.25, .25) })),
        concrete: track(new T.MeshStandardMaterial({ map: tex("concrete_diff_1k.jpg", true, 1), normalMap: tex("concrete_nor.jpg", false, 1), roughness: .95, color: "#d9dbe0" })),
        glass: track(mobile
          ? new T.MeshPhysicalMaterial({ color: "#cfe0e4", roughness: .04, transparent: true, opacity: .35, envMapIntensity: 1.8, ior: 1.5 })
          : new T.MeshPhysicalMaterial({ color: "#e8f2f3", roughness: .04, transmission: 1, thickness: .5, ior: 1.5, envMapIntensity: 1.6, specularIntensity: 1 }))
      };
      const slabs = [];
      const add = (mat, w, h, d, x, y, z, ry) => { const o = new T.Mesh(track(new T.BoxGeometry(w, h, d)), mat); o.position.set(x, y + h / 2, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; o.userData.y = o.position.y; procedural.add(o); slabs.push(o); };
      add(M.concrete, 1.5, 2.8, .9, -.35, 0, -.2, .1);
      add(M.stone, 1.1, 3.6, .55, .55, 0, .15, -.15);
      add(M.bronze, .14, 3.2, 1.3, -.05, .1, .55, .35);
      add(M.glass, 1.0, 1.6, .12, .25, .3, .85, .2);
      add(M.bronze, 1.9, .06, 1.2, .05, 3.62, 0, -.1);
      return {
        procedural, slot, fit: 3,
        update(time) {
          if (reduce) return false;
          slabs.forEach((o, i) => { o.position.y = o.userData.y + Math.sin(time * .6 + i * 1.3) * .015; });
          return true;
        }
      };
    }
  },

  /* ---- contact: site plinth with contour layers + bronze pin -------------------------- */
  pin: {
    modelKey: "contact",
    camera: { dist: 8.5, target: [0, .7, 0], yaw: -.6, pitch: .55, auto: .00012 },
    build(ctx) {
      const { THREE: T, scene, track } = ctx;
      plinth(ctx, 4.4, 4.4, .45);
      const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
      const card = track(new T.MeshStandardMaterial({ color: "#efe9df", roughness: .9 }));
      const card2 = track(new T.MeshStandardMaterial({ color: "#e2dbcf", roughness: .9 }));
      for (let i = 0; i < 6; i++) {
        const r = 1.9 - i * .28, g = track(new T.CylinderGeometry(r, r, .07, 64, 1)), p = g.attributes.position;
        for (let k = 0; k < p.count; k++) { const x = p.getX(k), z = p.getZ(k), a = Math.atan2(z, x), f = 1 + Math.sin(a * 3 + i) * .07 + Math.sin(a * 7 - i * 2) * .04; p.setX(k, x * f); p.setZ(k, z * f); }
        g.computeVertexNormals();
        const o = new T.Mesh(g, i % 2 ? card2 : card); o.position.set(-.1 + i * .05, .035 + i * .07, .05 - i * .04); o.castShadow = o.receiveShadow = true; procedural.add(o);
      }
      const bronze = track(new T.MeshPhysicalMaterial({ color: "#b8845a", metalness: 1, roughness: .28, envMapIntensity: 1.4, clearcoat: .4 }));
      const pin = new T.Group(); procedural.add(pin);
      const head = new T.Mesh(track(new T.SphereGeometry(.32, 48, 32)), bronze); head.position.y = 1.55; head.castShadow = true;
      const cone = new T.Mesh(track(new T.ConeGeometry(.32, .9, 48, 1, true)), bronze); cone.rotation.x = Math.PI; cone.position.y = 1.08; cone.castShadow = true;
      const dot = new T.Mesh(track(new T.SphereGeometry(.11, 24, 16)), track(new T.MeshStandardMaterial({ color: "#f5f3ef", roughness: .5 }))); dot.position.set(0, 1.55, .28);
      pin.add(head, cone, dot); pin.position.set(.15, .45, .1);
      const ringMat = track(new T.MeshBasicMaterial({ color: "#b8845a", transparent: true, opacity: .6, depthWrite: false }));
      const ring = new T.Mesh(track(new T.RingGeometry(.3, .33, 64)), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(.15, .47, .1); procedural.add(ring);
      return {
        procedural, slot, fit: 3.6,
        update(time) {
          if (reduce) return false;
          pin.position.y = .45 + Math.sin(time * 1.6) * .06; pin.rotation.y = time * .5;
          const k = (time * .45) % 1; ring.scale.setScalar(1 + k * 3.2); ringMat.opacity = .6 * (1 - k);
          return true;
        }
      };
    }
  }
};

/* auto-mount every [data-p3d] on the page */
document.querySelectorAll("[data-p3d]").forEach(el => {
  const sc = SCENES[el.dataset.p3d]; if (!sc) return;
  try { createViewer(el, sc); } catch (err) { console.warn("[lastra] 3D unavailable", err); el.classList.add("p3d-fallback"); }
});
