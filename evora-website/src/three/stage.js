import * as THREE from 'three';

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => motionQuery.matches;
export const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
export const smallScreen = () => window.innerWidth < 760;
export const lowSpecDevice = () => smallScreen() || coarsePointer;

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

function disposeMaterial(m) {
  Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
  m.dispose();
}

/** Free every geometry, material and texture in a tree (used on full teardown). */
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(disposeMaterial);
  });
}

/**
 * Free geometries in a tree, plus only those materials flagged `userData.owned`.
 * Shared library materials survive model switches.
 */
export function disposeModel(root) {
  const seen = new Set();
  root.traverse((obj) => {
    if (obj.geometry && !seen.has(obj.geometry)) { seen.add(obj.geometry); obj.geometry.dispose(); }
    const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
    mats.forEach((m) => {
      if (m.userData?.owned && !seen.has(m)) { seen.add(m); disposeMaterial(m); }
    });
  });
}

/**
 * Clean photographic studio for reflections: a soft grey cyclorama with
 * large overhead and side softboxes, PMREM-filtered once at startup.
 */
function studioEnvironment() {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(12, 7, 12),
    new THREE.MeshBasicMaterial({ color: 0x4a4744, side: THREE.BackSide }),
  );
  room.position.y = 2.5;
  scene.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: 0x2a2826 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.95;
  scene.add(floor);
  const box = (w, h, x, y, z, intensity, rotY = 0, rotX = 0, tint = 0xffffff) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(x, y, z);
    p.rotation.set(rotX, rotY, 0);
    scene.add(p);
  };
  box(5, 3, 0, 5.8, 0, 6, 0, Math.PI / 2); // overhead
  box(1.2, 4.5, -5.8, 2.4, -0.5, 4.5, Math.PI / 2); // left strip
  box(1.2, 4.5, 5.8, 2.4, 1.2, 3.2, -Math.PI / 2, 0, 0xfff1e0); // right strip (warm)
  box(3.5, 1.4, 0, 2.2, 5.8, 1.6, Math.PI); // front fill
  box(2.5, 2.5, -2, 2.6, -5.8, 2.2); // back kicker
  return scene;
}

function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });
}

/**
 * A lightweight render host:
 *  - ACES filmic tone mapping + PMREM studio reflections
 *  - sizes itself to its container (ResizeObserver)
 *  - renders only while on screen (IntersectionObserver) and the tab is visible
 *  - adaptive pixel ratio: drops resolution if frames get slow
 *  - on-demand rendering when nothing is animating (reduced motion)
 */
export function createStage(container, {
  fov = 30, shadows = false, envIntensity = 1, toneExposure = 1, maxDPR = 1.75,
} = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  const dprCap = Math.min(window.devicePixelRatio || 1, smallScreen() ? 1.5 : maxDPR);
  let dpr = dprCap;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = toneExposure;
  renderer.setClearColor(0x000000, 0);
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  const canvas = renderer.domElement;
  canvas.className = 'webgl-canvas';
  container.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.03, 60);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = studioEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.035);
  disposeScene(envScene);
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
    frameFns.forEach((fn) => { if (fn(dt, elapsed)) animating = true; });
    if (animating || dirty) {
      renderer.render(scene, camera);
      dirty = false;
      frameFns.forEach((fn) => fn.afterRender?.());
    }
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
    isRunning: () => running,
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
