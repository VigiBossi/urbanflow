/* Progress persistence in localStorage. All writes go through CAI.store. */
(function () {
  const CAI = window.CAI;
  const KEY = 'cai109.progress.v1';

  const fresh = () => ({
    lessons: {},          // lessonId -> timestamp completed
    solved: {},           // problemId -> timestamp solved (bank problems)
    genSolved: {},        // generatorId -> count solved
    mistakes: [],         // [{key, problem, module, source, added, tries, resolved}]
    quiz: {},             // moduleId|'all' -> {best, last, total}
    blanks: {},           // moduleId -> best score
    last: null,           // {route, label, at}
    theme: null,          // 'light' | 'dark' | null (follow system)
    settings: { speedBump: true },
    stats: { correct: 0, wrong: 0, firstTry: 0 },
  });

  let state = fresh();
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (raw) state = Object.assign(fresh(), JSON.parse(raw));
    state.settings = Object.assign(fresh().settings, state.settings || {});
    state.stats = Object.assign(fresh().stats, state.stats || {});
  } catch (e) { state = fresh(); }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  };

  const S = (CAI.store = {
    get state() { return state; },
    save,
    markLesson(id) { if (!state.lessons[id]) { state.lessons[id] = Date.now(); save(); } },
    lessonDone: (id) => !!state.lessons[id],
    markSolved(problem, firstTry) {
      state.stats.correct++;
      if (firstTry) state.stats.firstTry++;
      if (problem.source === 'bank') state.solved[problem.id] = Date.now();
      if (problem.gen && problem.source === 'generated') state.genSolved[problem.gen] = (state.genSolved[problem.gen] || 0) + 1;
      save();
    },
    isSolved: (id) => !!state.solved[id],
    countWrong() { state.stats.wrong++; save(); },

    /* Mistakes keep a full copy of the problem so it can be retried later */
    addMistake(problem, source) {
      const key = problem.id || problem.prompt;
      const existing = state.mistakes.find((m) => m.key === key);
      if (existing) { existing.tries++; existing.resolved = false; existing.added = Date.now(); }
      else state.mistakes.unshift({ key, problem, module: problem.module || null, source: source || 'practice', added: Date.now(), tries: 1, resolved: false });
      if (state.mistakes.length > 300) state.mistakes.length = 300;
      save();
    },
    resolveMistake(key) { const m = state.mistakes.find((x) => x.key === key); if (m) { m.resolved = true; save(); } },
    removeMistake(key) { state.mistakes = state.mistakes.filter((x) => x.key !== key); save(); },
    clearResolved() { state.mistakes = state.mistakes.filter((x) => !x.resolved); save(); },
    openMistakes: () => state.mistakes.filter((m) => !m.resolved),

    recordQuiz(id, score, total) {
      const q = state.quiz[id] || { best: 0, last: 0, total };
      q.last = score / total; q.best = Math.max(q.best, q.last); q.total = total; q.at = Date.now();
      state.quiz[id] = q; save();
    },
    recordBlanks(id, score) { state.blanks[id] = Math.max(state.blanks[id] || 0, score); save(); },
    setLast(route, label) { state.last = { route, label, at: Date.now() }; save(); },
    setTheme(t) { state.theme = t; save(); },
    setSetting(k, v) { state.settings[k] = v; save(); },

    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON(txt) { const obj = JSON.parse(txt); state = Object.assign(fresh(), obj); save(); },
    reset() { state = fresh(); save(); },
  });

  /* Progress for a module = finished lessons + solved bank problems */
  S.moduleProgress = (mod) => {
    const lessons = mod.lessons.length;
    const bank = mod.bank.length;
    const doneL = mod.lessons.filter((l) => state.lessons[l.id]).length;
    const doneB = mod.bank.filter((p) => state.solved[p.id]).length;
    return { lessons, bank, doneL, doneB, pct: (doneL + doneB) / Math.max(1, lessons + bank) };
  };
})();
