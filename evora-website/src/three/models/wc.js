import * as THREE from 'three';
import {
  V, mesh, lathe, egg, panel, box, contactShadow,
} from './common.js';

/**
 * 6 · Wall-hung rimless WC
 * Egg-plan bowl (deformed lathe) with an open rimless cavity, back block into the
 * wall, slim soft-close seat, raised lid and a finish-matched dual flush plate.
 */
export default {
  id: 'wc',
  azimuth: [-1.35, 1.35],
  studio: { az: 0.7, el: 0.22 },
  noWater: true,
  build({ lib, lowSpec }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);
    const wallZ = -0.45;
    const bowlZ = -0.25;
    const baseY = 0.22;
    const plan = egg(1.5, 0.9);
    const seg = lowSpec ? 72 : 128;

    const wall = mesh(box(1.6, 2.2, 0.1), lib.wall);
    wall.position.set(0, 1.1, wallZ - 0.05);
    root.add(wall);

    const bowl = mesh(lathe([
      [0, 0], [0.08, 0], [0.12, 0.02], [0.155, 0.07], [0.175, 0.13], [0.18, 0.17], [0.178, 0.185], [0.172, 0.19],
      [0.162, 0.186], [0.158, 0.17], [0.14, 0.12], [0.1, 0.08], [0.06, 0.06], [0.04, 0.05], [0, 0.05],
    ], { segments: seg, samples: 200, deform: plan }), lib.ceramic, { name: 'bowl' });
    bowl.position.set(0, baseY, bowlZ);
    const back = mesh(panel({ w: 0.3, h: 0.16, t: 0.2, r: 0.06, bevel: 0.01 }), lib.ceramic);
    back.position.set(0, baseY + 0.095, wallZ);
    product.add(bowl, back);

    const seat = mesh(lathe([[0.122, 0], [0.18, 0], [0.186, 0.008], [0.178, 0.016], [0.13, 0.018], [0.12, 0.009], [0.122, 0]], { segments: seg, samples: 80, deform: plan }), lib.duroplast);
    seat.position.set(0, baseY + 0.19, bowlZ);
    product.add(seat);
    const lidGeo = lathe([[0, 0], [0.18, 0], [0.186, 0.009], [0.18, 0.016], [0, 0.016]], { segments: seg, samples: 50, deform: plan });
    lidGeo.translate(0, 0, 0.162);
    const lid = mesh(lidGeo, lib.duroplast);
    lid.position.set(0, baseY + 0.215, bowlZ - 0.15);
    lid.rotation.x = -(Math.PI / 2 + 0.1);
    product.add(lid);

    // Dual flush plate
    const plate = mesh(panel({ w: 0.25, h: 0.165, t: 0.006, r: 0.012, bevel: 0.0015 }), lib.metal);
    plate.position.set(0, 1.0, wallZ);
    const btnA = mesh(panel({ w: 0.075, h: 0.12, t: 0.004, r: 0.008, bevel: 0.0012 }), lib.metal);
    btnA.position.set(-0.042, 1.0, wallZ + 0.006);
    const btnB = mesh(panel({ w: 0.075, h: 0.12, t: 0.004, r: 0.008, bevel: 0.0012 }), lib.metal);
    btnB.position.set(0.042, 1.0, wallZ + 0.006);
    const split = mesh(box(0.004, 0.12, 0.003), lib.metalDark, { cast: false });
    split.position.set(0, 1.0, wallZ + 0.007);
    product.add(plate, btnA, btnB, split);
    root.add(contactShadow(0.55, 0.75, 0.22, V(0, 0.001, -0.2)));

    return {
      root,
      product,
      hotspots: [
        { id: 'rimless', pos: V(0, baseY + 0.12, bowlZ + 0.06) },
        { id: 'seat', pos: V(0.17, baseY + 0.21, bowlZ + 0.05) },
        { id: 'plate', pos: V(0.13, 1.06, wallZ + 0.01) },
        { id: 'frame', pos: V(-0.17, baseY + 0.1, wallZ + 0.1) },
      ],
      water: null,
      detail: { target: V(0, 0.38, -0.2), dist: 0.75, az: 0.55, el: 0.45 },
    };
  },
};
