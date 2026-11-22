/* Interactive tools: base converter, truth-table generator, K-map solver, gate simulator. */
(function () {
  const CAI = window.CAI;
  const { esc, $, $$, range } = CAI.util;
  const N = CAI.num, B = CAI.bool;
  const GROUP_COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)', 'var(--g5)', 'var(--g6)', 'var(--g7)', 'var(--g8)'];
  const TABS = [['convert', '🔢 Base converter'], ['truth', '📋 Truth table'], ['kmap', '🗺️ K-map solver'], ['gates', '🔌 Gate simulator']];

  /* shared state so the truth-table tool can hand a function to the K-map */
  const kstate = { n: 3, vals: Array(8).fill('0'), mode: 'sop' };
  try { const saved = JSON.parse(sessionStorage.getItem('cai109.kmap') || 'null'); if (saved && saved.vals && saved.vals.length === 1 << saved.n) Object.assign(kstate, saved); } catch (e) { /* ignore */ }
  const saveK = () => { try { sessionStorage.setItem('cai109.kmap', JSON.stringify(kstate)); } catch (e) { /* ignore */ } };

  CAI.ui.tools = function (main, tab) {
    tab = TABS.some((t) => t[0] === tab) ? tab : 'convert';
    CAI.store.setLast(`#/tools/${tab}`, 'Tools · ' + TABS.find((t) => t[0] === tab)[1].slice(3));
    main.innerHTML = `<div class="page-head"><div><h1>🛠️ Tools</h1><p>Use these to check your own working — each one shows the steps, not just the result.</p></div></div>
      <div class="tabs">${TABS.map(([id, label]) => `<a href="#/tools/${id}" class="${id === tab ? 'active' : ''}">${label}</a>`).join('')}</div><div id="tool"></div>`;
    ({ convert: converter, truth: truthTool, kmap: kmapTool, gates: gateTool })[tab]($('#tool', main));
  };

  /* ===================== Base converter ===================== */
  function converter(root) {
    root.innerHTML = `<div class="card"><div class="row">
        <input type="text" id="cv-in" class="mono" value="156.375" style="flex:1;min-width:200px" aria-label="Number" />
        <label class="row small">from base <select id="cv-base"><option value="10">10 (decimal)</option><option value="2">2 (binary)</option><option value="8">8 (octal)</option><option value="16">16 (hex)</option></select></label>
        <button class="btn primary" id="cv-go">Convert</button></div>
        <p class="small muted" style="margin:8px 0 0">Accepts fractions (e.g. 13.25) and negative decimals (shows two’s complement too). Prefixes 0x / 0b are fine.</p></div>
      <div id="cv-out"></div>`;
    const go = () => {
      const out = $('#cv-out', root);
      let s = $('#cv-in', root).value.trim().toUpperCase().replace(/[\s_]/g, '');
      let b = +$('#cv-base', root).value;
      if (/^-?0X/.test(s)) { b = 16; $('#cv-base', root).value = '16'; s = s.replace('0X', ''); }
      else if (/^-?0B[01.]+$/.test(s)) { b = 2; $('#cv-base', root).value = '2'; s = s.replace('0B', ''); }
      const neg = s.startsWith('-'); if (neg) s = s.slice(1);
      const digits = '0123456789ABCDEF'.slice(0, b);
      if (!s || !/^[0-9A-F]*\.?[0-9A-F]*$/.test(s) || s === '.' || [...s].some((c) => c !== '.' && !digits.includes(c))) {
        out.innerHTML = `<div class="feedback warn">⚠ “${esc(s)}” is not a valid base-${b} number (allowed digits: ${digits.split('').join(' ')}).</div>`; return;
      }
      if (neg && b !== 10) { out.innerHTML = '<div class="feedback warn">⚠ Negative numbers are only supported in decimal input.</div>'; return; }
      const [ip, fp = ''] = s.split('.');
      const value = N.parseBase(s.startsWith('.') ? '0' + s : s, b);
      if (value > 2 ** 48) { out.innerHTML = '<div class="feedback warn">⚠ That number is too large for this tool (max 2⁴⁸).</div>'; return; }
      const intV = Math.floor(value), fracV = value - intV;
      let html = '';
      if (b !== 10) {
        html += `<div class="card"><h3>Step 1 · base ${b} → decimal (place values)</h3><p class="mono">${N.expansion((ip || '0') + (fp ? '.' + fp : ''), b).html}</p></div>`;
      }
      const results = [];
      for (const t of [2, 8, 10, 16].filter((t) => t !== b)) {
        const ires = N.toBase(intV, t);
        const fres = fracV ? N.fracToBase(fracV, t, 12) : '';
        const exact = !fracV || N.fracRows(fracV, t, 12).length < 12 || N.fracRows(fracV, t, 13).length < 13;
        const res = (neg ? '-' : '') + ires + (fres ? '.' + fres : '');
        results.push([t, res]);
        let work = '';
        if (t === 10) work = b !== 10 ? '<p class="muted">See step 1 above.</p>' : '';
        else if ((b === 2 || b === 8 || b === 16) && t !== 10) {
          const bin = b === 2 ? (ip || '0') + (fp ? '.' + fp : '') : (ip || '0').split('').map((c) => N.bits(N.digitVal(c), b === 8 ? 3 : 4)).join('') + (fp ? '.' + fp.split('').map((c) => N.bits(N.digitVal(c), b === 8 ? 3 : 4)).join('') : '');
          if (b !== 2) work += `<p>Each base-${b} digit → ${b === 8 ? 3 : 4} bits: <span class="mono">${esc(bin)}</span></p>`;
          if (t !== 2) { const k = t === 8 ? 3 : 4; const g = N.groupBits(bin.replace(/^0+(?=[01])/, '') || '0', k); work += `<p>Group into ${k}s from the point: <span class="mono">${g.gi.join(' ')}${g.gf.length ? ' . ' + g.gf.join(' ') : ''}</span> → <b class="mono">${g.digits}</b></p>`; }
        } else {
          work += `<p>Integer part ${intV}: divide by ${t} repeatedly, read remainders bottom → top.</p>${N.divTable(intV, t)}`;
          if (fracV) work += `<p>Fraction part ${+fracV.toFixed(10)}: multiply by ${t} repeatedly, read digits top → bottom.</p>${N.fracTable(fracV, t, 12)}${exact ? '' : '<p class="tip">This fraction does not terminate in base ' + t + ' — shown to 12 digits.</p>'}`;
        }
        html += `<div class="card"><div class="card-head"><h3>Base ${t}${t === 16 ? ' (hex)' : t === 8 ? ' (octal)' : t === 2 ? ' (binary)' : ' (decimal)'}</h3><span class="result-expr">${esc(t === 2 ? CAI.util.group(ires) + (fres ? '.' + fres : '') : res)}${neg && t === 2 ? '' : ''}</span></div>${work}</div>`;
      }
      if (neg && b === 10 && !fracV && intV <= 32768) {
        const w = intV <= 128 ? 8 : 16;
        const mag = N.bits(intV, w), inv = N.invert(mag), tc = N.twos(-intV, w);
        html = `<div class="card"><h3>Two’s complement (${w}-bit) of −${intV}</h3><ol class="steps"><li><div class="st-title">|x| in ${w} bits</div><span class="mono">${CAI.util.group(mag)}</span></li><li><div class="st-title">Invert</div><span class="mono">${CAI.util.group(inv)}</span></li><li><div class="st-title">Add 1</div><b class="mono">${CAI.util.group(tc)}</b> = 0x${N.bitsToHex(tc)}</li></ol>
          <p class="small muted">Sign-magnitude: <span class="mono">${N.signMag(-intV, w)}</span> · One’s complement: <span class="mono">${N.ones(-intV, w)}</span></p></div>` + html;
      }
      out.innerHTML = `<div class="card"><b>Summary:</b> ${esc((neg ? '-' : '') + s)}<sub>${b}</sub> = ${results.map(([t, r]) => `<span class="mono">${esc(r)}</span><sub>${t}</sub>`).join(' = ')}</div>` + html;
    };
    $('#cv-go', root).onclick = go;
    $('#cv-in', root).addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $('#cv-base', root).onchange = go;
    go();
  }

  /* ===================== Truth table generator ===================== */
  function truthTool(root) {
    root.innerHTML = `<div class="card"><div class="row">
        <input type="text" id="tt-in" class="mono" value="A'B + AC" style="flex:1;min-width:240px" aria-label="Boolean expression" />
        <button class="btn primary" id="tt-go">Generate</button></div>
        <div class="row small" style="margin-top:8px"><label class="row"><input type="checkbox" id="tt-mid" checked /> show intermediate columns</label>
        <span class="muted">Examples:</span>${["A AND NOT B", "(A + B)'C", 'A XOR B XOR C', "AB + A'C + BC", 'A NAND (B NOR C)', "A'B'C'D + ABCD'"].map((x) => `<a href="#" class="chip" data-ex="${esc(x)}">${esc(x)}</a>`).join('')}</div>
        <p class="small muted" style="margin:8px 0 0">Type with any keyboard: AND OR NOT XOR NAND NOR XNOR, or + * . ' ! ~ ^. Juxtaposition (AB) means AND. Variables are single letters.</p></div>
      <div id="tt-out"></div>`;
    const go = () => {
      const out = $('#tt-out', root);
      const r = B.tryParse($('#tt-in', root).value);
      if (r.error) { out.innerHTML = `<div class="feedback warn">⚠ ${esc(r.error)}${r.pos != null ? ` (near character ${r.pos + 1})` : ''}</div>`; return; }
      const vars = B.vars(r.ast);
      if (vars.length > 6) { out.innerHTML = '<div class="feedback warn">⚠ Up to 6 variables, please.</div>'; return; }
      const subs = $('#tt-mid', root).checked ? B.subexprs(r.ast).slice(0, -1).filter((s) => s.node.t !== 'not' || s.node.a.t !== 'var' || true) : [];
      const col = B.table(r.ast, vars);
      const ms = col.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
      const Ms = col.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      const sop = B.minSOP(vars, ms), pos = B.minPOS(vars, ms);
      const rows = range(1 << vars.length).map((i) => {
        const env = B.envFor(i, vars);
        return `<tr><td class="muted">${i}</td>${vars.map((v) => `<td>${env[v]}</td>`).join('')}${subs.map((s) => `<td class="muted">${B.evaluate(s.node, env)}</td>`).join('')}<td style="color:${col[i] ? 'var(--ok)' : 'var(--muted)'}">${col[i]}</td></tr>`;
      }).join('');
      out.innerHTML = `<div class="grid cols-2" style="align-items:start">
        <div class="card" style="overflow-x:auto"><h3>Truth table</h3><table class="work mono tt"><tr><th>#</th>${vars.map((v) => `<th>${v}</th>`).join('')}${subs.map((s) => `<th class="small">${esc(s.str)}</th>`).join('')}<th>F</th></tr>${rows}</table></div>
        <div>
          <div class="card"><h3>Canonical forms</h3>
            <p><b>F = Σm(</b>${ms.join(', ') || '—'}<b>)</b><br><b>F = ΠM(</b>${Ms.join(', ') || '—'}<b>)</b></p>
            ${vars.length <= 4 ? `<p class="small"><b>Canonical SOP:</b> <span class="mono">${esc(B.canonicalSOP(vars, ms))}</span></p><p class="small"><b>Canonical POS:</b> <span class="mono">${esc(B.canonicalPOS(vars, ms))}</span></p>` : ''}</div>
          <div class="card"><h3>Minimal forms</h3><p>SOP: <span class="result-expr">${esc(sop.expr)}</span> <span class="muted small">${sop.literals} literals</span></p><p>POS: <span class="result-expr">${esc(pos.expr)}</span> <span class="muted small">${pos.literals} literals</span></p>
          ${vars.length >= 2 && vars.length <= 4 ? '<button class="btn" id="tt-k">🗺️ Open in the K-map solver</button>' : ''}</div>
          <div class="card"><h3>Parsed as</h3><p class="mono">${esc(B.toStr(r.ast))}</p><p class="small muted">Check this matches what you meant (NOT binds tightest, then AND, then XOR, then OR).</p></div>
        </div></div>`;
      const kb = $('#tt-k', out);
      if (kb) kb.onclick = () => { kstate.n = vars.length; kstate.vals = col.map((v) => (v ? '1' : '0')); kstate.vars = vars; saveK(); location.hash = '#/tools/kmap'; };
    };
    $('#tt-go', root).onclick = go;
    $('#tt-in', root).addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $('#tt-mid', root).onchange = go;
    $$('[data-ex]', root).forEach((a) => (a.onclick = (e) => { e.preventDefault(); $('#tt-in', root).value = a.dataset.ex; go(); }));
    go();
  }

  /* ===================== K-map solver ===================== */
  function kmapTool(root) {
    root.innerHTML = `<div class="card"><div class="row">
        <label class="row small">Variables <select id="km-n"><option value="2">2 (A,B)</option><option value="3">3 (A,B,C)</option><option value="4">4 (A,B,C,D)</option></select></label>
        <label class="row small">Group <select id="km-mode"><option value="sop">1s → minimal SOP</option><option value="pos">0s → minimal POS</option></select></label>
        <span class="spacer"></span><button class="btn small" id="km-rand">🎲 Random</button><button class="btn small" id="km-clear">Clear</button></div>
        <div class="row" style="margin-top:10px"><label class="small">Σm <input type="text" id="km-m" class="mono" placeholder="e.g. 0, 2, 5, 7" style="width:220px"></label>
        <label class="small">d <input type="text" id="km-d" class="mono" placeholder="don't cares" style="width:150px"></label><button class="btn small" id="km-load">Load</button></div>
        <p class="small muted" style="margin:8px 0 0">Click a cell to cycle 0 → 1 → X (don’t care). The minimal groups are drawn as coloured dots; hover a group to highlight its cells.</p></div>
      <div class="grid cols-2" style="align-items:start"><div class="card" id="km-grid"></div><div class="card" id="km-res"></div></div>`;
    const nSel = $('#km-n', root), modeSel = $('#km-mode', root);
    nSel.value = kstate.n; modeSel.value = kstate.mode;
    let groupsCache = [];

    const draw = () => {
      const n = kstate.n;
      const vars = 'ABCD'.slice(0, n).split('');
      const L = B.kmapLayout(n);
      const ones = range(1 << n).filter((i) => kstate.vals[i] === '1');
      const dcs = range(1 << n).filter((i) => kstate.vals[i] === 'X');
      const sop = B.minSOP(vars, ones, dcs), pos = B.minPOS(vars, ones, dcs);
      const res = kstate.mode === 'sop' ? sop : pos;
      groupsCache = res.terms.map((t, gi) => ({ t, color: GROUP_COLORS[gi % GROUP_COLORS.length], cells: t.cov, label: kstate.mode === 'sop' ? B.termSOP(t, vars) : '(' + B.termPOS(t, vars) + ')' }));
      const rv = vars.slice(0, L.rb).join(''), cv = vars.slice(L.rb).join('');
      let h = `<table class="kmap-tool"><tr><th>${rv}\\${cv}</th>${L.cols.map((c) => `<th>${N.bits(c, L.cb)}</th>`).join('')}</tr>`;
      L.rows.forEach((r, ri) => {
        h += `<tr><th>${N.bits(r, L.rb)}</th>`;
        L.cols.forEach((c, ci) => {
          const m = L.cell(ri, ci); const v = kstate.vals[m];
          const dots = groupsCache.filter((g) => g.cells.includes(m)).map((g) => `<i style="background:${g.color}"></i>`).join('');
          h += `<td><button class="kmap-cell v${v}" data-m="${m}" aria-label="cell ${m} value ${v}">${v}<small>${m}</small><span class="dots">${dots}</span></button></td>`;
        });
        h += '</tr>';
      });
      $('#km-grid', root).innerHTML = `<h3>K-map</h3>${h}</table>`;
      $$('.kmap-cell', root).forEach((b) => (b.onclick = () => { const m = +b.dataset.m; kstate.vals[m] = { 0: '1', 1: 'X', X: '0' }[kstate.vals[m]]; sync(); draw(); }));
      $('#km-res', root).innerHTML = `<h3>Result</h3>
        <p class="small muted">F(${vars.join(',')}) = Σm(${ones.join(', ') || '—'})${dcs.length ? ` + d(${dcs.join(', ')})` : ''}</p>
        <div class="result-expr">F = ${esc(res.expr)}</div><p class="small muted">${res.literals} literals · ${res.terms.length} group${res.terms.length === 1 ? '' : 's'}</p>
        ${groupsCache.length ? `<h4>Groups (${kstate.mode === 'sop' ? 'of 1s' : 'of 0s'})</h4><ul class="group-list">${groupsCache.map((g, i) => `<li data-g="${i}"><span class="sw" style="background:${g.color}"></span><b class="mono">${esc(g.label)}</b><span class="muted small">cells ${g.cells.join(', ')} · size ${g.cells.length}</span></li>`).join('')}</ul>` : ''}
        <p class="small" style="margin-top:12px">${kstate.mode === 'sop' ? `Minimal POS would be <span class="mono">${esc(pos.expr)}</span> (${pos.literals} literals).` : `Minimal SOP would be <span class="mono">${esc(sop.expr)}</span> (${sop.literals} literals).`}</p>
        <p class="small muted">Read each group: keep only the variables that stay constant across it${kstate.mode === 'pos' ? ' — and complement them (0 → plain, 1 → primed) for POS' : ''}.</p>`;
      $$('[data-g]', root).forEach((li) => {
        const g = groupsCache[+li.dataset.g];
        li.onmouseenter = () => g.cells.forEach((m) => { const c = $(`.kmap-cell[data-m="${m}"]`, root); if (c) { c.classList.add('hl'); c.style.setProperty('--hl', g.color); } });
        li.onmouseleave = () => $$('.kmap-cell.hl', root).forEach((c) => c.classList.remove('hl'));
      });
      saveK();
    };
    const sync = () => {
      $('#km-m', root).value = range(1 << kstate.n).filter((i) => kstate.vals[i] === '1').join(', ');
      $('#km-d', root).value = range(1 << kstate.n).filter((i) => kstate.vals[i] === 'X').join(', ');
    };
    nSel.onchange = () => { kstate.n = +nSel.value; kstate.vals = Array(1 << kstate.n).fill('0'); sync(); draw(); };
    modeSel.onchange = () => { kstate.mode = modeSel.value; draw(); };
    $('#km-clear', root).onclick = () => { kstate.vals = Array(1 << kstate.n).fill('0'); sync(); draw(); };
    $('#km-rand', root).onclick = () => { kstate.vals = range(1 << kstate.n).map(() => { const r = Math.random(); return r < 0.45 ? '1' : r < 0.53 && kstate.n === 4 ? 'X' : '0'; }); sync(); draw(); };
    $('#km-load', root).onclick = () => {
      const parse = (s) => s.split(/[\s,;]+/).filter(Boolean).map(Number);
      const m = parse($('#km-m', root).value), d = parse($('#km-d', root).value);
      const max = (1 << kstate.n) - 1;
      const bad = [...m, ...d].filter((x) => !(Number.isInteger(x) && x >= 0 && x <= max));
      if (bad.length) { CAI.util.toast(`Cell numbers must be 0–${max}`); return; }
      kstate.vals = range(1 << kstate.n).map((i) => (m.includes(i) ? '1' : d.includes(i) ? 'X' : '0'));
      draw();
    };
    sync();
    draw();
  }

  /* ===================== Gate simulator ===================== */
  const GATES = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
  const GEXPR = { AND: 'A·B', OR: 'A + B', NOT: "A'", NAND: "(A·B)'", NOR: "(A + B)'", XOR: 'A ⊕ B', XNOR: "(A ⊕ B)'" };
  function gateOut(g, a, b) { return g === 'NOT' ? 1 - a : CAI.gen.GATE[g]([a, b]); }

  CAI.ui.gateSVG = function (g, a, b, out) {
    const w = (on, d) => `<path class="wire ${on ? 'on' : ''}" d="${d}"/>`;
    const bubble = ['NAND', 'NOR', 'XNOR', 'NOT'].includes(g);
    const base = g.replace(/^N(?!OT)/, '').replace('XN', 'X');
    let body = '';
    let outX = 108;
    if (g === 'NOT') { body = '<path class="body" d="M42 12 L98 35 L42 58 Z"/>'; outX = 98; }
    else if (base === 'AND') { body = '<path class="body" d="M40 8 H80 A27 27 0 0 1 80 62 H40 Z"/>'; outX = 107; }
    else { body = '<path class="body" d="M36 8 Q72 8 108 35 Q72 62 36 62 Q52 35 36 8 Z"/>' + (base === 'XOR' || g === 'XNOR' ? '<path class="body" style="fill:none" d="M28 8 Q44 35 28 62"/>' : ''); outX = 108; }
    const bx = outX + 5;
    const inputs = g === 'NOT' ? w(a, 'M0 35 H44') : w(a, 'M0 22 H46') + w(b, 'M0 48 H46');
    return `<svg class="gate-svg" viewBox="0 0 160 70" role="img" aria-label="${g} gate">${inputs}${w(out, `M${bubble ? bx + 5 : outX} 35 H160`)}${body}${bubble ? `<circle class="bubble" cx="${bx}" cy="35" r="5"/>` : ''}</svg>`;
  };

  function gateTool(root) {
    const st = { A: 0, B: 1 };
    root.innerHTML = `
      <div class="card"><div class="card-head"><h3>Basic gates</h3><div class="row" id="g-inputs"></div></div><div class="grid cols-4" id="g-grid"></div></div>
      <div class="card"><h3>Circuit from an expression</h3>
        <div class="row"><input type="text" id="ge-in" class="mono" value="(A + B)'C XOR D" style="flex:1;min-width:240px" aria-label="Expression"><button class="btn primary" id="ge-go">Build</button></div>
        <div id="ge-out" style="margin-top:12px"></div></div>
      <div class="card"><h3>Building blocks</h3>
        <div class="tabs" id="bb-tabs">${['Half adder', 'Full adder', '4:1 MUX', '2:4 Decoder', 'SR latch', 'D flip-flop', 'JK flip-flop', 'T flip-flop'].map((x, i) => `<button data-bb="${i}" class="${i ? '' : 'active'}">${x}</button>`).join('')}</div><div id="bb"></div></div>`;

    const sw = (name, v, key) => `<span class="input-switch">${name}<button class="toggle ${v ? 'on' : ''}" data-key="${key}" aria-pressed="${!!v}" aria-label="toggle ${name}"></button>${v}</span>`;

    const drawBasic = () => {
      $('#g-inputs', root).innerHTML = sw('A', st.A, 'A') + sw('B', st.B, 'B');
      $('#g-grid', root).innerHTML = GATES.map((g) => {
        const o = gateOut(g, st.A, st.B);
        const rows = g === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
        const cur = (r) => (g === 'NOT' ? r[0] === st.A : r[0] === st.A && r[1] === st.B);
        return `<div class="card gate-card"><div class="gname">${g} <span class="lamp ${o ? 'on' : ''}">${o}</span></div>${CAI.ui.gateSVG(g, st.A, st.B, o)}<div class="gexpr">Y = ${GEXPR[g]}</div>
          <table class="work mono mini-tt"><tr>${g === 'NOT' ? '<th>A</th>' : '<th>A</th><th>B</th>'}<th>Y</th></tr>${rows.map((r) => `<tr class="${cur(r) ? 'cur' : ''}">${r.map((x) => `<td>${x}</td>`).join('')}<td>${g === 'NOT' ? 1 - r[0] : gateOut(g, r[0], r[1])}</td></tr>`).join('')}</table></div>`;
      }).join('');
      $$('#g-inputs .toggle', root).forEach((b) => (b.onclick = () => { st[b.dataset.key] ^= 1; drawBasic(); }));
    };
    drawBasic();

    /* expression circuit */
    const env = {};
    const drawExpr = () => {
      const out = $('#ge-out', root);
      const r = B.tryParse($('#ge-in', root).value);
      if (r.error) { out.innerHTML = `<div class="feedback warn">⚠ ${esc(r.error)}</div>`; return; }
      const vars = B.vars(r.ast);
      vars.forEach((v) => { if (env[v] == null) env[v] = 0; });
      const y = B.evaluate(r.ast, env);
      const subs = B.subexprs(r.ast);
      out.innerHTML = `<div class="row">${vars.map((v) => sw(v, env[v], v)).join('')}<span class="spacer"></span><b>F =</b><span class="lamp ${y ? 'on' : ''}" style="width:40px;height:40px;font-size:1.1rem">${y}</span></div>
        <div class="tree" style="margin-top:12px"><div class="muted small">Every gate in the circuit (inner → outer):</div>${subs.map((s) => { const v = B.evaluate(s.node, env); return `<div class="node"><span class="val ${v ? 'on' : ''}">${v}</span>${esc(s.str)}</div>`; }).join('')}</div>`;
      $$('.toggle', out).forEach((b) => (b.onclick = () => { env[b.dataset.key] ^= 1; drawExpr(); }));
    };
    $('#ge-go', root).onclick = drawExpr;
    $('#ge-in', root).addEventListener('keydown', (e) => { if (e.key === 'Enter') drawExpr(); });
    drawExpr();

    /* building blocks */
    const bb = { i: 0, in: {}, Q: 0, hist: [] };
    const blocks = [
      { name: 'Half adder', ins: ['A', 'B'], f: (x) => ({ S: x.A ^ x.B, C: x.A & x.B }), eq: 'S = A ⊕ B · C = AB' },
      { name: 'Full adder', ins: ['A', 'B', 'Cin'], f: (x) => ({ S: x.A ^ x.B ^ x.Cin, Cout: (x.A & x.B) | (x.Cin & (x.A ^ x.B)) }), eq: 'S = A ⊕ B ⊕ Cin · Cout = AB + Cin(A ⊕ B)' },
      { name: '4:1 MUX', ins: ['I0', 'I1', 'I2', 'I3', 'S1', 'S0'], f: (x) => ({ Y: x['I' + (x.S1 * 2 + x.S0)] }), eq: "Y = S1'S0'I0 + S1'S0I1 + S1S0'I2 + S1S0I3", note: (x) => `Select S1S0 = ${x.S1}${x.S0} → passes I${x.S1 * 2 + x.S0}` },
      { name: '2:4 Decoder', ins: ['EN', 'A1', 'A0'], f: (x) => { const k = x.A1 * 2 + x.A0; return { D0: +(x.EN && k === 0), D1: +(x.EN && k === 1), D2: +(x.EN && k === 2), D3: +(x.EN && k === 3) }; }, eq: "D0 = EN·A1'A0' · D1 = EN·A1'A0 · D2 = EN·A1A0' · D3 = EN·A1A0" },
      { name: 'SR latch (NOR)', seq: 'latch', ins: ['S', 'R'], next: (q, x) => (x.S && x.R ? 'X' : x.S ? 1 : x.R ? 0 : q), eq: "Q⁺ = S + R'Q (S = R = 1 forbidden)" },
      { name: 'D flip-flop', seq: 'ff', ins: ['D'], next: (q, x) => x.D, eq: 'Q⁺ = D at the rising edge' },
      { name: 'JK flip-flop', seq: 'ff', ins: ['J', 'K'], next: (q, x) => (x.J && x.K ? 1 - q : x.J ? 1 : x.K ? 0 : q), eq: "Q⁺ = JQ' + K'Q" },
      { name: 'T flip-flop', seq: 'ff', ins: ['T'], next: (q, x) => q ^ x.T, eq: 'Q⁺ = T ⊕ Q' },
    ];
    const lamps = (o) => Object.entries(o).map(([k, v]) => `<span class="input-switch">${k}<span class="lamp ${v === 1 ? 'on' : ''}">${v}</span></span>`).join('');
    const drawBB = () => {
      const blk = blocks[bb.i];
      blk.ins.forEach((k) => { if (bb.in[k] == null) bb.in[k] = 0; });
      const box = $('#bb', root);
      if (!blk.seq) {
        const o = blk.f(bb.in);
        box.innerHTML = `<div class="row">${blk.ins.map((k) => sw(k, bb.in[k], k)).join('')}<span style="font-size:1.4rem">→</span>${lamps(o)}</div>
          <p class="mono small" style="margin-top:12px">${blk.eq}</p>${blk.note ? `<p class="small muted">${blk.note(bb.in)}</p>` : ''}`;
      } else {
        const latch = blk.seq === 'latch';
        if (latch) { const nq = blk.next(bb.Q, bb.in); if (nq !== bb.Q) { bb.Q = nq; bb.hist.push(nq); } }
        const q = bb.Q;
        box.innerHTML = `<div class="row">${blk.ins.map((k) => sw(k, bb.in[k], k)).join('')}
            ${latch ? '' : '<button class="btn primary" id="clk">⏫ Clock edge</button>'}<button class="btn small" id="rst">Reset Q = 0</button>
            <span class="spacer"></span>${lamps({ Q: q === 'X' ? 0 : q, "Q'": q === 'X' ? 0 : 1 - q })}</div>
          ${q === 'X' ? '<div class="feedback warn" style="margin-top:10px">⚠ S = R = 1 is forbidden: both NOR outputs are forced to 0, so Q = Q\' = 0. Releasing both inputs together leaves the latch in an unpredictable state.</div>' : ''}
          <p class="mono small" style="margin-top:12px">${blk.eq}</p>
          <p class="small muted">${latch ? 'A latch reacts immediately while you toggle its inputs (level-sensitive).' : 'A flip-flop ignores its inputs until you press “Clock edge” (edge-triggered).'}</p>
          <div class="small muted">History of Q:</div><div class="timeline">${bb.hist.slice(-28).map((v, i) => `<div class="tick"><div class="bar ${v === 1 ? 'on' : ''}" style="height:${v === 1 ? 30 : 8}px"></div>${v}</div>`).join('') || '<span class="muted">—</span>'}</div>`;
        const clk = $('#clk', box);
        if (clk) clk.onclick = () => { bb.Q = blk.next(bb.Q, bb.in); bb.hist.push(bb.Q); drawBB(); };
        $('#rst', box).onclick = () => { bb.Q = 0; bb.hist = []; blk.ins.forEach((k) => (bb.in[k] = 0)); drawBB(); };
      }
      $$('#bb .toggle', root).forEach((b) => (b.onclick = () => { bb.in[b.dataset.key] ^= 1; drawBB(); }));
    };
    $$('#bb-tabs button', root).forEach((b) => (b.onclick = () => {
      $$('#bb-tabs button', root).forEach((x) => x.classList.remove('active'));
      b.classList.add('active'); bb.i = +b.dataset.bb; bb.in = {}; bb.Q = 0; bb.hist = []; drawBB();
    }));
    drawBB();
  }
})();
