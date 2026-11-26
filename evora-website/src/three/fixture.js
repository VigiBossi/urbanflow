import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStage, reducedMotion, coarsePointer, smallScreen } from './stage.js';
import { FINISHES, getFinishState, onFinishChange } from '../finishes.js';
import { stoneCanvas } from '../textures.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function stoneTexture(name, size, renderer, repeat = 1) {
  const tex = new THREE.CanvasTexture(stoneCanvas(name, size));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function whiteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 4;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 4, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// The sculpted monolith: plinth, tapering column and bowl in one lathe profile.
function basinProfile(segments) {
  const pts = [
    [0.0005, 0.0], [0.155, 0.0], [0.16, 0.012], [0.15, 0.03], [0.112, 0.08], [0.087, 0.2],
    [0.076, 0.4], [0.08, 0.58], [0.1, 0.7], [0.15, 0.78], [0.21, 0.83], [0.245, 0.878],
    [0.255, 0.918], [0.252, 0.944], [0.243, 0.952], [0.232, 0.948], [0.226, 0.93],
    [0.21, 0.89], [0.17, 0.862], [0.1, 0.849], [0.0005, 0.846],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.SplineCurve(pts).getSpacedPoints(segments);
}

function archOutline(width, straight, inset) {
  const r = width / 2 - inset;
  const pts = [];
  for (let y = 0; y <= straight; y += straight / 8) pts.push(new THREE.Vector3(-r, y, 0));
  for (let i = 1; i < 48; i++) {
    const a = Math.PI - (i / 48) * Math.PI;
    pts.push(new THREE.Vector3(Math.cos(a) * r, straight + Math.sin(a) * r, 0));
  }
  for (let y = straight; y >= 0; y -= straight / 8) pts.push(new THREE.Vector3(r, y, 0));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

/**
 * Pedestal basin + arched floor-standing faucet with live finish switching.
 * @param {HTMLElement} container
 * @param {{closeUp?: boolean}} opts
 */
export function createFixtureScene(container, { closeUp = false } = {}) {
  const lowSpec = smallScreen() || coarsePointer;
  const stage = createStage(container, {
    fov: closeUp ? 32 : 28, shadows: true, envIntensity: 0.7, toneExposure: 0.95,
  });
  const { scene, camera, renderer } = stage;

  // ── Materials ──
  const metal = new THREE.MeshPhysicalMaterial({ ...FINISHES.gold.params });
  const ceramic = new THREE.MeshPhysicalMaterial({ ...FINISHES.white.params });
  const maps = {
    travertine: stoneTexture('travertine', lowSpec ? 512 : 1024, renderer, 1),
    white: whiteTexture(),
  };
  maps.travertine.repeat.set(2, 1.4);
  ceramic.map = maps.white;
  const aerator = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7, metalness: 0.2 });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTexture('limestone', lowSpec ? 512 : 1024, renderer),
    color: 0xdcd6cc,
    roughness: 0.92,
    metalness: 0,
  });
  stoneMat.map.repeat.set(0.45, 0.45);
  stoneMat.map.offset.set(0.5, 0.02);
  const floorMat = new THREE.MeshStandardMaterial({
    map: stoneTexture('limestone', 512, renderer),
    color: closeUp ? 0x4a4540 : 0xcfc9bf,
    roughness: 0.85,
  });
  floorMat.map.repeat.set(1.5, 1.5);

  // ── Geometry ──
  const world = new THREE.Group(); // floats & follows the cursor
  const model = new THREE.Group(); // basin + faucet, idle sway
  world.add(model);
  scene.add(world);

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.195, 0.025, 64), metal);
  plinth.position.y = 0.0125;
  const basin = new THREE.Mesh(
    new THREE.LatheGeometry(basinProfile(lowSpec ? 90 : 160), lowSpec ? 72 : 128),
    ceramic,
  );
  basin.position.y = 0.025;
  const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 40), metal);
  drain.position.y = 0.025 + 0.848;
  model.add(plinth, basin, drain);

  // Arched floor-standing mixer
  const fz = -0.36;
  const spoutZ = -0.06;
  const pipePath = new THREE.CurvePath();
  pipePath.add(new THREE.LineCurve3(new THREE.Vector3(0, 0.01, fz), new THREE.Vector3(0, 1.02, fz)));
  pipePath.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 1.02, fz),
    new THREE.Vector3(0, 1.27, fz),
    new THREE.Vector3(0, 1.27, spoutZ),
    new THREE.Vector3(0, 1.1, spoutZ),
  ));
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipePath, lowSpec ? 120 : 220, 0.0125, lowSpec ? 16 : 24, false), metal);
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.018, 48), metal);
  flange.position.set(0, 0.009, fz);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.016, 32), metal);
  tip.position.set(0, 1.095, spoutZ);
  const aer = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.004, 32), aerator);
  aer.position.set(0, 1.086, spoutZ);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.05, 32), metal);
  knob.rotation.z = Math.PI / 2;
  knob.position.set(0.03, 0.86, fz);
  const lever = new THREE.Mesh(new THREE.CapsuleGeometry(0.0055, 0.085, 6, 16), metal);
  lever.rotation.x = Math.PI / 2;
  lever.position.set(0.05, 0.86, fz + 0.045);
  model.add(pipe, flange, tip, aer, knob, lever);

  // Architectural backdrop: arched limestone niche with a metal inlay
  const archW = 1.5;
  const archStraight = 1.35;
  const shape = new THREE.Shape();
  shape.moveTo(-archW / 2, 0);
  shape.lineTo(archW / 2, 0);
  shape.lineTo(archW / 2, archStraight);
  shape.absarc(0, archStraight, archW / 2, 0, Math.PI, false);
  shape.lineTo(-archW / 2, 0);
  const arch = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false, curveSegments: 48 }),
    stoneMat,
  );
  arch.position.set(0, 0, -0.82);
  const inlay = new THREE.Mesh(new THREE.TubeGeometry(archOutline(archW, archStraight, 0.09), 200, 0.0045, 8, false), metal);
  inlay.position.set(0, 0, -0.755);
  if (!closeUp) world.add(arch, inlay);

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.04, 96), floorMat);
  floor.position.y = -0.02;
  world.add(floor);

  [plinth, basin, drain, pipe, flange, tip, knob, lever, arch, inlay].forEach((m) => { m.castShadow = true; });
  [basin, arch, floor, plinth].forEach((m) => { m.receiveShadow = true; });

  // ── Lighting ──
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfbf, 0.25));
  const key = new THREE.DirectionalLight(0xfff8ee, 1.9);
  key.position.set(2.0, 3.4, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(lowSpec ? 1024 : 2048, lowSpec ? 1024 : 2048);
  key.shadow.camera.left = -1.3;
  key.shadow.camera.right = 1.3;
  key.shadow.camera.top = 1.8;
  key.shadow.camera.bottom = -0.6;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 9;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe7ff, 0.9);
  rim.position.set(-2.6, 2.4, -1.2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-1, 1, 3);
  scene.add(fill);

  // ── Camera & controls ──
  const target = closeUp ? new THREE.Vector3(0, 0.66, -0.12) : new THREE.Vector3(0, 0.98, -0.3);
  const frameSize = closeUp ? 1.55 : 2.25;
  const dir = closeUp ? new THREE.Vector3(0.7, 0.32, 1).normalize() : new THREE.Vector3(0.58, 0.3, 1).normalize();
  camera.position.copy(target).addScaledVector(dir, 4);

  const controls = new OrbitControls(camera, stage.canvas);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.55;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.5;
  controls.minAzimuthAngle = -1.15;
  controls.maxAzimuthAngle = 1.15;
  if (coarsePointer) stage.canvas.style.touchAction = 'pan-y'; // keep vertical page scroll on phones
  let interacting = false;
  controls.addEventListener('start', () => { interacting = true; container.classList.add('is-dragging'); });
  controls.addEventListener('end', () => { interacting = false; container.classList.remove('is-dragging'); });
  controls.addEventListener('change', () => stage.invalidate());

  stage.onResize((w, h) => {
    const aspect = w / Math.max(1, h);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distV = (frameSize / 2) / Math.tan(vFov / 2);
    const distH = (frameSize * 0.82 / 2) / (Math.tan(vFov / 2) * aspect);
    const dist = Math.max(distV, distH) * 1.08;
    const offset = camera.position.clone().sub(controls.target).setLength(dist);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  });

  // ── Cursor follow ──
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!coarsePointer) window.addEventListener('pointermove', onPointer, { passive: true });

  // ── Finish transitions ──
  const transitions = [];
  function applyFinish(mat, id, instant) {
    const f = FINISHES[id];
    const to = { ...f.params };
    // keep shader defines stable (no recompiles mid-animation)
    to.anisotropy = Math.max(0.001, to.anisotropy);
    to.clearcoat = Math.max(0.001, to.clearcoat);
    if (mat === ceramic) mat.map = maps[f.map ? f.map : 'white'];
    const from = {
      color: mat.color.clone(), metalness: mat.metalness, roughness: mat.roughness,
      anisotropy: mat.anisotropy, clearcoat: mat.clearcoat, clearcoatRoughness: mat.clearcoatRoughness,
    };
    const toColor = new THREE.Color(to.color);
    for (let i = transitions.length - 1; i >= 0; i--) if (transitions[i].mat === mat) transitions.splice(i, 1);
    transitions.push({ mat, from, to, toColor, t: instant || reducedMotion() ? 1 : 0 });
    stage.invalidate();
  }
  function stepTransitions(dt) {
    for (let i = transitions.length - 1; i >= 0; i--) {
      const tr = transitions[i];
      tr.t = Math.min(1, tr.t + dt / 0.75);
      const k = easeInOut(tr.t);
      const { mat, from, to } = tr;
      mat.color.lerpColors(from.color, tr.toColor, k);
      ['metalness', 'roughness', 'anisotropy', 'clearcoat', 'clearcoatRoughness'].forEach((p) => {
        mat[p] = from[p] + (to[p] - from[p]) * k;
      });
      if (tr.t >= 1) transitions.splice(i, 1);
    }
    return transitions.length > 0;
  }

  const initial = getFinishState();
  applyFinish(metal, initial.metal, true);
  applyFinish(ceramic, initial.ceramic, true);
  stepTransitions(0);
  const unsubscribe = onFinishChange((s, changed) => {
    const f = FINISHES[changed];
    applyFinish(f.group === 'metal' ? metal : ceramic, changed, false);
  });

  // ── Frame loop ──
  let sway = 0;
  stage.onFrame((dt, t) => {
    const transitioning = stepTransitions(dt);
    const damping = controls.update();
    if (reducedMotion()) return transitioning || damping;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    if (!interacting) sway += dt;
    world.position.y = Math.sin(t * 0.9) * 0.012;
    world.rotation.y = Math.sin(sway * 0.22) * 0.32 + pointer.x * 0.22;
    world.rotation.x = pointer.y * 0.035;
    model.rotation.y = Math.sin(t * 0.5) * 0.02;
    return true;
  });

  return {
    dispose() {
      unsubscribe();
      window.removeEventListener('pointermove', onPointer);
      controls.dispose();
      Object.values(maps).forEach((m) => m.dispose());
      stage.dispose();
    },
  };
}
