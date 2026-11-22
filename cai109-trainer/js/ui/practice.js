/* Practice: per-module problem sets and endless random generators. */
(function () {
  const CAI = window.CAI;
  const { esc, $, $$ } = CAI.util;
  const S = CAI.store;
  const strip = (html) => { const d = document.createElement('div'); d.innerHTML = html; d.querySelectorAll('table').forEach((t) => t.remove()); return d.textContent.trim(); };
  CAI.ui.strip = strip;

  /* Module practice set */
  CAI.ui.practiceModule = function (main, mid, qi) {
    const m = CAI.findModule(mid);
    if (!m) return CAI.ui.notFound(main);
    let cur = qi != null ? +qi : Math.max(0, m.bank.findIndex((p) => !S.isSolved(p.id)));
    if (!m.bank[cur]) cur = 0;
    S.setLast(`#/practice/${mid}`, `${m.title} · practice set`);

    main.innerHTML = `
      <div class="crumbs"><a href="#/">Dashboard</a> › <a href="#/module/${mid}">${m.num}. ${esc(m.title)}</a> › Practice</div>
      <div class="page-head"><div><h1>Practice — ${esc(m.title)}</h1><p>Solve each one yourself. Hints are there if you need them.</p></div>
        <a class="btn" href="#/practice">🎲 All generators</a></div>
      <div class="grid" style="grid-template-columns: 280px 1fr; align-items:start">
        <div class="card"><h3>Problems</h3><div class="problem-list" id="plist"></div>
          <h3 style="margin-top:16px">More random ones</h3>
          <div class="problem-list">${m.generators.map((g) => `<button data-gen="${g}"><span>🎲</span><span class="pl-text">${esc(CAI.gen.defs[g].label)}</span></button>`).join('')}</div></div>
        <div class="card" id="pbody"></div>
      </div>`;

    const list = $('#plist', main);
    const drawList = () => {
      list.innerHTML = m.bank.map((p, i) => `<button data-i="${i}" class="${i === cur ? 'active' : ''}"><span>${S.isSolved(p.id) ? '✅' : '⬜'}</span><span class="pl-text">${i + 1}. ${esc(strip(p.prompt))}</span></button>`).join('');
      $$('button', list).forEach((b) => (b.onclick = () => { cur = +b.dataset.i; drawList(); show(); }));
    };
    const body = $('#pbody', main);
    const show = () => {
      const p = m.bank[cur];
      body.innerHTML = `<div class="card-head"><span class="chip">Problem ${cur + 1} of ${m.bank.length}</span>${S.isSolved(p.id) ? '<span class="chip ok">✓ solved before</span>' : ''}</div><div id="pw"></div>
        <div class="lesson-nav" style="margin-top:14px"><button class="btn small" id="pprev" ${cur === 0 ? 'disabled' : ''}>← Previous</button><button class="btn small" id="pnext">${cur < m.bank.length - 1 ? 'Next →' : 'Back to module'}</button></div>`;
      CAI.ui.problem($('#pw', body), p, { source: 'practice', onSolved: () => { drawList(); CAI.app.refreshChrome(); } });
      $('#pprev', body).onclick = () => { cur--; drawList(); show(); };
      $('#pnext', body).onclick = () => { if (cur < m.bank.length - 1) { cur++; drawList(); show(); } else location.hash = `#/module/${mid}`; };
    };
    $$('[data-gen]', main).forEach((b) => (b.onclick = () => (location.hash = `#/gen/${b.dataset.gen}`)));
    drawList();
    show();
  };

  /* Hub listing every generator */
  CAI.ui.practiceHub = function (main) {
    main.innerHTML = `<div class="page-head"><div><h1>🎲 Practice generator</h1><p>Unlimited fresh problems. Pick a skill — every problem has hints, step checks and a full solution.</p></div>
      <button class="btn primary" id="mixed">🔀 Mixed numeric drill</button></div>
      ${CAI.modules.map((m) => `<div class="card"><h3>${m.icon} ${m.num}. ${esc(m.title)}</h3>
        <div class="gen-grid">${m.generators.map((g) => `<a class="btn" href="#/gen/${g}"><span>${esc(CAI.gen.defs[g].label)}</span><span class="muted small">${S.state.genSolved[g] || 0} ✓</span></a>`).join('')}</div></div>`).join('')}`;
    $('#mixed', main).onclick = () => (location.hash = '#/gen/mixed');
  };

  const MIXED = ['dec2bin', 'bin2dec', 'dec2hex', 'bin2hex', 'hex2bin', 'dec2twos', 'twos2dec', 'bin2gray', 'hammingEnc', 'hammingDec', 'crc', 'ieeeEnc', 'ieeeDec', 'ttColumn', 'kmap', 'exprToMinterms'];

  /* Endless generator page */
  CAI.ui.generator = function (main, gid) {
    const mixed = gid === 'mixed';
    const d = CAI.gen.defs[gid];
    if (!mixed && !d) return CAI.ui.notFound(main);
    const mod = d && CAI.findModule(d.module);
    S.setLast(`#/gen/${gid}`, mixed ? 'Mixed numeric drill' : `${d.label} (random practice)`);
    let streak = 0, count = 0;
    main.innerHTML = `
      <div class="crumbs"><a href="#/">Dashboard</a> › <a href="#/practice">Practice generator</a>${mod ? ` › <a href="#/module/${mod.id}">${esc(mod.title)}</a>` : ''}</div>
      <div class="page-head"><div><h1>${mixed ? '🔀 Mixed numeric drill' : '🎲 ' + esc(d.label)}</h1><p>${mixed ? 'A random skill from conversions, codes, IEEE 754, truth tables and K-maps each time.' : 'A fresh random problem every time.'}</p></div>
        <div class="row"><span class="chip" id="cnt">0 solved this session</span><span class="chip ok" id="streak">🔥 streak 0</span></div></div>
      <div class="card"><div id="gw"></div><div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn primary" id="gnew">New problem →</button></div></div>`;
    const next = () => {
      const id = mixed ? CAI.util.pick(MIXED) : gid;
      const p = CAI.gen.make(id);
      $('#gw', main).innerHTML = '';
      const tag = mixed ? `<div class="chip primary" style="margin-bottom:8px">${esc(CAI.gen.defs[id].label)}</div>` : '';
      $('#gw', main).insertAdjacentHTML('beforeend', tag + '<div id="gw2"></div>');
      CAI.ui.problem($('#gw2', main), p, {
        source: 'generator',
        onSolved: (first) => { count++; streak = first ? streak + 1 : 0; $('#cnt', main).textContent = `${count} solved this session`; $('#streak', main).textContent = `🔥 streak ${streak}`; },
        onWrong: () => { streak = 0; $('#streak', main).textContent = '🔥 streak 0'; },
      });
    };
    $('#gnew', main).onclick = next;
    next();
  };
})();
