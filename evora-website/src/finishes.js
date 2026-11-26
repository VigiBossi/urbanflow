// Shared finish definitions used by the 3D scenes and the UI swatches.
// "metal" finishes drive the faucet, drain and plinth ring;
// "ceramic" finishes drive the sculpted basin body.

export const FINISHES = {
  gold: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#f1dcae 0%,#c6a76e 45%,#8f7342 100%)',
    params: { color: 0xd9b77d, metalness: 1, roughness: 0.3, anisotropy: 0.75, clearcoat: 0, clearcoatRoughness: 0.2 },
  },
  black: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#3a3a3a 0%,#161616 55%,#050505 100%)',
    params: { color: 0x1b1b1b, metalness: 0.35, roughness: 0.58, anisotropy: 0, clearcoat: 0.2, clearcoatRoughness: 0.55 },
  },
  chrome: {
    group: 'metal',
    swatch: 'linear-gradient(135deg,#ffffff 0%,#c9ccd0 45%,#7d8186 100%)',
    params: { color: 0xe4e6e9, metalness: 1, roughness: 0.2, anisotropy: 0.85, clearcoat: 0, clearcoatRoughness: 0.2 },
  },
  travertine: {
    group: 'ceramic',
    swatch: 'linear-gradient(135deg,#e9dcc4 0%,#d2bc96 50%,#b39a72 100%)',
    params: { color: 0xffffff, metalness: 0, roughness: 0.5, anisotropy: 0, clearcoat: 0.35, clearcoatRoughness: 0.35 },
    map: 'travertine',
  },
  white: {
    group: 'ceramic',
    swatch: 'linear-gradient(135deg,#ffffff 0%,#f1eee8 55%,#dcd7ce 100%)',
    params: { color: 0xf2efe9, metalness: 0, roughness: 0.62, anisotropy: 0, clearcoat: 0.12, clearcoatRoughness: 0.6 },
  },
};

export const FINISH_ORDER = ['gold', 'black', 'chrome', 'travertine', 'white'];

// Tiny global store so the hero, the studio and the UI stay in sync.
const state = { metal: 'gold', ceramic: 'white' };
const listeners = new Set();

export function getFinishState() {
  return { ...state };
}

export function setFinish(id) {
  const f = FINISHES[id];
  if (!f || state[f.group] === id) return;
  state[f.group] = id;
  listeners.forEach((fn) => fn({ ...state }, id));
}

export function onFinishChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

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
  polished: { roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.04 },
  satin: { roughness: 0.3, clearcoat: 0.45, clearcoatRoughness: 0.28 },
  matte: { roughness: 0.78, clearcoat: 0, clearcoatRoughness: 0.6 },
};
