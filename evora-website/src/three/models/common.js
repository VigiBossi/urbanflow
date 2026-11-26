import * as THREE from 'three';
import { radialShadowCanvas } from '../../textures.js';

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** Mesh with shadow flags. */
export function mesh(geometry, material, { cast = true, receive = true, name = '' } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  m.name = name;
  return m;
}

// Average the duplicated normals on a lathe's 0/2π seam so deformed lathes stay smooth.
function fixLatheSeam(geo, nPoints, segments) {
  const n = geo.attributes.normal;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let j = 0; j < nPoints; j++) {
    const i0 = j;
    const i1 = segments * nPoints + j;
    a.fromBufferAttribute(n, i0);
    b.fromBufferAttribute(n, i1);
    a.add(b).normalize();
    n.setXYZ(i0, a.x, a.y, a.z);
    n.setXYZ(i1, a.x, a.y, a.z);
  }
  n.needsUpdate = true;
}

/**
 * Smooth lathe from a list of [radius, y] control points (Catmull-Rom spline).
 * `deform(v)` can reshape the revolved vertices (ellipse, egg, stadium…).
 */
export function lathe(points, { segments = 96, samples = 160, deform = null } = {}) {
  const pts = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(samples);
  pts.forEach((p) => { p.x = Math.max(0, p.x); });
  const geo = new THREE.LatheGeometry(pts, segments);
  if (deform) {
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      deform(v);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    fixLatheSeam(geo, pts.length, segments);
  }
  return geo;
}

/** Stretch a revolved shape into an ellipse/oval: x += (x/r)·E keeps wall thickness constant. */
export const stretchX = (E) => (v) => {
  const r = Math.hypot(v.x, v.z);
  if (r > 1e-6) v.x += (v.x / r) * E;
};
/** Egg plan: front (+z) longer than back. */
export const egg = (front, back, sx = 1) => (v) => {
  v.z *= v.z > 0 ? front : back;
  v.x *= sx;
};

/** Rounded-rectangle Shape centred on (cx, cy). */
export function roundedRect(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape();
  const x = cx - w / 2;
  const y = cy - h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function roundedRectPath(w, h, r, cx = 0, cy = 0) {
  const p = new THREE.Path();
  const s = roundedRect(w, h, r, cx, cy);
  p.curves = s.curves;
  return p;
}

/**
 * Horizontal beveled slab (countertop, tray, plinth, floor tile).
 * Plan is w (x) × d (z); occupies y ∈ [0, t]. UVs are in metres of the plan,
 * so stone veining keeps a real-world scale. `cx/cz` place the plan in world
 * space (useful for tiles that should each show a different part of the stone).
 */
export function slab({ w, d, t, r = 0.004, bevel = 0.003, cx = 0, cz = 0, holes = [], curveSegments = 12 }) {
  const shape = roundedRect(w, d, r, cx, -cz);
  holes.forEach((h) => shape.holes.push(h));
  const b = Math.min(bevel, t / 3);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0005, t - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, b, 0);
  return geo;
}

/** Vertical beveled panel in the XY plane: occupies z ∈ [0, t] (front face at z = t). */
export function panel({ w, h, t, r = 0.004, bevel = 0.002, cx = 0, cy = 0, holes = [], curveSegments = 12 }) {
  const shape = roundedRect(w, h, r, cx, cy);
  holes.forEach((hh) => shape.holes.push(hh));
  const b = Math.min(bevel, t / 3);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0005, t - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments,
  });
  geo.translate(0, 0, b);
  return geo;
}

/** Smooth tube along a Catmull-Rom path. */
export function tube(points, radius, { segments = 120, radial = 20, closed = false } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal', 0.5);
  return new THREE.TubeGeometry(curve, segments, radius, radial, closed);
}

/** Planar "box" UV projection in metres, for boxes that should take stone/wood at real scale. */
export function boxUV(geo, scale = 1) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i));
    const ay = Math.abs(nor.getY(i));
    const az = Math.abs(nor.getZ(i));
    let u;
    let v;
    if (ax >= ay && ax >= az) { u = pos.getZ(i); v = pos.getY(i); } else if (ay >= az) { u = pos.getX(i); v = pos.getZ(i); } else { u = pos.getX(i); v = pos.getY(i); }
    uv.setXY(i, u * scale, v * scale);
  }
  uv.needsUpdate = true;
  return geo;
}

export function box(w, h, d, { uvMetres = true } = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  return uvMetres ? boxUV(g) : g;
}

/** Soft radial contact shadow plane (own material, disposed with the model). */
export function contactShadow(w, d, opacity = 0.5, position = null) {
  const tex = new THREE.CanvasTexture(radialShadowCanvas(256));
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity, depthWrite: false, toneMapped: false,
  });
  mat.userData.owned = true;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  m.userData.noOcclude = true;
  if (position) m.position.copy(position);
  return m;
}

/** Tapered lever / handle pointing along +Y from the origin. */
export function lever(length, r0, r1) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r1, r0, length, 20);
  geo.translate(0, length / 2, 0);
  g.add(new THREE.Mesh(geo));
  const cap = new THREE.SphereGeometry(r1, 16, 12);
  cap.translate(0, length, 0);
  g.add(new THREE.Mesh(cap));
  return g;
}

export function setMaterial(group, mat) {
  group.traverse((o) => { if (o.isMesh) { o.material = mat; o.castShadow = true; o.receiveShadow = true; } });
  return group;
}

/** Hand-shower wand (lathe), head facing +Y, origin at the handle base. */
export function wandGeometry(scale = 1) {
  return lathe([
    [0.0, 0], [0.011, 0], [0.013, 0.01], [0.014, 0.12], [0.016, 0.17], [0.024, 0.19],
    [0.04, 0.2], [0.044, 0.208], [0.042, 0.214], [0.02, 0.216], [0.0, 0.216],
  ].map(([r, y]) => [r * scale, y * scale]), { segments: 40, samples: 70 });
}
