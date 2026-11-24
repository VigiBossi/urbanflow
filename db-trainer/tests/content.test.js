// Validates all course content: run with  node tests/content.test.js  (needs: npm i sql.js)
global.window = globalThis;
require('../js/util.js'); require('../js/sampledb.js'); require('../js/ra.js'); require('../js/fd.js'); require('../js/erd.js'); require('../js/schema.js');
for (const f of ['common', 'm1', 'm2', 'm3', 'm4', 'extras']) require('../content/' + f + '.js');
const C = window.CONTENT;
let fails = 0; const fail = (...a) => { fails++; console.log('FAIL', ...a); };
const all = [];
C.modules.forEach(m => { let n = 0; m.lessons.forEach(l => { l.exercises.forEach(e => { all.push(e); n++; }); l.quiz.forEach((q, i) => all.push({ ...q, id: l.id + 'q' + i })); if (l.quiz.length !== 5) fail(l.id, 'quiz length', l.quiz.length);
  if (l.worked.ra) { try { RA.run(l.worked.ra); } catch (e) { fail(l.id, 'worked RA', e.message); } }
  if (l.worked.erd) { try { ERD.parse(l.worked.erd); } catch (e) { fail(l.id, 'worked ERD', e.message); } }
  if (l.worked.fd) { try { FD.analyze(l.worked.fd, l.worked.decomp); } catch (e) { fail(l.id, 'worked FD', e.message); } }
}); console.log(m.id, 'exercises:', n, 'lessons:', m.lessons.length); if (n < 10) fail(m.id, 'fewer than 10 exercises'); });
C.exams.forEach(x => x.sections.forEach(s => s.questions.forEach(q => { if (q.ref) { if (!all.find(e => e.id === q.ref)) fail('missing ref', q.ref); } else all.push(q); })));
const ids = new Set(); all.forEach(e => { if (e.id && ids.has(e.id)) fail('dup id', e.id); ids.add(e.id); });
const ali = (e) => ({ ...C.aliases, ...(e.aliases || {}) });
require('sql.js')().then(SQL => {
  const mkdb = () => { const db = new SQL.Database(); db.run(sampleDbSql()); return db; };
  for (const e of all) {
    try {
      if (e.type === 'query') {
        const r = RA.run(e.ra).result;
        const db = mkdb(); const res = db.exec(e.sql); const last = res[res.length - 1] || { columns: [], values: [] };
        const s = { cols: last.columns.map(c => ({ name: c })), rows: last.values };
        const cmp = RA.compare(s, r, { bag: false });
        if (!cmp.ok) fail(e.id, 'RA vs SQL', cmp.reason, JSON.stringify(r.rows), JSON.stringify(s.rows));
        if (!r.rows.length) fail(e.id, 'empty result');
        console.log(' ', e.id, JSON.stringify(r.rows).slice(0, 110));
      } else if (e.type === 'erd') {
        const m = ERD.parse(e.model); const c = ERD.check(m, m, ali(e)); if (c.score !== 1) fail(e.id, 'self check', c.items.filter(i => !i.ok));
        if (e.start) ERD.parse(e.start);
      } else if (e.type === 'schema') {
        (Array.isArray(e.model) ? e.model : [e.model]).forEach(mt => { const c = SCHEMA.check(mt, mt, e.notes || {}, ali(e)); if (c.score !== 1) fail(e.id, 'schema self', c.items.filter(i => !i.ok)); });
        if (e.erd) ERD.parse(e.erd);
      } else if (e.type === 'fd') {
        const a = FD.analyze(e.problem); if (e.ask === 'closure') FD.parseSet(e.of, a.P.attrs, 'x');
        console.log(' ', e.id, e.ask, 'keys', a.keys.keys.map(k => FD.fmt(k, a.P.attrs)).join(' '), 'nf', a.nf.nf, '3nf', a.syn.relations.map(r => FD.fmt(r.mask, a.P.attrs)).join(' '));
      } else if (e.type === 'mcq') { if (!(e.answer >= 0 && e.answer < e.options.length)) fail(e.id, 'bad answer index'); }
      else if (e.type === 'text' || e.type === 'explain') { if (!e.keywords && !e.exact) fail(e.id, 'no keywords'); }
      else fail(e.id, 'unknown type', e.type);
      if (e.id && !/q\d$/.test(e.id) && !e.id.startsWith('exam') && (!e.hints || !e.solution)) fail(e.id, 'missing hints/solution');
      (e.tags || []).forEach(t => { if (!C.categories[t]) fail(e.id, 'unknown tag', t); });
    } catch (err) { fail(e.id, err.message); }
  }
  C.flashcards.forEach(f => { if (!f.front || !f.back) fail('card', f.id); });
  console.log('items', all.length, 'flashcards', C.flashcards.length, fails ? `\n${fails} FAILURES` : '\nALL CONTENT OK');
  process.exit(fails ? 1 : 0);
});
