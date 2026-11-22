(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m6', id, o);
  const tt = (head, rows) => `<table class="work mono tt"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

  CAI.modules.push({
    id: 'm6', num: 6, icon: '🔌', title: 'Logic Gates',
    summary: 'AND, OR, NOT, NAND, NOR, XOR, XNOR, truth tables and universal gates.',
    generators: ['gateEval', 'gateIdentify', 'ttColumn'],
    lessons: [
      {
        id: 'm6l1', title: 'AND, OR, NOT and truth tables', minutes: 6,
        intuition: `<p>Gates are tiny decision makers. <b>AND</b> is a strict bouncer: everyone must say yes. <b>OR</b> is relaxed: anyone saying yes is enough. <b>NOT</b> just says the opposite. A <b>truth table</b> lists every possible input combination (2<sup>n</sup> rows for n inputs) with the output.</p>`,
        rule: `${tt(['A', 'B', 'A·B (AND)', 'A+B (OR)', "A' (NOT A)"], [[0, 0, 0, 0, 1], [0, 1, 0, 1, 1], [1, 0, 0, 1, 0], [1, 1, 1, 1, 0]])}<p>Order the rows by counting in binary (00, 01, 10, 11). With 3 inputs: 000 … 111 (8 rows). Precedence: NOT first, then AND, then OR — like −, ×, +.</p>`,
        example: {
          prompt: 'Evaluate <b class="mono">F = (A + B)·C\'</b> for A = 1, B = 0, C = 1, and for A = 0, B = 1, C = 0.',
          steps: [
            { title: 'Row A=1, B=0, C=1: brackets first', html: 'A + B = 1 + 0 = 1' },
            { title: 'Then NOT C and AND', html: "C' = 0 → F = 1·0 = <b>0</b>" },
            { title: 'Row A=0, B=1, C=0', html: "A + B = 1, C' = 1 → F = 1·1 = <b>1</b>" },
            { title: 'Double-check', html: 'F can only be 1 when C = 0 — the first row has C = 1, so 0 is right ✔' },
          ],
          answer: 'F(1,0,1) = <b>0</b>, F(0,1,0) = <b>1</b>',
        },
        practice: G.make('evalExpr', { expr: "A'B + BC'", env: { A: 0, B: 1, C: 1 } }),
        more: 'gateEval',
      },
      {
        id: 'm6l2', title: 'NAND, NOR, XOR, XNOR and universal gates', minutes: 8,
        intuition: `<p>NAND and NOR are AND/OR followed by a NOT (the little bubble). They are cheap to build in silicon and <b>universal</b>: any circuit can be built from NAND gates alone (or NOR alone). XOR answers “are the inputs different?”; XNOR answers “are they equal?”.</p>`,
        rule: `${tt(['A', 'B', 'NAND', 'NOR', 'XOR', 'XNOR'], [[0, 0, 1, 1, 0, 1], [0, 1, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0], [1, 1, 0, 0, 0, 1]])}<ul><li>NAND = (AB)', NOR = (A+B)', XOR = A'B + AB', XNOR = A'B' + AB.</li><li>Multi-input XOR = 1 when an <b>odd</b> number of inputs are 1 (a parity generator).</li><li>With NAND only: NOT A = A NAND A; AND = (A NAND B) NAND (A NAND B); OR = (A NAND A) NAND (B NAND B).</li></ul>`,
        example: {
          prompt: 'Build <b>A AND B</b> using only NAND gates.',
          steps: [
            { title: 'One NAND gives the inverted AND', html: 'X = A NAND B = (AB)\'' },
            { title: 'We need to undo that inversion: a NAND with both inputs tied together is a NOT', html: 'X NAND X = (X·X)\' = X\'' },
            { title: 'Combine', html: '(A NAND B) NAND (A NAND B) = ((AB)\')\' = <b>AB</b>' },
            { title: 'Double-check with a row', html: 'A=1,B=1: A NAND B = 0, 0 NAND 0 = 1 = A·B ✔. A=1,B=0: 1, then 1 NAND 1 = 0 ✔' },
          ],
          answer: '<b class="mono">(A NAND B) NAND (A NAND B)</b> — two NAND gates',
        },
        practice: C('nand-or', {
          prompt: 'Write <b>A + B</b> (A OR B) using <b>only NAND</b> operations. Type NAND as a word, e.g. <span class="mono">(A NAND B) NAND C</span>.',
          format: 'Use only NAND, variables and parentheses',
          answer: { type: 'bool', value: '(A NAND A) NAND (B NAND B)', ops: ['nand'] },
          hints: ["DeMorgan: A + B = (A'B')' — that is a NAND of A' and B'.", "So you need A' and B' first. How do you make NOT with one NAND gate?", "A' = A NAND A, B' = B NAND B. Now NAND those two together."],
          steps: [
            { ask: "Write A' using only NAND.", value: 'A NAND A', vtype: 'bool', show: "A NAND A = (AA)' = A'" },
            { ask: "Write B' using only NAND.", value: 'B NAND B', vtype: 'bool', show: "B NAND B = B'" },
            { ask: 'Final expression for A + B?', value: '(A NAND A) NAND (B NAND B)', vtype: 'bool', show: "(A' · B')' = A + B → <b class=\"mono\">(A NAND A) NAND (B NAND B)</b>" },
          ],
          finalCheck: 'Final step: the outer gate must also be a NAND, and you should not use NOT or \' at all.',
        }),
        more: 'gateEval',
      },
      {
        id: 'm6l3', title: 'Truth tables from expressions', minutes: 7,
        intuition: `<p>A truth table is the “fingerprint” of a circuit: two circuits with the same truth table do the same job, however different they look. To build one methodically, add <b>helper columns</b> for the pieces of the expression, then combine them.</p>`,
        rule: `<ol><li>Write all 2<sup>n</sup> input rows in binary counting order (A is the MSB).</li><li>Add a column for each sub-expression (NOT terms, products …).</li><li>Combine the helper columns with the outer operator, row by row.</li></ol>`,
        example: {
          prompt: "Build the truth table of <b class=\"mono\">F = AB + C'</b>.",
          steps: [
            { title: 'Helper column AB (1 only when A = B = 1)', html: 'rows 110 and 111 → AB = 1' },
            { title: "Helper column C' (1 when C = 0)", html: "rows 000, 010, 100, 110 → C' = 1" },
            { title: 'OR the helper columns', html: tt(['A', 'B', 'C', 'AB', "C'", 'F'], [[0, 0, 0, 0, 1, '<b>1</b>'], [0, 0, 1, 0, 0, '<b>0</b>'], [0, 1, 0, 0, 1, '<b>1</b>'], [0, 1, 1, 0, 0, '<b>0</b>'], [1, 0, 0, 0, 1, '<b>1</b>'], [1, 0, 1, 0, 0, '<b>0</b>'], [1, 1, 0, 1, 1, '<b>1</b>'], [1, 1, 1, 1, 0, '<b>1</b>']]) },
            { title: 'Double-check the last rows', html: 'Row 111: AB = 1 → F = 1 ✔. Row 101: AB = 0 and C\' = 0 → F = 0 ✔' },
          ],
          answer: 'F column = <b class="mono">10101011</b>',
        },
        practice: G.make('ttColumn', { expr: "A'C + B" }),
        more: 'ttColumn',
      },
    ],
    bank: [
      G.make('gateEval', { gate: 'NOR', ins: [0, 0, 1] }),
      G.make('gateEval', { gate: 'XOR', ins: [1, 1, 1] }),
      G.make('gateEval', { gate: 'NAND', ins: [1, 1] }),
      G.make('gateIdentify', { gate: 'XNOR' }),
      G.make('ttColumn', { expr: '(A + B)C\'' }),
      G.make('ttColumn', { expr: 'A XOR B + C' }),
      C('nor-not', {
        prompt: 'Write <b>NOT A</b> using a single <b>NOR</b> operation.', format: 'e.g. X NOR Y',
        answer: { type: 'bool', value: 'A NOR A', ops: ['nor'] },
        hints: ['NOR = (X + Y)\'.', 'What happens if both inputs are the same signal?', "(A + A)' = A'."],
        steps: [{ ask: 'Simplify A + A', value: 'A', vtype: 'bool', show: 'A + A = A (idempotent)' }, { ask: 'Final NOR expression?', value: 'A NOR A', vtype: 'bool', show: '<b>A NOR A</b> = (A+A)\' = A\'' }],
        finalCheck: 'Use NOR only — no \' allowed.',
      }),
      C('xor3', {
        prompt: 'How many rows of the truth table of a 3-input XOR gate have output 1?', format: 'A whole number',
        answer: { type: 'num', base: 10, value: '4' },
        hints: ['3 inputs → 8 rows.', 'XOR = 1 when an odd number of inputs are 1.', 'Rows with exactly one 1: 3; with three 1s: 1.'],
        steps: [{ ask: 'Rows with exactly one 1?', value: '3', show: '001, 010, 100' }, { ask: 'Rows with exactly three 1s?', value: '1', show: '111' }, { ask: 'Total?', value: '4', show: '3 + 1 = <b>4</b>' }],
        finalCheck: 'Add both groups of odd rows.',
      }),
    ],
    review: `
      <h3>Gate summary</h3>
      ${tt(['Gate', 'Expression', 'Output is 1 when…'], [['AND', 'AB', 'all inputs are 1'], ['OR', 'A + B', 'at least one input is 1'], ['NOT', "A'", 'input is 0'], ['NAND', "(AB)'", 'at least one input is 0'], ['NOR', "(A + B)'", 'all inputs are 0'], ['XOR', "A ⊕ B = A'B + AB'", 'odd number of 1s'], ['XNOR', "(A ⊕ B)' = A'B' + AB", 'even number of 1s / inputs equal']])}
      <h3>Truth tables</h3><p>n inputs → 2ⁿ rows, listed in binary counting order (A = MSB). Two expressions are equivalent ⇔ identical truth tables.</p>
      <h3>Universal gates</h3><ul><li>NOT A = A NAND A = A NOR A</li><li>AND = NAND followed by NAND-as-NOT</li><li>OR = (A NAND A) NAND (B NAND B)</li><li>Similarly with NOR: OR = NOR + NOT; AND = (A NOR A) NOR (B NOR B)</li></ul>
      <p class="tip">⚠ Exam traps: forgetting the bubble; mixing up NAND and NOR; listing rows in the wrong order.</p>`,
    blanks: [
      { s: 'A truth table for a function of n variables has ___ rows.', a: ['2^n', '2**n', '2 to the n'] },
      { s: 'The ___ gate outputs 1 only when all of its inputs are 0.', a: ['NOR'] },
      { s: 'NAND and NOR are called ___ gates because any logic function can be built from them alone.', a: ['universal'] },
      { s: 'The XOR of several inputs is 1 when an ___ number of inputs are 1.', a: ['odd'] },
      { s: 'The ___ gate is also called an equivalence gate because it outputs 1 when its inputs are equal.', a: ['XNOR'] },
      { s: 'The small circle at a gate output that means inversion is called a ___.', a: ['bubble'] },
    ],
    quiz: [
      { q: 'Which gate gives output 0 only when both inputs are 1?', o: ['NAND', 'NOR', 'AND', 'XOR'], a: 0, e: 'NAND = NOT AND: the only 0 is at 11.' },
      { q: 'For which inputs does A XNOR B = 1?', o: ['A = B', 'A ≠ B', 'A = B = 1 only', 'Never'], a: 0, e: 'XNOR is the equality detector.' },
      { q: 'A 4-input AND gate has how many input combinations that give 1?', o: ['1', '4', '15', '16'], a: 0, e: 'Only 1111.' },
      { q: 'A 3-input OR gate has how many input combinations that give 0?', o: ['1', '3', '7', '8'], a: 0, e: 'Only 000.' },
      { q: 'A NAND gate with both inputs tied together behaves as:', o: ['NOT', 'AND', 'Buffer', 'OR'], a: 0, e: "(A·A)' = A'." },
      { q: 'Output of a 3-input XOR with inputs 1, 0, 1:', o: ['0', '1', 'undefined', 'depends on order'], a: 0, e: 'Two 1s → even → 0.' },
      { q: "What is (A + B)' for A = 0, B = 0?", o: ['1', '0', 'A', 'B'], a: 0, e: 'NOR of 0 and 0 is 1.' },
      { q: 'How many 2-input NAND gates are needed for an OR gate?', o: ['3', '2', '1', '4'], a: 0, e: "Two NANDs make A' and B', a third NANDs them." },
      { q: 'Which expression equals A XOR B?', o: ["A'B + AB'", "AB + A'B'", "A'B'", '(A + B)\''], a: 0, e: 'XOR is 1 exactly when one input is 1 and the other is 0.' },
    ],
  });
})();
