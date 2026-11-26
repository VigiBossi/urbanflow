/* =====================================================================
   Lastra Projekt – architectural scale model (home "The Architect" section
   and the architect.html hero). Mounts on every [data-arch3d] element.
   • 3-storey white-card model on a matte stone plinth
   • modes: Solid · Blueprint wireframe · 3-floor Exploded (all values lerped)
   • renders inside the single gsap.ticker clock (LP.clock) – no own rAF
   • ACES, soft studio light (RoomEnvironment + soft PCF key), pixelRatio ≤ 2,
     paused off-screen (IntersectionObserver) and when the tab is hidden
   ===================================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const LP = window.LP || {};
const reduce = !!LP.reduce || matchMedia("(prefers-reduced-motion: reduce)").matches;
const kdt = (k, dt) => 1 - Math.pow(1 - k, (dt || 16.7) / 16.7);
const lerp = (a, b, t) => a + (b - a) * t;

function webgl2() { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } }

document.querySelectorAll("[data-arch3d]").forEach(el => {
  if (!webgl2()) { el.classList.add("a3d-fallback"); return; }
  try { mount(el); } catch (err) { console.warn("[lastra] scale model unavailable", err); el.classList.add("a3d-fallback"); }
});

function mount(root) {
  const canvas = root.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

  /* ---- soft studio lighting */
  const key = new THREE.DirectionalLight("#fff4e6", 2.1);
  key.position.set(7, 11, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 });
  const rim = new THREE.DirectionalLight("#c9d6ff", 0.55); rim.position.set(-8, 5, -7);
  const fill = new THREE.HemisphereLight("#fffaf2", "#8a7f72", 0.35);
  scene.add(key, rim, fill);

  /* ---- materials: basswood/card model, smoked acrylic glazing, matte stone plinth */
  const M = {
    card: new THREE.MeshStandardMaterial({ color: "#f2eee7", roughness: .82, envMapIntensity: .7, transparent: true }),
    card2: new THREE.MeshStandardMaterial({ color: "#e3ddd3", roughness: .85, envMapIntensity: .7, transparent: true }),
    glass: new THREE.MeshStandardMaterial({ color: "#3a434b", roughness: .12, metalness: .2, envMapIntensity: 1.3, transparent: true, opacity: .82 }),
    bronze: new THREE.MeshStandardMaterial({ color: "#b8845a", roughness: .35, metalness: .85, envMapIntensity: 1.1, transparent: true }),
    stone: new THREE.MeshStandardMaterial({ color: "#bdb4a7", roughness: .96, envMapIntensity: .6 }),
    stoneTop: new THREE.MeshStandardMaterial({ color: "#cfc7bb", roughness: .92, envMapIntensity: .6 }),
    line: new THREE.LineBasicMaterial({ color: "#2e4f7a", transparent: true, opacity: 0, depthWrite: false }),
    lineHot: new THREE.LineBasicMaterial({ color: "#b8845a", transparent: true, opacity: 0, depthWrite: false })
  };
  const fadeMats = [M.card, M.card2, M.glass, M.bronze];
  fadeMats.forEach(m => { m.userData.base = m.opacity; });

  /* ---- model (metres of the real residence × S) */
  const S = .26, F = 3.2 * S, SL = .3 * S, WT = .25 * S;
  const model = new THREE.Group(); scene.add(model);
  const floors = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];   // 0,1,2 + roof
  floors.forEach(g => model.add(g));
  const geos = [];
  const box = (g, mat, w, h, d, x, y, z, edges = true, hot = false) => {
    const geo = new THREE.BoxGeometry(w * S, h, d * S); geos.push(geo);
    const m = new THREE.Mesh(geo, mat); m.position.set(x * S, y + h / 2, z * S); m.castShadow = m.receiveShadow = true; g.add(m);
    if (edges) { const eg = new THREE.EdgesGeometry(geo, 20); geos.push(eg); const l = new THREE.LineSegments(eg, hot ? M.lineHot : M.line); l.position.copy(m.position); g.add(l); }
    return m;
  };
  /* a volume = 4 walls with a window band cut out of each side */
  const volume = (g, v, y0, open = .62, sill = .9) => {
    const h = F - SL, w = v.x1 - v.x0, d = v.z1 - v.z0, cx = (v.x0 + v.x1) / 2, cz = (v.z0 + v.z1) / 2, sh = sill * S, hh = 2.65 * S;
    const side = (len, along, fixed, isX) => {
      const o = len * open, pier = (len - o) / 2;
      const put = (a0, a1, yb, ht, mat) => { const L = a1 - a0, c = along + (a0 + a1) / 2 - len / 2; isX ? box(g, mat, L, ht, .25, c, yb, fixed) : box(g, mat, .25, ht, L, fixed, yb, c); };
      put(0, pier, y0, h, M.card); put(len - pier, len, y0, h, M.card);
      if (sh > 0) put(pier, len - pier, y0, sh, M.card);
      put(pier, len - pier, y0 + hh, h - hh, M.card);
      const gl = (a0, a1) => { const L = a1 - a0, c = along + (a0 + a1) / 2 - len / 2; isX ? box(g, M.glass, L, hh - sh, .06, c, y0 + sh, fixed, false) : box(g, M.glass, .06, hh - sh, L, fixed, y0 + sh, c, false); };
      gl(pier, len - pier);
    };
    side(w, cx, v.z1, true); side(w, cx, v.z0, true); side(d, cz, v.x0, false); side(d, cz, v.x1, false);
  };
  const slab = (g, r, y, mat = M.card2) => box(g, mat, r.x1 - r.x0, SL, r.z1 - r.z0, (r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
  const ox = -1.65; const R = r => ({ x0: r.x0 + ox, x1: r.x1 + ox, z0: r.z0, z1: r.z1 });   // centre the composition
  /* ground floor: living volume + garage, ground slab, stair */
  slab(floors[0], R({ x0: -6.3, x1: 11.3, z0: -4.3, z1: 5.3 }), 0);
  volume(floors[0], R({ x0: -6, x1: 6, z0: -4, z1: 5 }), SL, .64, 0);
  volume(floors[0], R({ x0: 6, x1: 11, z0: -4, z1: 2.5 }), SL, .7, 0);
  for (let i = 0; i < 9; i++) box(floors[0], M.card2, .55, (i + 1) * F / 9, 1.2, -3.5 + ox + i * .55 + .27, SL, -3.2, false);
  /* 1st floor: cantilevered volume + balcony with bronze edge */
  slab(floors[1], R({ x0: -8, x1: 6, z0: -4.5, z1: 5.5 }), 0);
  slab(floors[1], R({ x0: -6.5, x1: 0, z0: 5.5, z1: 7.2 }), 0);
  box(floors[1], M.bronze, 6.5, .02, .08, -3.25 + ox, SL, 7.15, true, true);
  volume(floors[1], R({ x0: -8, x1: 4.5, z0: -4.5, z1: 5.5 }), SL, .6, .9);
  for (let i = 0; i < 9; i++) box(floors[1], M.card2, .55, (i + 1) * F / 9, 1.2, 1.3 + ox - i * .55 - .27, SL, -1.8, false);
  /* 2nd floor: penthouse on the roof terrace */
  slab(floors[2], R({ x0: -8, x1: 4.5, z0: -4.5, z1: 5.5 }), 0);
  volume(floors[2], R({ x0: -6, x1: 2, z0: -4.5, z1: 2.5 }), SL, .74, 0);
  box(floors[2], M.bronze, 12.5, .02, .06, -1.75 + ox, SL + .28, 5.45, true, true);
  /* roof slab with overhang */
  slab(floors[3], R({ x0: -6.6, x1: 2.6, z0: -4.9, z1: 3.9 }), 0, M.card);
  /* stone plinth (two stepped blocks) */
  const plinth = new THREE.Group(); scene.add(plinth);
  const pb = (w, h, d, y, mat) => { const g = new THREE.BoxGeometry(w, h, d); geos.push(g); const m = new THREE.Mesh(g, mat); m.position.y = y + h / 2; m.receiveShadow = true; m.castShadow = true; plinth.add(m); return m; };
  pb(6.6, .42, 4.6, -.46, M.stone); pb(6.0, .04, 4.0, -.04, M.stoneTop);
  const grid = new THREE.GridHelper(5.6, 28, 0x2e4f7a, 0x2e4f7a); grid.position.y = .005; grid.material.transparent = true; grid.material.opacity = 0; grid.material.depthWrite = false; plinth.add(grid);
  /* place floors on top of each other */
  const baseY = [0, F, 2 * F, 3 * F];
  floors.forEach((g, i) => { g.position.y = baseY[i]; });
  model.position.set(0, 0, -1.35 * S);

  /* ---- state, all damped */
  const st = { yaw: -.6, yawT: -.6, pitch: .38, pitchT: .38, wire: 0, wireT: 0, expl: 0, explT: 0, dist: 15, auto: !reduce, visible: true, dirty: true, w: 0, h: 0 };
  const modes = [...root.querySelectorAll("[data-a3d-mode]")];
  function setMode(m) {
    st.wireT = m === "wire" ? 1 : 0; st.explT = m === "explode" ? 1 : 0;
    modes.forEach(b => b.setAttribute("aria-pressed", b.dataset.a3dMode === m));
    if (reduce) { st.wire = st.wireT; st.expl = st.explT; }
    st.dirty = true;
  }
  modes.forEach(b => b.addEventListener("click", () => setMode(b.dataset.a3dMode)));

  /* ---- drag orbit (horizontal drags rotate; vertical swipes keep scrolling the page on touch) */
  let drag = null;
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw: st.yawT, pitch: st.pitchT, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); st.auto = false; root.classList.add("a3d-touched"); });
  canvas.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    st.yawT = drag.yaw + (e.clientX - drag.x) * .008;
    st.pitchT = Math.max(.08, Math.min(1.05, drag.pitch + (e.clientY - drag.y) * .005));
    st.dirty = true;
  });
  const end = () => { drag = null; };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("keydown", e => { if (e.key === "ArrowLeft") { st.yawT += .25; st.dirty = true; } if (e.key === "ArrowRight") { st.yawT -= .25; st.dirty = true; } });

  /* ---- size + visibility */
  const resize = () => {
    const r = root.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === st.w && h === st.h) return; st.w = w; st.h = h;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); st.dirty = true;
  };
  const ro = "ResizeObserver" in window ? new ResizeObserver(resize) : null; ro ? ro.observe(root) : addEventListener("resize", resize);
  resize();
  const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (e.isIntersecting) st.dirty = true; }, { rootMargin: "120px 0px" }) : null;
  io && io.observe(root);

  /* ---- one frame (called from the shared clock) */
  const target = new THREE.Vector3();
  function tick(time, dtMs) {
    if (!st.visible || document.hidden) return;
    const dt = Math.min(50, dtMs || 16.7);
    if (st.auto) { st.yawT += dt * .00009; st.dirty = true; }
    const a = reduce ? 1 : kdt(.08, dt), moving = Math.abs(st.yaw - st.yawT) + Math.abs(st.pitch - st.pitchT) + Math.abs(st.wire - st.wireT) + Math.abs(st.expl - st.explT) > 1e-4;
    if (!moving && !st.dirty) return;
    st.yaw = lerp(st.yaw, st.yawT, a); st.pitch = lerp(st.pitch, st.pitchT, a);
    st.wire = lerp(st.wire, st.wireT, reduce ? 1 : kdt(.07, dt)); st.expl = lerp(st.expl, st.explT, reduce ? 1 : kdt(.06, dt));
    /* exploded: floors separate vertically */
    floors.forEach((g, i) => { g.position.y = baseY[i] + st.expl * i * .85; });
    /* blueprint: card fades out, ink-blue edges + plinth grid fade in */
    fadeMats.forEach(m => { m.opacity = m.userData.base * (1 - st.wire * .93); m.depthWrite = st.wire < .5; });
    M.line.opacity = st.wire * .95; M.lineHot.opacity = st.wire;
    grid.material.opacity = st.wire * .35;
    key.intensity = lerp(2.1, 1.2, st.wire);
    /* camera orbit (pulls back a little when exploded) */
    const dist = 14.5 + st.expl * 2.4 + (camera.aspect < 1 ? 5 : 0), ty = 1.15 + st.expl * 1.3;
    target.set(0, ty, 0);
    camera.position.set(Math.sin(st.yaw) * Math.cos(st.pitch) * dist, ty + Math.sin(st.pitch) * dist, Math.cos(st.yaw) * Math.cos(st.pitch) * dist);
    camera.lookAt(target);
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    st.dirty = false;
    if (!root.classList.contains("a3d-ready")) root.classList.add("a3d-ready");
  }
  renderer.shadowMap.autoUpdate = false;
  if (LP.clock) LP.clock.add(tick); else tick(0, 16);
  if (reduce && !LP.clock) addEventListener("resize", () => tick(0, 16));

  /* ---- cleanup */
  addEventListener("pagehide", e => {
    if (e.persisted) return;
    LP.clock && LP.clock.remove(tick); ro && ro.disconnect(); io && io.disconnect();
    geos.forEach(g => g.dispose()); Object.values(M).forEach(m => m.dispose()); grid.geometry.dispose(); grid.material.dispose();
    env.dispose(); pmrem.dispose(); renderer.dispose();
  });
}
