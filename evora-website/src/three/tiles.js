import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createStage, reducedMotion, coarsePointer, smallScreen } from './stage.js';
import { stoneCanvas, STONES } from '../textures.js';
import { SLABS, SURFACES } from '../finishes.js';

/**
 * Large-format slab you can tilt; a soft rectangular light sweeps across it
 * so the polish, veining and sheen read like they do in the showroom.
 */
export function createTileInspector(container) {
  RectAreaLightUniformsLib.init();
  const lowSpec = smallScreen() || coarsePointer;
  const stage = createStage(container, { fov: 30, envIntensity: 0.6, toneExposure: 1.0 });
  const { scene, camera, renderer } = stage;

  const slabMat = new THREE.MeshPhysicalMaterial({ roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.04 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xdedad3, roughness: 0.6 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x8f8a83, roughness: 0.9 });
  // Box faces: +x, -x, +y, -y, +z (front), -z (back)
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [edgeMat, edgeMat, edgeMat, edgeMat, slabMat, backMat]);
  const pivot = new THREE.Group();
  pivot.add(slab);
  scene.add(pivot);

  // Soft studio lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.18));
  const sweep = new THREE.RectAreaLight(0xfff4e6, 3.2, 0.3, 3.4);
  sweep.position.set(0, 0, 2.2);
  sweep.lookAt(0, 0, 0);
  scene.add(sweep);
  const top = new THREE.DirectionalLight(0xffffff, 0.8);
  top.position.set(-1.5, 2.5, 2);
  scene.add(top);

  camera.position.set(0, 0, 4.2);
  camera.lookAt(0, 0, 0);

  const textures = new Map();
  function textureFor(stone, aspect) {
    const key = `${stone}:${aspect}`;
    if (textures.has(key)) return textures.get(key);
    const w = lowSpec ? 640 : 1024;
    const tex = new THREE.CanvasTexture(stoneCanvas(stone, w, aspect));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.set(key, tex);
    return tex;
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
    const maxSide = 2.3;
    const scale = maxSide / Math.max(wcm, hcm);
    const w = wcm * scale;
    const h = hcm * scale;
    slab.scale.set(w, h, Math.max(0.02, s.thickness * 0.0035));
    const aspect = hcm / wcm;
    slabMat.map = textureFor(s.stone, aspect);
    slabMat.needsUpdate = true;
    edgeMat.color.set(STONES[s.stone].avg).multiplyScalar(0.92);
    backMat.color.set(STONES[s.stone].avg).multiplyScalar(0.55);
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
  function fitCamera() {
    const aspect = viewW / Math.max(1, viewH);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const needH = fitHeight * 1.28;
    const needW = slab.scale.x * 1.5;
    const d = Math.max(needH / 2 / Math.tan(vFov / 2), needW / 2 / (Math.tan(vFov / 2) * aspect));
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

  // Keyboard access: arrows tilt the slab
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
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      container.removeEventListener('keydown', onKey);
      textures.forEach((t) => t.dispose());
      stage.dispose();
    },
  };
}
