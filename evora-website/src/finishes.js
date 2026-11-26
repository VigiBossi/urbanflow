// Shared finish, lighting and 3D-slot definitions used by the 3D scenes and the UI.
// "metal" finishes drive faucets, drains, rails and trims;
// "ceramic" finishes drive ceramic bodies AND the stone surfaces
// (Travertine → travertine stone, Matte White Porcelain → Calacatta marble).

export const FINISHES = {
  gold: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#f1dcae 0%,#c6a76e 45%,#8f7342 100%)',
    params: { color: 0xd7b278, metalness: 1, roughness: 0.34, anisotropy: 0.7, clearcoat: 0, clearcoatRoughness: 0.2 },
  },
  black: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#3a3a3a 0%,#161616 55%,#050505 100%)',
    params: { color: 0x1c1c1c, metalness: 0.4, roughness: 0.6, anisotropy: 0, clearcoat: 0.25, clearcoatRoughness: 0.55 },
  },
  chrome: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#ffffff 0%,#c9ccd0 45%,#7d8186 100%)',
    params: { color: 0xe2e5e8, metalness: 1, roughness: 0.22, anisotropy: 0.8, clearcoat: 0, clearcoatRoughness: 0.2 },
  },
  travertine: {
    group: 'ceramic',
    swatch: 'linear-gradient(135deg,#e9dcc4 0%,#d2bc96 50%,#b39a72 100%)',
    params: { color: 0xffffff, metalness: 0, roughness: 0.62, anisotropy: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 },
    stone: 'travertine',
  },
  white: {
    group: 'ceramic',
    swatch: 'linear-gradient(135deg,#ffffff 0%,#f1eee8 55%,#dcd7ce 100%)',
    params: { color: 0xf4f1ec, metalness: 0, roughness: 0.66, anisotropy: 0, clearcoat: 0.15, clearcoatRoughness: 0.55 },
    stone: 'calacatta',
  },
};

export const FINISH_ORDER = ['gold', 'black', 'chrome', 'travertine', 'white'];

// ── tiny observable store ──
function createStore(initial) {
  let state = { ...initial };
  const fns = new Set();
  return {
    get: () => ({ ...state }),
    set(patch, info) {
      const next = { ...state, ...patch };
      if (Object.keys(patch).every((k) => state[k] === next[k])) return;
      state = next;
      fns.forEach((fn) => fn({ ...state }, info));
    },
    on(fn) { fns.add(fn); return () => fns.delete(fn); },
  };
}

const finishStore = createStore({ metal: 'gold', ceramic: 'white' });
export const getFinishState = finishStore.get;
export const onFinishChange = finishStore.on;
export function setFinish(id) {
  const f = FINISHES[id];
  if (f) finishStore.set({ [f.group]: id }, id);
}

// ── showroom lighting ──
export const LIGHT_PRESETS = {
  warm: {
    key: 0xffe4c8, keyI: 2.4, fill: 0xfff0e2, fillI: 0.4, rim: 0xfff0e0, rimI: 0.7,
    hemiSky: 0xfff8ee, hemiGround: 0xdcd4c8, hemiI: 0.35, env: 0.85, exposure: 1.0, led: 1, bg: 'warm',
  },
  daylight: {
    key: 0xfff3e6, keyI: 2.7, fill: 0xeef3ff, fillI: 0.45, rim: 0xe4ecff, rimI: 0.8,
    hemiSky: 0xf6f8ff, hemiGround: 0xd9d4cc, hemiI: 0.5, env: 1.05, exposure: 1.05, led: 0.6, bg: 'day',
  },
  evening: {
    key: 0xffa866, keyI: 0.45, fill: 0x8a9cc8, fillI: 0.08, rim: 0xffd2a0, rimI: 2.4,
    hemiSky: 0x5a5a78, hemiGround: 0x1a1612, hemiI: 0.08, env: 0.22, exposure: 0.95, led: 2.6, bg: 'evening',
  },
};
export const LIGHT_ORDER = ['warm', 'daylight', 'evening'];

const lightStore = createStore({ lighting: 'warm' });
export const getLighting = () => lightStore.get().lighting;
export const setLighting = (id) => { if (LIGHT_PRESETS[id]) lightStore.set({ lighting: id }); };
export const onLightingChange = (fn) => lightStore.on((s) => fn(s.lighting));

// ── 3D showcase slots ──
export const SHOWCASE = ['basin', 'shower', 'vanity', 'bathtub', 'tiles', 'wc'];

// ── Material studio slabs ──
export const SLABS = {
  calacatta: { stone: 'calacatta', format: [120, 240], thickness: 6, use: 'use.floorWall', product: 't-calacatta' },
  nero: { stone: 'nero', format: [60, 120], thickness: 9, use: 'use.floorWall', product: 't-nero' },
  travertine: { stone: 'travertine', format: [60, 120], thickness: 9, use: 'use.floorWallFacade', product: 't-travertine' },
  verde: { stone: 'verde', format: [120, 120], thickness: 6, use: 'use.wallFeature', product: 't-verde' },
  cemento: { stone: 'cemento', format: [80, 80], thickness: 10, use: 'use.floorWallFacade', product: 't-cemento' },
};

export const SLAB_NAMES = {
  calacatta: 'Calacatta Oro',
  nero: 'Nero Marquina',
  travertine: 'Travertino Classico',
  verde: 'Verde Alpi',
  cemento: 'Cemento Grigio',
};

export const SURFACES = {
  polished: { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 },
  satin: { roughness: 0.38, clearcoat: 0.45, clearcoatRoughness: 0.28 },
  matte: { roughness: 0.85, clearcoat: 0, clearcoatRoughness: 0.6 },
};
