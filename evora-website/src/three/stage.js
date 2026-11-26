import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => motionQuery.matches;
export const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
export const smallScreen = () => window.innerWidth < 760;

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

// Recursively free GPU resources owned by an object tree.
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        Object.values(m).forEach((v) => {
          if (v && v.isTexture) v.dispose();
        });
        m.dispose();
      });
    }
  });
}

/**
 * A lightweight render host:
 *  - sizes itself to its container (ResizeObserver)
 *  - renders only while on screen (IntersectionObserver) and while the tab is visible
 *  - adaptive pixel ratio: drops resolution if frames get slow
 *  - on-demand rendering when nothing is animating (reduced motion)
 */
export function createStage(container, {
  fov = 30, shadows = false, envIntensity = 1, toneExposure = 1, maxDPR = 1.75,
} = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  const dprCap = Math.min(window.devicePixelRatio || 1, smallScreen() ? 1.5 : maxDPR);
  let dpr = dprCap;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = toneExposure;
  renderer.setClearColor(0x000000, 0);
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  const canvas = renderer.domElement;
  canvas.className = 'webgl-canvas';
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 50);

  // Studio reflections: PMREM-filtered procedural room, no HDR file needed.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = envRT.texture;
  scene.environmentIntensity = envIntensity;

  const frameFns = new Set();
  const resizeFns = new Set();
  const clock = new THREE.Clock(false);
  let visible = false;
  let running = false;
  let dirty = true;
  let elapsed = 0;
  let slowFrames = 0;
  let sampled = 0;

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    resizeFns.forEach((fn) => fn(w, h));
    dirty = true;
  }

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    let animating = !reducedMotion();
    frameFns.forEach((fn) => {
      if (fn(dt, elapsed)) animating = true;
    });
    if (animating || dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
    // Adaptive resolution: sample 90 frames, step down if most are slow.
    if (animating && dpr > 1 && sampled < 90) {
      sampled++;
      if (dt > 1 / 45) slowFrames++;
      if (sampled === 90) {
        if (slowFrames > 45) {
          dpr = Math.max(1, dpr - 0.35);
          renderer.setPixelRatio(dpr);
          resize();
          sampled = 0;
        }
        slowFrames = 0;
      }
    }
  }

  function updateLoop() {
    const shouldRun = visible && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      clock.start();
      clock.getDelta();
      renderer.setAnimationLoop(tick);
    } else if (!shouldRun && running) {
      running = false;
      clock.stop();
      renderer.setAnimationLoop(null);
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    updateLoop();
  }, { rootMargin: '80px' });
  io.observe(container);
  const onVis = () => updateLoop();
  document.addEventListener('visibilitychange', onVis);

  resize();

  return {
    renderer,
    scene,
    camera,
    canvas,
    onFrame(fn) { frameFns.add(fn); },
    onResize(fn) { resizeFns.add(fn); fn(container.clientWidth, container.clientHeight); },
    invalidate() { dirty = true; },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      disposeObject(scene);
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
