/* Interactive problem widget.
   CAI.ui.problem(container, problem, { onSolved(firstTry), source, logMistakes })
   - plain-text answers, normalised by CAI.check
   - up to 3 progressive hints, only on request
   - on a wrong answer: a diagnosis, a final-step reminder, and a "Check my steps"
     panel that pinpoints the first wrong step
   - "Show solution" appears after 2 wrong attempts */
(function () {
  const CAI = window.CAI;
  const { esc, $, $$ } = CAI.util;

  CAI.ui.problem = function (root, prob, opts = {}) {
    const st = { attempts: 0, hints: 0, shownAt: Date.now(), solved: false, bumped: false, logged: false };
    const isChoice = prob.answer.type === 'choice';
    const checkSteps = (prob.steps || []).filter((s) => s.value != null && s.ask);
    const letters = 'ABCDEFGH';
    const choiceOrder = isChoice ? (opts.shuffle === false ? prob.choices.map((_, i) => i) : CAI.util.shuffle(prob.choices.map((_, i) => i))) : [];

    root.innerHTML = `
      <div class="problem">
        <div class="prompt">${prob.prompt}</div>
        ${isChoice
          ? `<div class="choices">${choiceOrder.map((ci, k) => `<button class="choice" data-ci="${ci}"><span class="key">${letters[k]}</span><span>${esc(prob.choices[ci])}</span></button>`).join('')}</div>`
          : `${prob.format ? `<div class="format">Answer format: ${esc(prob.format)}</div>` : ''}
             <div class="answer-row">
               <input type="text" class="js-input" autocomplete="off" spellcheck="false" placeholder="Type your answer…" aria-label="Your answer" />
               <button class="btn primary js-check">Check</button>
             </div>`}
        <div class="row">
          ${(prob.hints || []).length ? `<button class="btn small js-hint">💡 Hint <span class="muted">(0/${prob.hints.length})</span></button>` : ''}
          ${checkSteps.length ? '<button class="btn small ghost js-steps hidden">🔍 Check my steps</button>' : ''}
          <button class="btn small ghost js-sol hidden">📖 Show solution</button>
          <span class="spacer"></span>
          <span class="muted small js-attempts"></span>
        </div>
        <ul class="hint-list"></ul>
        <div class="feedback" aria-live="polite"></div>
        <div class="stepcheck hidden"></div>
        <div class="solution hidden"></div>
      </div>`;

    const el = (s) => $(s, root);
    const input = el('.js-input');
    const fb = el('.feedback');
    const setFb = (kind, html) => { fb.className = 'feedback ' + kind; fb.innerHTML = html; };

    /* ---------- hints ---------- */
    const hintBtn = el('.js-hint');
    if (hintBtn) hintBtn.onclick = () => {
      if (st.hints >= prob.hints.length) return;
      st.hints++;
      el('.hint-list').insertAdjacentHTML('beforeend', `<li><b>Hint ${st.hints}:</b> ${prob.hints[st.hints - 1]}</li>`);
      hintBtn.innerHTML = `💡 Hint <span class="muted">(${st.hints}/${prob.hints.length})</span>`;
      if (st.hints >= prob.hints.length) hintBtn.disabled = true;
    };

    /* ---------- full solution ---------- */
    const showSolution = () => {
      const sol = el('.solution');
      const steps = (prob.steps || []).filter((s) => s.show);
      sol.innerHTML = `<div class="card" style="margin:0;box-shadow:none;background:var(--surface-2)">
        <h4>Worked solution</h4>
        ${steps.length ? `<ol class="steps solution-steps">${steps.map((s) => `<li><div class="st-title">${s.ask || ''}</div>${s.show}</li>`).join('')}</ol>` : ''}
        ${prob.explain ? `<p>${prob.explain}</p>` : ''}
        <div class="answer-box">Answer: <b class="mono">${esc(CAI.check.displayAnswer(prob))}</b></div></div>`;
      sol.classList.remove('hidden');
      el('.js-sol').classList.add('hidden');
      if (!st.solved && !st.logged && opts.logMistakes !== false) { CAI.store.addMistake(prob, opts.source); st.logged = true; }
    };
    el('.js-sol').onclick = showSolution;

    /* ---------- step-by-step check ---------- */
    const stepBtn = el('.js-steps');
    if (stepBtn) stepBtn.onclick = () => {
      const box = el('.stepcheck');
      if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return; }
      box.innerHTML = `<h4>Check my steps</h4><p class="small muted">Type what you got at each step (leave blank to skip). I’ll tell you the first step that goes wrong — without giving the answer away.</p>
        ${checkSteps.map((s, i) => `<div class="sc-row" data-i="${i}"><span class="num">${i + 1}</span><span>${s.ask}</span><input type="text" autocomplete="off" spellcheck="false" /><span class="mark"></span></div>`).join('')}
        <div class="row" style="margin-top:10px"><button class="btn small primary js-run-steps">Check these steps</button><span class="small js-sc-msg"></span></div>`;
      box.classList.remove('hidden');
      $('input', box).focus();
      $('.js-run-steps', box).onclick = () => {
        let firstBad = -1, filled = 0;
        $$('.sc-row', box).forEach((row) => {
          const i = +row.dataset.i; const v = $('input', row).value;
          row.classList.remove('good', 'badstep');
          $('.mark', row).textContent = '';
          const old = $('.reveal', row); if (old) old.remove();
          if (!v.trim()) return;
          filled++;
          if (CAI.check.stepMatches(checkSteps[i], v)) { row.classList.add('good'); $('.mark', row).textContent = '✓'; }
          else {
            $('.mark', row).textContent = '✗';
            if (firstBad < 0) {
              firstBad = i; row.classList.add('badstep');
              row.insertAdjacentHTML('beforeend', `<div class="reveal">This is where it goes wrong. <a href="#" class="js-reveal">Show this step</a></div>`);
              $('.js-reveal', row).onclick = (e) => { e.preventDefault(); e.target.parentElement.innerHTML = checkSteps[i].show || ('Expected: ' + esc(checkSteps[i].value)); };
            }
          }
        });
        const msg = $('.js-sc-msg', box);
        if (!filled) msg.textContent = 'Fill in at least one step.';
        else if (firstBad >= 0) msg.innerHTML = `<b style="color:var(--bad)">Step ${firstBad + 1}</b> is the first step that went wrong. Fix it and carry on from there.`;
        else if (filled < checkSteps.length) msg.innerHTML = '<span style="color:var(--ok)">Everything you filled in is correct ✓</span> — continue with the remaining steps.';
        else msg.innerHTML = '<span style="color:var(--ok)">All steps correct ✓</span> — so the slip is in how you wrote the final answer. Copy your last step carefully.';
      };
    };

    /* ---------- checking ---------- */
    const finalReminder = () => `<div class="final-reminder">🔎 Before you resubmit: redo the <u>final step</u> slowly. ${prob.finalCheck || ''}</div>`;

    function onCorrect() {
      st.solved = true;
      root.querySelector('.problem').classList.add('solved');
      setFb('ok', `<b>✓ Correct!</b> ${st.attempts === 0 ? 'First try — nice and careful.' : `Solved after ${st.attempts} wrong attempt${st.attempts > 1 ? 's' : ''} — well done for sticking with it.`}
        ${prob.explain ? `<div class="small" style="margin-top:6px">${prob.explain}</div>` : ''}
        <div style="margin-top:8px"><a href="#" class="js-review small">See the full worked solution</a></div>`);
      $('.js-review', fb).onclick = (e) => { e.preventDefault(); showSolution(); };
      if (input) input.readOnly = true;
      const cb = el('.js-check'); if (cb) cb.disabled = true;
      CAI.store.markSolved(prob, st.attempts === 0);
      if (opts.onSolved) opts.onSolved(st.attempts === 0);
    }

    function onWrong(res) {
      st.attempts++;
      CAI.store.countWrong();
      if (!st.logged && opts.logMistakes !== false) { CAI.store.addMistake(prob, opts.source); st.logged = true; }
      el('.js-attempts').textContent = `${st.attempts} wrong attempt${st.attempts > 1 ? 's' : ''}`;
      const msgs = res.msgs && res.msgs.length ? `<ul>${res.msgs.map((m) => `<li>${m}</li>`).join('')}</ul>` : '';
      setFb('bad', `<b>✗ Not quite.</b>${msgs}${!isChoice ? finalReminder() : ''}
        ${checkSteps.length ? '<div class="small" style="margin-top:6px">Not sure where it went wrong? Use <b>🔍 Check my steps</b>.</div>' : ''}`);
      if (stepBtn) stepBtn.classList.remove('hidden');
      if (st.attempts >= 2) el('.js-sol').classList.remove('hidden');
      if (opts.onWrong) opts.onWrong();
    }

    function submit(value, force) {
      if (st.solved) return;
      if (!isChoice && !String(value).trim()) { setFb('warn', 'Type an answer first.'); return; }
      /* speed bump: the student tends to rush the last step */
      const elapsed = (Date.now() - st.shownAt) / 1000;
      if (!force && !isChoice && CAI.store.state.settings.speedBump && !st.bumped && st.attempts === 0 && elapsed < 15 && (prob.steps || []).length > 1) {
        st.bumped = true;
        setFb('warn', `⏱ That was quick (${Math.round(elapsed)} s). Did you double-check the <b>final step</b>? ${prob.finalCheck || ''}
          <div class="row" style="margin-top:8px"><button class="btn small primary js-go">Yes — check it</button><button class="btn small js-back">Let me look again</button></div>`);
        $('.js-go', fb).onclick = () => submit(value, true);
        $('.js-back', fb).onclick = () => { setFb('', ''); input && input.focus(); };
        return;
      }
      const res = CAI.check.check(prob, value);
      if (res.error) { setFb('warn', `⚠ ${res.error}`); return; }
      if (res.ok) onCorrect(); else onWrong(res);
    }

    if (isChoice) {
      $$('.choice', root).forEach((b) => (b.onclick = () => {
        if (st.solved) return;
        const ci = +b.dataset.ci;
        const ok = ci === +prob.answer.value;
        b.classList.add(ok ? 'right' : 'wrong');
        if (ok) { $$('.choice', root).forEach((x) => (x.disabled = true)); onCorrect(); }
        else { b.disabled = true; onWrong({ msgs: [] }); }
      }));
    } else {
      el('.js-check').onclick = () => submit(input.value);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(input.value); });
      if (opts.autofocus !== false) setTimeout(() => input.focus({ preventScroll: true }), 30);
    }
    return { state: st, showSolution };
  };
})();
