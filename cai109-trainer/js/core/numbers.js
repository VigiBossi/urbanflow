/* Number-system and coding algorithms, each returning its working so the
   generators and tools can show every step. */
(function () {
  const CAI = window.CAI;
  const U = CAI.util;
  const N = (CAI.num = {});
  const DIG = '0123456789ABCDEF';
  const SUB = (b) => `<sub>${b}</sub>`;
  N.SUB = SUB;

  N.toBase = (n, b) => n.toString(b).toUpperCase();
  N.bits = (n, w) => (n >>> 0).toString(2).padStart(w, '0').slice(-w);
  N.invert = (bits) => bits.replace(/[01]/g, (c) => (c === '0' ? '1' : '0'));
  N.reverse = (s) => s.split('').reverse().join('');
  N.digitVal = (c) => DIG.indexOf(c.toUpperCase());

  /* Repeated division: rows {n, q, r} */
  N.divRows = (n, b) => {
    const rows = [];
    do { rows.push({ n, q: Math.floor(n / b), r: n % b }); n = Math.floor(n / b); } while (n > 0);
    return rows;
  };
  N.divTable = (n, b) => {
    const rows = N.divRows(n, b);
    return `<table class="work"><tr><th>Divide</th><th>Quotient</th><th>Remainder</th></tr>${rows
      .map((r, i) => `<tr><td>${r.n} ÷ ${b}</td><td>${r.q}</td><td><b>${DIG[r.r]}</b>${b === 16 && r.r > 9 ? ` <span class="muted">(${r.r})</span>` : ''}${i === 0 ? ' <span class="muted">← LSB</span>' : i === rows.length - 1 ? ' <span class="muted">← MSB</span>' : ''}</td></tr>`)
      .join('')}</table>`;
  };

  /* Repeated multiplication for fractions (exact for dyadic fractions) */
  N.fracRows = (f, b, max = 8) => {
    const rows = [];
    while (f > 0 && rows.length < max) { const p = f * b; const d = Math.floor(p); rows.push({ f, p, d }); f = p - d; }
    return rows;
  };
  N.fracTable = (f, b, max = 8) => {
    const rows = N.fracRows(f, b, max);
    return `<table class="work"><tr><th>Multiply</th><th>Result</th><th>Digit</th></tr>${rows
      .map((r, i) => `<tr><td>${+r.f.toFixed(10)} × ${b}</td><td>${+r.p.toFixed(10)}</td><td><b>${DIG[r.d]}</b>${i === 0 ? ' <span class="muted">← first digit after the point</span>' : ''}</td></tr>`)
      .join('')}</table>`;
  };
  N.fracToBase = (f, b, max = 8) => N.fracRows(f, b, max).map((r) => DIG[r.d]).join('');

  /* Positional expansion "1×2^7 + 0×2^6 ..." */
  N.expansion = (str, b, onlyNonZero = true) => {
    const [ip, fp = ''] = str.toUpperCase().split('.');
    const terms = [];
    let total = 0;
    ip.split('').forEach((c, i) => {
      const p = ip.length - 1 - i; const d = N.digitVal(c);
      total += d * Math.pow(b, p);
      if (!onlyNonZero || d) terms.push({ d, p, v: d * Math.pow(b, p) });
    });
    fp.split('').forEach((c, i) => {
      const p = -(i + 1); const d = N.digitVal(c);
      total += d * Math.pow(b, p);
      if (!onlyNonZero || d) terms.push({ d, p, v: d * Math.pow(b, p) });
    });
    const html = terms.map((t) => `${t.d}×${b}<sup>${t.p}</sup>`).join(' + ') + ' = ' + terms.map((t) => +t.v.toFixed(10)).join(' + ') + ' = <b>' + +total.toFixed(10) + '</b>';
    return { terms, total, html };
  };

  N.parseBase = (str, b) => {
    const [ip, fp = ''] = str.toUpperCase().split('.');
    let v = 0;
    for (const c of ip) v = v * b + N.digitVal(c);
    let w = 1 / b;
    for (const c of fp) { v += N.digitVal(c) * w; w /= b; }
    return v;
  };

  /* Group bits from the radix point (for bin <-> oct/hex) */
  N.groupBits = (bits, k) => {
    const [ip, fp = ''] = bits.split('.');
    const padL = (k - (ip.length % k)) % k;
    const ipp = '0'.repeat(padL) + ip;
    const padR = fp ? (k - (fp.length % k)) % k : 0;
    const fpp = fp + '0'.repeat(padR);
    const gi = []; for (let i = 0; i < ipp.length; i += k) gi.push(ipp.slice(i, i + k));
    const gf = []; for (let i = 0; i < fpp.length; i += k) gf.push(fpp.slice(i, i + k));
    const digit = (g) => DIG[parseInt(g, 2)];
    return { gi, gf, digits: gi.map(digit).join('') + (gf.length ? '.' + gf.map(digit).join('') : '') };
  };

  /* ---- Binary arithmetic with carry/borrow rows ---- */
  N.addWork = (a, b, w) => {
    let c = 0; const carryIn = []; let sum = '';
    for (let i = 0; i < w; i++) {
      const x = (a >> i) & 1, y = (b >> i) & 1;
      carryIn[i] = c; const s = x + y + c; sum = (s & 1) + sum; c = s >> 1;
    }
    return { sum, carryOut: c, carries: carryIn.slice().reverse().join('') };
  };
  N.subWork = (a, b, w) => {
    let br = 0; const borrowIn = []; let diff = '';
    for (let i = 0; i < w; i++) {
      const x = (a >> i) & 1, y = (b >> i) & 1;
      borrowIn[i] = br; let d = x - y - br;
      if (d < 0) { d += 2; br = 1; } else br = 0;
      diff = d + diff;
    }
    return { diff, borrowOut: br, borrows: borrowIn.slice().reverse().join('') };
  };
  N.columnHTML = (rows) =>
    `<table class="work mono cols">${rows.map((r) => `<tr class="${r.cls || ''}"><td class="lbl">${r.label}</td>${r.bits.split('').map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

  /* ---- Signed numbers ---- */
  N.twos = (n, w) => N.bits(((n % 2 ** w) + 2 ** w) % 2 ** w, w);
  N.fromTwos = (bits) => { const v = parseInt(bits, 2); return bits[0] === '1' ? v - 2 ** bits.length : v; };
  N.signMag = (n, w) => (n < 0 ? '1' : '0') + N.bits(Math.abs(n), w - 1);
  N.ones = (n, w) => (n < 0 ? N.invert(N.bits(-n, w)) : N.bits(n, w));

  /* ---- Codes ---- */
  N.gray = (bits) => bits[0] + bits.slice(1).split('').map((c, i) => String(+c ^ +bits[i])).join('');
  N.grayToBin = (g) => { let out = g[0]; for (let i = 1; i < g.length; i++) out += String(+out[i - 1] ^ +g[i]); return out; };
  N.bcd = (n) => String(n).split('').map((d) => N.bits(+d, 4)).join(' ');

  /* Hamming(7,4): positions 1..7 = p1 p2 d1 p4 d2 d3 d4, even parity */
  N.hammingEncode = (data) => {
    const [d1, d2, d3, d4] = data.split('').map(Number);
    const p1 = d1 ^ d2 ^ d4, p2 = d1 ^ d3 ^ d4, p4 = d2 ^ d3 ^ d4;
    return { p1, p2, p4, code: `${p1}${p2}${d1}${p4}${d2}${d3}${d4}` };
  };
  N.hammingSyndrome = (code) => {
    const b = (i) => +code[i - 1];
    const c1 = b(1) ^ b(3) ^ b(5) ^ b(7), c2 = b(2) ^ b(3) ^ b(6) ^ b(7), c4 = b(4) ^ b(5) ^ b(6) ^ b(7);
    return { c1, c2, c4, pos: c4 * 4 + c2 * 2 + c1 };
  };
  N.flipBit = (bits, pos1) => bits.slice(0, pos1 - 1) + (bits[pos1 - 1] === '1' ? '0' : '1') + bits.slice(pos1);

  /* CRC: modulo-2 long division; rows record each XOR */
  N.crc = (data, gen) => {
    const r = gen.length - 1;
    const padded = data + '0'.repeat(r);
    const arr = padded.split('').map(Number);
    const rows = [];
    for (let i = 0; i + gen.length <= arr.length; i++) {
      if (arr[i] === 0) continue;
      const before = arr.slice(i, i + gen.length).join('');
      for (let j = 0; j < gen.length; j++) arr[i + j] ^= +gen[j];
      rows.push({ at: i, before, after: arr.slice(i, i + gen.length).join('') });
    }
    const rem = arr.slice(-r).join('');
    return { padded, rows, rem, frame: data + rem };
  };
  N.crcHTML = (data, gen) => {
    const c = N.crc(data, gen);
    let html = `<div class="mono small">Dividend: ${c.padded} &nbsp; Generator: ${gen}</div><table class="work mono">`;
    c.rows.forEach((row) => {
      const ind = '&nbsp;'.repeat(row.at);
      html += `<tr><td>${ind}${row.before}</td><td>XOR ${gen}</td><td>→ ${ind}${row.after}</td></tr>`;
    });
    return html + `</table><div>Remainder (last ${gen.length - 1} bits): <b class="mono">${c.rem}</b></div>`;
  };

  /* ---- IEEE 754 single precision ---- */
  N.f32bits = (x) => { const dv = new DataView(new ArrayBuffer(4)); dv.setFloat32(0, x); return N.bits(dv.getUint32(0), 32); };
  N.bitsToF32 = (bits) => { const dv = new DataView(new ArrayBuffer(4)); dv.setUint32(0, parseInt(bits, 2) >>> 0); return dv.getFloat32(0); };
  N.hexToBits = (hex) => hex.toUpperCase().split('').map((h) => N.bits(parseInt(h, 16), 4)).join('');
  N.bitsToHex = (bits) => bits.match(/.{4}/g).map((g) => parseInt(g, 2).toString(16).toUpperCase()).join('');

  /* Exact binary string for a dyadic number like 13.25 -> "1101.01" */
  N.binString = (x) => {
    const ip = Math.floor(x); const fp = x - ip;
    const f = N.fracToBase(fp, 2, 30);
    return N.toBase(ip, 2) + (f ? '.' + f : '');
  };
  N.ieeeEncode = (x) => {
    const s = x < 0 || Object.is(x, -0) ? 1 : 0;
    const a = Math.abs(x);
    const bin = N.binString(a);
    const digits = bin.replace('.', '');
    const pointPos = bin.indexOf('.') === -1 ? bin.length : bin.indexOf('.');
    const first1 = digits.indexOf('1');
    const e = pointPos - first1 - 1;
    const frac = digits.slice(first1 + 1).replace(/0+$/, '');
    const E = e + 127;
    const Ebits = N.bits(E, 8);
    const f23 = (frac + '0'.repeat(23)).slice(0, 23);
    const bits = `${s}${Ebits}${f23}`;
    return { s, a, bin, e, E, Ebits, frac: frac || '0', f23, bits, hex: N.bitsToHex(bits), norm: `1.${frac || '0'} × 2<sup>${e}</sup>` };
  };
  N.ieeeDecode = (hex) => {
    const bits = N.hexToBits(hex);
    const s = +bits[0], Ebits = bits.slice(1, 9), f23 = bits.slice(9);
    const E = parseInt(Ebits, 2);
    const frac = f23.replace(/0+$/, '');
    let special = null;
    if (E === 255) special = /1/.test(f23) ? 'NaN' : s ? '-Infinity' : '+Infinity';
    else if (E === 0) special = /1/.test(f23) ? 'denormal' : s ? '-0' : '+0';
    return { bits, s, Ebits, E, e: E - 127, f23, frac: frac || '0', value: N.bitsToF32(bits), special };
  };

  /* ---- Huffman (deterministic tie-breaking: weight, then creation order) ---- */
  N.huffman = (freqs) => {
    let order = 0;
    let nodes = Object.entries(freqs).map(([sym, w]) => ({ sym, w, o: order++ }));
    const merges = [];
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.w - b.w || a.o - b.o);
      const a = nodes.shift(), b = nodes.shift();
      const n = { w: a.w + b.w, l: a, r: b, o: order++, label: (a.sym || a.label) + (b.sym || b.label) };
      merges.push({ a: a.w, b: b.w, sum: n.w, la: a.sym || a.label, lb: b.sym || b.label });
      nodes.push(n);
    }
    const codes = {};
    (function walk(n, code) { if (n.sym) { codes[n.sym] = code || '0'; return; } walk(n.l, code + '0'); walk(n.r, code + '1'); })(nodes[0], '');
    const total = Object.entries(freqs).reduce((s, [k, w]) => s + w * codes[k].length, 0);
    return { merges, codes, total };
  };

  /* ---- LZ78: tokens (index, char); index 0 = empty phrase ---- */
  N.lz78 = (str) => {
    const dict = new Map(); const tokens = []; const phrases = [];
    let i = 0; let clean = true;
    while (i < str.length) {
      let w = ''; let idx = 0;
      while (i < str.length && dict.has(w + str[i])) { w += str[i]; idx = dict.get(w); i++; }
      if (i >= str.length) { tokens.push([idx, '-']); clean = false; break; }
      const c = str[i++];
      dict.set(w + c, dict.size + 1);
      tokens.push([idx, c]); phrases.push(w + c);
    }
    return { tokens, phrases, clean, str: tokens.map(([a, c]) => `(${a},${c})`).join('') };
  };

  /* ---- LZ77 decode: tokens (offset, length, next) ---- */
  N.lz77decode = (tokens) => {
    let out = '';
    for (const [o, l, c] of tokens) { const start = out.length - o; for (let k = 0; k < l; k++) out += out[start + k]; if (c) out += c; }
    return out;
  };
})();
