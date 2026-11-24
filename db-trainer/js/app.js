/* =====================================================================
   APP — router and pages.
   Routes (hash):  #/  #/module/m1  #/lesson/m1l2  #/tools  #/tools/erd  #/tools/ra
   #/tools/fd  #/flashcards  #/exam  #/exam/run  #/weak  #/practice/<cat|top>
   #/review/m1  #/leaderboard  #/settings  #/about-db
   ===================================================================== */
(function (root) {
  'use strict';
  const C = root.CONTENT, Store = root.Store, U = root.U, esc = U.esc, LS = root.LS;
  const { h, $, $$, toast, fill, ErdBuilder, ErdView, ExerciseCard, Quiz, tableHtml, runSql } = root.W;
  const CFG = root.APP_CONFIG || {};

  // ---------------- indexes ----------------
  const LESSONS = {}, EX = {};
  C.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
    LESSONS[l.id] = { lesson: l, module: m, mi, li };
    l.exercises.forEach(e => { EX[e.id] = { ex: e, module: m, lesson: l }; });
  }));
  C.exams.forEach(p => p.sections.forEach(s => s.questions.forEach(q => { if (!q.ref) EX[q.id] = { ex: q, exam: p }; })));
  const resolveQ = (q) => q.ref ? Object.assign({}, EX[q.ref].ex, { points: q.points, id: q.ref }) : q;
  const allLessonEx = () => Object.values(EX).filter(x => x.lesson).map(x => x.ex);
  const moduleStats = (m) => {
    const lessons = m.lessons.length, lessonsDone = m.lessons.filter(l => Store.isSolved('lesson:' + l.id)).length;
    const exs = m.lessons.flatMap(l => l.exercises), exDone = exs.filter(e => Store.isSolved(e.id)).length;
    return { lessons, lessonsDone, exs: exs.length, exDone, pct: Math.round(100 * (lessonsDone + exDone) / (lessons + exs.length)) };
  };

  // ---------------- shell ----------------
  const app = document.getElementById('app');
  let cleanups = [];
  const onLeave = (fn) => cleanups.push(fn);
  const NAV = [['#/', 'Home'], ['#/tools', 'Tools'], ['#/flashcards', 'Flashcards'], ['#/exam', 'Exam'], ['#/weak', 'Weak spots'], ['#/leaderboard', 'Leaderboard'], ['#/about-db', 'How the DB works']];

  function syncChip() {
    const q = Store.queue.length;
    switch (Store.status) {
      case 'local': return '<span class="chip warn" title="Supabase not configured — progress is saved only in this browser">● Local mode</span>';
      case 'syncing': return '<span class="chip">⟳ Saving…</span>';
      case 'offline': return `<span class="chip warn" title="${esc(Store.statusMsg)}">● Offline${q ? ` — ${q} change${q > 1 ? 's' : ''} waiting` : ''}</span>`;
      case 'error': return `<span class="chip bad" title="${esc(Store.statusMsg)}">● Sync problem${q ? ` (${q} waiting)` : ''}</span>`;
      default: return q ? `<span class="chip">⟳ ${q} waiting</span>` : '<span class="chip ok">✓ Saved</span>';
    }
  }
  function shell(route) {
    const active = '#/' + (route[0] || '');
    app.innerHTML = '';
    const top = h(`<header class="topbar"><div class="topbar-in">
      <a class="brand" href="#/"><span class="logo">◇</span><span>${esc(CFG.APP_NAME || 'DB Trainer')}</span></a>
      <button type="button" class="menu-btn btn-sm" aria-label="Menu" aria-expanded="false">☰ Menu</button>
      <nav class="nav">${NAV.map(([href, t]) => `<a href="${href}" class="${(href === active || (href !== '#/' && active.startsWith(href))) ? 'active' : ''}">${t}</a>`).join('')}</nav>
      <div class="userbox"><span data-sync>${syncChip()}</span><a href="#/settings" title="Settings">👤 ${esc(Store.session.name)}</a><button type="button" class="btn-sm" data-switch>Switch user</button></div>
    </div></header>`);
    $('.menu-btn', top).addEventListener('click', (e) => { const n = $('.nav', top); n.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', n.classList.contains('open')); });
    $('[data-switch]', top).addEventListener('click', switchUser);
    app.appendChild(top);
    const main = h('<main id="main"></main>');
    if (!Store.configured) main.appendChild(h(`<div class="banner">Local demo mode: Supabase is not configured yet, so progress is saved only in this browser. See <b>README.md</b> → "Set up Supabase".</div>`));
    app.appendChild(main);
    return main;
  }
  function switchUser() {
    if (Store.queue.length && Store.configured && !confirm(`${Store.queue.length} change(s) are not uploaded yet (offline). They stay on this device and are sent when ${Store.session.name} logs in again. Switch anyway?`)) return;
    Store.logOut(); go('#/');
  }
  /** navigate; renders exactly once */
  function go(route) { if (location.hash !== route) location.hash = route; else render(); }
  Store.onChange(() => { const s = $('[data-sync]'); if (s) s.innerHTML = syncChip(); });
  // redraw "read-only" pages when the server sends newer data (never pages with inputs)
  Store.onData(() => { const p = parseHash().parts; if (Store.session && (!p[0] || ['module', 'weak', 'leaderboard'].includes(p[0]) || (p[0] === 'exam' && !p[1]))) render(); });

  // ---------------- router ----------------
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), params };
  }
  function render() {
    cleanups.forEach(f => { try { f(); } catch (e) { /* ignore */ } }); cleanups = [];
    if (!Store.session) return viewLogin();
    const { parts, params } = parseHash();
    const main = shell(parts);
    const [a, b] = parts;
    try {
      if (!a) viewHome(main);
      else if (a === 'module' && C.modules.find(m => m.id === b)) viewModule(main, b);
      else if (a === 'lesson' && LESSONS[b]) viewLesson(main, b);
      else if (a === 'tools' && !b) viewTools(main);
      else if (a === 'tools' && b === 'erd') viewErdTool(main);
      else if (a === 'tools' && b === 'ra') viewPlayground(main, params);
      else if (a === 'tools' && b === 'fd') viewFdTool(main, params);
      else if (a === 'flashcards') viewFlashcards(main, b);
      else if (a === 'exam' && b === 'run') viewExamRun(main);
      else if (a === 'exam' && b === 'result') viewExamResult(main);
      else if (a === 'exam') viewExamList(main);
      else if (a === 'weak') viewWeak(main);
      else if (a === 'practice') viewPractice(main, b || 'top');
      else if (a === 'review' && C.modules.find(m => m.id === b)) viewReview(main, b);
      else if (a === 'leaderboard') viewLeaderboard(main);
      else if (a === 'settings') viewSettings(main);
      else if (a === 'about-db') viewAboutDb(main);
      else main.appendChild(h(`<div class="card"><h1>Page not found</h1><p><a href="#/">Go home</a></p></div>`));
    } catch (e) {
      console.error(e);
      main.appendChild(h(`<div class="card fb bad">Something went wrong: ${esc(e.message)}</div>`));
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  const remember = (route, title) => Store.setLastPlace(route, title);

  // ---------------- LOGIN ----------------
  function viewLogin() {
    app.innerHTML = '';
    const known = Store.knownUsers();
    const el = h(`<main><div class="card login">
      <h1>◇ ${esc(CFG.APP_NAME || 'DB Trainer')}</h1>
      <p class="muted" style="text-align:center">${esc(CFG.COURSE_NAME || 'Database Systems')} — learn, practise and train for the exam.</p>
      ${Store.configured ? '' : '<div class="banner">Local demo mode (Supabase not configured): accounts and progress stay in this browser.</div>'}
      <form data-form>
        <div class="field"><label for="nm">Your name</label><input id="nm" autocomplete="username" maxlength="30" placeholder="e.g. Anna K." required></div>
        <p class="small muted">No email, no password — just a name. Pick something your classmates will recognise.</p>
        <div class="row"><button class="primary" type="submit" data-act="signup">Sign up</button><button type="button" data-act="login">Log in</button></div>
      </form>
      <div data-msg></div>
      ${known.length ? `<h3>On this device</h3><div class="row">${known.map(u => `<button type="button" class="btn-sm" data-known="${esc(u.name)}">${esc(u.name)}</button>`).join('')}</div>` : ''}
    </div></main>`);
    app.appendChild(el);
    const inp = $('#nm', el), msg = $('[data-msg]', el);
    const busy = (b) => $$('button', el).forEach(x => x.disabled = b);
    async function act(kind, name) {
      msg.innerHTML = ''; busy(true);
      const r = kind === 'signup' ? await Store.signUp(name) : await Store.logIn(name);
      busy(false);
      if (r.ok) { toast(kind === 'signup' ? `Welcome, ${r.user.name}!` : `Welcome back, ${r.user.name}!`); go('#/'); return; }
      if (r.reason === 'taken') {
        msg.innerHTML = `<div class="fb bad">${esc(r.message)}.</div><p>Is this you? <button type="button" class="btn-sm primary" data-loginas>Log in as ${esc(Store.cleanName(name))}</button></p>`;
        $('[data-loginas]', msg).addEventListener('click', () => act('login', name));
      } else if (r.reason === 'notfound') {
        msg.innerHTML = `<div class="fb warn">${esc(r.message)}</div><button type="button" class="btn-sm primary" data-signupas>Sign up as ${esc(Store.cleanName(name))}</button>`;
        $('[data-signupas]', msg).addEventListener('click', () => act('signup', name));
      } else msg.innerHTML = `<div class="fb bad">${esc(r.message)}</div>`;
    }
    $('[data-form]', el).addEventListener('submit', (e) => { e.preventDefault(); act('signup', inp.value); });
    $('[data-act="login"]', el).addEventListener('click', () => act('login', inp.value));
    $$('[data-known]', el).forEach(b => b.addEventListener('click', () => act('login', b.dataset.known)));
    inp.focus();
  }

  // ---------------- HOME ----------------
  function routeTitle(route) {
    const m = /^#\/lesson\/(\w+)/.exec(route || '');
    if (m && LESSONS[m[1]]) return `${LESSONS[m[1]].module.short}: ${LESSONS[m[1]].lesson.title}`;
    const map = { '#/tools/erd': 'ERD builder', '#/tools/ra': 'RA & SQL playground', '#/tools/fd': 'Normalization tool', '#/flashcards': 'Flashcards', '#/weak': 'Weak spots' };
    if (/^#\/practice\//.test(route || '')) return 'Practice my weak spots';
    if (/^#\/review\//.test(route || '')) return 'Review sheet';
    return map[(route || '').split('?')[0]] || null;
  }
  function nextLesson() {
    for (const m of C.modules) for (const l of m.lessons) if (!Store.isSolved('lesson:' + l.id)) return l;
    return null;
  }
  function viewHome(main) {
    const last = Store.getProgress('meta:last');
    const lastTitle = last && routeTitle(last.status);
    const nl = nextLesson();
    const due = C.flashcards.filter(c => { const s = Store.data.cards[c.id]; return s && new Date(s.due_at) <= new Date(); }).length;
    const fresh = C.flashcards.filter(c => !Store.data.cards[c.id]).length;
    const weak = topWeak(3);
    const best = Store.data.exams.reduce((b, x) => Math.max(b, Math.round(100 * x.score / (x.max_score || 1))), -1);
    main.appendChild(h(`<div>
      <h1>Hi ${esc(Store.session.name)} 👋</h1>
      <div class="card"><div class="row">
        <div style="flex:1;min-width:220px">${lastTitle ? `<p style="margin:0 0 8px">Continue where you left off:</p><a class="btn primary" href="${esc(last.status)}">▶ ${esc(lastTitle)}</a>` : (nl ? `<p style="margin:0 0 8px">Start here:</p><a class="btn primary" href="#/lesson/${nl.id}">▶ ${esc(nl.title)}</a>` : '<p>All lessons completed! Try a mock exam.</p>')}
        ${nl && lastTitle ? `<p class="small muted" style="margin:8px 0 0">Next new lesson: <a href="#/lesson/${nl.id}">${esc(nl.title)}</a></p>` : ''}</div>
        <div style="text-align:center;min-width:90px"><div class="stat">🔥 ${Store.currentStreak()}</div><div class="small muted">day streak</div></div>
        <div style="text-align:center;min-width:90px"><div class="stat">${best >= 0 ? best + '%' : '—'}</div><div class="small muted">best exam</div></div>
      </div></div>
      <h2>Modules</h2>
      <div class="grid">${C.modules.map((m, i) => { const s = moduleStats(m); return `<a class="card module-card" href="#/module/${m.id}">
        <div class="row"><span class="icon">${esc(m.icon)}</span><div><div class="small muted">Module ${i + 1}</div><b>${esc(m.title)}</b></div></div>
        <div class="small muted">${esc(m.description)}</div>
        <div class="bar" aria-label="progress"><span style="width:${s.pct}%"></span></div>
        <div class="small">${s.lessonsDone}/${s.lessons} lessons · ${s.exDone}/${s.exs} exercises</div></a>`; }).join('')}</div>
      <h2>Train</h2>
      <div class="grid">
        <a class="card module-card" href="#/flashcards"><b>🃏 Flashcards</b><span class="small muted">${due} due now · ${fresh} new</span></a>
        <a class="card module-card" href="#/exam"><b>⏱ Mock exam (90 min)</b><span class="small muted">ERD, mapping, queries, normalization</span></a>
        <a class="card module-card" href="#/weak"><b>🎯 Weak spots</b><span class="small muted">${weak.length ? esc(weak.map(w => C.categories[w[0]] || w[0]).join(' · ')) : 'No mistakes recorded yet'}</span></a>
        <a class="card module-card" href="#/tools"><b>🛠 Tools</b><span class="small muted">ERD builder · RA/SQL playground · Normalization</span></a>
      </div></div>`));
  }

  // ---------------- MODULE ----------------
  function viewModule(main, mid) {
    const m = C.modules.find(x => x.id === mid), s = moduleStats(m);
    const idx = C.modules.indexOf(m) + 1;
    main.appendChild(h(`<div>
      <p class="small"><a href="#/">Home</a> › Module ${idx}</p>
      <h1>${esc(m.icon)} Module ${idx}: ${esc(m.title)}</h1>
      <p class="muted">${esc(m.description)}</p>
      <div class="card"><div class="bar"><span style="width:${s.pct}%"></span></div><p class="small" style="margin:6px 0 0">${s.lessonsDone}/${s.lessons} lessons completed · ${s.exDone}/${s.exs} exercises solved</p></div>
      <div class="lesson-list">${m.lessons.map((l, i) => {
        const st = Store.getProgress('lesson:' + l.id), q = Store.getProgress('quiz:' + l.id);
        const solved = l.exercises.filter(e => Store.isSolved(e.id)).length;
        const cls = st && st.status === 'done' ? 'done' : (st ? 'started' : '');
        return `<a href="#/lesson/${l.id}"><span class="dot ${cls}">${cls === 'done' ? '✓' : i + 1}</span><span style="flex:1"><b>${esc(l.title)}</b><br><span class="small muted">~${l.minutes} min · ${solved}/${l.exercises.length} exercises${q ? ` · quiz ${q.score}%` : ''}</span></span><span>›</span></a>`;
      }).join('')}</div>
      <div class="row" style="margin-top:14px"><a class="btn" href="#/review/${m.id}">🖨 One-page review sheet</a><a class="btn" href="#/flashcards/${m.id}">🃏 Flashcards for this module</a></div>
    </div>`));
  }

  // ---------------- LESSON ----------------
  function viewLesson(main, lid) {
    const { lesson: l, module: m, mi, li } = LESSONS[lid];
    remember('#/lesson/' + lid, l.title);
    if (!Store.getProgress('lesson:' + lid)) Store.setProgress('lesson:' + lid, { status: 'started', score: null, attempts: 0 });
    const flat = C.modules.flatMap(x => x.lessons);
    const pos = flat.indexOf(l), prev = flat[pos - 1], next = flat[pos + 1];
    const w = l.worked;
    const el = h(`<div>
      <p class="small"><a href="#/">Home</a> › <a href="#/module/${m.id}">Module ${mi + 1}</a> › Lesson ${li + 1}</p>
      <h1>${esc(l.title)}</h1>
      <div class="card"><span class="step-label">1. Intuition first</span>${fill(l.intuition)}</div>
      <div class="card"><span class="step-label">2. Definitions &amp; rules</span>${fill(l.formal)}</div>
      <div class="card"><span class="step-label">3. Worked example</span>${fill(w.problem)}
        <ol class="steps" data-steps>${w.steps.map((s, i) => `<li class="${i ? 'hidden' : ''}">${fill(s)}</li>`).join('')}</ol>
        <div class="row no-print"><button type="button" class="primary btn-sm" data-act="next">Next step ▸</button><button type="button" class="btn-sm" data-act="all">Show all steps</button></div>
        <div data-worked-extra class="hidden"></div>
      </div>
      <div data-ex></div>
      <div data-quiz></div>
      <div class="row" style="margin-top:16px">${prev ? `<a class="btn" href="#/lesson/${prev.id}">‹ ${esc(prev.title)}</a>` : ''}<span class="spacer"></span>${next ? `<a class="btn primary" href="#/lesson/${next.id}">${esc(next.title)} ›</a>` : '<a class="btn primary" href="#/exam">Try a mock exam ›</a>'}</div>
    </div>`);
    main.appendChild(el);
    // worked example: reveal steps one by one
    const steps = $$('[data-steps] li', el); let shown = 1;
    const extra = $('[data-worked-extra]', el);
    const finish = () => {
      $('[data-act="next"]', el).classList.add('hidden'); $('[data-act="all"]', el).classList.add('hidden');
      extra.classList.remove('hidden');
      if (extra.dataset.done) return; extra.dataset.done = '1';
      if (w.erd) { extra.appendChild(h('<h3>The diagram</h3>')); const v = ErdView(w.erd); extra.appendChild(v.el); onLeave(v.destroy); }
      if (w.ra) {
        try {
          const r = root.RA.run(w.ra);
          extra.appendChild(h(`<div><h3>Run it</h3><p><b>Relational algebra:</b> <code>${esc(w.ra)}</code></p><p><b>SQL:</b> <code>${esc(w.sql || '')}</code></p>${tableHtml(r.result)}<p class="small muted">Query tree:</p><pre class="tree">${esc(root.RA.tree(w.ra))}</pre><a class="btn btn-sm" href="#/tools/ra?q=${encodeURIComponent(w.ra)}">Open in the playground</a></div>`));
        } catch (e) { extra.appendChild(h(`<div class="fb bad">${esc(e.message)}</div>`)); }
      }
      if (w.fd) {
        const a = root.FD.analyze(w.fd, w.decomp); const A = a.P.attrs, F = root.FD;
        extra.appendChild(h(`<div><h3>Check with the normalization tool</h3><ul>
          <li>Candidate key(s): <b>${a.keys.keys.map(k => F.fmt(k, A)).join(', ')}</b></li>
          <li>Minimal cover: ${esc(F.fmtFDs(a.cover.cover, A))}</li>
          <li>Highest normal form: <b>${a.nf.nf}</b></li>
          ${a.decomp ? `<li>Decomposition ${esc(w.decomp)}: ${a.decomp.chase.lossless ? 'lossless' : 'lossy'}, ${a.decomp.pres.ok ? 'dependency preserving' : 'not dependency preserving'}</li>` : ''}
        </ul><a class="btn btn-sm" href="#/tools/fd?p=${encodeURIComponent(w.fd)}${w.decomp ? '&d=' + encodeURIComponent(w.decomp) : ''}">See every step in the tool</a></div>`));
      }
    };
    $('[data-act="next"]', el).addEventListener('click', () => { if (shown < steps.length) steps[shown++].classList.remove('hidden'); if (shown >= steps.length) finish(); });
    $('[data-act="all"]', el).addEventListener('click', () => { steps.forEach(s => s.classList.remove('hidden')); shown = steps.length; finish(); });
    if (steps.length === 1) finish();
    // exercises
    const exHost = $('[data-ex]', el);
    l.exercises.forEach((ex, i) => {
      const label = i === 0 ? '4. Your turn — a very similar exercise' : `5. Level up — exercise ${i + 1}${ex.exam ? ' (exam style)' : ''}`;
      const card = ExerciseCard(ex, { label, draftKey: `${Store.session.id}.${ex.id}` });
      exHost.appendChild(card.el); onLeave(card.destroy);
    });
    const tagCount = {}; l.exercises.forEach(e => (e.tags || []).forEach(t => tagCount[t] = (tagCount[t] || 0) + 1));
    const mainTag = Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0];
    $('[data-quiz]', el).appendChild(Quiz(l, { category: mainTag ? mainTag[0] : 'er-concepts' }).el);
  }

  // ---------------- TOOLS ----------------
  function viewTools(main) {
    main.appendChild(h(`<div><h1>🛠 Tools</h1><div class="grid">
      <a class="card module-card" href="#/tools/erd"><span class="icon">◇</span><b>ERD builder</b><span class="small muted">Build a Chen diagram with forms or text; drag the shapes.</span></a>
      <a class="card module-card" href="#/tools/ra"><span class="icon">σ</span><b>RA &amp; SQL playground</b><span class="small muted">Run relational algebra or SQL on the sample database.</span></a>
      <a class="card module-card" href="#/tools/fd"><span class="icon">→</span><b>Normalization tool</b><span class="small muted">Closures, keys, minimal cover, normal form, 3NF/BCNF, chase test.</span></a>
      ${C.modules.map((m, i) => `<a class="card module-card" href="#/review/${m.id}"><span class="icon">🖨</span><b>Review sheet ${i + 1}</b><span class="small muted">${esc(m.title)}</span></a>`).join('')}
    </div></div>`));
  }

  function viewErdTool(main) {
    remember('#/tools/erd', 'ERD builder');
    main.appendChild(h(`<div><p class="small"><a href="#/tools">Tools</a> › ERD builder</p><h1>◇ ERD builder</h1><p class="muted">Free drawing space — your diagram is saved automatically on this device. Use the "Text" tab to copy or paste a whole diagram.</p></div>`));
    const b = ErdBuilder({ draftKey: `${Store.session.id}.tool.erd`, initialText: `ENTITY STUDENT: *StudentID, Name(FirstName, LastName), [Email], BirthDate, /Age
ENTITY COURSE: *CourseCode, Title
REL ENROLLS: STUDENT M, COURSE N | Grade` });
    const card = h('<div class="card"></div>'); card.appendChild(b.el); main.appendChild(card); onLeave(b.destroy);
  }

  function viewPlayground(main, params) {
    remember('#/tools/ra', 'RA & SQL playground');
    const db = root.SAMPLE_DB;
    const el = h(`<div><p class="small"><a href="#/tools">Tools</a> › Playground</p><h1>σ Relational algebra &amp; SQL playground</h1>
      <div class="card">
        <div class="row"><div class="seg"><button type="button" data-mode="ra" class="on">Relational algebra</button><button type="button" data-mode="sql">SQL</button></div><span class="spacer"></span><button type="button" class="btn-sm" data-act="tree">Query tree</button><button type="button" class="primary" data-act="run">▶ Run</button></div>
        <textarea class="mono" rows="6" spellcheck="false" style="margin-top:8px" aria-label="Query"></textarea>
        <p class="small muted">Ctrl+Enter runs the query.</p>
        <div data-out></div>
      </div>
      <details class="card" open><summary><b>Syntax cheat sheet</b></summary><div class="table-wrap"><table class="t">
        <tr><td><code>SELECT[salary>1000 AND city='Berlin'](EMPLOYEE)</code></td><td>selection σ</td></tr>
        <tr><td><code>PROJECT[name, city](EMPLOYEE)</code></td><td>projection π</td></tr>
        <tr><td><code>RENAME[E](EMPLOYEE)</code> · <code>EMPLOYEE AS E</code> · <code>RENAME[name->ename](R)</code> · <code>RENAME[S(a,b)](R)</code></td><td>rename ρ</td></tr>
        <tr><td><code>R UNION S</code> · <code>R INTERSECT S</code> · <code>R MINUS S</code></td><td>set operations</td></tr>
        <tr><td><code>R TIMES S</code></td><td>cartesian product ×</td></tr>
        <tr><td><code>R JOIN[R.a=S.b] S</code> · <code>R NATURALJOIN S</code></td><td>theta / equi / natural join</td></tr>
        <tr><td><code>R LEFTJOIN[cond] S</code> · <code>RIGHTJOIN</code> · <code>FULLJOIN</code> (no [cond] = natural)</td><td>outer joins</td></tr>
        <tr><td><code>R DIVIDE S</code></td><td>division ÷</td></tr>
        <tr><td><code>GROUP[deptid; COUNT(*) AS n, AVG(salary) AS avgsal](EMPLOYEE)</code></td><td>aggregation γ</td></tr>
        <tr><td><code>T1 &lt;- SELECT[...](...)</code> (one per line)</td><td>assignment / step by step</td></tr>
        <tr><td><code>= &lt;&gt; &lt; &lt;= &gt; &gt;= AND OR NOT IS NULL</code></td><td>in conditions; text in quotes</td></tr>
      </table></div></details>
      <h2>Sample database</h2><p class="muted small">Click a table to see its rows (and insert its name into the editor).</p>
      <div class="grid" data-tables>${Object.entries(db).map(([n, t]) => `<button type="button" class="card" style="text-align:left;display:block" data-table="${n}"><b>${n}</b><br><span class="small muted">${t.columns.join(', ')}</span></button>`).join('')}</div>
      <div data-tableview></div></div>`);
    main.appendChild(el);
    const ta = $('textarea', el), out = $('[data-out]', el);
    let mode = 'ra';
    ta.value = params.get('q') || LS.get('dbt.pg.' + Store.session.id, 'PROJECT[name, dname](EMPLOYEE JOIN[EMPLOYEE.deptid=DEPARTMENT.deptid] DEPARTMENT)');
    if (/^\s*select\s/i.test(ta.value) && !/\[/.test(ta.value)) { mode = 'sql'; }
    const setMode = (m) => { mode = m; $$('[data-mode]', el).forEach(b => b.classList.toggle('on', b.dataset.mode === m)); $('[data-act="tree"]', el).classList.toggle('hidden', m !== 'ra'); };
    setMode(mode);
    const run = async () => {
      LS.set('dbt.pg.' + Store.session.id, ta.value);
      out.innerHTML = '<p class="muted">Running…</p>';
      try {
        if (mode === 'ra') {
          const r = root.RA.run(ta.value);
          out.innerHTML = `<h3>Result</h3>${tableHtml(r.result)}` + (r.steps.length > 1 ? `<details><summary>Intermediate results (${r.steps.length} steps)</summary>${r.steps.map(s => `<p><code>${esc(s.label)}</code></p>${tableHtml(s.rel, { max: 30 })}`).join('')}</details>` : '');
        } else out.innerHTML = `<h3>Result</h3>${tableHtml(await runSql(ta.value))}`;
      } catch (e) { out.innerHTML = `<div class="fb bad">${esc(e.message)}</div>`; }
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mode) setMode(b.dataset.mode);
      else if (b.dataset.act === 'run') run();
      else if (b.dataset.act === 'tree') { try { out.innerHTML = `<h3>Query tree</h3><pre class="tree">${esc(root.RA.tree(ta.value))}</pre>`; } catch (er) { out.innerHTML = `<div class="fb bad">${esc(er.message)}</div>`; } }
      else if (b.dataset.table) {
        const n = b.dataset.table, t = db[n];
        $('[data-tableview]', el).innerHTML = `<div class="card"><h3 style="margin-top:0">${n}</h3>${tableHtml({ cols: t.columns.map(c => ({ name: c })), rows: t.rows })}</div>`;
        const p = ta.selectionStart || ta.value.length; ta.value = ta.value.slice(0, p) + n + ta.value.slice(p);
      }
    });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } });
  }

  function viewFdTool(main, params) {
    remember('#/tools/fd', 'Normalization tool');
    const el = h(`<div><p class="small"><a href="#/tools">Tools</a> › Normalization</p><h1>→ Normalization tool</h1>
      <div class="card">
        <div class="field"><label for="fdp">Relation and functional dependencies</label><textarea id="fdp" class="mono" rows="6" spellcheck="false"></textarea></div>
        <p class="small muted">First line: <code>R(A,B,C,D)</code>. Then one FD per line (<code>A->B</code>, <code>AB->C</code>, or <code>StudentID, Course -> Grade</code>). You can also write everything on one line: <code>R(A,B,C,D), A->B, B->C</code>.</p>
        <div class="row"><div class="field" style="flex:1"><label for="fdx">Closure of (optional)</label><input id="fdx" class="mono" placeholder="e.g. AC"></div>
        <div class="field" style="flex:2"><label for="fdd">Test a decomposition (optional)</label><input id="fdd" class="mono" placeholder="e.g. R1(A,B), R2(B,C)"></div></div>
        <div class="row" style="margin-top:8px"><button type="button" class="primary" data-act="go">Analyse</button></div>
      </div><div data-out></div></div>`);
    main.appendChild(el);
    const P = $('#fdp', el), X = $('#fdx', el), D = $('#fdd', el), out = $('[data-out]', el);
    P.value = params.get('p') || LS.get('dbt.fd.' + Store.session.id, 'R(A,B,C,D,E)\nA->B\nB->C\nCD->E');
    D.value = params.get('d') || '';
    const list = (arr) => `<ol class="steps">${arr.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
    const go = () => {
      LS.set('dbt.fd.' + Store.session.id, P.value);
      try {
        const F = root.FD, a = F.analyze(P.value, D.value), A = a.P.attrs;
        const rel = (r, i) => `R${i + 1}(${F.bits(r.mask).map(j => A[j]).join(', ')}) — key: ${r.keys.map(k => F.fmt(k, A)).join(' or ')}${r.fds.length ? ' — FDs: ' + esc(F.fmtFDs(r.fds, A)) : ''}`;
        let xs = '';
        if (X.value.trim()) { const c = F.closure(F.parseSet(X.value.replace(/[{}+]/g, ' '), A, 'closure'), a.P.fds, A); xs = `<div class="card"><h2 style="margin-top:0">Closure ${esc(X.value)}+</h2>${list(c.steps)}</div>`; }
        out.innerHTML = `
          <div class="card"><h2 style="margin-top:0">Input</h2><p>${esc(a.P.name)}(${A.map(esc).join(', ')}) with F = { ${esc(F.fmtFDs(a.P.fds, A))} }</p></div>${xs}
          <div class="card"><h2 style="margin-top:0">1. Closures of single attributes</h2>${a.closures.map(c => `<details><summary>${esc(F.fmt(c.X, A))}+ = ${esc(F.fmt(c.mask, A))}</summary>${list(c.steps)}</details>`).join('')}</div>
          <div class="card"><h2 style="margin-top:0">2. Candidate keys</h2><p><b>${a.keys.keys.map(k => esc(F.fmt(k, A))).join(', ')}</b> — prime: ${esc(F.fmt(a.keys.prime, A))}; non-prime: ${esc(F.fmt(a.P.all & ~a.keys.prime, A))}</p>${list(a.keys.steps)}
            ${a.keyClosures.map(c => `<details><summary>Proof: ${esc(F.fmt(c.X, A))}+</summary>${list(c.steps)}</details>`).join('')}</div>
          <div class="card"><h2 style="margin-top:0">3. Minimal cover</h2>${list(a.cover.steps)}</div>
          <div class="card"><h2 style="margin-top:0">4. Normal form: ${a.nf.nf}</h2>${list(a.nf.reasons)}</div>
          <div class="card"><h2 style="margin-top:0">5. 3NF decomposition (synthesis)</h2>${list(a.syn.steps)}<p><b>Result:</b></p><ul>${a.syn.relations.map((r, i) => `<li>${rel(r, i)}</li>`).join('')}</ul><p class="small muted">Always lossless and dependency preserving.</p></div>
          <div class="card"><h2 style="margin-top:0">6. BCNF decomposition</h2>${list(a.bcnf.steps)}<p><b>Result:</b></p><ul>${a.bcnf.relations.map((r, i) => `<li>${rel(r, i)}</li>`).join('')}</ul></div>
          ${a.decomp ? `<div class="card"><h2 style="margin-top:0">7. Your decomposition</h2>
            <ul class="checklist"><li class="${a.decomp.covers ? 'ok' : 'bad'}">${a.decomp.covers ? 'All attributes are covered.' : 'Some attributes are missing!'}</li>
            <li class="${a.decomp.chase.lossless ? 'ok' : 'bad'}">${a.decomp.chase.lossless ? 'Lossless join' : 'Lossy join'}</li>
            <li class="${a.decomp.pres.ok ? 'ok' : 'bad'}">${a.decomp.pres.ok ? 'Dependency preserving' : 'Lost FDs: ' + esc(a.decomp.pres.lost.map(f => F.fmtFD(f, A)).join(', '))}</li>
            ${a.decomp.nfs.map(n => `<li class="note">${esc(n.name)}(${F.bits(n.mask).map(j => esc(A[j])).join(', ')}) is in <b>${n.nf}</b>${n.fds.length ? ' — FDs: ' + esc(F.fmtFDs(n.fds, A)) : ''}</li>`).join('')}</ul>
            <details><summary>Chase test, step by step</summary>${a.decomp.chase.steps.map(s => `<pre>${esc(s)}</pre>`).join('')}</details></div>` : ''}`;
      } catch (e) { out.innerHTML = `<div class="card fb bad">${esc(e.message)}</div>`; }
    };
    $('[data-act="go"]', el).addEventListener('click', go);
    go();
  }

  // ---------------- FLASHCARDS (spaced repetition) ----------------
  function schedule(st, rating) {
    const now = Date.now(); let ease = st ? st.ease : 2.5, iv = st ? st.interval_days : 0;
    if (rating === 'again') { ease = Math.max(1.3, ease - 0.2); iv = 0; return { ease, interval_days: 0, due_at: new Date(now + 10 * 60e3).toISOString() }; }
    if (rating === 'hard') { ease = Math.max(1.3, ease - 0.15); iv = Math.max(1, iv * 1.2); }
    if (rating === 'good') iv = iv < 1 ? 1 : (iv < 3 ? 3 : iv * ease);
    if (rating === 'easy') { iv = iv < 1 ? 4 : iv * ease * 1.3; ease += 0.15; }
    iv = Math.round(iv * 10) / 10;
    return { ease: Math.round(ease * 100) / 100, interval_days: iv, due_at: new Date(now + iv * 86400e3).toISOString() };
  }
  const fmtIv = (d) => d < 1 ? '10 min' : d < 30 ? `${Math.round(d)} d` : `${Math.round(d / 30)} mo`;
  function viewFlashcards(main, mod) {
    remember('#/flashcards', 'Flashcards');
    const cards = C.flashcards.filter(c => !mod || c.module === mod);
    const el = h(`<div><h1>🃏 Flashcards</h1>
      <div class="row no-print"><a class="btn btn-sm ${!mod ? 'primary' : ''}" href="#/flashcards">All</a>${C.modules.map((m, i) => `<a class="btn btn-sm ${mod === m.id ? 'primary' : ''}" href="#/flashcards/${m.id}">Module ${i + 1}</a>`).join('')}</div>
      <p class="small muted" data-counts></p><div class="card flash" data-card></div>
      <p class="small muted">Spaced repetition: cards you know come back later and later; cards you forget come back soon. Keys: Space = show answer, 1–4 = rate.</p></div>`);
    main.appendChild(el);
    const host = $('[data-card]', el);
    let current = null, showing = false, newToday = 0;
    function queue() {
      const now = new Date();
      const due = cards.filter(c => { const s = Store.data.cards[c.id]; return s && new Date(s.due_at) <= now; }).sort((a, b) => new Date(Store.data.cards[a.id].due_at) - new Date(Store.data.cards[b.id].due_at));
      const fresh = cards.filter(c => !Store.data.cards[c.id]);
      return { due, fresh, list: due.length ? due : (newToday < 20 ? fresh : []) };
    }
    function show() {
      const q = queue();
      $('[data-counts]', el).textContent = `${q.due.length} due · ${q.fresh.length} new · ${cards.length} cards in this deck`;
      current = q.list[0]; showing = false;
      if (!current) {
        const next = cards.map(c => Store.data.cards[c.id]).filter(Boolean).sort((a, b) => new Date(a.due_at) - new Date(b.due_at))[0];
        host.innerHTML = `<div>🎉 <b>All done for now!</b></div><div class="small muted">${next ? 'Next card due ' + new Date(next.due_at).toLocaleString() : ''}</div><a class="btn" href="#/">Back home</a>`;
        return;
      }
      const st = Store.data.cards[current.id];
      host.innerHTML = `${current.sym ? `<div class="sym-wrap">${root.ERD.symbol(current.sym)}</div>` : ''}<div><b>${fill(esc(current.front))}</b></div>
        <div data-back class="hidden"><hr style="width:100%;border:0;border-top:1px solid var(--line)"><div>${esc(current.back)}</div>${current.symBack ? `<div class="sym-wrap" style="margin:auto">${root.ERD.symbol(current.symBack)}</div>` : ''}</div>
        <button type="button" class="primary" data-show>Show answer</button>
        <div class="rate hidden" data-rate>${['again', 'hard', 'good', 'easy'].map((r, i) => `<button type="button" data-r="${r}">${i + 1}. ${r[0].toUpperCase() + r.slice(1)}<small>${fmtIv(schedule(st, r).interval_days)}</small></button>`).join('')}</div>`;
      $('[data-show]', host).addEventListener('click', reveal);
      $$('[data-r]', host).forEach(b => b.addEventListener('click', () => rate(b.dataset.r)));
    }
    function reveal() { showing = true; $('[data-back]', host).classList.remove('hidden'); $('[data-show]', host).classList.add('hidden'); $('[data-rate]', host).classList.remove('hidden'); }
    function rate(r) { if (!Store.data.cards[current.id]) newToday++; Store.setCard(current.id, schedule(Store.data.cards[current.id], r)); Store.touchStreak(); show(); }
    const key = (e) => {
      if (/input|textarea/i.test(e.target.tagName) || !current) return;
      if (e.key === ' ' && !showing) { e.preventDefault(); reveal(); }
      else if (showing && ['1', '2', '3', '4'].includes(e.key)) rate(['again', 'hard', 'good', 'easy'][+e.key - 1]);
    };
    document.addEventListener('keydown', key); onLeave(() => document.removeEventListener('keydown', key));
    show();
  }

  // ---------------- EXAM ----------------
  const runKey = () => 'dbt.examrun.' + Store.session.id;
  function viewExamList(main) {
    const run = LS.get(runKey(), null);
    const hist = Store.data.exams.slice().reverse();
    main.appendChild(h(`<div><h1>⏱ Mock exam</h1>
      <div class="card"><p>Exam conditions: <b>90 minutes</b>, <b>no hints</b>, no solutions, no result preview for queries. The timer keeps running if you close the page. At the end you get a score and a breakdown by section, and your mistakes go into your weak-spot tracker.</p>
      <p class="small muted">Sections: (1) scenario → ERD, (2) ERD → relational schema + explanation of the mapping and assumptions, (3) relational algebra / SQL queries, (4) normalization.</p></div>
      ${run ? `<div class="card"><b>An exam is in progress.</b> <a class="btn primary" href="#/exam/run">Continue</a></div>` : ''}
      <div class="grid">${C.exams.map(p => `<div class="card"><h3 style="margin-top:0">${esc(p.title)}</h3><p class="small muted">${p.minutes} minutes · ${p.sections.length} sections · 100 points</p><button type="button" class="primary" data-start="${p.id}" ${run ? 'disabled' : ''}>Start</button></div>`).join('')}</div>
      <h2>Your results</h2>${hist.length ? `<div class="card table-wrap"><table class="lb"><tr><th>Date</th><th>Score</th><th>Breakdown</th></tr>${hist.map(x => `<tr><td>${new Date(x.taken_at).toLocaleString()}</td><td><b>${x.score}/${x.max_score}</b></td><td class="small">${x.breakdown && x.breakdown.sections ? esc(x.breakdown.sections.map(s => `${s.title.replace(/^\d+\.\s*/, '')}: ${s.score}/${s.max}`).join(' · ')) : ''}</td></tr>`).join('')}</table></div>` : '<p class="muted">No exams taken yet.</p>'}
      ${LS.get('dbt.lastexam.' + Store.session.id, null) ? '<p><a href="#/exam/result">See the detailed feedback of your last exam</a></p>' : ''}
    </div>`));
    $$('[data-start]', main).forEach(b => b.addEventListener('click', () => {
      const p = C.exams.find(x => x.id === b.dataset.start);
      if (!confirm(`Start "${p.title}"? The ${p.minutes}-minute timer starts now.`)) return;
      const now = Date.now();
      LS.set(runKey(), { paperId: p.id, startedAt: now, endsAt: now + p.minutes * 60e3 });
      location.hash = '#/exam/run';
    }));
  }
  function viewExamRun(main) {
    const run = LS.get(runKey(), null);
    if (!run) { location.hash = '#/exam'; return; }
    const p = C.exams.find(x => x.id === run.paperId);
    const el = h(`<div><h1>${esc(p.title)}</h1><div class="timer"><span>⏱</span><span class="time" data-time></span><span class="spacer"></span><button type="button" class="primary" data-submit>Submit exam</button></div><div data-q></div>
      <div class="row" style="margin-top:16px"><button type="button" class="primary" data-submit>Submit exam</button><button type="button" class="ghost danger" data-abort>Abandon exam</button></div></div>`);
    main.appendChild(el);
    const widgets = [];
    p.sections.forEach((s, si) => {
      const sec = h(`<div><h2>${esc(s.title)}</h2>${s.intro ? `<div class="card">${esc(s.intro)}</div>` : ''}</div>`);
      s.questions.forEach((q0, qi) => {
        const q = resolveQ(q0);
        const card = h(`<div class="card ex"><div class="ex-head"><span class="badge">${q.points} points</span></div><div class="prompt">${fill(q.prompt)}</div><div data-given></div><div data-in></div></div>`);
        if (q.erd) { const v = ErdView(q.erd); $('[data-given]', card).appendChild(v.el); onLeave(v.destroy); }
        const inp = root.W.makeInput(q, { exam: true, draftKey: `${Store.session.id}.exam.${run.startedAt}.${q.id}` });
        $('[data-in]', card).appendChild(inp.el); if (inp.destroy) onLeave(inp.destroy);
        sec.appendChild(card);
        widgets.push({ q, inp, section: si });
      });
      $('[data-q]', el).appendChild(sec);
    });
    const tick = () => {
      const left = Math.max(0, run.endsAt - Date.now());
      const m = Math.floor(left / 60e3), s = Math.floor(left / 1000) % 60;
      $('[data-time]', el).textContent = `${m}:${String(s).padStart(2, '0')} left`;
      $('.timer', el).classList.toggle('low', left < 10 * 60e3);
      if (left <= 0) { clearInterval(iv); toast('Time is up! Your exam is being graded.'); submit(); }
    };
    const iv = setInterval(tick, 1000); tick(); onLeave(() => clearInterval(iv));
    let submitted = false;
    async function submit() {
      if (submitted) return; submitted = true; clearInterval(iv);
      $$('[data-submit]', el).forEach(b => { b.disabled = true; b.textContent = 'Grading…'; });
      const details = [];
      for (const w of widgets) {
        let r; try { r = await w.inp.check(); } catch (e) { r = { error: e.message }; }
        const frac = r.error ? (r.score || 0) : (r.score || 0);
        details.push({ id: w.q.id, section: w.section, prompt: w.q.prompt, points: w.q.points, got: Math.round(frac * w.q.points * 10) / 10, html: r.error ? esc(r.error === 'Please answer first.' || /first/.test(r.error) ? 'Not answered.' : r.error) : r.html, solution: (w.q.solution || '') + '<div>' + (w.inp.solutionHtml ? w.inp.solutionHtml() : '') + '</div>', sample: w.q.sample || '', answer: w.inp.getText ? w.inp.getText() : '' });
        const cats = r.correct ? [] : (r.categories && r.categories.length ? r.categories : (w.q.tags || []).slice(0, 1));
        cats.slice(0, 3).forEach(c => Store.addMistake(c, w.q.id));
      }
      const sections = p.sections.map((s, si) => { const d = details.filter(x => x.section === si); return { title: s.title, score: Math.round(d.reduce((a, x) => a + x.got, 0)), max: d.reduce((a, x) => a + x.points, 0) }; });
      const total = sections.reduce((a, s) => a + s.score, 0), max = sections.reduce((a, s) => a + s.max, 0);
      Store.addExam(total, max, { paper: p.id, sections, minutes: Math.round((Date.now() - run.startedAt) / 60e3) });
      LS.set('dbt.lastexam.' + Store.session.id, { paper: p.id, title: p.title, total, max, sections, details, at: new Date().toISOString() });
      LS.del(runKey());
      location.hash = '#/exam/result';
    }
    $$('[data-submit]', el).forEach(b => b.addEventListener('click', () => { if (confirm('Submit your exam now?')) submit(); }));
    $('[data-abort]', el).addEventListener('click', () => { if (confirm('Abandon this exam? Nothing will be saved.')) { LS.del(runKey()); location.hash = '#/exam'; } });
  }
  function viewExamResult(main) {
    const r = LS.get('dbt.lastexam.' + Store.session.id, null);
    if (!r) { location.hash = '#/exam'; return; }
    const pct = Math.round(100 * r.total / r.max);
    main.appendChild(h(`<div><h1>Exam result</h1>
      <div class="card"><div class="row"><div class="stat">${r.total} / ${r.max}</div><div class="muted">${esc(r.title)} · ${new Date(r.at).toLocaleString()}</div></div>
      <p>${pct >= 85 ? 'Excellent work! 🎉' : pct >= 60 ? 'Good job — look at the sections where you lost points.' : 'Keep going — every mistake below is now in your weak-spot tracker, so you can practise exactly those.'}</p>
      ${r.sections.map(s => `<div style="margin:8px 0"><div class="row"><b style="flex:1">${esc(s.title)}</b><span>${s.score}/${s.max}</span></div><div class="bar"><span style="width:${Math.round(100 * s.score / s.max)}%"></span></div></div>`).join('')}
      <div class="row" style="margin-top:12px"><a class="btn primary" href="#/weak">Practise my weak spots</a><a class="btn" href="#/exam">Back to exams</a></div></div>
      <h2>Question by question</h2>
      ${r.details.map((d, i) => `<details class="card"><summary><b>Q${i + 1}</b> — ${d.got}/${d.points} points</summary><div class="prompt">${fill(d.prompt)}</div>
        ${d.answer ? `<p class="small muted">Your answer:</p><pre>${esc(d.answer)}</pre>` : ''}
        <div class="fb info">${d.html || ''}</div><div class="solution"><b>Model answer</b><div>${fill(d.solution)}</div>${d.sample ? `<p>${esc(d.sample)}</p>` : ''}</div></details>`).join('')}
    </div>`));
    $$('[data-solerd]', main).forEach(x => x.remove());
  }

  // ---------------- WEAK SPOTS ----------------
  function topWeak(n) {
    const counts = {};
    const since = Date.now() - 30 * 86400e3;
    Store.data.mistakes.forEach(m => { const w = new Date(m.created_at).getTime() > since ? 1 : 0.5; counts[m.category] = (counts[m.category] || 0) + w; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
  }
  function viewWeak(main) {
    remember('#/weak', 'Weak spots');
    const all = topWeak(100);
    const max = all.length ? all[0][1] : 1;
    const count = (c) => Store.data.mistakes.filter(m => m.category === c).length;
    const practicable = (c) => allLessonEx().some(e => (e.tags || []).includes(c));
    main.appendChild(h(`<div><h1>🎯 Weak-point tracker</h1>
      <p class="muted">Every wrong answer is filed under a category. Recent mistakes (last 30 days) count double.</p>
      ${all.length ? `<div class="card"><a class="btn primary" href="#/practice/top">▶ Practise my weak spots</a></div>
      <div class="card">${all.map(([c, v]) => `<div style="margin:10px 0"><div class="row"><span style="flex:1">${esc(C.categories[c] || c)}</span><span class="small muted">${count(c)} mistake${count(c) > 1 ? 's' : ''}</span>${practicable(c) ? `<a class="btn btn-sm" href="#/practice/${encodeURIComponent(c)}">Practise</a>` : ''}</div><div class="bar"><span style="width:${Math.round(100 * v / max)}%;background:var(--bad)"></span></div></div>`).join('')}</div>`
        : '<div class="card"><p>No mistakes recorded yet. Do some exercises or a mock exam — this page will then show what to practise.</p></div>'}
    </div>`));
  }
  function viewPractice(main, cat) {
    const cats = cat === 'top' ? topWeak(3).map(x => x[0]) : [cat];
    remember('#/practice/' + encodeURIComponent(cat), 'Practice');
    const mistakesOn = (id) => Store.data.mistakes.filter(m => m.item_id === id).length;
    const list = allLessonEx().filter(e => (e.tags || []).some(t => cats.includes(t)))
      .sort((a, b) => (Store.isSolved(a.id) - Store.isSolved(b.id)) || (mistakesOn(b.id) - mistakesOn(a.id)) || ((a.level || 1) - (b.level || 1)))
      .slice(0, 6);
    main.appendChild(h(`<div><p class="small"><a href="#/weak">Weak spots</a> › Practice</p><h1>🎯 Practice: ${esc(cats.map(c => C.categories[c] || c).join(', ') || 'nothing yet')}</h1>
      ${list.length ? '<p class="muted">Unsolved exercises come first. Take your time and use the hints.</p>' : '<div class="card">No exercises for this category yet.</div>'}</div>`));
    list.forEach((ex, i) => { const x = EX[ex.id]; const card = ExerciseCard(ex, { label: `${i + 1}. from "${x.lesson.title}"`, draftKey: `${Store.session.id}.${ex.id}` }); main.appendChild(card.el); onLeave(card.destroy); });
    const cards = C.flashcards.filter(f => cats.some(c => (c.includes('weak') && /weak|partial|owner|cascade/i.test(f.front + f.back)) || (c.includes('multivalued') && /multivalued/i.test(f.front + f.back)) || (c.includes('1to1') && /1:1/.test(f.front + f.back)) || (c.includes('division') && /division|÷/i.test(f.front + f.back)) || (c.includes('dependency') && /NF|dependency/.test(f.front + f.back))));
    if (cards.length) main.appendChild(h(`<div class="card"><h3 style="margin-top:0">Related definitions</h3><dl>${cards.slice(0, 6).map(c => `<dt><b>${esc(c.front)}</b></dt><dd>${esc(c.back)}</dd>`).join('')}</dl></div>`));
  }

  // ---------------- REVIEW SHEET ----------------
  function viewReview(main, mid) {
    const m = C.modules.find(x => x.id === mid), r = m.review, idx = C.modules.indexOf(m) + 1;
    main.appendChild(h(`<div class="sheet"><div class="row no-print"><a href="#/module/${m.id}">‹ Back</a><span class="spacer"></span><button type="button" class="primary" onclick="window.print()">🖨 Print / save as PDF</button></div>
      <div class="card"><h1>Review sheet — Module ${idx}: ${esc(m.title)}</h1><p class="small muted">${esc(CFG.COURSE_NAME || '')}</p>
      <div class="cols">
        <div><h2>Definitions</h2><dl>${r.definitions.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></div>
        <div><h2>Rules</h2><ul>${r.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h2>Common traps ⚠</h2><ul>${r.traps.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h2>Worked example</h2>${fill(r.example)}</div>
        ${mid === 'm1' ? `<div><h2>Chen symbols</h2><table class="t">${[['entity', 'Entity'], ['weak', 'Weak entity'], ['rel', 'Relationship'], ['idrel', 'Identifying rel.'], ['key', 'Key'], ['partial', 'Partial key'], ['multi', 'Multivalued'], ['derived', 'Derived']].map(([k, t]) => `<tr><td style="width:110px">${root.ERD.symbol(k)}</td><td>${t}</td></tr>`).join('')}</table></div>` : ''}
      </div></div></div>`));
  }

  // ---------------- LEADERBOARD ----------------
  async function viewLeaderboard(main) {
    const el = h(`<div><h1>🏆 Class leaderboard</h1><p class="muted">Lessons completed, best mock-exam score and current daily streak. ${Store.leaderboardVisible() ? 'You are shown here.' : 'You have opted out.'} <a href="#/settings">Change in settings</a>.</p><div class="card" data-lb><p class="muted">Loading…</p></div></div>`);
    main.appendChild(el);
    try {
      const rows = await Store.leaderboard();
      rows.sort((a, b) => (b.lessons_completed - a.lessons_completed) || ((b.best_exam_pct || 0) - (a.best_exam_pct || 0)) || (b.current_streak - a.current_streak) || a.name.localeCompare(b.name));
      $('[data-lb]', el).innerHTML = rows.length ? `<div class="table-wrap"><table class="lb"><tr><th>#</th><th>Name</th><th>Lessons</th><th>Best exam</th><th>Streak</th></tr>${rows.map((r, i) => `<tr class="${r.name === Store.session.name ? 'me' : ''}"><td>${i + 1}</td><td>${esc(r.name)}</td><td>${r.lessons_completed} / ${Object.keys(LESSONS).length}</td><td>${r.best_exam_pct == null ? '—' : r.best_exam_pct + '%'}</td><td>🔥 ${r.current_streak}</td></tr>`).join('')}</table></div>` : '<p>Nobody here yet.</p>';
    } catch (e) { $('[data-lb]', el).innerHTML = `<div class="fb bad">Could not load the leaderboard: ${esc(e.message)}</div>`; }
  }

  // ---------------- SETTINGS ----------------
  function viewSettings(main) {
    const el = h(`<div><h1>⚙ Settings</h1>
      <div class="card"><p>Logged in as <b>${esc(Store.session.name)}</b> on this device.</p><button type="button" data-switch>Switch user</button></div>
      <div class="card"><label class="inline-check"><input type="checkbox" data-lb ${Store.leaderboardVisible() ? 'checked' : ''}> Show me on the class leaderboard</label></div>
      <div class="card"><h3 style="margin-top:0">Saving &amp; sync</h3><p>Status: <span data-st></span></p><p class="small muted">Every answer is saved on this device immediately and then sent to the class database. If you are offline, changes wait in a queue and are sent automatically when you are back online.</p><button type="button" data-sync>Sync now</button></div>
      <div class="card"><h3 style="margin-top:0">Appearance</h3><div class="seg">${['auto', 'light', 'dark'].map(t => `<button type="button" data-theme="${t}">${t}</button>`).join('')}</div></div>
      <div class="card"><h3 style="margin-top:0">About names</h3><p class="small muted">Accounts use only a name, so anybody who types your name can open your progress. Don't use this app for anything secret.</p></div></div>`);
    main.appendChild(el);
    const st = () => { $('[data-st]', el).innerHTML = syncChip(); };
    st(); Store.onChange(st);
    $('[data-switch]', el).addEventListener('click', switchUser);
    $('[data-lb]', el).addEventListener('change', (e) => { Store.setLeaderboardVisible(e.target.checked); toast(e.target.checked ? 'You are visible on the leaderboard.' : 'You are hidden from the leaderboard.'); });
    $('[data-sync]', el).addEventListener('click', async () => { await Store.refresh(); st(); toast(Store.status === 'idle' ? 'Everything is saved.' : (Store.statusMsg || 'Local mode')); });
    const cur = LS.get('dbt.theme', 'auto');
    $$('[data-theme]', el).forEach(b => { b.classList.toggle('on', b.dataset.theme === cur); b.addEventListener('click', () => { LS.set('dbt.theme', b.dataset.theme); applyTheme(); $$('[data-theme]', el).forEach(x => x.classList.toggle('on', x === b)); }); });
  }
  function applyTheme() { const t = LS.get('dbt.theme', 'auto'); if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }

  // ---------------- ABOUT THE APP'S DATABASE ----------------
  function viewAboutDb(main) {
    const erd = `ENTITY USERS: *id, name, created_at
WEAK PROGRESS: ~item_id, status, score, attempts, updated_at
WEAK FLASHCARDS: ~card_id, due_at, interval_days, ease
ENTITY MISTAKES: *id, category, item_id, created_at
ENTITY EXAM_RESULTS: *id, score, max_score, breakdown, taken_at
IDREL HAS_PROGRESS: USERS 1, PROGRESS N total
IDREL HAS_CARDS: USERS 1, FLASHCARDS N total
REL MAKES: USERS 1, MISTAKES N total
REL TAKES: USERS 1, EXAM_RESULTS N total`;
    const el = h(`<div><h1>How this app's database works</h1>
      <p class="muted">This app stores your progress in a PostgreSQL database (hosted by Supabase). Its design uses exactly what you learn in this course — so it is one more example to study.</p>
      <div class="card"><h2 style="margin-top:0">1. ER diagram (Chen notation)</h2>
        <p>One strong entity <b>USERS</b>. <b>PROGRESS</b> and <b>FLASHCARDS</b> are modelled as <b>weak entities</b>: a progress row has no key of its own — "lesson:m1l1" exists for every user — so it is identified by the owner's key + the partial key <code>item_id</code>. <b>MISTAKES</b> and <b>EXAM_RESULTS</b> got their own surrogate key <code>id</code> (a counter), because one user can make the same mistake many times. All four relationships are 1:N with total participation on the N side.</p>
        <div data-erd></div></div>
      <div class="card"><h2 style="margin-top:0">2. Relational schema</h2>
<pre>USERS(id PK, name UNIQUE, created_at)
PROGRESS(user_id PK FK->USERS, item_id PK, status, score, attempts, updated_at)
FLASHCARDS(user_id PK FK->USERS, card_id PK, due_at, interval_days, ease)
MISTAKES(id PK, user_id FK->USERS, category, item_id, created_at)
EXAM_RESULTS(id PK, user_id FK->USERS, score, max_score, breakdown, taken_at)</pre>
        <ul><li><b>Weak entity mapping</b>: PROGRESS has PK (user_id, item_id); user_id is also an FK with <code>ON DELETE CASCADE</code> — delete a user and all their progress disappears.</li>
        <li><b>1:N mapping</b>: MISTAKES and EXAM_RESULTS get the FK user_id (the N side).</li>
        <li><b>Candidate keys</b>: USERS has two: <code>id</code> (primary) and <code>name</code> (UNIQUE, compared case-insensitively with a unique index on <code>lower(name)</code>).</li>
        <li><b>Normal form</b>: in every table the only non-trivial FDs have a key on the left (e.g. user_id, item_id → status, score, attempts, updated_at), so all tables are in <b>BCNF</b>.</li>
        <li>Special progress rows: <code>meta:last</code> (where you left off), <code>meta:streak</code> (status = last active day, score = streak), <code>meta:leaderboard</code> (opt-out).</li></ul></div>
      <div class="card"><h2 style="margin-top:0">3. The leaderboard is a query</h2>
        <p>A <b>view</b> (a stored query) joins USERS with PROGRESS and EXAM_RESULTS and aggregates. In this course's relational algebra, the "lessons completed" part is:</p>
        <pre>T1 &lt;- SELECT[item_id LIKE 'lesson:%' AND status='done'](PROGRESS)
T2 &lt;- GROUP[user_id; COUNT(*) AS lessons_completed](T1)
PROJECT[name, lessons_completed](RENAME[id-&gt;user_id](USERS) NATURALJOIN T2)</pre>
        <p class="small muted">(LIKE is SQL pattern matching; it is not part of the basic algebra.) Users with no completed lessons would need a LEFT outer join — the real view uses a subquery that returns 0 for them.</p></div>
      <div class="card"><h2 style="margin-top:0">4. Security without passwords</h2>
        <p><b>Row Level Security (RLS)</b> policies are conditions that PostgreSQL adds to every query. Everybody (the <code>anon</code> role) may read and insert, but a row may only be <b>changed</b> if its <code>user_id</code> equals the user id the app sends in the request header <code>x-user-id</code>. Since there are no passwords this protects against mistakes, not against a determined attacker — fine for a study app.</p></div>
      <div class="card"><h2 style="margin-top:0">5. The full SQL</h2><p class="small muted">This is the file <code>supabase.sql</code> that was pasted into the Supabase SQL editor.</p><pre data-sql class="small">Loading…</pre></div></div>`);
    main.appendChild(el);
    const v = ErdView(erd); $('[data-erd]', el).appendChild(v.el); onLeave(v.destroy);
    fetch('supabase.sql').then(r => r.ok ? r.text() : Promise.reject(new Error(r.status))).then(t => { $('[data-sql]', el).textContent = t; }).catch(() => { $('[data-sql]', el).textContent = 'Open supabase.sql in the project files.'; });
  }

  // ---------------- start ----------------
  applyTheme();
  Store.init();
  render();
})(window);
