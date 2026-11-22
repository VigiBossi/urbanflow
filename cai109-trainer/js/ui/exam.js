/* Exam prep: review sheets, fill-in-the-blank definitions, timed multiple-choice quizzes. */
(function () {
  const CAI = window.CAI;
  const { esc, $, $$, shuffle } = CAI.util;
  const S = CAI.store;
  const pct = (x) => Math.round(x * 100);

  CAI.ui.examHub = function (main) {
    const all = S.state.quiz.all;
    main.innerHTML = `<div class="page-head"><div><h1>📝 Exam prep</h1><p>Condensed review sheets, definition drills and timed quizzes with full explanations.</p></div></div>
      <div class="card hero" style="grid-template-columns:1fr auto"><div><h2 style="margin:0">Full mock exam</h2><p>Mixed multiple-choice questions from all 11 modules, timed.</p></div>
        <div class="row"><a class="btn big" href="#/exam/quiz/all">Start mock exam</a>${all ? `<span class="small">Best: ${pct(all.best)}%</span>` : ''}</div></div>
      <div class="card"><table class="work" style="width:100%"><tr><th style="text-align:left">Module</th><th>Review sheet</th><th>Fill in the blanks</th><th>Timed quiz</th><th>Best quiz</th></tr>
      ${CAI.modules.map((m) => { const q = S.state.quiz[m.id]; const b = S.state.blanks[m.id]; return `<tr><td style="text-align:left">${m.icon} ${m.num}. ${esc(m.title)}</td>
        <td><a href="#/exam/review/${m.id}">Open</a></td><td><a href="#/exam/blanks/${m.id}">Drill</a>${b != null ? ` <span class="muted small">(${pct(b)}%)</span>` : ''}</td><td><a href="#/exam/quiz/${m.id}">Start</a></td>
        <td>${q ? `<span class="chip ${q.best >= 0.8 ? 'ok' : q.best < 0.5 ? 'bad' : ''}">${pct(q.best)}%</span>` : '<span class="muted">—</span>'}</td></tr>`; }).join('')}</table></div>`;
  };

  const examTabs = (m, active) => `<div class="crumbs"><a href="#/exam">Exam prep</a> › ${m.num}. ${esc(m.title)}</div>
    <div class="page-head"><div><h1>${m.icon} ${esc(m.title)}</h1></div><a class="btn small" href="#/module/${m.id}">Module page</a></div>
    <div class="tabs">${[['review', '📄 Review sheet'], ['blanks', '✏️ Fill in the blanks'], ['quiz', '⏱ Timed quiz']].map(([k, l]) => `<a href="#/exam/${k}/${m.id}" class="${k === active ? 'active' : ''}">${l}</a>`).join('')}</div>`;

  CAI.ui.review = function (main, mid) {
    const m = CAI.findModule(mid); if (!m) return CAI.ui.notFound(main);
    S.setLast(`#/exam/review/${mid}`, `${m.title} · review sheet`);
    main.innerHTML = `${examTabs(m, 'review')}<div class="card review-sheet">${m.review}</div>
      <div class="row"><span class="spacer"></span><a class="btn primary" href="#/exam/blanks/${mid}">Test yourself →</a></div>`;
  };

  /* ---------- fill in the blanks ---------- */
  const normBlank = (s) => String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[\s·*]/g, '').replace(/\.$/, '');
  CAI.ui.blanks = function (main, mid) {
    const m = CAI.findModule(mid); if (!m) return CAI.ui.notFound(main);
    S.setLast(`#/exam/blanks/${mid}`, `${m.title} · fill in the blanks`);
    const items = shuffle(m.blanks.map((b, i) => ({ ...b, i })));
    main.innerHTML = `${examTabs(m, 'blanks')}<div class="card"><p class="muted">Type the missing word or symbol. Spacing and capitals don’t matter.</p>
      ${items.map((b, k) => `<div class="blank-row" data-k="${k}"><span style="flex:1;min-width:260px">${k + 1}. ${esc(b.s).replace('___', '<b>_____</b>')}</span>
        <input type="text" autocomplete="off" spellcheck="false"/><button class="btn small ghost js-h" title="First letter">💡</button><span class="res"></span></div>`).join('')}
      <div class="row" style="margin-top:14px"><button class="btn primary" id="bl-check">Check answers</button><button class="btn" id="bl-again">Shuffle &amp; retry</button><span class="spacer"></span><b id="bl-score"></b></div></div>`;
    $$('.blank-row', main).forEach((row) => {
      const b = items[+row.dataset.k];
      $('.js-h', row).onclick = () => { $('.res', row).innerHTML = `<span class="muted">starts with “${esc(b.a[0][0])}” (${b.a[0].length} characters)</span>`; };
      $('input', row).addEventListener('keydown', (e) => { if (e.key === 'Enter') { const nx = row.nextElementSibling && $('input', row.nextElementSibling); if (nx) nx.focus(); else $('#bl-check', main).click(); } });
    });
    $('#bl-check', main).onclick = () => {
      let right = 0;
      $$('.blank-row', main).forEach((row) => {
        const b = items[+row.dataset.k];
        const v = $('input', row).value;
        const ok = v.trim() && b.a.some((a) => normBlank(a) === normBlank(v));
        if (ok) right++;
        $('.res', row).innerHTML = ok ? '<span style="color:var(--ok)">✓</span>' : `<span style="color:var(--bad)">✗ answer: <b>${esc(b.a[0])}</b></span>`;
        if (!ok) S.addMistake({ id: `blank:${mid}:${b.i}`, module: mid, source: 'blanks', prompt: `Fill in the blank: ${esc(b.s).replace('___', '<b>_____</b>')}`, format: 'A word or short phrase', answer: { type: 'text', value: b.a[0], alts: b.a.slice(1), loose: true }, hints: [`It starts with “${b.a[0][0]}”.`, `It has ${b.a[0].length} characters.`, `Check this module’s review sheet.`], steps: [], traps: [] }, 'blanks');
      });
      $('#bl-score', main).textContent = `${right} / ${items.length}`;
      S.recordBlanks(mid, right / items.length);
      CAI.app.refreshChrome();
    };
    $('#bl-again', main).onclick = () => CAI.ui.blanks(main, mid);
  };

  /* ---------- timed quiz ---------- */
  let timerHandle = null;
  CAI.stopTimers = () => { if (timerHandle) clearInterval(timerHandle); timerHandle = null; };

  CAI.ui.quiz = function (main, mid) {
    const all = mid === 'all';
    const m = all ? null : CAI.findModule(mid);
    if (!all && !m) return CAI.ui.notFound(main);
    const pool = all ? CAI.modules.flatMap((x) => x.quiz.map((q, i) => ({ ...q, mod: x.id, i }))) : m.quiz.map((q, i) => ({ ...q, mod: m.id, i }));
    const head = all ? `<div class="crumbs"><a href="#/exam">Exam prep</a> › Mock exam</div><div class="page-head"><div><h1>⏱ Mock exam</h1><p>Questions from every module.</p></div></div>` : examTabs(m, 'quiz');
    const counts = all ? [10, 20, 30] : [5, Math.min(10, pool.length), pool.length].filter((v, i, a) => a.indexOf(v) === i);
    main.innerHTML = `${head}<div class="card"><h3>Quiz settings</h3>
      <div class="row"><label class="row">Questions <select id="qz-n">${counts.map((c) => `<option value="${c}" ${c === counts[1] ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="row">Time per question <select id="qz-t"><option value="45">45 s</option><option value="75" selected>75 s</option><option value="120">2 min</option><option value="0">untimed</option></select></label>
      <span class="spacer"></span><button class="btn primary big" id="qz-start">Start quiz</button></div>
      <p class="small muted" style="margin-top:10px">You can move between questions and change answers until you submit. The answer key explains every question.</p></div>`;
    $('#qz-start', main).onclick = () => run(+$('#qz-n', main).value, +$('#qz-t', main).value);

    function run(n, perQ) {
      const qs = shuffle(pool).slice(0, n).map((q) => { const order = shuffle(q.o.map((_, i) => i)); return { ...q, order }; });
      const answers = Array(qs.length).fill(null);
      let cur = 0;
      let left = perQ * qs.length;
      const started = Date.now();
      main.innerHTML = `${head}<div class="card"><div class="quiz-top"><span class="chip primary" id="qz-pos"></span><span class="spacer"></span>${perQ ? '<span class="timer" id="qz-timer"></span>' : ''}<button class="btn small" id="qz-submit">Submit</button></div>
        <div id="qz-body"></div><div class="lesson-nav" style="margin-top:14px"><button class="btn" id="qz-prev">← Previous</button><button class="btn primary" id="qz-next">Next →</button></div>
        <div class="qnav" id="qz-nav" style="margin-top:16px"></div></div>`;
      const draw = () => {
        const q = qs[cur];
        $('#qz-pos', main).textContent = `Question ${cur + 1} / ${qs.length}`;
        $('#qz-body', main).innerHTML = `<div class="problem"><div class="prompt">${all ? `<span class="chip" style="margin-right:6px">${esc(CAI.findModule(q.mod).title)}</span>` : ''}${esc(q.q)}</div>
          <div class="choices">${q.order.map((oi, k) => `<button class="choice ${answers[cur] === oi ? 'selected' : ''}" data-oi="${oi}"><span class="key">${'ABCD'[k]}</span><span>${esc(q.o[oi])}</span></button>`).join('')}</div></div>`;
        $$('.choice', main).forEach((b) => (b.onclick = () => { answers[cur] = +b.dataset.oi; draw(); }));
        $('#qz-prev', main).disabled = cur === 0;
        $('#qz-next', main).textContent = cur === qs.length - 1 ? 'Review & submit' : 'Next →';
        $('#qz-nav', main).innerHTML = qs.map((_, i) => `<button class="${answers[i] != null ? 'answered' : ''} ${i === cur ? 'current' : ''}" data-i="${i}">${i + 1}</button>`).join('');
        $$('#qz-nav button', main).forEach((b) => (b.onclick = () => { cur = +b.dataset.i; draw(); }));
      };
      $('#qz-prev', main).onclick = () => { if (cur > 0) { cur--; draw(); } };
      $('#qz-next', main).onclick = () => { if (cur < qs.length - 1) { cur++; draw(); } else submit(); };
      $('#qz-submit', main).onclick = () => submit();
      const keyHandler = (e) => {
        if (!document.body.contains($('#qz-body', main) || document.createElement('x'))) { document.removeEventListener('keydown', keyHandler); return; }
        const k = 'abcd'.indexOf(e.key.toLowerCase());
        if (k >= 0 && qs[cur].order[k] != null) { answers[cur] = qs[cur].order[k]; draw(); }
        if (e.key === 'ArrowRight' && cur < qs.length - 1) { cur++; draw(); }
        if (e.key === 'ArrowLeft' && cur > 0) { cur--; draw(); }
      };
      document.addEventListener('keydown', keyHandler);
      if (perQ) {
        const tick = () => { left--; const t = $('#qz-timer', main); if (!t) { CAI.stopTimers(); return; } t.textContent = '⏱ ' + CAI.util.fmtTime(left); t.classList.toggle('low', left <= 30); if (left <= 0) submit(true); };
        CAI.stopTimers(); left++; tick(); timerHandle = setInterval(tick, 1000);
      }
      draw();

      let submitArmed = false;
      function submit(timeUp) {
        const unanswered = answers.filter((a) => a == null).length;
        if (!timeUp && unanswered && !submitArmed) {
          submitArmed = true;
          const btn = $('#qz-submit', main);
          btn.textContent = `${unanswered} unanswered — click to submit anyway`;
          btn.classList.add('primary');
          CAI.util.toast(`${unanswered} question${unanswered > 1 ? 's are' : ' is'} still unanswered`);
          return;
        }
        CAI.stopTimers();
        document.removeEventListener('keydown', keyHandler);
        const score = qs.filter((q, i) => answers[i] === q.a).length;
        S.recordQuiz(mid, score, qs.length);
        qs.forEach((q, i) => {
          if (answers[i] !== q.a) S.addMistake({ id: `quiz:${q.mod}:${q.i}`, module: q.mod, source: 'quiz', prompt: esc(q.q), choices: q.o, answer: { type: 'choice', value: q.a }, explain: esc(q.e), hints: [], steps: [], traps: [] }, 'quiz');
        });
        CAI.app.refreshChrome();
        const secs = Math.round((Date.now() - started) / 1000);
        main.innerHTML = `${head}<div class="card" style="text-align:center">${timeUp ? '<p class="chip bad">⏱ Time is up</p>' : ''}
          <div class="score-big" style="color:${score / qs.length >= 0.8 ? 'var(--ok)' : score / qs.length >= 0.5 ? 'var(--warn)' : 'var(--bad)'}">${score} / ${qs.length}</div>
          <p class="muted">${pct(score / qs.length)}% · ${CAI.util.fmtTime(secs)} · ${score === qs.length ? 'Perfect! 🎉' : 'Wrong answers were added to your Mistakes page.'}</p>
          <div class="row" style="justify-content:center"><button class="btn primary" id="qz-again">Try another quiz</button>${score < qs.length ? '<a class="btn" href="#/mistakes">Retry my mistakes</a>' : ''}</div></div>
          <div class="card"><h3>Answer key</h3>${qs.map((q, i) => { const ok = answers[i] === q.a; return `<div class="key-item ${ok ? '' : 'wrong'}"><b>${i + 1}. ${esc(q.q)}</b>
            <div>${ok ? '✅' : '❌'} Your answer: ${answers[i] == null ? '<i>none</i>' : esc(q.o[answers[i]])}${ok ? '' : ` · <b>Correct: ${esc(q.o[q.a])}</b>`}</div><div class="expl">💬 ${esc(q.e)}</div></div>`; }).join('')}</div>`;
        $('#qz-again', main).onclick = () => CAI.ui.quiz(main, mid);
      }
    }
  };
})();
