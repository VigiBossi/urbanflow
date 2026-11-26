import * as THREE from 'three';
import {
  V, mesh, slab, panel, box,
} from './common.js';

/**
 * 5 · Ceramic & marble feature wall
 * Individually beveled 60×120 slabs on a recessed grout bed, returning onto a
 * 60×60 floor. Each tile's UVs are its real position, so every slab shows a
 * different run of veining (sequence-matched like a real installation).
 * A raking spotlight grazes the surface to reveal relief and sheen.
 */
export default {
  id: 'tiles',
  azimuth: [-1.2, 1.2],
  studio: { az: 0.5, el: 0.18 },
  noWater: true,
  build({ lib }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);
    const wallZ = -0.5;
    const gap = 0.003;
    const tT = 0.009;
    const W = 2.4;
    const Hh = 2.4;

    const bed = mesh(box(W + 0.02, Hh + 0.01, 0.02), lib.grout);
    bed.position.set(0, Hh / 2, wallZ - 0.01);
    const floorBed = mesh(box(W + 0.02, 0.004, 1.22), lib.grout);
    floorBed.position.set(0, 0.002, wallZ + 0.61);
    product.add(bed, floorBed);

    // Wall: 4 × 2 slabs of 60 × 120 cm
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 2; r++) {
        const cx = -W / 2 + 0.3 + c * 0.6;
        const cy = 0.6 + r * 1.2;
        const g = panel({ w: 0.6 - gap, h: 1.2 - gap, t: tT, r: 0.0015, bevel: 0.0014, cx, cy });
        const t = mesh(g, lib.stone, { name: 'tile' });
        t.position.z = wallZ;
        product.add(t);
      }
    }
    // Floor: 4 × 2 tiles of 60 × 60 cm (honed, anti-slip)
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 2; r++) {
        const cx = -W / 2 + 0.3 + c * 0.6;
        const cz = wallZ + 0.3 + r * 0.6 + 0.002;
        const t = mesh(slab({ w: 0.6 - gap, d: 0.6 - gap, t: tT, r: 0.0015, bevel: 0.0014, cx, cz }), lib.stoneHoned);
        t.position.y = 0.004;
        product.add(t);
      }
    }

    // Raking light (grazing from the left) — only lit while this model is shown
    const rake = new THREE.SpotLight(0xfff1de, 14, 6, 0.55, 0.85, 1.6);
    rake.position.set(-2.4, 1.6, wallZ + 0.35);
    rake.target.position.set(0.6, 1.1, wallZ);
    root.add(rake, rake.target);

    return {
      root,
      product,
      hotspots: [
        { id: 'slab', pos: V(0.35, 1.75, wallZ + tT) },
        { id: 'joint', pos: V(-0.6, 1.2, wallZ + tT) },
        { id: 'floor', pos: V(0.45, 0.014, 0.25) },
        { id: 'edge', pos: V(1.2, 0.85, wallZ + tT) },
      ],
      water: null,
      detail: { target: V(-0.45, 1.2, wallZ), dist: 0.8, az: 0.95, el: 0.06 },
      setLight(preset) {
        rake.intensity = preset.bg === 'evening' ? 22 : 14;
        rake.color.set(preset.key);
      },
    };
  },
};
