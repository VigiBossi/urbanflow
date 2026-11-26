import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createStage, reducedMotion, lowSpecDevice } from './stage.js';
import { stoneMaps, STONES } from '../textures.js';
import {
  SLABS, SURFACES, LIGHT_PRESETS, getLighting, onLightingChange,
} from '../finishes.js';
import { panel } from './models/common.js';

/**
 * Large-format slab you can tilt; a soft rectangular light sweeps across it so
 * polish, veining, pores and sheen read like they do in the showroom.
 * Uses the same albedo / normal / roughness maps and lighting presets as the
 * main 3D showcase.
 */
export function createTileInspector(container) {
  RectAreaLightUniformsLib.init();
  const lowSpec = lowSpecDevice();
  const stage = createStage(container, { fov: 30, envIntensity: 0.6, toneExposure: 1.0 });
  const { scene, camera, renderer } = stage;

  const slabMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, normalScale: new THREE.Vector2(0.8, 0.8),
  });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xdedad3, roughness: 0.6 });
  const pivot = new THREE.Group();
  scene.add(pivot);
  let slab = null;

  // Lighting: ambient + sweeping rect-area light + top key, all tinted by the showroom preset
  const ambient = new THREE.AmbientLight(0xffffff, 0.18);
  const sweep = new THREE.RectAreaLight(0xfff4e6, 3.2, 0.3, 3.4);
  sweep.position.set(0, 0, 2.2);
  sweep.lookAt(0, 0, 0);
  const top = new THREE.DirectionalLight(0xffffff, 0.8);
  top.position.set(-1.5, 2.5, 2);
  scene.add(ambient, sweep, top);

  function applyLighting(id) {
    const p = LIGHT_PRESETS[id];
    sweep.color.set(p.key);
    top.color.set(p.key);
    sweep.intensity = p.bg === 'evening' ? 4.2 : 3.2;
    top.intensity = p.keyI * 0.32;
    ambient.intensity = p.hemiI * 0.5;
    scene.environmentIntensity = p.env * 0.65;
    stage.invalidate();
  }
  applyLighting(getLighting());
  const unsubLight = onLightingChange(applyLighting);

  camera.position.set(0, 0, 4.2);
  camera.lookAt(0, 0, 0);

  const textures = new Map();
  function texturesFor(stone, aspect) {
    const key = `${stone}:${aspect}`;
    if (textures.has(key)) return textures.get(key);
    const m = stoneMaps(stone, lowSpec ? 640 : 1024, aspect);
    const make = (c, srgb) => {
      const t = new THREE.CanvasTexture(c);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return t;
    };
    const set = { map: make(m.albedo, true), normal: make(m.normal), rough: make(m.rough) };
    textures.set(key, set);
    return set;
  }

  let fitHeight = 2.4;
  const current = { slab: 'calacatta', surface: 'polished' };
  const surfaceTarget = { ...SURFACES.polished };
  let reveal = 1;

  function setSlab(id) {
    const s = SLABS[id];
    if (!s) return;
    current.slab = id;
    const [wcm, hcm] = s.format;
    const scale = 2.3 / Math.max(wcm, hcm);
    const w = wcm * scale;
    const h = hcm * scale;
    const t = Math.max(0.02, s.thickness * 0.0035);
    // Beveled slab with UVs normalised to 0..1 across the face
    if (slab) { pivot.remove(slab); slab.geometry.dispose(); }
    const geo = panel({ w, h, t, r: 0.004, bevel: 0.004 });
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
    geo.translate(0, 0, -t / 2);
    geo.clearGroups();
    slab = new THREE.Mesh(geo, slabMat);
    pivot.add(slab);
    const tx = texturesFor(s.stone, hcm / wcm);
    slabMat.map = tx.map;
    slabMat.normalMap = tx.normal;
    slabMat.roughnessMap = tx.rough;
    slabMat.needsUpdate = true;
    edgeMat.color.set(STONES[s.stone].avg);
    fitHeight = Math.max(h, w * 0.9);
    fitCamera();
    reveal = reducedMotion() ? 1 : 0;
    stage.invalidate();
  }

  function setSurface(id) {
    if (!SURFACES[id]) return;
    current.surface = id;
    Object.assign(surfaceTarget, SURFACES[id]);
    if (reducedMotion()) Object.assign(slabMat, SURFACES[id]);
    stage.invalidate();
  }

  let viewW = 1;
  let viewH = 1;
  let slabW = 1.2;
  function fitCamera() {
    if (slab) { slab.geometry.computeBoundingBox(); slabW = slab.geometry.boundingBox.max.x * 2; }
    const aspect = viewW / Math.max(1, viewH);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const d = Math.max((fitHeight * 1.28) / 2 / Math.tan(vFov / 2), (slabW * 1.5) / 2 / (Math.tan(vFov / 2) * aspect));
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);
  }
  stage.onResize((w, h) => { viewW = w; viewH = h; fitCamera(); });

  // ── Interaction: drag to tilt, hover to steer the light ──
  const tilt = { x: -0.06, y: 0.16, tx: -0.06, ty: 0.16 };
  const light = { x: 0, tx: 0, y: 0, ty: 0 };
  let dragging = false;
  let last = null;
  let autoLight = true;
  let hoverHold = 0;
  const el = stage.canvas;
  el.style.touchAction = 'pan-y';

  const onDown = (e) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    el.setPointerCapture?.(e.pointerId);
    container.classList.add('is-dragging');
  };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (dragging && last) {
      tilt.ty = THREE.MathUtils.clamp(tilt.ty + (e.clientX - last.x) * 0.006, -0.75, 0.75);
      tilt.tx = THREE.MathUtils.clamp(tilt.tx + (e.clientY - last.y) * 0.006, -0.6, 0.6);
      last = { x: e.clientX, y: e.clientY };
    }
    if (e.pointerType === 'mouse' || dragging) {
      light.tx = nx * 1.6;
      light.ty = -ny * 0.8;
      hoverHold = 2.5;
    }
    stage.invalidate();
  };
  const onUp = (e) => {
    dragging = false;
    last = null;
    el.releasePointerCapture?.(e.pointerId);
    container.classList.remove('is-dragging');
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);

  container.tabIndex = 0;
  const onKey = (e) => {
    const k = { ArrowLeft: [0, -0.1], ArrowRight: [0, 0.1], ArrowUp: [-0.1, 0], ArrowDown: [0.1, 0] }[e.key];
    if (!k) return;
    e.preventDefault();
    tilt.tx = THREE.MathUtils.clamp(tilt.tx + k[0], -0.6, 0.6);
    tilt.ty = THREE.MathUtils.clamp(tilt.ty + k[1], -0.75, 0.75);
    stage.invalidate();
  };
  container.addEventListener('keydown', onKey);

  stage.onFrame((dt, t) => {
    const rm = reducedMotion();
    let moving = false;
    const lerp = (a, b, s) => a + (b - a) * Math.min(1, dt * s);

    if (autoLight && hoverHold <= 0 && !rm) {
      light.tx = Math.sin(t * 0.55) * 1.7;
      light.ty = Math.sin(t * 0.31) * 0.35;
    }
    hoverHold -= dt;
    const pl = light.x;
    light.x = lerp(light.x, light.tx, 3);
    light.y = lerp(light.y, light.ty, 3);
    if (Math.abs(pl - light.x) > 1e-4) moving = true;
    sweep.position.set(light.x, light.y, 2.2);
    sweep.lookAt(light.x * 0.15, light.y * 0.15, 0);

    const idle = rm ? 0 : Math.sin(t * 0.6) * 0.03;
    const px = tilt.x;
    const py = tilt.y;
    tilt.x = lerp(tilt.x, tilt.tx, 6);
    tilt.y = lerp(tilt.y, tilt.ty, 6);
    if (Math.abs(px - tilt.x) + Math.abs(py - tilt.y) > 1e-4) moving = true;
    pivot.rotation.set(tilt.x, tilt.y + idle, 0);

    ['roughness', 'clearcoat', 'clearcoatRoughness'].forEach((p) => {
      const v = slabMat[p];
      slabMat[p] = lerp(v, surfaceTarget[p], 5);
      if (Math.abs(v - surfaceTarget[p]) > 1e-3) moving = true;
    });

    if (slab) {
      if (reveal < 1) {
        reveal = Math.min(1, reveal + dt * 1.8);
        const k = 1 - (1 - reveal) ** 3;
        slab.position.y = (1 - k) * -0.25;
        slab.rotation.y = (1 - k) * -0.5;
        moving = true;
      } else {
        slab.position.y = 0;
        slab.rotation.y = 0;
      }
    }
    return moving;
  });

  setSlab(current.slab);
  setSurface(current.surface);
  Object.assign(slabMat, SURFACES.polished);

  return {
    setSlab,
    setSurface,
    setAutoLight(v) { autoLight = v; stage.invalidate(); },
    dispose() {
      unsubLight();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      container.removeEventListener('keydown', onKey);
      textures.forEach((s) => Object.values(s).forEach((tx) => tx.dispose()));
      edgeMat.dispose();
      stage.dispose();
    },
  };
}
