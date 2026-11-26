import * as THREE from 'three';
import {
  V, mesh, lathe, stretchX, tube, lever, setMaterial, contactShadow, wandGeometry,
} from './common.js';

// Tub profile [radius, y]: foot → bulging outer wall → rolled rim → inner cavity → floor.
const E = 0.45; // half-length added along X → 1.69 m × 0.79 m double-ended oval
const OUTER = [[0.0, 0.0], [0.27, 0.0], [0.29, 0.008], [0.3, 0.03], [0.34, 0.2], [0.375, 0.4], [0.392, 0.55], [0.396, 0.585]];
const RIM = [[0.393, 0.6], [0.382, 0.608], [0.366, 0.606], [0.356, 0.594]];
const INNER = [[0.35, 0.56], [0.34, 0.45], [0.315, 0.28], [0.27, 0.15], [0.2, 0.075], [0.11, 0.05], [0.04, 0.046], [0.0, 0.046]];

function innerRadiusAt(y) {
  for (let i = 0; i < INNER.length - 1; i++) {
    const [r0, y0] = INNER[i];
    const [r1, y1] = INNER[i + 1];
    if (y <= y0 && y >= y1) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
  }
  return y > INNER[0][1] ? INNER[0][0] : 0;
}

/**
 * 4 · Freestanding sculptural bathtub
 * Double-ended oval with a true recessed cavity, rolled ergonomic rim, centre drain
 * and overflow slot, plus a floor-mounted filler with a docked hand wand.
 */
export default {
  id: 'bathtub',
  azimuth: null, // full 360°
  studio: { az: 0.75, el: 0.3 },
  build({ lib, lowSpec }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);

    const tub = mesh(lathe([...OUTER, ...RIM, ...INNER], {
      segments: lowSpec ? 96 : 160, samples: lowSpec ? 140 : 240, deform: stretchX(E),
    }), lib.ceramic, { name: 'tub' });
    product.add(tub);
    root.add(contactShadow(2.05, 1.05, 0.55, V(0, 0.001, 0)));

    // Centre drain + slotted overflow at the foot end
    const drain = mesh(lathe([[0, 0.004], [0.026, 0.0034], [0.034, 0.0012], [0.035, 0]], { segments: 48, samples: 24 }), lib.metal);
    drain.position.set(0, 0.046, 0);
    product.add(drain);
    const ovX = -(innerRadiusAt(0.47) + E) + 0.006;
    const overflow = mesh(new THREE.CapsuleGeometry(0.006, 0.05, 6, 16), lib.metal);
    overflow.rotation.x = Math.PI / 2;
    overflow.scale.set(1, 1, 0.5);
    overflow.position.set(ovX, 0.47, 0);
    const ovSlot = mesh(new THREE.CapsuleGeometry(0.0025, 0.042, 4, 12), lib.metalDark, { cast: false });
    ovSlot.rotation.x = Math.PI / 2;
    ovSlot.position.set(ovX + 0.0035, 0.47, 0);
    product.add(overflow, ovSlot);

    // Floor-mounted filler
    const fx = 1.02;
    const filler = new THREE.Group();
    filler.position.set(fx, 0, 0.05);
    const base = mesh(lathe([[0, 0], [0.055, 0], [0.056, 0.004], [0.05, 0.014], [0.03, 0.02], [0, 0.02]], { segments: 48, samples: 40 }), lib.metal);
    const column = mesh(tube([
      V(0, 0.015, 0), V(0, 0.5, 0), V(0, 0.86, 0), V(-0.03, 0.94, 0), V(-0.1, 0.97, 0), V(-0.18, 0.95, 0), V(-0.23, 0.89, 0), V(-0.245, 0.82, 0),
    ], 0.0145, { segments: lowSpec ? 120 : 200, radial: 24 }), lib.metal);
    const aer = mesh(new THREE.CylinderGeometry(0.0158, 0.015, 0.018, 28), lib.metal);
    aer.position.set(-0.245, 0.815, 0);
    const insert = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 28), lib.metalDark, { cast: false });
    insert.position.set(-0.245, 0.8055, 0);
    const knobBody = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 28), lib.metal);
    knobBody.position.set(0, 0.62, 0);
    const handle = setMaterial(lever(0.08, 0.0065, 0.0045), lib.metal);
    handle.position.set(0.0, 0.645, 0.012);
    handle.rotation.set(1.15, 0, 0);
    // docked hand wand + cradle + hose
    const cradle = mesh(new THREE.TorusGeometry(0.02, 0.006, 10, 28), lib.metal);
    cradle.rotation.x = Math.PI / 2;
    cradle.position.set(0.045, 0.7, 0);
    const wand = mesh(wandGeometry(0.95), lib.metal);
    wand.position.set(0.045, 0.56, 0);
    wand.rotation.z = -0.08;
    const hose = mesh(tube([V(0.045, 0.565, 0), V(0.05, 0.4, 0.01), V(0.06, 0.22, 0.03), V(0.03, 0.08, 0.02), V(0.008, 0.03, 0)], 0.0062, { segments: 60, radial: 10 }), lib.metal);
    filler.add(base, column, aer, insert, knobBody, handle, cradle, wand, hose);
    product.add(filler);
    root.add(contactShadow(0.22, 0.22, 0.5, V(fx, 0.0015, 0.05)));

    const tipX = fx - 0.245;
    const tipY = 0.806;
    return {
      root,
      product,
      hotspots: [
        { id: 'tubrim', pos: V(-0.55, 0.61, 0.32) },
        { id: 'shell', pos: V(0.1, 0.32, 0.37) },
        { id: 'filler', pos: V(fx, 0.75, 0.07) },
        { id: 'tubdrain', pos: V(0, 0.06, 0) },
      ],
      water: {
        stream: { points: [V(tipX, tipY, 0.05), V(tipX - 0.01, 0.6, 0.05), V(tipX - 0.03, 0.3, 0.05), V(tipX - 0.04, 0.06, 0.05)], radius: 0.0062 },
        ripples: [{ pos: V(tipX - 0.035, 0.06, 0.05), radius: 0.16, followFill: true }],
        fill: {
          center: V(0, 0, 0), minY: 0.05, maxY: 0.44,
          radiusAt: (y) => { const r = Math.max(0.01, innerRadiusAt(y) - 0.003); return [r + E, r]; },
        },
      },
      detail: { target: V(0.85, 0.72, 0.05), dist: 0.85, az: 0.9, el: 0.18 },
    };
  },
};
