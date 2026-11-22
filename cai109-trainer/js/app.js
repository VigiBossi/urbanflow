/* Router, sidebar and theme. Routes use the URL hash so the app works from file://. */
(function () {
  const CAI = window.CAI;
  const { $, $$, esc } = CAI.util;
  const S = CAI.store;

  CAI.findModule = (id) => CAI.modules.find((m) => m.id === id);
  CAI.ui.notFound = (main) => { main.innerHTML = '<div class="empty"><div class="big">🤔</div><p>That page does not exist.</p><a class="btn" href="#/">Back to the dashboard</a></div>'; };

  const routes = [
    [/^\/?$/, 'dashboard', (m) => CAI.ui.dashboard(m)],
    [/^\/modules$/, 'modules', (m) => CAI.ui.modules(m)],
    [/^\/module\/(\w+)$/, 'modules', (m, id) => CAI.ui.module(m, id)],
    [/^\/lesson\/(\w+)\/(\d+)$/, 'modules', (m, id, i) => CAI.ui.lesson(m, id, i)],
    [/^\/practice$/, 'practice', (m) => CAI.ui.practiceHub(m)],
    [/^\/practice\/(\w+)(?:\/(\d+))?$/, 'practice', (m, id, i) => CAI.ui.practiceModule(m, id, i)],
    [/^\/gen\/(\w+)$/, 'practice', (m, id) => CAI.ui.generator(m, id)],
    [/^\/tools(?:\/(\w+))?$/, 'tools', (m, t) => CAI.ui.tools(m, t)],
    [/^\/exam$/, 'exam', (m) => CAI.ui.examHub(m)],
    [/^\/exam\/review\/(\w+)$/, 'exam', (m, id) => CAI.ui.review(m, id)],
    [/^\/exam\/blanks\/(\w+)$/, 'exam', (m, id) => CAI.ui.blanks(m, id)],
    [/^\/exam\/quiz\/(\w+)$/, 'exam', (m, id) => CAI.ui.quiz(m, id)],
    [/^\/mistakes$/, 'mistakes', (m) => CAI.ui.mistakes(m)],
  ];

  function currentModuleId(path) { const m = path.match(/\/(?:module|lesson|practice|exam\/\w+)\/(m\d+)/); return m ? m[1] : null; }

  function refreshChrome() {
    const path = location.hash.replace(/^#/, '') || '/';
    const open = S.openMistakes().length;
    $('#mistake-count').textContent = open ? String(open) : '';
    const mid = currentModuleId(path);
    $('#sidebar-modules').innerHTML = '<div class="small muted" style="padding:0 10px 4px;font-weight:600">MODULES</div>' + CAI.modules.map((m) => {
      const p = S.moduleProgress(m);
      return `<a href="#/module/${m.id}" class="${m.id === mid ? 'active' : ''}" title="${esc(m.title)}"><span>${m.num}.</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.title)}</span><span class="mini-bar"><i style="width:${Math.round(p.pct * 100)}%"></i></span></a>`;
    }).join('');
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    $('#theme-toggle').textContent = dark ? '☀️ Light mode' : '🌙 Dark mode';
  }

  function render() {
    CAI.stopTimers && CAI.stopTimers();
    const main = $('#main');
    const path = location.hash.replace(/^#/, '') || '/';
    let hit = false;
    for (const [re, nav, fn] of routes) {
      const m = path.match(re);
      if (m) {
        hit = true;
        $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === nav));
        try { fn(main, ...m.slice(1)); } catch (e) { console.error(e); main.innerHTML = `<div class="feedback warn">Something went wrong while showing this page: ${esc(e.message)}</div>`; }
        break;
      }
    }
    if (!hit) CAI.ui.notFound(main);
    refreshChrome();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); refreshChrome(); }
  $('#theme-toggle').onclick = () => {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    S.setTheme(t); applyTheme(t);
  };
  if (!S.state.theme && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!S.state.theme) applyTheme(e.matches ? 'dark' : 'light'); });
  }

  CAI.app = { render, refreshChrome };
  window.addEventListener('hashchange', render);
  render();
})();
