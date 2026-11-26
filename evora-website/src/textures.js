// Procedural stone textures drawn on 2D canvas — no image files required.
// Every generator is seeded, so the same slab always looks the same.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Fast fractal "cloud" noise: random low-resolution grids upscaled with
// bilinear smoothing and layered at decreasing opacity.
function cloudLayer(ctx, w, h, rand, { tint = [0, 0, 0], strength = 0.25, octaves = 5, base = 4, mode = 'source-over' }) {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  let amp = strength;
  for (let o = 0; o < octaves; o++) {
    const gw = base * 2 ** o;
    const gh = Math.max(2, Math.round((gw * h) / w));
    const g = makeCanvas(gw, gh);
    const gctx = g.getContext('2d');
    const img = gctx.createImageData(gw, gh);
    for (let i = 0; i < gw * gh; i++) {
      const v = rand();
      img.data[i * 4] = tint[0];
      img.data[i * 4 + 1] = tint[1];
      img.data[i * 4 + 2] = tint[2];
      img.data[i * 4 + 3] = Math.round(v * 255);
    }
    gctx.putImageData(img, 0, 0);
    ctx.globalAlpha = amp;
    ctx.drawImage(g, 0, 0, w, h);
    amp *= 0.62;
  }
  ctx.restore();
}

// A meandering vein. Sharp veins are drawn as short tapered segments;
// soft (blurred) veins are stroked once as a single path so the blur
// filter runs only one time per vein.
function vein(ctx, rand, o) {
  const {
    x, y, angle, length, width, color, alpha = 1, wobble = 0.35, blur = 0, depth = 0, branchChance = 0.012, scale = 1,
  } = o;
  const soft = blur > 1.5;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  let px = x;
  let py = y;
  let a = angle;
  const step = Math.max(1.5, 3 * scale);
  const steps = Math.min(4000, Math.floor(length / step));
  const phase = rand() * 10;
  const branches = [];
  if (soft) {
    ctx.filter = `blur(${Math.max(1, blur * scale)}px)`;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(0.5, width);
    ctx.beginPath();
    ctx.moveTo(px, py);
  }
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    a += (rand() - 0.5) * wobble + Math.sin(phase + t * 9) * 0.02 + (angle - a) * 0.035;
    const nx = px + Math.cos(a) * step;
    const ny = py + Math.sin(a) * step;
    if (soft) {
      ctx.lineTo(nx, ny);
    } else {
      const taper = Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05));
      const wv = width * (0.45 + 0.55 * taper) * (0.75 + rand() * 0.5);
      ctx.globalAlpha = alpha * (0.55 + 0.45 * taper);
      ctx.lineWidth = Math.max(0.35, wv);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
    px = nx;
    py = ny;
    if (depth < 2 && rand() < branchChance) {
      branches.push({ x: px, y: py, angle: a + (rand() < 0.5 ? -1 : 1) * (0.4 + rand() * 0.8) });
    }
  }
  if (soft) ctx.stroke();
  ctx.restore();
  for (const b of branches.slice(0, 6)) {
    vein(ctx, rand, {
      ...o,
      x: b.x,
      y: b.y,
      angle: b.angle,
      length: length * (0.2 + rand() * 0.35),
      width: width * 0.5,
      alpha: alpha * 0.8,
      depth: depth + 1,
    });
  }
}

function speckles(ctx, rand, w, h, count, colors, maxR, alpha = 0.5) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha * (0.3 + rand() * 0.7);
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    const r = 0.4 + rand() * maxR;
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── Stone recipes ───────────────────────────────────────────

function calacatta(ctx, w, h, rand, s) {
  ctx.fillStyle = '#f4f0e9';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [214, 204, 188], strength: 0.35, octaves: 6, base: 3 });
  cloudLayer(ctx, w, h, rand, { tint: [255, 255, 255], strength: 0.25, octaves: 4, base: 4 });
  // soft diffuse halos
  for (let i = 0; i < 4; i++) {
    vein(ctx, rand, {
      x: -0.1 * w, y: rand() * h, angle: -0.5 + rand() * 0.5, length: w * 1.8, width: 26 * s,
      color: '#c9b79a', alpha: 0.18, blur: 14, wobble: 0.18, branchChance: 0, scale: s,
    });
  }
  // dramatic gold-grey veins
  for (let i = 0; i < 3; i++) {
    const y0 = h * (0.15 + i * 0.32 + rand() * 0.1);
    vein(ctx, rand, {
      x: -10, y: y0, angle: -0.35 + rand() * 0.4, length: w * 1.7, width: 7 * s,
      color: '#a8916b', alpha: 0.75, blur: 1.2, wobble: 0.22, branchChance: 0.01, scale: s,
    });
    vein(ctx, rand, {
      x: -10, y: y0 + 6 * s, angle: -0.3 + rand() * 0.3, length: w * 1.6, width: 2.2 * s,
      color: '#6f6457', alpha: 0.7, blur: 0.4, wobble: 0.24, branchChance: 0.01, scale: s,
    });
  }
  // fine hairline veins
  for (let i = 0; i < 9; i++) {
    vein(ctx, rand, {
      x: rand() * w, y: rand() * h, angle: -0.5 + rand() * 0.8, length: w * (0.15 + rand() * 0.45), width: 1 * s,
      color: '#9c9285', alpha: 0.4, wobble: 0.3, branchChance: 0.006, scale: s,
    });
  }
}

function statuarioNero(ctx, w, h, rand, s) {
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [40, 38, 36], strength: 0.6, octaves: 6, base: 3 });
  cloudLayer(ctx, w, h, rand, { tint: [0, 0, 0], strength: 0.4, octaves: 4, base: 5 });
  for (let i = 0; i < 3; i++) {
    vein(ctx, rand, {
      x: rand() * w * 0.3, y: -10, angle: 1.0 + rand() * 0.4, length: h * 1.4, width: 14 * s,
      color: '#cfcac2', alpha: 0.1, blur: 10, wobble: 0.22, branchChance: 0, scale: s,
    });
  }
  for (let i = 0; i < 4; i++) {
    vein(ctx, rand, {
      x: rand() * w, y: -10, angle: 1.05 + rand() * 0.5, length: h * (0.8 + rand() * 0.6), width: 2.6 * s,
      color: '#f1ede6', alpha: 0.85, wobble: 0.28, branchChance: 0.012, scale: s,
    });
  }
  for (let i = 0; i < 10; i++) {
    vein(ctx, rand, {
      x: rand() * w, y: rand() * h, angle: 0.9 + rand() * 0.8, length: w * (0.15 + rand() * 0.4), width: 0.8 * s,
      color: '#d9d4cc', alpha: 0.45, wobble: 0.3, branchChance: 0.006, scale: s,
    });
  }
}

function verdeAlpi(ctx, w, h, rand, s) {
  ctx.fillStyle = '#1f3a32';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [12, 28, 22], strength: 0.7, octaves: 6, base: 3 });
  cloudLayer(ctx, w, h, rand, { tint: [70, 110, 92], strength: 0.35, octaves: 5, base: 4 });
  for (let i = 0; i < 40; i++) {
    vein(ctx, rand, {
      x: rand() * w, y: rand() * h, angle: rand() * Math.PI * 2, length: w * (0.15 + rand() * 0.6), width: (0.6 + rand() * 2.2) * s,
      color: rand() < 0.7 ? '#cfe0d6' : '#8fb3a3', alpha: 0.55, wobble: 0.9, branchChance: 0.035, scale: s,
    });
  }
  speckles(ctx, rand, w, h, 500 * s, ['#0b1612', '#3d6656'], 2.2 * s, 0.45);
}

function travertine(ctx, w, h, rand, s, { warm = true } = {}) {
  ctx.fillStyle = warm ? '#d8c4a2' : '#e2d6c3';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [196, 170, 128], strength: 0.4, octaves: 5, base: 3 });
  // horizontal sedimentary strata (seamless horizontally)
  const bands = Math.round(170 * Math.max(0.6, s));
  for (let i = 0; i < bands; i++) {
    const y = rand() * h;
    const thick = (0.6 + rand() * rand() * 7) * s;
    const light = rand() < 0.55;
    ctx.globalAlpha = 0.08 + rand() * 0.25;
    ctx.strokeStyle = light ? '#f2e7d3' : (rand() < 0.5 ? '#b49870' : '#c7ad84');
    ctx.lineWidth = thick;
    ctx.beginPath();
    const k = 1 + Math.floor(rand() * 3);
    const amp = (1 + rand() * 5) * s;
    const ph = rand() * Math.PI * 2;
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin((x / w) * Math.PI * 2 * k + ph) * amp;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // elongated pores
  ctx.save();
  const pores = Math.round(900 * s * s);
  for (let i = 0; i < pores; i++) {
    const pw = (1 + rand() * rand() * 16) * s;
    const ph = (0.6 + rand() * 2.2) * s;
    ctx.globalAlpha = 0.25 + rand() * 0.4;
    ctx.fillStyle = rand() < 0.7 ? '#9a7f58' : '#7d6646';
    ctx.beginPath();
    ctx.ellipse(rand() * w, rand() * h, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function cemento(ctx, w, h, rand, s) {
  ctx.fillStyle = '#9a9894';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [120, 118, 114], strength: 0.55, octaves: 6, base: 3 });
  cloudLayer(ctx, w, h, rand, { tint: [180, 178, 172], strength: 0.4, octaves: 5, base: 5 });
  speckles(ctx, rand, w, h, 4000 * s * s, ['#6a6864', '#c9c6c0', '#55534f'], 1.1 * s, 0.4);
  // trowel sweeps
  for (let i = 0; i < 8; i++) {
    vein(ctx, rand, {
      x: rand() * w, y: rand() * h, angle: rand() * Math.PI, length: w * 0.6, width: 40 * s,
      color: rand() < 0.5 ? '#b5b2ac' : '#85837f', alpha: 0.12, blur: 20, wobble: 0.08, branchChance: 0, scale: s,
    });
  }
}

function limestone(ctx, w, h, rand, s) {
  ctx.fillStyle = '#ebe5da';
  ctx.fillRect(0, 0, w, h);
  cloudLayer(ctx, w, h, rand, { tint: [214, 202, 182], strength: 0.3, octaves: 6, base: 3 });
  cloudLayer(ctx, w, h, rand, { tint: [250, 247, 241], strength: 0.3, octaves: 4, base: 4 });
  speckles(ctx, rand, w, h, 1400 * s * s, ['#cdbfa6', '#bfae92', '#f7f2ea'], 1.4 * s, 0.35);
}

export const STONES = {
  calacatta: { draw: calacatta, seed: 11, avg: '#e9e2d6' },
  nero: { draw: statuarioNero, seed: 23, avg: '#1d1c1b' },
  travertine: { draw: travertine, seed: 37, avg: '#d3bf9d' },
  cemento: { draw: cemento, seed: 41, avg: '#9b9995' },
  verde: { draw: verdeAlpi, seed: 53, avg: '#24443a' },
  limestone: { draw: limestone, seed: 67, avg: '#e8e1d5' },
};

const cache = new Map();

// Returns an HTMLCanvasElement for the requested stone at width w (height = w * aspect).
export function stoneCanvas(name, w = 1024, aspect = 1) {
  const key = `${name}:${w}:${aspect}`;
  if (cache.has(key)) return cache.get(key);
  const recipe = STONES[name];
  const h = Math.round(w * aspect);
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const s = w / 1024; // detail scale relative to a 1024px reference
  recipe.draw(ctx, w, h, mulberry32(recipe.seed), s);
  cache.set(key, c);
  return c;
}

export function stoneDataURL(name, w = 360, aspect = 1) {
  return stoneCanvas(name, w, aspect).toDataURL('image/jpeg', 0.86);
}

// ─────────────────────────────────────────────────────────────
//  PBR surface maps: normal (from height) + roughness, generated
//  procedurally so every material has real micro-surface detail.
// ─────────────────────────────────────────────────────────────

const mapCache = new Map();
function cached(key, fn) {
  if (!mapCache.has(key)) mapCache.set(key, fn());
  return mapCache.get(key);
}

function heightsFrom(canvas, w, h, { invert = false, blur = 0 } = {}) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(canvas, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
    out[i] = invert ? 1 - l : l;
  }
  return out;
}

// Sobel-style normal map (OpenGL / +Y convention, matching three.js + flipY canvas textures).
export function heightToNormal(heights, w, h, strength = 2) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const at = (x, y) => heights[((y + h) % h) * w + ((x + w) % w)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      let nx = -dx;
      let ny = dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * w + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Roughness map: base level plus darker (lower-lying) areas rougher.
function roughnessFrom(heights, w, h, base, k) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = Math.max(0, Math.min(1, base + (1 - heights[i]) * k)) * 255;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const STONE_SURFACE = {
  calacatta: { normal: 0.9, blur: 1, rough: [0.78, 0.45] },
  nero: { normal: 0.9, blur: 1, rough: [0.78, 0.3], invert: true },
  travertine: { normal: 4.5, blur: 0, rough: [0.62, 0.9] },
  cemento: { normal: 2.6, blur: 0, rough: [0.7, 0.6] },
  verde: { normal: 0.9, blur: 1, rough: [0.8, 0.3] },
  limestone: { normal: 1.8, blur: 0, rough: [0.82, 0.4] },
};

/** Albedo + normal + roughness canvases for a stone. */
export function stoneMaps(name, w = 1024, aspect = 1) {
  return cached(`stone:${name}:${w}:${aspect}`, () => {
    const albedo = stoneCanvas(name, w, aspect);
    const s = STONE_SURFACE[name] || STONE_SURFACE.limestone;
    const nw = Math.min(512, w);
    const nh = Math.round(nw * aspect);
    const hts = heightsFrom(albedo, nw, nh, { invert: s.invert, blur: s.blur });
    return {
      albedo,
      normal: heightToNormal(hts, nw, nh, s.normal),
      rough: roughnessFrom(hts, nw, nh, s.rough[0], s.rough[1]),
    };
  });
}

/** Brushed-metal grain: fine streaks along U, used as roughness + normal. */
export function brushedMaps(w = 512) {
  return cached(`brushed:${w}`, () => {
    const c = makeCanvas(w, w);
    const ctx = c.getContext('2d');
    const rand = mulberry32(91);
    ctx.fillStyle = 'rgb(205,205,205)';
    ctx.fillRect(0, 0, w, w);
    for (let i = 0; i < w * 3; i++) {
      const y = rand() * w;
      const g = 178 + Math.floor(rand() * 60);
      ctx.globalAlpha = 0.15 + rand() * 0.3;
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      const x = rand() * w;
      const len = w * (0.3 + rand() * 0.9);
      ctx.fillRect(x, y, len, 0.6 + rand() * 0.9);
      ctx.fillRect(x - w, y, len, 0.6 + rand() * 0.9); // wrap seamlessly
    }
    ctx.globalAlpha = 1;
    const hts = heightsFrom(c, w, w);
    return { rough: c, normal: heightToNormal(hts, w, w, 0.8) };
  });
}

/** Matte porcelain: soft "orange-peel" glaze micro-relief. */
export function porcelainMaps(w = 512) {
  return cached(`porcelain:${w}`, () => {
    const c = makeCanvas(w, w);
    const ctx = c.getContext('2d');
    const rand = mulberry32(17);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, w);
    cloudLayer(ctx, w, w, rand, { tint: [255, 255, 255], strength: 0.5, octaves: 3, base: 32 });
    cloudLayer(ctx, w, w, rand, { tint: [0, 0, 0], strength: 0.45, octaves: 2, base: 64 });
    const hts = heightsFrom(c, w, w, { blur: 1 });
    return { rough: roughnessFrom(hts, w, w, 0.86, 0.22), normal: heightToNormal(hts, w, w, 1.6) };
  });
}

/** Smoked oak veneer: vertical grain with pores. */
export function woodMaps(w = 1024) {
  return cached(`wood:${w}`, () => {
    const c = makeCanvas(w, w);
    const ctx = c.getContext('2d');
    const rand = mulberry32(29);
    const s = w / 1024;
    ctx.fillStyle = '#5a4838';
    ctx.fillRect(0, 0, w, w);
    cloudLayer(ctx, w, w, rand, { tint: [40, 30, 22], strength: 0.35, octaves: 4, base: 2 });
    for (let i = 0; i < 260; i++) {
      const x0 = rand() * w;
      const tone = rand();
      ctx.strokeStyle = tone < 0.5 ? '#3d2f24' : '#7a6450';
      ctx.globalAlpha = 0.15 + rand() * 0.35;
      ctx.lineWidth = (0.6 + rand() * rand() * 5) * s;
      const amp = (2 + rand() * 9) * s;
      const ph = rand() * 6.28;
      ctx.beginPath();
      for (let y = 0; y <= w; y += 8) {
        const x = x0 + Math.sin((y / w) * Math.PI * 2 * 2 + ph) * amp;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#2a1f17';
    for (let i = 0; i < 2600 * s * s; i++) ctx.fillRect(rand() * w, rand() * w, 0.8 * s, (2 + rand() * 7) * s);
    ctx.globalAlpha = 1;
    const nw = Math.min(512, w);
    const hts = heightsFrom(c, nw, nw);
    return { albedo: c, normal: heightToNormal(hts, nw, nw, 2.2), rough: roughnessFrom(hts, nw, nw, 0.62, 0.5) };
  });
}

/** Soft rounded-rectangle glow (LED mirror halo on the wall). */
export function glowCanvas(w = 512, h = 600, inset = 110, radius = 70) {
  return cached(`glow:${w}:${h}:${inset}:${radius}`, () => {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.filter = 'blur(38px)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, radius);
    ctx.stroke();
    ctx.filter = 'blur(16px)';
    ctx.lineWidth = 12;
    ctx.stroke();
    return c;
  });
}

/** Radial soft shadow used for contact shadows. */
export function radialShadowCanvas(size = 256) {
  return cached(`shadow:${size}`, () => {
    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
  });
}

/** Flowing-water streaks (alpha map scrolled along a tube). */
export function waterStreakCanvas(w = 256, h = 64) {
  return cached(`water:${w}:${h}`, () => {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    const rand = mulberry32(5);
    ctx.fillStyle = 'rgb(150,150,150)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const g = 170 + Math.floor(rand() * 85);
      ctx.fillStyle = `rgba(${g},${g},${g},${0.4 + rand() * 0.6})`;
      const y = rand() * h;
      const x = rand() * w;
      const len = 10 + rand() * 60;
      ctx.fillRect(x, y, len, 1 + rand() * 2);
      ctx.fillRect(x - w, y, len, 1 + rand() * 2);
    }
    return c;
  });
}
