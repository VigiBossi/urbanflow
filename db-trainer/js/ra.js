/* =====================================================================
   RELATIONAL ALGEBRA ENGINE (plain-text syntax) — parses and evaluates
   expressions on the sample database.

   Supported syntax (keywords are case-insensitive):
     SELECT[cond](R)                 selection  (sigma)
     PROJECT[a, b, e.c](R)           projection (pi)
     RENAME[S](R)                    rename the relation (alias)  -> S.a, S.b ...
     RENAME[S(x, y, z)](R)           rename relation and all columns
     RENAME[old->new, a->b](R)       rename some columns
     R AS e                          short alias (same as RENAME[e](R))
     R UNION S, R INTERSECT S, R MINUS S
     R TIMES S   (also CROSS or X)   cartesian product
     R JOIN[cond] S                  theta / equi join
     R NATURALJOIN S  (or R JOIN S)  natural join
     R LEFTJOIN[cond] S, RIGHTJOIN, FULLJOIN  (without [cond] = natural outer join)
     R DIVIDE S                      division
     GROUP[a, b; COUNT(*) AS n, AVG(salary) AS avgsal](R)   aggregation
     T1 <- expression                assignment (one per line, or separate with ;)
   Conditions: = <> != < <= > >= AND OR NOT, numbers, 'strings', IS NULL, IS NOT NULL
   ===================================================================== */
(function (root) {
  class RAError extends Error {}

  // ---------------- TOKENIZER ----------------
  const KW = new Set(['SELECT', 'SIGMA', 'PROJECT', 'PI', 'RENAME', 'RHO', 'UNION', 'INTERSECT', 'INTERSECTION', 'MINUS',
    'DIFFERENCE', 'EXCEPT', 'TIMES', 'CROSS', 'PRODUCT', 'JOIN', 'THETAJOIN', 'NATURALJOIN', 'NJOIN', 'LEFTJOIN', 'RIGHTJOIN',
    'FULLJOIN', 'LEFTOUTERJOIN', 'RIGHTOUTERJOIN', 'FULLOUTERJOIN', 'DIVIDE', 'DIVISION', 'GROUP', 'GAMMA', 'AND', 'OR',
    'NOT', 'AS', 'IS', 'NULL']);

  function tokenize(src) {
    const toks = [];
    let i = 0;
    const s = src;
    let depth = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\n' && depth > 0) { i++; continue; }
      if (c === '\n' || c === ';') { toks.push({ t: 'sep', v: c, pos: i }); i++; continue; }
      if (c === '(' || c === '[') depth++;
      if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
      if (/\s/.test(c)) { i++; continue; }
      if (c === '-' && s[i + 1] === '-') { while (i < s.length && s[i] !== '\n') i++; continue; } // comment
      if (c === "'" || c === '"') {
        let j = i + 1, str = '';
        while (j < s.length && s[j] !== c) { str += s[j]; j++; }
        if (j >= s.length) throw new RAError(`A text value starting at position ${i + 1} has no closing quote ${c}.`);
        toks.push({ t: 'str', v: str, pos: i }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1]))) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        toks.push({ t: 'num', v: parseFloat(s.slice(i, j)), pos: i }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < s.length && /[A-Za-z0-9_.]/.test(s[j])) j++;
        const w = s.slice(i, j).replace(/\.$/, '');
        const up = w.toUpperCase();
        toks.push(KW.has(up) ? { t: 'kw', v: up, raw: w, pos: i } : { t: 'id', v: w, pos: i });
        i += w.length; continue;
      }
      const two = s.slice(i, i + 2);
      if (['<-', '<=', '>=', '<>', '!=', '->'].includes(two)) { toks.push({ t: 'op', v: two, pos: i }); i += 2; continue; }
      if ('()[],=<>*'.includes(c)) { toks.push({ t: 'op', v: c, pos: i }); i++; continue; }
      if (c === '÷') { toks.push({ t: 'kw', v: 'DIVIDE', pos: i }); i++; continue; }
      if (c === '×') { toks.push({ t: 'kw', v: 'TIMES', pos: i }); i++; continue; }
      throw new RAError(`I don't understand the character "${c}" at position ${i + 1}.`);
    }
    return toks;
  }

  // ---------------- PARSER ----------------
  const BINOPS = {
    UNION: 'union', INTERSECT: 'intersect', INTERSECTION: 'intersect', MINUS: 'minus', DIFFERENCE: 'minus', EXCEPT: 'minus',
    TIMES: 'times', CROSS: 'times', PRODUCT: 'times', JOIN: 'join', THETAJOIN: 'join', NATURALJOIN: 'njoin', NJOIN: 'njoin',
    LEFTJOIN: 'left', LEFTOUTERJOIN: 'left', RIGHTJOIN: 'right', RIGHTOUTERJOIN: 'right', FULLJOIN: 'full',
    FULLOUTERJOIN: 'full', DIVIDE: 'divide', DIVISION: 'divide'
  };

  function Parser(toks) { this.toks = toks; this.i = 0; }
  Parser.prototype = {
    peek(k = 0) { return this.toks[this.i + k]; },
    next() { return this.toks[this.i++]; },
    skipSeps() { while (this.peek() && this.peek().t === 'sep') this.i++; },
    skipNewlines() { while (this.peek() && this.peek().t === 'sep' && this.peek().v === '\n') this.i++; },
    isOp(v, k = 0) { const t = this.peek(k); return t && t.t === 'op' && t.v === v; },
    isKw(v, k = 0) { const t = this.peek(k); return t && t.t === 'kw' && t.v === v; },
    expectOp(v, what) {
      const t = this.next();
      if (!t || t.t !== 'op' || t.v !== v) throw new RAError(`Expected "${v}"${what ? ' ' + what : ''} but found ${t ? '"' + (t.raw || t.v) + '"' : 'the end of the input'}.`);
    },
    program() {
      const stmts = [];
      this.skipSeps();
      while (this.peek()) {
        if (this.peek().t === 'id' && this.isOp('<-', 1)) {
          const name = this.next().v; this.next();
          this.skipNewlines();
          stmts.push({ assign: name, expr: this.expr() });
        } else {
          stmts.push({ expr: this.expr() });
        }
        const t = this.peek();
        if (t && t.t !== 'sep') throw new RAError(`Unexpected "${t.raw || t.v}". Did you forget an operator or a parenthesis?`);
        this.skipSeps();
      }
      if (!stmts.length) throw new RAError('Please type an expression first.');
      return stmts;
    },
    binopAhead() {
      // allow an operator on the next line: look past newlines
      let k = 0;
      while (this.peek(k) && this.peek(k).t === 'sep' && this.peek(k).v === '\n') k++;
      const t = this.peek(k);
      if (!t) return null;
      if (t.t === 'kw' && BINOPS[t.v]) return { k, op: BINOPS[t.v] };
      if (t.t === 'id' && /^x$/i.test(t.v)) return { k, op: 'times' };
      if (t.t === 'op' && t.v === '*') return { k, op: 'times' };
      return null;
    },
    expr() {
      let left = this.term();
      for (;;) {
        const b = this.binopAhead();
        if (!b) break;
        this.i += b.k; this.next();
        let op = b.op, cond = null;
        if (['join', 'left', 'right', 'full'].includes(op) && this.isOp('[')) {
          this.next(); cond = this.cond(); this.expectOp(']', 'to close the join condition');
        }
        if (op === 'join' && !cond) op = 'njoin';
        this.skipNewlines();
        const right = this.term();
        left = { op, cond, left, right };
      }
      return left;
    },
    term() {
      this.skipNewlines();
      const t = this.peek();
      if (!t) throw new RAError('The expression ends too early — something is missing at the end.');
      if (t.t === 'op' && t.v === '(') {
        this.next(); const e = this.expr(); this.skipNewlines(); this.expectOp(')', 'to close a parenthesis'); return this.maybeAlias(e);
      }
      if (t.t === 'kw' && !this.isOp('[', 1) && !['AND', 'OR', 'NOT', 'AS', 'IS', 'NULL'].includes(t.v) && !BINOPS[t.v]) {
        // a relation that happens to be called like a keyword, e.g. PROJECT
        this.next(); return this.maybeAlias({ op: 'rel', name: t.raw || t.v });
      }
      if (t.t === 'kw') {
        const k = t.v;
        if (k === 'SELECT' || k === 'SIGMA') { this.next(); this.expectOp('[', 'after SELECT'); const c = this.cond(); this.expectOp(']', 'after the selection condition'); return { op: 'select', cond: c, arg: this.parenArg('SELECT') }; }
        if (k === 'PROJECT' || k === 'PI') { this.next(); this.expectOp('[', 'after PROJECT'); const a = this.attrList(); this.expectOp(']', 'after the attribute list'); return { op: 'project', attrs: a, arg: this.parenArg('PROJECT') }; }
        if (k === 'RENAME' || k === 'RHO') { this.next(); this.expectOp('[', 'after RENAME'); const r = this.renameSpec(); this.expectOp(']', 'after the rename list'); return { op: 'rename', spec: r, arg: this.parenArg('RENAME') }; }
        if (k === 'GROUP' || k === 'GAMMA') { this.next(); this.expectOp('[', 'after GROUP'); const g = this.groupSpec(); this.expectOp(']', 'after the grouping list'); return { op: 'group', spec: g, arg: this.parenArg('GROUP') }; }
        throw new RAError(`"${t.raw || t.v}" cannot start an expression here. Put a relation name or a unary operator (SELECT, PROJECT, RENAME, GROUP) first.`);
      }
      if (t.t === 'id') { this.next(); return this.maybeAlias({ op: 'rel', name: t.v }); }
      throw new RAError(`Unexpected "${t.v}".`);
    },
    maybeAlias(e) {
      if (this.isKw('AS') && this.peek(1) && this.peek(1).t === 'id') { this.next(); const a = this.next().v; return { op: 'rename', spec: { rel: a }, arg: e }; }
      return e;
    },
    parenArg(opName) {
      this.skipNewlines();
      if (!this.isOp('(')) throw new RAError(`${opName}[...] must be followed by a relation in parentheses, e.g. ${opName}[...](EMPLOYEE).`);
      this.next(); const e = this.expr(); this.skipNewlines(); this.expectOp(')', `to close ${opName}(...)`); return this.maybeAlias(e);
    },
    attrList() {
      const out = [];
      do {
        if (this.isOp(',')) this.next();
        const t = this.next();
        if (!t || t.t !== 'id') throw new RAError('Expected an attribute name in the list.');
        out.push(t.v);
      } while (this.isOp(','));
      return out;
    },
    renameSpec() {
      const t = this.next();
      if (!t || t.t !== 'id') throw new RAError('RENAME expects a new name, e.g. RENAME[E](EMPLOYEE) or RENAME[old->new](R).');
      if (this.isOp('->')) {
        const pairs = []; let from = t.v;
        for (;;) {
          this.expectOp('->'); const to = this.next();
          if (!to || to.t !== 'id') throw new RAError('After -> write the new attribute name.');
          pairs.push([from, to.v]);
          if (!this.isOp(',')) break;
          this.next(); const f = this.next();
          if (!f || f.t !== 'id') throw new RAError('Expected old->new pairs in RENAME.');
          from = f.v;
        }
        return { pairs };
      }
      if (this.isOp('(')) { this.next(); const cols = this.attrList(); this.expectOp(')'); return { rel: t.v, cols }; }
      return { rel: t.v };
    },
    groupSpec() {
      const groupBy = [], aggs = [];
      if (!this.isOp(';') && !(this.peek() && this.peek().t === 'sep' && this.peek().v === ';')) {
        // group attributes until ';'
        while (this.peek() && this.peek().t === 'id' && !this.isAggStart()) {
          groupBy.push(this.next().v);
          if (this.isOp(',')) this.next();
        }
      }
      if (this.peek() && this.peek().t === 'sep' && this.peek().v === ';') this.next();
      while (this.peek() && !this.isOp(']')) {
        if (this.isOp(',')) { this.next(); continue; }
        const f = this.next();
        if (!f || f.t !== 'id' || !/^(count|sum|avg|min|max)$/i.test(f.v)) throw new RAError('In GROUP[...] write the grouping attributes, then ";" then aggregates like COUNT(*) AS n, SUM(hours) AS total.');
        this.expectOp('(', 'after ' + f.v);
        let arg = '*';
        if (this.isOp('*')) this.next(); else { const a = this.next(); if (!a || a.t !== 'id') throw new RAError('Aggregate needs an attribute, e.g. AVG(salary).'); arg = a.v; }
        this.expectOp(')');
        let alias = f.v.toLowerCase() + '_' + (arg === '*' ? 'all' : arg.split('.').pop());
        if (this.isKw('AS')) { this.next(); const a = this.next(); if (!a || a.t !== 'id') throw new RAError('AS must be followed by a name.'); alias = a.v; }
        aggs.push({ fn: f.v.toUpperCase(), arg, alias });
      }
      if (!aggs.length && !groupBy.length) throw new RAError('GROUP[...] is empty.');
      return { groupBy, aggs };
    },
    isAggStart() { const t = this.peek(); return t && t.t === 'id' && /^(count|sum|avg|min|max)$/i.test(t.v) && this.isOp('(', 1); },
    // ---- conditions ----
    cond() { let l = this.andC(); while (this.isKw('OR')) { this.next(); l = { c: 'or', l, r: this.andC() }; } return l; },
    andC() { let l = this.notC(); while (this.isKw('AND')) { this.next(); l = { c: 'and', l, r: this.notC() }; } return l; },
    notC() {
      if (this.isKw('NOT')) { this.next(); return { c: 'not', e: this.notC() }; }
      if (this.isOp('(')) { this.next(); const e = this.cond(); this.expectOp(')', 'in the condition'); return e; }
      const l = this.operand();
      if (this.isKw('IS')) {
        this.next(); let neg = false; if (this.isKw('NOT')) { this.next(); neg = true; }
        if (!this.isKw('NULL')) throw new RAError('Write IS NULL or IS NOT NULL.'); this.next();
        return { c: 'isnull', l, neg };
      }
      const t = this.next();
      if (!t || t.t !== 'op' || !['=', '<>', '!=', '<', '<=', '>', '>='].includes(t.v)) throw new RAError(`Expected a comparison (=, <>, <, <=, >, >=) in the condition${t ? ' but found "' + (t.raw || t.v) + '"' : ''}.`);
      const r = this.operand();
      return { c: 'cmp', op: t.v === '!=' ? '<>' : t.v, l, r };
    },
    operand() {
      const t = this.next();
      if (!t) throw new RAError('The condition is incomplete.');
      if (t.t === 'num') return { k: 'v', v: t.v };
      if (t.t === 'str') return { k: 'v', v: t.v };
      if (t.t === 'kw' && t.v === 'NULL') return { k: 'v', v: null };
      if (t.t === 'id') return { k: 'a', name: t.v };
      throw new RAError(`"${t.raw || t.v}" is not a valid value or attribute in a condition. Text values need quotes, e.g. city='Berlin'.`);
    }
  };

  // ---------------- RELATION HELPERS ----------------
  const lc = (s) => String(s).toLowerCase();
  function key(row) { return JSON.stringify(row.map(v => (typeof v === 'number' ? +v.toFixed(6) : v))); }
  function dedupe(rows) { const seen = new Set(), out = []; for (const r of rows) { const k = key(r); if (!seen.has(k)) { seen.add(k); out.push(r); } } return out; }
  function resolve(rel, ref, ctx) {
    const parts = ref.split('.');
    let idx;
    if (parts.length >= 2) {
      const q = lc(parts[0]), n = lc(parts.slice(1).join('.'));
      idx = rel.cols.map((c, i) => (lc(c.rel || '') === q && lc(c.name) === n) ? i : -1).filter(i => i >= 0);
      if (!idx.length) idx = rel.cols.map((c, i) => lc(c.name) === lc(ref) ? i : -1).filter(i => i >= 0);
    } else {
      idx = rel.cols.map((c, i) => lc(c.name) === lc(ref) ? i : -1).filter(i => i >= 0);
    }
    if (idx.length === 1) return idx[0];
    // equi-join leaves two copies with identical values: accept them silently
    if (idx.length > 1 && rel.rows && rel.rows.length && rel.rows.every(r => idx.every(i => r[i] === r[idx[0]]))) return idx[0];
    const avail = rel.cols.map(c => (c.rel ? c.rel + '.' : '') + c.name).join(', ');
    if (!idx.length) throw new RAError(`Attribute "${ref}" does not exist ${ctx || ''}. Available attributes: ${avail}.`);
    throw new RAError(`Attribute "${ref}" is ambiguous ${ctx || ''} — it exists more than once (${rel.cols.filter((c, i) => idx.includes(i)).map(c => (c.rel || '?') + '.' + c.name).join(', ')}). Qualify it, e.g. ${(rel.cols[idx[0]].rel || 'E')}.${rel.cols[idx[0]].name}, or RENAME first.`);
  }
  function cmp(a, b, op) {
    if (a === null || b === null || a === undefined || b === undefined) return false;
    let x = a, y = b;
    const na = typeof a === 'number' || (a !== '' && !isNaN(a)), nb = typeof b === 'number' || (b !== '' && !isNaN(b));
    if (na && nb) { x = +a; y = +b; } else { x = String(a); y = String(b); }
    switch (op) { case '=': return x === y; case '<>': return x !== y; case '<': return x < y; case '<=': return x <= y; case '>': return x > y; case '>=': return x >= y; }
    return false;
  }
  function compileCond(cond, rel, ctx) {
    const val = (o) => { if (o.k === 'v') return () => o.v; const i = resolve(rel, o.name, ctx); return (r) => r[i]; };
    switch (cond.c) {
      case 'and': { const a = compileCond(cond.l, rel, ctx), b = compileCond(cond.r, rel, ctx); return r => a(r) && b(r); }
      case 'or': { const a = compileCond(cond.l, rel, ctx), b = compileCond(cond.r, rel, ctx); return r => a(r) || b(r); }
      case 'not': { const a = compileCond(cond.e, rel, ctx); return r => !a(r); }
      case 'isnull': { const a = val(cond.l); return r => (a(r) === null) !== cond.neg; }
      case 'cmp': { const a = val(cond.l), b = val(cond.r); return r => cmp(a(r), b(r), cond.op); }
    }
  }
  function condToText(c) {
    if (!c) return '';
    const o = (x) => x.k === 'v' ? (typeof x.v === 'string' ? `'${x.v}'` : String(x.v)) : x.name;
    switch (c.c) {
      case 'and': return condToText(c.l) + ' AND ' + condToText(c.r);
      case 'or': return '(' + condToText(c.l) + ' OR ' + condToText(c.r) + ')';
      case 'not': return 'NOT (' + condToText(c.e) + ')';
      case 'isnull': return o(c.l) + (c.neg ? ' IS NOT NULL' : ' IS NULL');
      case 'cmp': return o(c.l) + ' ' + c.op + ' ' + o(c.r);
    }
  }

  // ---------------- EVALUATOR ----------------
  function evaluate(node, env, trace) {
    const res = evalNode(node, env, trace);
    return res;
  }
  function evalNode(n, env, trace) {
    let out;
    switch (n.op) {
      case 'rel': {
        const k = Object.keys(env).find(k => lc(k) === lc(n.name));
        if (!k) throw new RAError(`There is no relation called "${n.name}". Available: ${Object.keys(env).join(', ')}.`);
        const r = env[k];
        out = { cols: r.cols.map(c => ({ ...c })), rows: r.rows.map(x => x.slice()) };
        return out; // don't trace base relations
      }
      case 'select': {
        const a = evalNode(n.arg, env, trace);
        const f = compileCond(n.cond, a, 'in SELECT');
        out = { cols: a.cols, rows: a.rows.filter(f) };
        if (trace) trace.push({ label: `SELECT[${condToText(n.cond)}]`, rel: out });
        return out;
      }
      case 'project': {
        const a = evalNode(n.arg, env, trace);
        const idx = n.attrs.map(x => resolve(a, x, 'in PROJECT'));
        out = { cols: idx.map(i => a.cols[i]), rows: dedupe(a.rows.map(r => idx.map(i => r[i]))) };
        if (trace) trace.push({ label: `PROJECT[${n.attrs.join(', ')}]`, rel: out });
        return out;
      }
      case 'rename': {
        const a = evalNode(n.arg, env, trace);
        const s = n.spec;
        let cols = a.cols.map(c => ({ ...c }));
        if (s.pairs) {
          for (const [from, to] of s.pairs) { const i = resolve(a, from, 'in RENAME'); cols[i] = { ...cols[i], name: to }; }
        } else {
          cols = cols.map(c => ({ ...c, rel: s.rel }));
          if (s.cols) {
            if (s.cols.length !== cols.length) throw new RAError(`RENAME[${s.rel}(${s.cols.join(', ')})] gives ${s.cols.length} names, but the relation has ${cols.length} attributes.`);
            cols = cols.map((c, i) => ({ ...c, name: s.cols[i] }));
          }
        }
        out = { cols, rows: a.rows };
        if (trace && n.arg.op !== 'rel') trace.push({ label: 'RENAME', rel: out });
        return out;
      }
      case 'group': {
        const a = evalNode(n.arg, env, trace);
        const gi = n.spec.groupBy.map(x => resolve(a, x, 'in GROUP'));
        const groups = new Map();
        for (const r of a.rows) { const k = key(gi.map(i => r[i])); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
        if (!gi.length && !groups.size) groups.set('[]', []);
        const aggFns = n.spec.aggs.map(ag => {
          const ai = ag.arg === '*' ? -1 : resolve(a, ag.arg, 'in GROUP');
          return (rows) => {
            const vals = ai < 0 ? rows.map(() => 1) : rows.map(r => r[ai]).filter(v => v !== null);
            switch (ag.fn) {
              case 'COUNT': return vals.length;
              case 'SUM': return vals.length ? vals.reduce((s, v) => s + +v, 0) : null;
              case 'AVG': return vals.length ? vals.reduce((s, v) => s + +v, 0) / vals.length : null;
              case 'MIN': return vals.length ? vals.reduce((m, v) => cmp(v, m, '<') ? v : m) : null;
              case 'MAX': return vals.length ? vals.reduce((m, v) => cmp(v, m, '>') ? v : m) : null;
            }
          };
        });
        const rows = [];
        for (const g of groups.values()) rows.push([...gi.map(i => g.length ? g[0][i] : null), ...aggFns.map(f => f(g))]);
        out = { cols: [...gi.map(i => a.cols[i]), ...n.spec.aggs.map(ag => ({ name: ag.alias, rel: null }))], rows };
        if (trace) trace.push({ label: `GROUP[${n.spec.groupBy.join(', ')}; ${n.spec.aggs.map(x => `${x.fn}(${x.arg}) AS ${x.alias}`).join(', ')}]`, rel: out });
        return out;
      }
    }
    // binary
    const L = evalNode(n.left, env, trace), R = evalNode(n.right, env, trace);
    switch (n.op) {
      case 'union': case 'intersect': case 'minus': {
        if (L.cols.length !== R.cols.length) throw new RAError(`${n.op.toUpperCase()} needs union-compatible relations (same number of attributes with matching domains). Left side has ${L.cols.length} attributes (${L.cols.map(c => c.name).join(', ')}), right side has ${R.cols.length} (${R.cols.map(c => c.name).join(', ')}). Use PROJECT first.`);
        const rk = new Set(R.rows.map(key));
        let rows;
        if (n.op === 'union') rows = dedupe([...L.rows, ...R.rows]);
        else if (n.op === 'intersect') rows = dedupe(L.rows.filter(r => rk.has(key(r))));
        else rows = dedupe(L.rows.filter(r => !rk.has(key(r))));
        out = { cols: L.cols, rows };
        break;
      }
      case 'times': {
        const rows = []; for (const a of L.rows) for (const b of R.rows) rows.push([...a, ...b]);
        out = { cols: [...L.cols, ...R.cols], rows };
        break;
      }
      case 'join': {
        const P = { cols: [...L.cols, ...R.cols], rows: [] };
        const f = compileCond(n.cond, P, 'in the JOIN condition');
        for (const a of L.rows) for (const b of R.rows) { const r = [...a, ...b]; if (f(r)) P.rows.push(r); }
        out = P;
        break;
      }
      case 'njoin': case 'left': case 'right': case 'full': {
        out = outerOrNatural(n, L, R);
        break;
      }
      case 'divide': {
        const sIdx = R.cols.map(c => { const i = L.cols.findIndex(x => lc(x.name) === lc(c.name)); if (i < 0) throw new RAError(`DIVIDE: attribute "${c.name}" of the divisor is not in the dividend. In R DIVIDE S, all attributes of S must also be in R.`); return i; });
        const xIdx = L.cols.map((c, i) => i).filter(i => !sIdx.includes(i));
        if (!xIdx.length) throw new RAError('DIVIDE: the dividend must have extra attributes that are not in the divisor.');
        const have = new Set(L.rows.map(r => key([...xIdx.map(i => r[i]), ...sIdx.map(i => r[i])])));
        const xs = dedupe(L.rows.map(r => xIdx.map(i => r[i])));
        const rows = xs.filter(x => R.rows.every(s => have.has(key([...x, ...s]))));
        out = { cols: xIdx.map(i => L.cols[i]), rows };
        break;
      }
      default: throw new RAError('Unknown operator ' + n.op);
    }
    out.rows = dedupe(out.rows);
    if (trace) trace.push({ label: { union: 'UNION', intersect: 'INTERSECT', minus: 'MINUS', times: 'TIMES', join: `JOIN[${condToText(n.cond)}]`, njoin: 'NATURALJOIN', left: 'LEFTJOIN', right: 'RIGHTJOIN', full: 'FULLJOIN', divide: 'DIVIDE' }[n.op], rel: out });
    return out;
  }

  function outerOrNatural(n, L, R) {
    const kind = n.op; // njoin|left|right|full
    let pairsFn, common = [];
    let cols;
    if (n.cond) {
      const P = { cols: [...L.cols, ...R.cols], rows: [] };
      const f = compileCond(n.cond, P, 'in the JOIN condition');
      pairsFn = (a, b) => f([...a, ...b]);
      cols = P.cols;
    } else {
      for (let i = 0; i < L.cols.length; i++) { const j = R.cols.findIndex(c => lc(c.name) === lc(L.cols[i].name)); if (j >= 0) common.push([i, j]); }
      pairsFn = (a, b) => common.every(([i, j]) => a[i] !== null && b[j] !== null && cmp(a[i], b[j], '='));
      const rj = new Set(common.map(p => p[1]));
      cols = [...L.cols, ...R.cols.filter((c, j) => !rj.has(j))];
    }
    const rKeep = n.cond ? R.cols.map((c, j) => j) : R.cols.map((c, j) => j).filter(j => !common.some(p => p[1] === j));
    const rows = [], rMatched = new Set();
    for (const a of L.rows) {
      let m = false;
      R.rows.forEach((b, bi) => { if (pairsFn(a, b)) { m = true; rMatched.add(bi); rows.push([...a, ...rKeep.map(j => b[j])]); } });
      if (!m && (kind === 'left' || kind === 'full')) rows.push([...a, ...rKeep.map(() => null)]);
    }
    if (kind === 'right' || kind === 'full') {
      R.rows.forEach((b, bi) => {
        if (rMatched.has(bi)) return;
        const left = L.cols.map((c, i) => { const p = common.find(p => p[0] === i); return p ? b[p[1]] : null; });
        rows.push([...left, ...rKeep.map(j => b[j])]);
      });
    }
    return { cols, rows };
  }

  function baseEnv(db) {
    const env = {};
    for (const [name, t] of Object.entries(db)) env[name] = { cols: t.columns.map(c => ({ name: c, rel: name })), rows: t.rows };
    return env;
  }

  /** Run a full program. Returns { result, steps:[{label, rel}] } or throws RAError */
  function run(src, db) {
    const toks = tokenize(src);
    const stmts = new Parser(toks).program();
    const env = baseEnv(db || root.SAMPLE_DB);
    const steps = [];
    let last = null;
    for (const s of stmts) {
      const trace = [];
      const r = evaluate(s.expr, env, trace);
      if (s.assign) {
        env[s.assign] = { cols: r.cols.map(c => ({ ...c, rel: c.rel })), rows: r.rows };
        steps.push({ label: s.assign + ' ←', rel: r, assign: true });
      } else {
        trace.forEach(t => steps.push(t));
      }
      last = r;
    }
    return { result: last, steps };
  }

  /** Build a query tree (text) for a single expression — used to teach query trees */
  function tree(src) {
    const stmts = new Parser(tokenize(src)).program();
    const lines = [];
    function walk(n, prefix, isLast, isRoot) {
      let label;
      switch (n.op) {
        case 'rel': label = n.name; break;
        case 'select': label = `σ ${condToText(n.cond)}`; break;
        case 'project': label = `π ${n.attrs.join(', ')}`; break;
        case 'rename': label = `ρ ${n.spec.rel || n.spec.pairs.map(p => p.join('→')).join(', ')}`; break;
        case 'group': label = `γ ${n.spec.groupBy.join(', ')}; ${n.spec.aggs.map(a => a.fn + '(' + a.arg + ')').join(', ')}`; break;
        case 'join': label = `⋈ ${condToText(n.cond)}`; break;
        default: label = { union: '∪', intersect: '∩', minus: '−', times: '×', njoin: '⋈ (natural)', left: '⟕ left outer', right: '⟖ right outer', full: '⟗ full outer', divide: '÷' }[n.op];
      }
      lines.push((isRoot ? '' : prefix + (isLast ? '└─ ' : '├─ ')) + label);
      const kids = n.arg ? [n.arg] : (n.left ? [n.left, n.right] : []);
      const np = isRoot ? '' : prefix + (isLast ? '   ' : '│  ');
      kids.forEach((k, i) => walk(k, np, i === kids.length - 1, false));
    }
    stmts.forEach(s => { if (s.assign) lines.push(s.assign + ' ←'); walk(s.expr, '', true, true); lines.push(''); });
    return lines.join('\n').trim();
  }

  /** Compare a user result to the expected one.  opts: {bag:false (set semantics), ordered:false} */
  function compare(user, expected, opts = {}) {
    const fmt = (v) => (v === null || v === undefined) ? null : (typeof v === 'number' || (v !== '' && !isNaN(v)) ? +(+v).toFixed(4) : String(v).trim());
    const uc = user.cols.length, ec = expected.cols.length;
    if (uc !== ec) return { ok: false, reason: `Your result has ${uc} column${uc === 1 ? '' : 's'}, but the expected result has ${ec} (${expected.cols.map(c => c.name || c).join(', ')}). Check your projection / SELECT list.` };
    // try to map columns by name, else positional
    const un = user.cols.map(c => lc(c.name || c)), en = expected.cols.map(c => lc(c.name || c));
    let map = en.map((n, i) => i);
    const byName = en.map(n => un.indexOf(n));
    if (byName.every(i => i >= 0) && new Set(byName).size === byName.length) map = byName;
    const uRows = user.rows.map(r => map.map(i => fmt(r[i])));
    const eRows = expected.rows.map(r => r.map(fmt));
    const K = r => JSON.stringify(r);
    if (opts.ordered) {
      const same = uRows.length === eRows.length && uRows.every((r, i) => K(r) === K(eRows[i]));
      if (same) return { ok: true };
    }
    const count = (rows) => { const m = new Map(); rows.forEach(r => m.set(K(r), (m.get(K(r)) || 0) + 1)); return m; };
    const um = count(uRows), em = count(eRows);
    const missing = [], extra = [];
    for (const [k, n] of em) { const u = um.get(k) || 0; if (!opts.bag ? u === 0 : u < n) missing.push(JSON.parse(k)); }
    for (const [k, n] of um) { const e = em.get(k) || 0; if (!opts.bag ? e === 0 : e < n) extra.push(JSON.parse(k)); }
    if (!missing.length && !extra.length) {
      if (opts.ordered) return { ok: false, reason: 'The rows are right but the order is not. Check your ORDER BY.' };
      if (!opts.bag && uRows.length !== new Set(uRows.map(K)).size) return { ok: true, note: 'Your result contains duplicate rows. Relational algebra uses sets; in SQL add DISTINCT to remove duplicates.' };
      return { ok: true };
    }
    let reason = '';
    if (missing.length) reason += `${missing.length} expected row${missing.length > 1 ? 's are' : ' is'} missing. `;
    if (extra.length) reason += `${extra.length} row${extra.length > 1 ? 's' : ''} in your result should not be there. `;
    return { ok: false, reason: reason.trim(), missing, extra, mapped: map };
  }

  const API = { run, tree, compare, tokenize, RAError, baseEnv, dedupe };
  root.RA = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
