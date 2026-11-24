/* =====================================================================
   ERD (Chen notation): text format, SVG renderer with draggable nodes,
   and a checker that compares a student's ERD to a model answer.

   TEXT FORMAT (one line per entity / relationship):
     ENTITY MEMBER: *MemberID, Name(FirstName, LastName), [Phone], /Age
     WEAK COPY: ~CopyNumber, ShelfLocation, Condition
     REL BORROWS: MEMBER M, COPY N | LoanDate, DueDate, ReturnDate
     IDREL HAS_COPY: BOOK 1, COPY N total
   Attribute markers: *key   ~partial key   [multivalued]   /derived   Name(part, part) composite
   Relationship ends: ENTITY CARD [total]   (CARD is 1, N or M; "?" = participation not graded)
   ===================================================================== */
(function (root) {
  const U = root.U;
  const esc = U.esc;

  // ---------------- TEXT FORMAT ----------------
  function splitTop(s) {
    const out = []; let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(' || ch === '[') depth++;
      if (ch === ')' || ch === ']') depth--;
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map(x => x.trim()).filter(Boolean);
  }
  function parseAttr(tok) {
    let t = tok.trim(), kind = 'simple';
    if (t.startsWith('[') && t.endsWith(']')) { kind = 'multi'; t = t.slice(1, -1).trim(); }
    if (t.startsWith('*')) { kind = 'key'; t = t.slice(1).trim(); }
    else if (t.startsWith('~')) { kind = 'partial'; t = t.slice(1).trim(); }
    else if (t.startsWith('/')) { kind = 'derived'; t = t.slice(1).trim(); }
    if (t.startsWith('[') && t.endsWith(']')) { kind = 'multi'; t = t.slice(1, -1).trim(); }
    let parts = [];
    const m = t.match(/^([^()]+)\((.*)\)$/);
    if (m) { t = m[1].trim(); parts = m[2].split(',').map(x => x.trim()).filter(Boolean); }
    if (!t) throw new Error(`Empty attribute name in "${tok}".`);
    return { name: t, kind, parts };
  }
  function parse(text) {
    const model = { entities: [], rels: [] };
    const lines = String(text || '').split('\n').map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
    for (const line of lines) {
      const m = line.match(/^(ENTITY|E|WEAK|W|REL|R|IDREL|IR|RELATIONSHIP)\s+([A-Za-z_][\w]*)\s*:?\s*(.*)$/i);
      if (!m) throw new Error(`I can't read the line "${line}". Start it with ENTITY, WEAK, REL or IDREL.`);
      const kw = m[1].toUpperCase(), name = m[2], rest = m[3] || '';
      if (['ENTITY', 'E', 'WEAK', 'W'].includes(kw)) {
        model.entities.push({ name, weak: kw[0] === 'W', attrs: splitTop(rest).map(parseAttr) });
      } else {
        const [endsTxt, attrTxt] = rest.split('|');
        const ends = splitTop(endsTxt || '').map(e => {
          const p = e.split(/\s+/).filter(Boolean);
          if (p.length < 2) throw new Error(`Relationship ${name}: write each end as "ENTITY 1" or "ENTITY N total".`);
          const card = p[1].toUpperCase();
          if (!['1', 'N', 'M'].includes(card)) throw new Error(`Relationship ${name}: cardinality must be 1, N or M (found "${p[1]}").`);
          const flag = (p[2] || '').toLowerCase();
          return { e: p[0], card, total: flag === 'total' ? true : (flag === '?' ? null : false) };
        });
        if (ends.length < 2) throw new Error(`Relationship ${name} needs at least two ends.`);
        model.rels.push({ name, identifying: kw === 'IDREL' || kw === 'IR', ends, attrs: splitTop(attrTxt || '').map(parseAttr) });
      }
    }
    for (const r of model.rels) for (const e of r.ends) {
      if (!model.entities.some(x => x.name.toLowerCase() === e.e.toLowerCase())) throw new Error(`Relationship ${r.name} uses entity "${e.e}", which is not defined.`);
    }
    return model;
  }
  function attrText(a) {
    let s = a.name + (a.parts && a.parts.length ? '(' + a.parts.join(', ') + ')' : '');
    if (a.kind === 'key') s = '*' + s; else if (a.kind === 'partial') s = '~' + s; else if (a.kind === 'derived') s = '/' + s; else if (a.kind === 'multi') s = '[' + s + ']';
    return s;
  }
  function toText(model) {
    const lines = [];
    model.entities.forEach(e => lines.push(`${e.weak ? 'WEAK' : 'ENTITY'} ${e.name}: ${e.attrs.map(attrText).join(', ')}`));
    model.rels.forEach(r => lines.push(`${r.identifying ? 'IDREL' : 'REL'} ${r.name}: ${r.ends.map(e => `${e.e} ${e.card}${e.total ? ' total' : ''}`).join(', ')}${r.attrs.length ? ' | ' + r.attrs.map(attrText).join(', ') : ''}`));
    return lines.join('\n');
  }

  // ---------------- GRAPH + LAYOUT ----------------
  const textW = (t, size = 13) => Math.max(30, String(t).length * size * 0.6);
  function graph(model) {
    const nodes = [], edges = [];
    const add = (n) => { nodes.push(n); return n; };
    model.entities.forEach(e => {
      const ek = 'E:' + e.name;
      add({ key: ek, type: 'entity', label: e.name, weak: e.weak, w: Math.max(100, textW(e.name) + 24), h: 44 });
      addAttrs(e.attrs, ek);
    });
    model.rels.forEach((r, i) => {
      const rk = 'R:' + r.name + '#' + i;
      add({ key: rk, type: 'rel', label: r.name, ident: r.identifying, w: Math.max(110, textW(r.name) + 40), h: 64 });
      r.ends.forEach((en, j) => {
        const ent = model.entities.find(x => x.name.toLowerCase() === en.e.toLowerCase());
        if (ent) edges.push({ a: 'E:' + ent.name, b: rk, kind: 'rel', total: !!en.total, card: en.card, idx: j, len: 170 });
      });
      addAttrs(r.attrs, rk);
    });
    function addAttrs(attrs, owner) {
      attrs.forEach(a => {
        const ak = owner + '/' + a.name;
        add({ key: ak, type: 'attr', label: a.name, kind: a.kind, w: textW(a.name, 12) + 26, h: 30, owner });
        edges.push({ a: owner, b: ak, kind: 'attr', len: 95 });
        (a.parts || []).forEach(p => {
          const pk = ak + '/' + p;
          add({ key: pk, type: 'attr', label: p, kind: 'simple', w: textW(p, 12) + 26, h: 30, owner: ak });
          edges.push({ a: ak, b: pk, kind: 'attr', len: 75 });
        });
      });
    }
    return { nodes, edges };
  }

  function layout(model, saved) {
    const g = graph(model);
    const pos = {};
    const ents = g.nodes.filter(n => n.type === 'entity');
    const cols = Math.max(1, Math.ceil(Math.sqrt(ents.length * 1.6)));
    ents.forEach((n, i) => { pos[n.key] = { x: 160 + (i % cols) * 380, y: 140 + Math.floor(i / cols) * 300 }; });
    g.nodes.filter(n => n.type === 'rel').forEach((n, i) => {
      const ends = g.edges.filter(e => e.b === n.key && e.kind === 'rel').map(e => pos[e.a]).filter(Boolean);
      if (ends.length) {
        const x = ends.reduce((s, p) => s + p.x, 0) / ends.length, y = ends.reduce((s, p) => s + p.y, 0) / ends.length;
        pos[n.key] = { x: x + (ends.length === 1 || (ends[0].x === ends[1].x && ends[0].y === ends[1].y) ? 150 : 0) + (i % 2) * 20, y: y + 30 * ((i % 3) - 1) + 20 };
      } else pos[n.key] = { x: 100 + i * 50, y: 400 };
    });
    // attributes around owner
    const byOwner = {};
    g.nodes.filter(n => n.type === 'attr').forEach(n => (byOwner[n.owner] = byOwner[n.owner] || []).push(n));
    const place = (ownerKey, depth) => {
      const list = byOwner[ownerKey] || [];
      const o = pos[ownerKey]; if (!o) return;
      list.forEach((n, i) => {
        const ang = -Math.PI / 2 + (i - (list.length - 1) / 2) * (depth ? 0.7 : 0.62) + (depth ? 0 : 0);
        const r = depth ? 70 : 100;
        pos[n.key] = { x: o.x + Math.cos(ang) * r * 1.4, y: o.y + Math.sin(ang) * r };
        place(n.key, depth + 1);
      });
    };
    Object.keys(byOwner).filter(k => !k.includes('/')).forEach(k => place(k, 0));
    // force-directed refinement
    const N = g.nodes, idx = {}; N.forEach((n, i) => idx[n.key] = i);
    const fixed = (k) => saved && saved[k];
    N.forEach(n => { if (fixed(n.key)) pos[n.key] = { ...saved[n.key] }; });
    for (let it = 0; it < 260; it++) {
      const disp = N.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const a = pos[N[i].key], b = pos[N[j].key];
        let dx = a.x - b.x, dy = a.y - b.y;
        if (dx === 0 && dy === 0) { dx = (i - j) * 0.1; dy = 0.1; }
        const minD = (N[i].w + N[j].w) / 2 + 18, minH = (N[i].h + N[j].h) / 2 + 14;
        const d = Math.sqrt(dx * dx + dy * dy);
        let f = 4200 / (d * d);
        if (Math.abs(dx) < minD && Math.abs(dy) < minH) f += 3;
        disp[i].x += dx / d * f; disp[i].y += dy / d * f; disp[j].x -= dx / d * f; disp[j].y -= dy / d * f;
      }
      for (const e of g.edges) {
        const i = idx[e.a], j = idx[e.b]; const a = pos[e.a], b = pos[e.b];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - e.len) * 0.06;
        disp[i].x += dx / d * f; disp[i].y += dy / d * f; disp[j].x -= dx / d * f; disp[j].y -= dy / d * f;
      }
      const temp = 18 * (1 - it / 260) + 1;
      N.forEach((n, i) => {
        if (fixed(n.key)) return;
        const d = Math.sqrt(disp[i].x ** 2 + disp[i].y ** 2) || 1;
        const s = Math.min(d, temp) / d;
        pos[n.key].x += disp[i].x * s; pos[n.key].y += disp[i].y * s;
      });
    }
    return { g, pos };
  }

  // ---------------- SVG RENDER ----------------
  function render(model, opts = {}) {
    const saved = opts.layout || {};
    const { g, pos } = layout(model, saved);
    Object.assign(saved, Object.fromEntries(Object.entries(pos).filter(([k]) => !saved[k])));
    const hl = opts.highlight || new Set();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    g.nodes.forEach(n => { const p = pos[n.key]; minX = Math.min(minX, p.x - n.w / 2); minY = Math.min(minY, p.y - n.h / 2); maxX = Math.max(maxX, p.x + n.w / 2); maxY = Math.max(maxY, p.y + n.h / 2); });
    if (!g.nodes.length) { minX = 0; minY = 0; maxX = 400; maxY = 160; }
    const pad = 30;
    const vb = opts.viewBox || [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad];
    let s = `<svg class="erd-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => v.toFixed(1)).join(' ')}" data-vb="${vb.join(',')}" role="img" aria-label="ER diagram">`;
    if (!g.nodes.length) s += `<text x="200" y="80" text-anchor="middle" class="erd-empty">Your diagram will appear here.</text>`;
    // edges
    for (const e of g.edges) {
      const a = pos[e.a], b = pos[e.b];
      const bad = hl.has(e.a + '>' + e.b) ? ' bad' : '';
      if (e.kind === 'rel' && e.total) {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ox = -dy / d * 3, oy = dx / d * 3;
        s += `<line class="erd-line${bad}" x1="${a.x + ox}" y1="${a.y + oy}" x2="${b.x + ox}" y2="${b.y + oy}"/><line class="erd-line${bad}" x1="${a.x - ox}" y1="${a.y - oy}" x2="${b.x - ox}" y2="${b.y - oy}"/>`;
      } else s += `<line class="erd-line${bad}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }
    // nodes
    for (const n of g.nodes) {
      const p = pos[n.key], bad = hl.has(n.key) ? ' bad' : '';
      s += `<g class="erd-node ${n.type}${bad}" data-key="${esc(n.key)}" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})">`;
      const w = n.w, h = n.h;
      if (n.type === 'entity') {
        s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" class="shape"/>`;
        if (n.weak) s += `<rect x="${-w / 2 + 4}" y="${-h / 2 + 4}" width="${w - 8}" height="${h - 8}" class="shape inner"/>`;
        s += `<text class="lbl ent" text-anchor="middle" dy="5">${esc(n.label)}</text>`;
      } else if (n.type === 'rel') {
        s += `<polygon points="0,${-h / 2} ${w / 2},0 0,${h / 2} ${-w / 2},0" class="shape"/>`;
        if (n.ident) s += `<polygon points="0,${-h / 2 + 7} ${w / 2 - 12},0 0,${h / 2 - 7} ${-w / 2 + 12},0" class="shape inner"/>`;
        s += `<text class="lbl rel" text-anchor="middle" dy="4">${esc(n.label)}</text>`;
      } else {
        const dash = n.kind === 'derived' ? ' dashed' : '';
        s += `<ellipse rx="${w / 2}" ry="${h / 2}" class="shape${dash}"/>`;
        if (n.kind === 'multi') s += `<ellipse rx="${w / 2 - 4}" ry="${h / 2 - 4}" class="shape inner"/>`;
        s += `<text class="lbl attr" text-anchor="middle" dy="4">${esc(n.label)}</text>`;
        if (n.kind === 'key' || n.kind === 'partial') {
          const tw = textW(n.label, 12) - 6;
          s += `<line class="uline${n.kind === 'partial' ? ' dashed' : ''}" x1="${-tw / 2}" y1="8" x2="${tw / 2}" y2="8"/>`;
        }
      }
      s += '</g>';
    }
    // cardinality labels (on top)
    for (const e of g.edges.filter(e => e.kind === 'rel')) {
      const a = pos[e.a], b = pos[e.b];
      const t = 0.42, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      const bad = hl.has(e.a + '>' + e.b) ? ' bad' : '';
      s += `<text class="card${bad}" x="${(x - dy / d * 12).toFixed(1)}" y="${(y + dx / d * 12 + 4).toFixed(1)}" text-anchor="middle">${esc(e.card)}</text>`;
    }
    s += '</svg>';
    return { svg: s, pos, vb };
  }

  /** Mount an interactive (draggable) diagram into a container element. */
  function mount(el, model, opts = {}) {
    const state = { model, layout: opts.layout || {}, highlight: opts.highlight || new Set(), vb: null };
    const draw = () => { const r = render(state.model, { layout: state.layout, highlight: state.highlight, viewBox: state.vb }); el.innerHTML = r.svg; };
    draw();
    let drag = null;
    const toSvg = (evt) => { const svg = el.querySelector('svg'); const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    el.onpointerdown = (evt) => {
      const g = evt.target.closest('[data-key]'); if (!g) return;
      evt.preventDefault();
      const key = g.getAttribute('data-key'); const p = toSvg(evt); const cur = state.layout[key];
      state.vb = el.querySelector('svg').getAttribute('data-vb').split(',').map(Number);
      drag = { key, dx: p.x - cur.x, dy: p.y - cur.y };
    };
    const move = (evt) => {
      if (!drag) return;
      const p = toSvg(evt);
      state.layout[drag.key] = { x: p.x - drag.dx, y: p.y - drag.dy };
      draw();
    };
    const up = () => { if (drag) { drag = null; state.vb = null; draw(); opts.onLayout && opts.onLayout(state.layout); } };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return {
      update(m, h) { state.model = m; if (h) state.highlight = h; draw(); },
      setHighlight(h) { state.highlight = h; draw(); },
      relayout() { for (const k in state.layout) delete state.layout[k]; draw(); opts.onLayout && opts.onLayout(state.layout); },
      destroy() { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); },
      state
    };
  }

  /** Little SVG of a single Chen symbol (for flashcards / lessons) */
  function symbol(kind) {
    const W = 220, H = 90; let s = `<svg class="erd-svg sym" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    const cx = 110, cy = 45;
    const ell = (extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="60" ry="22" class="shape${extra}"/>`;
    switch (kind) {
      case 'entity': s += `<rect x="50" y="25" width="120" height="40" class="shape"/><text x="${cx}" y="50" text-anchor="middle" class="lbl ent">STUDENT</text>`; break;
      case 'weak': s += `<rect x="50" y="25" width="120" height="40" class="shape"/><rect x="54" y="29" width="112" height="32" class="shape inner"/><text x="${cx}" y="50" text-anchor="middle" class="lbl ent">DEPENDENT</text>`; break;
      case 'rel': s += `<polygon points="110,13 175,45 110,77 45,45" class="shape"/><text x="${cx}" y="49" text-anchor="middle" class="lbl rel">ENROLLS</text>`; break;
      case 'idrel': s += `<polygon points="110,13 175,45 110,77 45,45" class="shape"/><polygon points="110,20 162,45 110,70 58,45" class="shape inner"/><text x="${cx}" y="49" text-anchor="middle" class="lbl rel">HAS</text>`; break;
      case 'attr': s += ell() + `<text x="${cx}" y="49" text-anchor="middle" class="lbl attr">BirthDate</text>`; break;
      case 'key': s += ell() + `<text x="${cx}" y="49" text-anchor="middle" class="lbl attr">StudentID</text><line class="uline" x1="80" y1="53" x2="140" y2="53"/>`; break;
      case 'partial': s += ell() + `<text x="${cx}" y="49" text-anchor="middle" class="lbl attr">DepName</text><line class="uline dashed" x1="85" y1="53" x2="135" y2="53"/>`; break;
      case 'multi': s += ell() + `<ellipse cx="${cx}" cy="${cy}" rx="55" ry="17" class="shape inner"/><text x="${cx}" y="49" text-anchor="middle" class="lbl attr">Phone</text>`; break;
      case 'derived': s += ell(' dashed') + `<text x="${cx}" y="49" text-anchor="middle" class="lbl attr">Age</text>`; break;
      case 'composite': s = `<svg class="erd-svg sym" viewBox="0 0 ${W} 120" xmlns="http://www.w3.org/2000/svg"><line class="erd-line" x1="110" y1="35" x2="55" y2="92"/><line class="erd-line" x1="110" y1="35" x2="165" y2="92"/><ellipse cx="110" cy="35" rx="45" ry="18" class="shape"/><text x="110" y="39" text-anchor="middle" class="lbl attr">Name</text><ellipse cx="55" cy="92" rx="50" ry="18" class="shape"/><text x="55" y="96" text-anchor="middle" class="lbl attr">FirstName</text><ellipse cx="165" cy="92" rx="50" ry="18" class="shape"/><text x="165" y="96" text-anchor="middle" class="lbl attr">LastName</text>`; break;
      case 'total': s += `<line class="erd-line" x1="20" y1="42" x2="200" y2="42"/><line class="erd-line" x1="20" y1="48" x2="200" y2="48"/>`; break;
      case 'partialp': s += `<line class="erd-line" x1="20" y1="45" x2="200" y2="45"/>`; break;
    }
    return s + '</svg>';
  }

  // ---------------- CHECKER ----------------
  /**
   * Compare user ERD to model ERD.
   * Returns { score (0..1), passed, total, items:[{ok,msg,cat}], highlight:Set }
   */
  function check(user, model, aliases = {}) {
    const items = [], highlight = new Set();
    const ok = (msg) => items.push({ ok: true, msg });
    const bad = (msg, cat, key) => { items.push({ ok: false, msg, cat }); if (key) highlight.add(key); };
    const kindName = { simple: 'a simple attribute (plain oval)', key: 'a key attribute (underlined)', partial: 'a partial key (dashed underline)', multi: 'multivalued (double oval)', derived: 'derived (dashed oval)' };
    const catForKind = { key: 'missing-key', partial: 'weak-entity-key', multi: 'multivalued-notation', derived: 'derived-notation', simple: 'attribute-type' };

    const em = U.matchNames(model.entities.map(e => e.name), user.entities.map(e => e.name), aliases, { contains: true });
    const entMap = {}; // model entity name -> user entity
    model.entities.forEach((me, i) => {
      if (!em.has(i)) {
        bad(`Missing entity ${me.name}${me.weak ? ' (it is a WEAK entity)' : ''}.`, me.weak ? 'weak-entity-notation' : 'er-missing-entity');
        me.attrs.forEach(a => items.push({ ok: false, msg: `  ↳ ${a.name} (of ${me.name}) is missing too.`, cat: null }));
        return;
      }
      const ue = user.entities[em.get(i)]; entMap[me.name] = ue;
      const ek = 'E:' + ue.name;
      ok(`Entity ${me.name} found${U.canon(ue.name) !== U.canon(me.name) ? ` (you called it ${ue.name})` : ''}.`);
      if (!!me.weak !== !!ue.weak) bad(me.weak ? `${me.name} should be a WEAK entity (double rectangle): it cannot be identified by its own attributes alone.` : `${me.name} is a strong entity — it has its own key, so use a single rectangle.`, 'weak-entity-notation', ek);
      else ok(`${me.name} is correctly ${me.weak ? 'weak' : 'strong'}.`);
      checkAttrs(me.attrs, ue.attrs, ek, me.name, user);
    });

    function checkAttrs(mAttrs, uAttrs, ownerKey, ownerName, userModel) {
      const am = U.matchNames(mAttrs.map(a => a.name), uAttrs.map(a => a.name), aliases);
      mAttrs.forEach((ma, i) => {
        if (!am.has(i)) {
          // composite attribute drawn as separate attributes?
          if (ma.parts && ma.parts.length && uAttrs.some(ua => ma.parts.some(p => U.nameScore(ua.name, p, aliases) >= 0))) { bad(`${ownerName}: ${ma.name} should be ONE composite attribute (oval) with sub-ovals ${ma.parts.join(', ')} — not separate attributes.`, 'composite', ownerKey); return; }
          // maybe attached to the wrong owner?
          const elsewhere = findAttrAnywhere(userModel, ma.name, ownerKey);
          if (elsewhere) bad(`${ma.name} belongs to ${ownerName}, but you attached it to ${elsewhere.owner}.`, ownerKey.startsWith('R:') ? 'rel-attr-misplaced' : 'attribute-misplaced', elsewhere.key);
          else bad(`${ownerName} is missing the attribute ${ma.name}${ma.kind !== 'simple' ? ' — ' + kindName[ma.kind] : ''}.`, ma.kind === 'simple' ? 'missing-attribute' : catForKind[ma.kind], ownerKey);
          return;
        }
        const ua = uAttrs[am.get(i)];
        const ak = ownerKey + '/' + ua.name;
        if (ma.kind !== ua.kind) bad(`${ownerName}.${ma.name} should be ${kindName[ma.kind]}, but you made it ${kindName[ua.kind]}.`, catForKind[ma.kind] === 'attribute-type' ? catForKind[ua.kind] || 'attribute-type' : catForKind[ma.kind], ak);
        else ok(`${ownerName}.${ma.name} ✓ (${ma.kind === 'simple' ? 'simple' : kindName[ma.kind]})`);
        if (ma.parts && ma.parts.length) {
          const pm = U.matchNames(ma.parts, ua.parts || [], aliases);
          if (pm.size === ma.parts.length) ok(`${ma.name} is composite with parts ${ma.parts.join(', ')} ✓`);
          else bad(`${ownerName}.${ma.name} is a COMPOSITE attribute: give it the parts ${ma.parts.join(', ')}.`, 'composite', ak);
        }
      });
      uAttrs.forEach((ua, j) => {
        if ([...am.values()].includes(j)) return;
        if (mAttrs.some(ma => (ma.parts || []).some(p => U.nameScore(ua.name, p, aliases) >= 0))) return; // already reported as a composite problem
        if (model.entities.some(e => e.attrs.some(a => U.nameScore(ua.name, a.name, aliases) >= 0)) || model.rels.some(r => r.attrs.some(a => U.nameScore(ua.name, a.name, aliases) >= 0))) return; // reported as misplaced
        items.push({ ok: null, msg: `Note: ${ownerName}.${ua.name} is not in the model answer. Is it really needed?` });
      });
    }
    function findAttrAnywhere(userModel, name, notOwner) {
      // the same attribute name legitimately exists on that other owner in the model? then it is not misplaced
      const modelHas = (ownerName, isRel) => {
        const list = isRel ? model.rels : model.entities;
        const mo = list.find(o => U.nameScore(ownerName, o.name, aliases, { contains: !isRel }) >= 0);
        return mo && mo.attrs.some(a => U.nameScore(name, a.name, aliases) >= 0 || (a.parts || []).some(p => U.nameScore(name, p, aliases) >= 0));
      };
      for (const e of userModel.entities) { const a = e.attrs.find(a => U.nameScore(a.name, name, aliases) >= 0); if (a && 'E:' + e.name !== notOwner && !modelHas(e.name, false)) return { owner: e.name, key: 'E:' + e.name + '/' + a.name }; }
      for (const [i, r] of userModel.rels.entries()) { const a = r.attrs.find(a => U.nameScore(a.name, name, aliases) >= 0); if (a && ('R:' + r.name + '#' + i) !== notOwner && !modelHas(r.name, true)) return { owner: 'relationship ' + r.name, key: 'R:' + r.name + '#' + i + '/' + a.name }; }
      return null;
    }

    // relationships: match by the pair of entities, then by name
    const usedRel = new Set();
    model.rels.forEach(mr => {
      const ues = mr.ends.map(e => entMap[e.e]);
      if (ues.some(x => !x)) { bad(`Relationship ${mr.name} (${mr.ends.map(e => e.e).join(' – ')}) cannot be checked because an entity is missing.`, 'er-missing-relationship'); return; }
      const sameSet = (r) => {
        const names = r.ends.map(e => e.e.toLowerCase()).sort().join('|');
        return names === ues.map(u => u.name.toLowerCase()).sort().join('|');
      };
      let cands = user.rels.map((r, i) => ({ r, i })).filter(x => !usedRel.has(x.i) && sameSet(x.r));
      if (cands.length > 1) {
        const byName = cands.filter(x => U.nameScore(x.r.name, mr.name, aliases) >= 0);
        if (byName.length) cands = byName;
        else {
          const byCard = cands.filter(x => cardsMatch(x.r));
          if (byCard.length) cands = byCard;
        }
      }
      function orient(r) { // map model ends -> user ends
        const used = new Set();
        return mr.ends.map((me, k) => { const j = r.ends.findIndex((ue, jj) => !used.has(jj) && ue.e.toLowerCase() === ues[k].name.toLowerCase()); used.add(j); return r.ends[j]; });
      }
      function cardsMatch(r) { const o = orient(r); return mr.ends.every((me, k) => o[k] && many(o[k].card) === many(me.card)); }
      if (!cands.length) { bad(`Missing relationship ${mr.name} between ${mr.ends.map(e => e.e).join(' and ')}.`, mr.identifying ? 'weak-entity-notation' : 'er-missing-relationship'); return; }
      const { r: ur, i: ui } = cands[0]; usedRel.add(ui);
      const rk = 'R:' + ur.name + '#' + ui;
      ok(`Relationship ${mr.name} between ${mr.ends.map(e => e.e).join(' and ')} found${U.canon(ur.name) !== U.canon(mr.name) ? ` (you called it ${ur.name})` : ''}.`);
      const o = orient(ur);
      const cardStr = (arr) => arr.map(x => x.card).join(':');
      const cardOk = mr.ends.every((me, k) => many(o[k].card) === many(me.card));
      if (cardOk) ok(`${mr.name} cardinality ${cardStr(mr.ends)} ✓`);
      else bad(`${mr.name}: cardinality should be ${mr.ends.map(e => e.e + ' ' + e.card).join(', ')} (you have ${o.map((x, k) => ues[k].name + ' ' + x.card).join(', ')}). Ask: "one ${mr.ends[0].e} relates to how many ${mr.ends[1].e}?" and the reverse.`, 'cardinality', rk);
      mr.ends.forEach((me, k) => {
        if (me.total === null || me.total === undefined) return;
        const edgeKey = 'E:' + ues[k].name + '>' + rk;
        if (!!o[k].total === !!me.total) ok(`${mr.name}: participation of ${me.e} is ${me.total ? 'total (double line)' : 'partial (single line)'} ✓`);
        else bad(me.total ? `${mr.name}: every ${me.e} MUST take part, so draw a double line (total participation) from ${me.e}.` : `${mr.name}: not every ${me.e} has to take part — use a single line (partial participation).`, 'participation', edgeKey);
      });
      if (!!mr.identifying !== !!ur.identifying) bad(mr.identifying ? `${mr.name} identifies a weak entity: draw it as a double diamond (identifying relationship).` : `${mr.name} is a normal relationship — single diamond.`, 'weak-entity-notation', rk);
      else if (mr.identifying) ok(`${mr.name} is an identifying relationship (double diamond) ✓`);
      checkAttrs(mr.attrs, ur.attrs, rk, 'relationship ' + mr.name, user);
    });
    user.rels.forEach((r, i) => { if (!usedRel.has(i)) items.push({ ok: null, msg: `Note: relationship ${r.name} is not in the model answer.` }); });
    const graded = items.filter(x => x.ok !== null);
    const passed = graded.filter(x => x.ok).length;
    return { score: graded.length ? passed / graded.length : 0, passed, total: graded.length, items, highlight, categories: [...new Set(items.filter(x => x.ok === false && x.cat).map(x => x.cat))] };
  }
  const many = (c) => (c === '1' ? '1' : 'N');

  const API = { parse, toText, render, mount, check, symbol, layout, parseAttr };
  root.ERD = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
