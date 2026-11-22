(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m9', id, o);
  const K = G.kmapHTML;

  CAI.modules.push({
    id: 'm9', num: 9, icon: '🗺️', title: 'Karnaugh Maps',
    summary: '2-, 3- and 4-variable K-maps, grouping rules, don’t cares and minimal SOP / POS.',
    generators: ['kmap', 'kmapPOS'],
    lessons: [
      {
        id: 'm9l1', title: 'K-map layout and grouping (2 and 3 variables)', minutes: 8,
        intuition: `<p>A K-map is a truth table folded into a grid so that <b>neighbouring cells differ in exactly one variable</b> (that is why the column labels go 00, 01, <b>11</b>, 10 — Gray code). Two neighbouring 1s can merge, and the variable that changes between them disappears: that is the law XY + XY' = X done visually.</p>`,
        rule: `<ul><li>3 variables: rows A = 0/1, columns BC = 00 01 11 10. Cell number = the minterm index.</li><li>Groups are rectangles of <b>1, 2, 4 or 8</b> cells (powers of two).</li><li>The map <b>wraps around</b>: the left and right edges are neighbours.</li><li>Make groups as <b>large</b> as possible and use as <b>few</b> groups as possible; overlapping is fine.</li><li>Each group → one product term containing only the variables that stay constant inside it (1 → X, 0 → X').</li></ul>`,
        example: {
          prompt: `Minimise F(A,B,C) = Σm(0, 2, 4, 5, 6).${K(3, [0, 2, 4, 5, 6])}`,
          steps: [
            { title: 'Look for the biggest group: the columns BC=00 and BC=10 touch (wrap-around)', html: 'cells 0, 2, 4, 6 form a group of 4' },
            { title: 'What stays constant in that group?', html: "A changes, B changes, C = 0 throughout → <b>C'</b>" },
            { title: 'Cell 5 is still uncovered: pair it with cell 4', html: "cells 4, 5: A = 1, B = 0, C changes → <b>AB'</b>" },
            { title: 'Write the sum and double-check', html: "F = C' + AB'. Every 1 is covered (0,2,4,6 by C'; 5 by AB') and no 0 is covered ✔" },
          ],
          answer: "F = <b class=\"mono\">C' + AB'</b>",
        },
        practice: G.make('kmap', { n: 3, m: [1, 3, 5, 6, 7] }),
        more: 'kmap',
      },
      {
        id: 'm9l2', title: '4-variable maps and don’t cares', minutes: 9,
        intuition: `<p>A 4-variable map is a 4×4 grid wrapped on <b>both</b> axes, like a doughnut: the top row touches the bottom row, the left column touches the right, so even the <b>four corners</b> are one group. Don’t-care cells (X) are jokers — include them if they make a group bigger, ignore them otherwise.</p>`,
        rule: `<ul><li>Rows AB = 00 01 11 10, columns CD = 00 01 11 10.</li><li>Group sizes: 1 (4 literals), 2 (3 literals), 4 (2 literals), 8 (1 literal).</li><li>Pick <b>essential prime implicants</b> first (groups that are the only way to cover some 1), then cover the remaining 1s with as few groups as possible.</li><li>Never create a group that contains only X cells.</li></ul>`,
        example: {
          prompt: `Minimise F(A,B,C,D) = Σm(0, 2, 5, 7, 8, 10, 13, 15).${K(4, [0, 2, 5, 7, 8, 10, 13, 15])}`,
          steps: [
            { title: 'The four corners 0, 2, 8, 10 are neighbours (wrap both ways)', html: "B = 0 and D = 0 throughout → <b>B'D'</b>" },
            { title: 'The centre square 5, 7, 13, 15', html: 'B = 1 and D = 1 throughout → <b>BD</b>' },
            { title: 'All 1s covered with two quads', html: "F = B'D' + BD" },
            { title: 'Double-check', html: "This is B XNOR D: the function is 1 exactly when B = D ✔ (cells 0,2,8,10 have B=D=0; 5,7,13,15 have B=D=1)" },
          ],
          answer: "F = <b class=\"mono\">B'D' + BD</b>",
        },
        practice: G.make('kmap', { n: 4, m: [1, 3, 5, 7, 9, 13], dc: [11, 15] }),
        more: 'kmap',
      },
      {
        id: 'm9l3', title: 'Minimal POS: grouping the 0s', minutes: 7,
        intuition: `<p>Grouping the <b>0s</b> instead of the 1s gives you F' as a sum of products. One DeMorgan step later you have F as a <b>product of sums</b>. Sometimes the POS is cheaper than the SOP — e.g. when the map has far fewer 0s than 1s.</p>`,
        rule: `<ol><li>Group the 0 cells (same rules: rectangles, powers of two, wrap-around, as large as possible).</li><li>Each group of 0s → a <b>sum</b> term: a variable that is <b>0</b> throughout appears plain, one that is <b>1</b> throughout appears complemented.</li><li>F = product of the sum terms.</li></ol>`,
        example: {
          prompt: `Find the minimal POS of F(A,B,C) = Σm(2, 3, 4, 5, 6).${K(3, [2, 3, 4, 5, 6])}`,
          steps: [
            { title: 'The 0s are cells 0, 1 and 7', html: 'ΠM(0, 1, 7)' },
            { title: 'Group 0, 1 (A = 0, B = 0, C changes)', html: "F' term A'B' → sum term <b>(A + B)</b>" },
            { title: 'Cell 7 cannot pair with any other 0', html: "F' term ABC → sum term <b>(A' + B' + C')</b>" },
            { title: 'Multiply the sum terms and double-check', html: "F = (A + B)(A' + B' + C'). Row 0: (0+0) = 0 ✔; row 7: (0+0+0) = 0 ✔; row 2: (0+1)(1+0+1) = 1 ✔" },
          ],
          answer: "F = <b class=\"mono\">(A + B)(A' + B' + C')</b>",
        },
        practice: G.make('kmapPOS', { n: 3, m: [1, 3, 4, 5, 7] }),
        more: 'kmapPOS',
      },
    ],
    bank: [
      G.make('kmap', { n: 3, m: [0, 1, 2, 3, 6] }),
      G.make('kmap', { n: 3, m: [1, 2, 5, 6] }),
      G.make('kmap', { n: 4, m: [0, 1, 4, 5, 10, 11, 14, 15] }),
      G.make('kmap', { n: 4, m: [2, 3, 6, 7, 8, 12, 13], dc: [9] }),
      G.make('kmap', { n: 4, m: [0, 4, 8, 12, 3, 7] }),
      G.make('kmapPOS', { n: 4, m: [0, 1, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15] }),
      C('kmap-2var', {
        prompt: `Minimise F(A,B) = Σm(1, 2, 3).${K(2, [1, 2, 3])}`, format: 'Sum of products',
        answer: { type: 'bool', vars: ['A', 'B'], minterms: [1, 2, 3], minimal: true, form: 'sop', display: 'A + B' },
        hints: ['A 2-variable map is 2×2: rows A, columns B.', 'Group the bottom row (A = 1) and the right column (B = 1).', 'The groups overlap in cell 3 — that is allowed.'],
        steps: [{ ask: 'Term for the row A = 1?', value: 'A', vtype: 'bool', show: 'cells 2, 3 → A' }, { ask: 'Term for the column B = 1?', value: 'B', vtype: 'bool', show: 'cells 1, 3 → B' }, { ask: 'Minimal SOP?', value: 'A + B', vtype: 'bool', show: '<b>A + B</b>' }],
        finalCheck: 'This is just the OR gate — check row 00 is the only 0.',
      }),
    ],
    review: `
      <h3>Layout (cell = minterm number)</h3>
      <div class="kmap-pair">${K(3, [], [], ['0', '1', '2', '3', '4', '5', '6', '7'])}${K(4, [], [], CAI.util.range(16).map(String))}</div>
      <p>Labels follow Gray code 00 01 11 10, so the 3rd and 4th columns are 3/2 (not 2/3).</p>
      <h3>Grouping rules</h3><ul><li>Rectangles of 1, 2, 4, 8, 16 cells; wrap around all edges; corners touch in a 4-var map.</li><li>As large as possible, as few as possible; overlap allowed.</li><li>Group of 2ᵏ cells eliminates k variables.</li><li>Prime implicant = a group that cannot be enlarged; essential PI = the only group covering some 1.</li></ul>
      <h3>Don’t cares</h3><p>Use an X only if it enlarges a group; never group X cells alone.</p>
      <h3>POS</h3><p>Group 0s → F' (SOP) → DeMorgan. In each sum: 0 → plain variable, 1 → complemented.</p>
      <p class="tip">⚠ Exam traps: labelling columns 00 01 10 11; missing wrap-around groups; including a redundant group; forgetting to complement in POS.</p>`,
    blanks: [
      { s: 'K-map rows and columns are labelled in ___ code so that adjacent cells differ in one variable.', a: ['Gray'] },
      { s: 'A K-map group must contain a number of cells that is a power of ___.', a: ['2', 'two'] },
      { s: 'In a 4-variable K-map, a group of 4 cells produces a term with ___ literals.', a: ['2', 'two'] },
      { s: 'A group that is the only one covering some 1 is called an ___ prime implicant.', a: ['essential'] },
      { s: 'To obtain a minimal POS from a K-map, you group the ___.', a: ['0s', 'zeros', '0', 'zeroes'] },
      { s: 'In a 4-variable K-map, the four ___ cells form a single group.', a: ['corner'] },
    ],
    quiz: [
      { q: 'In a 3-variable K-map with columns BC, what is the column order?', o: ['00, 01, 11, 10', '00, 01, 10, 11', '00, 10, 01, 11', '11, 10, 01, 00'], a: 0, e: 'Gray code order.' },
      { q: 'A group of 8 cells in a 4-variable map gives a term with how many literals?', o: ['1', '2', '3', '8'], a: 0, e: '8 = 2³ eliminates 3 of the 4 variables.' },
      { q: 'Minimal SOP of F(A,B,C) = Σm(4, 5, 6, 7)?', o: ['A', "AB'", 'BC', "A + B"], a: 0, e: 'The whole A = 1 row.' },
      { q: 'Minimal SOP of F(A,B,C) = Σm(0, 4)?', o: ["B'C'", "A'B'C'", "AC'", "B'"], a: 0, e: 'Cells 0 and 4 are in the same column (BC = 00): A changes → B\'C\'.' },
      { q: 'Which pair of cells is adjacent in a 4-variable K-map?', o: ['m0 and m8', 'm0 and m5', 'm3 and m4', 'm1 and m2'], a: 0, e: '0000 and 1000 differ in one bit (top and bottom rows wrap).' },
      { q: 'Minimal SOP of F(A,B,C,D) = Σm(0, 2, 8, 10)?', o: ["B'D'", "A'B'", "C'D'", "B'C'D'"], a: 0, e: 'The four corners.' },
      { q: 'A don’t-care cell should be included in a group when:', o: ['It makes the group larger', 'Always', 'Never', 'Only in POS'], a: 0, e: 'It is a free choice — use it only if it helps.' },
      { q: 'F(A,B,C) = Σm(0,1,2,3,4,5). Minimal POS?', o: ["(A' + B')", '(A + B)', "A'B'", "(A' + B)"], a: 0, e: 'Zeros at 6, 7 (A = 1, B = 1) → sum term (A\' + B\').' },
      { q: 'How many cells does a 4-variable K-map have?', o: ['16', '8', '4', '32'], a: 0, e: '2⁴ = 16.' },
    ],
  });
})();
