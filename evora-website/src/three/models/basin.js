import * as THREE from 'three';
import {
  V, mesh, lathe, slab, box, tube, lever, setMaterial, contactShadow,
} from './common.js';

/**
 * 1 · Basin & Faucet
 * Thin-rim sculptural vessel (lathe) with inner cavity, recessed pop-up drain and
 * overflow ring, on a wall-hung beveled stone counter, with a gooseneck mixer.
 */
export default {
  id: 'basin',
  azimuth: [-1.3, 1.3],
  studio: { az: 0.55, el: 0.2 },
  build({ lib, lowSpec }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);
    const seg = lowSpec ? 72 : 128;
    const wallZ = -0.42;
    const counterY = 0.86;

    // Wall (plaster) + counter (stone slab, wall-hung with a shadow-gap bracket)
    const wall = mesh(box(1.9, 2.1, 0.1), lib.wall);
    wall.position.set(0, 1.05, wallZ - 0.05);
    root.add(wall);
    const counter = mesh(slab({ w: 1.1, d: 0.5, t: 0.04, r: 0.006, bevel: 0.004 }), lib.stone);
    counter.position.set(0, counterY - 0.04, wallZ + 0.25);
    const bracket = mesh(box(1.04, 0.012, 0.44), lib.reveal);
    bracket.position.set(0, counterY - 0.046, wallZ + 0.23);
    product.add(counter, bracket);

    // Vessel basin — profile [radius, y]: foot → outer wall → 6 mm rim → cavity → drain seat
    const basinZ = -0.15;
    const profile = [
      [0.0, 0.0], [0.095, 0.0], [0.105, 0.004], [0.11, 0.012], [0.15, 0.04], [0.19, 0.08],
      [0.208, 0.11], [0.212, 0.128], [0.21, 0.136], [0.205, 0.139], [0.2, 0.136],
      [0.196, 0.12], [0.185, 0.09], [0.15, 0.05], [0.09, 0.026], [0.045, 0.02],
      [0.036, 0.019], [0.033, 0.013], [0.0, 0.012],
    ];
    const basin = mesh(lathe(profile, { segments: seg, samples: lowSpec ? 120 : 220, deform: (v) => { v.z *= 0.8; } }), lib.ceramic, { name: 'basin' });
    basin.position.set(0, counterY, basinZ);
    product.add(basin);
    product.add(contactShadow(0.34, 0.28, 0.45, V(0, counterY + 0.0008, basinZ)));

    // Pop-up drain: domed cap in a recessed seat with a dark gap ring
    const cap = mesh(lathe([[0, 0.006], [0.02, 0.0052], [0.028, 0.003], [0.03, 0.0005], [0.03, 0]], { segments: 48, samples: 30 }), lib.metal);
    cap.position.set(0, counterY + 0.012, basinZ);
    const gap = mesh(new THREE.TorusGeometry(0.0318, 0.0014, 8, 48), lib.metalDark, { cast: false });
    gap.rotation.x = Math.PI / 2;
    gap.position.set(0, counterY + 0.0135, basinZ);
    product.add(cap, gap);

    // Overflow ring on the back inner wall
    const ovZ = basinZ - 0.185 * 0.8 + 0.004;
    const ring = mesh(new THREE.TorusGeometry(0.008, 0.0022, 12, 32), lib.metal);
    ring.position.set(0, counterY + 0.095, ovZ);
    ring.rotation.x = -0.35;
    const hole = mesh(new THREE.CircleGeometry(0.0075, 24), lib.metalDark, { cast: false });
    hole.position.set(0, counterY + 0.095, ovZ - 0.001);
    hole.rotation.x = -0.35;
    product.add(ring, hole);

    // Gooseneck mixer
    const fz = -0.36;
    const faucet = new THREE.Group();
    faucet.position.set(0, counterY, fz);
    const escutcheon = mesh(lathe([[0, 0], [0.026, 0], [0.028, 0.003], [0.026, 0.012], [0.018, 0.016], [0, 0.016]], { segments: 48, samples: 40 }), lib.metal);
    const body = mesh(lathe([[0, 0.01], [0.0172, 0.01], [0.0172, 0.128], [0.015, 0.142], [0.0115, 0.15], [0, 0.152]], { segments: 48, samples: 50 }), lib.metal);
    const neck = mesh(tube([
      V(0, 0.14, 0), V(0, 0.22, 0), V(0, 0.29, 0.02), V(0, 0.315, 0.075), V(0, 0.3, 0.14), V(0, 0.265, 0.18), V(0, 0.228, 0.19),
    ], 0.0105, { segments: lowSpec ? 90 : 160, radial: 24 }), lib.metal);
    const aer = mesh(new THREE.CylinderGeometry(0.0124, 0.0118, 0.016, 32), lib.metal);
    aer.position.set(0, 0.222, 0.19);
    const insert = mesh(new THREE.CylinderGeometry(0.0096, 0.0096, 0.003, 32), lib.metalDark, { cast: false });
    insert.position.set(0, 0.2135, 0.19);
    const hub = mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 32), lib.metal);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0.028, 0.1, 0);
    const handle = setMaterial(lever(0.085, 0.0062, 0.0042), lib.metal);
    handle.position.set(0.04, 0.1, 0);
    handle.rotation.set(-0.25, 0, -0.95);
    faucet.add(escutcheon, body, neck, aer, insert, hub, handle);
    product.add(faucet);

    const tipY = counterY + 0.2115;
    const tipZ = fz + 0.19;
    return {
      root,
      product,
      hotspots: [
        { id: 'aerator', pos: V(0, tipY + 0.01, tipZ) },
        { id: 'lever', pos: V(0.1, counterY + 0.16, fz) },
        { id: 'drain', pos: V(0, counterY + 0.02, basinZ) },
        { id: 'rim', pos: V(0.21, counterY + 0.14, basinZ) },
      ],
      water: {
        stream: { points: [V(0, tipY, tipZ), V(0, tipY - 0.06, tipZ + 0.006), V(0, counterY + 0.06, basinZ - 0.012), V(0, counterY + 0.016, basinZ - 0.008)], radius: 0.0048 },
        ripples: [{ pos: V(0, counterY + 0.02, basinZ), radius: 0.075 }],
      },
      detail: { target: V(0, counterY + 0.13, -0.24), dist: 0.62, az: 0.75, el: 0.22 },
    };
  },
};
