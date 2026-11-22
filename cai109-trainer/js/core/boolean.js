/* Boolean expression engine: parser that accepts plain-keyboard input,
   evaluator, truth tables, and a Quine–McCluskey minimiser (SOP / POS). */
(function () {
  const CAI = window.CAI;
  const B = (CAI.bool = {});
  const KW = { AND: 'and', OR: 'or', NOT: 'not', XOR: 'xor', NAND: 'nand', NOR: 'nor', XNOR: 'xnor' };

  class BoolError extends Error {
    constructor(msg, pos) { super(msg); this.pos = pos; }
  }
  B.BoolError = BoolError;

  function tokenize(src) {
    const s = String(src)
      .toUpperCase()
      .replace(/[’‘`´′]/g, "'")
      .replace(/¬/g, '!')
      .replace(/[∧·⋅×]/g, '*')
      .replace(/∨/g, '+')
      .replace(/⊕/g, '^');
    const toks = [];
    let i = 0;
    const sym = { '(': 'lp', ')': 'rp', '[': 'lp', ']': 'rp', '+': 'or', '|': 'or', '*': 'and', '&': 'and', '.': 'and', '^': 'xor', "'": 'prime', '!': 'not', '~': 'not' };
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[A-Z]/.test(c)) {
        let j = i;
        while (j < s.length && /[A-Z]/.test(s[j])) j++;
        const w = s.slice(i, j);
        if (KW[w]) toks.push({ k: 'op', v: KW[w], pos: i });
        else for (let q = 0; q < w.length; q++) toks.push({ k: 'var', v: w[q], pos: i + q });
        i = j;
        continue;
      }
      if (c === '0' || c === '1') { toks.push({ k: 'const', v: +c, pos: i }); i++; continue; }
      if (sym[c]) {
        const m = sym[c];
        if (m === 'lp' || m === 'rp' || m === 'prime') toks.push({ k: m, pos: i });
        else toks.push({ k: 'op', v: m, pos: i });
        if ((c === '&' || c === '|') && s[i + 1] === c) i++; // allow && and ||
        i++;
        continue;
      }
      throw new BoolError(`I don't understand the character "${c}". Use letters A–Z, AND/OR/NOT/XOR/NAND/NOR/XNOR, + * ' ( ) 0 1.`, i);
    }
    return toks;
  }

  /* Precedence (low -> high): OR/NOR, XOR/XNOR, AND/NAND (incl. implicit AB), NOT, postfix ' */
  B.parse = function (src) {
    const toks = tokenize(src);
    if (!toks.length) throw new BoolError('Please type an expression.', 0);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (t, ...ops) => t && t.k === 'op' && ops.includes(t.v);
    const startsOperand = (t) => t && (t.k === 'var' || t.k === 'const' || t.k === 'lp' || isOp(t, 'not'));

    function parseOr() {
      let a = parseXor();
      while (isOp(peek(), 'or', 'nor')) { const o = toks[p++].v; a = { t: o, a, b: parseXor() }; }
      return a;
    }
    function parseXor() {
      let a = parseAnd();
      while (isOp(peek(), 'xor', 'xnor')) { const o = toks[p++].v; a = { t: o, a, b: parseAnd() }; }
      return a;
    }
    function parseAnd() {
      let a = parseUnary();
      for (;;) {
        const t = peek();
        if (isOp(t, 'and', 'nand')) { p++; a = { t: t.v, a, b: parseUnary() }; }
        else if (startsOperand(t)) a = { t: 'and', a, b: parseUnary() };
        else break;
      }
      return a;
    }
    function parseUnary() {
      if (isOp(peek(), 'not')) { p++; return { t: 'not', a: parseUnary() }; }
      let a = parsePrimary();
      while (peek() && peek().k === 'prime') { p++; a = { t: 'not', a }; }
      return a;
    }
    function parsePrimary() {
      const t = peek();
      if (!t) throw new BoolError('The expression ends too early — an operand is missing at the end.', String(src).length);
      if (t.k === 'var') { p++; return { t: 'var', n: t.v }; }
      if (t.k === 'const') { p++; return { t: 'const', v: t.v }; }
      if (t.k === 'lp') {
        p++;
        const e = parseOr();
        if (!peek() || peek().k !== 'rp') throw new BoolError('A closing parenthesis ")" is missing.', peek() ? peek().pos : String(src).length);
        p++;
        return e;
      }
      if (t.k === 'rp') throw new BoolError('There is an unexpected ")" — check your parentheses.', t.pos);
      if (t.k === 'prime') throw new BoolError("A ' (NOT) must come right after a variable or a ')'.", t.pos);
      throw new BoolError(`"${t.v.toUpperCase()}" needs an operand before it.`, t.pos);
    }
    const ast = parseOr();
    if (p < toks.length) {
      const t = toks[p];
      throw new BoolError(t.k === 'rp' ? 'There is an extra ")".' : 'Something is out of place near position ' + (t.pos + 1) + '.', t.pos);
    }
    return ast;
  };

  B.tryParse = (src) => { try { return { ast: B.parse(src) }; } catch (e) { return { error: e.message, pos: e.pos }; } };

  B.evaluate = function ev(n, env) {
    switch (n.t) {
      case 'var': return env[n.n] ? 1 : 0;
      case 'const': return n.v;
      case 'not': return 1 - ev(n.a, env);
      case 'and': return ev(n.a, env) & ev(n.b, env);
      case 'or': return ev(n.a, env) | ev(n.b, env);
      case 'xor': return ev(n.a, env) ^ ev(n.b, env);
      case 'nand': return 1 - (ev(n.a, env) & ev(n.b, env));
      case 'nor': return 1 - (ev(n.a, env) | ev(n.b, env));
      case 'xnor': return 1 - (ev(n.a, env) ^ ev(n.b, env));
    }
    throw new Error('bad node ' + n.t);
  };

  B.vars = (ast) => {
    const s = new Set();
    (function walk(n) { if (n.t === 'var') s.add(n.n); if (n.a) walk(n.a); if (n.b) walk(n.b); })(ast);
    return [...s].sort();
  };

  B.envFor = (i, vars) => {
    const env = {}; const n = vars.length;
    vars.forEach((v, k) => { env[v] = (i >> (n - 1 - k)) & 1; });
    return env;
  };

  /* Output column, row i uses the binary of i with vars[0] as MSB */
  B.table = (ast, vars) => CAI.util.range(1 << vars.length).map((i) => B.evaluate(ast, B.envFor(i, vars)));
  B.minterms = (ast, vars) => B.table(ast, vars).map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  B.literals = (ast) => { let c = 0; (function w(n) { if (n.t === 'var') c++; if (n.a) w(n.a); if (n.b) w(n.b); })(ast); return c; };
  B.opsUsed = (ast) => { const s = new Set(); (function w(n) { if (n.t !== 'var' && n.t !== 'const') s.add(n.t); if (n.a) w(n.a); if (n.b) w(n.b); })(ast); return s; };
  B.notOnlyOnVars = (ast) => { let ok = true; (function w(n) { if (n.t === 'not' && n.a.t !== 'var' && n.a.t !== 'const') ok = false; if (n.a) w(n.a); if (n.b) w(n.b); })(ast); return ok; };

  const isLiteral = (n) => n.t === 'var' || (n.t === 'not' && n.a.t === 'var');
  const flatten = (n, type) => (n.t === type ? [...flatten(n.a, type), ...flatten(n.b, type)] : [n]);
  B.isSOP = (ast) => flatten(ast, 'or').every((term) => term.t === 'const' || flatten(term, 'and').every(isLiteral));
  B.isPOS = (ast) => flatten(ast, 'and').every((f) => f.t === 'const' || flatten(f, 'or').every(isLiteral));

  /* Pretty printer using ' for NOT and juxtaposition for AND */
  const PREC = { or: 1, nor: 1, xor: 2, xnor: 2, and: 3, nand: 3, not: 4, var: 5, const: 5 };
  B.toStr = function str(n) {
    const wrap = (c, min) => (PREC[c.t] < min ? '(' + str(c) + ')' : str(c));
    switch (n.t) {
      case 'var': return n.n;
      case 'const': return String(n.v);
      case 'not': return n.a.t === 'var' || n.a.t === 'const' || n.a.t === 'not' ? str(n.a) + "'" : '(' + str(n.a) + ")'";
      case 'and': return wrap(n.a, 3) + wrap(n.b, 3.5);
      case 'or': return wrap(n.a, 1) + ' + ' + wrap(n.b, 1.5);
      case 'xor': return wrap(n.a, 2) + ' XOR ' + wrap(n.b, 2.5);
      case 'xnor': return wrap(n.a, 2) + ' XNOR ' + wrap(n.b, 2.5);
      case 'nand': return wrap(n.a, 3) + ' NAND ' + wrap(n.b, 3.5);
      case 'nor': return wrap(n.a, 1) + ' NOR ' + wrap(n.b, 1.5);
    }
  };

  /* Distinct internal sub-expressions in evaluation order (for truth-table columns) */
  B.subexprs = (ast) => {
    const out = []; const seen = new Set();
    (function w(n) {
      if (n.a) w(n.a); if (n.b) w(n.b);
      if (n.t === 'var' || n.t === 'const') return;
      const s = B.toStr(n);
      if (!seen.has(s)) { seen.add(s); out.push({ node: n, str: s }); }
    })(ast);
    return out;
  };

  B.equivalent = (a, b, dcs = []) => {
    const vars = [...new Set([...B.vars(a), ...B.vars(b)])].sort();
    const dc = new Set(dcs);
    for (let i = 0; i < 1 << vars.length; i++) {
      if (dc.has(i)) continue;
      const env = B.envFor(i, vars);
      if (B.evaluate(a, env) !== B.evaluate(b, env)) return false;
    }
    return true;
  };

  /* ---------- Quine–McCluskey ---------- */
  function coverOf(imp, n) {
    const out = [];
    for (let m = 0; m < 1 << n; m++) if ((m & ~imp.dash) === imp.val) out.push(m);
    return out;
  }

  B.primeImplicants = function (n, ones, dcs = []) {
    const all = [...new Set([...ones, ...dcs])];
    let cur = new Map(all.map((m) => [m + '|0', { val: m, dash: 0 }]));
    const primes = new Map();
    while (cur.size) {
      const arr = [...cur.values()];
      const next = new Map();
      const used = new Set();
      for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i], b = arr[j];
          if (a.dash !== b.dash) continue;
          const d = a.val ^ b.val;
          if (CAI.util.popcount(d) !== 1) continue;
          const imp = { val: a.val & ~d, dash: a.dash | d };
          next.set(imp.val + '|' + imp.dash, imp);
          used.add(a.val + '|' + a.dash); used.add(b.val + '|' + b.dash);
        }
      for (const a of arr) { const k = a.val + '|' + a.dash; if (!used.has(k)) primes.set(k, a); }
      cur = next;
    }
    return [...primes.values()].map((p) => ({ ...p, cov: coverOf(p, n), lits: n - CAI.util.popcount(p.dash) }));
  };

  function combos(arr, k, cb, start = 0, acc = []) {
    if (acc.length === k) { cb(acc); return; }
    for (let i = start; i < arr.length; i++) { acc.push(arr[i]); combos(arr, k, cb, i + 1, acc); acc.pop(); }
  }

  /* Returns the minimal list of implicants covering `ones` */
  B.minimize = function (n, ones, dcs = []) {
    ones = [...new Set(ones)].sort((a, b) => a - b);
    if (!ones.length) return [];
    const primes = B.primeImplicants(n, ones, dcs).filter((p) => p.cov.some((m) => ones.includes(m)));
    const chosen = [];
    for (const m of ones) {
      const cs = primes.filter((p) => p.cov.includes(m));
      if (cs.length === 1 && !chosen.includes(cs[0])) chosen.push(cs[0]);
    }
    const rem = ones.filter((m) => !chosen.some((p) => p.cov.includes(m)));
    if (!rem.length) return sortTerms(chosen);
    const cand = primes.filter((p) => !chosen.includes(p) && p.cov.some((m) => rem.includes(m)));
    if (cand.length > 22) { // greedy fallback for very large problems
      const left = new Set(rem);
      while (left.size) {
        let best = null, bestScore = -1;
        for (const p of cand) { const sc = p.cov.filter((m) => left.has(m)).length * 10 - p.lits; if (sc > bestScore) { bestScore = sc; best = p; } }
        chosen.push(best); best.cov.forEach((m) => left.delete(m));
      }
      return sortTerms(chosen);
    }
    for (let k = 1; k <= cand.length; k++) {
      let best = null;
      combos(cand, k, (c) => {
        if (rem.every((m) => c.some((p) => p.cov.includes(m)))) {
          const lit = c.reduce((s, p) => s + p.lits, 0);
          if (!best || lit < best.lit) best = { c: c.slice(), lit };
        }
      });
      if (best) return sortTerms(chosen.concat(best.c));
    }
    return sortTerms(chosen);
  };
  const sortTerms = (ts) => ts.slice().sort((a, b) => b.cov.length - a.cov.length || a.val - b.val);

  B.termSOP = (imp, vars) => {
    const n = vars.length; let s = '';
    vars.forEach((v, k) => { const bit = 1 << (n - 1 - k); if (imp.dash & bit) return; s += imp.val & bit ? v : v + "'"; });
    return s || '1';
  };
  /* imp is an implicant of F' (a group of 0s) -> sum term */
  B.termPOS = (imp, vars) => {
    const n = vars.length; const lits = [];
    vars.forEach((v, k) => { const bit = 1 << (n - 1 - k); if (imp.dash & bit) return; lits.push(imp.val & bit ? v + "'" : v); });
    return lits.length ? lits.join(' + ') : '0';
  };

  B.minSOP = (vars, ones, dcs = []) => {
    const n = vars.length;
    const full = CAI.util.range(1 << n);
    const dcset = new Set(dcs);
    const realOnes = ones.filter((m) => !dcset.has(m));
    if (!realOnes.length) return { expr: '0', terms: [], literals: 0 };
    if (full.every((m) => realOnes.includes(m) || dcset.has(m))) return { expr: '1', terms: [{ val: 0, dash: (1 << n) - 1, cov: full, lits: 0 }], literals: 0 };
    const terms = B.minimize(n, realOnes, dcs);
    return { expr: terms.map((t) => B.termSOP(t, vars)).join(' + '), terms, literals: terms.reduce((s, t) => s + t.lits, 0) };
  };

  B.minPOS = (vars, ones, dcs = []) => {
    const n = vars.length;
    const dcset = new Set(dcs);
    const zeros = CAI.util.range(1 << n).filter((m) => !ones.includes(m) && !dcset.has(m));
    if (!zeros.length) return { expr: '1', terms: [], literals: 0 };
    if (!ones.filter((m) => !dcset.has(m)).length) return { expr: '0', terms: [{ val: 0, dash: (1 << n) - 1, cov: CAI.util.range(1 << n), lits: 0 }], literals: 0 };
    const terms = B.minimize(n, zeros, dcs);
    const parts = terms.map((t) => B.termPOS(t, vars));
    const expr = parts.length === 1 && t1lits(terms[0]) <= 1 ? parts[0] : parts.map((p) => '(' + p + ')').join('');
    return { expr, terms, literals: terms.reduce((s, t) => s + t.lits, 0) };
  };
  const t1lits = (t) => t.lits;

  B.mintermStr = (m, vars) => B.termSOP({ val: m, dash: 0 }, vars);
  B.maxtermStr = (m, vars) => '(' + B.termPOS({ val: m, dash: 0 }, vars) + ')';
  B.canonicalSOP = (vars, ones) => (ones.length ? ones.map((m) => B.mintermStr(m, vars)).join(' + ') : '0');
  B.canonicalPOS = (vars, ones) => {
    const zeros = CAI.util.range(1 << vars.length).filter((m) => !ones.includes(m));
    return zeros.length ? zeros.map((m) => B.maxtermStr(m, vars)).join('') : '1';
  };

  /* K-map layout helpers: Gray-coded row/column order */
  B.GRAY = { 1: [0, 1], 2: [0, 1, 3, 2] };
  B.kmapLayout = (n) => {
    const rb = n === 2 ? 1 : n === 3 ? 1 : 2; // row bits
    const cb = n - rb;
    const rows = B.GRAY[rb], cols = B.GRAY[cb];
    const cell = (r, c) => (rows[r] << cb) | cols[c];
    return { rb, cb, rows, cols, cell };
  };
})();
