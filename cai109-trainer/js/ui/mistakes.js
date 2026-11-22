/* Mistakes page: everything answered wrong, ready to retry. */
(function () {
  const CAI = window.CAI;
  const { esc, $, $$ } = CAI.util;
  const S = CAI.store;
  const SRC = { lesson: 'Lesson', practice: 'Practice set', generator: 'Random practice', quiz: 'Quiz', blanks: 'Fill in the blanks', mistakes: 'Retry' };

  CAI.ui.mistakes = function (main, filter = 'all') {
    const all = S.state.mistakes;
    const open = all.filter((m) => !m.resolved && (filter === 'all' || m.module === filter));
    const resolved = all.filter((m) => m.resolved && (filter === 'all' || m.module === filter));
    const mods = [...new Set(all.map((m) => m.module).filter(Boolean))];
    main.innerHTML = `<div class="page-head"><div><h1>🔁 Mistakes</h1><p>Every question you got wrong lands here. Solve it again to mark it as fixed.</p></div>
      <div class="row"><select id="mf"><option value="all">All modules</option>${CAI.modules.filter((m) => mods.includes(m.id)).map((m) => `<option value="${m.id}" ${filter === m.id ? 'selected' : ''}>${m.num}. ${esc(m.title)}</option>`).join('')}</select>
      ${open.length ? '<button class="btn primary" id="retry-all">▶ Retry all in a row</button>' : ''}</div></div>
      <div class="card" id="m-run" style="display:none"></div>
      <div class="card"><h3>To retry <span class="chip bad">${open.length}</span></h3>
        ${open.length ? open.map(item).join('') : '<div class="empty"><div class="big">🎉</div>No open mistakes here. Keep practising — wrong answers will show up for review.</div>'}</div>
      ${resolved.length ? `<details class="card"><summary><b>Fixed (${resolved.length})</b></summary>${resolved.map(item).join('')}<div class="row" style="margin-top:10px"><button class="btn small" id="clr">Clear fixed items</button></div></details>` : ''}`;

    function item(m) {
      const mod = m.module && CAI.findModule(m.module);
      return `<div class="mistake-item" data-key="${esc(m.key)}"><span>${m.resolved ? '✅' : '❌'}</span>
        <div class="mi-text"><div class="p">${esc(CAI.ui.strip(m.problem.prompt))}</div>
        <div class="small muted">${mod ? esc(mod.title) + ' · ' : ''}${SRC[m.source] || m.source} · wrong ${m.tries}× · ${new Date(m.added).toLocaleDateString()}</div></div>
        <button class="btn small js-retry">${m.resolved ? 'Practise again' : 'Retry'}</button><button class="btn small ghost js-del" title="Remove">✕</button></div>`;
    }

    $('#mf', main).onchange = (e) => CAI.ui.mistakes(main, e.target.value);
    const clr = $('#clr', main); if (clr) clr.onclick = () => { S.clearResolved(); CAI.ui.mistakes(main, filter); CAI.app.refreshChrome(); };
    $$('.mistake-item', main).forEach((row) => {
      const key = row.dataset.key;
      $('.js-del', row).onclick = () => { S.removeMistake(key); CAI.ui.mistakes(main, filter); CAI.app.refreshChrome(); };
      $('.js-retry', row).onclick = () => runQueue([all.find((x) => x.key === key)]);
    });
    const ra = $('#retry-all', main); if (ra) ra.onclick = () => runQueue(open.slice());

    function runQueue(queue) {
      const box = $('#m-run', main);
      box.style.display = 'block';
      let i = 0;
      const show = () => {
        if (i >= queue.length) { box.innerHTML = '<div class="empty"><div class="big">✅</div>Done with this round!</div><div class="row" style="justify-content:center"><button class="btn primary" id="m-back">Refresh list</button></div>'; $('#m-back', box).onclick = () => CAI.ui.mistakes(main, filter); return; }
        const m = queue[i];
        box.innerHTML = `<div class="card-head"><span class="chip">${i + 1} / ${queue.length}</span><button class="btn small ghost" id="m-close">Close</button></div><div id="m-w"></div>
          <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn" id="m-skip">${i < queue.length - 1 ? 'Skip →' : 'Finish'}</button></div>`;
        CAI.ui.problem($('#m-w', box), m.problem, {
          source: 'mistakes', logMistakes: false,
          onSolved: () => { S.resolveMistake(m.key); CAI.app.refreshChrome(); $('#m-skip', box).textContent = i < queue.length - 1 ? 'Next →' : 'Finish'; $('#m-skip', box).classList.add('primary'); },
          onWrong: () => { m.tries++; S.save(); },
        });
        $('#m-skip', box).onclick = () => { i++; show(); };
        $('#m-close', box).onclick = () => CAI.ui.mistakes(main, filter);
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      show();
    }
  };
})();
