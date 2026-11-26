/* =====================================================================
   Lastra Projekt – 3D house engine (one fixed canvas behind the page)
   ---------------------------------------------------------------------
   • Renders inside the single gsap.ticker clock (js/clock.js) – no own rAF.
   • Story: pinned scroll sequence, camera on a CatmullRom spline, the house
     builds itself in 4 phases (foundation → structure → roof & glazing → finish).
   • Explore: damped OrbitControls, presets, day/dusk, model + façade switchers,
     manual phase scrubber, hotspots, cutaway.
   • Pipeline: HDRI (PMREM) → ACES → key/rim lights + soft PCF shadows →
     Render → Bloom → Vignette → Output → Grain (desktop; mobile renders direct).
   ===================================================================== */
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const LP = window.LP || {};
const SITE = window.SITE || {};
const canvas = document.getElementById("gl");
const story = document.querySelector(".story");
const explore = document.querySelector(".explore");
const reduce = !!LP.reduce;
const coarse = matchMedia("(pointer: coarse)").matches;
const isMobile = () => innerWidth < 768;
const MOBILE = isMobile() || (coarse && Math.min(innerWidth, innerHeight) < 820);

/* ---------------------------------------------------------------- math */
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const sstep = (a, b, v) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
/* frame-rate independent damping; k is the per-frame factor at 60 fps (0.06 – 0.09) */
const kdt = (k, dt) => 1 - Math.pow(1 - k, dt * 60);
const DAMP = { cam: 0.065, look: 0.07, scroll: 0.08, pointer: 0.06, light: 0.07, stage: 0.075, ui: 0.09 };

function webglOK() { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } }

if (!canvas || !story) {
  /* not the home page */
} else if (!webglOK() || !window.gsap) {
  document.body.classList.add("gl-fallback");
  storyFallback();
} else {
  try { init(); } catch (err) {
    console.warn("[lastra] 3D unavailable, showing photos", err);
    document.body.classList.remove("gl-on"); document.body.classList.add("gl-fallback");
    storyFallback();
  }
}

/* Without WebGL the story still works: chapters + photo crossfade driven by scroll. */
function storyFallback() {
  const chapters = [...story.querySelectorAll(".chapter")];
  const fin = document.querySelector(".gl-fallback-img .fb-after");
  const set = () => {
    const r = story.getBoundingClientRect(), span = Math.max(1, story.offsetHeight - innerHeight);
    const p = clamp01(-r.top / span), x = clamp01((p - 0.07) / 0.9) * 4, i = p < 0.06 ? -1 : Math.min(3, Math.floor(x));
    chapters.forEach((c, k) => c.classList.toggle("on", k === i || reduce));
    story.classList.toggle("is-hero", i < 0);
    if (fin) fin.style.opacity = reduce ? 1 : sstep(2, 3.6, x).toFixed(3);
  };
  if (LP.onScroll) LP.onScroll(set); else addEventListener("scroll", set, { passive: true });
  set();
}

/* =================================================================== */
function init() {
  document.body.classList.add("gl-on");
  const PR = Math.min(window.devicePixelRatio || 1, 2, MOBILE ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: MOBILE, powerPreference: "high-performance", stencil: false, alpha: false });
  renderer.setPixelRatio(PR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;          // updated only while something moves (see frame())
  renderer.localClippingEnabled = true;
  const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const FOG_DAY = new THREE.Color("#c6ccd0"), FOG_DUSK = new THREE.Color("#2a2b36");
  scene.fog = new THREE.Fog(FOG_DAY.clone(), 110, 560);
  const camera = new THREE.PerspectiveCamera(MOBILE ? 44 : 34, innerWidth / innerHeight, 0.1, 900);
  camera.position.set(28, 12, 34);

  let shadowDirty = true;
  const markShadow = () => { shadowDirty = true; };

  /* ------------------------------------------------------------ textures */
  const TEX = "assets/tex/";
  const disposablesLate = [];
  const TL = new THREE.TextureLoader();
  const tex = (file, srgb, tile) => {
    const t = TL.load(TEX + file, () => { markShadow(); requestStill(); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; t.repeat.set(1 / tile, 1 / tile);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  /* all planar UVs are in metres; each texture set carries its own real-world tile size */
  const TILE = { concrete: 2.4, plaster: 2.6, stone: 1.8, paving: 2.2, grass: 3.2 };
  const SET = {};
  for (const n of Object.keys(TILE)) {
    const small = MOBILE || n === "grass" || n === "paving";
    SET[n] = { map: n === "stone" ? null : tex(`${n}_diff${small ? "_1k" : ""}.jpg`, true, TILE[n]), normalMap: tex(`${n}_nor.jpg`, false, TILE[n]), roughnessMap: tex(`${n}_rough.jpg`, false, TILE[n]) };
  }
  /* the repo's stone set is a blue slate tile: re-tone it once into warm natural limestone (pattern, normal + roughness kept) */
  {
    const c0 = document.createElement("canvas"); c0.width = c0.height = 4; const g0 = c0.getContext("2d"); g0.fillStyle = "#cbbca6"; g0.fillRect(0, 0, 4, 4);
    const warm = new THREE.CanvasTexture(c0);
    warm.wrapS = warm.wrapT = THREE.RepeatWrapping; warm.anisotropy = ANISO; warm.colorSpace = THREE.SRGBColorSpace; warm.repeat.set(1 / TILE.stone, 1 / TILE.stone);
    const img = new Image(); img.decoding = "async";
    img.onload = () => {
      const c = document.createElement("canvas"), w = Math.min(1024, img.width), h = Math.round(w * img.height / img.width); c.width = w; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h), a = d.data; let lo = 255, hi = 0;
      for (let i = 0; i < a.length; i += 4) { const l = a[i] * .3 + a[i + 1] * .59 + a[i + 2] * .11; a[i + 3] = l; if (l < lo) lo = l; if (l > hi) hi = l; }
      const D = [128, 110, 90], Lt = [226, 214, 196];
      for (let i = 0; i < a.length; i += 4) { const t = Math.pow((a[i + 3] - lo) / Math.max(1, hi - lo), .8); a[i] = D[0] + (Lt[0] - D[0]) * t; a[i + 1] = D[1] + (Lt[1] - D[1]) * t; a[i + 2] = D[2] + (Lt[2] - D[2]) * t; a[i + 3] = 255; }
      g.putImageData(d, 0, 0); warm.dispose(); warm.image = c; warm.needsUpdate = true; markShadow(); requestStill();
    };
    img.src = TEX + `stone_diff${MOBILE ? "_1k" : ""}.jpg`;
    SET.stone.map = warm; disposablesLate.push(warm);
  }
  /* brick (no photo set in the repo): procedural clay brick, 250 × 65 mm with 10 mm joints */
  function canvasTex(draw, size, tile, srgb) {
    const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO; t.repeat.set(1 / tile, 1 / tile);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const BRICK_TILE = 1.2, BS = MOBILE ? 512 : 1024;
  const brickLayout = (() => { const rows = 16, cols = 5, cells = []; for (let r = 0; r < rows; r++) for (let k = -1; k <= cols; k++) cells.push({ r, k, tone: rnd(), spot: rnd() }); return { rows, cols, cells }; })();
  const brickMap = canvasTex((g, S) => {
    const { rows, cols, cells } = brickLayout, bh = S / rows, bw = S / cols, j = S / 140;
    g.fillStyle = "#b9b0a4"; g.fillRect(0, 0, S, S);
    for (const c of cells) {
      const x = c.k * bw + (c.r % 2) * bw / 2, y = c.r * bh;
      g.fillStyle = `hsl(${12 + c.tone * 10},${46 + c.spot * 16}%,${34 + c.tone * 14}%)`; g.fillRect(x + j, y + j, bw - 2 * j, bh - 2 * j);
      for (let q = 0; q < 14; q++) { g.fillStyle = `rgba(${rnd() < .5 ? "40,16,8" : "255,210,170"},${.04 + rnd() * .07})`; g.fillRect(x + j + rnd() * (bw - 6 * j), y + j + rnd() * (bh - 4 * j), 2 + rnd() * bw * .2, 1 + rnd() * bh * .3); }
    }
  }, BS, BRICK_TILE, true);
  const brickBump = canvasTex((g, S) => {
    const { rows, cols, cells } = brickLayout, bh = S / rows, bw = S / cols, j = S / 140;
    g.fillStyle = "#222"; g.fillRect(0, 0, S, S);
    for (const c of cells) { const x = c.k * bw + (c.r % 2) * bw / 2, y = c.r * bh; g.fillStyle = `rgb(${190 + c.spot * 30},${190 + c.spot * 30},${190 + c.spot * 30})`; g.fillRect(x + j, y + j, bw - 2 * j, bh - 2 * j); }
  }, BS, BRICK_TILE, false);
  /* warm wood (vertical boards) for the concrete + wood façade and interiors */
  const WOOD_TILE = 1.6;
  const woodMap = canvasTex((g, S) => {
    const n = 8, w = S / n;
    for (let i = 0; i < n; i++) {
      const l = 30 + rnd() * 9; g.fillStyle = `hsl(${24 + rnd() * 6},${42 + rnd() * 10}%,${l}%)`; g.fillRect(i * w, 0, w, S);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${rnd() < .55 ? "45,22,10" : "255,214,170"},${.05 + rnd() * .08})`; const x = i * w + rnd() * w; g.fillRect(x, 0, 1 + rnd() * 2, S); }
      g.fillStyle = "rgba(20,10,5,.55)"; g.fillRect(i * w, 0, Math.max(2, S / 340), S);
    }
  }, MOBILE ? 256 : 512, WOOD_TILE, true);

  /* ------------------------------------------------------------ materials */
  const std = (set, o = {}) => new THREE.MeshStandardMaterial({ ...(set ? SET[set] : {}), ...o });
  const BASE = {
    concrete: () => std("concrete", { color: "#d2cec7", roughness: 1, envMapIntensity: .9 }),
    raw: () => std("concrete", { color: "#b9b5ae", roughness: 1, envMapIntensity: .8 }),
    plaster: () => std("plaster", { map: null, color: "#ece8e1", roughness: 1, envMapIntensity: 1.0, normalScale: new THREE.Vector2(.6, .6) }),
    plasterDark: () => std("plaster", { color: "#34353a", roughness: .95, envMapIntensity: .9 }),
    stone: () => std("stone", { color: "#ffffff", roughness: 1, envMapIntensity: 1.1, normalScale: new THREE.Vector2(1.3, 1.3) }),
    exposed: () => std("concrete", { color: "#a9a6a0", roughness: .95, envMapIntensity: 1 }),
    wood: () => new THREE.MeshStandardMaterial({ map: woodMap, bumpMap: woodMap, bumpScale: .6, roughness: .62, envMapIntensity: .9, color: "#ffffff" }),
    brick: () => new THREE.MeshStandardMaterial({ map: brickMap, bumpMap: brickBump, bumpScale: 2.2, roughness: .93, envMapIntensity: .85 }),
    paving: () => std("paving", { color: "#e6ded2", roughness: 1, roughnessMap: null, envMapIntensity: .45 }),
    soil: () => std("concrete", { color: "#6b5646", roughness: 1, envMapIntensity: .5 }),
    rebar: () => new THREE.MeshStandardMaterial({ color: "#6e5446", roughness: .55, metalness: .65 }),
    alu: () => new THREE.MeshStandardMaterial({ color: "#1d1e21", roughness: .3, metalness: .85, envMapIntensity: 1.2 }),
    bronze: () => new THREE.MeshStandardMaterial({ color: "#b8845a", roughness: .35, metalness: .9, envMapIntensity: 1.2 }),
    membrane: () => std("concrete", { color: "#5f6165", roughness: 1, envMapIntensity: .6 }),
    glass: () => new THREE.MeshPhysicalMaterial({ color: "#a8bcc4", roughness: .03, metalness: 0, transparent: true, opacity: .34, envMapIntensity: 1.6, ior: 1.52, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: .03, depthWrite: false }),
    railGlass: () => new THREE.MeshPhysicalMaterial({ color: "#d4e4df", roughness: .02, metalness: 0, transparent: true, opacity: .2, envMapIntensity: 1.5, ior: 1.52, specularIntensity: 1, depthWrite: false })
  };

  /* Reveal: a clipping plane sweeps along `axis`, with a glowing bronze edge at the cut.
     Visible where dot(axis, p) <= edge. Shadows are clipped too. */
  const REVEAL_COLOR = new THREE.Color("#ff9d52").multiplyScalar(2.6);
  function reveal(mat, axis) {
    const ax = axis.clone().normalize();
    const plane = new THREE.Plane(ax.clone().negate(), 1e4);
    const u = { uRAxis: { value: ax }, uREdge: { value: 1e4 }, uRAmt: { value: 0 }, uRCol: { value: REVEAL_COLOR } };
    mat.clippingPlanes = [plane]; mat.clipShadows = true;
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = "varying vec3 vRW;\n" + sh.vertexShader.replace("#include <project_vertex>",
        "#include <project_vertex>\n#ifdef USE_INSTANCING\n vRW = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n#else\n vRW = (modelMatrix * vec4(transformed,1.0)).xyz;\n#endif");
      sh.fragmentShader = "uniform vec3 uRAxis; uniform float uREdge; uniform float uRAmt; uniform vec3 uRCol; varying vec3 vRW;\n" +
        sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += uRCol * uRAmt * (1.0 - smoothstep(0.0, 0.085, abs(dot(vRW, uRAxis) - uREdge)));");
    };
    mat.customProgramCacheKey = () => "reveal";
    mat.userData.edge = (e, amt) => { plane.constant = e; u.uREdge.value = e; u.uRAmt.value = amt; };
    return mat;
  }
  const UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0), XAX = new THREE.Vector3(1, 0, 0);

  /* ------------------------------------------------------------ sky + HDRI */
  const SKY_V = `varying vec3 vDir; void main(){ vDir = normalize((modelMatrix*vec4(position,0.)).xyz); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`;
  const SKY_F = `uniform sampler2D tDay,tDusk; uniform float mixv,iDay,iDusk,rDay,rDusk,ready; uniform vec3 fogC,groundC; varying vec3 vDir;
    vec2 eq(vec3 d,float r){ return vec2(fract(atan(d.z,d.x)*0.15915494+0.5+r), asin(clamp(d.y,-1.,1.))*0.31830989+0.5); }
    void main(){ vec3 d=normalize(vDir); vec3 h=normalize(vec3(d.x,max(d.y,0.0)+0.002,d.z));
      vec3 c = ready>0.5 ? mix(texture2D(tDay,eq(h,rDay)).rgb*iDay, texture2D(tDusk,eq(h,rDusk)).rgb*iDusk, mixv) : fogC*1.05;
      c = min(c, vec3(14.0));
      c = mix(fogC, c, smoothstep(0.0, 0.16, d.y));            // haze into the fog colour at the horizon
      c = mix(c, groundC, smoothstep(0.0, 0.25, -d.y));         // below the horizon: ground bounce
      gl_FragColor = vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  const skyUniforms = () => ({ tDay: { value: null }, tDusk: { value: null }, mixv: { value: 0 }, iDay: { value: 1 }, iDusk: { value: 1 }, rDay: { value: 0 }, rDusk: { value: 0 }, ready: { value: 0 }, fogC: { value: FOG_DAY.clone() }, groundC: { value: new THREE.Color("#4e4a43") } });
  const skyMat = new THREE.ShaderMaterial({ uniforms: skyUniforms(), vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, fog: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), skyMat);
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);
  /* env bake scene (same shader, no tone mapping) – blended day/dusk levels baked once */
  const envSkyMat = new THREE.ShaderMaterial({ uniforms: skyUniforms(), vertexShader: SKY_V.replace("gl_Position.z = gl_Position.w;", ""), fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, toneMapped: false });
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), envSkyMat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ENV_LEVELS = 9; const envTex = new Array(ENV_LEVELS).fill(null);
  const roomEnv = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;  // until the HDRIs arrive
  scene.environment = roomEnv;
  let envQueue = [], envIdx = -1, hdrReady = false;
  const sunDay = new THREE.Vector3(.55, .62, .56).normalize(), sunDusk = new THREE.Vector3(-.82, .2, .22).normalize();
  const fogDayC = FOG_DAY.clone(), fogDuskC = FOG_DUSK.clone();

  /* find the sun in an equirect HDR: brightest pixel → direction + horizon colour */
  function analyse(t) {
    const { data, width: W, height: H } = t.image, half = data instanceof Uint16Array, f = half ? THREE.DataUtils.fromHalfFloat : v => v;
    let best = -1, bx = 0, by = 0; const hz = [0, 0, 0]; let hn = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 4, r = f(data[i]), g = f(data[i + 1]), b = f(data[i + 2]), l = r * .2126 + g * .7152 + b * .0722;
      if (y < H * .5 && l > best) { best = l; bx = x; by = y; }
      if (Math.abs(y - H * .5) < H * .03) { hz[0] += r; hz[1] += g; hz[2] += b; hn++; }
    }
    return { u: (bx + .5) / W, v: 1 - (by + .5) / H, horizon: new THREE.Color(hz[0] / hn, hz[1] / hn, hz[2] / hn) };
  }
  /* rotate each HDRI so its sun lands where we want it relative to the house */
  function rotFor(info, want) { const az = Math.atan2(want.z, want.x); return ((info.u - .5 - az / (Math.PI * 2)) % 1 + 1) % 1; }
  function sunFrom(info, rot, minEl, maxEl) {
    const az = (info.u - .5 - rot) * Math.PI * 2, el = THREE.MathUtils.clamp((info.v - .5) * Math.PI, minEl, maxEl);
    return new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize();
  }
  const hdr = new RGBELoader();
  let hDay = null, hDusk = null;
  const onHDR = () => {
    if (!hDay || !hDusk) return;
    const a = analyse(hDay), b = analyse(hDusk);
    const rDay = rotFor(a, new THREE.Vector3(.62, 0, .78)), rDusk = rotFor(b, new THREE.Vector3(-.9, 0, .35));
    sunDay.copy(sunFrom(a, rDay, .42, .95)); sunDusk.copy(sunFrom(b, rDusk, .1, .3));
    /* fog = horizon colour of each HDRI, so ground, mountains and sky meet without a seam */
    const lum = c => c.r * .2126 + c.g * .7152 + c.b * .0722;
    const iDusk = THREE.MathUtils.clamp(.42 / Math.max(.05, lum(b.horizon)), .25, 2.5), iDay = THREE.MathUtils.clamp(.62 / Math.max(.05, lum(a.horizon)), .3, 2.5);
    fogDayC.copy(a.horizon).multiplyScalar(iDay); fogDuskC.copy(b.horizon).multiplyScalar(iDusk);
    for (const m of [skyMat, envSkyMat]) Object.assign(m.uniforms, { tDay: { value: hDay }, tDusk: { value: hDusk }, rDay: { value: rDay }, rDusk: { value: rDusk }, iDay: { value: iDay }, iDusk: { value: iDusk }, ready: { value: 1 } });
    hdrReady = true;
    /* bake the blended environment levels one per frame (no hitch); nearest level is used */
    envQueue = [...Array(ENV_LEVELS).keys()].sort((x, y) => Math.abs(x / (ENV_LEVELS - 1) - S.dusk) - Math.abs(y / (ENV_LEVELS - 1) - S.dusk));
    if (reduce) { while (envQueue.length) bakeEnv(envQueue.shift()); requestStill(); }
  };
  function bakeEnv(i) {
    const v = i / (ENV_LEVELS - 1);
    envSkyMat.uniforms.mixv.value = v;
    envSkyMat.uniforms.fogC.value.copy(fogDayC).lerp(fogDuskC, v);
    envTex[i] = pmrem.fromScene(envScene, 0, .1, 100).texture;
  }
  hdr.load("assets/hdr/day.hdr", t => { hDay = t; onHDR(); }, undefined, e => console.warn("[lastra] day.hdr", e));
  hdr.load("assets/hdr/dusk.hdr", t => { hDusk = t; onHDR(); }, undefined, e => console.warn("[lastra] dusk.hdr", e));

  /* ------------------------------------------------------------ lights */
  const key = new THREE.DirectionalLight("#fff3e2", 3);
  key.castShadow = true;
  key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 120 });
  key.shadow.bias = -0.00025; key.shadow.normalBias = 0.025; key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight("#9fb6ff", .55); rim.position.set(-20, 12, -26); scene.add(rim);
  const warm1 = new THREE.PointLight("#ffb46b", 0, 11, 2), warm2 = new THREE.PointLight("#ffb46b", 0, 11, 2);
  scene.add(warm1, warm2);
  const KEY_DAY = new THREE.Color("#fff1de"), KEY_DUSK = new THREE.Color("#ff9c5e"), RIM_DAY = new THREE.Color("#a9c0ff"), RIM_DUSK = new THREE.Color("#ffb489");

  /* ------------------------------------------------------------ helpers */
  function planarUV(g) {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ax >= ay && ax >= az) uv.setXY(i, z, y); else if (ay >= az) uv.setXY(i, x, z); else uv.setXY(i, x, y);
    }
    uv.needsUpdate = true; return g;
  }
  const geoBox = (w, h, d, x, y, z) => planarUV(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z));   // y = bottom
  const geoCyl = (r, h, x, y, z, seg = 8) => planarUV(new THREE.CylinderGeometry(r, r, h, seg).translate(x, y + h / 2, z));
  /* merge helper: mixes indexed + non-indexed geometries safely */
  const merge = list => {
    const mixed = list.some(g => g.index) && list.some(g => !g.index);
    const src = mixed ? list.map(g => (g.index ? g.toNonIndexed() : g)) : list;
    const out = mergeGeometries(src, false);
    if (mixed) src.forEach((g, i) => g !== list[i] && g.dispose());
    return out;
  };
  const disposables = new Set();
  disposablesLate.forEach(t => disposables.add(t));
  const track = o => { disposables.add(o); return o; };

  /* ------------------------------------------------------------ house model builder */
  const T = 0.3, TC = 0.38, COL = 0.32, SLAB = 0.3, F = 3.2, FL0 = 0.12;
  const level = lv => FL0 + lv * F;                         // finished floor level
  const SCHEMES = {
    plaster: { P: BASE.plaster, A: BASE.stone },
    stone: { P: BASE.stone, A: BASE.plaster },
    concrete: { P: BASE.exposed, A: BASE.wood }
  };

  function buildModel(spec) {
    const geos = new Map();
    const add = (k, g) => { if (!geos.has(k)) geos.set(k, []); geos.get(k).push(g); };
    const gf = spec.vols.filter(v => v.lv === 0);
    const bb = { x0: Math.min(...gf.map(v => v.x0)), x1: Math.max(...gf.map(v => v.x1)), z0: Math.min(...gf.map(v => v.z0)), z1: Math.max(...gf.map(v => v.z1)) };
    const PIT = { x0: bb.x0 - 1.1, x1: bb.x1 + 1.1, z0: bb.z0 - 1.1, z1: bb.z1 + 1.1 }, PD = -1.1;
    const top = Math.max(...spec.vols.map(v => v.lv)) + 1;
    const uplights = [], hs = spec.hotspots;

    /* walls → pieces along each side, openings cut out */
    const sideInfo = (v, s) => {
      if (s === "S") return { len: v.x1 - v.x0, o: [v.x0, v.z1], d: [1, 0] };
      if (s === "N") return { len: v.x1 - v.x0, o: [v.x0, v.z0], d: [1, 0] };
      if (s === "W") return { len: v.z1 - v.z0, o: [v.x0, v.z0], d: [0, 1] };
      return { len: v.z1 - v.z0, o: [v.x1, v.z0], d: [0, 1] };
    };
    const piece = (k, info, a, b, y0, h, thick) => {
      const c = (a + b) / 2, L = b - a, x = info.o[0] + info.d[0] * c, z = info.o[1] + info.d[1] * c;
      add(k, info.d[0] ? geoBox(L, h, thick, x, y0, z) : geoBox(thick, h, L, x, y0, z));
    };
    const at = (info, t) => [info.o[0] + info.d[0] * t, info.o[1] + info.d[1] * t];

    for (const v of spec.vols) {
      const y0 = level(v.lv), h = F - SLAB, clad = v.clad === "A" ? "cladA" : "cladP";
      for (const s of ["S", "N", "W", "E"]) {
        if (v.skip && v.skip.includes(s)) continue;
        const info = sideInfo(v, s), ops = ((v.open && v.open[s]) || []).slice().sort((p, q) => p.a - q.a);
        let cur = 0; const solids = [];
        for (const o of ops) { if (o.a > cur) solids.push([cur, o.a]); cur = o.b; }
        if (cur < info.len) solids.push([cur, info.len]);
        const ext = (a, b) => [a <= 0 ? a - T / 2 : a, b >= info.len ? b + T / 2 : b];
        for (const [a0, b0] of solids) {
          const [a, b] = ext(a0, b0);
          piece("brick", info, a, b, y0, h, T);
          piece(clad, info, a - (a0 > 0 ? .02 : 0), b + (b0 < info.len ? .02 : 0), y0 - .02, h + .04, TC);
          if (v.lv === 0 && b0 - a0 > 1.1 && s !== "N" && v.uplights !== false) {           // façade uplight on each solid pier
            const [x, z] = at(info, (a0 + b0) / 2), nrm = s === "S" ? [0, 1] : s === "W" ? [-1, 0] : s === "E" ? [1, 0] : [0, -1];
            uplights.push({ x: x + nrm[0] * (TC / 2 + .04), z: z + nrm[1] * (TC / 2 + .04), nx: nrm[0], nz: nrm[1], top: y0 + h });
          }
        }
        for (const o of ops) {
          if (o.sill > 0) { piece("brick", info, o.a, o.b, y0, o.sill, T); piece(clad, info, o.a - .02, o.b + .02, y0 - .02, o.sill + .04, TC); }
          if (o.head < h) { piece("brick", info, o.a, o.b, y0 + o.head, h - o.head, T); piece(clad, info, o.a - .02, o.b + .02, y0 + o.head - .02, h - o.head + .04, TC); }
          /* aluminium frame + glass (or a solid door leaf) in the wall plane */
          const w = o.b - o.a, hh = o.head - o.sill, fp = .06, fd = .12, yb = y0 + o.sill;
          piece("frame", info, o.a, o.b, yb, fp, fd); piece("frame", info, o.a, o.b, yb + hh - fp, fp, fd);
          piece("frame", info, o.a, o.a + fp, yb, hh, fd); piece("frame", info, o.b - fp, o.b, yb, hh, fd);
          if (o.kind === "door") {
            piece("door", info, o.a + fp, o.b - fp, yb + fp, hh - 2 * fp, .06);
            if (w < 2) { const [hx, hz] = at(info, o.b - .22); const n = info.d[0] ? [0, s === "N" ? -1 : 1] : [s === "W" ? -1 : 1, 0]; add("bronzeTrim", geoBox(.04, 1.3, .04, hx + n[0] * .06, yb + .6, hz + n[1] * .06)); }
          } else {
            const n = Math.max(1, Math.round(w / 1.6));
            for (let m = 1; m < n; m++) { const t = o.a + (w * m) / n; piece("frame", info, t - .025, t + .025, yb, hh, fd * .9); }
            piece("glass", info, o.a + fp * .5, o.b - fp * .5, yb + fp * .5, hh - fp, .024);
          }
        }
      }
      /* interior "room" glow box (seen through the glass) */
      if (v.room !== false) add("room", new THREE.BoxGeometry(v.x1 - v.x0 - .4, F - SLAB - .02, v.z1 - v.z0 - .4).translate((v.x0 + v.x1) / 2, y0 + (F - SLAB) / 2, (v.z0 + v.z1) / 2));
    }

    /* columns (+ rebar cages and pad footings at ground level) */
    const colPts = new Map();
    for (const v of spec.vols) {
      const pts = [];
      for (const s of ["S", "N", "W", "E"]) {
        const info = sideInfo(v, s), ops = (v.open && v.open[s]) || [], n = Math.max(1, Math.ceil(info.len / 4.6));
        for (let i = 0; i <= n; i++) { const t = (info.len * i) / n; if (i > 0 && i < n && ops.some(o => t > o.a - .3 && t < o.b + .3)) continue; pts.push(at(info, t)); }
      }
      for (const [x, z] of pts) colPts.set(`${v.lv}:${x.toFixed(2)}:${z.toFixed(2)}`, { x, z, lv: v.lv });
    }
    for (const c of colPts.values()) {
      const y0 = level(c.lv);
      add(c.lv === 0 ? "col0" : "col1", geoBox(COL, F - SLAB, COL, c.x, y0, c.z));
      if (c.lv === 0) {
        add("foot", geoBox(1.3, .5, 1.3, c.x, PD, c.z));
        for (const [dx, dz] of [[-.09, -.09], [.09, -.09], [-.09, .09], [.09, .09]]) add("rebar", geoCyl(.013, 2.75, c.x + dx, PD + .05, c.z + dz, 6));
        for (const yy of [-.2, .45, 1.1]) { add("rebar", geoBox(.21, .014, .014, c.x, yy, c.z - .09)); add("rebar", geoBox(.21, .014, .014, c.x, yy, c.z + .09)); add("rebar", geoBox(.014, .014, .21, c.x - .09, yy, c.z)); add("rebar", geoBox(.014, .014, .21, c.x + .09, yy, c.z)); }
      }
    }
    /* strip footings + stem walls under the ground-floor walls, ground slab */
    for (const v of gf) {
      for (const s of ["S", "N", "W", "E"]) {
        if (v.skip && v.skip.includes(s)) continue;
        const info = sideInfo(v, s);
        piece("foot", info, -.35, info.len + .35, PD, .5, .7);
        piece("stem", info, -T / 2, info.len + T / 2, PD + .5, -.3 - (PD + .5), T);
      }
      add("slab0", geoBox(v.x1 - v.x0 + T, .42, v.z1 - v.z0 + T, (v.x0 + v.x1) / 2, -.3, (v.z0 + v.z1) / 2));
      add("cladA", geoBox(v.x1 - v.x0 + TC, .2, v.z1 - v.z0 + TC, (v.x0 + v.x1) / 2, -.06, (v.z0 + v.z1) / 2));  // plinth band
    }
    /* intermediate slabs (cantilevers, terraces) + balconies */
    for (const s of spec.slabs || []) {
      const y = level(s.lv) - SLAB;
      add("slab1", geoBox(s.x1 - s.x0, SLAB, s.z1 - s.z0, (s.x0 + s.x1) / 2, y, (s.z0 + s.z1) / 2));
      add("cladP", geoBox(s.x1 - s.x0 + .06, SLAB + .05, s.z1 - s.z0 + .06, (s.x0 + s.x1) / 2, y - .02, (s.z0 + s.z1) / 2));
      if (s.deck) add("deck", geoBox(s.x1 - s.x0 - .04, .05, s.z1 - s.z0 - .04, (s.x0 + s.x1) / 2, y + SLAB + .03, (s.z0 + s.z1) / 2));
      for (const r of s.rails || []) {
        const yb = y + SLAB + .06, inset = .12;
        if (r === "S" || r === "N") { const z = r === "S" ? s.z1 - inset : s.z0 + inset; add("rail", geoBox(s.x1 - s.x0 - .2, 1.05, .02, (s.x0 + s.x1) / 2, yb + .06, z)); add("frame", geoBox(s.x1 - s.x0 - .2, .08, .1, (s.x0 + s.x1) / 2, yb, z)); }
        else { const x = r === "E" ? s.x1 - inset : s.x0 + inset; add("rail", geoBox(.02, 1.05, s.z1 - s.z0 - .2, x, yb + .06, (s.z0 + s.z1) / 2)); add("frame", geoBox(.1, .08, s.z1 - s.z0 - .2, x, yb, (s.z0 + s.z1) / 2)); }
      }
    }
    /* roofs: structural slab, fascia + parapet (cladding), membrane, soffit LED */
    for (const r of spec.roofs) {
      const y = level(r.lv + 1) - SLAB - (r.drop || 0), o = r.over;
      const x0 = r.x0 - o.W, x1 = r.x1 + o.E, z0 = r.z0 - o.N, z1 = r.z1 + o.S, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
      add("roof", geoBox(w, SLAB, d, cx, y, cz));
      add("cladP", geoBox(w + .06, SLAB + .06, d + .06, cx, y - .03, cz));
      const pw = .2, ph = .32, yt = y + SLAB + .03;
      add("cladP", geoBox(w + .06, ph, pw, cx, yt, z0 + pw / 2 - .03)); add("cladP", geoBox(w + .06, ph, pw, cx, yt, z1 - pw / 2 + .03));
      add("cladP", geoBox(pw, ph, d + .06, x0 + pw / 2 - .03, yt, cz)); add("cladP", geoBox(pw, ph, d + .06, x1 - pw / 2 + .03, yt, cz));
      add("membrane", geoBox(w - .3, .04, d - .3, cx, yt, cz));
      if (o.S > .6) add("led", geoBox(w - .6, .025, .05, cx, y - .06, z1 - .28));
    }
    /* interiors: oak floors, partitions, furniture (seen through glass and in cutaway) */
    for (const v of spec.vols) if (v.room !== false) add("intFloor", geoBox(v.x1 - v.x0 - .3, .03, v.z1 - v.z0 - .3, (v.x0 + v.x1) / 2, level(v.lv) + .002, (v.z0 + v.z1) / 2));
    for (const it of spec.interior || []) add(it[0], geoBox(it[1], it[2], it[3], it[4], level(it[7] || 0) + it[5], it[6]));
    /* excavation pit + backfill (paved surround) */
    add("pit", geoBox(PIT.x1 - PIT.x0, .1, PIT.z1 - PIT.z0, (PIT.x0 + PIT.x1) / 2, PD - .1, (PIT.z0 + PIT.z1) / 2));
    add("pit", geoBox(PIT.x1 - PIT.x0, -PD, .06, (PIT.x0 + PIT.x1) / 2, PD, PIT.z0)); add("pit", geoBox(PIT.x1 - PIT.x0, -PD, .06, (PIT.x0 + PIT.x1) / 2, PD, PIT.z1));
    add("pit", geoBox(.06, -PD, PIT.z1 - PIT.z0, PIT.x0, PD, (PIT.z0 + PIT.z1) / 2)); add("pit", geoBox(.06, -PD, PIT.z1 - PIT.z0, PIT.x1, PD, (PIT.z0 + PIT.z1) / 2));
    add("backfill", geoBox(PIT.x1 - PIT.x0 - .14, -PD - .02, PIT.z1 - PIT.z0 - .14, (PIT.x0 + PIT.x1) / 2, PD, (PIT.z0 + PIT.z1) / 2));
    /* landscaping (grows in during the finish) */
    for (const L of spec.land || []) {
      if (L.t === "hedge") add("leaf", geoBox(L.w, L.h, L.d, L.x, 0, L.z));
      if (L.t === "planter") { add("planter", geoBox(L.w, .55, L.d, L.x, 0, L.z)); add("leaf", geoBox(L.w - .16, .5, L.d - .16, L.x, .5, L.z)); }
      if (L.t === "tree") { add("trunk", geoCyl(.12, L.h * .45, L.x, 0, L.z, 7)); for (let i = 0; i < 3; i++) add("leaf", planarUV(new THREE.IcosahedronGeometry(L.r * (1 - i * .18), 1).translate(L.x + (i - 1) * .35, L.h * .55 + i * L.r * .55, L.z + (i % 2) * .3))); }
      if (L.t === "cypress") { add("trunk", geoCyl(.08, .5, L.x, 0, L.z, 6)); add("leafDark", planarUV(new THREE.ConeGeometry(L.r, L.h, 10).translate(L.x, .35 + L.h / 2, L.z))); }
    }
    for (const u of uplights) add("fixture", geoBox(.14, .08, .14, u.x + u.nx * .05, .0, u.z + u.nz * .05));

    /* ---- parts: material, timing window (in build-stage units 0–4) and animation mode */
    const Hmax = level(top) + .5;
    const P = {
      pit: { mat: BASE.soil, mode: "static" },
      foot: { mat: BASE.concrete, mode: "rise", w: [.05, .42], lo: PD - .02, hi: PD + .52 },
      rebar: { mat: BASE.rebar, mode: "rise", w: [.18, .62], lo: PD, hi: 1.75, cast: true },
      stem: { mat: BASE.concrete, mode: "rise", w: [.36, .6], lo: PD + .48, hi: -.28 },
      slab0: { mat: BASE.concrete, mode: "sweep", w: [.55, .98], lo: bb.x0 - .5, hi: bb.x1 + .5 },
      col0: { mat: BASE.concrete, mode: "rise", w: [1.0, 1.38], lo: FL0, hi: level(1) - SLAB },
      slab1: { mat: BASE.concrete, mode: "sweep", w: [1.3, 1.58], lo: -14, hi: 14 },
      col1: { mat: BASE.concrete, mode: "rise", w: [1.5, 1.78], lo: level(1), hi: level(2) - SLAB },
      brick: { mat: BASE.brick, mode: "rise", w: [1.12, 1.96], lo: FL0, hi: level(top) - SLAB },
      roof: { mat: BASE.concrete, mode: "sweep", w: [2.0, 2.34], lo: -16, hi: 16 },
      membrane: { mat: BASE.membrane, mode: "rise", w: [2.3, 2.45], lo: level(1) - 1, hi: Hmax },
      frame: { mat: BASE.alu, mode: "rise", w: [2.28, 2.7], lo: FL0 - .05, hi: Hmax },
      door: { mat: BASE.alu, mode: "rise", w: [2.45, 2.8], lo: FL0 - .05, hi: Hmax },
      bronzeTrim: { mat: BASE.bronze, mode: "rise", w: [2.6, 2.85], lo: 0, hi: Hmax },
      glass: { mat: BASE.glass, mode: "fade", w: [2.5, 2.92], cast: false, order: 2 },
      rail: { mat: BASE.railGlass, mode: "fade", w: [2.68, 3.0], cast: false, order: 3 },
      cladP: { mat: null, mode: "down", w: [3.0, 3.58], lo: -.4, hi: Hmax, clad: "P" },
      cladA: { mat: null, mode: "down", w: [3.12, 3.66], lo: -.4, hi: Hmax, clad: "A" },
      deck: { mat: BASE.wood, mode: "rise", w: [3.3, 3.5], lo: 0, hi: Hmax },
      backfill: { mat: BASE.paving, mode: "rise", w: [3.05, 3.42], lo: PD, hi: -.02 },
      room: { mat: () => new THREE.MeshStandardMaterial({ color: "#d8cdbd", roughness: .92, side: THREE.BackSide, emissive: "#ffb36b", emissiveIntensity: 0, envMapIntensity: .5 }), mode: "show", at: 2.45, cast: false },
      intFloor: { mat: BASE.wood, mode: "show", at: 2.45, cast: false },
      intWall: { mat: BASE.plaster, mode: "show", at: 2.45, cast: false },
      intFab: { mat: () => new THREE.MeshStandardMaterial({ color: "#b5a691", roughness: 1 }), mode: "show", at: 2.6, cast: false },
      intDark: { mat: () => new THREE.MeshStandardMaterial({ color: "#2b2522", roughness: .6 }), mode: "show", at: 2.6, cast: false },
      led: { mat: () => new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffd2a0", emissiveIntensity: 0 }), mode: "show", at: 3.4, cast: false },
      fixture: { mat: BASE.bronze, mode: "grow", w: [3.4, 3.7], cast: false },
      planter: { mat: BASE.raw, mode: "grow", w: [3.38, 3.8] },
      leaf: { mat: () => std(null, { color: "#4c6a34", roughness: .9, flatShading: true }), mode: "grow", w: [3.45, 3.95] },
      leafDark: { mat: () => std(null, { color: "#22351f", roughness: .95, flatShading: true }), mode: "grow", w: [3.5, 3.98] },
      trunk: { mat: () => std(null, { color: "#5c4a3a", roughness: 1 }), mode: "grow", w: [3.45, 3.9] }
    };
    const group = new THREE.Group(); group.name = spec.id;
    const parts = [];
    for (const [k, list] of geos) {
      const def = P[k]; if (!def) continue;
      const g = track(merge(list)); list.forEach(x => x.dispose());
      let mat;
      if (def.clad) mat = null;
      else { mat = track(def.mat()); if (["rise", "sweep"].includes(def.mode)) reveal(mat, def.mode === "sweep" ? XAX : UP); }
      const mesh = new THREE.Mesh(g, mat || undefined);
      mesh.castShadow = def.cast !== false; mesh.receiveShadow = def.mode !== "fade";
      if (def.order) mesh.renderOrder = def.order;
      group.add(mesh);
      parts.push({ k, def, mesh, mat, base: mat && mat.opacity, last: -1 });
    }
    /* cladding: one reveal material per scheme × slot, shared by both models */
    const cladMeshes = parts.filter(p => p.def.clad);
    /* uplight washes (additive light cones on the façade) */
    const washGeo = track(new THREE.PlaneGeometry(1, 1).translate(0, .5, 0));
    for (const u of uplights) {
      const m = new THREE.Mesh(washGeo, washMat); m.scale.set(1.1, Math.min(3.1, u.top - .05), 1);
      m.position.set(u.x + u.nx * .015, .02, u.z + u.nz * .015); m.rotation.y = Math.atan2(u.nx, u.nz); m.renderOrder = 4; m.visible = false;
      group.add(m); parts.push({ k: "wash", def: { mode: "wash" }, mesh: m });
    }
    group.visible = false; scene.add(group);
    return { spec, group, parts, cladMeshes, pit: PIT, uplights };
  }

  /* additive façade light wash shared by all uplights */
  const washMat = track(new THREE.ShaderMaterial({
    uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color("#ffb066") } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uI; uniform vec3 uC; varying vec2 vUv;
      void main(){ float w = abs(vUv.x-.5)*2.; float spread = mix(.22,1.,pow(vUv.y,.7)); float a = smoothstep(1.,.0,w/spread) * pow(1.-vUv.y,1.6) * smoothstep(0.,.04,vUv.y);
        gl_FragColor = vec4(uC*uI*a*2.2, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
  }));

  /* cladding materials per façade scheme */
  const cladMats = {};
  for (const [name, s] of Object.entries(SCHEMES)) cladMats[name] = { P: track(reveal(s.P(), DOWN)), A: track(reveal(s.A(), DOWN)) };
  /* overlay copies used for the live façade swap (drawn on top with polygon offset, swept top-down) */
  const swapMats = {};
  for (const [name, s] of Object.entries(SCHEMES)) swapMats[name] = { P: track(reveal(s.P(), DOWN)), A: track(reveal(s.A(), DOWN)) };
  for (const set of Object.values(swapMats)) for (const m of Object.values(set)) Object.assign(m, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });

  /* ------------------------------------------------------------ the two procedural houses */
  const open = (a, b, sill, head, kind) => ({ a, b, sill, head, kind });
  const H = F - SLAB;
  const MODELS = {
    villa: {
      id: "villa", area: 180,
      vols: [
        { x0: -8, x1: 6, z0: -3, z1: 5, lv: 0, clad: "P", open: { S: [open(1.0, 9.2, 0, 2.75), open(10.4, 12.8, .9, 2.75)], W: [open(3.2, 4.4, 0, 2.55, "door"), open(5.6, 7.2, .9, 2.6)], E: [open(1.4, 6.6, 0, 2.75)], N: [open(1.0, 3.2, 1.6, 2.6), open(4.4, 5.6, 1.6, 2.6)] } },
        { x0: 2, x1: 10, z0: -8.5, z1: -3, lv: 0, clad: "A", skip: ["S"], open: { E: [open(1.2, 4.3, .6, 2.6)], N: [open(1.5, 3.5, 1.4, 2.6), open(5, 7, 1.4, 2.6)], W: [open(2, 3.5, 1.4, 2.6)] } }
      ],
      roofs: [{ x0: -8, x1: 6, z0: -3, z1: 5, lv: 0, over: { S: 2.0, N: .5, E: 1.2, W: .6 } }, { x0: 2, x1: 10, z0: -8.5, z1: -3, lv: 0, drop: .3, over: { S: 0, N: .5, E: .5, W: .5 } }],
      interior: [
        ["intWall", .12, H, 4.2, -1.6, 0, -.9], ["intWall", 3.6, H, .12, 4.2, 0, -.2],
        ["intFab", 2.6, .42, .95, -4.2, 0, 2.6], ["intFab", .95, .42, 1.9, -2.6, 0, 2.2], ["intDark", 1.1, .3, .7, -4.0, 0, 3.6],
        ["intDark", 2.0, .76, .95, 1.2, 0, 2.2], ["intWall", 2.6, .92, .9, 1.4, 0, -1.6], ["intFab", 1.7, .5, 2.1, 6.2, 0, -6.4]
      ],
      land: [
        { t: "hedge", x: -14, z: 21.5, w: 7, h: 1.0, d: .9 }, { t: "hedge", x: 11, z: 21.5, w: 11, h: 1.0, d: .9 },
        { t: "planter", x: -10.6, z: 1.6, w: 1.2, d: 2.6 }, { t: "planter", x: -10.6, z: 6.4, w: 1.2, d: 1.2 },
        { t: "tree", x: 15.5, z: 1.5, h: 5.2, r: 1.5 }, { t: "tree", x: -15, z: 10, h: 4.6, r: 1.3 }, { t: "tree", x: 14.5, z: -5, h: 5.8, r: 1.7 },
        { t: "cypress", x: -16, z: -12, h: 7, r: .8 }, { t: "cypress", x: -12.5, z: -13, h: 6.2, r: .75 }, { t: "cypress", x: 16, z: -12.5, h: 7.4, r: .85 }
      ],
      drive: { x0: -12.2, x1: -9.2 },
      cutY: 2.2,
      keys: [[24, 9.5, 30, 0, 1.2, 0], [12, 5.8, 13.5, 0, -.6, 0], [-16, 6.4, 13, 0, 1.7, -1], [-5, 18.5, 18, 0, 1.6, -1.2], [14.5, 2.7, 19.5, -.6, 1.75, 0]],
      presets: { front: [14.5, 2.8, 19.5, -.6, 1.75, 0], terrace: [8.6, 1.9, 11.2, -2.4, 1.5, 3.4], aerial: [17, 24, 20, 0, 0, -1], cutaway: [11, 19, 15, 0, 0, -1] },
      hotspots: [
        { id: "seismic", p: [6.05, 2.95, 5.05], n: [.7, 0, .7] },
        { id: "thermal", p: [9.2, 2.0, -5.2], n: [1, 0, .2] },
        { id: "glazing", p: [-2.5, 1.5, 5.08], n: [0, 0, 1] },
        { id: "turnkey", p: [-8.3, 1.3, .8], n: [-.8, 0, .6] }
      ],
      warm: [[-2, 1.2, 7.2], [6.5, 1.0, -1.5]]
    },
    residence: {
      id: "residence", area: 300,
      vols: [
        { x0: -6, x1: 6, z0: -4, z1: 5, lv: 0, clad: "A", open: { S: [open(.8, 6.2, 0, 2.75), open(7.2, 8.4, 0, 2.55, "door"), open(9.3, 11.2, .9, 2.75)], W: [open(2, 7, 0, 2.75)], E: [open(5.5, 8, .9, 2.6)], N: [open(2, 4, 1.4, 2.6), open(6, 10, 0, 2.75)] } },
        { x0: 6, x1: 11, z0: -4, z1: 2.5, lv: 0, clad: "P", skip: ["W"], room: false, uplights: false, open: { S: [open(.6, 4.4, 0, 2.5, "door")] } },
        { x0: -8, x1: 4.5, z0: -4.5, z1: 5.5, lv: 1, clad: "P", open: { S: [open(1, 5.5, 0, 2.7), open(7, 11.5, .9, 2.7)], W: [open(2, 8, .9, 2.4)], E: [open(3, 8, 0, 2.7)], N: [open(2, 5, 1.2, 2.6), open(7, 10, 1.2, 2.6)] } }
      ],
      slabs: [
        { x0: -8, x1: 6, z0: -4.5, z1: 5.5, lv: 1, deck: false, rails: [] },
        { x0: 6, x1: 11, z0: -4, z1: 2.5, lv: 1, deck: true, rails: ["S", "E", "N"] },
        { x0: -6.5, x1: 0, z0: 5.5, z1: 7.2, lv: 1, deck: true, rails: ["S", "W", "E"] }
      ],
      roofs: [{ x0: -8, x1: 4.5, z0: -4.5, z1: 5.5, lv: 1, over: { S: 1.6, N: .5, E: .5, W: .5 } }],
      interior: [
        ["intWall", .12, H, 5, 1.5, 0, -1.4], ["intFab", 2.8, .42, .95, -3.6, 0, 2.8], ["intFab", .95, .42, 2, -1.8, 0, 2.4],
        ["intDark", 1.2, .3, .7, -3.4, 0, 3.9], ["intDark", 2.2, .76, 1, 3.4, 0, 2.4], ["intWall", 2.8, .92, .9, 3.6, 0, -2.6],
        ["intFab", 1.8, .5, 2.1, -5.5, 0, -1.8, 1], ["intWall", .12, H, 9, -2, 0, .5, 1]
      ],
      land: [
        { t: "hedge", x: -13.5, z: 21.5, w: 8, h: 1.0, d: .9 }, { t: "hedge", x: 3, z: 21.5, w: 9, h: 1.0, d: .9 },
        { t: "planter", x: -8.2, z: 7.4, w: 2.6, d: 1.0 }, { t: "planter", x: 2.6, z: 7.2, w: 1.0, d: 1.0 },
        { t: "tree", x: -13, z: 9, h: 5.2, r: 1.5 }, { t: "tree", x: 14.5, z: 10, h: 4.8, r: 1.35 }, { t: "tree", x: -14.5, z: -6, h: 6, r: 1.7 },
        { t: "cypress", x: -16, z: -12, h: 7.4, r: .85 }, { t: "cypress", x: -12.5, z: -13, h: 6.4, r: .75 }, { t: "cypress", x: 16, z: -12.5, h: 7.8, r: .85 }
      ],
      drive: { x0: 6.6, x1: 10.4 },
      cutY: 2.4,
      keys: [[26, 11, 32, 0, 2.2, 0], [13, 6.5, 15, 0, -.5, 0], [-17.5, 7.5, 15, 0, 3.0, 0], [-6, 21, 21, 0, 3.6, 0], [16, 3.4, 23, -.6, 3.1, 0]],
      presets: { front: [16, 3.4, 23, -.6, 3.1, 0], terrace: [19, 8.6, 11, 6.5, 3.6, -1], aerial: [20, 28, 23, 0, 0, 0], cutaway: [12, 22, 16, 0, 0, .5] },
      hotspots: [
        { id: "seismic", p: [6.05, 2.9, 5.05], n: [.7, 0, .7] },
        { id: "thermal", p: [-2.0, 5.0, 5.75], n: [0, 0, 1] },
        { id: "glazing", p: [-2.5, 1.5, 5.08], n: [0, 0, 1] },
        { id: "turnkey", p: [1.8, 1.25, 5.1], n: [.2, 0, 1] }
      ],
      warm: [[-1, 1.1, 7.8], [2.5, 4.3, 8.6]]
    }
  };

  /* ------------------------------------------------------------ site (shared) */
  const site = new THREE.Group(); scene.add(site);
  const siteMats = { grass: track(std("grass", { color: "#b9c79b", roughness: 1, envMapIntensity: .7 })), paving: track(BASE.paving()), stone: track(BASE.stone()), asphalt: track(std("concrete", { color: "#3d3e41", roughness: 1, envMapIntensity: .5 })), mountain: track(new THREE.MeshStandardMaterial({ color: "#59606a", roughness: 1, flatShading: true, envMapIntensity: .6 })), leafDark: track(std(null, { color: "#273a22", roughness: .95, flatShading: true })), trunk: track(std(null, { color: "#5c4a3a", roughness: 1 })) };
  let ground = null;
  function buildGround(pit, drive) {
    if (ground) { site.remove(ground.group); ground.geos.forEach(g => g.dispose()); }
    const grp = new THREE.Group(), geos = [];
    const sh = new THREE.Shape(); const R = 420; sh.moveTo(-R, -R); sh.lineTo(R, -R); sh.lineTo(R, R); sh.lineTo(-R, R); sh.lineTo(-R, -R);
    const hole = new THREE.Path(); hole.moveTo(pit.x0, -pit.z0); hole.lineTo(pit.x0, -pit.z1); hole.lineTo(pit.x1, -pit.z1); hole.lineTo(pit.x1, -pit.z0); hole.lineTo(pit.x0, -pit.z0);
    sh.holes.push(hole);
    const gg = new THREE.ShapeGeometry(sh); gg.rotateX(-Math.PI / 2);
    const p = gg.attributes.position, uv = gg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), p.getZ(i));
    geos.push(gg); const gm = new THREE.Mesh(gg, siteMats.grass); gm.receiveShadow = true; grp.add(gm);
    const pave = [geoBox(drive.x1 - drive.x0, .03, 26.5 - pit.z1, (drive.x0 + drive.x1) / 2, 0, (pit.z1 + 26.5) / 2), geoBox(1.4, .03, 26.5 - pit.z1, (drive.x0 > 0 ? -2 : 2), 0, (pit.z1 + 26.5) / 2), geoBox(900, .02, 2, 0, 0, 27.5)];
    const pm = merge(pave); pave.forEach(g => g.dispose()); geos.push(pm); const pmesh = new THREE.Mesh(pm, siteMats.paving); pmesh.receiveShadow = true; grp.add(pmesh);
    const ag = geoBox(900, .02, 7, 0, 0, 32); geos.push(ag); const am = new THREE.Mesh(ag, siteMats.asphalt); am.receiveShadow = true; grp.add(am);
    /* low natural-stone boundary wall with a gap for the drive and the path */
    const w = [geoBox(.4, .9, 40, -18, 0, 4), geoBox(.4, .9, 40, 18, 0, 4), geoBox(36.4, .9, .4, 0, 0, -16)];
    const gaps = [[drive.x0 - .3, drive.x1 + .3], [(drive.x0 > 0 ? -2 : 2) - 1, (drive.x0 > 0 ? -2 : 2) + 1]].sort((a, b) => a[0] - b[0]);
    let cx = -18; for (const [a, b] of gaps) { if (a > cx) w.push(geoBox(a - cx, .9, .4, (a + cx) / 2, 0, 24)); cx = b; } w.push(geoBox(18 - cx, .9, .4, (18 + cx) / 2, 0, 24));
    const wm = merge(w); w.forEach(g => g.dispose()); geos.push(wm); const wmesh = new THREE.Mesh(wm, siteMats.stone); wmesh.castShadow = wmesh.receiveShadow = true; grp.add(wmesh);
    site.add(grp); ground = { group: grp, geos };
    markShadow();
  }
  /* Šar mountains on the horizon + neighbouring cypresses (static) */
  {
    const mg = new THREE.CylinderGeometry(260, 300, 1, 160, 1, true), p = mg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), west = Math.max(0, -Math.cos(a - .35));
      if (p.getY(i) > 0) p.setY(i, 6 + west * 46 + (Math.sin(a * 7) * .5 + .5) * 12 + (Math.sin(a * 23 + 1.3) * .5 + .5) * 7 + Math.sin(a * 61) * 2.5);
      else p.setY(i, -2);
    }
    mg.computeVertexNormals(); track(mg);
    site.add(new THREE.Mesh(mg, siteMats.mountain));
    const trees = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + rnd() * .2, r = 34 + rnd() * 30; if (Math.sin(a) > .55) continue;
      const x = Math.cos(a) * r, z = Math.sin(a) * r, h = 6 + rnd() * 5;
      trees.push(planarUV(new THREE.ConeGeometry(.9 + rnd() * .5, h, 9).translate(x, h / 2 + .3, z)));
    }
    const tg = track(merge(trees)); trees.forEach(g => g.dispose());
    const tm = new THREE.Mesh(tg, siteMats.leafDark); tm.castShadow = true; site.add(tm);
  }

  /* ------------------------------------------------------------ atmospheric light motes */
  let motes = null;
  if (!reduce) {
    const N = MOBILE ? 220 : 650, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - .5) * 34; pos[i * 3 + 1] = .2 + rnd() * 10; pos[i * 3 + 2] = -12 + rnd() * 30; seed[i] = rnd(); }
    const g = track(new THREE.BufferGeometry()); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = track(new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: MOBILE ? 2.6 : 2.2 }, uPR: { value: PR }, uO: { value: .5 }, uC: { value: new THREE.Color("#ffe2b8") } },
      vertexShader: `attribute float aSeed; uniform float uTime,uSize,uPR; varying float vA;
        void main(){ vec3 p = position; float t = uTime*.16 + aSeed*31.4;
          p += vec3(sin(t*.7)*.9, sin(t*.53+aSeed*9.)*.6 + fract(uTime*.012*(.4+aSeed))*1.6, cos(t*.61)*.9);
          vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv;
          gl_PointSize = uSize*uPR*(.6+aSeed*1.4)*(22./-mv.z); vA = (.35+.65*fract(aSeed*7.13)) * (.55+.45*sin(uTime*.8+aSeed*40.)); }`,
      fragmentShader: `uniform float uO; uniform vec3 uC; varying float vA;
        void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.0,d); a *= a; gl_FragColor = vec4(uC*a*vA*uO, 1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    motes = new THREE.Points(g, m); motes.frustumCulled = false; motes.renderOrder = 5; scene.add(motes);
  }

  /* ------------------------------------------------------------ post-processing */
  let composer = null, bloom = null, grain = null;
  const usePost = !MOBILE;
  if (usePost) {
    const rt = new THREE.WebGLRenderTarget(innerWidth * PR, innerHeight * PR, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(PR); composer.setSize(innerWidth, innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.4, 0.85);
    composer.addPass(bloom);
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uAmt: { value: .32 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmt; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tDiffuse,vUv); vec2 q = vUv-.5; float v = 1. - uAmt*smoothstep(.18,.82,dot(q,q)*2.2); gl_FragColor = vec4(c.rgb*v, c.a); }`
    }));
    composer.addPass(new OutputPass());
    grain = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmt: { value: .04 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime,uAmt; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime*7.13) * 43758.5453); }
        void main(){ vec4 c = texture2D(tDiffuse,vUv); float n = h(gl_FragCoord.xy + fract(uTime)*100.) - .5; gl_FragColor = vec4(c.rgb + n*uAmt, c.a); }`
    });
    composer.addPass(grain);
  } else document.body.classList.add("gl-lite");      // CSS vignette instead of the shader chain

  /* ------------------------------------------------------------ controls */
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: .075, enableZoom: false, enablePan: false, rotateSpeed: .55, minDistance: 8, maxDistance: 55, maxPolarAngle: Math.PI / 2 - .07, minPolarAngle: .12, enabled: false });
  canvas.style.touchAction = "pan-y";                 // never block page scrolling until the visitor opts in to 3D

  /* ------------------------------------------------------------ state */
  const S = {
    p: 0, stageT: 0, stage: 0, dusk: 0, duskT: 0, glow: 0,
    mode: "story", model: null, modelId: SITE.defaultModel || "residence", facade: "plaster",
    xStage: 4, xDusk: true, hotspots: true, engaged: false, cut: 60, cutT: 60,
    parX: 0, parY: 0, parTX: 0, parTY: 0, film: 0, filmT: 0,
    flight: null, pendingModel: null, swap: null, visible: true
  };
  const built = {};
  const getModel = id => built[id] || (built[id] = buildModel(MODELS[id]));
  function useModel(id) {
    if (S.model) S.model.group.visible = false;
    S.model = getModel(id); S.model.group.visible = true; S.modelId = id;
    applyClad(S.model, S.facade);
    buildGround(S.model.pit, S.model.spec.drive);
    curve = makeCurves(S.model.spec.keys);
    S.model.spec.warm && (warm1.position.set(...S.model.spec.warm[0]), warm2.position.set(...S.model.spec.warm[1]));
    hotspotDefs = S.model.spec.hotspots.map(h => ({ ...h, v: new THREE.Vector3(...h.p), n: new THREE.Vector3(...h.n).normalize(), o: -1, x: -1, y: -1 }));
    markShadow();
    document.querySelectorAll("[data-x-model]").forEach(b => b.setAttribute("aria-pressed", b.dataset.xModel === id));
  }
  function applyClad(model, scheme) { for (const p of model.cladMeshes) { p.mesh.material = cladMats[scheme][p.def.clad]; p.mat = p.mesh.material; } S.force = true; }

  /* camera spline through the five story keyframes (position + look-at) */
  let curve = null;
  function makeCurves(keys) {
    const portrait = innerWidth / innerHeight < 1, k = portrait ? 1.42 : 1;
    const pos = keys.map(a => new THREE.Vector3(a[3] + (a[0] - a[3]) * k, a[4] + (a[1] - a[4]) * k, a[5] + (a[2] - a[5]) * k));
    const look = keys.map(a => new THREE.Vector3(a[3], a[4], a[5]));
    return { pos: new THREE.CatmullRomCurve3(pos, false, "centripetal"), look: new THREE.CatmullRomCurve3(look, false, "centripetal") };
  }
  let hotspotDefs = [];

  useModel(S.modelId);

  /* ------------------------------------------------------------ story scroll */
  const P0 = .07;
  const chapters = [...story.querySelectorAll(".chapter")];
  const phaseBtns = [...document.querySelectorAll("[data-go]")];
  const bar = story.querySelector(".phase-bar i");
  let chapter = -2;
  function storyStage(p) {
    const x = clamp01((p - P0) / (1 - P0 - .04)) * 4, i = Math.min(3, Math.floor(x)), f = x - i;
    return { stage: i + sstep(0, .7, f), ch: p < P0 * .7 ? -1 : Math.min(3, Math.floor(x)) };
  }
  function setChapter(ch) {
    if (ch === chapter) return; chapter = ch;
    story.classList.toggle("is-hero", ch < 0);
    chapters.forEach((c, i) => {
      const on = i === ch; c.classList.toggle("on", on); c.setAttribute("aria-hidden", !on);
      window.gsap.to(c, { autoAlpha: on ? 1 : 0, y: on ? 0 : (i < ch ? -28 : 28), duration: on ? 1.05 : .55, delay: on ? .18 : 0, ease: on ? "expo.out" : "power2.in", overwrite: true });
    });
    const hero = story.querySelector(".hero-copy");
    if (hero) window.gsap.to(hero, { autoAlpha: ch < 0 ? 1 : 0, y: ch < 0 ? 0 : -36, duration: ch < 0 ? 1 : .6, ease: ch < 0 ? "expo.out" : "power2.in", overwrite: true });
    phaseBtns.forEach((b, i) => { b.classList.toggle("on", i === ch); b.classList.toggle("done", i < ch); b.setAttribute("aria-current", i === ch ? "step" : "false"); });
  }
  const storyST = window.ScrollTrigger ? window.ScrollTrigger.create({ trigger: story, start: "top top", end: "bottom bottom", onUpdate: st => { S.p = st.progress; } }) : null;
  /* phase scrubber in the HUD: jump to any stage */
  phaseBtns.forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.go, p = P0 + ((i + .78) / 4) * (1 - P0 - .04);
    const y = story.offsetTop + p * (story.offsetHeight - innerHeight);
    LP.scrollTo ? LP.scrollTo(y, { duration: reduce ? 0 : 2.2 }) : scrollTo(0, y);
  }));
  /* explore mode once the explore section reaches the upper third of the screen */
  let exploreTop = 0, exploreH = 0;
  const measure = () => { exploreTop = explore ? explore.offsetTop : 1e9; exploreH = explore ? explore.offsetHeight : 0; };
  measure();
  addEventListener("resize", measure);
  if (window.ScrollTrigger) window.ScrollTrigger.addEventListener("refresh", () => { measure(); curve = makeCurves(S.model.spec.keys); });

  function setMode(m) {
    if (m === S.mode) return; S.mode = m;
    document.body.classList.toggle("x-mode", m === "explore");
    if (m === "explore") {
      look.copy(lookCur); controls.target.copy(lookCur); camera.position.copy(basePos);
      flyTo(S.view || "front");
      syncUI();
    } else {
      S.engaged && engage(false);
      basePos.copy(camera.position); lookCur.copy(controls.target);
      S.cutT = 60;
    }
    controls.enabled = m === "explore" && (!coarse || S.engaged);
  }

  /* ------------------------------------------------------------ explore UI */
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const range = q("#x-stage"), rangeOut = q("#x-stage-out");
  const PHASE_KEYS = ["ph1_k", "ph2_k", "ph3_k", "ph4_k"];
  const tr = k => { const D = window.I18N || {}, l = document.documentElement.lang || "sq"; return (D[l] && D[l][k]) || (D.sq && D.sq[k]) || k; };
  function syncUI() {
    qa("[data-x-light]").forEach(b => b.setAttribute("aria-pressed", (b.dataset.xLight === "dusk") === S.xDusk));
    qa("[data-x-facade]").forEach(b => b.setAttribute("aria-pressed", b.dataset.xFacade === S.facade));
    qa("[data-x-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.xView === S.view));
    qa("[data-x-model]").forEach(b => b.setAttribute("aria-pressed", b.dataset.xModel === (S.pendingModel || S.modelId)));
    const hb = q("[data-x-hotspots]"); if (hb) hb.setAttribute("aria-pressed", S.hotspots);
    if (range) { range.value = S.xStage; const i = Math.min(3, Math.floor(S.xStage - .001 < 0 ? 0 : S.xStage - .001)); if (rangeOut) rangeOut.textContent = `0${i + 1} · ${tr(PHASE_KEYS[i])}`; range.setAttribute("aria-valuetext", rangeOut ? rangeOut.textContent : ""); }
    document.body.classList.toggle("hs-off", !S.hotspots);
  }
  document.addEventListener("lp:lang", syncUI);
  const live = q("#x-live");
  const announce = k => { if (live) live.textContent = tr(k); };
  qa("[data-x-light]").forEach(b => b.addEventListener("click", () => { S.xDusk = b.dataset.xLight === "dusk"; syncUI(); announce(S.xDusk ? "x_dusk" : "x_day"); requestStill(); }));
  qa("[data-x-facade]").forEach(b => b.addEventListener("click", () => { setFacade(b.dataset.xFacade); syncUI(); }));
  qa("[data-x-view]").forEach(b => b.addEventListener("click", () => { flyTo(b.dataset.xView); syncUI(); }));
  qa("[data-x-model]").forEach(b => b.addEventListener("click", () => { switchModel(b.dataset.xModel); syncUI(); }));
  const hsBtn = q("[data-x-hotspots]"); if (hsBtn) hsBtn.addEventListener("click", () => { S.hotspots = !S.hotspots; closeCard(); syncUI(); });
  if (range) range.addEventListener("input", () => { S.xStage = +range.value; syncUI(); requestStill(); });
  const engageBtn = q(".x-engage"), doneBtn = q(".x-done");
  function engage(on) {
    S.engaged = on; document.body.classList.toggle("x-engaged", on);
    canvas.style.touchAction = on ? "none" : "pan-y";
    controls.enabled = S.mode === "explore" && (!coarse || on);
    if (on) { LP.stopScroll && LP.stopScroll(); doneBtn && doneBtn.focus({ preventScroll: true }); }
    else { LP.startScroll && LP.startScroll(); }
  }
  engageBtn && engageBtn.addEventListener("click", () => engage(true));
  doneBtn && doneBtn.addEventListener("click", () => { engage(false); engageBtn && engageBtn.focus({ preventScroll: true }); });
  addEventListener("keydown", e => { if (e.key === "Escape") { if (S.engaged) engage(false); closeCard(); } });

  const look = new THREE.Vector3(), lookCur = new THREE.Vector3(0, 1.5, 0), basePos = camera.position.clone();
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  function flyTo(name) {
    const p = S.model.spec.presets[name] || S.model.spec.presets.front, k = innerWidth / innerHeight < 1 ? 1.35 : 1;
    S.view = name;
    /* portrait: aim below the house so it sits in the upper half, clear of the control sheet */
    const dy = innerWidth / innerHeight < 1 ? -2.6 : 0;
    S.flight = { pos: new THREE.Vector3(p[3] + (p[0] - p[3]) * k, p[4] + (p[1] - p[4]) * k + dy, p[5] + (p[2] - p[5]) * k), look: new THREE.Vector3(p[3], p[4] + dy, p[5]) };
    S.cutT = name === "cutaway" ? S.model.spec.cutY : 60;
    if (reduce) { camera.position.copy(S.flight.pos); controls.target.copy(S.flight.look); S.cut = S.cutT; S.flight = null; controls.update(); requestStill(); }
  }
  controls.addEventListener("start", () => { S.flight = null; closeCard(); });
  controls.addEventListener("change", () => { if (reduce) requestStill(); });

  function setFacade(name) {
    if (!cladMats[name] || name === S.facade) return;
    const prev = S.facade; S.facade = name; announce("x_f_" + name);
    const m = S.model;
    if (reduce || S.stage < 3.05) { applyClad(m, name); requestStill(); return; }
    /* live re-cladding: overlay copies sweep top-down over the old finish */
    if (S.swap) finishSwap();
    const overlays = m.cladMeshes.map(p => { const o = new THREE.Mesh(p.mesh.geometry, swapMats[name][p.def.clad]); o.castShadow = false; o.receiveShadow = true; m.group.add(o); return o; });
    const lo = -.4, hi = m.parts.find(p => p.k === "cladP").def.hi;
    S.swap = { overlays, name, prev, k: 0, lo, hi };
    window.gsap.to(S.swap, { k: 1, duration: 1.9, ease: "power2.inOut", onComplete: finishSwap });
  }
  function finishSwap() {
    const sw = S.swap; if (!sw) return; S.swap = null;
    window.gsap.killTweensOf(sw);
    sw.overlays.forEach(o => o.parent && o.parent.remove(o));
    for (const m of Object.values(built)) applyClad(m, S.facade);
    markShadow();
  }
  function switchModel(id) {
    if (!MODELS[id] || id === S.modelId || S.pendingModel) return;
    announce(id === "villa" ? "x_villa" : id === "residence" ? "x_res" : "x_glb");
    if (reduce) { useModel(id); flyTo(S.view || "front"); requestStill(); return; }
    /* un-build to the slab, swap, and build the new house back up */
    S.pendingModel = id; S.rebuildTo = S.xStage; S.xStage = .55;
  }

  /* ------------------------------------------------------------ hotspots */
  const hsLayer = q(".hotspots");
  const hsEls = {}; qa(".hs").forEach(el => { hsEls[el.dataset.hs] = el; });
  const card = q(".hs-card");
  let cardFor = null;
  function closeCard() { if (!card || !cardFor) return; card.classList.remove("open"); hsEls[cardFor] && hsEls[cardFor].setAttribute("aria-expanded", "false"); cardFor = null; }
  qa(".hs").forEach(el => el.addEventListener("click", () => {
    const id = el.dataset.hs;
    if (cardFor === id) return closeCard();
    closeCard(); cardFor = id; el.setAttribute("aria-expanded", "true");
    if (card) {
      card.querySelector(".hs-t").dataset.i18n = `hs_${id}_t`; card.querySelector(".hs-t").textContent = tr(`hs_${id}_t`);
      card.querySelector(".hs-d").dataset.i18n = `hs_${id}_d`; card.querySelector(".hs-d").textContent = tr(`hs_${id}_d`);
      card.querySelector(".hs-n").textContent = el.querySelector(".hs-dot").textContent;
      card.classList.add("open");
    }
  }));
  card && card.querySelector(".hs-close") && card.querySelector(".hs-close").addEventListener("click", closeCard);

  function updateHotspots(dt) {
    if (!hsLayer) return;
    const show = S.mode === "explore" && S.hotspots && S.stage > 3.6 && S.cut > 30;
    const W = innerWidth, Hh = innerHeight, rel = exploreTop - window.scrollY;
    camera.getWorldPosition(_w);
    for (const h of hotspotDefs) {
      const el = hsEls[h.id]; if (!el) continue;
      const facing = h.n.dot(_v.copy(_w).sub(h.v).normalize());
      _v.copy(h.v).project(camera);
      const onScreen = _v.z < 1 && Math.abs(_v.x) < 1.05 && Math.abs(_v.y) < 1.05;
      const target = show && onScreen ? sstep(-.05, .3, facing) : 0;
      h.o = h.o < 0 ? target : lerp(h.o, target, kdt(DAMP.ui, dt));
      const x = (_v.x * .5 + .5) * W, y = (-_v.y * .5 + .5) * Hh - rel;
      if (Math.abs(x - h.x) > .2 || Math.abs(y - h.y) > .2) { h.x = x; h.y = y; el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; }
      const o = h.o < .01 ? 0 : h.o; el.style.opacity = o.toFixed(3); el.style.visibility = o > .02 ? "visible" : "hidden";
      if (cardFor === h.id && card) { card.style.transform = `translate3d(${Math.min(W - 340, x + 26).toFixed(1)}px,${(y - 20).toFixed(1)}px,0)`; if (o < .05) closeCard(); }
    }
  }

  /* ------------------------------------------------------------ pointer parallax (story only) */
  if (!coarse && !reduce) addEventListener("pointermove", e => { S.parTX = (e.clientX / innerWidth - .5) * 2; S.parTY = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  const PAR = THREE.MathUtils.degToRad(7);

  /* ------------------------------------------------------------ visibility: pause when off-screen */
  let onScreen = true;
  const vis = new Set();
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target))); onScreen = vis.size > 0; canvas.classList.toggle("off", !onScreen); }, { rootMargin: "0px" });
    [story, explore].filter(Boolean).forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------ resize */
  let lastW = innerWidth, lastH = innerHeight;
  function resize(force) {
    const w = innerWidth, h = innerHeight;
    if (!force && w === lastW && Math.abs(h - lastH) < 120) return;     // ignore mobile URL-bar jitter
    lastW = w; lastH = h;
    camera.aspect = w / h; camera.fov = w < 768 ? 44 : w / h < 1 ? 42 : 34; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (composer) { composer.setSize(w, h); bloom.resolution.set(w, h); }
    curve = makeCurves(S.model.spec.keys);
    requestStill();
  }
  addEventListener("resize", () => resize(false));

  /* ------------------------------------------------------------ per-frame update */
  const keyCol = new THREE.Color(), rimCol = new THREE.Color(), fogCol = new THREE.Color();
  let firstFrame = true, lastStageApplied = -1, time = 0;

  function applyStage(model, stage, dusk, glow, dt) {
    for (const part of model.parts) {
      const d = part.def;
      if (d.mode === "static") continue;
      if (d.mode === "show") { part.mesh.visible = stage >= d.at; continue; }
      if (d.mode === "wash") { part.mesh.visible = glow > .01; continue; }
      const k = sstep(d.w[0], d.w[1], stage);
      if (d.mode === "fade") { part.mesh.visible = k > .002; part.mat.opacity = part.base * k; continue; }
      if (d.mode === "grow") { part.mesh.visible = k > .002; part.mesh.scale.y = Math.max(.001, 1 - Math.pow(1 - k, 3)); continue; }
      const amt = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 1.1 : 0;
      part.mesh.visible = k > .001;
      if (k >= 1) { part.mat.userData.edge(1e4, 0); continue; }      // complete: clipping off (no coplanar flicker)
      if (d.mode === "rise" || d.mode === "sweep") part.mat.userData.edge(lerp(d.lo, d.hi, k), amt);
      else if (d.mode === "down") part.mat.userData.edge(-lerp(d.hi, d.lo, k), amt);   // visible y >= edge
    }
    /* interior glow, LEDs, façade washes */
    for (const part of model.parts) {
      if (part.k === "room") part.mat.emissiveIntensity = glow * 1.7;
      if (part.k === "led") part.mat.emissiveIntensity = glow * 5;
    }
  }

  function frame(t, dtMs) {
    if (!onScreen && !firstFrame) return;
    const dt = Math.min(.05, (dtMs || 16.7) / 1000);
    time += dt;
    const vh = innerHeight, y = window.scrollY;
    setMode(y >= exploreTop - vh * .38 && explore ? "explore" : "story");

    /* ---- targets */
    if (S.mode === "story") {
      const st = storyStage(S.p); S.stageT = st.stage; setChapter(st.ch);
      S.duskT = sstep(3.05, 3.85, S.stageT);
      S.xDusk = S.duskT > .5;
    } else {
      S.stageT = S.xStage;
      S.duskT = S.xDusk ? 1 : 0;
    }
    /* model swap: wait until the old house is back down to the slab */
    if (S.pendingModel && S.stage < .75) {
      useModel(S.pendingModel); S.pendingModel = null; S.xStage = S.rebuildTo || 4; S.stage = .6; S.flight && flyTo(S.view); syncUI();
    }

    /* ---- damp everything */
    const stagePrev = S.stage;
    S.stage = lerp(S.stage, S.stageT, kdt(S.mode === "story" ? DAMP.scroll : (S.pendingModel ? .05 : DAMP.stage), dt));
    if (Math.abs(S.stage - S.stageT) < 1e-4) S.stage = S.stageT;
    S.dusk = lerp(S.dusk, S.duskT, kdt(DAMP.light * .55, dt));
    const glowT = S.dusk * sstep(3.35, 3.9, S.stage);
    S.glow = lerp(S.glow, glowT, kdt(DAMP.light, dt));
    S.cut = lerp(S.cut, S.cutT, kdt(DAMP.cam, dt));

    /* ---- build stage → parts */
    if (Math.abs(S.stage - lastStageApplied) > 1e-5 || firstFrame || S.force) { S.force = false; applyStage(S.model, S.stage, S.dusk, S.glow, dt); lastStageApplied = S.stage; shadowDirty = true; }
    for (const part of S.model.parts) {
      if (part.k === "room") part.mat.emissiveIntensity = S.glow * 1.7;
      else if (part.k === "led") part.mat.emissiveIntensity = S.glow * 5;
      else if (part.k === "wash") part.mesh.visible = S.glow > .01;
    }
    washMat.uniforms.uI.value = S.glow;
    if (S.swap) {
      const e = lerp(S.swap.hi, S.swap.lo, S.swap.k), amt = Math.sin(S.swap.k * Math.PI) * 1.1;
      for (const set of [swapMats[S.swap.name]]) { set.P.userData.edge(-e, amt); set.A.userData.edge(-e, amt); }
      shadowDirty = true;
    }

    /* ---- light + atmosphere (day ↔ dusk) */
    const d = S.dusk;
    _v.copy(sunDay).lerp(sunDusk, sstep(0, 1, d)).normalize();
    key.position.copy(_v).multiplyScalar(60); key.target.position.set(0, 0, 0);
    key.intensity = lerp(3.1, 1.15, d); key.color.copy(keyCol.copy(KEY_DAY).lerp(KEY_DUSK, d));
    rim.intensity = lerp(.55, .9, d); rim.color.copy(rimCol.copy(RIM_DAY).lerp(RIM_DUSK, d));
    warm1.intensity = warm2.intensity = S.glow * 26;
    fogCol.copy(fogDayC).lerp(fogDuskC, d); scene.fog.color.copy(fogCol);
    skyMat.uniforms.mixv.value = d; skyMat.uniforms.fogC.value.copy(fogCol);
    skyMat.uniforms.groundC.value.set("#4e4a43").lerp(new THREE.Color("#17171b"), d);
    if (hdrReady) {
      if (envQueue.length) bakeEnv(envQueue.shift());
      const want = Math.round(d * (ENV_LEVELS - 1));
      let best = -1, bd = 1e9; for (let i = 0; i < ENV_LEVELS; i++) if (envTex[i] && Math.abs(i - want) < bd) { bd = Math.abs(i - want); best = i; }
      if (best >= 0 && best !== envIdx) { envIdx = best; scene.environment = envTex[best]; }
    }
    if (Math.abs(d - S.duskT) > 1e-4) shadowDirty = true;
    if (motes) { motes.material.uniforms.uTime.value = time; motes.material.uniforms.uO.value = lerp(.42, .85, d) * (S.mode === "explore" ? .7 : 1) * lerp(.7, 1, sstep(3.3, 4, S.stage)); }

    /* ---- camera */
    if (S.mode === "story") {
      const u = clamp01(S.stage / 4);
      const pT = curve.pos.getPoint(u), lT = curve.look.getPoint(u);
      basePos.lerp(pT, kdt(DAMP.cam, dt)); lookCur.lerp(lT, kdt(DAMP.look, dt));
      S.parX = lerp(S.parX, S.parTX, kdt(DAMP.pointer, dt)); S.parY = lerp(S.parY, S.parTY, kdt(DAMP.pointer, dt));
      /* rotate the camera around the look-at point: max ±7° yaw / pitch */
      _v.copy(basePos).sub(lookCur);
      _v.applyAxisAngle(UP, -S.parX * PAR);
      _w.crossVectors(_v, UP).normalize(); _v.applyAxisAngle(_w, -S.parY * PAR * .55);
      camera.position.copy(lookCur).add(_v);
      if (camera.position.y < .6) camera.position.y = .6;
      camera.lookAt(lookCur);
    } else {
      if (S.flight) {
        camera.position.lerp(S.flight.pos, kdt(DAMP.cam, dt)); controls.target.lerp(S.flight.look, kdt(DAMP.look, dt));
        if (camera.position.distanceTo(S.flight.pos) < .02 && controls.target.distanceTo(S.flight.look) < .02) S.flight = null;
      }
      controls.update();
      if (camera.position.y < .6) camera.position.y = .6;   // never below the ground
      if (controls.target.y < -3) controls.target.y = -3;
    }
    /* frame the house beside the copy on wide screens (film offset), centred on phones */
    const wide = innerWidth >= 900;
    S.filmT = !wide ? 0 : S.mode === "story" ? (chapter < 0 ? -4.2 : -3.4) : -3.6;
    S.film = lerp(S.film, S.filmT, kdt(DAMP.cam, dt));
    if (Math.abs(camera.filmOffset - S.film) > .001) { camera.filmOffset = S.film; camera.updateProjectionMatrix(); }

    /* ---- cutaway: global clipping plane */
    if (S.cut < 50) { cutPlane.constant = S.cut; renderer.clippingPlanes = cutPlanes; } else if (renderer.clippingPlanes.length) renderer.clippingPlanes = [];

    story.classList.toggle("is-dusk", S.dusk > .55);
    if (explore) explore.classList.toggle("is-dusk", S.dusk > .55);
    if (bar) { const v = (S.stage / 4).toFixed(4); if (bar.dataset.v !== v) { bar.dataset.v = v; bar.style.transform = `scaleX(${v})`; } }

    /* ---- render */
    if (shadowDirty || firstFrame) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
    if (grain) grain.uniforms.uTime.value = time;
    if (composer) composer.render(dt); else renderer.render(scene, camera);
    updateHotspots(dt);                       // after render: camera matrices are current
    if (firstFrame) { firstFrame = false; document.body.classList.add("gl-ready"); window.__heroReady = true; }
  }
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 60), cutPlanes = [cutPlane];

  /* ------------------------------------------------------------ reduced motion: crisp still frame */
  let stillQueued = false;
  function requestStill() {
    if (!reduce || stillQueued) return; stillQueued = true;
    setTimeout(() => { stillQueued = false; renderStill(); }, 30);
  }
  function renderStill() {
    const inExplore = explore && window.scrollY >= exploreTop - innerHeight * .38;
    S.mode = inExplore ? "explore" : "story";
    S.stage = S.stageT = inExplore ? S.xStage : 4;
    S.dusk = S.duskT = inExplore ? (S.xDusk ? 1 : 0) : .35;
    S.glow = S.dusk * sstep(3.35, 3.9, S.stage); S.cut = S.cutT;
    applyStage(S.model, S.stage, S.dusk, S.glow, 0);
    for (const part of S.model.parts) { if (part.k === "room") part.mat.emissiveIntensity = S.glow * 1.7; if (part.k === "led") part.mat.emissiveIntensity = S.glow * 5; }
    washMat.uniforms.uI.value = S.glow;
    const d = S.dusk;
    key.position.copy(_v.copy(sunDay).lerp(sunDusk, d).normalize()).multiplyScalar(60);
    key.intensity = lerp(3.1, .75, d); key.color.copy(KEY_DAY).lerp(KEY_DUSK, d);
    warm1.intensity = warm2.intensity = S.glow * 26;
    scene.fog.color.copy(fogDayC).lerp(fogDuskC, d); skyMat.uniforms.mixv.value = d; skyMat.uniforms.fogC.value.copy(scene.fog.color);
    const want = Math.round(d * (ENV_LEVELS - 1)); if (envTex[want]) scene.environment = envTex[want];
    if (!inExplore) { const k = S.model.spec.keys[4]; camera.position.set(k[0], k[1], k[2]); camera.lookAt(k[3], k[4], k[5]); controls.target.set(k[3], k[4], k[5]); }
    else controls.update();
    camera.filmOffset = innerWidth >= 900 ? -3.4 : 0; camera.updateProjectionMatrix();
    if (S.cut < 50) { cutPlane.constant = S.cut; renderer.clippingPlanes = cutPlanes; } else renderer.clippingPlanes = [];
    renderer.shadowMap.needsUpdate = true;
    if (composer) composer.render(0); else renderer.render(scene, camera);
    if (!document.body.classList.contains("gl-ready")) document.body.classList.add("gl-ready");
    updateHotspots(1);
    chapters.forEach(c => { c.classList.add("on"); c.removeAttribute("aria-hidden"); });
  }

  /* ------------------------------------------------------------ optional glTF model */
  if (SITE.glbModel) {
    import("three/addons/loaders/GLTFLoader.js").then(({ GLTFLoader }) => new GLTFLoader().load(SITE.glbModel, gltf => {
      const root = gltf.scene, box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      const s = size.length() > 80 ? 30 / size.length() : 1;
      root.scale.setScalar(s); root.position.set(-c.x * s, -box.min.y * s + FL0, -c.z * s);
      const group = new THREE.Group(); group.add(root); group.visible = false; scene.add(group);
      const parts = [];
      root.traverse(o => {
        if (!o.isMesh) return; o.castShadow = o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => { if (!m.userData.edge) { reveal(m, UP); parts.push({ k: "glb", def: { mode: "rise", w: [1, 3.2], lo: -.1, hi: size.y * s + 1 }, mesh: o, mat: m }); } });
      });
      const base = MODELS.residence, hx = size.x * s / 2, hz = size.z * s / 2, hy = size.y * s;
      const spec = { ...base, id: "glb", hotspots: [
        { id: "seismic", p: [hx, hy * .45, hz], n: [.7, 0, .7] }, { id: "thermal", p: [-hx * .4, hy * .6, hz], n: [0, 0, 1] },
        { id: "glazing", p: [hx * .3, hy * .3, hz], n: [0, 0, 1] }, { id: "turnkey", p: [0, hy * .2, hz], n: [0, 0, 1] }] };
      const pitM = { x0: -hx - 1.2, x1: hx + 1.2, z0: -hz - 1.2, z1: hz + 1.2 };
      MODELS.glb = spec; built.glb = { spec, group, parts, cladMeshes: [], pit: pitM, uplights: [] };
      qa("[data-x-model='glb']").forEach(b => { b.hidden = false; });
    }, undefined, err => console.info("[lastra] no glTF model, keeping the procedural houses", err && err.message))).catch(() => {});
  }

  /* ------------------------------------------------------------ go */
  syncUI();
  if (reduce) {
    requestStill();
    addEventListener("resize", () => { resize(true); requestStill(); });
    addEventListener("scroll", requestStill, { passive: true });
  } else {
    LP.clock.add(frame);
  }

  /* ------------------------------------------------------------ cleanup */
  function destroy() {
    LP.clock && LP.clock.remove(frame);
    storyST && storyST.kill();
    controls.dispose();
    if (composer) { composer.passes.forEach(p => p.dispose && p.dispose()); composer.dispose && composer.dispose(); composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); }
    envTex.forEach(t => t && t.dispose()); roomEnv.dispose(); pmrem.dispose();
    hDay && hDay.dispose(); hDusk && hDusk.dispose();
    const seen = new Set();
    const free = m => { if (!m || seen.has(m)) return; seen.add(m); for (const v of Object.values(m)) if (v && v.isTexture) v.dispose(); m.dispose(); };
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); const m = o.material; Array.isArray(m) ? m.forEach(free) : free(m); });
    for (const set of [...Object.values(cladMats), ...Object.values(swapMats)]) Object.values(set).forEach(free);
    envSkyMat.dispose(); envScene.traverse(o => o.geometry && o.geometry.dispose());
    disposables.forEach(o => o.dispose && o.dispose());
    if (ground) ground.geos.forEach(g => g.dispose());
    [brickMap, brickBump, woodMap].forEach(t => t.dispose());
    renderer.renderLists.dispose(); renderer.dispose();
  }
  addEventListener("pagehide", e => { if (!e.persisted) destroy(); });
  window.__lastra3d = { destroy, state: S, camera, renderer };
}
