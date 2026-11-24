/* =====================================================================
   FUNCTIONAL DEPENDENCY & NORMALIZATION ENGINE
   Input (plain text):
     R(A,B,C,D)
     A->B
     B->C            (one FD per line, or separated by ";")
   Single-letter attributes may also be written AB->C or "R(A,B,C,D), A->B, B->C".
   Multi-letter names need commas:  StudentID, Course -> Grade
   Attribute sets are stored as bitmasks internally.
   ===================================================================== */
(function (root) {
  class FDError extends Error {}

  // ---------------- PARSING ----------------
  function parse(text) {
    const src = String(text || '').replace(/→/g, '->').replace(/[{}]/g, '');
    const m = src.match(/^\s*([A-Za-z_][\w]*)\s*\(([^)]*)\)/);
    if (!m) throw new FDError('Start with the relation, e.g. R(A,B,C,D). Then the FDs, e.g. A->B, B->C.');
    const attrs = m[2].split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (!attrs.length) throw new FDError('The relation has no attributes.');
    if (attrs.length > 20) throw new FDError('Please use at most 20 attributes.');
    const seen = new Set();
    attrs.forEach(a => { const k = a.toLowerCase(); if (seen.has(k)) throw new FDError(`Attribute ${a} is listed twice.`); seen.add(k); });
    const rest = src.slice(m[0].length);
    const fds = parseFDs(rest, attrs);
    return { name: m[1], attrs, fds, all: (1 << attrs.length) - 1 };
  }

  function attrIndex(attrs, name) { return attrs.findIndex(a => a.toLowerCase() === name.toLowerCase()); }

  function parseSet(str, attrs, where) {
    let mask = 0;
    const toks = str.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (!toks.length) throw new FDError(`An FD has an empty ${where} side.`);
    for (const t of toks) {
      const i = attrIndex(attrs, t);
      if (i >= 0) { mask |= 1 << i; continue; }
      // maybe concatenated single letters, e.g. AB
      const chars = t.split('');
      if (chars.every(ch => attrIndex(attrs, ch) >= 0)) { chars.forEach(ch => mask |= 1 << attrIndex(attrs, ch)); continue; }
      throw new FDError(`"${t}" is not an attribute of the relation (${attrs.join(', ')}).`);
    }
    return mask;
  }

  function parseFDs(text, attrs) {
    const out = [];
    const pieces = String(text).split(/[\n;]+/).map(s => s.trim().replace(/^,|,$/g, '').trim()).filter(Boolean);
    for (const piece of pieces) {
      const arrows = (piece.match(/->/g) || []).length;
      if (!arrows) throw new FDError(`"${piece}" has no "->". Write FDs like A->B.`);
      let parts;
      if (arrows === 1) parts = [piece];
      else {
        // several FDs on one line separated by commas: "A->B, B->C" ; tokens without arrows join the NEXT FD's left side
        const toks = piece.split(',').map(s => s.trim()).filter(Boolean);
        parts = []; let buf = [];
        for (const t of toks) {
          if (t.includes('->')) { buf.push(t); parts.push(buf.join(',')); buf = []; }
          else if (parts.length && !buf.length && !toks.slice(toks.indexOf(t) + 1).some(x => x.includes('->'))) parts[parts.length - 1] += ',' + t;
          else buf.push(t);
        }
        if (buf.length) parts[parts.length - 1] += ',' + buf.join(',');
      }
      for (const p of parts) {
        const [l, r] = p.split('->');
        out.push({ lhs: parseSet(l, attrs, 'left'), rhs: parseSet(r, attrs, 'right') });
      }
    }
    return out;
  }

  // ---------------- SET HELPERS ----------------
  const bits = (m) => { const o = []; for (let i = 0; m; i++, m >>>= 1) if (m & 1) o.push(i); return o; };
  const count = (m) => bits(m).length;
  const sub = (a, b) => (a & b) === a; // a ⊆ b
  function fmt(mask, attrs) {
    const names = bits(mask).map(i => attrs[i]);
    if (!names.length) return '∅';
    return attrs.every(a => a.length === 1) ? names.join('') : '{' + names.join(', ') + '}';
  }
  const fmtFD = (fd, attrs) => fmt(fd.lhs, attrs) + ' -> ' + fmt(fd.rhs, attrs);
  const fmtFDs = (fds, attrs) => fds.map(f => fmtFD(f, attrs)).join(', ');

  // ---------------- CLOSURE ----------------
  function closure(X, fds, attrs) {
    let res = X; const steps = [];
    if (attrs) steps.push(`Start: ${fmt(X, attrs)}+ = ${fmt(X, attrs)}  (every set determines itself — reflexivity)`);
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of fds) {
        if (sub(f.lhs, res) && !sub(f.rhs, res)) {
          const added = f.rhs & ~res;
          res |= f.rhs; changed = true;
          if (attrs) steps.push(`${fmtFD(f, attrs)}: ${fmt(f.lhs, attrs)} ⊆ current set, so add ${fmt(added, attrs)} → ${fmt(res, attrs)}`);
        }
      }
    }
    if (attrs) steps.push(`No FD adds anything new. Result: ${fmt(X, attrs)}+ = ${fmt(res, attrs)}`);
    return { mask: res, steps };
  }
  const clo = (X, fds) => closure(X, fds).mask;

  // ---------------- CANDIDATE KEYS ----------------
  function candidateKeys(all, fds, attrs) {
    const steps = [];
    let rhsU = 0, lhsU = 0;
    fds.forEach(f => { rhsU |= (f.rhs & ~f.lhs); lhsU |= f.lhs; });
    const core = all & ~rhsU;                 // never on a right side → in every key
    const never = rhsU & ~lhsU;               // only on right sides → in no key
    const middle = all & ~core & ~never;
    if (attrs) {
      steps.push(`Attributes that never appear on a right-hand side must be in EVERY key: ${fmt(core, attrs)}.`);
      steps.push(`Attributes that appear only on right-hand sides can never be in a key: ${fmt(never, attrs)}.`);
      steps.push(`Check ${fmt(core, attrs)}+ = ${fmt(clo(core, fds), attrs)}${clo(core, fds) === all ? ' — that is all attributes, so it is the only candidate key.' : ' — not everything yet, so try adding the other attributes: ' + fmt(middle, attrs) + '.'}`);
    }
    const keys = [];
    if (clo(core, fds) === all) keys.push(core);
    else {
      const mids = bits(middle);
      const n = mids.length;
      const combos = [];
      for (let m = 1; m < (1 << n); m++) combos.push(m);
      combos.sort((a, b) => count(a) - count(b) || a - b);
      for (const c of combos) {
        let X = core; bits(c).forEach(j => X |= 1 << mids[j]);
        if (keys.some(k => sub(k, X))) continue;
        if (clo(X, fds) === all) {
          keys.push(X);
          if (attrs) steps.push(`${fmt(X, attrs)}+ = all attributes and no smaller key is inside it → candidate key.`);
        }
      }
    }
    return { keys, steps, prime: keys.reduce((a, k) => a | k, 0) };
  }

  // ---------------- MINIMAL COVER ----------------
  function minimalCover(fds, attrs) {
    const steps = [];
    // 1. split right sides
    let F = [];
    fds.forEach(f => bits(f.rhs & ~f.lhs).forEach(i => F.push({ lhs: f.lhs, rhs: 1 << i })));
    F = uniq(F);
    if (attrs) steps.push(`Step 1 — one attribute on each right side (decomposition rule), drop trivial FDs: ${fmtFDs(F, attrs)}`);
    // 2. remove extraneous left attributes
    const s2 = [];
    F = F.map(f => {
      let lhs = f.lhs;
      for (const i of bits(f.lhs)) {
        if (count(lhs) <= 1) break;
        const smaller = lhs & ~(1 << i);
        if (sub(f.rhs, clo(smaller, F))) {
          s2.push(`In ${fmt(lhs, attrs || [])} -> ${fmt(f.rhs, attrs || [])}, ${attrs ? attrs[i] : i} is extraneous because ${fmt(smaller, attrs || [])}+ already contains ${fmt(f.rhs, attrs || [])}.`);
          lhs = smaller;
        }
      }
      return { lhs, rhs: f.rhs };
    });
    F = uniq(F);
    if (attrs) steps.push('Step 2 — remove extraneous attributes from left sides: ' + (s2.length ? s2.join(' ') : 'none found.') + ` Now: ${fmtFDs(F, attrs)}`);
    // 3. remove redundant FDs
    const s3 = [];
    for (let i = 0; i < F.length; i++) {
      const others = F.filter((_, j) => j !== i);
      if (sub(F[i].rhs, clo(F[i].lhs, others))) {
        if (attrs) s3.push(`${fmtFD(F[i], attrs)} is redundant (the other FDs give ${fmt(F[i].lhs, attrs)}+ = ${fmt(clo(F[i].lhs, others), attrs)}).`);
        F.splice(i, 1); i--;
      }
    }
    if (attrs) steps.push('Step 3 — remove redundant FDs: ' + (s3.length ? s3.join(' ') : 'none.') + ` Minimal cover: ${fmtFDs(F, attrs)}`);
    return { cover: F, steps };
  }
  function uniq(F) { const s = new Set(); return F.filter(f => { const k = f.lhs + ':' + f.rhs; if (s.has(k)) return false; s.add(k); return f.rhs !== 0 && !sub(f.rhs, f.lhs); }); }

  function equivalent(F, G) { return F.every(f => sub(f.rhs, clo(f.lhs, G))) && G.every(g => sub(g.rhs, clo(g.lhs, F))); }
  function isMinimal(F) {
    if (F.some(f => count(f.rhs) !== 1)) return { ok: false, why: 'Every right-hand side must have exactly one attribute.' };
    for (let i = 0; i < F.length; i++) {
      const others = F.filter((_, j) => j !== i);
      if (sub(F[i].rhs, clo(F[i].lhs, others))) return { ok: false, why: 'One FD is redundant (it follows from the others).', idx: i };
      for (const b of bits(F[i].lhs)) {
        const smaller = F[i].lhs & ~(1 << b);
        if (smaller && sub(F[i].rhs, clo(smaller, F))) return { ok: false, why: 'An FD has an extraneous attribute on its left side.', idx: i };
      }
    }
    return { ok: true };
  }

  // ---------------- PROJECTION OF FDs ----------------
  function project(Rmask, fds) {
    const at = bits(Rmask), res = [];
    for (let m = 1; m < (1 << at.length); m++) {
      let X = 0; bits(m).forEach(j => X |= 1 << at[j]);
      const c = clo(X, fds) & Rmask & ~X;
      if (c) res.push({ lhs: X, rhs: c });
    }
    return minimalCover(res).cover;
  }

  // ---------------- NORMAL FORMS ----------------
  function normalForm(all, fds, attrs) {
    const { keys, prime } = candidateKeys(all, fds);
    const reasons = [];
    const isSuper = (X) => clo(X, fds) === all;
    // 2NF: no non-prime attribute depends on a proper subset of a candidate key
    const partial = [];
    for (const k of keys) {
      if (count(k) < 2) continue;
      for (let s = (k - 1) & k; s > 0; s = (s - 1) & k) {
        const dep = clo(s, fds) & ~s & ~prime;
        if (dep) partial.push({ lhs: s, rhs: dep, key: k });
      }
    }
    const partialMin = partial.filter(p => !partial.some(q => q !== p && sub(q.lhs, p.lhs) && q.lhs !== p.lhs && sub(p.rhs, q.rhs)));
    // 3NF / BCNF on the split FDs
    const split = []; fds.forEach(f => bits(f.rhs & ~f.lhs).forEach(i => split.push({ lhs: f.lhs, rhs: 1 << i })));
    const v3 = split.filter(f => !isSuper(f.lhs) && !(f.rhs & prime));
    const vB = split.filter(f => !isSuper(f.lhs));
    let nf;
    if (partialMin.length) nf = '1NF';
    else if (v3.length) nf = '2NF';
    else if (vB.length) nf = '3NF';
    else nf = 'BCNF';
    if (attrs) {
      reasons.push(`Candidate key${keys.length > 1 ? 's' : ''}: ${keys.map(k => fmt(k, attrs)).join(', ')}. Prime attributes: ${fmt(prime, attrs)}. Non-prime: ${fmt(all & ~prime, attrs)}.`);
      reasons.push('1NF: assumed — all attributes are atomic (single values).');
      if (partialMin.length) partialMin.forEach(p => reasons.push(`2NF violated — partial dependency: ${fmt(p.lhs, attrs)} -> ${fmt(p.rhs, attrs)}. ${fmt(p.lhs, attrs)} is only part of the key ${fmt(p.key, attrs)}, and ${fmt(p.rhs, attrs)} is non-prime.`));
      else reasons.push(keys.every(k => count(k) === 1) ? '2NF: satisfied — every candidate key is a single attribute, so a partial dependency is impossible.' : '2NF: satisfied — no non-prime attribute depends on only part of a key.');
      const isPartialLhs = (X) => keys.some(k => sub(X, k) && X !== k);
      const trans = v3.filter(f => !isPartialLhs(f.lhs));
      if (trans.length) trans.forEach(f => reasons.push(`3NF violated — transitive dependency ${fmtFD(f, attrs)}: ${fmt(f.lhs, attrs)} is not a superkey and ${fmt(f.rhs, attrs)} is non-prime (key -> ${fmt(f.lhs, attrs)} -> ${fmt(f.rhs, attrs)}).`));
      else if (!v3.length) reasons.push('3NF: satisfied — for every FD X->A, X is a superkey or A is prime.');
      else reasons.push('3NF: also violated (the partial dependencies above break 3NF too).');
      const bOnly = vB.filter(f => !v3.includes(f));
      if (bOnly.length) bOnly.forEach(f => reasons.push(`BCNF violated — ${fmtFD(f, attrs)}: ${fmt(f.lhs, attrs)} is not a superkey (3NF still allows it because ${fmt(f.rhs, attrs)} is prime).`));
      else if (!vB.length) reasons.push('BCNF: satisfied — the left side of every non-trivial FD is a superkey.');
      reasons.push(`Highest normal form: ${nf}.`);
    }
    return { nf, keys, prime, reasons, partial: partialMin, v3, vB };
  }

  // ---------------- 3NF SYNTHESIS ----------------
  function synth3NF(all, fds, attrs) {
    const steps = [];
    const { cover } = minimalCover(fds);
    const { keys } = candidateKeys(all, fds);
    steps.push(`Step 1 — compute a minimal cover: ${fmtFDs(cover, attrs)}.`);
    const groups = new Map();
    cover.forEach(f => groups.set(f.lhs, (groups.get(f.lhs) || 0) | f.rhs));
    let rels = [...groups.entries()].map(([l, r]) => ({ mask: l | r, key: l }));
    steps.push(`Step 2 — one relation per left side (FDs with the same left side go together): ${rels.map(r => fmt(r.mask, attrs)).join(', ')}.`);
    if (!rels.some(r => keys.some(k => sub(k, r.mask)))) {
      rels.push({ mask: keys[0], key: keys[0] });
      steps.push(`Step 3 — no relation contains a candidate key, so add one with the key ${fmt(keys[0], attrs)} (this makes the join lossless).`);
    } else steps.push('Step 3 — some relation already contains a candidate key, so the decomposition is lossless. Nothing to add.');
    const before = rels.length;
    rels = rels.filter((r, i) => !rels.some((q, j) => j !== i && sub(r.mask, q.mask) && (r.mask !== q.mask || j < i)));
    steps.push(before !== rels.length ? `Step 4 — remove relations contained in another: ${rels.map(r => fmt(r.mask, attrs)).join(', ')}.` : 'Step 4 — no relation is contained in another.');
    return { relations: rels.map(r => ({ mask: r.mask, fds: project(r.mask, fds), keys: candidateKeys(r.mask, project(r.mask, fds)).keys })), steps };
  }

  // ---------------- BCNF DECOMPOSITION ----------------
  function bcnf(all, fds, attrs) {
    const steps = [];
    let todo = [all], done = [];
    let guard = 0;
    while (todo.length && guard++ < 50) {
      const Ri = todo.shift();
      const Fi = Ri === all ? fds : project(Ri, fds);
      let viol = null;
      for (const f of Fi) { const r = f.rhs & ~f.lhs & Ri; if (r && sub(f.lhs, Ri) && (clo(f.lhs, fds) & Ri) !== Ri) { viol = f; break; } }
      if (!viol) {
        const at = bits(Ri);
        for (let m = 1; m < (1 << at.length) - 1 && !viol; m++) {
          let X = 0; bits(m).forEach(j => X |= 1 << at[j]);
          const c = clo(X, fds) & Ri;
          if (c !== X && c !== Ri) viol = { lhs: X, rhs: c & ~X };
        }
      }
      if (!viol) { done.push(Ri); steps.push(`${fmt(Ri, attrs)} is in BCNF (every determinant is a superkey of it).`); continue; }
      const Xp = clo(viol.lhs, fds) & Ri;
      const R1 = Xp, R2 = (Ri & ~Xp) | viol.lhs;
      steps.push(`${fmt(Ri, attrs)} violates BCNF because of ${fmt(viol.lhs, attrs)} -> ${fmt(viol.rhs & Ri, attrs)} (${fmt(viol.lhs, attrs)} is not a superkey). Split into R1 = ${fmt(viol.lhs, attrs)}+ ∩ R = ${fmt(R1, attrs)} and R2 = ${fmt(R2, attrs)} (the rest plus ${fmt(viol.lhs, attrs)}).`);
      todo.push(R1, R2);
    }
    done = done.filter((r, i) => !done.some((q, j) => j !== i && sub(r, q) && (r !== q || j < i)));
    const pres = preservation(done, fds, attrs);
    steps.push(pres.ok ? 'All FDs are preserved.' : `Not dependency preserving: ${pres.lost.map(f => fmtFD(f, attrs)).join(', ')} cannot be checked inside a single relation. (BCNF sometimes has to give this up; 3NF never does.)`);
    return { relations: done.map(m => ({ mask: m, fds: project(m, fds), keys: candidateKeys(m, project(m, fds)).keys })), steps, preserved: pres.ok, lost: pres.lost };
  }

  // ---------------- DECOMPOSITION TESTS ----------------
  function preservation(rels, fds) {
    const lost = [];
    for (const f of fds) {
      let Z = f.lhs, changed = true;
      while (changed) {
        changed = false;
        for (const R of rels) { const t = clo(Z & R, fds) & R; if ((Z | t) !== Z) { Z |= t; changed = true; } }
      }
      if (!sub(f.rhs, Z)) lost.push(f);
    }
    return { ok: !lost.length, lost };
  }

  /** Chase test. Returns { lossless, steps, table } */
  function chase(all, rels, fds, attrs) {
    const n = attrs.length;
    const T = rels.map((R, i) => attrs.map((_, j) => (R >> j) & 1 ? 'a' + (j + 1) : 'b' + (i + 1) + (j + 1)));
    const steps = [];
    const show = () => T.map((r, i) => fmt(rels[i], attrs).padEnd(10) + ' | ' + r.join(' ')).join('\n');
    steps.push('Start tableau (a = known value from the original row, b = unknown):\n' + show());
    let changed = true, guard = 0;
    while (changed && guard++ < 100) {
      changed = false;
      for (const f of fds) {
        const L = bits(f.lhs), Rr = bits(f.rhs);
        for (let i = 0; i < T.length; i++) for (let k = i + 1; k < T.length; k++) {
          if (L.every(j => T[i][j] === T[k][j])) {
            for (const j of Rr) {
              if (T[i][j] !== T[k][j]) {
                const keep = T[i][j].startsWith('a') ? T[i][j] : (T[k][j].startsWith('a') ? T[k][j] : (T[i][j] < T[k][j] ? T[i][j] : T[k][j]));
                const old = T[i][j] === keep ? T[k][j] : T[i][j];
                for (const row of T) if (row[j] === old) row[j] = keep;
                changed = true;
                steps.push(`Rows ${i + 1} and ${k + 1} agree on ${fmt(f.lhs, attrs)}, so by ${fmtFD(f, attrs)} make column ${attrs[j]} equal (${keep}).\n` + show());
              }
            }
          }
        }
      }
    }
    const win = T.findIndex(r => r.every(v => v.startsWith('a')));
    steps.push(win >= 0 ? `Row ${win + 1} is all "a" → the decomposition is LOSSLESS.` : 'No row became all "a" → the decomposition is LOSSY (joining the pieces can create fake rows).');
    return { lossless: win >= 0, steps };
  }

  function parseDecomposition(text, attrs) {
    const rels = [];
    const re = /([A-Za-z_]\w*)?\s*\(([^)]*)\)/g; let m;
    while ((m = re.exec(text))) {
      const mask = parseSet(m[2], attrs, 'relation');
      rels.push({ name: m[1] || 'R' + (rels.length + 1), mask });
    }
    if (!rels.length) throw new FDError('Write the relations like R1(A,B), R2(B,C).');
    return rels;
  }

  // ---------------- FULL ANALYSIS (for the interactive tool) ----------------
  function analyze(text, decompText) {
    const P = parse(text);
    const { attrs, fds, all } = P;
    const out = { P };
    out.closures = bits(all).map(i => ({ X: 1 << i, ...closure(1 << i, fds, attrs) }));
    out.keys = candidateKeys(all, fds, attrs);
    // closures of keys
    out.keyClosures = out.keys.keys.map(k => ({ X: k, ...closure(k, fds, attrs) }));
    out.cover = minimalCover(fds, attrs);
    out.nf = normalForm(all, fds, attrs);
    out.syn = synth3NF(all, fds, attrs);
    out.bcnf = bcnf(all, fds, attrs);
    if (decompText && decompText.trim()) {
      const rels = parseDecomposition(decompText, attrs);
      const covered = rels.reduce((a, r) => a | r.mask, 0);
      out.decomp = {
        rels,
        covers: covered === all,
        chase: chase(all, rels.map(r => r.mask), fds, attrs),
        pres: preservation(rels.map(r => r.mask), fds),
        nfs: rels.map(r => { const pf = project(r.mask, fds); return { name: r.name, mask: r.mask, fds: pf, nf: normalFormOn(r.mask, pf) }; })
      };
    }
    return out;
  }
  // normal form of a sub-relation (attributes as a mask inside the global attribute numbering)
  function normalFormOn(mask, pf) {
    const at = bits(mask);
    const remap = (m) => { let r = 0; at.forEach((g, i) => { if (m & (1 << g)) r |= 1 << i; }); return r; };
    const F = pf.map(f => ({ lhs: remap(f.lhs), rhs: remap(f.rhs) }));
    return normalForm((1 << at.length) - 1, F).nf;
  }

  const API = { parse, parseFDs, parseSet, parseDecomposition, closure, candidateKeys, minimalCover, normalForm, normalFormOn, synth3NF, bcnf, preservation, chase, project, equivalent, isMinimal, analyze, fmt, fmtFD, fmtFDs, bits, count, sub, FDError };
  root.FD = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
