(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m8', id, o);

  CAI.modules.push({
    id: 'm8', num: 8, icon: 'Σ', title: 'Minterms & Maxterms',
    summary: 'Canonical SOP and POS, Σm / ΠM notation, converting between them, and don’t-care conditions.',
    generators: ['exprToMinterms', 'min2max', 'maxToPOS'],
    lessons: [
      {
        id: 'm8l1', title: 'Minterms, maxterms and canonical forms', minutes: 8,
        intuition: `<p>A <b>minterm</b> is a product term that “switches on” for exactly ONE row of the truth table — like a key that fits a single lock. OR together the minterms of the rows where F = 1 and you have F. A <b>maxterm</b> is the opposite: a sum that is 0 in exactly one row; AND together the maxterms of the rows where F = 0.</p>`,
        rule: `<ul><li>Minterm mᵢ: product of ALL variables; a variable is <b>complemented when its bit is 0</b>. (m₅ for ABC = 101 is AB'C.)</li><li>Maxterm Mᵢ: sum of ALL variables; a variable is <b>complemented when its bit is 1</b>. (M₅ = A' + B + C'.)</li><li>Canonical SOP: F = Σm(rows where F = 1). Canonical POS: F = ΠM(rows where F = 0).</li><li>Mᵢ = (mᵢ)'. The Σ list and the Π list together contain every row exactly once.</li></ul>`,
        example: {
          prompt: "Write <b class=\"mono\">F(A,B,C) = A'B + AC</b> as Σm and ΠM.",
          steps: [
            { title: "A'B covers the rows with A=0, B=1 (C free)", html: 'rows 010 = 2 and 011 = 3' },
            { title: 'AC covers the rows with A=1, C=1 (B free)', html: 'rows 101 = 5 and 111 = 7' },
            { title: 'Minterm list and canonical SOP', html: "F = Σm(2, 3, 5, 7) = A'BC' + A'BC + AB'C + ABC" },
            { title: 'Maxterms = all other rows', html: "F = ΠM(0, 1, 4, 6) = (A+B+C)(A+B+C')(A'+B+C)(A'+B'+C)" },
          ],
          answer: 'F = <b>Σm(2, 3, 5, 7) = ΠM(0, 1, 4, 6)</b>',
        },
        practice: G.make('exprToMinterms', { expr: "AB' + C" }),
        more: 'exprToMinterms',
      },
      {
        id: 'm8l2', title: 'Converting forms and don’t-care conditions', minutes: 7,
        intuition: `<p>Sometimes certain input combinations can never happen (e.g. BCD inputs 1010–1111), or we simply do not care what the output is. Those rows are <b>don’t cares</b> (X or d). We are free to treat each one as 0 or 1 — whichever makes the circuit simpler.</p>`,
        rule: `<ul><li>Σm → ΠM: list the numbers 0 … 2ⁿ−1 that are <b>not</b> minterms (and not don’t-cares).</li><li>F' has the minterms that F does not.</li><li>Notation: F = Σm(…) + d(…) or F = ΠM(…) · D(…).</li><li>Don’t cares appear in neither the Σ list nor the Π list; use them only if they help make a group bigger.</li></ul>`,
        example: {
          prompt: 'F(A,B,C) = Σm(1, 3, 5) + d(7). Find the simplest SOP.',
          steps: [
            { title: 'Without the don’t-care', html: "rows 1, 3, 5 → A'C + B'C (4 literals)" },
            { title: 'Try setting d7 = 1', html: 'rows 1, 3, 5, 7 = every row with C = 1' },
            { title: 'That is a single term', html: 'F = <b>C</b>' },
            { title: 'Double-check', html: 'Rows 1, 3, 5 have C = 1 ✔; rows 0, 2, 4, 6 have C = 0 ✔; row 7 is a don’t-care, so its value does not matter' },
          ],
          answer: 'F = <b>C</b>',
        },
        practice: G.make('min2max', { n: 4, m: [0, 2, 5, 7, 8, 10, 13, 15] }),
        more: 'min2max',
      },
    ],
    bank: [
      G.make('exprToMinterms', { expr: "(A + B)C'" }),
      G.make('exprToMinterms', { expr: "A'B'C + AB" }),
      G.make('min2max', { n: 3, m: [1, 2, 4, 7] }),
      G.make('maxToPOS', { M: [0, 3] }),
      G.make('maxToPOS', { M: [2, 5] }),
      C('minterm-name', {
        prompt: 'Write minterm <b>m<sub>6</sub></b> of F(A,B,C,D) as a product term.', format: "e.g. A'BCD'",
        answer: { type: 'bool', value: "A'BCD'", vars: ['A', 'B', 'C', 'D'] },
        hints: ['Write 6 as a 4-bit binary number (A is the MSB).', '6 = 0110.', 'In a minterm, a 0 bit means the variable is complemented.'],
        steps: [{ ask: '6 in 4 bits?', value: '0110', vtype: 'exact', show: '0110' }, { ask: 'Minterm?', value: "A'BCD'", vtype: 'bool', show: "<b>A'BCD'</b>" }],
        finalCheck: 'Plug ABCD = 0110 into your term — it must be 1, and 0 for every other row.',
      }),
      C('dc-count', {
        prompt: 'A BCD-to-something circuit has inputs ABCD (one BCD digit). How many of the 16 input combinations are don’t-care conditions?', format: 'A whole number',
        answer: { type: 'num', base: 10, value: '6' },
        hints: ['Valid BCD digits are 0 … 9.', 'How many 4-bit codes exist in total?', '16 − 10 = ?'],
        steps: [{ ask: 'Valid codes?', value: '10', show: '0000 … 1001 → 10' }, { ask: 'Don’t cares?', value: '6', show: '16 − 10 = <b>6</b> (1010 … 1111)' }],
        finalCheck: 'Remember 0 is a valid digit too.',
      }),
    ],
    review: `
      <h3>Definitions</h3><ul><li>Literal: a variable or its complement.</li><li>Minterm mᵢ: product of all n variables; bit 0 → complemented. 1 for row i only.</li><li>Maxterm Mᵢ: sum of all n variables; bit 1 → complemented. 0 for row i only.</li><li>Mᵢ = mᵢ'.</li></ul>
      <h3>Canonical forms</h3><ul><li>SOP: F = Σm(rows with F=1).</li><li>POS: F = ΠM(rows with F=0).</li><li>Convert: Π list = all indices not in the Σ list (and not don’t-cares).</li><li>F' = Σm(the maxterm indices of F).</li></ul>
      <h3>Standard (non-canonical) forms</h3><p>SOP/POS with terms that do not contain every variable, e.g. A'B + C. A term missing k variables covers 2ᵏ rows.</p>
      <h3>Don’t cares</h3><p>Written d(…) or X. Treat as 1 or 0, whichever simplifies more. Typical source: impossible inputs (BCD 10–15).</p>
      <p class="tip">⚠ Exam traps: complementing maxterm variables the minterm way; forgetting that a missing variable doubles the rows covered; putting don’t-cares in the Π list.</p>`,
    blanks: [
      { s: 'A product term that contains every variable exactly once is called a ___.', a: ['minterm'] },
      { s: 'In a maxterm, a variable is complemented when its bit in the row number is ___.', a: ['1', 'one'] },
      { s: 'A canonical SOP expression is a sum of ___.', a: ['minterms'] },
      { s: 'An input combination whose output value does not matter is called a ___ condition.', a: ["don't care", 'dont care', 'don’t care', "don't-care"] },
      { s: 'For 3 variables, if F = Σm(0,1,2), then F = ΠM(3,4,5,6,___).', a: ['7'] },
      { s: 'A product term that is missing two of the variables covers ___ rows of the truth table.', a: ['4', 'four'] },
    ],
    quiz: [
      { q: 'Minterm m₃ of F(A,B,C) is:', o: ["A'BC", "AB'C'", "A + B' + C'", "A'B'C"], a: 0, e: '3 = 011 → A\'BC.' },
      { q: 'Maxterm M₃ of F(A,B,C) is:', o: ["A + B' + C'", "A'BC", "A' + B + C", "A + B + C'"], a: 0, e: '3 = 011 → bits that are 1 are complemented: A + B\' + C\'.' },
      { q: 'If F(A,B,C) = Σm(0, 2, 6, 7), then F = ΠM(…):', o: ['1, 3, 4, 5', '0, 2, 6, 7', '1, 3, 5', '1, 3, 4, 5, 7'], a: 0, e: 'All other indices of 0…7.' },
      { q: 'If F = Σm(1, 4) over A,B,C, then F\' = Σm(…):', o: ['0, 2, 3, 5, 6, 7', '1, 4', '6, 3', '0, 2, 3'], a: 0, e: 'F\' is 1 exactly where F is 0.' },
      { q: 'How many minterms does F(A,B,C,D) = A have?', o: ['8', '1', '4', '16'], a: 0, e: 'A = 1 in half of the 16 rows.' },
      { q: 'Which is a canonical SOP for 3 variables?', o: ["A'BC + AB'C", "AB + C", "(A + B)(C)", "A'B + BC'"], a: 0, e: 'Every term contains all three variables.' },
      { q: 'Don’t-care conditions are usually written in the list:', o: ['d( )', 'Σm( )', 'ΠM( )', 'Δ( )'], a: 0, e: 'e.g. F = Σm(1,3) + d(5,7).' },
      { q: 'The numbers inside F = ΠM( … ) are the rows where F equals:', o: ['0', '1', 'a don’t-care', 'either 0 or 1'], a: 0, e: 'Each maxterm is 0 in exactly one row, so the product is 0 exactly in the listed rows.' },
    ],
  });
})();
