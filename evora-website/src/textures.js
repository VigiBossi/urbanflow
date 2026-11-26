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
