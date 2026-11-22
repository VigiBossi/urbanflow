// Re-checks every Java snippet in java-midterm-prep.html with the real javac/java:
// compiles and runs each one and compares it with the stored answer.
// usage: node verify-answers.js java-midterm-prep.html   (needs Node and a JDK on the PATH)
const fs = require('fs'), path = require('path'), os = require('os');
const { spawn } = require('child_process');
const file = process.argv[2];
const txt = fs.readFileSync(file, 'utf8');
const data = txt.slice(txt.indexOf('/*DATA-START*/'), txt.indexOf('/*DATA-END*/'));
const D = new Function(data + '\nreturn {TOPICS,QUIZ,OUTPUT,BUGS,TASKS};')();
const WORK = path.join(__dirname, 'work'); fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK);

const norm = s => s.replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
function wrap(code) {
  if (/\bclass\s+\w+/.test(code)) return code;
  if (/static\s+[\w\[\]<>]+\s+\w+\s*\(/.test(code) && /void\s+main\s*\(/.test(code))
    return 'import java.util.*;\npublic class Main {\n' + code + '\n}\n';
  return 'import java.util.*;\npublic class Main {\npublic static void main(String[] args) {\n' + code + '\n}\n}\n';
}
function run(cmd, args, opts = {}) {
  return new Promise(res => {
    const p = spawn(cmd, args, { cwd: opts.cwd });
    let out = '', err = '', done = false;
    const t = setTimeout(() => { if (!done) { p.kill('SIGKILL'); } }, opts.timeout || 8000);
    p.stdout.on('data', d => { out += d; if (out.length > 1e5) p.kill('SIGKILL'); });
    p.stderr.on('data', d => err += d);
    p.on('close', (code, sig) => { done = true; clearTimeout(t); res({ code, sig, out, err: err.replace(/Picked up .*\n/g, '') }); });
    if (opts.input != null) p.stdin.end(opts.input); else p.stdin.end();
  });
}
let n = 0;
async function exec(code, input) {
  const dir = path.join(WORK, 'c' + (n++)); fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'Main.java'), wrap(code));
  const c = await run('javac', ['-nowarn', 'Main.java'], { cwd: dir, timeout: 60000 });
  if (c.code !== 0) return { compiled: false, err: c.err };
  const r = await run('java', ['-cp', '.', 'Main'], { cwd: dir, input: input || '', timeout: 4000 });
  return { compiled: true, ok: r.code === 0, out: r.out, err: r.err, timedOut: r.sig === 'SIGKILL' };
}
const jobs = [], problems = [], warnings = [];
const add = (label, fn) => jobs.push({ label, fn });
const topicIds = new Set(D.TOPICS.map(t => t.id));

D.QUIZ.forEach((q, i) => {
  const L = `QUIZ#${i} (${q.t}) ${q.q.slice(0, 50)}`;
  if (!topicIds.has(q.t)) problems.push(L + ': bad topic');
  if (![1, 2, 3].includes(q.d)) problems.push(L + ': bad difficulty');
  if (q.tf) { if (typeof q.a !== 'boolean') problems.push(L + ': tf without boolean a'); }
  else {
    if (!Array.isArray(q.o) || q.o.length < 3) problems.push(L + ': needs options');
    else if (new Set(q.o).size !== q.o.length) problems.push(L + ': duplicate options');
  }
  if (!q.e) problems.push(L + ': no explanation');
  if (q.c && !q.v && q.vx == null) warnings.push(L + ': code not verified');
  if (!q.c) return;
  add(L, async () => {
    const r = await exec(q.c, q.in);
    if (q.v === 'ce') return r.compiled ? 'expected compile error but compiled' : null;
    if (!r.compiled) return 'compile error:\n' + r.err;
    if (q.v === 'rt') return r.ok ? 'expected runtime exception, got output ' + JSON.stringify(r.out) : null;
    if (!r.ok) return 'runtime failure: ' + r.err.split('\n')[0];
    if (q.v === 'out' && norm(r.out) !== norm(q.o[0])) return `output ${JSON.stringify(r.out)} != option0 ${JSON.stringify(q.o[0])}`;
    if (q.vx != null && norm(r.out) !== norm(q.vx)) return `output ${JSON.stringify(r.out)} != vx ${JSON.stringify(q.vx)}`;
    if (q.v === 'out') for (let k = 1; k < q.o.length; k++) if (norm(q.o[k]) === norm(r.out)) return 'a wrong option equals the output';
    return null;
  });
});
D.OUTPUT.forEach((q, i) => {
  const L = `OUTPUT#${i} (${q.t})`;
  if (!topicIds.has(q.t) || !q.e) problems.push(L + ': bad topic/no explanation');
  add(L, async () => {
    const r = await exec(q.c, q.in);
    if (!r.compiled) return 'compile error:\n' + r.err;
    if (!r.ok) return 'runtime failure ' + r.err;
    if (norm(r.out) !== norm(q.out)) return `actual ${JSON.stringify(r.out)} expected ${JSON.stringify(q.out)}`;
    return null;
  });
});
D.BUGS.forEach((q, i) => {
  const L = `BUGS#${i} (${q.t}) line ${q.line}`;
  const lines = q.c.split('\n');
  if (!topicIds.has(q.t) || !q.e || !['compile', 'logic', 'runtime'].includes(q.kind)) problems.push(L + ': bad meta');
  if (q.line < 1 || q.line > lines.length || !lines[q.line - 1].trim()) problems.push(L + ': bad line');
  if (new Set(q.o).size !== q.o.length) problems.push(L + ': duplicate options');
  const replaced = opt => { const ls = lines.slice(); ls[q.line - 1] = ls[q.line - 1].match(/^\s*/)[0] + opt; return ls.join('\n'); };
  add(L + ' [buggy]', async () => {
    const r = await exec(q.c, q.in);
    if (q.kind === 'compile') return r.compiled ? 'buggy code compiled' : null;
    if (!r.compiled) return 'buggy code does not compile:\n' + r.err;
    if (q.kind === 'runtime') return r.ok && !r.timedOut ? 'expected runtime error' : null;
    if (r.ok && norm(r.out) === norm(q.out)) return 'buggy code already prints the right output';
    return null;
  });
  q.o.forEach((opt, k) => add(L + ` [opt ${k}]`, async () => {
    const r = await exec(replaced(opt), q.in);
    const good = r.compiled && r.ok && !r.timedOut && norm(r.out) === norm(q.out);
    if (k === 0 && !good) return 'FIX does not work: ' + (r.compiled ? JSON.stringify(r.out) + ' ' + (r.err || '').split('\n')[0] : r.err);
    if (k > 0 && good) return 'wrong option ' + JSON.stringify(opt) + ' also gives the right output';
    return null;
  }));
});
D.TASKS.forEach((q, i) => {
  const L = `TASK#${i} ${q.title}`;
  if (!topicIds.has(q.t) || !q.hints || !q.hints.length) problems.push(L + ': bad meta');
  add(L, async () => {
    const r = await exec(q.sol, q.in);
    if (!r.compiled) return 'compile error\n' + r.err;
    if (!r.ok) return 'runtime ' + r.err;
    if (norm(r.out) !== norm(q.out)) return `actual ${JSON.stringify(r.out)} expected ${JSON.stringify(q.out)}`;
    return null;
  });
});

(async () => {
  let idx = 0; const P = os.cpus().length;
  await Promise.all(Array.from({ length: P }, async () => {
    while (idx < jobs.length) { const j = jobs[idx++]; const e = await j.fn(); if (e) problems.push(j.label + ': ' + e); }
  }));
  const counts = {}; D.QUIZ.forEach(q => counts[q.t] = (counts[q.t] || 0) + 1);
  console.log('quiz per topic', counts, 'total', D.QUIZ.length, '| output', D.OUTPUT.length, '| bugs', D.BUGS.length, '| tasks', D.TASKS.length);
  console.log('jobs run:', jobs.length);
  warnings.forEach(w => console.log('WARN', w));
  problems.forEach(p => console.log('PROBLEM', p));
  console.log(problems.length ? problems.length + ' problems' : 'ALL CHECKS PASSED');
  process.exit(problems.length ? 1 : 0);
})();
