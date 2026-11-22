/* Content + engine self-test. Run:  node tests/run-tests.js
   Loads every script in index.html order (no DOM needed) and checks that
   - every generator produces problems whose own answer is accepted,
   - every lesson / bank problem accepts its answer,
   - quizzes and blanks are well-formed,
   - a set of known facts about the engines hold. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !s.includes('/ui/') && !s.endsWith('app.js'));
const ctx = { console, Math, JSON, Date, setTimeout, DataView, ArrayBuffer };
ctx.window = ctx;
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
const CAI = ctx.CAI;

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('FAIL:', msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);

/* answer string the student would type for a problem */
function typed(p) {
  const a = p.answer;
  switch (a.type) {
    case 'bool': return CAI.check.displayAnswer(p);
    case 'list': return a.value.join(', ');
    case 'seq': return a.items.map((x) => x[0]).join(', ');
    case 'choice': return String(a.value);
    default: return String(a.value);
  }
}
function checkProblem(p, where) {
  const r = CAI.check.check(p, typed(p));
  ok(r.ok, `${where}: own answer rejected (${typed(p)}) -> ${JSON.stringify(r)}`);
  ok(p.prompt && p.answer, `${where}: missing prompt/answer`);
  if (p.answer.type !== 'choice') ok((p.hints || []).length === 3, `${where}: needs exactly 3 hints (has ${(p.hints || []).length})`);
  if (p.answer.type === 'choice') ok(p.choices && p.answer.value >= 0 && p.answer.value < p.choices.length, `${where}: bad choice`);
  // the final step's value (if any) must also be accepted as the answer
  const steps = (p.steps || []).filter((s) => s.value != null);
  if (steps.length && p.answer.type !== 'choice') {
    const last = steps[steps.length - 1];
    ok(CAI.check.check(p, last.value).ok, `${where}: last step value "${last.value}" not accepted as answer`);
  }
}

/* --- engine facts --- */
const N = CAI.num, B = CAI.bool;
eq(N.toBase(156, 2), '10011100', 'dec2bin 156');
eq(N.twos(-45, 8), '11010011', 'twos -45');
eq(N.twos(-74, 8), '10110110', 'twos -74');
eq(N.fromTwos('11101100'), -20, 'fromTwos');
eq(N.gray('10110'), '11101', 'gray');
eq(N.grayToBin('11101'), '10110', 'gray inverse');
eq(N.hammingEncode('1011').code, '0110011', 'hamming 1011');
eq(N.hammingSyndrome('0110001').pos, 6, 'syndrome');
eq(N.hammingEncode('0110').code, '1100110', 'hamming 0110');
eq(N.crc('110101', '1011').rem, '111', 'crc example');
eq(N.ieeeEncode(-13.25).hex, 'C1540000', 'ieee -13.25');
eq(N.ieeeEncode(9.75).hex, '411C0000', 'ieee 9.75');
eq(N.ieeeDecode('40C80000').value, 6.25, 'ieee decode');
eq(N.ieeeDecode('C2490000').value, -50.25, 'ieee decode 2');
eq(N.ieeeEncode(0.375).hex, '3EC00000', 'ieee 0.375');
eq(N.huffman({ A: 10, B: 5, C: 3, D: 2 }).total, 35, 'huffman');
eq(N.huffman({ A: 7, B: 3, C: 2, D: 1, E: 1 }).total, 27, 'huffman2');
eq(N.lz78('AABABBBABAABBA').str, '(0,A)(1,B)(2,B)(0,B)(2,A)(3,A)', 'lz78');
eq(N.lz78('ABABABAABB').str, '(0,A)(0,B)(1,B)(3,A)(3,B)', 'lz78 b');
eq(N.lz77decode([[0, 0, 'A'], [0, 0, 'B'], [2, 2, 'A'], [3, 3, 'B']]), 'ABABAABAB', 'lz77');
eq(B.minSOP(['A', 'B', 'C'], [0, 2, 4, 5, 6]).expr, "C' + AB'", 'kmap ex');
eq(B.minSOP(['A', 'B', 'C', 'D'], [0, 2, 5, 7, 8, 10, 13, 15]).expr, "B'D' + BD", 'kmap4');
eq(B.minSOP(['A', 'B', 'C', 'D'], [1, 3, 5, 7, 9, 13], [11, 15]).expr, 'D', 'kmap dc');
eq(B.minPOS(['A', 'B', 'C'], [1, 3, 4, 5, 7]).literals, 4, 'pos');
eq(B.table(B.parse("AB + C'"), ['A', 'B', 'C']).join(''), '10101011', 'tt');
eq(B.table(B.parse("A'C + B"), ['A', 'B', 'C']).join(''), '01110011', 'tt2');
ok(B.equivalent(B.parse('A AND NOT B'), B.parse("AB'")), 'parse words');
ok(B.equivalent(B.parse('(A NAND A) NAND (B NAND B)'), B.parse('A+B')), 'nand or');
ok(B.equivalent(B.parse("A'B + AB'"), B.parse('A xor B')), 'xor');
ok(B.equivalent(B.parse('!(a & b)'), B.parse("a' | b'")), 'symbols');
ok(B.tryParse('A +').error, 'parse error detection');
ok(B.tryParse('(A + B').error, 'paren error');

/* checker behaviour */
const p1 = CAI.gen.make('dec2twos', { n: -45 });
ok(CAI.check.check(p1, '1101 0011').ok, 'spaces in bits');
ok(CAI.check.check(p1, '0xD3').ok, 'hex for 8 bits');
const w1 = CAI.check.check(p1, '11010010');
ok(!w1.ok && w1.msgs.join(' ').includes('Step 2'), 'stopped-early detection: ' + JSON.stringify(w1));
const p2 = CAI.gen.make('dec2hex', { n: 2748 });
ok(CAI.check.check(p2, '0xabc').ok && CAI.check.check(p2, 'ABC h').ok, 'hex normalisation');
const p3 = CAI.gen.make('kmap', { n: 3, m: [1, 3, 5, 6, 7] });
ok(CAI.check.check(p3, 'c + a and b').ok, 'bool words');
const w3 = CAI.check.check(p3, "C + ABC'");
ok(!w3.ok && /simplified|literals/.test(w3.msgs.join(' ')), 'not minimal msg ' + JSON.stringify(w3));

/* --- generators: random runs --- */
for (const d of CAI.gen.list) {
  for (let i = 0; i < 40; i++) {
    let p;
    try { p = CAI.gen.make(d.id); } catch (e) { ok(false, `gen ${d.id} threw ${e.stack}`); break; }
    checkProblem(p, `gen ${d.id} #${i}`);
  }
}

/* --- content --- */
eq(CAI.modules.length, 11, 'module count');
const ids = new Set();
for (const m of CAI.modules) {
  ok(m.lessons.length >= 2, `${m.id} lessons`);
  ok(m.bank.length >= 5, `${m.id} bank has ${m.bank.length} (<5)`);
  ok(m.quiz.length >= 8, `${m.id} quiz has ${m.quiz.length}`);
  ok(m.blanks.length >= 5, `${m.id} blanks has ${m.blanks.length}`);
  ok(m.review && m.review.length > 200, `${m.id} review`);
  for (const l of m.lessons) {
    ok(!ids.has(l.id), 'dup lesson id ' + l.id); ids.add(l.id);
    ok(l.intuition && l.rule && l.example && l.example.steps.length >= 2, `${l.id} lesson parts`);
    checkProblem(l.practice, `lesson ${l.id} practice`);
  }
  m.bank.forEach((p, i) => { ok(!ids.has(p.id), 'dup problem id ' + p.id); ids.add(p.id); checkProblem(p, `${m.id} bank #${i}`); });
  m.quiz.forEach((q, i) => {
    ok(q.o.length >= 3 && q.a >= 0 && q.a < q.o.length && q.e, `${m.id} quiz #${i} malformed`);
    ok(new Set(q.o).size === q.o.length, `${m.id} quiz #${i} duplicate options`);
  });
  m.blanks.forEach((b, i) => ok(b.s.includes('___') && b.a.length, `${m.id} blank #${i}`));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
