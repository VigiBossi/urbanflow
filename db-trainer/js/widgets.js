/* =====================================================================
   WIDGETS — exercise inputs & checking, ERD builder, quiz, result tables,
   sql.js loader. Used by js/app.js.
   ===================================================================== */
(function (root) {
  'use strict';
  const C = root.CONTENT, U = root.U, esc = U.esc, LS = root.LS, Store = root.Store;
  const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';

  // ---------------- tiny DOM helpers ----------------
  function h(html) { const t = document.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; }
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  function toast(msg, ms = 2600) {
    const t = h(`<div class="toast" role="status">${esc(msg)}</div>`); document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }
  /** replace {{sym:weak}} placeholders with Chen symbol SVGs */
  const fill = (html) => String(html || '').replace(/\{\{sym:(\w+)\}\}/g, (_, k) => `<span class="symbol-inline">${root.ERD.symbol(k)}</span>`);
  const normText = (s) => String(s || '').toLowerCase().replace(/→/g, '->').replace(/\s+/g, '').replace(/[“”"'`.]/g, '');
  const aliasesFor = (ex) => Object.assign({}, C.aliases, ex.aliases || {});
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const draftGet = (k, d) => (k ? LS.get('dbt.draft.' + k, d) : d);
  const draftSet = (k, v) => { if (k) LS.set('dbt.draft.' + k, v); };

  // ---------------- SQL (sql.js loaded on demand) ----------------
  let sqlPromise = null;
  function loadSql() {
    if (!sqlPromise) {
      sqlPromise = new Promise((resolve, reject) => {
        const go = () => root.initSqlJs({ locateFile: f => SQLJS_CDN + f }).then(resolve, reject);
        if (root.initSqlJs) return go();
        const s = document.createElement('script');
        s.src = SQLJS_CDN + 'sql-wasm.js';
        s.onload = go;
        s.onerror = () => { sqlPromise = null; reject(new Error('Could not load the SQL engine (sql.js) — are you online?')); };
        document.head.appendChild(s);
      });
    }
    return sqlPromise;
  }
  async function runSql(sql) {
    const SQL = await loadSql();
    const db = new SQL.Database();
    try {
      db.run(root.sampleDbSql());
      const res = db.exec(sql);
      const last = res[res.length - 1];
      if (!last) return { cols: [], rows: [] };
      return { cols: last.columns.map(c => ({ name: c })), rows: last.values };
    } finally { db.close(); }
  }

  // ---------------- result tables ----------------
  const fmtVal = (v) => (v === null || v === undefined) ? null : (typeof v === 'number' || (v !== '' && !isNaN(v)) ? +(+v).toFixed(4) : String(v).trim());
  function colLabels(rel) {
    const names = rel.cols.map(c => c.name);
    return rel.cols.map(c => (c.rel && names.filter(n => String(n).toLowerCase() === String(c.name).toLowerCase()).length > 1) ? c.rel + '.' + c.name : c.name);
  }
  function tableHtml(rel, opts = {}) {
    if (!rel) return '';
    const labels = colLabels(rel);
    const max = opts.max || 100;
    const markSet = opts.markSet, markClass = opts.markClass, map = opts.map;
    const rows = rel.rows.slice(0, max).map(r => {
      let cls = '';
      if (markSet) { const k = JSON.stringify((map || r.map((_, i) => i)).map(i => fmtVal(r[i]))); if (markSet.has(k)) cls = markClass; }
      return `<tr class="${cls}">${r.map(v => v === null || v === undefined ? '<td class="null">NULL</td>' : `<td>${esc(typeof v === 'number' ? +v.toFixed(4) : v)}</td>`).join('')}</tr>`;
    }).join('');
    const more = rel.rows.length > max ? `<p class="small muted">… ${rel.rows.length - max} more rows</p>` : '';
    return `<div class="table-wrap"><table class="rt"><thead><tr>${labels.map(l => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${Math.max(1, labels.length)}" class="null">(no rows)</td></tr>`}</tbody></table></div><p class="small muted">${rel.rows.length} row${rel.rows.length === 1 ? '' : 's'}</p>${more}`;
  }
  function compareHtml(user, expected, cmp) {
    let uOpts = {}, eOpts = {};
    if (cmp && !cmp.ok && cmp.extra) {
      uOpts = { markSet: new Set(cmp.extra.map(r => JSON.stringify(r))), markClass: 'extra', map: cmp.mapped };
      eOpts = { markSet: new Set(cmp.missing.map(r => JSON.stringify(r))), markClass: 'missing' };
    }
    return `<div class="results"><div><h3>Your result</h3>${tableHtml(user, uOpts)}</div><div><h3>Expected result</h3>${tableHtml(expected, eOpts)}</div></div>` +
      (cmp && !cmp.ok && cmp.extra ? `<p class="small muted">Red rows: in your result but should not be. Orange rows: expected but missing.</p>` : '');
  }

  // ---------------- ERD BUILDER ----------------
  /**
   * opts: { initialText, draftKey, height }
   * returns { el, getModel(), setHighlight(set), destroy() }
   */
  function ErdBuilder(opts = {}) {
    const saved = draftGet(opts.draftKey, null);
    let model = { entities: [], rels: [] };
    let layout = (saved && saved.layout) || {};
    try { model = root.ERD.parse((saved && saved.text) || opts.initialText || ''); } catch (e) { model = { entities: [], rels: [] }; }
    const el = h(`<div class="erd-builder">
      <div class="row" style="margin-bottom:8px">
        <div class="seg" role="tablist"><button type="button" class="on" data-tab="forms">Forms</button><button type="button" data-tab="text">Text</button></div>
        <span class="spacer"></span>
        <button type="button" class="btn-sm" data-act="layout" title="Arrange the diagram automatically">Auto-arrange</button>
        <button type="button" class="btn-sm danger" data-act="clear">Clear</button>
      </div>
      <div class="builder">
        <div>
          <div data-pane="forms">
            <fieldset><legend>1. Entity</legend>
              <div class="three"><input data-f="ename" placeholder="e.g. STUDENT" aria-label="Entity name"><label class="inline-check"><input type="checkbox" data-f="eweak"> weak</label><button type="button" data-act="addE">Add</button></div>
            </fieldset>
            <fieldset><legend>2. Attribute</legend>
              <div class="two"><select data-f="aowner" aria-label="Attach to"></select><input data-f="aname" placeholder="name, e.g. Phone" aria-label="Attribute name"></div>
              <div class="two"><select data-f="akind" aria-label="Attribute type">
                <option value="simple">simple</option><option value="key">key (underlined)</option><option value="partial">partial key (dashed underline)</option>
                <option value="multi">multivalued (double oval)</option><option value="derived">derived (dashed oval)</option></select>
                <input data-f="aparts" placeholder="composite parts: First, Last" aria-label="Composite parts (optional)"></div>
              <button type="button" data-act="addA">Add attribute</button>
            </fieldset>
            <fieldset><legend>3. Relationship</legend>
              <div class="two"><input data-f="rname" placeholder="e.g. ENROLLS" aria-label="Relationship name"><label class="inline-check"><input type="checkbox" data-f="rident"> identifying (double diamond)</label></div>
              <div class="three"><select data-f="ra" aria-label="Entity A"></select><select data-f="rca" aria-label="Cardinality next to A"><option>1</option><option>N</option><option>M</option></select><label class="inline-check"><input type="checkbox" data-f="rta"> total</label></div>
              <div class="three"><select data-f="rb" aria-label="Entity B"></select><select data-f="rcb" aria-label="Cardinality next to B"><option>N</option><option>1</option><option>M</option></select><label class="inline-check"><input type="checkbox" data-f="rtb"> total</label></div>
              <p class="small muted" style="margin:0">The number next to an entity = how many of THAT entity relate to one instance on the other side. "total" = double line (every instance must take part).</p>
              <button type="button" data-act="addR">Add relationship</button>
            </fieldset>
            <div class="elements" data-list></div>
          </div>
          <div data-pane="text" class="hidden">
            <textarea class="mono" data-f="text" spellcheck="false" rows="10" aria-label="ERD as text"></textarea>
            <div class="row" style="margin-top:6px"><button type="button" data-act="applyText" class="primary">Update diagram</button></div>
            <details><summary>Text format help</summary><pre>ENTITY MEMBER: *MemberID, Name(FirstName, LastName), [Phone], /Age
WEAK COPY: ~CopyNumber, ShelfLocation
REL BORROWS: MEMBER M, COPY N | LoanDate, DueDate
IDREL HAS_COPY: BOOK 1, COPY N total

*key  ~partial key  [multivalued]  /derived  Name(parts) composite
ends: ENTITY 1|N|M [total]</pre></details>
          </div>
          <div class="fb bad hidden" data-err></div>
        </div>
        <div><div class="erd-wrap" data-diagram></div><p class="small muted">Drag shapes to arrange them. Red = something to fix after "Check".</p></div>
      </div>
    </div>`);
    const f = (n) => $(`[data-f="${n}"]`, el);
    const err = $('[data-err]', el);
    const showErr = (m) => { err.textContent = m; err.classList.toggle('hidden', !m); };
    const diagram = root.ERD.mount($('[data-diagram]', el), model, { layout, onLayout: (l) => { layout = l; save(); } });
    const save = () => draftSet(opts.draftKey, { text: root.ERD.toText(model), layout });
    const refresh = () => {
      const ents = model.entities.map(e => e.name);
      const ownerOpts = [...model.entities.map(e => `<option value="E:${esc(e.name)}">${esc(e.name)} (entity)</option>`), ...model.rels.map((r, i) => `<option value="R:${i}">${esc(r.name)} (relationship)</option>`)].join('');
      const keep = (sel, html) => { const v = sel.value; sel.innerHTML = html; if ([...sel.options].some(o => o.value === v)) sel.value = v; };
      keep(f('aowner'), ownerOpts || '<option value="">— add an entity first —</option>');
      const eo = ents.map(n => `<option>${esc(n)}</option>`).join('') || '<option value="">—</option>';
      keep(f('ra'), eo); keep(f('rb'), eo);
      if (ents.length > 1 && f('ra').value === f('rb').value && !f('rb').dataset.touched) f('rb').selectedIndex = 1;
      const kindTxt = { key: 'key', partial: 'partial key', multi: 'multivalued', derived: 'derived', simple: '' };
      const attrLines = (attrs, ownerRef) => attrs.map((a, i) => `<div class="el sub">◯ ${esc(a.name)}${a.parts && a.parts.length ? ' (' + esc(a.parts.join(', ')) + ')' : ''} <span class="muted">${kindTxt[a.kind]}</span><button type="button" class="x" title="Delete" data-del="${ownerRef}|${i}">×</button></div>`).join('');
      $('[data-list]', el).innerHTML = (model.entities.map((e, i) => `<div class="el">${e.weak ? '▭▭' : '▭'} <b>${esc(e.name)}</b>${e.weak ? ' <span class="muted">weak</span>' : ''}<button type="button" class="x" title="Delete" data-del="E|${i}">×</button></div>${attrLines(e.attrs, 'EA' + i)}`).join('') +
        model.rels.map((r, i) => `<div class="el">${r.identifying ? '◇◇' : '◇'} <b>${esc(r.name)}</b>: ${r.ends.map(x => esc(x.e) + ' ' + x.card + (x.total ? ' (total)' : '')).join(' — ')}<button type="button" class="x" title="Delete" data-del="R|${i}">×</button></div>${attrLines(r.attrs, 'RA' + i)}`).join('')) || '<p class="muted small" style="margin:4px">Nothing yet. Start with an entity.</p>';
      f('text').value = root.ERD.toText(model);
      diagram.update(model);
      save();
    };
    const nameOk = (n) => /^[A-Za-z_][\w]*$/.test(n);
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      const act = b.dataset.act, tab = b.dataset.tab, del = b.dataset.del;
      showErr('');
      if (tab) { $$('[data-tab]', el).forEach(x => x.classList.toggle('on', x === b)); $$('[data-pane]', el).forEach(p => p.classList.toggle('hidden', p.dataset.pane !== tab)); if (tab === 'text') f('text').value = root.ERD.toText(model); return; }
      if (del) {
        const [kind, i] = del.split('|');
        if (kind === 'E') { const name = model.entities[i].name; model.entities.splice(i, 1); model.rels = model.rels.filter(r => !r.ends.some(e => e.e === name)); }
        else if (kind === 'R') model.rels.splice(i, 1);
        else if (kind.startsWith('EA')) model.entities[+kind.slice(2)].attrs.splice(i, 1);
        else if (kind.startsWith('RA')) model.rels[+kind.slice(2)].attrs.splice(i, 1);
        diagram.state.highlight = new Set(); refresh(); return;
      }
      if (act === 'addE') {
        const n = f('ename').value.trim().replace(/\s+/g, '_');
        if (!nameOk(n)) return showErr('Entity names: letters, digits and _ only (e.g. LIBRARY_CARD).');
        if (model.entities.some(e => e.name.toLowerCase() === n.toLowerCase())) return showErr(`There is already an entity ${n}.`);
        model.entities.push({ name: n, weak: f('eweak').checked, attrs: [] });
        f('ename').value = ''; f('eweak').checked = false; refresh(); f('aowner').value = 'E:' + n; f('ename').focus();
      } else if (act === 'addA') {
        const owner = f('aowner').value; const n = f('aname').value.trim().replace(/\s+/g, '_');
        if (!owner) return showErr('Add an entity first.');
        if (!nameOk(n)) return showErr('Attribute names: letters, digits and _ only.');
        const parts = f('aparts').value.split(',').map(s => s.trim().replace(/\s+/g, '_')).filter(Boolean);
        if (parts.some(p => !nameOk(p))) return showErr('Composite parts: names separated by commas.');
        const target = owner.startsWith('E:') ? model.entities.find(e => e.name === owner.slice(2)) : model.rels[+owner.slice(2)];
        if (target.attrs.some(a => a.name.toLowerCase() === n.toLowerCase())) return showErr(`${n} already exists there.`);
        target.attrs.push({ name: n, kind: f('akind').value, parts });
        f('aname').value = ''; f('aparts').value = ''; f('akind').value = 'simple'; refresh(); f('aname').focus();
      } else if (act === 'addR') {
        const n = f('rname').value.trim().replace(/\s+/g, '_');
        if (!nameOk(n)) return showErr('Relationship names: letters, digits and _ only (e.g. WORKS_ON).');
        if (!f('ra').value || !f('rb').value) return showErr('Add the entities first.');
        model.rels.push({ name: n, identifying: f('rident').checked, ends: [{ e: f('ra').value, card: f('rca').value, total: f('rta').checked }, { e: f('rb').value, card: f('rcb').value, total: f('rtb').checked }], attrs: [] });
        f('rname').value = ''; f('rident').checked = false; f('rta').checked = false; f('rtb').checked = false; refresh();
      } else if (act === 'applyText') {
        try { model = root.ERD.parse(f('text').value); diagram.state.highlight = new Set(); refresh(); toast('Diagram updated'); }
        catch (e) { showErr(e.message); }
      } else if (act === 'layout') { diagram.relayout(); layout = diagram.state.layout; save(); }
      else if (act === 'clear') { if (confirm('Delete the whole diagram?')) { model = { entities: [], rels: [] }; diagram.relayout(); layout = diagram.state.layout; refresh(); } }
    });
    f('rb').addEventListener('change', () => { f('rb').dataset.touched = '1'; });
    ['ename', 'aname', 'aparts', 'rname'].forEach(n => f(n).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $(`[data-act="${n === 'ename' ? 'addE' : n === 'rname' ? 'addR' : 'addA'}"]`, el).click(); } }));
    refresh();
    return { el, getModel: () => model, setHighlight: (s) => diagram.setHighlight(s), destroy: () => diagram.destroy(), getText: () => root.ERD.toText(model) };
  }

  /** read-only (but draggable) diagram */
  function ErdView(text) {
    const el = h('<div class="erd-wrap"></div>');
    let m; try { m = root.ERD.parse(text); } catch (e) { el.textContent = e.message; return { el, destroy() {} }; }
    const d = root.ERD.mount(el, m, {});
    return { el, destroy: () => d.destroy() };
  }

  // ---------------- FD helpers ----------------
  function parseKeyList(text, attrs) {
    const raw = String(text || '').replace(/[{}]/g, '').trim();
    if (!raw) throw new Error('Type at least one key.');
    let pieces = raw.split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
    if (pieces.length === 1 && attrs.every(a => a.length === 1)) pieces = raw.split(/[,\s]+/).filter(Boolean);
    return pieces.map(p => root.FD.parseSet(p, attrs, 'key'));
  }
  const parseSetLoose = (text, attrs) => root.FD.parseSet(String(text || '').replace(/[{}()+]/g, ' ').trim() || '?', attrs, 'answer');

  // ---------------- EXERCISE INPUTS ----------------
  /**
   * Make the input part of an exercise / quiz question.
   * Returns { el, check: async () => ({correct, score, html, categories, error, highlight}), solutionHtml: () => string, onShow?() , destroy?() }
   */
  function makeInput(ex, ctx = {}) {
    const dk = ctx.draftKey;
    const type = ex.type;
    const saveDraft = (v) => draftSet(dk, v);

    if (type === 'mcq') {
      const name = 'q' + Math.random().toString(36).slice(2);
      const el = h(`<div class="options">${ex.options.map((o, i) => `<label><input type="radio" name="${name}" value="${i}"> <span>${fill(o)}</span></label>`).join('')}</div>`);
      const d = draftGet(dk, null); if (d !== null) { const r = $(`input[value="${d}"]`, el); if (r) r.checked = true; }
      el.addEventListener('change', (e) => draftSet(dk, e.target.value));
      return {
        el,
        async check() {
          const sel = $('input:checked', el);
          if (!sel) return { error: 'Please choose an answer.' };
          const v = +sel.value, ok = v === ex.answer;
          if (!ctx.exam) { $$('label', el).forEach((l, i) => { l.classList.remove('right', 'wrong'); if (i === v) l.classList.add(ok ? 'right' : 'wrong'); }); }
          return { correct: ok, score: ok ? 1 : 0, html: ok ? 'Correct!' : 'Not quite.' };
        },
        reveal() { $$('label', el)[ex.answer].classList.add('right'); },
        solutionHtml: () => `Answer: <b>${fill(ex.options[ex.answer])}</b>`
      };
    }

    if (type === 'text' || type === 'explain') {
      const el = h(`<div><textarea rows="${type === 'explain' ? 7 : 3}" placeholder="Type your answer…" aria-label="Your answer"></textarea></div>`);
      const ta = $('textarea', el); ta.value = draftGet(dk, '') || '';
      ta.addEventListener('input', () => saveDraft(ta.value));
      return {
        el,
        async check() {
          const v = normText(ta.value);
          if (!v) return { error: 'Please type an answer first.' };
          if (ex.exact) { const ok = ex.exact.some(x => normText(x) === v); return { correct: ok, score: ok ? 1 : 0, html: ok ? 'Correct!' : 'Not quite.' }; }
          const groups = ex.keywords || [];
          const hit = groups.filter(g => g.some(k => v.includes(normText(k))));
          const score = groups.length ? hit.length / groups.length : 0;
          const ok = score === 1;
          return { correct: ok, score, html: ok ? 'Correct — you covered the key points.' : (type === 'explain' ? `You covered ${hit.length} of ${groups.length} key points.` : 'Something important is missing. Compare with the hints.') };
        },
        solutionHtml: () => `Model answer: ${esc(ex.sample || '')}`
      };
    }

    if (type === 'erd') {
      const b = ErdBuilder({ initialText: ex.start || '', draftKey: dk });
      const models = (Array.isArray(ex.model) ? ex.model : [ex.model]).map(t => root.ERD.parse(t));
      let solView = null;
      return {
        el: b.el,
        async check() {
          const user = b.getModel();
          if (!user.entities.length) return { error: 'Draw at least one entity first.' };
          let best = null;
          for (const m of models) { const r = root.ERD.check(user, m, aliasesFor(ex)); if (!best || r.score > best.score) best = r; }
          if (!ctx.exam) b.setHighlight(best.highlight);
          const bad = best.items.filter(i => i.ok === false), notes = best.items.filter(i => i.ok === null), good = best.items.filter(i => i.ok);
          const html = `<b>${best.passed} of ${best.total} checks correct (${Math.round(best.score * 100)}%).</b>` +
            (bad.length ? `<ul class="checklist">${bad.map(i => `<li class="bad">${esc(i.msg)}</li>`).join('')}</ul>` : '') +
            (notes.length ? `<ul class="checklist">${notes.map(i => `<li class="note">${esc(i.msg)}</li>`).join('')}</ul>` : '') +
            `<details><summary>Show what is already correct (${good.length})</summary><ul class="checklist">${good.map(i => `<li class="ok">${esc(i.msg)}</li>`).join('')}</ul></details>`;
          return { correct: best.score === 1, score: best.score, html, categories: best.categories };
        },
        solutionHtml: () => `<p>Model diagram (drag to explore):</p><div data-solerd></div><details><summary>Model answer as text</summary><pre>${esc(Array.isArray(ex.model) ? ex.model[0] : ex.model)}</pre></details>`,
        onSolution(box) { const host = $('[data-solerd]', box); if (host && !solView) { solView = ErdView(Array.isArray(ex.model) ? ex.model[0] : ex.model); host.appendChild(solView.el); } },
        destroy() { b.destroy(); if (solView) solView.destroy(); },
        getText: () => b.getText()
      };
    }

    if (type === 'schema') {
      const el = h(`<div><textarea class="mono" rows="8" spellcheck="false" placeholder="DOCTOR(DoctorID PK, FirstName, LastName, DeptID FK->DEPARTMENT)\nDOCTOR_PHONE(DoctorID PK FK->DOCTOR, Phone PK)" aria-label="Your relational schema"></textarea>
        <p class="small muted">One table per line. Mark keys with <code>PK</code>, foreign keys with <code>FK->TABLE</code>, 1:1 foreign keys with <code>UNIQUE</code>. Order, capitals and small spelling differences don't matter.</p></div>`);
      const ta = $('textarea', el); ta.value = draftGet(dk, '') || '';
      ta.addEventListener('input', () => saveDraft(ta.value));
      const models = Array.isArray(ex.model) ? ex.model : [ex.model];
      return {
        el,
        async check() {
          if (!ta.value.trim()) return { error: 'Type your tables first.' };
          let best = null;
          try { for (const m of models) { const r = root.SCHEMA.check(ta.value, m, ex.notes || {}, aliasesFor(ex)); if (!best || r.score > best.score) best = r; } }
          catch (e) { return { error: e.message }; }
          const bad = best.items.filter(i => i.ok === false), notes = best.items.filter(i => i.ok === null), good = best.items.filter(i => i.ok);
          const html = `<b>${best.passed} of ${best.total} checks correct (${Math.round(best.score * 100)}%).</b>` +
            (bad.length ? `<ul class="checklist">${bad.map(i => `<li class="bad">${esc(i.msg)}</li>`).join('')}</ul>` : '') +
            (notes.length ? `<ul class="checklist">${notes.map(i => `<li class="note">${esc(i.msg)}</li>`).join('')}</ul>` : '') +
            `<details><summary>Show what is already correct (${good.length})</summary><ul class="checklist">${good.map(i => `<li class="ok">${esc(i.msg)}</li>`).join('')}</ul></details>`;
          return { correct: best.score === 1, score: best.score, html, categories: best.categories };
        },
        solutionHtml: () => `<pre>${esc(models[0])}</pre>`,
        getText: () => ta.value
      };
    }

    if (type === 'query') {
      const d = draftGet(dk, null) || { mode: 'ra', text: '' };
      const el = h(`<div>
        <div class="row"><div class="seg"><button type="button" data-mode="ra">Relational algebra</button><button type="button" data-mode="sql">SQL</button></div>
        <span class="small muted" data-help></span></div>
        <textarea class="mono" rows="4" spellcheck="false" aria-label="Your query" style="margin-top:8px"></textarea>
        <div class="row" style="margin-top:6px">${ctx.exam ? '<button type="button" data-act="syntax" class="btn-sm">Check syntax</button>' : '<button type="button" data-act="run" class="btn-sm">▶ Run (no grading)</button><button type="button" data-act="tree" class="btn-sm">Query tree</button>'}</div>
        <div data-out></div></div>`);
      const ta = $('textarea', el), out = $('[data-out]', el);
      let mode = d.mode; ta.value = d.text || '';
      const setMode = (m) => {
        mode = m; $$('[data-mode]', el).forEach(b => b.classList.toggle('on', b.dataset.mode === m));
        $('[data-help]', el).innerHTML = m === 'ra' ? 'e.g. <code>PROJECT[name](SELECT[salary>1000](EMPLOYEE))</code>' : 'e.g. <code>SELECT name FROM EMPLOYEE WHERE salary &gt; 1000;</code>';
        ta.placeholder = m === 'ra' ? 'PROJECT[...](SELECT[...](TABLE))' : 'SELECT ... FROM ... WHERE ...;';
        const tb = $('[data-act="tree"]', el); if (tb) tb.classList.toggle('hidden', m !== 'ra');
        draftSet(dk, { mode, text: ta.value });
      };
      setMode(mode);
      ta.addEventListener('input', () => saveDraft({ mode, text: ta.value }));
      let expected = null;
      const getExpected = () => { if (!expected) expected = root.RA.run(ex.ra).result; return expected; };
      const evalUser = async () => mode === 'ra' ? root.RA.run(ta.value).result : await runSql(ta.value);
      el.addEventListener('click', async (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.mode) return setMode(b.dataset.mode);
        if (!ta.value.trim()) { out.innerHTML = `<div class="fb warn">Type a query first.</div>`; return; }
        try {
          if (b.dataset.act === 'run') {
            if (mode === 'ra') {
              const r = root.RA.run(ta.value);
              out.innerHTML = `<h3>Your result</h3>${tableHtml(r.result)}` + (r.steps.length > 1 ? `<details><summary>Intermediate results (${r.steps.length} steps)</summary>${r.steps.map(s => `<p><code>${esc(s.label)}</code></p>${tableHtml(s.rel, { max: 30 })}`).join('')}</details>` : '');
            } else out.innerHTML = `<h3>Your result</h3>${tableHtml(await runSql(ta.value))}`;
          } else if (b.dataset.act === 'tree') out.innerHTML = `<h3>Query tree</h3><pre class="tree">${esc(root.RA.tree(ta.value))}</pre>`;
          else if (b.dataset.act === 'syntax') { await evalUser(); out.innerHTML = '<div class="fb ok">The syntax is OK.</div>'; }
        } catch (err) { out.innerHTML = `<div class="fb bad">${esc(err.message)}</div>`; }
      });
      return {
        el,
        async check() {
          if (!ta.value.trim()) return { error: 'Type a query first.' };
          let user;
          try { user = await evalUser(); } catch (err) { return { error: (mode === 'sql' ? 'SQL error: ' : '') + err.message, score: 0 }; }
          const exp = getExpected();
          const cmp = root.RA.compare(user, exp, {});
          if (!ctx.exam) out.innerHTML = compareHtml(user, exp, cmp);
          const partial = cmp.ok ? 1 : (user.cols.length === exp.cols.length ? 0.3 : 0.1);
          return { correct: cmp.ok, score: partial, html: cmp.ok ? ('Correct — your result matches!' + (cmp.note ? ' <br><span class="small">' + esc(cmp.note) + '</span>' : '')) : esc(cmp.reason) };
        },
        solutionHtml: () => `<p><b>Relational algebra:</b></p><pre>${esc(ex.ra)}</pre><p><b>SQL:</b></p><pre>${esc(ex.sql)}</pre><p><b>Expected result:</b></p>${tableHtml(getExpected())}`,
        getText: () => `[${mode}] ${ta.value}`
      };
    }

    if (type === 'fd') return makeFdInput(ex, ctx);
    return { el: h(`<div class="fb bad">Unknown exercise type: ${esc(type)}</div>`), async check() { return { error: 'Unknown type' }; }, solutionHtml: () => '' };
  }

  function makeFdInput(ex, ctx) {
    const dk = ctx.draftKey, FD = root.FD;
    const P = FD.parse(ex.problem); const A = P.attrs;
    const fmt = (m) => FD.fmt(m, A);
    const single = A.every(a => a.length === 1);
    let el, getVal;
    const problemHtml = `<pre class="small">${esc(ex.problem)}</pre>`;
    if (ex.ask === 'nf') {
      el = h(`<div>${problemHtml}<div class="seg" role="radiogroup">${['1NF', '2NF', '3NF', 'BCNF'].map(n => `<button type="button" data-nf="${n}">${n}</button>`).join('')}</div></div>`);
      let v = draftGet(dk, null);
      const paint = () => $$('[data-nf]', el).forEach(b => b.classList.toggle('on', b.dataset.nf === v));
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-nf]'); if (b) { v = b.dataset.nf; draftSet(dk, v); paint(); } }); paint();
      getVal = () => v;
    } else {
      const ph = { closure: single ? 'e.g. ABD' : 'e.g. StudentID, Name', prime: single ? 'e.g. ABC' : 'attributes separated by commas', keys: single ? 'e.g. AB, BC' : 'e.g. StudentID, Course   (separate keys with ;)', cover: single ? 'e.g. A->B; B->C' : 'one FD per line: StudentID -> Name', decomp3nf: single ? 'e.g. R1(A,B), R2(B,C), R3(A,D)' : 'e.g. STUDENT(StudentID, StudentName), …', decompbcnf: single ? 'e.g. R1(A,B), R2(A,C)' : 'e.g. R1(…), R2(…)' }[ex.ask];
      const multi = ['cover', 'decomp3nf', 'decompbcnf'].includes(ex.ask) || !single;
      el = h(`<div>${problemHtml}${multi ? `<textarea class="mono" rows="3" placeholder="${esc(ph)}" aria-label="Your answer"></textarea>` : `<input type="text" class="mono" placeholder="${esc(ph)}" aria-label="Your answer">`}</div>`);
      const inp = $('textarea, input', el); inp.value = draftGet(dk, '') || '';
      inp.addEventListener('input', () => draftSet(dk, inp.value));
      getVal = () => inp.value;
    }
    const an = () => FD.analyze(ex.problem);
    async function check() {
      const v = getVal();
      if (!v || !String(v).trim()) return { error: 'Please answer first.' };
      try {
        if (ex.ask === 'closure' || ex.ask === 'prime') {
          const user = parseSetLoose(v, A);
          const exp = ex.ask === 'closure' ? FD.closure(FD.parseSet(ex.of, A, 'x'), P.fds).mask : FD.candidateKeys(P.all, P.fds).prime;
          if (user === exp) return { correct: true, score: 1, html: `Correct: ${fmt(exp)}.` };
          const miss = exp & ~user, extra = user & ~exp;
          return { correct: false, score: 0, html: `Not quite.${miss ? ` You are missing something (${FD.count(miss)} attribute${FD.count(miss) > 1 ? 's' : ''}).` : ''}${extra ? ` ${fmt(extra)} should not be there.` : ''}`, categories: [ex.ask === 'closure' ? 'closure' : 'candidate-key'] };
        }
        if (ex.ask === 'keys') {
          const user = parseKeyList(v, A);
          const { keys } = FD.candidateKeys(P.all, P.fds);
          const good = user.filter(k => keys.includes(k));
          const wrong = user.filter(k => !keys.includes(k));
          const missing = keys.filter(k => !user.includes(k));
          const ok = !wrong.length && !missing.length;
          const why = wrong.map(k => FD.closure(k, P.fds).mask !== P.all ? `${fmt(k)} is not a key: ${fmt(k)}+ = ${fmt(FD.closure(k, P.fds).mask)} (not all attributes).` : `${fmt(k)} is a superkey but not minimal (a smaller key is inside it).`);
          return { correct: ok, score: keys.length ? Math.max(0, (good.length - wrong.length * 0.5) / keys.length) : 0, html: ok ? `Correct: ${keys.map(fmt).join(', ')}.` : `${why.map(esc).join('<br>')}${missing.length ? `<br>You missed ${missing.length} candidate key${missing.length > 1 ? 's' : ''}.` : ''}`, categories: ['candidate-key'] };
        }
        if (ex.ask === 'nf') {
          const r = FD.normalForm(P.all, P.fds, A);
          const ok = v === r.nf;
          const cat = r.nf === '1NF' ? 'partial-dependency' : r.nf === '2NF' ? 'transitive-dependency' : 'bcnf';
          return { correct: ok, score: ok ? 1 : 0, html: ok ? `Correct: ${r.nf}.` : 'Not quite. Find ALL candidate keys first, then test 2NF → 3NF → BCNF in order.', categories: [cat] };
        }
        if (ex.ask === 'cover') {
          const user = FD.parseFDs(v, A);
          if (!user.length) return { error: 'Write at least one FD.' };
          const eq = FD.equivalent(user, P.fds), mn = FD.isMinimal(user);
          const ok = eq && mn.ok;
          let msg = ok ? 'Correct — equivalent to F and minimal.' : '';
          if (!eq) msg += 'Your set is not equivalent to F (it implies something F does not, or misses something F implies). ';
          if (eq && !mn.ok) msg += 'Equivalent to F, but not minimal: ' + mn.why;
          return { correct: ok, score: ok ? 1 : (eq ? 0.5 : 0), html: esc(msg), categories: ['minimal-cover'] };
        }
        if (ex.ask === 'decomp3nf' || ex.ask === 'decompbcnf') {
          const rels = FD.parseDecomposition(v, A);
          const covered = rels.reduce((a, r) => a | r.mask, 0);
          const checks = [];
          checks.push({ ok: covered === P.all, msg: covered === P.all ? 'Every attribute appears in some relation.' : `Attributes missing from all relations: ${fmt(P.all & ~covered)}.` });
          const ch = FD.chase(P.all, rels.map(r => r.mask), P.fds, A);
          checks.push({ ok: ch.lossless, msg: ch.lossless ? 'Lossless join ✓' : 'The decomposition is LOSSY (no relation contains a key / the chase test fails).' });
          const target = ex.ask === 'decomp3nf' ? '3NF' : 'BCNF', rank = { '1NF': 1, '2NF': 2, '3NF': 3, 'BCNF': 4 };
          rels.forEach(r => { const nf = FD.normalFormOn(r.mask, FD.project(r.mask, P.fds)); checks.push({ ok: rank[nf] >= rank[target], msg: `${r.name}(${FD.bits(r.mask).map(i => A[i]).join(', ')}) is in ${nf}${rank[nf] >= rank[target] ? ' ✓' : ` — needs ${target}`}` }); });
          if (ex.ask === 'decomp3nf') { const pr = FD.preservation(rels.map(r => r.mask), P.fds); checks.push({ ok: pr.ok, msg: pr.ok ? 'Dependency preserving ✓' : `Not dependency preserving: ${pr.lost.map(f => FD.fmtFD(f, A)).join(', ')} is lost.` }); }
          const passed = checks.filter(c => c.ok).length;
          return { correct: passed === checks.length, score: passed / checks.length, html: `<ul class="checklist">${checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${esc(c.msg)}</li>`).join('')}</ul>`, categories: ['decomposition'] };
        }
      } catch (e) { return { error: e.message }; }
      return { error: 'Unknown question.' };
    }
    function solutionHtml() {
      const a = an();
      const list = (arr) => `<ol class="steps">${arr.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
      switch (ex.ask) {
        case 'closure': { const c = FD.closure(FD.parseSet(ex.of, A, 'x'), P.fds, A); return `<b>${esc(ex.of)}+ = ${fmt(c.mask)}</b>${list(c.steps)}`; }
        case 'prime': case 'keys': return `<b>Candidate keys: ${a.keys.keys.map(fmt).join(', ')}</b> — prime attributes: ${fmt(a.keys.prime)}${list(a.keys.steps)}`;
        case 'nf': return `<b>${a.nf.nf}</b>${list(a.nf.reasons)}`;
        case 'cover': return `<b>A minimal cover: ${esc(FD.fmtFDs(a.cover.cover, A))}</b>${list(a.cover.steps)}`;
        case 'decomp3nf': return `<b>${a.syn.relations.map((r, i) => `R${i + 1}(${FD.bits(r.mask).map(j => A[j]).join(', ')})`).join(', ')}</b>${list(a.syn.steps)}`;
        case 'decompbcnf': return `<b>${a.bcnf.relations.map((r, i) => `R${i + 1}(${FD.bits(r.mask).map(j => A[j]).join(', ')})`).join(', ')}</b>${list(a.bcnf.steps)}`;
      }
      return '';
    }
    return { el, check, solutionHtml, getText: () => String(getVal() || '') };
  }

  // ---------------- EXERCISE CARD (practice mode) ----------------
  /**
   * opts: { label, draftKey, onResult(correct) , showTitle }
   */
  function ExerciseCard(ex, opts = {}) {
    const solvedBefore = Store.isSolved(ex.id);
    const el = h(`<div class="card ex ${solvedBefore ? 'solved' : ''}" id="ex-${esc(ex.id)}">
      <div class="ex-head">${opts.label ? `<span class="step-label">${esc(opts.label)}</span>` : ''}<span class="badge">Level ${ex.level || 1}</span>${(ex.tags || []).slice(0, 2).map(t => `<span class="badge">${esc(C.categories[t] || t)}</span>`).join('')}<span class="spacer"></span><span class="badge ok ${solvedBefore ? '' : 'hidden'}" data-solved>✓ solved</span></div>
      <div class="prompt">${fill(ex.prompt)}</div>
      <div data-given></div>
      <div data-input></div>
      <div class="ex-actions"><button type="button" class="primary" data-act="check">Check</button>${(ex.hints || []).length ? `<button type="button" data-act="hint">💡 Hint</button>` : ''}<button type="button" class="ghost" data-act="sol">Show solution</button></div>
      <div class="feedback" data-fb></div><div data-hints></div><div class="solution hidden" data-sol></div>
    </div>`);
    const destroyers = [];
    if (ex.erd) { const v = ErdView(ex.erd); $('[data-given]', el).appendChild(h('<p class="small muted">Given ERD:</p>')); $('[data-given]', el).appendChild(v.el); destroyers.push(v.destroy); }
    const input = makeInput(ex, { draftKey: opts.draftKey });
    $('[data-input]', el).appendChild(input.el);
    if (input.destroy) destroyers.push(input.destroy);
    let wrong = 0, hintsShown = 0;
    const fb = $('[data-fb]', el), sol = $('[data-sol]', el);
    const showSolution = (auto) => {
      sol.innerHTML = (auto ? '<p><b>Let\'s look at the solution together</b> — read it, then try again or move on.</p>' : '') + `<div>${fill(ex.solution || '')}</div><div style="margin-top:8px">${input.solutionHtml()}</div>`;
      sol.classList.remove('hidden');
      if (input.onSolution) input.onSolution(sol);
      if (input.reveal) input.reveal();
    };
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-act]'); if (!b || !el.contains(b)) return;
      if (b.dataset.act === 'hint') {
        const hints = ex.hints || [];
        if (hintsShown < hints.length) { $('[data-hints]', el).appendChild(h(`<div class="hint-box">💡 ${fill(hints[hintsShown])}</div>`)); hintsShown++; }
        if (hintsShown >= hints.length) b.disabled = true; else b.textContent = `💡 Another hint (${hints.length - hintsShown} left)`;
      } else if (b.dataset.act === 'sol') { showSolution(false); }
      else if (b.dataset.act === 'check') {
        b.disabled = true; const old = b.textContent; b.textContent = 'Checking…';
        let r;
        try { r = await input.check(); } catch (err) { r = { error: err.message }; }
        b.disabled = false; b.textContent = old;
        if (r.error) { fb.innerHTML = `<div class="fb warn">${esc(r.error)}</div>`; return; }
        Store.recordAttempt(ex.id, r.correct, Math.round((r.score || 0) * 100));
        if (r.correct) {
          fb.innerHTML = `<div class="fb ok">🎉 ${r.html}</div>`;
          el.classList.add('solved'); $('[data-solved]', el).classList.remove('hidden');
          opts.onResult && opts.onResult(true);
        } else {
          wrong++;
          const cats = [...new Set((r.categories && r.categories.length ? r.categories : (ex.tags || []).slice(0, 1)))];
          cats.slice(0, 3).forEach(c => Store.addMistake(c, ex.id));
          const enc = wrong === 1 ? 'Good try! Read the feedback carefully' + ((ex.hints || []).length ? ' or take a hint.' : '.') : '';
          fb.innerHTML = `<div class="fb bad">${r.html}</div>${enc ? `<p class="small muted">${enc}</p>` : ''}`;
          if (wrong >= 2 && sol.classList.contains('hidden')) showSolution(true);
          opts.onResult && opts.onResult(false);
        }
      }
    });
    return { el, destroy: () => destroyers.forEach(f => f()) };
  }

  // ---------------- QUIZ ----------------
  function Quiz(lesson, opts = {}) {
    const el = h(`<div class="card"><h2 style="margin-top:0">6. Quiz — 5 questions</h2><p class="muted small">Answer all questions, then submit. You will see an explanation for each one.</p><div data-qs></div><div class="row"><button type="button" class="primary" data-act="submit">Submit quiz</button><span data-score></span></div></div>`);
    const inputs = lesson.quiz.map((q, i) => {
      const box = h(`<div class="card" style="box-shadow:none"><p><b>Q${i + 1}.</b> ${fill(q.prompt)}</p><div data-in></div><div data-fb></div></div>`);
      const inp = makeInput({ ...q, id: lesson.id + 'q' + i }, { draftKey: Store.session ? `${Store.session.id}.quiz.${lesson.id}.${i}` : null, exam: true });
      $('[data-in]', box).appendChild(inp.el);
      $('[data-qs]', el).appendChild(box);
      return { q, inp, box };
    });
    $('[data-act="submit"]', el).addEventListener('click', async () => {
      let score = 0; const wrongCats = new Set();
      for (const { q, inp, box } of inputs) {
        let r; try { r = await inp.check(); } catch (e) { r = { error: e.message }; }
        const ok = !r.error && r.correct;
        if (ok) score++; else if (opts.category) wrongCats.add(q.tag || opts.category);
        if (q.type === 'mcq' && inp.reveal) inp.reveal();
        $('[data-fb]', box).innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct.' : (r.error ? '✗ ' + esc(r.error) : '✗ Not correct.')} <span style="color:var(--text)">${fill(q.explain || '')}</span>${!ok && inp.solutionHtml && q.type !== 'mcq' ? `<div class="small" style="color:var(--text)">${inp.solutionHtml()}</div>` : ''}</div>`;
      }
      const prev = Store.getProgress('quiz:' + lesson.id);
      Store.setProgress('quiz:' + lesson.id, { status: 'done', score: Math.max(score * 20, (prev && prev.score) || 0), attempts: ((prev && prev.attempts) || 0) + 1 });
      Store.setProgress('lesson:' + lesson.id, { status: 'done', score: score * 20, attempts: 0 });
      wrongCats.forEach(c => Store.addMistake(c, 'quiz:' + lesson.id));
      Store.touchStreak();
      $('[data-score]', el).innerHTML = `<b>Your score: ${score} / 5.</b> ${score === 5 ? 'Perfect! 🎉' : score >= 3 ? 'Well done — lesson completed. Review the explanations above.' : 'Lesson marked as completed, but read the explanations and try again later.'}`;
      opts.onDone && opts.onDone(score);
    });
    return { el };
  }

  root.W = { h, $, $$, toast, fill, esc, ErdBuilder, ErdView, makeInput, ExerciseCard, Quiz, tableHtml, compareHtml, runSql, loadSql, parseKeyList, normText };
})(window);
