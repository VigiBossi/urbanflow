import * as THREE from 'three';
import {
  V, mesh, slab, box, tube, lathe, wandGeometry, panel,
} from './common.js';

/**
 * 2 · Walk-in rain shower
 * Frameless 8 mm transmission glass with metal channels, wall profile and stabiliser bar,
 * low stone tray with linear drain, ultra-thin ceiling-arm rain head, thermostatic bar,
 * sliding rail with hand wand and a curved flexible hose.
 */
export default {
  id: 'shower',
  azimuth: [-0.45, 1.3],
  studio: { az: 0.6, el: 0.16 },
  build({ lib, lowSpec }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);
    const backZ = -0.6;
    const leftX = -0.95;
    const H = 2.3;

    // Stone-clad walls (large-format slabs)
    const back = mesh(box(2.0, H, 0.06), lib.stone);
    back.position.set(-0.05, H / 2, backZ - 0.03);
    const left = mesh(box(0.06, H, 1.3), lib.stone);
    left.position.set(leftX - 0.03, H / 2, 0.05);
    root.add(back, left);

    // Low-profile tray + linear drain
    const trayT = 0.035;
    const tray = mesh(slab({ w: 1.3, d: 0.95, t: trayT, r: 0.01, bevel: 0.004 }), lib.stoneHoned);
    tray.position.set(-0.3, 0, -0.125);
    const slot = mesh(box(1.12, 0.002, 0.058), lib.metalDark, { cast: false });
    slot.position.set(-0.3, trayT + 0.0006, backZ + 0.07);
    const grate = mesh(box(1.1, 0.003, 0.05), lib.metal);
    grate.position.set(-0.3, trayT + 0.0016, backZ + 0.07);
    product.add(tray, slot, grate);
    for (let i = 0; i < 22; i++) {
      const s = mesh(box(0.03, 0.0008, 0.004), lib.metalDark, { cast: false });
      s.position.set(-0.83 + i * 0.05, trayT + 0.0032, backZ + 0.07);
      product.add(s);
    }

    // Frameless glass panel (faces = transmission glass, edges = green-tinted glass)
    const gx = 0.32;
    const gH = 2.0;
    const gL = 0.9;
    const gY0 = trayT + 0.012;
    const glassGeo = new THREE.BoxGeometry(0.008, gH, gL);
    const glass = new THREE.Mesh(glassGeo, [lib.glass, lib.glass, lib.glassEdge, lib.glassEdge, lib.glassEdge, lib.glassEdge]);
    glass.position.set(gx, gY0 + gH / 2, backZ + gL / 2);
    glass.userData.noOcclude = true;
    glass.receiveShadow = true;
    product.add(glass);
    // floor channel, wall profile, clamp + stabiliser bar to the side wall
    const channel = mesh(panel({ w: 0.024, h: 0.026, t: gL, r: 0.003, bevel: 0.0015 }), lib.metal);
    channel.position.set(gx, trayT + 0.013, backZ);
    const wallProfile = mesh(box(0.022, gH, 0.018), lib.metal);
    wallProfile.position.set(gx, gY0 + gH / 2, backZ + 0.009);
    const barY = gY0 + gH - 0.04;
    const barZ = backZ + gL - 0.1;
    const bar = mesh(new THREE.CylinderGeometry(0.009, 0.009, gx - leftX, 24), lib.metal);
    bar.rotation.z = Math.PI / 2;
    bar.position.set((gx + leftX) / 2, barY, barZ);
    const clamp = mesh(panel({ w: 0.05, h: 0.045, t: 0.03, r: 0.006, bevel: 0.002 }), lib.metal);
    clamp.rotation.y = Math.PI / 2;
    clamp.position.set(gx - 0.015, barY, barZ + 0.025);
    const flange = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 32), lib.metal);
    flange.rotation.z = Math.PI / 2;
    flange.position.set(leftX + 0.005, barY, barZ);
    product.add(channel, wallProfile, bar, clamp, flange);

    // Ultra-thin rain head on a ceiling-height wall arm
    const headX = -0.3;
    const headZ = -0.22;
    const headY = 2.15;
    const arm = mesh(tube([V(headX, 2.2, backZ), V(headX, 2.2, backZ + 0.2), V(headX, 2.195, headZ - 0.04), V(headX, headY + 0.012, headZ)], 0.011, { segments: 60, radial: 20 }), lib.metal);
    const armFlange = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 32), lib.metal);
    armFlange.rotation.x = Math.PI / 2;
    armFlange.position.set(headX, 2.2, backZ + 0.005);
    const head = mesh(slab({ w: 0.3, d: 0.3, t: 0.008, r: 0.035, bevel: 0.002 }), lib.metal);
    head.position.set(headX, headY, headZ);
    const face = mesh(slab({ w: 0.27, d: 0.27, t: 0.0008, r: 0.03, bevel: 0 }), lib.metalDark, { cast: false });
    face.position.set(headX, headY - 0.0006, headZ);
    product.add(arm, armFlange, head, face);

    // Thermostatic mixer bar
    const mY = 1.05;
    const mZ = backZ + 0.055;
    const barBody = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 40), lib.metal);
    barBody.rotation.z = Math.PI / 2;
    barBody.position.set(headX, mY, mZ);
    product.add(barBody);
    [-1, 1].forEach((side) => {
      const knob = mesh(lathe([[0, 0], [0.034, 0], [0.036, 0.004], [0.036, 0.04], [0.033, 0.046], [0, 0.046]], { segments: 48, samples: 40 }), lib.metal);
      knob.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      knob.position.set(headX + side * 0.15, mY, mZ);
      product.add(knob);
      for (let g = 0; g < 3; g++) {
        const groove = mesh(new THREE.TorusGeometry(0.0362, 0.0012, 6, 48), lib.metalDark, { cast: false });
        groove.rotation.y = Math.PI / 2;
        groove.position.set(headX + side * (0.162 + g * 0.01), mY, mZ);
        product.add(groove);
      }
      const conn = mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.03, 24), lib.metal);
      conn.rotation.x = Math.PI / 2;
      conn.position.set(headX + side * 0.11, mY, backZ + 0.015);
      product.add(conn);
    });
    const outlet = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.035, 20), lib.metal);
    outlet.position.set(headX, mY - 0.045, mZ);
    product.add(outlet);

    // Sliding rail + wand + flexible hose
    const railX = 0.12;
    const railZ = backZ + 0.045;
    const rail = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.8, 24), lib.metal);
    rail.position.set(railX, 1.55, railZ);
    product.add(rail);
    [1.15, 1.95].forEach((y) => {
      const br = mesh(new THREE.CylinderGeometry(0.013, 0.017, 0.045, 24), lib.metal);
      br.rotation.x = Math.PI / 2;
      br.position.set(railX, y, backZ + 0.022);
      product.add(br);
    });
    const slider = mesh(panel({ w: 0.04, h: 0.05, t: 0.04, r: 0.008, bevel: 0.003 }), lib.metal);
    slider.position.set(railX, 1.55, railZ - 0.02);
    product.add(slider);
    const wand = mesh(wandGeometry(), lib.metal);
    wand.position.set(railX, 1.42, railZ + 0.045);
    wand.rotation.x = 0.32;
    product.add(wand);
    const hose = mesh(tube([
      V(headX, mY - 0.06, mZ), V(headX + 0.02, 0.86, mZ + 0.03), V(-0.12, 0.7, mZ + 0.07), V(0.04, 0.74, mZ + 0.07),
      V(railX, 0.98, mZ + 0.05), V(railX, 1.3, railZ + 0.04), V(railX, 1.415, railZ + 0.045),
    ], 0.0068, { segments: lowSpec ? 80 : 140, radial: 12 }), lib.metal);
    product.add(hose);

    return {
      root,
      product,
      hotspots: [
        { id: 'glass', pos: V(gx, 1.35, -0.25) },
        { id: 'head', pos: V(headX + 0.12, headY - 0.01, headZ + 0.1) },
        { id: 'thermo', pos: V(headX + 0.05, mY + 0.04, mZ + 0.02) },
        { id: 'tray', pos: V(-0.75, trayT, 0.25) },
      ],
      water: {
        rain: { origin: V(headX, headY - 0.006, headZ), size: 0.25, floorY: trayT + 0.002 },
        ripples: [{ pos: V(headX, trayT + 0.002, headZ), radius: 0.3 }],
      },
      detail: { target: V(-0.1, 1.2, -0.5), dist: 1.0, az: 0.5, el: 0.12 },
    };
  },
};
