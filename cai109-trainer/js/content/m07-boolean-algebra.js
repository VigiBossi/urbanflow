(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m7', id, o);
  const simp = (id, expr, vars, hints, steps, finalCheck) => {
    const ast = CAI.bool.parse(expr);
    const ms = CAI.bool.minterms(ast, vars);
    const min = CAI.bool.minSOP(vars, ms);
    return C(id, {
      prompt: `Simplify: <b class="mono">F = ${expr}</b>`, format: "Simplest expression, e.g. A + BC'",
      answer: { type: 'bool', vars, minterms: ms, minimal: true, display: min.expr },
      hints, steps, finalCheck: finalCheck || 'Before submitting, check whether absorption (X + XY = X) still applies anywhere.',
    });
  };

  CAI.modules.push({
    id: 'm7', num: 7, icon: '🧮', title: 'Boolean Algebra',
    summary: 'Laws and identities, DeMorgan’s theorems, the consensus theorem and algebraic simplification.',
    generators: ['deMorgan', 'simplifyAlg', 'evalExpr'],
    lessons: [
      {
        id: 'm7l1', title: 'Laws and identities', minutes: 8,
        intuition: `<p>Boolean algebra is ordinary algebra with only two numbers, 0 and 1. Most rules feel familiar (A·0 = 0, A·1 = A), a few are surprising (A + 1 = 1, A + A = A, A + BC = (A+B)(A+C)). Simplifying a circuit = using these rules to remove gates without changing the truth table.</p>`,
        rule: `<table class="work"><tr><th>Law</th><th>OR form</th><th>AND form</th></tr>
          <tr><td>Identity</td><td>A + 0 = A</td><td>A·1 = A</td></tr>
          <tr><td>Null</td><td>A + 1 = 1</td><td>A·0 = 0</td></tr>
          <tr><td>Idempotent</td><td>A + A = A</td><td>A·A = A</td></tr>
          <tr><td>Complement</td><td>A + A' = 1</td><td>A·A' = 0</td></tr>
          <tr><td>Involution</td><td colspan="2">(A')' = A</td></tr>
          <tr><td>Distributive</td><td>A + BC = (A+B)(A+C)</td><td>A(B+C) = AB + AC</td></tr>
          <tr><td>Absorption</td><td>A + AB = A</td><td>A(A+B) = A</td></tr>
          <tr><td>Redundancy</td><td>A + A'B = A + B</td><td>A(A'+B) = AB</td></tr>
          <tr><td>Combining</td><td>AB + AB' = A</td><td>(A+B)(A+B') = A</td></tr></table>
          <p>Every law has a <b>dual</b>: swap + ↔ · and 0 ↔ 1.</p>`,
        example: {
          prompt: "Simplify <b class=\"mono\">F = AB + AB' + A'B</b>.",
          steps: [
            { title: 'Factor A out of the first two terms (distributive)', html: "AB + AB' = A(B + B')" },
            { title: 'Complement law', html: "B + B' = 1 → A·1 = A, so F = A + A'B" },
            { title: 'Redundancy law A + A\'B = A + B', html: 'F = <b>A + B</b>' },
            { title: 'Double-check with the truth table', html: 'Original is 0 only for A=B=0 (no term is 1); A + B is also 0 only there ✔' },
          ],
          answer: 'F = <b class="mono">A + B</b>',
        },
        practice: simp('lesson-1', "A'B'C + A'BC + AB'C", ['A', 'B', 'C'],
          ['The first two terms differ only in B. Factor out A\'C.', "A'B'C + A'BC = A'C(B' + B) = A'C.", "Now F = A'C + AB'C. Factor C: C(A' + AB'), and use the redundancy law X' + XY = X' + Y."],
          [{ ask: "Combine A'B'C + A'BC.", value: "A'C", vtype: 'bool', show: "A'C(B' + B) = A'C" }, { ask: 'Simplified F?', value: "A'C + B'C", vtype: 'bool', show: "A'C + AB'C = C(A' + AB') = C(A' + B') = <b>A'C + B'C</b>" }]),
        more: 'simplifyAlg',
      },
      {
        id: 'm7l2', title: 'DeMorgan’s theorems', minutes: 7,
        intuition: `<p>“Not (rich AND famous)” means “not rich OR not famous”. DeMorgan’s theorems say exactly this: when you push a NOT through a group, <b>every variable gets complemented and AND/OR swap</b>. Memory aid: <b>break the bar, change the sign</b>.</p>`,
        rule: `<div class="formula">(A·B)' = A' + B' &nbsp;&nbsp;&nbsp; (A + B)' = A'·B'</div><p>Works for any number of terms: (A + B + C)' = A'B'C'. Apply to the <b>outermost</b> bar first, keep brackets around groups, then repeat on any group that still has a bar. Double complements cancel: (X')' = X.</p>`,
        example: {
          prompt: "Remove the bars in <b class=\"mono\">F = (A + B'C)'</b>.",
          steps: [
            { title: 'Outer bar over a SUM: break it, + becomes ·', html: "F = A' · (B'C)'" },
            { title: 'The group (B\'C)\' still has a bar: break it, · becomes +', html: "(B'C)' = (B')' + C' = B + C'" },
            { title: 'Substitute back', html: "F = <b>A'(B + C')</b> = A'B + A'C'" },
            { title: 'Double-check with one row', html: "A=0,B=0,C=0: original (0 + 1·0)' = 1; result 1·(0 + 1) = 1 ✔" },
          ],
          answer: "F = <b class=\"mono\">A'(B + C')</b>",
        },
        practice: G.make('deMorgan', { i: 2 }),
        more: 'deMorgan',
      },
      {
        id: 'm7l3', title: 'Consensus theorem and a simplification strategy', minutes: 8,
        intuition: `<p>In AB + A'C, one of the two terms is always “on duty”: when A = 1 the first term decides, when A = 0 the second. A third term BC that needs both B and C can never add anything new — it is a <b>redundant consensus</b> term and can be deleted.</p>`,
        rule: `<div class="formula">AB + A'C + BC = AB + A'C &nbsp;&nbsp; (dual: (A+B)(A'+C)(B+C) = (A+B)(A'+C))</div><p>To find the consensus of two terms: they must contain one variable in <b>opposite</b> forms (A and A'); the consensus is the product of all their <i>other</i> literals.</p><p><b>Strategy:</b> (1) remove bars with DeMorgan, (2) multiply out, (3) combine XY + XY' = X, (4) absorb X + XY = X, (5) use redundancy X + X'Y = X + Y and consensus.</p>`,
        example: {
          prompt: "Simplify <b class=\"mono\">F = A'B + BC + AC</b>.",
          steps: [
            { title: 'Find two terms with a variable in opposite forms', html: "A'B and AC contain A' and A" },
            { title: 'Their consensus = product of the other literals', html: 'B·C = BC' },
            { title: 'BC is already in F, so it is redundant', html: "F = <b>A'B + AC</b>" },
            { title: 'Double-check: is BC covered?', html: "When B = C = 1: if A = 0 then A'B = 1, if A = 1 then AC = 1 ✔" },
          ],
          answer: "F = <b class=\"mono\">A'B + AC</b>",
        },
        practice: simp('lesson-3', "AB' + A'C + B'C", ['A', 'B', 'C'],
          ['Look for two terms with one variable in opposite forms.', "AB' and A'C contain A and A'. Their consensus is B'C.", "B'C is the consensus term, so delete it."],
          [{ ask: "Consensus of AB' and A'C?", value: "B'C", vtype: 'bool', show: "B'·C" }, { ask: 'Simplified F?', value: "AB' + A'C", vtype: 'bool', show: "<b>AB' + A'C</b>" }],
          'Final step: make sure you deleted the consensus term, not one of the two “parent” terms.'),
        more: 'simplifyAlg',
      },
    ],
    bank: [
      simp('absorb', 'A + AB', ['A', 'B'], ['Factor A: A(1 + B).', '1 + B = 1 (null law).', 'A·1 = A.'], [{ ask: 'A(1 + B) simplifies 1 + B to?', value: '1', show: '1 + B = 1' }, { ask: 'F?', value: 'A', vtype: 'bool', show: '<b>A</b>' }]),
      simp('combine', "(A + B)(A + B')", ['A', 'B'], ["Distributive (OR form): (A + X)(A + Y) = A + XY.", "Here X = B, Y = B'.", "BB' = 0, so A + 0."], [{ ask: "BB' = ?", value: '0', show: "BB' = 0" }, { ask: 'F?', value: 'A', vtype: 'bool', show: '<b>A</b>' }]),
      simp('expand', 'AB + A(B + C) + B(B + C)', ['A', 'B', 'C'], ['Multiply out every bracket.', 'AB + AB + AC + BB + BC; BB = B.', 'B absorbs AB and BC.'], [{ ask: 'Expanded form?', value: 'AB + AC + B + BC', vtype: 'bool', show: 'AB + AB + AC + B + BC' }, { ask: 'F?', value: 'B + AC', vtype: 'bool', show: '<b>B + AC</b>' }]),
      simp('cprime', "A'B'C' + A'BC' + AB'C' + ABC'", ['A', 'B', 'C'], ["Every term contains C'. Factor it out.", "C'(A'B' + A'B + AB' + AB).", 'The bracket covers all four combinations of A, B, so it equals 1.'], [{ ask: 'What does the bracket equal?', value: '1', show: 'all 4 combinations → 1' }, { ask: 'F?', value: "C'", vtype: 'bool', show: "<b>C'</b>" }]),
      simp('redund', "A + A'BC + A'B'", ['A', 'B', 'C'], ["Redundancy law: A + A'X = A + X.", "So A + A'BC = A + BC, and A + A'B' = A + B'.", "F = A + BC + B' — use B' + BC = B' + C."], [{ ask: "A + A'BC simplifies to?", value: 'A + BC', vtype: 'bool', show: 'A + BC' }, { ask: 'F?', value: "A + B' + C", vtype: 'bool', show: "<b>A + B' + C</b>" }]),
      G.make('deMorgan', { i: 3 }),
      G.make('deMorgan', { i: 6 }),
      G.make('simplifyAlg', { ms: [1, 3, 5, 6, 7] }),
    ],
    review: `
      <h3>Core laws</h3><p>A+0=A · A·1=A · A+1=1 · A·0=0 · A+A=A · AA=A · A+A'=1 · AA'=0 · (A')'=A</p>
      <h3>Useful theorems</h3><ul><li>Absorption: A + AB = A; A(A + B) = A</li><li>Redundancy: A + A'B = A + B; A(A' + B) = AB</li><li>Combining: AB + AB' = A</li><li>Distributive (OR over AND): A + BC = (A + B)(A + C)</li><li>Consensus: AB + A'C + BC = AB + A'C</li></ul>
      <h3>DeMorgan</h3><p>(AB)' = A' + B' · (A + B)' = A'B'. Break the bar, change the sign. Outer bar first.</p>
      <h3>Duality</h3><p>Swap + ↔ · and 0 ↔ 1 (leave variables alone) to get another valid identity.</p>
      <h3>Strategy</h3><ol><li>DeMorgan to push NOTs onto variables.</li><li>Expand.</li><li>Combine pairs that differ in one variable.</li><li>Absorb / redundancy / consensus.</li><li>Verify with a few truth-table rows.</li></ol>
      <p class="tip">⚠ Exam traps: (A + B)' ≠ A' + B'; forgetting brackets when DeMorgan turns a product into a sum; stopping before absorption.</p>`,
    blanks: [
      { s: 'By DeMorgan’s theorem, (A + B)\' = ___.', a: ["A'B'", "A'·B'", "A' B'", "A'*B'"] },
      { s: 'The absorption law states that A + AB = ___.', a: ['A'] },
      { s: 'A + 1 = ___ (null law).', a: ['1'] },
      { s: 'The consensus term of AB and A\'C is ___.', a: ['BC', 'B·C', 'CB'] },
      { s: 'Swapping AND with OR and 0 with 1 in an identity gives its ___.', a: ['dual'] },
      { s: 'A + A\'B simplifies to ___.', a: ['A + B', 'A+B', 'B + A'] },
      { s: 'A · A\' = ___.', a: ['0'] },
    ],
    quiz: [
      { q: "(AB)' equals:", o: ["A' + B'", "A'B'", "A + B", "(A + B)'"], a: 0, e: 'DeMorgan: break the bar, change AND to OR.' },
      { q: 'A + BC equals:', o: ['(A + B)(A + C)', 'AB + AC', '(A + B)C', 'ABC'], a: 0, e: 'Distributive law of OR over AND.' },
      { q: "A(A' + B) simplifies to:", o: ['AB', 'A + B', 'A', 'B'], a: 0, e: "AA' + AB = 0 + AB." },
      { q: "AB + A'C + BC simplifies to:", o: ["AB + A'C", 'AB + BC', "A'C + BC", 'A + C'], a: 0, e: 'BC is the consensus term.' },
      { q: "(A + B')' equals:", o: ["A'B", "A' + B", "AB'", "A'B'"], a: 0, e: "Break the bar: A'·(B')' = A'B." },
      { q: 'The dual of A + 0 = A is:', o: ['A·1 = A', 'A·0 = 0', 'A + 1 = 1', "A + A' = 1"], a: 0, e: 'Swap + with · and 0 with 1.' },
      { q: "XY + XY' simplifies to:", o: ['X', 'Y', '1', "XY'"], a: 0, e: "X(Y + Y') = X." },
      { q: "Simplify (A + B)(A' + C)(B + C):", o: ["(A + B)(A' + C)", '(A + B)(B + C)', "A'B + C", "AC + A'B + BC"], a: 0, e: '(B + C) is the consensus factor (dual consensus theorem).' },
      { q: "How many product terms does the minimal SOP of A'BC + ABC + A'B'C have?", o: ['2', '1', '3', '4'], a: 0, e: "A'BC + ABC = BC and A'BC + A'B'C = A'C (A'BC is used twice) → BC + A'C." },
    ],
  });
})();
