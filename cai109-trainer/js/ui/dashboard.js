/* Dashboard, module list and module overview pages. */
(function () {
  const CAI = window.CAI;
  const { esc, $ } = CAI.util;
  const S = CAI.store;
  const pct = (x) => Math.round(x * 100);

  function overall() {
    let done = 0, total = 0;
    CAI.modules.forEach((m) => { const p = S.moduleProgress(m); done += p.doneL + p.doneB; total += p.lessons + p.bank; });
    return { done, total, pct: done / Math.max(1, total) };
  }
  CAI.overallProgress = overall;

  /* Where to continue: last visited page, otherwise the first unfinished lesson */
  function nextLesson() {
    for (const m of CAI.modules) for (let i = 0; i < m.lessons.length; i++) if (!S.lessonDone(m.lessons[i].id)) return { route: `#/lesson/${m.id}/${i}`, label: `${m.title} · ${m.lessons[i].title}` };
    return { route: '#/exam', label: 'All lessons done — exam prep' };
  }

  function moduleCard(m) {
    const p = S.moduleProgress(m);
    return `<a class="card module-card" href="#/module/${m.id}" style="color:inherit;text-decoration:none">
      <div class="top"><div class="module-icon">${m.icon}</div><div><h3>${m.num}. ${esc(m.title)}</h3><p>${esc(m.summary)}</p></div></div>
      <div class="foot"><div class="progress thin"><i style="width:${pct(p.pct)}%"></i></div><span>${pct(p.pct)}%</span></div>
      <div class="foot"><span>📖 ${p.doneL}/${p.lessons} lessons</span><span>✍️ ${p.doneB}/${p.bank} problems</span></div></a>`;
  }

  CAI.ui.dashboard = function (main) {
    const o = overall();
    const st = S.state;
    const last = st.last;
    const nl = nextLesson();
    const open = S.openMistakes().length;
    const quizVals = Object.values(st.quiz);
    const quizAvg = quizVals.length ? pct(quizVals.reduce((a, q) => a + q.best, 0) / quizVals.length) + '%' : '—';
    const acc = st.stats.correct + st.stats.wrong ? pct(st.stats.correct / (st.stats.correct + st.stats.wrong)) + '%' : '—';

    main.innerHTML = `
      <section class="card hero">
        <div>
          <h1>CAI 109 – Logical Circuits</h1>
          <p>${o.done ? `You have completed ${o.done} of ${o.total} lessons and practice problems.` : 'Welcome! Start with Module 1 — each lesson takes 5–10 minutes.'}</p>
          <div class="progress"><i style="width:${pct(o.pct)}%"></i></div>
          <div class="row" style="margin-top:16px">
            <a class="btn big" href="${last ? last.route : nl.route}">▶ ${last ? 'Continue where I left off' : 'Start learning'}</a>
            <span class="small" style="opacity:.9">${esc(last ? last.label : nl.label)}</span>
          </div>
        </div>
        <svg class="ring" viewBox="0 0 120 120" aria-label="Overall progress ${pct(o.pct)}%">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="12"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 50 * o.pct).toFixed(1)} 400" transform="rotate(-90 60 60)"/>
          <text x="60" y="68" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">${pct(o.pct)}%</text>
        </svg>
      </section>

      <div class="grid cols-4">
        <div class="card stat"><b>${Object.keys(st.lessons).length}</b><span>lessons completed</span></div>
        <div class="card stat"><b>${st.stats.correct}</b><span>problems solved · ${acc} accuracy</span></div>
        <a class="card stat" href="#/mistakes" style="color:inherit;text-decoration:none"><b style="color:${open ? 'var(--bad)' : 'var(--ok)'}">${open}</b><span>mistakes to retry →</span></a>
        <div class="card stat"><b>${quizAvg}</b><span>average best quiz score</span></div>
      </div>

      ${last && last.route !== nl.route ? `<div class="card row"><span>📌 Next new lesson: <b>${esc(nl.label)}</b></span><span class="spacer"></span><a class="btn small" href="${nl.route}">Open</a></div>` : ''}

      <div class="card-head"><h2>Modules</h2><a href="#/modules" class="small">List view →</a></div>
      <div class="grid cols-3">${CAI.modules.map(moduleCard).join('')}</div>

      <div class="card-head" style="margin-top:26px"><h2>Quick tools</h2></div>
      <div class="grid cols-4">
        <a class="card stat" href="#/tools/convert" style="color:inherit;text-decoration:none"><b>🔢</b><span>Base converter with working</span></a>
        <a class="card stat" href="#/tools/truth" style="color:inherit;text-decoration:none"><b>📋</b><span>Truth table generator</span></a>
        <a class="card stat" href="#/tools/kmap" style="color:inherit;text-decoration:none"><b>🗺️</b><span>Clickable K-map solver</span></a>
        <a class="card stat" href="#/tools/gates" style="color:inherit;text-decoration:none"><b>🔌</b><span>Logic gate simulator</span></a>
      </div>

      <details class="card" style="margin-top:20px"><summary><b>⚙️ Settings &amp; backup</b></summary>
        <div style="margin-top:12px">
          <label class="row"><input type="checkbox" id="set-bump" ${st.settings.speedBump ? 'checked' : ''}/> Ask “did you double-check the final step?” when I answer very quickly</label>
          <div class="row" style="margin-top:12px">
            <button class="btn small" id="exp">⬇ Export progress</button>
            <label class="btn small">⬆ Import progress<input type="file" id="imp" accept="application/json" hidden></label>
            <button class="btn small danger" id="reset">Reset all progress</button>
          </div>
          <div id="exp-box" hidden style="margin-top:10px"><textarea id="exp-text" class="input-wide mono" rows="5" readonly aria-label="Progress backup"></textarea>
            <div class="row" style="margin-top:6px"><button class="btn small" id="exp-copy">Copy</button><span class="small muted">Paste this into a file named cai109-progress.json to keep a backup.</span></div></div>
          <p class="small muted" style="margin-top:8px">Progress is saved automatically in this browser (localStorage). Export it to move it to another computer.</p>
        </div></details>`;

    $('#set-bump', main).onchange = (e) => S.setSetting('speedBump', e.target.checked);
    $('#exp', main).onclick = () => {
      const box = $('#exp-box', main);
      box.hidden = false;
      const ta = $('#exp-text', main);
      ta.value = S.exportJSON();
      ta.select();
    };
    $('#exp-copy', main).onclick = () => {
      const ta = $('#exp-text', main);
      const done = () => CAI.util.toast('Copied — paste it into a .json file to keep it', 'ok');
      const fallback = () => { ta.select(); CAI.util.toast('Press Ctrl+C to copy the selected text'); };
      try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); }
    };
    $('#imp', main).onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { S.importJSON(t); CAI.util.toast('Progress imported', 'ok'); CAI.app.render(); } catch (err) { CAI.util.toast('That file is not a valid progress backup.'); } });
    };
    let armed = null;
    $('#reset', main).onclick = (e) => {
      const b = e.currentTarget;
      if (armed) { clearTimeout(armed); S.reset(); CAI.app.render(); CAI.util.toast('All progress deleted'); return; }
      b.textContent = 'Click again to delete everything';
      armed = setTimeout(() => { armed = null; b.textContent = 'Reset all progress'; }, 4000);
    };
  };

  CAI.ui.modules = function (main) {
    main.innerHTML = `<div class="page-head"><div><h1>Modules</h1><p>Work through them in order — each builds on the one before.</p></div></div>
      ${CAI.modules.map((m) => {
        const p = S.moduleProgress(m);
        return `<div class="card"><div class="card-head"><h2><span class="module-icon">${m.icon}</span>${m.num}. ${esc(m.title)}</h2><a class="btn small" href="#/module/${m.id}">Open</a></div>
          <p class="muted">${esc(m.summary)}</p>
          <div class="row">${m.lessons.map((l, i) => `<a class="chip ${S.lessonDone(l.id) ? 'ok' : ''}" href="#/lesson/${m.id}/${i}">${S.lessonDone(l.id) ? '✓' : i + 1 + '.'} ${esc(l.title)}</a>`).join('')}</div>
          <div class="row" style="margin-top:10px"><div class="progress thin" style="flex:1"><i style="width:${pct(p.pct)}%"></i></div><span class="small muted">${pct(p.pct)}%</span></div></div>`;
      }).join('')}`;
  };

  CAI.ui.module = function (main, mid) {
    const m = CAI.findModule(mid);
    if (!m) return CAI.ui.notFound(main);
    const p = S.moduleProgress(m);
    const firstOpen = m.lessons.findIndex((l) => !S.lessonDone(l.id));
    const q = S.state.quiz[m.id];
    main.innerHTML = `
      <div class="crumbs"><a href="#/">Dashboard</a> › Module ${m.num}</div>
      <div class="page-head"><div><h1>${m.icon} ${m.num}. ${esc(m.title)}</h1><p>${esc(m.summary)}</p></div>
        <a class="btn primary" href="${firstOpen >= 0 ? `#/lesson/${m.id}/${firstOpen}` : `#/practice/${m.id}`}">${firstOpen >= 0 ? (firstOpen === 0 && !p.doneL ? '▶ Start lesson 1' : `▶ Continue with lesson ${firstOpen + 1}`) : '▶ Practise'}</a></div>
      <div class="card"><div class="row"><b>Module progress</b><span class="spacer"></span><span class="muted small">${p.doneL}/${p.lessons} lessons · ${p.doneB}/${p.bank} practice problems</span></div>
        <div class="progress" style="margin-top:8px"><i style="width:${pct(p.pct)}%"></i></div></div>
      <div class="grid cols-2">
        <div class="card"><h2>📖 Lessons</h2>
          <div class="problem-list">${m.lessons.map((l, i) => `<button onclick="location.hash='#/lesson/${m.id}/${i}'"><span>${S.lessonDone(l.id) ? '✅' : '⬜'}</span><span class="pl-text">${i + 1}. ${esc(l.title)}</span><span class="muted small">${l.minutes} min</span></button>`).join('')}</div></div>
        <div class="card"><h2>✍️ Practice</h2>
          <p class="muted">${m.bank.length} hand-picked problems plus unlimited random ones.</p>
          <div class="row"><a class="btn" href="#/practice/${m.id}">Practice set (${p.doneB}/${p.bank})</a></div>
          <h3 style="margin-top:16px">🎲 Random generators</h3>
          <div class="row">${m.generators.map((g) => `<a class="chip primary" href="#/gen/${g}">${esc(CAI.gen.defs[g].label)}</a>`).join('')}</div></div>
      </div>
      <div class="card"><h2>📝 Exam prep</h2>
        <div class="row"><a class="btn" href="#/exam/review/${m.id}">Review sheet</a><a class="btn" href="#/exam/blanks/${m.id}">Fill in the blanks</a><a class="btn" href="#/exam/quiz/${m.id}">Timed quiz</a>
        <span class="spacer"></span>${q ? `<span class="chip ${q.best >= 0.8 ? 'ok' : ''}">Best quiz: ${pct(q.best)}%</span>` : ''}</div></div>`;
  };
})();
