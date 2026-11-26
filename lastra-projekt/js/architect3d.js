/* =====================================================================
   Lastra Projekt – architectural scale model (home "The Architect" section
   and the architect.html hero). Mounts on every [data-arch3d] element and
   runs on the shared viewer core in page3d.js (single clock, lazy WebGL
   context, IO pause, pixelRatio caps, context-loss fallback, .glb slot).
   • 3-storey white-card model on a matte stone plinth, miniature trees,
     planters, a reflecting water strip and soft light motes
   • modes: Solid · Blueprint wireframe · 3-floor Exploded (all lerped)
   ===================================================================== */
import { createViewer, kdt, lerp, reduce } from "./page3d.js";

const scaleModel = {
  modelKey: "scale",
  camera: { dist: 15.5, target: [0, 1.15, 0], yaw: -.6, pitch: .38, minPitch: .08, maxPitch: 1.05, auto: .00009 },
  build(ctx) {
    const { THREE: T, scene, track, key, root, mobile } = ctx;
    const M = {
      card: track(new T.MeshStandardMaterial({ color: "#f2eee7", roughness: .82, envMapIntensity: .7, transparent: true })),
      card2: track(new T.MeshStandardMaterial({ color: "#e3ddd3", roughness: .85, envMapIntensity: .7, transparent: true })),
      glass: track(new T.MeshStandardMaterial({ color: "#3a434b", roughness: .12, metalness: .2, envMapIntensity: 1.3, transparent: true, opacity: .82, emissive: "#ffb36b", emissiveIntensity: .0 })),
      bronze: track(new T.MeshStandardMaterial({ color: "#b8845a", roughness: .35, metalness: .85, envMapIntensity: 1.1, transparent: true })),
      leaf: track(new T.MeshStandardMaterial({ color: "#7e9466", roughness: .9, flatShading: true, transparent: true })),
      stem: track(new T.MeshStandardMaterial({ color: "#8b7a66", roughness: .8, transparent: true })),
      water: track(new T.MeshPhysicalMaterial({ color: "#2f4650", roughness: .05, metalness: .1, envMapIntensity: 1.8, clearcoat: 1, clearcoatRoughness: .02, transparent: true })),
      stone: track(new T.MeshStandardMaterial({ color: "#bdb4a7", roughness: .96, envMapIntensity: .6 })),
      stoneTop: track(new T.MeshStandardMaterial({ color: "#cfc7bb", roughness: .92, envMapIntensity: .6 })),
      line: track(new T.LineBasicMaterial({ color: "#2e4f7a", transparent: true, opacity: 0, depthWrite: false })),
      lineHot: track(new T.LineBasicMaterial({ color: "#b8845a", transparent: true, opacity: 0, depthWrite: false }))
    };
    const fadeMats = [M.card, M.card2, M.glass, M.bronze, M.leaf, M.stem, M.water];
    fadeMats.forEach(m => { m.userData.base = m.opacity; });

    /* ---- model (metres of the real residence × S) */
    const S = .26, F = 3.2 * S, SL = .3 * S;
    const procedural = new T.Group(), slot = new T.Group(); scene.add(procedural, slot);
    const floors = [new T.Group(), new T.Group(), new T.Group(), new T.Group()];
    floors.forEach(g => procedural.add(g));
    const box = (g, mat, w, h, d, x, y, z, edges = true, hot = false) => {
      const geo = track(new T.BoxGeometry(w * S, h, d * S));
      const m = new T.Mesh(geo, mat); m.position.set(x * S, y + h / 2, z * S); m.castShadow = m.receiveShadow = true; g.add(m);
      if (edges) { const l = new T.LineSegments(track(new T.EdgesGeometry(geo, 20)), hot ? M.lineHot : M.line); l.position.copy(m.position); g.add(l); }
      return m;
    };
    const volume = (g, v, y0, open = .62, sill = .9) => {
      const h = F - SL, w = v.x1 - v.x0, d = v.z1 - v.z0, cx = (v.x0 + v.x1) / 2, cz = (v.z0 + v.z1) / 2, sh = sill * S, hh = 2.65 * S;
      const side = (len, along, fixed, isX) => {
        const o = len * open, pier = (len - o) / 2;
        const put = (a0, a1, yb, ht, mat, e = true) => { const L = a1 - a0, c = along + (a0 + a1) / 2 - len / 2; isX ? box(g, mat, L, ht, mat === M.glass ? .06 : .25, c, yb, fixed, e) : box(g, mat, mat === M.glass ? .06 : .25, ht, L, fixed, yb, c, e); };
        put(0, pier, y0, h, M.card); put(len - pier, len, y0, h, M.card);
        if (sh > 0) put(pier, len - pier, y0, sh, M.card);
        put(pier, len - pier, y0 + hh, h - hh, M.card);
        put(pier, len - pier, y0 + sh, hh - sh, M.glass, false);
      };
      side(w, cx, v.z1, true); side(w, cx, v.z0, true); side(d, cz, v.x0, false); side(d, cz, v.x1, false);
    };
    const slab = (g, r, y, mat = M.card2) => box(g, mat, r.x1 - r.x0, SL, r.z1 - r.z0, (r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
    const ox = -1.65; const R = r => ({ x0: r.x0 + ox, x1: r.x1 + ox, z0: r.z0, z1: r.z1 });
    /* ground floor + floating stair (treads only) */
    slab(floors[0], R({ x0: -6.3, x1: 11.3, z0: -4.3, z1: 5.3 }), 0);
    volume(floors[0], R({ x0: -6, x1: 6, z0: -4, z1: 5 }), SL, .64, 0);
    volume(floors[0], R({ x0: 6, x1: 11, z0: -4, z1: 2.5 }), SL, .7, 0);
    for (let i = 0; i < 9; i++) box(floors[0], M.card2, .55, .05, 1.2, -3.5 + ox + i * .55 + .27, SL + (i + 1) * F / 9 - .05, -3.2, false);
    /* 1st floor + balcony with bronze edge */
    slab(floors[1], R({ x0: -8, x1: 6, z0: -4.5, z1: 5.5 }), 0);
    slab(floors[1], R({ x0: -6.5, x1: 0, z0: 5.5, z1: 7.2 }), 0);
    box(floors[1], M.bronze, 6.5, .02, .08, -3.25 + ox, SL, 7.15, true, true);
    volume(floors[1], R({ x0: -8, x1: 4.5, z0: -4.5, z1: 5.5 }), SL, .6, .9);
    for (let i = 0; i < 9; i++) box(floors[1], M.card2, .55, .05, 1.2, 1.3 + ox - i * .55 - .27, SL + (i + 1) * F / 9 - .05, -1.8, false);
    /* 2nd floor penthouse on the roof terrace */
    slab(floors[2], R({ x0: -8, x1: 4.5, z0: -4.5, z1: 5.5 }), 0);
    volume(floors[2], R({ x0: -6, x1: 2, z0: -4.5, z1: 2.5 }), SL, .74, 0);
    box(floors[2], M.bronze, 12.5, .02, .06, -1.75 + ox, SL + .28, 5.45, true, true);
    slab(floors[3], R({ x0: -6.6, x1: 2.6, z0: -4.9, z1: 3.9 }), 0, M.card);
    const baseY = [0, F, 2 * F, 3 * F];
    floors.forEach((g, i) => { g.position.y = baseY[i]; });
    procedural.position.z = -1.35 * S;

    /* ---- courtyard on the plinth: miniature trees, planters, reflecting water strip */
    const court = new T.Group(); procedural.add(court);
    const tree = (x, z, r, h) => {
      const st = new T.Mesh(track(new T.CylinderGeometry(.018, .022, h, 6)), M.stem); st.position.set(x, h / 2, z); st.castShadow = true; court.add(st);
      const cr = new T.Mesh(track(new T.IcosahedronGeometry(r, 1)), M.leaf); cr.position.set(x, h + r * .6, z); cr.castShadow = true; court.add(cr);
    };
    tree(-3.15, 1.85, .26, .45); tree(3.15, -1.85, .3, .5); tree(3.05, 1.95, .22, .4); tree(-3.2, -1.8, .24, .42);
    for (const [x, z] of [[-.9, 2.05], [-.3, 2.05]]) { box(court, M.card2, 1.4, .09, 1.4, x / S, 0, z / S, false); const l = new T.Mesh(track(new T.IcosahedronGeometry(.12, 1)), M.leaf); l.position.set(x, .16, z); l.scale.y = .6; court.add(l); }
    const water = new T.Mesh(track(new T.BoxGeometry(1.5, .02, .5)), M.water); water.position.set(1.25, .012, 1.85); water.receiveShadow = true; court.add(water);

    /* ---- stone plinth + blueprint grid */
    const plinthG = new T.Group(); scene.add(plinthG);
    const pb = (w, h, d, y, mat) => { const m = new T.Mesh(track(new T.BoxGeometry(w, h, d)), mat); m.position.y = y + h / 2; m.receiveShadow = m.castShadow = true; plinthG.add(m); };
    pb(7.4, .42, 5.2, -.46, M.stone); pb(6.8, .04, 4.6, -.04, M.stoneTop);
    const grid = new T.GridHelper(6.4, 32, 0x2e4f7a, 0x2e4f7a); grid.position.y = .005; grid.material.transparent = true; grid.material.opacity = 0; grid.material.depthWrite = false; plinthG.add(grid); track(grid.geometry); track(grid.material);

    /* ---- soft light motes floating over the model */
    let motes = null;
    if (!reduce) {
      const N = mobile ? 40 : 90, pos = new Float32Array(N * 3), sd = new Float32Array(N);
      for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 6; pos[i * 3 + 1] = .2 + Math.random() * 3.6; pos[i * 3 + 2] = (Math.random() - .5) * 4.4; sd[i] = Math.random(); }
      const g = track(new T.BufferGeometry()); g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new T.BufferAttribute(sd, 1));
      const m = track(new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPR: { value: ctx.renderer.getPixelRatio() } },
        vertexShader: `attribute float aSeed; uniform float uTime,uPR; varying float vA; void main(){ vec3 p = position; float t = uTime*.2 + aSeed*30.; p += vec3(sin(t*.7)*.25, sin(t*.5)*.2, cos(t*.6)*.25); vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = uPR*(2.+aSeed*3.)*(10./-mv.z); vA = .25+.5*fract(aSeed*7.1); }`,
        fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,0.,d); gl_FragColor = vec4(vec3(1.,.86,.66), a*vA*.8); }`,
        transparent: true, depthWrite: false, blending: T.AdditiveBlending
      }));
      motes = new T.Points(g, m); motes.frustumCulled = false; scene.add(motes);
    }

    /* ---- modes */
    const st = { wire: 0, wireT: 0, expl: 0, explT: 0 };
    const modes = [...root.querySelectorAll("[data-a3d-mode]")];
    const setMode = m => { st.wireT = m === "wire" ? 1 : 0; st.explT = m === "explode" ? 1 : 0; modes.forEach(b => b.setAttribute("aria-pressed", b.dataset.a3dMode === m)); if (reduce) { st.wire = st.wireT; st.expl = st.explT; } ctx.dirty(); };
    modes.forEach(b => b.addEventListener("click", () => setMode(b.dataset.a3dMode)));

    return {
      procedural, slot, fit: 5,
      update(time, dt) {
        const was = st.wire + st.expl;
        st.wire = lerp(st.wire, st.wireT, reduce ? 1 : kdt(.07, dt)); st.expl = lerp(st.expl, st.explT, reduce ? 1 : kdt(.06, dt));
        floors.forEach((g, i) => { g.position.y = baseY[i] + st.expl * i * .85; });
        court.position.y = 0;
        fadeMats.forEach(m => { m.opacity = m.userData.base * (1 - st.wire * .93); m.depthWrite = st.wire < .5; });
        M.line.opacity = st.wire * .95; M.lineHot.opacity = st.wire; grid.material.opacity = st.wire * .35;
        key.intensity = lerp(2.0, 1.2, st.wire);
        ctx.st.distT = 15.5 + st.expl * 2.4; ctx.st.targetT.y = 1.15 + st.expl * 1.3;
        if (motes) motes.material.uniforms.uTime.value = time;
        return Math.abs(was - (st.wire + st.expl)) > 1e-4 || !!motes;
      }
    };
  }
};

document.querySelectorAll("[data-arch3d]").forEach(el => {
  try { createViewer(el, scaleModel); } catch (err) { console.warn("[lastra] scale model unavailable", err); el.classList.add("a3d-fallback"); }
});
