import * as THREE from 'three';
import { waterStreakCanvas } from '../textures.js';
import { reducedMotion } from './stage.js';

const owned = (m) => { m.userData.owned = true; return m; };

function rippleMaterial(opacity = 0.55) {
  return owned(new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uMax: { value: opacity } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      varying vec2 vUv;
      uniform float uTime; uniform float uOpacity; uniform float uMax;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        if (r > 1.0) discard;
        float rings = 0.5 + 0.5 * sin(r * 34.0 - uTime * 7.5);
        rings = pow(rings, 7.0);
        float rings2 = pow(0.5 + 0.5 * sin(r * 21.0 - uTime * 5.1 + 1.7), 9.0);
        float fade = (1.0 - r) * smoothstep(1.0, 0.55, r);
        float core = smoothstep(0.2, 0.0, r) * 0.35;
        float a = (rings * 0.8 + rings2 * 0.5) * fade + core;
        gl_FragColor = vec4(vec3(1.0), a * uOpacity * uMax);
      }`,
  }));
}

/**
 * Builds the water effects described by a model's `water` spec:
 *   stream  – translucent tube with flowing streak alpha, grows/shrinks on toggle
 *   rain    – instanced falling droplets under a rain head
 *   ripples – animated ring shaders on basin/tray/tub surfaces
 *   fill    – rising water surface inside a tub
 */
export function createWater(spec, { lowSpec = false } = {}) {
  const group = new THREE.Group();
  group.userData.noOcclude = true;
  if (!spec) return { group, setOn() {}, update: () => false, dispose() {} };

  let on = false;
  let amount = 0; // 0..1 eased on/off
  const parts = [];

  // ── stream ──
  if (spec.stream) {
    const curve = new THREE.CatmullRomCurve3(spec.stream.points, false, 'centripetal');
    const tubular = 64;
    const radial = 12;
    const geo = new THREE.TubeGeometry(curve, tubular, spec.stream.radius, radial, false);
    const alpha = new THREE.CanvasTexture(waterStreakCanvas());
    alpha.wrapS = alpha.wrapT = THREE.RepeatWrapping;
    alpha.repeat.set(4, 1);
    const mat = owned(new THREE.MeshPhysicalMaterial({
      color: 0xeaf6ff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.75, alphaMap: alpha,
      depthWrite: false, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.05,
    }));
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 3;
    m.userData.noOcclude = true;
    const total = geo.index.count;
    geo.setDrawRange(0, 0);
    group.add(m);
    parts.push({
      update(dt, t) {
        alpha.offset.x -= dt * 2.4;
        const segs = Math.round(amount * tubular);
        // grows from the aerator down when turning on; drains from the top when turning off
        if (on) geo.setDrawRange(0, Math.round((segs / tubular) * total));
        else geo.setDrawRange(total - Math.round((segs / tubular) * total), Math.round((segs / tubular) * total));
        m.visible = amount > 0.01;
        mat.opacity = 0.55 + Math.sin(t * 30) * 0.04;
      },
    });
  }

  // ── rain ──
  if (spec.rain) {
    const { origin, size, floorY } = spec.rain;
    const count = lowSpec ? 120 : 260;
    const dropGeo = new THREE.CylinderGeometry(0.0017, 0.0017, 0.085, 5, 1, true);
    const mat = owned(new THREE.MeshPhysicalMaterial({
      color: 0xf2f9ff, roughness: 0.05, transparent: true, opacity: 0.85, depthWrite: false, envMapIntensity: 2.2,
      emissive: 0xbfd6e6, emissiveIntensity: 0.25,
    }));
    const inst = new THREE.InstancedMesh(dropGeo, mat, count);
    inst.frustumCulled = false;
    inst.userData.noOcclude = true;
    const drops = [];
    const fall = origin.y - floorY;
    for (let i = 0; i < count; i++) {
      drops.push({
        x: origin.x + (Math.random() - 0.5) * size,
        z: origin.z + (Math.random() - 0.5) * size,
        y: origin.y - Math.random() * fall,
        v: 3.2 + Math.random() * 0.9,
      });
    }
    const dummy = new THREE.Object3D();
    group.add(inst);
    parts.push({
      update(dt) {
        const active = Math.round(amount * count);
        inst.count = active;
        inst.visible = active > 0;
        for (let i = 0; i < active; i++) {
          const d = drops[i];
          d.y -= d.v * dt;
          if (d.y < floorY) {
            d.y = origin.y - Math.random() * 0.05;
            d.x = origin.x + (Math.random() - 0.5) * size;
            d.z = origin.z + (Math.random() - 0.5) * size;
          }
          dummy.position.set(d.x, d.y, d.z);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
      },
    });
  }

  // ── tub fill ──
  let level = spec.fill ? spec.fill.minY : 0;
  if (spec.fill) {
    const { center, minY, maxY, radiusAt } = spec.fill;
    const mat = owned(new THREE.MeshPhysicalMaterial({
      color: 0x9fcbd6, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.6, depthWrite: false,
      envMapIntensity: 1.4, clearcoat: 1, clearcoatRoughness: 0.03,
    }));
    const surf = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mat);
    surf.rotation.x = -Math.PI / 2;
    surf.renderOrder = 2;
    surf.userData.noOcclude = true;
    group.add(surf);
    parts.push({
      update(dt) {
        const target = on ? maxY : minY;
        const rate = on ? 0.045 : 0.06;
        level += Math.sign(target - level) * Math.min(Math.abs(target - level), rate * dt);
        const [rx, rz] = radiusAt(level);
        surf.scale.set(rx, rz, 1);
        surf.position.set(center.x, level, center.z);
        surf.visible = level > minY + 0.004;
        return Math.abs(target - level) > 1e-4;
      },
    });
  }

  // ── ripples ──
  (spec.ripples || []).forEach((rp) => {
    const mat = rippleMaterial();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rp.radius * 2, rp.radius * 2), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.copy(rp.pos);
    m.renderOrder = 4;
    m.userData.noOcclude = true;
    group.add(m);
    parts.push({
      update(dt, t) {
        mat.uniforms.uTime.value = t;
        mat.uniforms.uOpacity.value = amount;
        if (rp.followFill && spec.fill) m.position.y = Math.max(rp.pos.y, level + 0.002);
        m.visible = amount > 0.01;
      },
    });
  });

  return {
    group,
    setOn(v) { on = v; },
    isOn: () => on,
    update(dt, t) {
      const target = on ? 1 : 0;
      const speed = reducedMotion() ? 100 : 2.5;
      amount += Math.sign(target - amount) * Math.min(Math.abs(target - amount), dt * speed);
      let busy = amount > 0.001 || Math.abs(target - amount) > 0.001;
      parts.forEach((p) => { if (p.update(dt, t)) busy = true; });
      return busy;
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          o.material.alphaMap?.dispose();
          o.material.dispose();
        }
      });
    },
  };
}
