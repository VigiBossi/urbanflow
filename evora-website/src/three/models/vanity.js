import * as THREE from 'three';
import {
  V, mesh, lathe, slab, panel, box, tube, lever, setMaterial, roundedRectPath,
} from './common.js';
import { glowCanvas } from '../../textures.js';

/** Fluted (reeded) drawer front: shallow convex reeds across the width, extruded to height h. */
function flutedFront(w, h, t, flute = 0.026, sag = 0.0042) {
  const n = Math.round(w / flute);
  const fw = w / n;
  const R = (fw * fw) / 4 / (2 * sag) + sag / 2;
  const off = R - sag;
  const alpha = Math.atan2(off, fw / 2);
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -t);
  s.lineTo(-w / 2, 0);
  for (let i = 0; i < n; i++) {
    const cx = -w / 2 + fw * (i + 0.5);
    s.absarc(cx, -off, R, Math.PI - alpha, alpha, true);
  }
  s.lineTo(w / 2, -t);
  s.lineTo(-w / 2, -t);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: h - 0.003, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 2, curveSegments: 6,
  });
  // shape (x, s) → world (x, z = s), extrusion → world y
  geo.rotateX(Math.PI / 2);
  geo.translate(0, h - 0.0015, 0);
  return geo;
}

/**
 * 3 · Vanity & backlit LED mirror
 * Floating oak cabinet with fluted soft-close drawers and shadow-gap reveals,
 * stone top with an integrated basin and mixer, rounded mirror with an LED halo.
 */
export default {
  id: 'vanity',
  azimuth: [-1.3, 1.3],
  studio: { az: 0.5, el: 0.14 },
  build({ lib, lowSpec }) {
    const root = new THREE.Group();
    const product = new THREE.Group();
    root.add(product);
    const wallZ = -0.45;
    const W = 1.0;
    const D = 0.46;

    const wall = mesh(box(2.1, 2.4, 0.1), lib.wall);
    wall.position.set(0, 1.2, wallZ - 0.05);
    root.add(wall);

    // Carcass (recessed so the fronts float), 6 mm reveals between fronts
    const carcass = mesh(panel({ w: W - 0.01, h: 0.4, t: D - 0.03, r: 0.006, bevel: 0.002 }), lib.wood);
    carcass.position.set(0, 0.6, wallZ);
    product.add(carcass);
    const frontZ = wallZ + D - 0.03 + 0.022;
    const drawers = [[0.403, 0.195], [0.604, 0.196]];
    drawers.forEach(([y0, h]) => {
      const f = mesh(flutedFront(W, h, 0.02), lib.wood, { name: 'drawer' });
      f.position.set(0, y0, frontZ);
      product.add(f);
    });
    const gapStrip = mesh(box(W - 0.02, 0.006, 0.01), lib.reveal, { cast: false });
    gapStrip.position.set(0, 0.6, frontZ - 0.024);
    const topReveal = mesh(box(W - 0.04, 0.012, D - 0.05), lib.reveal);
    topReveal.position.set(0, 0.806, wallZ + (D - 0.05) / 2);
    product.add(gapStrip, topReveal);

    // Stone top with an elliptical opening + integrated (carved) basin
    const topY = 0.812;
    const topT = 0.03;
    const slabZ = wallZ + 0.24;
    const basinZ = slabZ + 0.025;
    const rx = 0.22;
    const rz = 0.15;
    const hole = new THREE.Path();
    hole.absellipse(0, -(basinZ - slabZ), rx, rz, 0, Math.PI * 2, true);
    const top = mesh(slab({ w: W + 0.02, d: 0.48, t: topT, r: 0.004, bevel: 0.003, holes: [hole], curveSegments: 48 }), lib.stone, { name: 'top' });
    top.position.set(0, topY, slabZ);
    product.add(top);
    const bowl = mesh(lathe([
      [1.0, 0], [0.995, -0.004], [0.97, -0.03], [0.9, -0.07], [0.72, -0.105], [0.45, -0.122], [0.14, -0.128], [0.12, -0.131], [0, -0.131],
    ], {
      segments: lowSpec ? 64 : 96, samples: 80, deform: (v) => { v.x *= rx; v.z *= rz; },
    }), lib.stone);
    bowl.position.set(0, topY + topT - 0.003, basinZ);
    const drain = mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.003, 32), lib.metal);
    drain.position.set(0, topY + topT - 0.134, basinZ);
    product.add(bowl, drain);

    // Deck mixer
    const mz = wallZ + 0.07;
    const mixer = new THREE.Group();
    mixer.position.set(0, topY + topT, mz);
    const mBody = mesh(lathe([[0, 0], [0.019, 0], [0.019, 0.004], [0.0165, 0.006], [0.0165, 0.15], [0.012, 0.158], [0, 0.16]], { segments: 40, samples: 50 }), lib.metal);
    const spout = mesh(tube([V(0, 0.13, 0), V(0, 0.135, 0.05), V(0, 0.13, 0.12), V(0, 0.112, 0.15)], 0.009, { segments: 60, radial: 20 }), lib.metal);
    const aer = mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.012, 24), lib.metal);
    aer.position.set(0, 0.108, 0.151);
    const lev = setMaterial(lever(0.075, 0.005, 0.0035), lib.metal);
    lev.position.set(0, 0.16, 0);
    lev.rotation.x = -1.15;
    mixer.add(mBody, spout, aer, lev);
    product.add(mixer);

    // Mirror: rounded backing + LED strip + mirror glass + wall halo + wall-wash light
    const mY = 1.58;
    const mw = 0.8;
    const mh = 0.95;
    const backing = mesh(panel({ w: mw - 0.08, h: mh - 0.08, t: 0.028, r: 0.1, bevel: 0.002 }), lib.reveal);
    backing.position.set(0, mY, wallZ);
    const ledPts = roundedRectPath(mw - 0.1, mh - 0.1, 0.09).getSpacedPoints(160).map((p) => V(p.x, p.y, 0));
    const ledStrip = mesh(tube(ledPts, 0.004, { segments: 200, radial: 6, closed: true }), lib.led, { cast: false });
    ledStrip.position.set(0, mY, wallZ + 0.012);
    const glassM = mesh(panel({ w: mw, h: mh, t: 0.006, r: 0.14, bevel: 0.0018, curveSegments: 24 }), lib.mirror, { name: 'mirror' });
    glassM.position.set(0, mY, wallZ + 0.028);
    const haloTex = new THREE.CanvasTexture(glowCanvas(512, 600, 92, 80));
    haloTex.colorSpace = THREE.SRGBColorSpace;
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex, color: 0xffb36b, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    haloMat.userData.owned = true;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(mw + 0.34, (mw + 0.34) * (600 / 512)), haloMat);
    halo.position.set(0, mY, wallZ + 0.002);
    halo.userData.noOcclude = true;
    const wash = new THREE.PointLight(0xffb878, 0.6, 1.6, 2);
    wash.position.set(0, mY, wallZ + 0.02);
    product.add(backing, ledStrip, glassM, halo, wash);

    return {
      root,
      product,
      dimsIgnore: [halo],
      hotspots: [
        { id: 'drawers', pos: V(0.32, 0.5, frontZ + 0.004) },
        { id: 'mirror', pos: V(0.28, mY + 0.32, wallZ + 0.04) },
        { id: 'top', pos: V(-0.38, topY + topT, slabZ + 0.12) },
        { id: 'reveal', pos: V(-0.42, 0.6, frontZ + 0.004) },
      ],
      water: {
        stream: { points: [V(0, topY + topT + 0.102, mz + 0.151), V(0, topY + 0.07, mz + 0.152), V(0, topY - 0.06, basinZ - 0.05), V(0, topY - 0.07, basinZ - 0.045)], radius: 0.0042 },
        ripples: [{ pos: V(0, topY + topT - 0.128, basinZ), radius: 0.09 }],
      },
      detail: { target: V(0.15, 0.62, frontZ), dist: 0.75, az: 0.6, el: 0.1 },
      // Evening mood brightens the LED halo; other presets keep it subtle.
      setLight(preset) {
        const k = preset.led;
        lib.led.emissiveIntensity = 2 + k * 1.6;
        haloMat.opacity = Math.min(1, 0.35 + k * 0.28);
        wash.intensity = 0.25 + k * 0.6;
      },
    };
  },
};
