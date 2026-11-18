/* Lastra Projekt – scroll-driven PBR hero: construction -> finished, day -> dusk,
   ending on the real render photo matched to the camera framing. */
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";

const section = document.querySelector(".hero3d");
const canvas = document.getElementById("hero-canvas");
const photo = document.querySelector(".hero-photo");
const label = document.getElementById("hero-stage");
const bar = document.querySelector(".hero-progress i");
const loader = document.querySelector(".hero-loading");
const chapters = [...document.querySelectorAll(".hud-chapters li")];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 760px)").matches || matchMedia("(pointer: coarse)").matches && innerWidth < 1000;
const TEX = "assets/tex/", PHOTO_ASPECT = 1024 / 576;

const clamp = v => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => { const x = clamp((p - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

function rawProgress() {
  const r = section.getBoundingClientRect(), span = section.offsetHeight - innerHeight;
  return clamp(-r.top / (span || 1));
}
const BUILD = .62; // share of the pinned scroll used by the build; the rest is the door + interior
function setLabel(p) {
  const D = window.I18N, l = document.documentElement.lang || "sq";
  const key = p > BUILD + .2 ? "stage_inside" : p < BUILD * .85 ? "stage_construction" : "stage_finished";
  if (label) label.textContent = (D && D[l] && D[l][key]) || key;
  const ch = key === "stage_inside" ? 2 : key === "stage_finished" ? 1 : 0;
  if (section.dataset.ch !== String(ch)) { section.dataset.ch = ch; chapters.forEach((li, i) => li.classList.toggle("on", i === ch)); }
  section.classList.toggle("is-inside", p > BUILD + .16);
  section.classList.toggle("p-moved", p > .02);
  if (bar) bar.style.transform = `scaleX(${p})`;
  section.classList.toggle("is-dusk", p > BUILD * .62);
  const ov = section.querySelector(".hero-overlay"); if (ov) { const f = seg(p, .02, .14); ov.style.opacity = (1 - f).toFixed(3); ov.style.transform = `translateY(${-24 * f}px)`; ov.style.visibility = f > .99 ? "hidden" : ""; }
  document.body.classList.toggle("hero-dusk", p > BUILD * .62 && p < BUILD + .22 && section.getBoundingClientRect().bottom > 60);
}
/* Photo rectangle: the frame the final camera matches (fit-width, placed low so the headline sits above). */
function frameRect(W, H) {
  if (mobile || W / H < 1) {
    const w = W, h = w / PHOTO_ASPECT;
    return { x: 0, y: Math.min(H - h, Math.max(H * .46, H * .62 - h / 2)), w, h };
  }
  const h = Math.min(H * .66, W / PHOTO_ASPECT), w = h * PHOTO_ASPECT;
  const y = H - h - H * .03;
  return { x: (W - w) / 2, y, w, h };
}
function placePhoto(r, W) {
  if (!photo) return;
  Object.assign(photo.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
  photo.classList.toggle("edge-x", r.w < W - 2);
}
function webglOK() { try { const c = document.createElement("canvas"); return !!c.getContext("webgl2"); } catch (e) { return false; } }

if (reduce || !webglOK()) {
  section.classList.add("fallback");
  const fin = section.querySelector(".fb-after");
  const upd = () => { const p = rawProgress(); fin.style.opacity = reduce ? (p > .5 ? 1 : 0) : p; setLabel(Math.min(p, BUILD)); };
  addEventListener("scroll", upd, { passive: true }); upd();
  loader && loader.remove();
  window.__heroMode = "fallback"; window.__heroReady = true;
} else {
  try { init(); } catch (e) { console.warn("hero3d failed, using photo fallback", e); section.classList.add("fallback"); window.__heroMode = "fallback"; window.__heroReady = true; }
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", stencil: false });
  const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 2);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const fogDay = new THREE.Color("#c3cfdb"), fogDusk = new THREE.Color("#28324a");
  scene.fog = new THREE.Fog(fogDay.clone(), 45, 160);
  const camera = new THREE.PerspectiveCamera(28, PHOTO_ASPECT, .1, 400);

  let dirty = true; const req = () => { dirty = true; };

  /* ---------- loading ---------- */
  const manager = new THREE.LoadingManager();
  manager.onProgress = (u, a, b) => { if (loader) loader.style.setProperty("--p", (a / b).toFixed(3)); };
  manager.onLoad = () => { loader && loader.classList.add("done"); window.__heroReady = true; req(); };
  const tl = new THREE.TextureLoader(manager);
  function pbr(name, { tile = 2.5, color = "#ffffff", rough = 1, metal = 0, env = 1, physical = false, noMap = false, extra = {} } = {}) {
    const M = new (physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({ color, roughness: rough, metalness: metal, envMapIntensity: env, ...extra });
    M.userData.tile = tile;
    if (name) {
      const set = (slot, file, srgb) => tl.load(TEX + file, t => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        M[slot] = t; M.needsUpdate = true; req();
      });
      if (!noMap) set("map", `${name}_diff${mobile ? "_1k" : ""}.jpg`, true);
      set("normalMap", `${name}_nor.jpg`);
      set("roughnessMap", `${name}_rough.jpg`);
    }
    return M;
  }

  /* Orange clay hollow blocks (50x25 cm, thin grey mortar, ribbed faces) as in the Çellopek site photo */
  function clayBlock() {
    const S = mobile ? 512 : 1024, c = document.createElement("canvas"), b = document.createElement("canvas"); c.width = c.height = b.width = b.height = S;
    const g = c.getContext("2d"), h = b.getContext("2d"), bw = S / 4, bh = S / 8, j = Math.max(2, S / 200);
    g.fillStyle = "#b9b2a6"; g.fillRect(0, 0, S, S); h.fillStyle = "#222"; h.fillRect(0, 0, S, S);
    for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) {
      const x = k * bw + (r % 2) * bw / 2, y = r * bh, L = 46 + Math.random() * 9, Hh = 14 + Math.random() * 6;
      g.fillStyle = `hsl(${Hh},${48 + Math.random() * 14}%,${L}%)`; g.fillRect(x + j, y + j, bw - j * 2, bh - j * 2);
      for (let q = 0; q < 5; q++) { g.fillStyle = `rgba(${Math.random() < .5 ? "70,30,15" : "255,220,190"},${.05 + Math.random() * .08})`; g.fillRect(x + j + Math.random() * bw * .7, y + j + Math.random() * bh * .6, bw * .3 * Math.random() + 6, bh * .35 * Math.random() + 4); }
      h.fillStyle = "#bbb"; h.fillRect(x + j, y + j, bw - j * 2, bh - j * 2);
      g.fillStyle = "rgba(60,25,10,.18)"; h.fillStyle = "#999";
      for (let t = 1; t < 7; t++) { const yy = y + j + t * (bh - j * 2) / 7; g.fillRect(x + j, yy, bw - j * 2, 1.2); h.fillRect(x + j, yy, bw - j * 2, 1.5); }
    }
    for (let i = 0; i < S * 6; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? 0 : 255},${Math.random() < .5 ? 0 : 240},${Math.random() < .5 ? 0 : 220},.05)`; g.fillRect(Math.random() * S, Math.random() * S, 2, 2); }
    const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
    for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso; }
    map.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.6, roughness: .92, envMapIntensity: .9, clippingPlanes: [brickClip] });
    m.userData.tile = 2; return m;
  }

  /* ---------- sky + environment (two HDRIs, blended) ---------- */
  const skyMat = new THREE.ShaderMaterial({
    uniforms: { tDay: { value: null }, tDusk: { value: null }, mixv: { value: 0 }, iDay: { value: 1 }, iDusk: { value: .16 }, rot: { value: .3 }, ready: { value: 0 }, flatC: { value: new THREE.Color("#b9cde3") } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize((modelMatrix*vec4(position,0.)).xyz); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDay,tDusk; uniform float mixv,iDay,iDusk,rot,ready; uniform vec3 flatC; varying vec3 vDir;
      void main(){ vec3 d=normalize(vDir); d.y=max(d.y,0.0); d=normalize(d+vec3(0.,0.001,0.));
        vec2 uv=vec2(fract(atan(d.z,d.x)*0.15915494+0.5+rot), asin(clamp(d.y,-1.,1.))*0.31830989+0.5);
        vec3 c = ready>0.5 ? mix(texture2D(tDay,uv).rgb*iDay, texture2D(tDusk,uv).rgb*iDusk, mixv) : flatC;
        gl_FragColor=vec4(min(c,vec3(1.2)),1.); }`,
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), skyMat); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  const skyScene = new THREE.Scene(); const skyMat2 = skyMat.clone(); skyScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), skyMat2));
  let envLevels = null;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const hdr = new RGBELoader(manager);
  let hDay, hDusk;
  const onHDR = () => {
    if (!hDay || !hDusk) return;
    for (const m of [skyMat, skyMat2]) { m.uniforms.tDay.value = hDay; m.uniforms.tDusk.value = hDusk; m.uniforms.ready.value = 1; }
    envLevels = [0, .25, .5, .75, 1].map(v => { skyMat2.uniforms.mixv.value = v; return pmrem.fromScene(skyScene, 0, .1, 100).texture; });
    lastEnv = -1; req();
  };
  hdr.load("assets/hdr/day.hdr", t => { hDay = t; onHDR(); });
  hdr.load("assets/hdr/dusk.hdr", t => { hDusk = t; onHDR(); });
  let lastEnv = -1;

  /* ---------- materials ---------- */
  const brickClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 8);        // block walls rise course by course
  const groundClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), .02);       // keep y >= -0.02
  const plasterClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -1);      // keep y <= constant
  const stoneClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -1);
  const M = {
    concrete: pbr("concrete", { tile: 3, color: "#cfcbc4", rough: .95 }),
    brick: clayBlock(),
    plaster: pbr("plaster", { tile: 3, color: "#f4f2ee", noMap: true, env: 1.2, extra: { clippingPlanes: [plasterClip] } }),
    stone: pbr("stone", { tile: 2.2, rough: .55, env: 1.3, extra: { clippingPlanes: [stoneClip] } }),
    paving: pbr("paving", { tile: 3, color: "#a9a59e" }),
    grassGround: pbr("grass", { tile: 2.5, color: "#7f9a63" }),
    wallBlock: pbr("concrete", { tile: 2, color: "#9b9893" }),
    charcoal: pbr("concrete", { tile: 3, color: "#2d2f33", rough: .9, extra: { clippingPlanes: [stoneClip] } }),
    garageBody: pbr("concrete", { tile: 3, color: "#34363a", rough: .9 }),
    alu: new THREE.MeshStandardMaterial({ color: "#16181b", roughness: .35, metalness: .7, clippingPlanes: [groundClip] }),
    steel: new THREE.MeshStandardMaterial({ color: "#8a8d91", roughness: .35, metalness: .9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#1b252c", roughness: .03, metalness: 0, transparent: true, opacity: .55, envMapIntensity: 1.6, ior: 1.5, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: .02, clippingPlanes: [groundClip], depthWrite: false }),
    rail: new THREE.MeshPhysicalMaterial({ color: "#bcd0d8", roughness: .02, transparent: true, opacity: .25, envMapIntensity: 1.4, depthWrite: false }),
    led: new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffd7a0", emissiveIntensity: 0 }),
    interior: new THREE.MeshStandardMaterial({ color: "#d9d2c6", roughness: .9, emissive: "#ffb066", emissiveIntensity: 0 }),
    sofa: new THREE.MeshStandardMaterial({ color: "#4a4844", roughness: 1 }),
    door: new THREE.MeshStandardMaterial({ color: "#232528", roughness: .5, metalness: .4 }),
    step: pbr("concrete", { tile: 2, color: "#e9e7e2", rough: .7 }),
    leaf: new THREE.MeshStandardMaterial({ color: "#3f5f2c", roughness: .85 }),
    conifer: new THREE.MeshStandardMaterial({ color: "#16261a", roughness: 1, envMapIntensity: .5 }),
    bark: pbr("concrete", { tile: .8, color: "#7d6a55" }),
    pipe: new THREE.MeshStandardMaterial({ color: "#aeb3b8", roughness: .45, metalness: .8 }),
    plank: pbr("concrete", { tile: 1.2, color: "#8f9499", rough: .6, metal: .6 }),
    toe: new THREE.MeshStandardMaterial({ color: "#c9a24a", roughness: .8 }),
    voidDark: new THREE.MeshStandardMaterial({ color: "#3b2c25", roughness: 1, envMapIntensity: .3 })
  };

  /* box-projected world UVs so textures keep real-world scale on any face */
  function planarUV(g, tile, off) {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + off.x, y = p.getY(i) + off.y, z = p.getZ(i) + off.z;
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      let u, v;
      if (ax >= ay && ax >= az) { u = z; v = y; } else if (ay >= az) { u = x; v = z; } else { u = x; v = y; }
      uv.setXY(i, u / tile, v / tile);
    }
    uv.needsUpdate = true;
  }
  const house = new THREE.Group(); scene.add(house);
  /* fine construction dust drifting in the sun – fades out once the house is finished */
  let dust = null;
  if (!reduce) {
    const N = mobile ? 140 : 420, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = Math.random() * 9; pos[i * 3 + 2] = -4 + Math.random() * 16; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,244,225,1)"); gr.addColorStop(1, "rgba(255,244,225,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    dust = new THREE.Points(g, new THREE.PointsMaterial({ size: mobile ? .09 : .07, map: tex, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, color: "#ffe9c8", fog: true }));
    dust.renderOrder = 2; dust.frustumCulled = false; scene.add(dust);
  }
  const SH = !mobile || true;
  function box(w, h, d, x, y, z, mat, o = {}) { // x,z centre; y bottom
    const r = o.round ?? Math.min(.025, w / 3, h / 3, d / 3);
    const g = r > .004 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d);
    const pos = new THREE.Vector3(x, y + h / 2, z);
    if (mat.userData.tile) planarUV(g, mat.userData.tile, pos);
    const m = new THREE.Mesh(g, mat); m.position.copy(pos);
    m.castShadow = o.cast ?? SH; m.receiveShadow = true;
    (o.parent || house).add(m); return m;
  }
  function rod(a, b, r, mat, parent = house) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), mat);
    m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    m.castShadow = true; parent.add(m); return m;
  }
  const shell = (w, h, d, x, y, z, mat = M.plaster) => box(w + .06, h + .02, d + .06, x, y - .01, z, mat);

  /* ---------- house (dimensions follow the reference render) ---------- */
  const F = 3.2, ROOF = 6.6, ZF = 5;
  // structure
  box(13.2, .3, 10.6, 2, -.3, 0, M.concrete);                 // plinth
  box(12.4, .35, 10.4, 2, F, 0, M.concrete);                  // first slab
  box(12.4, .4, 10.4, 2, ROOF, 0, M.concrete);                // roof slab
  shell(12.4, .35, 10.4, 2, F, 0); shell(12.4, .4, 10.4, 2, ROOF, 0);
  box(1.4, 1.1, 2.4, -1.2, ROOF + .4, -1.8, M.garageBody); box(2.6, .9, 1.6, -3.2 + 6.6, ROOF + .4, -2.4, M.garageBody);
  [[-3.8, 4.8], [1.9, 4.8], [7.8, 4.8], [-3.8, -4.8], [7.8, -4.8], [2, -4.8]].forEach(([x, z]) => {
    box(.4, F, .4, x, 0, z, M.concrete); box(.4, ROOF - F - .35, .4, x, F + .35, z, M.concrete);
  });
  // brick infill (construction look)
  const brick = (w, h, d, x, y, z) => box(w, h, d, x, y, z, M.brick);
  brick(12, F, .3, 2, 0, -4.9); brick(12, ROOF - F - .35, .3, 2, F + .35, -4.9);
  brick(.3, F, 9.6, 7.85, 0, 0); brick(.3, ROOF - F - .35, 9.6, 7.85, F + .35, 0);
  brick(.3, F, 9.6, -3.85, 0, 0); brick(.3, ROOF - F - .35, 9.6, -3.85, F + .35, 0);
  brick(1, F, .3, 2, 0, ZF - .2);                              // pier between living glass and recess
  brick(2.4, ROOF - F - .35, .3, -2.3, F + .35, ZF - .2);      // behind stone panel
  brick(.5, ROOF - F - .35, .3, 1.75, F + .35, ZF - .2);
  brick(.5, ROOF - .35, .3, 7.3, .0, ZF - .2);
  // white render shells (revealed bottom-up)
  shell(12, F, .3, 2, 0, -4.9); shell(12, ROOF - F - .35, .3, 2, F + .35, -4.9);
  shell(.3, F, 9.6, 7.85, 0, 0); shell(.3, ROOF - F - .35, 9.6, 7.85, F + .35, 0);
  shell(.3, F, 9.6, -3.85, 0, 0); shell(.3, ROOF - F - .35, 9.6, -3.85, F + .35, 0);
  shell(1, F, .3, 2, 0, ZF - .2); shell(.5, ROOF - F - .35, .3, 1.75, F + .35, ZF - .2); shell(.5, ROOF - .35, .3, 7.3, 0, ZF - .2);
  // front white frame (portal) on upper floor + stairwell surround
  shell(5.6, .45, .9, -1.2, F - .1, ZF + .1);                    // cantilevered band over living room
  shell(12.4, .4, .5, 2, ROOF, ZF + .05);                       // roof fascia
  shell(.35, ROOF - F, .6, -3.9, F, ZF);                         // upper left post
  shell(1.1, ROOF + .2, .7, 7.45, -.2, ZF);                      // right post
  shell(.25, ROOF, .5, 4.3, 0, ZF); shell(2.9, .3, .5, 5.7, -.2, ZF); // stairwell left jamb + sill
  // finished cladding
  const stone = box(2.4, ROOF - F - .55, .1, -2.3, F + .35, ZF + .02, M.stone);
  box(.42, ROOF, .3, 2.1, 0, ZF + .12, M.charcoal);              // dark column
  // dark recess around the front door: jambs + lintel stay visible when the door opens
  const doorH = 2.5, recX = 3.25, recW = 1.9, recZ = ZF - .32, recT = .12;
  const doorL = 2.52, doorR = 2.52 + .96, recL = recX - recW / 2, recR = recX + recW / 2;
  box(doorL - recL, doorH, recT, (recL + doorL) / 2, 0, recZ, M.charcoal);
  box(recR - doorR, doorH, recT, (doorR + recR) / 2, 0, recZ, M.charcoal);
  box(recW, ROOF - doorH, recT, recX, doorH, recZ, M.charcoal);
  // interior: living room + stairwell
  const inside = [];
  inside.push(box(5.4, F - .1, .1, -.6, 0, 1.2, M.interior, { cast: false }));
  box(5.4, .05, 3.8, -.6, 0, 3.1, M.step, { cast: false });
  box(2.6, .45, .9, -1.4, .05, 2.0, M.sofa); box(.9, .45, 2.0, .3, .05, 2.6, M.sofa); box(1.1, .3, .7, -1.2, .05, 3.3, M.door);
  // foyer behind the front door (warm oak floor + lit wall) so the camera has somewhere to walk into
  const foyer = [box(2.2, .04, 4, 3.1, .06, ZF - 2.5, M.step, { cast: false }), box(2.2, F - .2, .1, 3.1, .05, ZF - 4.4, M.interior, { cast: false })];
  // dark voids behind the open block walls, as in the unfinished shell
  const voids = [box(11.4, ROOF - .5, .05, 2, .1, -4.6, M.voidDark, { cast: false })];
  inside.push(box(2.6, ROOF - .2, .1, 5.7, 0, 3.0, M.interior, { cast: false }));
  for (let i = 0; i < 11; i++) box(.3, .06, 1, 4.75 + i * .17, .29 * (i + 1) - .06, 3.6, M.step, { round: .01 });
  box(.8, .1, 1, 6.6, 3.13, 3.6, M.step, { round: .01 });
  for (let i = 0; i < 10; i++) box(.3, .06, 1, 6.3 - i * .17, 3.2 + .3 * (i + 1) - .06, 3.6, M.step, { round: .01 });
  rod([4.75, 1.0, 4.08], [6.6, 4.1, 4.08], .018, M.steel); rod([6.6, 4.1, 4.08], [4.8, 7.0, 4.08], .018, M.steel);
  // glass panes (rise out of the ground) with aluminium frames + mullions
  const panes = [];
  function pane(w, h, x, y, z, cols = 1, rows = 1) {
    const g = new THREE.Group(); g.position.set(x, y, z); house.add(g);
    const gl = box(w, h, .03, 0, 0, 0, M.glass, { parent: g, cast: false, round: 0 }); gl.renderOrder = 2;
    const f = .07;
    box(w, f, .12, 0, 0, 0, M.alu, { parent: g, round: .01 }); box(w, f, .12, 0, h - f, 0, M.alu, { parent: g, round: .01 });
    box(f, h, .12, -w / 2 + f / 2, 0, 0, M.alu, { parent: g, round: .01 }); box(f, h, .12, w / 2 - f / 2, 0, 0, M.alu, { parent: g, round: .01 });
    for (let c = 1; c < cols; c++) box(.05, h, .1, -w / 2 + c * w / cols, 0, 0, M.alu, { parent: g, round: .01 });
    for (let r = 1; r < rows; r++) box(w, .05, .1, 0, r * h / rows, 0, M.alu, { parent: g, round: .01 });
    panes.push({ g, y });
  }
  pane(4.0, 2.85, -.6, .05, ZF - .05, 3);         // living room
  pane(2.4, 2.5, .3, F + .55, ZF - .05, 2);        // upper window
  pane(2.4, ROOF - .5, 5.75, .15, ZF - .05, 2, 3); // stairwell
  // entrance door: aluminium pivot door that swings open in the final stage
  const doorPivot = new THREE.Group(); doorPivot.position.set(2.52, .05, ZF - .2); house.add(doorPivot);
  const doorLeaf = new THREE.Group(); doorPivot.add(doorLeaf);
  box(.96, 2.45, .06, .48, 0, 0, M.door, { parent: doorLeaf, round: .01 });
  box(.18, 2.2, .07, .62, .12, .005, M.glass, { parent: doorLeaf, round: 0, cast: false });
  rod([.86, .7, .09], [.86, 1.9, .09], .018, M.steel, doorLeaf);
  const doorY = .05; panes.push({ g: doorPivot, y: doorY });
  const foyerLight = new THREE.PointLight("#ffcf94", 0, 9, 2); foyerLight.position.set(3.0, 1.9, ZF - 1.6); scene.add(foyerLight);
  // steps + step lights
  box(11.2, .16, 1.5, 2.3, -.3, ZF + 1.15, M.step); box(11.6, .16, 1.1, 2.3, -.14, ZF + .85, M.step);
  const stepLeds = [];
  for (let i = 0; i < 7; i++) stepLeds.push(box(.16, .04, .03, -2.8 + i * 1.7, -.06, ZF + 1.92, M.led, { cast: false, round: 0 }));
  // LED strips
  box(12.3, .04, .06, 2, ROOF - .02, ZF + .32, M.led, { cast: false, round: 0 });
  box(5.5, .04, .06, -1.2, F - .14, ZF + .58, M.led, { cast: false, round: 0 });
  box(.04, ROOF - F - .6, .06, -1.05, F + .4, ZF + .1, M.led, { cast: false, round: 0 });
  box(.04, ROOF - F - .6, .06, -3.55, F + .4, ZF + .1, M.led, { cast: false, round: 0 });
  box(1.6, .03, .05, 3.25, ROOF - .1, ZF - .2, M.led, { cast: false, round: 0 });
  // garage (rises during the build)
  const garage = new THREE.Group(); garage.position.set(-6.85, 0, 0); house.add(garage);
  box(5.7, 3.9, 9.4, 0, 0, -.2, M.garageBody, { parent: garage });
  box(5.7, .3, .4, 0, 3.6, 4.5, M.plaster, { parent: garage }); box(.35, 3.6, .4, -2.7, 0, 4.5, M.plaster, { parent: garage }); box(.3, 3.6, .4, 2.7, 0, 4.5, M.plaster, { parent: garage });
  const gdoor = box(3.9, 2.7, .08, -.15, .02, 4.4, M.door, { parent: garage });
  for (let i = 1; i < 7; i++) box(3.9, .02, .1, -.15, .02 + i * .385, 4.44, M.alu, { parent: garage, round: 0 });
  box(.04, 3.4, .05, -2.48, .1, 4.72, M.led, { parent: garage, cast: false, round: 0 }); box(4.9, .04, .05, 0, 3.52, 4.72, M.led, { parent: garage, cast: false, round: 0 });
  // glass balustrade on the garage roof terrace
  const rail = new THREE.Group(); garage.add(rail);
  box(5.4, 1, .02, 0, 3.9, 4.3, M.rail, { parent: rail, cast: false, round: 0 }); rod([-2.7, 4.95, 4.3], [2.7, 4.95, 4.3], .025, M.steel, rail);
  // scaffolding (construction phase)
  const scaff = new THREE.Group(); house.add(scaff);
  const SX0 = -3.7, SX1 = 7.9, SB = (SX1 - SX0) / 6, ZI = ZF + .75, ZO = ZF + 1.5, TOP = 8.1;
  for (let i = 0; i <= 6; i++) { const x = SX0 + i * SB; for (const z of [ZI, ZO]) { rod([x, -.3, z], [x, TOP, z], .024, M.pipe, scaff); box(.15, .02, .15, x, -.31, z, M.pipe, { parent: scaff, round: 0 }); } rod([x, .3, ZI], [x, .3, ZO], .02, M.pipe, scaff); }
  for (let y = 2.0; y < TOP; y += 2.0) {
    for (const z of [ZI, ZO]) rod([SX0, y, z], [SX1, y, z], .02, M.pipe, scaff);
    for (let i = 0; i <= 6; i++) rod([SX0 + i * SB, y, ZI], [SX0 + i * SB, y, ZO], .02, M.pipe, scaff);
    for (let i = 0; i < 6; i++) box(SB - .04, .045, .7, SX0 + (i + .5) * SB, y + .02, (ZI + ZO) / 2, M.plank, { parent: scaff, round: .005 });
    rod([SX0, y + .5, ZO], [SX1, y + .5, ZO], .018, M.pipe, scaff); rod([SX0, y + 1, ZO], [SX1, y + 1, ZO], .018, M.pipe, scaff);
    box(SX1 - SX0, .15, .02, (SX0 + SX1) / 2, y + .06, ZO - .03, M.toe, { parent: scaff, round: 0 });
  }
  for (let i = 0; i < 6; i += 2) for (let y = 0; y < TOP - 2; y += 2) rod([SX0 + i * SB, y + (y ? 0 : .1), ZO + .04], [SX0 + (i + 1) * SB, y + 2, ZO + .04], .016, M.pipe, scaff);

  /* ---------- site ---------- */
  const groundG = new THREE.PlaneGeometry(260, 260); groundG.rotateX(-Math.PI / 2); planarUV(groundG, 2.5, new THREE.Vector3());
  const ground = new THREE.Mesh(groundG, M.grassGround); ground.position.y = -.32; ground.receiveShadow = true; scene.add(ground);
  box(22, .04, 3, .5, -.32, ZF + 3.2, M.paving, { parent: scene, round: 0, cast: false });   // apron
  box(5.4, .04, 40, -6.85, -.32, ZF + 24, M.paving, { parent: scene, round: 0, cast: false }); // driveway
  box(3.4, .04, 40, 3.4, -.32, ZF + 24, M.paving, { parent: scene, round: 0, cast: false });   // path
  // boundary walls with up-lights
  const wallLeds = [];
  [[-17.5, -1, 11], [15.6, 1, 11]].forEach(([x, , w]) => {
    box(w, 1.9, .3, x, -.3, -1, M.wallBlock, { parent: scene });
    for (let i = 0; i < 3; i++) wallLeds.push(box(.12, .08, .06, x - w / 2 + 2 + i * 3.5, 1.1, -.82, M.led, { parent: scene, cast: false, round: 0 }));
  });
  // grass blades (instanced)
  (function grass() {
    const blade = new THREE.BufferGeometry();
    const v = [-.02, 0, 0, .02, 0, 0, -.014, .1, .004, .014, .1, .004, 0, .2, .02];
    blade.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); blade.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4]); blade.computeVertexNormals();
    const lawns = [[-22, -9.9, ZF + 4.8, ZF + 24], [-3.9, 1.6, ZF + 4.8, ZF + 24], [5.2, 22, ZF + 4.8, ZF + 24], [-22, -9.9, -2, ZF + 4.6], [8.8, 22, -2, ZF + 4.6]];
    const N = mobile ? 26000 : 90000;
    const mat = new THREE.MeshStandardMaterial({ roughness: .8, side: THREE.DoubleSide });
    const mesh = new THREE.InstancedMesh(blade, mat, N); mesh.receiveShadow = true;
    const area = lawns.map(l => (l[1] - l[0]) * (l[3] - l[2])), tot = area.reduce((a, b) => a + b);
    const o = new THREE.Object3D(), c = new THREE.Color();
    let k = 0;
    lawns.forEach((l, li) => {
      const n = Math.round(N * area[li] / tot);
      for (let i = 0; i < n && k < N; i++, k++) {
        const x = lerp(l[0], l[1], Math.random()), z = lerp(l[2], l[3], Math.random());
        const dist = Math.hypot(x, z - 28); // denser near camera via size
        o.position.set(x, -.31, z); o.rotation.set((Math.random() - .5) * .5, Math.random() * Math.PI * 2, (Math.random() - .5) * .5);
        const s = .45 + Math.random() * .6 + Math.min(.7, dist / 40); o.scale.set(s * 1.3, s, s); o.updateMatrix(); mesh.setMatrixAt(k, o.matrix);
        mesh.setColorAt(k, c.setHSL(.2 + Math.random() * .06, .28 + Math.random() * .14, .2 + Math.random() * .1));
      }
    });
    mesh.count = k; scene.add(mesh); M.blades = mat;
  })();
  // shrubs (boxwood balls) + ornamental grass clump
  const shrubG = new THREE.IcosahedronGeometry(1, 4); { const p = shrubG.attributes.position; for (let i = 0; i < p.count; i++) { const f = 1 + .08 * Math.sin(p.getX(i) * 9) * Math.cos(p.getY(i) * 11) + (Math.random() - .5) * .07; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); } shrubG.computeVertexNormals(); }
  const shrubM = pbr("grass", { tile: .6, color: "#4f7339" }); planarUV(shrubG, .6, new THREE.Vector3());
  [[-9.4, 9.5, .45], [-3.3, 11.2, .4], [1.2, 13.5, .45], [-1.8, 16, .5], [5.6, 10.5, .45], [9.5, 12.5, .5], [12.5, 10, .45], [-12, 13, .55], [1, 18.5, .5], [-14.5, 7.6, .5], [14, 6.8, .5]].forEach(([x, z, s]) => {
    const m = new THREE.Mesh(shrubG, shrubM); m.position.set(x, -.3 + s * .75, z); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; scene.add(m);
  });
  (function clump() {
    const g = new THREE.PlaneGeometry(.05, 1.4, 1, 6); g.translate(0, .7, 0);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, .25 * y * y); p.setX(i, p.getX(i) * (1 - y / 1.5)); }
    g.computeVertexNormals();
    const mesh = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: "#a9a77b", roughness: .8, side: THREE.DoubleSide }), 140);
    const o = new THREE.Object3D();
    for (let i = 0; i < 140; i++) { o.position.set(-1.4, -.3, 12.2); o.rotation.set(0, Math.random() * Math.PI * 2, 0); o.rotateX(.15 + Math.random() * .5); o.scale.setScalar(.7 + Math.random() * .6); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }
    mesh.castShadow = true; scene.add(mesh);
  })();
  // conifers behind the house: crossed alpha cards with a painted silhouette
  (function conifers() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 512; const g = c.getContext("2d");
    g.fillStyle = "#3a2a1c"; g.fillRect(124, 380, 8, 132);
    for (let y = 18; y < 470; y += 3) {
      const t = (y - 18) / 452, half = 8 + t * 108;
      for (let k = 0; k < 3; k++) {
        const side = Math.random() < .5 ? -1 : 1, len = half * (.55 + Math.random() * .5);
        g.strokeStyle = `hsl(${120 + Math.random() * 25},${22 + Math.random() * 15}%,${9 + Math.random() * 12}%)`; g.lineWidth = 2 + Math.random() * 3;
        g.beginPath(); g.moveTo(128, y); g.quadraticCurveTo(128 + side * len * .5, y + 4, 128 + side * len, y + 10 + Math.random() * 14); g.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = maxAniso;
    const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: .5, side: THREE.DoubleSide, roughness: 1, envMapIntensity: .6 });
    const card = new THREE.PlaneGeometry(1, 1); card.translate(0, .5, 0);
    const N = 70, mesh = new THREE.InstancedMesh(card, mat, N * 2), o = new THREE.Object3D(); let k = 0;
    for (let i = 0; i < N; i++) {
      const x = -48 + Math.random() * 96, z = -12 - Math.random() * 22, h = 8 + Math.random() * 8;
      if (Math.abs(x - 1) < 8 && z > -16) continue;
      for (const r of [0, Math.PI / 2]) { o.position.set(x, -.4, z); o.rotation.set(0, r + Math.random() * .3, 0); o.scale.set(h * .5, h, 1); o.updateMatrix(); mesh.setMatrixAt(k++, o.matrix); }
    }
    mesh.count = k; mesh.castShadow = true; scene.add(mesh);
  })();
  // palm
  function palm(x, z, s) {
    const g = new THREE.Group(); g.position.set(x, -.3, z); g.scale.setScalar(s); scene.add(g);
    const H = 4.2, tg = new THREE.CylinderGeometry(.14, .22, H, 14, 30); tg.translate(0, H / 2, 0);
    const p = tg.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), f = 1 + .07 * Math.max(0, Math.sin(y * 14)); p.setX(i, p.getX(i) * f + .025 * y * y); p.setZ(i, p.getZ(i) * f); }
    tg.computeVertexNormals(); planarUV(tg, .8, new THREE.Vector3());
    const t = new THREE.Mesh(tg, M.bark); t.castShadow = true; g.add(t);
    const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x2 = c.getContext("2d");
    x2.strokeStyle = "#5b7a3a"; x2.lineWidth = 5; x2.beginPath(); x2.moveTo(0, 64); x2.lineTo(512, 64); x2.stroke();
    for (let i = 6; i < 500; i += 9) { const L = 58 * Math.sin(Math.PI * (i / 512) ** .7) + 4; for (const sgn of [-1, 1]) { x2.fillStyle = `hsl(${88 + Math.random() * 14},${38 + Math.random() * 12}%,${26 + Math.random() * 10}%)`; x2.beginPath(); x2.moveTo(i, 64); x2.quadraticCurveTo(i + 10, 64 + sgn * L * .5, i + 20, 64 + sgn * L); x2.lineTo(i + 24, 64 + sgn * L * .96); x2.quadraticCurveTo(i + 13, 64 + sgn * L * .45, i + 5, 64); x2.fill(); } }
    const ft = new THREE.CanvasTexture(c); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = maxAniso;
    const fm = new THREE.MeshStandardMaterial({ map: ft, alphaTest: .45, side: THREE.DoubleSide, roughness: .7 });
    for (let i = 0; i < 16; i++) {
      const L = 2.4 + Math.random() * .7, fg = new THREE.PlaneGeometry(L, .9, 14, 1); fg.rotateX(-Math.PI / 2); fg.translate(L / 2, 0, 0);
      const q = fg.attributes.position; for (let k = 0; k < q.count; k++) { const u = q.getX(k) / L; q.setY(k, q.getY(k) - .9 * u * u * L * .45 + Math.abs(q.getZ(k)) * .35); }
      fg.computeVertexNormals();
      const f = new THREE.Mesh(fg, fm); f.position.set(.025 * H * H, H - .05, 0);
      f.rotation.set(0, i * 2.4 + Math.random() * .3, .55 - (i % 3) * .25); f.castShadow = true; g.add(f);
    }
  }
  palm(10.8, 9.5, 1.05); palm(-12.6, 10.5, .85);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight("#dfe9f5", "#5d5a4e", .35); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff1dc", 3.2);
  sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 12, bottom: -12, near: 1, far: 90 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const warm = [];
  [[-.6, 2.6, 3.0, 26], [5.7, 5.4, 3.9, 18], [5.7, 2.2, 3.9, 14], [3.25, 2.4, 5.6, 8]].forEach(([x, y, z, I]) => { const l = new THREE.PointLight("#ffbb70", 0, 12, 2); l.position.set(x, y, z); l.userData.I = I; scene.add(l); warm.push(l); });
  const garageWash = new THREE.SpotLight("#ffd6a0", 0, 12, .9, .7, 2); garageWash.position.set(-6.85, 3.4, 5.4); garageWash.target.position.set(-6.85, 0, 7); scene.add(garageWash, garageWash.target);

  /* ---------- post ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let gtao = null;
  if (!mobile) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: .6, distanceExponent: 1.4, thickness: 1, scale: 1.2, samples: 12 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    gtao.blendIntensity = .85;
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .45, .4, 2.2); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const vignette = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, amount: { value: .32 }, grain: { value: .018 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float amount,grain; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); vec2 d=vUv-.5; float v=smoothstep(.85,.2,length(d*vec2(1.,.8)));
        c.rgb*=mix(1.-amount,1.,v); c.rgb+= (h(vUv*1000.)-.5)*grain; gl_FragColor=c; }`
  });
  composer.addPass(vignette);
  const smaa = new SMAAPass(1, 1); composer.addPass(smaa);

  /* ---------- animation ---------- */
  const tmp = new THREE.Color(), tmp2 = new THREE.Color();
  const P0 = new THREE.Vector3(17, 8.5, 30), P1 = new THREE.Vector3(-11, 5.2, 29), P2 = new THREE.Vector3(.55, 2.45, 28.5);
  const T0 = new THREE.Vector3(.5, 2.6, 0), T2 = new THREE.Vector3(.55, 2.45, 0);
  const camCurve = new THREE.CatmullRomCurve3([P0, P1, P2], false, "centripetal");
  let target = rawProgress(), cur = target, last = -1;
  /* subtle pointer-driven camera parallax (desktop pointers only) */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", e => { ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    document.addEventListener("pointerleave", () => { ptr.tx = ptr.ty = 0; });
  }
  const camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), lookTmp = new THREE.Vector3();
  window.__heroSet = v => { target = cur = v; last = -1; dirty = true; };

  const DF = new THREE.Vector3(3.0, 1.55, ZF + 5.2), DI = new THREE.Vector3(3.0, 1.45, ZF - 2.2), DT = new THREE.Vector3(3.0, 1.35, ZF - .2), DT2 = new THREE.Vector3(3.0, 1.35, ZF - 6);
  const interior = section.querySelector(".hero-interior"), rooms = [...section.querySelectorAll(".room")];
  function apply(P) {
    const p = Math.min(1, P / BUILD), d = clamp((P - BUILD) / (1 - BUILD));
    brickClip.constant = lerp(-.4, 7.4, seg(p, 0, .16));
    // build sequence
    plasterClip.constant = lerp(-.6, 7.6, seg(p, .1, .45));
    stoneClip.constant = lerp(-.6, 7.6, seg(p, .38, .55));
    scaff.visible = p < .5; scaff.position.y = -9 * seg(p, .38, .5);
    voids.forEach(m => m.visible = p < .45);
    const tG = seg(p, .25, .55); garage.scale.set(1, Math.max(.001, tG), 1); garage.visible = tG > .01;
    gdoor.visible = p > .5; rail.visible = p > .62;
    panes.forEach((o, i) => o.g.position.y = o.y - (1 - seg(p, .5 + i * .04, .72 + i * .04)) * 7);
    inside.forEach(m => m.visible = p > .45);
    // day -> dusk
    const tD = seg(p, .55, .97);
    const mixv = tD; skyMat.uniforms.mixv.value = mixv;
    if (envLevels) { const idx = Math.round(mixv * 4); if (idx !== lastEnv) { scene.environment = envLevels[idx]; lastEnv = idx; } }
    scene.fog.color.copy(fogDay).lerp(fogDusk, tD);
    skyMat.uniforms.flatC.value.copy(scene.fog.color);
    hemi.intensity = lerp(.35, .12, tD);
    sun.intensity = lerp(3.2, .05, seg(p, .55, .9));
    sun.color.copy(tmp.set("#fff1dc").lerp(tmp2.set("#ffb27a"), tD));
    sun.position.set(lerp(22, -26, tD), lerp(30, 8, tD), lerp(26, 18, tD)); sun.target.position.set(0, 0, 2);
    renderer.toneMappingExposure = lerp(1.0, .95, tD);
    const tL = seg(p, .72, .93);
    M.led.emissiveIntensity = tL * 6; M.interior.emissiveIntensity = tL * .9;
    warm.forEach(l => l.intensity = tL * l.userData.I); garageWash.intensity = tL * 30;
    foyer.forEach(m => m.visible = p > .9);
    doorPivot.rotation.y = 1.75 * seg(d, .22, .55); foyerLight.intensity = 22 * seg(d, .15, .5);
    stepLeds.forEach(m => m.visible = tL > .02); wallLeds.forEach(m => m.visible = tL > .02);
    // wet paving at dusk
    M.paving.roughness = lerp(1, .22, tD); M.paving.color.copy(tmp.set("#a9a59e").lerp(tmp2.set("#4a4946"), tD)); M.paving.envMapIntensity = lerp(1, 1.3, tD);
    M.grassGround.color.copy(tmp.set("#7f9a63").lerp(tmp2.set("#3b5230"), tD));
    if (M.blades) M.blades.color.copy(tmp.set("#ffffff").lerp(tmp2.set("#7d8a7a"), tD));
    bloom.strength = lerp(.12, .55, tD);
    // camera: build orbit, then walk up to the front door and through it
    const u = seg(p, 0, .9);
    camCurve.getPoint(u, camera.position);
    const look = new THREE.Vector3().lerpVectors(T0, T2, seg(p, .2, .9));
    if (d > 0) {
      const a = seg(d, 0, .4), b = seg(d, .45, .85);
      camera.position.lerp(DF, a).lerp(DI, b);
      look.lerp(DT, a).lerp(DT2, b);
    }
    // pointer parallax: orbit slightly around the look target, fading out as we walk through the door
    const pw = 1 - seg(d, 0, .35);
    if (pw > 0 && (ptr.x || ptr.y)) {
      lookTmp.subVectors(camera.position, look); const dist = lookTmp.length();
      camRight.crossVectors(lookTmp, camera.up).normalize(); camUp.copy(camera.up);
      camera.position.addScaledVector(camRight, -ptr.x * dist * .035 * pw).addScaledVector(camUp, ptr.y * dist * .018 * pw);
    }
    camera.lookAt(look);
    shiftFrame(p);
    sky.position.copy(camera.position);
    if (dust) { dust.material.opacity = .55 * (1 - seg(p, .42, .6)); dust.visible = dust.material.opacity > .01; dust.position.y = p * 2.2; dust.rotation.y = p * .35; }
    const tin = seg(d, .62, .86);
    if (interior) {
      interior.style.setProperty("--in", tin.toFixed(3)); interior.classList.toggle("on", tin > .001);
      rooms.forEach((r, i) => r.style.setProperty("--r", seg(d, .74 + i * .06, .92 + i * .03).toFixed(3)));
    }
    // final photo crossfade
    setLabel(P);
  }
  /* wide screens: the opening frame sits right of centre (headline on the left), then glides to centre */
  const WIDE = matchMedia("(min-width: 1000px) and (min-aspect-ratio: 23/20)");
  let frame = null, wide = false, frameShift = -1;
  function shiftFrame(p) {
    if (!frame) return;
    const sh = wide ? frame.w * .17 * (1 - seg(p, .03, .32)) : 0;
    if (Math.abs(sh - frameShift) < .25) return;
    frameShift = sh; camera.setViewOffset(frame.w, frame.h, -(frame.x + sh), -frame.y, canvas.clientWidth, canvas.clientHeight); camera.updateProjectionMatrix();
  }
  function resize() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    renderer.setSize(W, H, false); composer.setPixelRatio(DPR); composer.setSize(W, H);
    if (gtao) gtao.setSize(W * DPR, H * DPR);
    bloom.resolution.set(W * DPR / 2, H * DPR / 2);
    const r = frameRect(W, H);
    camera.aspect = PHOTO_ASPECT; frame = r; wide = WIDE.matches; frameShift = -1; camera.setViewOffset(r.w, r.h, -r.x, -r.y, W, H); camera.updateProjectionMatrix();
    placePhoto(r, W); last = -1; dirty = true;
  }
  addEventListener("resize", resize); resize();
  addEventListener("scroll", () => { target = rawProgress(); setLabel(cur); }, { passive: true });
  let visible = true;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(section);
  let frames = 0;
  function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    cur += (target - cur) * .09; if (Math.abs(target - cur) < 1e-4) cur = target;
    const pdx = ptr.tx - ptr.x, pdy = ptr.ty - ptr.y;
    if (Math.abs(pdx) > 1e-3 || Math.abs(pdy) > 1e-3) { ptr.x += pdx * .06; ptr.y += pdy * .06; dirty = true; }
    if (Math.abs(cur - last) > 1e-5 || dirty) { apply(cur); if (cur < .985) composer.render(); last = cur; dirty = false; frames++; }
  }
  apply(cur); loop();
  window.__heroFrames = () => frames;
  section.classList.add("webgl-on");
  window.__heroMode = "webgl";
}
