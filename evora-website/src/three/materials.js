import * as THREE from 'three';
import { FINISHES, getFinishState } from '../finishes.js';
import {
  stoneMaps, brushedMaps, porcelainMaps, woodMaps,
} from '../textures.js';
import { reducedMotion } from './stage.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * One shared set of physically-based materials per renderer.
 * Every material carries albedo / normal / roughness detail maps, and the
 * finish system tweens their parameters without shader recompiles.
 */
export function createMaterialLibrary(renderer, { lowSpec = false } = {}) {
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const textures = new Set();
  const tex = (canvas, { srgb = false, repeat = [1, 1] } = {}) => {
    const t = new THREE.CanvasTexture(canvas);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = maxAniso;
    textures.add(t);
    return t;
  };
  const size = lowSpec ? 512 : 1024;

  // ── base maps ──
  const brushed = brushedMaps(lowSpec ? 256 : 512);
  const porcelain = porcelainMaps(lowSpec ? 256 : 512);
  const wood = woodMaps(lowSpec ? 512 : 1024);
  const plaster = stoneMaps('limestone', size);

  const whiteCanvas = document.createElement('canvas');
  whiteCanvas.width = whiteCanvas.height = 4;
  const wctx = whiteCanvas.getContext('2d');
  wctx.fillStyle = '#fff';
  wctx.fillRect(0, 0, 4, 4);

  // Stone textures are UV'd in metres → repeat 0.42 ≈ one texture per 2.4 m.
  const STONE_REPEAT = 0.42;
  const stoneSets = new Map();
  function stoneSet(name) {
    if (stoneSets.has(name)) return stoneSets.get(name);
    const m = stoneMaps(name, size);
    const r = [STONE_REPEAT, STONE_REPEAT];
    const set = {
      map: tex(m.albedo, { srgb: true, repeat: r }),
      normal: tex(m.normal, { repeat: r }),
      rough: tex(m.rough, { repeat: r }),
      // separate instances for lathe/UV(0..1) ceramic bodies
      cMap: tex(m.albedo, { srgb: true, repeat: [2, 1] }),
      cNormal: tex(m.normal, { repeat: [2, 1] }),
      cRough: tex(m.rough, { repeat: [2, 1] }),
    };
    stoneSets.set(name, set);
    return set;
  }

  const ceramicNeutral = {
    map: tex(whiteCanvas, { srgb: true }),
    normal: tex(porcelain.normal, { repeat: [14, 7] }),
    rough: tex(porcelain.rough, { repeat: [14, 7] }),
  };

  const metal = new THREE.MeshPhysicalMaterial({
    ...FINISHES.gold.params,
    roughnessMap: tex(brushed.rough, { repeat: [10, 3] }),
    normalMap: tex(brushed.normal, { repeat: [10, 3] }),
    normalScale: new THREE.Vector2(0.05, 0.05),
  });
  const ceramic = new THREE.MeshPhysicalMaterial({
    ...FINISHES.white.params,
    map: ceramicNeutral.map,
    normalMap: ceramicNeutral.normal,
    roughnessMap: ceramicNeutral.rough,
    normalScale: new THREE.Vector2(0.07, 0.07),
  });
  const stone = new THREE.MeshPhysicalMaterial({
    roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.18, normalScale: new THREE.Vector2(0.6, 0.6),
  });
  const stoneHoned = new THREE.MeshPhysicalMaterial({
    roughness: 0.95, clearcoat: 0.001, normalScale: new THREE.Vector2(1, 1),
  });
  function applyStone(name) {
    const s = stoneSet(name);
    [stone, stoneHoned].forEach((m) => {
      m.map = s.map;
      m.normalMap = s.normal;
      m.roughnessMap = s.rough;
      m.needsUpdate = true;
    });
    currentStone = name;
  }
  let currentStone = null;

  const plasterSet = {
    map: tex(plaster.albedo, { srgb: true, repeat: [0.5, 0.5] }),
    normal: tex(plaster.normal, { repeat: [0.5, 0.5] }),
    rough: tex(plaster.rough, { repeat: [0.5, 0.5] }),
  };
  const wall = new THREE.MeshStandardMaterial({
    color: 0xe7e1d7, map: plasterSet.map, normalMap: plasterSet.normal, roughnessMap: plasterSet.rough, roughness: 1,
    normalScale: new THREE.Vector2(0.5, 0.5),
  });
  const plinth = new THREE.MeshStandardMaterial({
    color: 0xc9c2b6, map: plasterSet.map, normalMap: plasterSet.normal, roughnessMap: plasterSet.rough, roughness: 1,
    normalScale: new THREE.Vector2(0.8, 0.8),
  });
  const grout = new THREE.MeshStandardMaterial({ color: 0x8e887e, roughness: 1 });
  const reveal = new THREE.MeshStandardMaterial({ color: 0x15120f, roughness: 0.9 });
  const metalDark = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.55, metalness: 0.3 });
  const woodMat = new THREE.MeshPhysicalMaterial({
    map: tex(wood.albedo, { srgb: true, repeat: [1.2, 1.2] }),
    normalMap: tex(wood.normal, { repeat: [1.2, 1.2] }),
    roughnessMap: tex(wood.rough, { repeat: [1.2, 1.2] }),
    roughness: 0.85, clearcoat: 0.12, clearcoatRoughness: 0.5, normalScale: new THREE.Vector2(0.5, 0.5),
  });
  const duroplast = new THREE.MeshPhysicalMaterial({ color: 0xf6f4f0, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xf2faf6,
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    ior: 1.5,
    thickness: 0.008,
    attenuationColor: new THREE.Color(0xb9dccb),
    attenuationDistance: 0.25,
    specularIntensity: 1,
    envMapIntensity: 1.2,
    transparent: false,
  });
  const glassEdge = new THREE.MeshPhysicalMaterial({
    color: 0x8fbfa6, roughness: 0.15, transmission: 0.35, ior: 1.5, thickness: 0.05, metalness: 0,
  });
  const sheen = document.createElement('canvas');
  sheen.width = 64;
  sheen.height = 256;
  const sctx = sheen.getContext('2d');
  const grad = sctx.createLinearGradient(0, 0, 64, 256);
  grad.addColorStop(0, '#9a9792');
  grad.addColorStop(0.45, '#6d6a66');
  grad.addColorStop(0.55, '#8a8782');
  grad.addColorStop(1, '#3e3c3a');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 64, 256);
  const mirrorSheen = tex(sheen, { srgb: true });
  mirrorSheen.wrapS = mirrorSheen.wrapT = THREE.ClampToEdgeWrapping;
  // mirror panel UVs are metres (±0.40 × ±0.475) → stretch the sheen across the whole glass
  mirrorSheen.repeat.set(1.25, 1.05);
  mirrorSheen.offset.set(0.5, 0.5);
  const mirror = new THREE.MeshPhysicalMaterial({
    color: 0xeef2f4, metalness: 1, roughness: 0.06, envMapIntensity: 2.4,
    emissive: 0xffffff, emissiveMap: mirrorSheen, emissiveIntensity: 0.35,
  });
  const led = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffc285, emissiveIntensity: 3, roughness: 1 });

  // ── finish transitions ──
  const transitions = [];
  const PROPS = ['metalness', 'roughness', 'anisotropy', 'clearcoat', 'clearcoatRoughness'];
  function tweenTo(mat, params, instant) {
    const to = { ...params, anisotropy: Math.max(0.001, params.anisotropy), clearcoat: Math.max(0.001, params.clearcoat) };
    const from = { color: mat.color.clone() };
    PROPS.forEach((p) => { from[p] = mat[p]; });
    for (let i = transitions.length - 1; i >= 0; i--) if (transitions[i].mat === mat) transitions.splice(i, 1);
    transitions.push({ mat, from, to, toColor: new THREE.Color(to.color), t: instant || reducedMotion() ? 1 : 0 });
  }

  function setFinish(id, instant = false) {
    const f = FINISHES[id];
    if (!f) return;
    if (f.group === 'metal') {
      tweenTo(metal, f.params, instant);
    } else {
      const set = f.stone === 'travertine' ? stoneSet('travertine') : null;
      ceramic.map = set ? set.cMap : ceramicNeutral.map;
      ceramic.normalMap = set ? set.cNormal : ceramicNeutral.normal;
      ceramic.roughnessMap = set ? set.cRough : ceramicNeutral.rough;
      tweenTo(ceramic, f.params, instant);
      if (!stoneLocked) applyStone(f.stone);
    }
    if (instant) update(0);
  }

  let stoneLocked = false;
  /** Override the stone surfaces (e.g. Nero Marquina tile wall); null returns to the finish stone. */
  function setStoneOverride(name) {
    stoneLocked = !!name;
    applyStone(name || FINISHES[getFinishState().ceramic].stone);
  }

  function update(dt) {
    for (let i = transitions.length - 1; i >= 0; i--) {
      const tr = transitions[i];
      tr.t = Math.min(1, tr.t + dt / 0.7);
      const k = easeInOut(tr.t);
      tr.mat.color.lerpColors(tr.from.color, tr.toColor, k);
      PROPS.forEach((p) => { tr.mat[p] = tr.from[p] + (tr.to[p] - tr.from[p]) * k; });
      if (tr.t >= 1) transitions.splice(i, 1);
    }
    return transitions.length > 0;
  }

  const initial = getFinishState();
  setFinish(initial.metal, true);
  setFinish(initial.ceramic, true);
  update(1);

  const all = [metal, ceramic, stone, stoneHoned, wall, plinth, grout, reveal, metalDark, woodMat, duroplast, glass, glassEdge, mirror, led];

  return {
    metal, ceramic, stone, stoneHoned, wall, plinth, grout, reveal, metalDark,
    wood: woodMat, duroplast, glass, glassEdge, mirror, led,
    setFinish,
    setStoneOverride,
    currentStone: () => currentStone,
    update,
    dispose() {
      all.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
