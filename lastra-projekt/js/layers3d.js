/* Lastra Projekt – interactive "maquette" of a Lastra house for the services index.
   Each service step builds its own layer of the model:
   0 design & permits -> blueprint (the house as a wireframe on the drafting plate)
   1 structure        -> foundation, columns and slabs grow out of the ground
   2 roof             -> roof slab drops into place
   3 finishing        -> façade, glazing and cladding fade in
   4 turnkey          -> interior lights on, garden planted
   Loaded lazily by main.js only when the services block approaches the viewport.
   Drag (mouse or touch) to rotate; vertical touch scrolling is left to the page. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function mount(host) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "sv-canvas"; canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { canvas.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(26, 1, .5, 200);

  /* ---------- light: soft warm sun + sky fill ---------- */
  scene.add(new THREE.HemisphereLight("#fff6ea", "#b9b2a6", .55));
  const sun = new THREE.DirectionalLight("#fff1dc", 2.1);
  sun.position.set(-14, 22, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 70 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
  scene.add(sun);

  /* ---------- materials (architectural model palette, matches the site) ---------- */
  const std = (color, rough = .85, metal = 0, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...o });
  const M = {
    plate: std("#efe9de", .95), concrete: std("#bdb7ac", .92), plaster: std("#f5f2ec", .8),
    frame: std("#1c1c1e", .45, .35), stone: std("#3b3a38", .7), wood: std("#8d5c3a", .65),
    membrane: std("#3d3c3b", .8), parapet: std("#efebe4", .8), garage: std("#232325", .55, .2),
    lawn: std("#a7ae92", .95), path: std("#d9d2c5", .9), shrub: std("#7f8b6b", .9), trunk: std("#cfc6b6", .9),
    glass: new THREE.MeshPhysicalMaterial({ color: "#a9bccb", roughness: .04, metalness: .15, transparent: true, opacity: .3, envMapIntensity: 1.1, depthWrite: false }),
    glow: std("#3a2a1c", .9, 0, { emissive: new THREE.Color("#ff9a4d"), emissiveIntensity: 0 }),
  };
  M.glass.userData.glass = true; M.glow.userData.glow = true;
  const lineM = new THREE.LineBasicMaterial({ color: "#b0703f", transparent: true, opacity: .4, depthWrite: false });

  /* ---------- helpers ---------- */
  const model = new THREE.Group(); scene.add(model);
  const layers = [0, 1, 2, 3, 4].map(() => { const g = new THREE.Group(); model.add(g); return g; });
  // box(w,h,d) with its BASE at y; x,z are the centre
  function box(layer, w, h, d, x, y, z, mat, shadow = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = shadow; m.receiveShadow = true;
    layer.add(m); return m;
  }
  const [PLAN, STRUCT, ROOF, FINISH, KEY] = layers;

  /* ---------- 0: drafting plate + blueprint ---------- */
  box(PLAN, 22, .35, 16, .5, -.35, 0, M.plate, false).castShadow = false;
  (function blueprint() {
    const pts = [], add = (a, b) => pts.push(new THREE.Vector3(a[0], .012, a[1]), new THREE.Vector3(b[0], .012, b[1]));
    for (let x = -10; x <= 11; x += 1) add([x, -7.5], [x, 7.5]);
    for (let z = -7; z <= 7; z += 1) add([-10.5, z], [11.5, z]);
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#c9bfae", transparent: true, opacity: .5 }));
    PLAN.add(grid);
    const dim = [], d = (a, b) => dim.push(new THREE.Vector3(a[0], .02, a[1]), new THREE.Vector3(b[0], .02, b[1]));
    d([-8, 5.6], [7, 5.6]); d([-8, 5.3], [-8, 5.9]); d([7, 5.3], [7, 5.9]); d([-3, 5.4], [-3, 5.8]);     // front dimension line
    d([8.6, -3.5], [8.6, 3.5]); d([8.3, -3.5], [8.9, -3.5]); d([8.3, 3.5], [8.9, 3.5]);                // side dimension line
    const north = [[-9, -5.2], [-9, -6.6], [-9.4, -6], [-9, -6.6], [-8.6, -6]]; for (let i = 0; i < north.length - 1; i++) d(north[i], north[i + 1]);
    PLAN.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(dim), new THREE.LineBasicMaterial({ color: "#b0703f" })));
  })();

  /* ---------- 1: structure (main volume 10 x 7 m, garage 5 x 6 m) ---------- */
  box(STRUCT, 10.4, .3, 7.4, 2, 0, 0, M.concrete);           // foundation slab, main
  box(STRUCT, 5.2, .3, 6.2, -5.5, 0, .5, M.concrete);        // foundation slab, garage
  for (const x of [-2.8, .6, 3.6, 6.8]) for (const z of [-3.3, 3.3]) {
    box(STRUCT, .3, 2.9, .3, x, .3, z, M.concrete);
    box(STRUCT, .3, 2.8, .3, x, 3.5, z, M.concrete);
  }
  box(STRUCT, 10.4, .3, 7.4, 2, 3.2, 0, M.concrete);         // first-floor slab
  for (const x of [-7.8, -3.2]) for (const z of [-2.3, 3.3]) box(STRUCT, .3, 2.7, .3, x, .3, z, M.concrete);
  box(STRUCT, 5.4, .25, 6.4, -5.5, 3, .5, M.concrete);       // garage slab
  for (let i = 0; i < 9; i++) box(STRUCT, 1.1, .18, .32, 5.2, .3 + i * .34, -2.4 + i * .3, M.concrete); // stair

  /* ---------- 2: roof ---------- */
  box(ROOF, 10.8, .3, 7.8, 2, 6.3, 0, M.membrane);
  for (const [w, d, x, z] of [[10.8, .25, 2, 3.78], [10.8, .25, 2, -3.78], [.25, 7.8, -3.28, 0], [.25, 7.8, 7.28, 0]]) box(ROOF, w, .45, d, x, 6.6, z, M.parapet);
  box(ROOF, 1.6, .5, 1.6, 4.6, 6.6, -1, M.frame);            // skylight / services box
  box(ROOF, 5.6, .14, 6.6, -5.5, 3.25, .5, M.membrane);

  /* ---------- 3: finishing (façade, glazing, cladding) ---------- */
  const F = FINISH;
  box(F, 10.2, 6.1, .22, 2, .3, -3.42, M.plaster);                          // back wall
  box(F, .22, 6.1, 7, -3.08, .3, 0, M.plaster); box(F, .22, 6.1, 7, 7.08, .3, 0, M.plaster); // side walls
  box(F, 10.6, .55, .4, 2, 3.05, 3.55, M.plaster);                          // slab edge band
  box(F, 10.6, .4, .4, 2, 6.0, 3.55, M.plaster);                            // top band
  box(F, .45, 6.1, .4, -3.05, .3, 3.55, M.plaster); box(F, .45, 6.1, .4, 7.05, .3, 3.55, M.plaster);
  box(F, .75, 6.6, .5, 3.55, .1, 3.6, M.frame);                             // black vertical fin
  box(F, 2.3, 2.55, .25, 2.05, 3.55, 3.5, M.stone);                         // upper stone panel
  const glazing = [[-2.75, .3, 6.2, 2.75], [-2.75, 3.6, 3.5, 2.4], [3.95, .3, 2.9, 2.75], [3.95, 3.6, 2.9, 2.4]];
  for (const [x0, y0, w, h] of glazing) {
    const g = box(F, w, h, .06, x0 + w / 2, y0, 3.5, M.glass, false); g.receiveShadow = false;
    const n = Math.max(1, Math.round(w / 1.5));
    for (let i = 0; i <= n; i++) box(F, .07, h, .1, x0 + i * w / n, y0, 3.52, M.frame);
    box(F, w, .07, .1, x0 + w / 2, y0, 3.52, M.frame); box(F, w, .07, .1, x0 + w / 2, y0 + h - .07, 3.52, M.frame);
  }
  box(F, 5.2, 2.95, .22, -5.5, .3, -2.4, M.plaster); box(F, .22, 2.95, 6, -7.98, .3, .6, M.plaster); // garage walls
  box(F, 4.4, 2.6, .12, -5.6, .3, 3.55, M.garage);                          // garage door
  box(F, 5.4, .35, .3, -5.5, 2.9, 3.6, M.wood);                             // timber fascia

  /* ---------- 4: turnkey (interior glow + garden) ---------- */
  const K = KEY;
  for (const [x0, y0, w, h] of glazing) box(K, w - .2, h - .25, .05, x0 + w / 2, y0 + .1, 3.2, M.glow, false);
  box(K, 7.5, .04, 4.2, -2.7, -.02, 6.3, M.lawn, false).receiveShadow = true;
  box(K, 6.4, .04, 4.2, 7.9, -.02, 6.3, M.lawn, false).receiveShadow = true;
  box(K, 5, .06, 4.4, -5.6, -.02, 6.2, M.path, false);                       // driveway
  for (let i = 0; i < 4; i++) box(K, 1.6, .08 - i * .005, .7, 4.75, -.02, 4.25 + i * 1.1, M.path, false); // stepping stones
  const shrubs = [];
  const tree = (x, z, s) => {
    const t = new THREE.Group(); t.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.07 * s, .09 * s, 1.6 * s, 8), M.trunk); trunk.position.y = .8 * s; trunk.castShadow = true;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05 * s, 1), M.shrub); crown.position.y = 2.2 * s; crown.castShadow = true;
    t.add(trunk, crown); K.add(t); shrubs.push(t);
  };
  tree(-9.2, 5.4, 1.15); tree(10.2, 5.6, 1); tree(10, -4.6, 1.3); tree(-9.4, -4.4, .9);
  for (const [x, z, s] of [[-.5, 4.6, .45], [1, 4.7, .38], [2.4, 4.5, .42], [6.6, 4.6, .4], [8.6, 4.4, .5], [-8.6, 2.4, .5]]) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), M.shrub); b.position.set(x, s * .8, z); b.castShadow = true; K.add(b); shrubs.push(b);
  }

  /* ---------- shadow catcher below the plate ---------- */
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: .16 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -.36; catcher.receiveShadow = true; scene.add(catcher);
  model.position.x = -.6;

  /* ---------- ghost wireframes: what is still to be built ---------- */
  const ghosts = layers.map((L, k) => {
    const g = new THREE.Group(); if (k === 0 || k === 4) return g;   // nothing to sketch for the plate or the garden
    L.traverse(o => {
      if (!o.isMesh) return;
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), lineM);
      o.updateWorldMatrix(true, false);
      e.applyMatrix4(new THREE.Matrix4().copy(L.matrixWorld).invert().multiply(o.matrixWorld));
      g.add(e);
    });
    model.add(g); return g;
  });
  // per-layer fade materials (clone so each layer fades independently)
  const fadeMats = layers.map((L, k) => {
    const list = new Map();
    if (k === 0) return list;
    L.traverse(o => { if (o.isMesh) { if (!list.has(o.material)) { const c = o.material.clone(); c.userData.base = c.opacity; list.set(o.material, c); } o.material = list.get(o.material); } });
    return list;
  });
  const ghostMats = ghosts.map(g => { const m = lineM.clone(); g.traverse(o => { if (o.isLineSegments) o.material = m; }); return m; });

  /* ---------- state + animation ---------- */
  const prog = [1, 0, 0, 0, 0], flash = [0, 0, 0, 0, 0];
  let step = 0, rot = -.55, vel = 0, drag = null, hover = { x: 0, y: 0, tx: 0, ty: 0 }, idle = 0, visible = false, raf = 0, last = 0;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function applyLayers() {
    for (let k = 1; k < 5; k++) {
      const b = ease(prog[k]), L = layers[k];
      for (const m of fadeMats[k].values()) {
        const base = m.userData.base ?? 1, op = base * b;
        const isGlass = m.userData.glass;
        m.opacity = op; m.transparent = isGlass || op < .999; m.depthWrite = !isGlass; m.visible = op > .01;
      }
      ghostMats[k].opacity = (1 - b) * .42 + flash[k] * .9;
      ghosts[k].visible = ghostMats[k].opacity > .01;
      if (k === 1) { L.scale.y = Math.max(.001, b); }                    // structure grows from the slab
      if (k === 2) { L.position.y = (1 - b) * 4; }                       // roof is lowered into place
      if (k === 3) { const s = 1 + (1 - b) * .035; L.scale.set(s, 1, s); }
      if (k === 4) {
        for (const m of fadeMats[4].values()) if (m.userData.glow) m.emissiveIntensity = 1.25 * b;
        shrubs.forEach((s, i) => { const t = Math.min(1, Math.max(0, b * 1.6 - i * .05)); s.scale.setScalar(Math.max(.001, ease(t))); });
      }
    }
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    let busy = false;
    for (let k = 1; k < 5; k++) {
      const target = k <= step ? 1 : 0;
      if (prog[k] !== target) { const sp = reduce ? 99 : 1.25; prog[k] = target > prog[k] ? Math.min(1, prog[k] + dt * sp) : Math.max(0, prog[k] - dt * sp * 1.4); busy = true; }
      if (flash[k] > 0) { flash[k] = Math.max(0, flash[k] - dt * .9); busy = true; }
    }
    if (!drag) {
      idle += dt;
      if (Math.abs(vel) > .0005) { rot += vel; vel *= Math.pow(.05, dt); busy = true; }
      else if (!reduce && idle > 1.2) { rot += dt * .09; busy = true; }
    }
    hover.x += (hover.tx - hover.x) * Math.min(1, dt * 4); hover.y += (hover.ty - hover.y) * Math.min(1, dt * 4);
    if (Math.abs(hover.tx - hover.x) > .001 || Math.abs(hover.ty - hover.y) > .001) busy = true;
    applyLayers();
    model.rotation.y = rot;
    const el = .5 + hover.y * .06, r = camera.aspect < .95 ? 66 : 50, az = hover.x * .08;
    camera.position.set(Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r, Math.cos(az) * Math.cos(el) * r);
    camera.lookAt(0, camera.aspect < .95 ? 1.4 : 1.9, 0);
    renderer.render(scene, camera);
    if (visible && (busy || drag)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } };

  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < .95 ? 30 : 24; camera.updateProjectionMatrix(); kick();
    if (!raf) frame(performance.now());
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: "120px" }).observe(host);
  document.addEventListener("visibilitychange", () => { if (document.hidden) visible = false; else { visible = true; kick(); } });

  /* ---------- input ---------- */
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, r: rot, t: performance.now(), lx: e.clientX, axis: null }; vel = 0; idle = 0; kick(); });
  addEventListener("pointermove", e => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis && Math.hypot(dx, dy) > 6) { drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"; if (drag.axis === "x") { canvas.setPointerCapture?.(e.pointerId); host.classList.add("dragging"); } }
      if (drag.axis === "x") { rot = drag.r + dx * .008; vel = (e.clientX - drag.lx) * .008 * .6; drag.lx = e.clientX; }
      if (drag.axis === "y") drag = null;           // let vertical swipes scroll the page
      kick(); return;
    }
    if (e.pointerType === "mouse") {
      const r = host.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { hover.tx = ((e.clientX - r.left) / r.width) * 2 - 1; hover.ty = ((e.clientY - r.top) / r.height) * 2 - 1; idle = 0; }
      else { hover.tx = hover.ty = 0; }
      kick();
    }
  }, { passive: true });
  const end = () => { if (drag) { drag = null; host.classList.remove("dragging"); idle = 0; kick(); } };
  addEventListener("pointerup", end); addEventListener("pointercancel", end);

  /* ---------- public: select a service step ---------- */
  function set(i) {
    i = Math.max(0, Math.min(4, i | 0)); if (i === step) return;
    if (i > step) for (let k = step + 1; k <= i; k++) flash[k] = .55;
    step = i; idle = 0; kick();
  }
  resize(); applyLayers(); frame(performance.now());
  host.classList.add("has-3d");
  return { set };
}
