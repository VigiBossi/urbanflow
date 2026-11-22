/* Lesson flow: intuition → formal rule → worked example (step-by-step) → your turn. */
(function () {
  const CAI = window.CAI;
  const { $, esc } = CAI.util;

  CAI.ui.lesson = function (main, mid, idx) {
    const mod = CAI.findModule(mid);
    if (!mod) return CAI.ui.notFound(main);
    idx = +idx;
    const L = mod.lessons[idx];
    if (!L) return CAI.ui.notFound(main);
    CAI.store.setLast(`#/lesson/${mid}/${idx}`, `${mod.title} · ${L.title}`);
    const done = CAI.store.lessonDone(L.id);
    const prev = idx > 0 ? `#/lesson/${mid}/${idx - 1}` : null;
    const next = idx < mod.lessons.length - 1 ? `#/lesson/${mid}/${idx + 1}` : `#/practice/${mid}`;
    const ex = L.example;

    main.innerHTML = `
      <div class="crumbs"><a href="#/">Dashboard</a> › <a href="#/module/${mid}">${mod.num}. ${esc(mod.title)}</a> › Lesson ${idx + 1} of ${mod.lessons.length}</div>
      <div class="page-head">
        <div><h1>${esc(L.title)}</h1><p>⏱ about ${L.minutes} minutes ${done ? '· <span class="chip ok">✓ completed</span>' : ''}</p></div>
        <div class="row">${prev ? `<a class="btn small" href="${prev}">← Previous</a>` : ''}<a class="btn small" href="${next}">${idx < mod.lessons.length - 1 ? 'Next lesson →' : 'Module practice →'}</a></div>
      </div>

      <section class="card lesson-section"><div class="sec-label">💡 1 · The intuition</div>${L.intuition}</section>
      <section class="card lesson-section"><div class="sec-label">📐 2 · The rule</div>${L.rule}</section>

      <section class="card lesson-section" id="ex-sec">
        <div class="sec-label">🧑‍🏫 3 · Worked example</div>
        <div class="example-prompt">${ex.prompt}</div>
        <ol class="steps" id="ex-steps"></ol>
        <div id="ex-answer"></div>
        <div class="row"><button class="btn primary" id="ex-next">Next step →</button><span class="muted small" id="ex-count">0 / ${ex.steps.length} steps</span><span class="spacer"></span><button class="btn small ghost" id="ex-all">Show all steps</button></div>
      </section>

      <section class="card lesson-section ${done ? '' : 'locked'}" id="try-sec">
        <div class="sec-label">✍️ 4 · Your turn — a very similar problem</div>
        <div id="try-gate" class="${done ? 'hidden' : ''}"><p class="muted">Walk through the worked example first, then try this one on your own.</p><button class="btn small" id="try-skip">I’m ready — show the problem</button></div>
        <div id="try-body" class="${done ? '' : 'hidden'}"></div>
        <div id="try-done" class="hidden"></div>
      </section>`;

    /* worked example, revealed step by step */
    let shown = 0;
    const stepsEl = $('#ex-steps', main);
    const reveal = () => {
      if (shown >= ex.steps.length) return;
      const s = ex.steps[shown++];
      stepsEl.insertAdjacentHTML('beforeend', `<li><div class="st-title">${s.title}</div>${s.html}</li>`);
      $('#ex-count', main).textContent = `${shown} / ${ex.steps.length} steps`;
      if (shown === ex.steps.length) {
        $('#ex-answer', main).innerHTML = `<div class="answer-box">✅ <b>Answer:</b> ${ex.answer}</div>`;
        $('#ex-next', main).classList.add('hidden');
        $('#ex-all', main).classList.add('hidden');
        unlock();
      }
    };
    $('#ex-next', main).onclick = reveal;
    $('#ex-all', main).onclick = () => { while (shown < ex.steps.length) reveal(); };

    let mounted = false;
    function unlock() {
      $('#try-sec', main).classList.remove('locked');
      $('#try-gate', main).classList.add('hidden');
      $('#try-body', main).classList.remove('hidden');
      if (!mounted) mount(L.practice);
    }
    $('#try-skip', main).onclick = unlock;

    function mount(problem) {
      mounted = true;
      CAI.ui.problem($('#try-body', main), problem, {
        source: 'lesson',
        autofocus: false,
        onSolved: () => {
          CAI.store.markLesson(L.id);
          CAI.app.refreshChrome();
          const d = $('#try-done', main);
          d.classList.remove('hidden');
          d.innerHTML = `<div class="lesson-nav"><div class="row">
              ${L.more ? '<button class="btn" id="try-more">🎲 Another one like this</button>' : ''}
            </div><a class="btn primary" href="${next}">${idx < mod.lessons.length - 1 ? 'Next lesson →' : 'Go to module practice →'}</a></div>`;
          const more = $('#try-more', main);
          if (more) more.onclick = () => { d.classList.add('hidden'); mount(CAI.gen.make(L.more)); $('#try-body', main).scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        },
      });
    }
    if (done) mount(L.practice);
  };
})();
