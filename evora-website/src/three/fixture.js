import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  createStage, reducedMotion, coarsePointer, lowSpecDevice, disposeModel,
} from './stage.js';
import { createMaterialLibrary } from './materials.js';
import { createWater } from './water.js';
import { MODELS } from './models/index.js';
import { mesh, slab } from './models/common.js';
import {
  getFinishState, onFinishChange, getLighting, onLightingChange, LIGHT_PRESETS,
} from '../finishes.js';
import { t, onLangChange } from '../i18n.js';

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── Optional real models: assets/models/manifest.json lists slot ids that have a .glb ──
let manifestPromise = null;
function glbManifest() {
  if (!manifestPromise) {
    manifestPromise = /^https?:$/.test(window.location.protocol)
      ? fetch('assets/models/manifest.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : { models: [] }))
        .then((j) => (Array.isArray(j.models) ? j.models : []))
        .catch(() => [])
      : Promise.resolve([]); // file:// — no fetches, procedural models only
  }
  return manifestPromise;
}

/**
 * Interactive product showcase.
 * @param {HTMLElement} container element that hosts the canvas + overlays
 * @param {{product?: string, compact?: boolean, preset?: string}} opts
 *   compact: no dimension/hotspot overlays, starts on the 'detail' camera preset
 */
export function createShowcase(container, { product = 'basin', compact = false, preset = 'studio' } = {}) {
  const lowSpec = lowSpecDevice();
  const stage = createStage(container, { fov: compact ? 32 : 30, shadows: true, envIntensity: 0.85, toneExposure: 1 });
  const { scene, camera, renderer } = stage;
  const lib = createMaterialLibrary(renderer, { lowSpec });

  // ── Studio plinth (matte stone) ──
  const plinth = mesh(slab({ w: 3.4, d: 2.6, t: 0.06, r: 0.05, bevel: 0.01 }), lib.plinth, { cast: false });
  plinth.position.set(0, -0.06, 0.25);
  scene.add(plinth);

  // ── Light rig ──
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8c8b0, 0.35);
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.castShadow = true;
  key.shadow.mapSize.set(lowSpec ? 1024 : 2048, lowSpec ? 1024 : 2048);
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 6;
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  scene.add(hemi, key, key.target, rim, fill);
  const KEY_DIR = new THREE.Vector3(1.6, 3.2, 2.2).normalize();
  const RIM_DIR = new THREE.Vector3(-2.4, 2.2, -1.6).normalize();
  const FILL_DIR = new THREE.Vector3(-1.2, 1.0, 2.6).normalize();

  // ── Overlay (dimension labels, hotspot pins, spec card) ──
  const overlay = document.createElement('div');
  overlay.className = 'sc-overlay';
  container.appendChild(overlay);
  const dimsLayer = document.createElement('div');
  dimsLayer.className = 'sc-dims';
  const pinsLayer = document.createElement('div');
  pinsLayer.className = 'sc-pins';
  const card = document.createElement('div');
  card.className = 'sc-card';
  card.hidden = true;
  card.setAttribute('role', 'dialog');
  overlay.append(dimsLayer, pinsLayer, card);

  // ── Controls ──
  const controls = new OrbitControls(camera, stage.canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // never dips below the floor
  controls.enableZoom = coarsePointer; // pinch on touch; wheel only once the viewer is engaged
  stage.canvas.style.touchAction = 'pan-y';
  let interacting = false;
  let glide = null;
  controls.addEventListener('start', () => { interacting = true; glide = null; container.classList.add('is-dragging'); });
  controls.addEventListener('end', () => { interacting = false; container.classList.remove('is-dragging'); });
  controls.addEventListener('change', () => stage.invalidate());
  const engage = () => { controls.enableZoom = true; };
  const disengage = () => { if (!coarsePointer) controls.enableZoom = false; };
  stage.canvas.addEventListener('pointerdown', engage);
  container.addEventListener('pointerleave', disengage);

  // ── State ──
  const state = {
    product: null, water: false, dims: false, hotspots: false, lighting: getLighting(), switching: false, view: preset,
  };
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn({ ...state, waterAvailable: !!(current && current.water && !current.def.noWater) }));
  let current = null; // { id, def, built, water, frame, dims, pins, occluders }
  let enter = 1;
  const dimMat = new THREE.LineBasicMaterial({ color: 0xc6a76e, depthTest: false, transparent: true, opacity: 0.95 });

  // ── Framing ──
  function measure(built) {
    const box = new THREE.Box3();
    const ignore = new Set(built.dimsIgnore || []);
    built.root.updateMatrixWorld(true);
    built.product.traverse((o) => {
      if (o.isMesh && !ignore.has(o) && !o.userData.noOcclude) box.expandByObject(o);
    });
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return { box, center, size, radius: size.length() / 2 };
  }
  function fitDistance(radius) {
    const v = THREE.MathUtils.degToRad(camera.fov);
    const h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
    return (radius / Math.sin(Math.min(v, h) / 2)) * 0.9;
  }
  function pose(name) {
    const { def, built, frame } = current;
    let target;
    let dist;
    let az;
    let el;
    if (name === 'detail' && built.detail) {
      ({ target, dist, az, el } = built.detail);
      target = target.clone();
    } else {
      target = frame.center.clone();
      dist = fitDistance(frame.radius);
      az = name === 'front' ? 0 : def.studio.az;
      el = name === 'front' ? 0.06 : def.studio.el;
    }
    const pos = target.clone().add(new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(dist));
    return { target, pos };
  }
  function goTo(p, dur = 1.0) {
    if (reducedMotion() || dur <= 0) {
      camera.position.copy(p.pos);
      controls.target.copy(p.target);
      controls.update();
      glide = null;
      stage.invalidate();
      return;
    }
    glide = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP: p.pos, toT: p.target, t: 0, dur };
  }
  function applyLimits() {
    const fit = fitDistance(current.frame.radius);
    controls.minDistance = Math.min(fit * 0.28, current.built.detail?.dist ?? fit);
    controls.maxDistance = fit * 1.7;
    const az = current.def.azimuth;
    controls.minAzimuthAngle = az ? az[0] : -Infinity;
    controls.maxAzimuthAngle = az ? az[1] : Infinity;
  }
  function fitShadows(frame) {
    const r = Math.max(1.2, frame.radius * 1.25);
    key.target.position.copy(frame.center);
    key.position.copy(frame.center).addScaledVector(KEY_DIR, 7);
    const sc = key.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 1; sc.far = 16;
    sc.updateProjectionMatrix();
    rim.position.copy(frame.center).addScaledVector(RIM_DIR, 6);
    rim.target = key.target;
    fill.position.copy(frame.center).addScaledVector(FILL_DIR, 6);
    fill.target = key.target;
  }

  // ── Dimensions ──
  function buildDims(frame) {
    const { min, max } = frame.box;
    const o = Math.max(0.05, frame.radius * 0.06);
    const tk = o * 0.45;
    const zf = max.z + o;
    const xr = max.x + o;
    const yb = min.y;
    const seg = [];
    const L = (a, b) => seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const v = (x, y, z) => new THREE.Vector3(x, y, z);
    // width (front-bottom)
    L(v(min.x, yb, zf), v(max.x, yb, zf));
    L(v(min.x, yb - tk, zf), v(min.x, yb + tk, zf));
    L(v(max.x, yb - tk, zf), v(max.x, yb + tk, zf));
    // height (front-right)
    L(v(xr, min.y, zf), v(xr, max.y, zf));
    L(v(xr - tk, min.y, zf), v(xr + tk, min.y, zf));
    L(v(xr - tk, max.y, zf), v(xr + tk, max.y, zf));
    // depth (bottom-right)
    L(v(xr, yb, min.z), v(xr, yb, zf));
    L(v(xr - tk, yb, min.z), v(xr + tk, yb, min.z));
    // extension lines
    L(v(max.x, max.y, max.z), v(xr + tk, max.y, zf));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    const lines = new THREE.LineSegments(geo, dimMat);
    lines.renderOrder = 20;
    lines.userData.noOcclude = true;
    const labels = [
      { k: 'dim.w', cm: frame.size.x, at: v((min.x + max.x) / 2, yb, zf) },
      { k: 'dim.h', cm: frame.size.y, at: v(xr, (min.y + max.y) / 2, zf) },
      { k: 'dim.d', cm: frame.size.z, at: v(xr, yb, (min.z + zf) / 2) },
    ].map((l) => {
      const el = document.createElement('span');
      el.className = 'sc-dim';
      dimsLayer.appendChild(el);
      return { ...l, el };
    });
    return { lines, labels };
  }
  function renderDimLabels() {
    current?.dims?.labels.forEach((l) => { l.el.textContent = `${t(l.k)} ${Math.round(l.cm * 100)} cm`; });
  }

  // ── Hotspots ──
  let openPin = null;
  function buildPins(built) {
    pinsLayer.innerHTML = '';
    return built.hotspots.map((h, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'sc-pin';
      el.textContent = String(i + 1);
      el.addEventListener('click', (e) => { e.stopPropagation(); openCard(i); });
      pinsLayer.appendChild(el);
      return { ...h, el, occluded: false };
    });
  }
  function renderCard() {
    if (openPin == null || !current) return;
    const h = current.pins[openPin];
    card.innerHTML = `<span class="sc-card__n">${openPin + 1}</span>
      <div><strong>${esc(t(`hs.${h.id}.t`))}</strong><p>${esc(t(`hs.${h.id}.d`))}</p></div>
      <button type="button" class="sc-card__x" aria-label="${esc(t('modal.close'))}">×</button>`;
    card.querySelector('.sc-card__x').addEventListener('click', closeCard);
  }
  function openCard(i) {
    openPin = i;
    current.pins.forEach((p, j) => p.el.classList.toggle('is-active', j === i));
    renderCard();
    card.hidden = false;
    stage.invalidate();
  }
  function closeCard() {
    openPin = null;
    card.hidden = true;
    current?.pins.forEach((p) => p.el.classList.remove('is-active'));
  }
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });

  // ── Projection of overlay anchors ──
  const tmp = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  let frameCount = 0;
  function project(local, root) {
    tmp.copy(local).applyMatrix4(root.matrixWorld).project(camera);
    return { x: (tmp.x + 1) / 2 * container.clientWidth, y: (1 - tmp.y) / 2 * container.clientHeight, behind: tmp.z > 1 };
  }
  function updateOverlay() {
    if (!current) return;
    const root = current.built.root;
    if (state.dims && current.dims) {
      current.dims.labels.forEach((l) => {
        const p = project(l.at, root);
        l.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        l.el.style.visibility = p.behind ? 'hidden' : 'visible';
      });
    }
    if (state.hotspots) {
      const check = frameCount++ % 12 === 0;
      current.pins.forEach((h) => {
        const p = project(h.pos, root);
        h.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        h.el.style.visibility = p.behind ? 'hidden' : 'visible';
        if (check) {
          const world = h.pos.clone().applyMatrix4(root.matrixWorld);
          const dir = world.clone().sub(camera.position);
          const dist = dir.length();
          ray.set(camera.position, dir.normalize());
          ray.far = dist - 0.03;
          h.occluded = ray.intersectObjects(current.occluders, false).length > 0;
          h.el.classList.toggle('is-occluded', h.occluded);
        }
        h.screen = p;
      });
      if (openPin != null && !card.hidden) {
        const p = current.pins[openPin].screen;
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;
        const W = container.clientWidth;
        const Hh = container.clientHeight;
        // open toward the roomier side so the card never sits under the side controls
        let x = p.x > W * 0.55 ? p.x - cw - 22 : p.x + 22;
        if (x + cw > W - 10) x = p.x - cw - 22;
        x = Math.max(10, Math.min(W - cw - 10, x));
        // stay clear of the top (lighting) and bottom (camera) control rows
        const y = Math.max(60, Math.min(Hh - ch - 62, p.y - ch / 2));
        card.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }

  // ── Mount / unmount ──
  function collectOccluders(root) {
    const list = [];
    root.traverse((o) => {
      if (!o.isMesh || o.userData.noOcclude) return;
      let p = o;
      while (p) { if (p.userData?.noOcclude) return; p = p.parent; }
      list.push(o);
    });
    return list;
  }
  function mount(id, built, { first = false } = {}) {
    const def = MODELS[id];
    scene.add(built.root);
    const water = createWater(def.noWater ? null : built.water, { lowSpec });
    built.root.add(water.group);
    water.setOn(state.water);
    const frame = measure(built);
    current = { id, def, built, water, frame, dims: null, pins: [], occluders: collectOccluders(built.root) };
    fitShadows(frame);
    applyLimits();
    if (!compact) {
      current.dims = buildDims(frame);
      current.dims.lines.visible = state.dims;
      built.root.add(current.dims.lines);
      renderDimLabels();
      current.pins = buildPins(built);
    }
    overlay.classList.toggle('show-dims', state.dims);
    overlay.classList.toggle('show-pins', state.hotspots);
    built.setLight?.(LIGHT_PRESETS[state.lighting]);
    state.product = id;
    const p = pose(compact ? preset : 'studio');
    if (first || reducedMotion()) {
      goTo(p, 0);
    } else {
      const startPos = p.target.clone().add(p.pos.clone().sub(p.target).multiplyScalar(1.18));
      goTo({ pos: startPos, target: p.target }, 0);
      goTo(p, 1.15);
      enter = 0;
    }
    state.view = compact ? preset : 'studio';
    stage.invalidate();
  }
  function unmount() {
    if (!current) return;
    closeCard();
    scene.remove(current.built.root);
    current.water.dispose();
    current.built.root.remove(current.water.group);
    disposeModel(current.built.root);
    dimsLayer.innerHTML = '';
    pinsLayer.innerHTML = '';
    current = null;
  }

  // ── Optional .glb replacement for the product subgroup ──
  const loader = new GLTFLoader();
  const MAT_RULES = [
    [/glass/, 'glass'], [/mirror/, 'mirror'], [/led|light/, 'led'],
    [/chrome|brass|gold|metal|steel|tap|faucet|mixer|spout|handle|lever|drain|rail|arm|head/, 'metal'],
    [/wood|oak|walnut|cabinet|drawer|front/, 'wood'],
    [/marble|stone|travertine|tile|counter|worktop|top|tray/, 'stone'],
    [/ceramic|porcelain|basin|sink|bowl|toilet|wc|tub|bath|vessel/, 'ceramic'],
  ];
  function applyGLB(scene3d) {
    const { built, frame } = current;
    const before = frame.box.clone();
    const bSize = before.getSize(new THREE.Vector3());
    let box = new THREE.Box3().setFromObject(scene3d);
    const gSize = box.getSize(new THREE.Vector3());
    const s = gSize.y > 1e-4 ? bSize.y / gSize.y : Math.max(bSize.x, bSize.z) / Math.max(gSize.x, gSize.z, 1e-4);
    scene3d.scale.multiplyScalar(s);
    box = new THREE.Box3().setFromObject(scene3d);
    const bottomCenter = (b) => new THREE.Vector3((b.min.x + b.max.x) / 2, b.min.y, (b.min.z + b.max.z) / 2);
    scene3d.position.add(bottomCenter(before).sub(bottomCenter(box)));
    scene3d.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const name = `${o.name} ${o.material?.name || ''}`.toLowerCase();
      const rule = MAT_RULES.find(([re]) => re.test(name));
      if (rule) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.userData.owned = true; m.dispose(); });
        o.material = lib[rule[1]];
      } else {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.userData.owned = true; });
      }
    });
    // swap the procedural product for the scanned/modelled one
    const old = [...built.product.children];
    old.forEach((c) => { built.product.remove(c); disposeModel(c); });
    built.product.add(scene3d);
    // remap hotspots to the new bounds
    const after = measure(built);
    const norm = (p) => new THREE.Vector3(
      (p.x - before.min.x) / Math.max(1e-4, bSize.x),
      (p.y - before.min.y) / Math.max(1e-4, bSize.y),
      (p.z - before.min.z) / Math.max(1e-4, bSize.z),
    );
    current.pins.forEach((h) => {
      const n = norm(h.pos);
      h.pos = after.box.min.clone().add(n.multiply(after.size));
    });
    current.frame = after;
    current.occluders = collectOccluders(built.root);
    if (current.dims) {
      built.root.remove(current.dims.lines);
      current.dims.lines.geometry.dispose();
      dimsLayer.innerHTML = '';
      current.dims = buildDims(after);
      current.dims.lines.visible = state.dims;
      built.root.add(current.dims.lines);
      renderDimLabels();
    }
    fitShadows(after);
    applyLimits();
    stage.invalidate();
  }
  async function maybeLoadGLB(id) {
    const list = await glbManifest();
    if (!list.includes(id)) return;
    try {
      const gltf = await loader.loadAsync(`assets/models/${id}.glb`);
      if (!current || current.id !== id) { disposeModel(gltf.scene); return; }
      applyGLB(gltf.scene);
    } catch (err) {
      console.warn(`[Evora] Could not load assets/models/${id}.glb — using the procedural model.`, err);
    }
  }

  // ── Product switching with a crossfade ──
  let pending = null;
  let busy = false;
  async function setProduct(id) {
    if (!MODELS[id]) return;
    if (!busy && current?.id === id) return;
    pending = id;
    if (busy) return;
    busy = true;
    state.switching = true;
    emit();
    while (pending) {
      const next = pending;
      pending = null;
      if (current?.id === next) continue;
      const first = !current;
      if (!first) {
        container.classList.add('is-switching');
        await wait(reducedMotion() ? 0 : 280);
        unmount();
      }
      mount(next, MODELS[next].build({ lib, lowSpec }), { first });
      container.classList.remove('is-switching');
      maybeLoadGLB(next);
    }
    busy = false;
    state.switching = false;
    emit();
  }

  // ── Lighting presets (tweened) ──
  let lightTween = null;
  const C = (h) => new THREE.Color(h);
  function snapshotLights() {
    return {
      key: key.color.clone(), keyI: key.intensity, fill: fill.color.clone(), fillI: fill.intensity,
      rim: rim.color.clone(), rimI: rim.intensity, hemiSky: hemi.color.clone(), hemiGround: hemi.groundColor.clone(),
      hemiI: hemi.intensity, env: scene.environmentIntensity, exposure: renderer.toneMappingExposure,
    };
  }
  function applyLighting(id, instant = false) {
    const p = LIGHT_PRESETS[id];
    if (!p) return;
    state.lighting = id;
    container.dataset.light = p.bg;
    current?.built.setLight?.(p);
    lightTween = { from: snapshotLights(), to: p, t: instant || reducedMotion() ? 1 : 0 };
    stepLights(0);
    stage.invalidate();
    emit();
  }
  function stepLights(dt) {
    if (!lightTween) return false;
    const tw = lightTween;
    tw.t = Math.min(1, tw.t + dt / 0.8);
    const k = ease(tw.t);
    const { from, to } = tw;
    key.color.lerpColors(from.key, C(to.key), k);
    fill.color.lerpColors(from.fill, C(to.fill), k);
    rim.color.lerpColors(from.rim, C(to.rim), k);
    hemi.color.lerpColors(from.hemiSky, C(to.hemiSky), k);
    hemi.groundColor.lerpColors(from.hemiGround, C(to.hemiGround), k);
    key.intensity = THREE.MathUtils.lerp(from.keyI, to.keyI, k);
    fill.intensity = THREE.MathUtils.lerp(from.fillI, to.fillI, k);
    rim.intensity = THREE.MathUtils.lerp(from.rimI, to.rimI, k);
    hemi.intensity = THREE.MathUtils.lerp(from.hemiI, to.hemiI, k);
    scene.environmentIntensity = THREE.MathUtils.lerp(from.env, to.env, k);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(from.exposure, to.exposure, k);
    if (tw.t >= 1) lightTween = null;
    return true;
  }

  // ── Store subscriptions ──
  const unsubs = [
    onFinishChange((s, changed) => { lib.setFinish(changed); stage.invalidate(); }),
    onLightingChange((id) => applyLighting(id)),
    onLangChange(() => { renderDimLabels(); renderCard(); }),
  ];

  // ── Subtle cursor parallax (desktop, not while orbiting) ──
  // Frozen while the cursor is over the viewer or overlays are shown, so pins stay put to be clicked.
  const pointer = { x: 0, tx: 0 };
  const onPointer = (e) => {
    const inside = container.contains(e.target) || e.target.closest?.('.showcase');
    pointer.tx = inside || state.hotspots || state.dims ? pointer.x : (e.clientX / window.innerWidth) * 2 - 1;
  };
  if (!coarsePointer) window.addEventListener('pointermove', onPointer, { passive: true });

  // ── Keyboard orbit for accessibility ──
  container.tabIndex = 0;
  const onKey = (e) => {
    if (!current || e.target !== container) return;
    const step = { ArrowLeft: -0.2, ArrowRight: 0.2 }[e.key];
    const zoom = { '+': 0.85, '=': 0.85, '-': 1.18 }[e.key];
    if (step) {
      e.preventDefault();
      const off = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), step);
      goTo({ pos: controls.target.clone().add(off), target: controls.target.clone() }, 0.4);
    } else if (zoom) {
      e.preventDefault();
      api.zoom(zoom);
    }
  };
  container.addEventListener('keydown', onKey);

  // ── Frame loop ──
  stage.onFrame((dt, time) => {
    let busyFrame = false;
    if (lib.update(dt)) busyFrame = true;
    if (stepLights(dt)) busyFrame = true;
    if (glide) {
      glide.t = Math.min(1, glide.t + dt / glide.dur);
      const k = ease(glide.t);
      camera.position.lerpVectors(glide.fromP, glide.toP, k);
      controls.target.lerpVectors(glide.fromT, glide.toT, k);
      if (glide.t >= 1) glide = null;
      busyFrame = true;
    }
    if (controls.update()) busyFrame = true;
    if (current) {
      if (enter < 1) {
        enter = Math.min(1, enter + dt * 1.6);
        const k = 1 - (1 - enter) ** 3;
        current.built.root.scale.setScalar(0.965 + 0.035 * k);
        current.built.root.position.y = (1 - k) * -0.03;
        busyFrame = true;
      }
      if (!reducedMotion() && !interacting && !compact) {
        pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2.5);
        current.built.root.rotation.y = pointer.x * 0.035;
      }
      if (current.water.update(dt, time)) busyFrame = true;
      updateOverlay();
    }
    return busyFrame;
  });

  // ── Public API ──
  const api = {
    setProduct,
    getState: () => ({ ...state }),
    setView(name) {
      if (!current) return;
      state.view = name;
      goTo(pose(name === 'reset' ? 'studio' : name), 1.0);
      if (name === 'reset') closeCard();
      emit();
    },
    zoom(f) {
      if (!current) return;
      const off = camera.position.clone().sub(controls.target);
      const len = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      goTo({ pos: controls.target.clone().add(off.setLength(len)), target: controls.target.clone() }, 0.45);
    },
    setWater(on) {
      state.water = !!on;
      current?.water.setOn(state.water);
      stage.invalidate();
      emit();
    },
    setDims(on) {
      state.dims = !!on;
      if (current?.dims) current.dims.lines.visible = state.dims;
      overlay.classList.toggle('show-dims', state.dims);
      stage.invalidate();
      emit();
    },
    setHotspots(on) {
      state.hotspots = !!on;
      overlay.classList.toggle('show-pins', state.hotspots);
      if (!on) closeCard();
      stage.invalidate();
      emit();
    },
    setStone(name) { lib.setStoneOverride(name); stage.invalidate(); },
    onChange(fn) { listeners.add(fn); fn({ ...state, waterAvailable: !!(current && current.water && !current.def.noWater) }); return () => listeners.delete(fn); },
    dispose() {
      unsubs.forEach((u) => u());
      window.removeEventListener('pointermove', onPointer);
      container.removeEventListener('keydown', onKey);
      container.removeEventListener('pointerleave', disengage);
      stage.canvas.removeEventListener('pointerdown', engage);
      unmount();
      controls.dispose();
      dimMat.dispose();
      lib.dispose();
      overlay.remove();
      stage.dispose();
    },
  };

  // initial state
  const f = getFinishState();
  lib.setFinish(f.metal, true);
  lib.setFinish(f.ceramic, true);
  applyLighting(state.lighting, true);
  setProduct(product);
  return api;
}

// Back-compat name used by earlier versions.
export const createFixtureScene = createShowcase;
