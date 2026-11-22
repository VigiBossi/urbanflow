(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m2', id, o);
  const cols = CAI.num.columnHTML;

  CAI.modules.push({
    id: 'm2', num: 2, icon: '±', title: 'Signed Numbers',
    summary: 'Sign-magnitude, 1’s complement and 2’s complement, signed arithmetic and overflow.',
    generators: ['dec2twos', 'twos2dec', 'signmag', 'onescomp', 'twosAdd', 'overflow'],
    lessons: [
      {
        id: 'm2l1', title: 'Sign-magnitude and 1’s complement', minutes: 6,
        intuition: `<p>Hardware only stores bits — there is no “minus” key. The simplest idea: use the leftmost bit as a <b>sign flag</b> (0 = +, 1 = −). Another idea: represent −x by <b>flipping every bit</b> of x.</p><p>Both work, but both have an odd side effect: there are two zeros (+0 and −0).</p>`,
        rule: `<p><b>Sign-magnitude (n bits):</b> MSB = sign, remaining n−1 bits = |x|. Range −(2<sup>n−1</sup>−1) … +(2<sup>n−1</sup>−1).</p><p><b>1’s complement:</b> positive numbers as usual; −x = invert all bits of x. Same range, also two zeros (0000 0000 and 1111 1111).</p><p>In both, a positive number looks exactly like normal binary.</p>`,
        example: {
          prompt: 'Write <b>−37</b> in 8-bit sign-magnitude and in 8-bit 1’s complement.',
          steps: [
            { title: 'Write +37 in 8 bits', html: '37 = 32 + 4 + 1 → <span class="mono">00100101</span>' },
            { title: 'Sign-magnitude: set the sign bit', html: '<span class="mono"><b>1</b>0100101</span>' },
            { title: '1’s complement: invert every bit of +37', html: '<span class="mono">00100101 → <b>11011010</b></span>' },
            { title: 'Double-check', html: 'SM: sign 1, magnitude 0100101 = 37 ✔. 1’s: every bit of 00100101 is flipped ✔' },
          ],
          answer: 'SM: <b class="mono">10100101</b>, 1’s complement: <b class="mono">11011010</b>',
        },
        practice: G.make('onescomp', { n: -52 }),
        more: 'onescomp',
      },
      {
        id: 'm2l2', title: 'Two’s complement', minutes: 7,
        intuition: `<p>Think of a car odometer with 8 binary digits. Roll it back one step from 00000000 and you get 11111111 — so that pattern should mean −1. Two’s complement is exactly this “wrap-around” system. Its big win: the adder circuit works unchanged for negative numbers, and there is only one zero.</p><p>Another way to see it: the MSB has a <b>negative</b> place value (−128 in 8 bits).</p>`,
        rule: `<div class="formula">−x = (invert all bits of x) + 1</div><ul><li>Range for n bits: −2<sup>n−1</sup> … 2<sup>n−1</sup>−1 (8 bits: −128 … 127).</li><li>Reading a pattern: value = −2<sup>n−1</sup>·MSB + (the other place values).</li><li>Shortcut: copy bits from the right up to and including the first 1, then invert the rest.</li></ul>`,
        example: {
          prompt: 'Write <b>−45</b> in 8-bit two’s complement.',
          steps: [
            { title: 'Write +45 in 8 bits', html: '45 = 32 + 8 + 4 + 1 → <span class="mono">00101101</span>' },
            { title: 'Invert every bit', html: '<span class="mono">11010010</span>' },
            { title: 'Add 1', html: '<span class="mono">11010010 + 1 = <b>11010011</b></span>' },
            { title: 'Double-check the final step', html: 'MSB worth −128: −128 + 64 + 16 + 2 + 1 = −45 ✔' },
          ],
          answer: '−45 = <b class="mono">11010011</b>',
        },
        practice: G.make('dec2twos', { n: -74 }),
        more: 'dec2twos',
      },
      {
        id: 'm2l3', title: 'Signed addition, subtraction and overflow', minutes: 8,
        intuition: `<p>With two’s complement you never subtract: A − B is just A + (−B). Add the patterns like unsigned numbers and throw away any carry out of the leftmost bit.</p><p>But 8 bits only hold −128…127. If a true result falls outside, the answer “wraps” and has the wrong sign — that is <b>overflow</b>.</p>`,
        rule: `<ul><li>A − B = A + (two’s complement of B).</li><li>Discard the carry out of the MSB.</li><li><b>Overflow</b> occurs only if both operands have the <b>same sign</b> and the result has the <b>opposite sign</b>. (Equivalently: carry into MSB ≠ carry out of MSB.)</li><li>Adding a positive and a negative number can never overflow.</li></ul>`,
        example: {
          prompt: 'Compute <b>45 − 70</b> in 8-bit two’s complement.',
          steps: [
            { title: 'Rewrite as an addition', html: '45 − 70 = 45 + (−70)' },
            { title: 'Encode both numbers', html: '45 = <span class="mono">00101101</span>; 70 = 01000110 → invert 10111001 → +1 → −70 = <span class="mono">10111010</span>' },
            { title: 'Add', html: cols([{ label: '', bits: '00101101' }, { label: '+', bits: '10111010' }, { label: '=', bits: '11100111', cls: 'rule' }]) },
            { title: 'Interpret and check overflow', html: 'MSB = 1 → negative: −128 + 64 + 32 + 4 + 2 + 1 = <b>−25</b> ✔. The operands had different signs, so no overflow is possible.' },
          ],
          answer: '<b class="mono">11100111</b> = −25',
        },
        practice: G.make('twosAdd', { a: -38, b: -51 }),
        more: 'twosAdd',
      },
    ],
    bank: [
      G.make('dec2twos', { n: -100 }),
      G.make('twos2dec', { bits: '11101100' }),
      G.make('twos2dec', { bits: '10000001' }),
      G.make('signmag', { n: -19 }),
      G.make('onescomp', { n: -90 }),
      G.make('twosAdd', { a: 90, b: 60 }),
      G.make('overflow', { a: 90, b: 60 }),
      G.make('overflow', { a: -70, b: 50 }),
      C('range', {
        prompt: 'What is the most negative number that can be represented in <b>6-bit</b> two’s complement?', format: 'Decimal, e.g. -64',
        answer: { type: 'num', base: 10, value: '-32' },
        hints: ['The range for n bits is −2^(n−1) … 2^(n−1) − 1.', 'Here n = 6, so the bottom is −2^5.', '2^5 = 32 — don’t forget the sign!'],
        steps: [{ ask: 'n − 1 = ?', value: '5', show: '6 − 1 = 5' }, { ask: '2^(n−1) = ?', value: '32', show: '2⁵ = 32' }, { ask: 'Most negative value?', value: '-32', show: '<b>−32</b> (pattern 100000)' }],
        finalCheck: 'Final step: the answer is negative.',
      }),
    ],
    review: `
      <h3>Three representations (n bits)</h3>
      <table class="work"><tr><th></th><th>Negative of x</th><th>Range</th><th>Zeros</th></tr>
      <tr><td>Sign-magnitude</td><td>set MSB to 1</td><td>−(2ⁿ⁻¹−1) … 2ⁿ⁻¹−1</td><td>two</td></tr>
      <tr><td>1’s complement</td><td>invert all bits</td><td>−(2ⁿ⁻¹−1) … 2ⁿ⁻¹−1</td><td>two</td></tr>
      <tr><td>2’s complement</td><td>invert all bits, add 1</td><td>−2ⁿ⁻¹ … 2ⁿ⁻¹−1</td><td>one</td></tr></table>
      <h3>Two’s complement facts</h3><ul><li>MSB weight is −2ⁿ⁻¹ (−128 for 8 bits).</li><li>Shortcut: from the right, keep bits up to and including the first 1, invert the rest.</li><li>Sign extension: copy the MSB to the left to widen a number (1101 → 11111101).</li><li>−128 (10000000) has no positive partner in 8 bits.</li></ul>
      <h3>Arithmetic</h3><ul><li>A − B = A + (−B); ignore the carry out of the MSB.</li><li>Overflow ⇔ same-sign operands, opposite-sign result ⇔ C<sub>in</sub>(MSB) ≠ C<sub>out</sub>(MSB).</li></ul>
      <p class="tip">⚠ Exam traps: stopping after inverting (forgetting +1); confusing the carry-out with overflow; forgetting the minus sign at the end.</p>`,
    blanks: [
      { s: 'To form the two’s complement of a number, invert all bits and then ___.', a: ['add 1', 'add one', '+1'] },
      { s: 'The range of 8-bit two’s complement numbers is −128 to ___.', a: ['127', '+127'] },
      { s: 'Sign-magnitude and 1’s complement both have two representations of ___.', a: ['zero', '0'] },
      { s: 'In two’s complement, overflow can only occur when both operands have the ___ sign.', a: ['same'] },
      { s: 'Copying the sign bit to the left to widen a number is called sign ___.', a: ['extension'] },
      { s: 'In 8-bit two’s complement, the MSB has a place value of ___.', a: ['-128', '−128'] },
    ],
    quiz: [
      { q: 'What is −1 in 8-bit two’s complement?', o: ['11111111', '10000001', '11111110', '10000000'], a: 0, e: '+1 = 00000001 → invert 11111110 → +1 = 11111111.' },
      { q: 'The 8-bit two’s complement pattern 10000000 represents:', o: ['−128', '−0', '128', '−127'], a: 0, e: 'MSB is worth −128 and all other bits are 0.' },
      { q: 'What is −6 in 4-bit two’s complement?', o: ['1010', '1110', '1001', '0110'], a: 0, e: '6 = 0110 → 1001 → +1 = 1010.' },
      { q: '1’s complement of 01011000 is:', o: ['10100111', '10101000', '01011001', '11011000'], a: 0, e: 'Just invert every bit.' },
      { q: 'Which statement about 8-bit 01110000 + 00110000 = 10100000 is true?', o: ['Overflow occurred', 'No overflow; result is −96', 'No overflow; result is 160', 'A carry-out occurred'], a: 0, e: '112 + 48 = 160 > 127: two positives produced a negative result → overflow.' },
      { q: 'Which pattern is −5 in 8-bit sign-magnitude?', o: ['10000101', '11111011', '11111010', '00000101'], a: 0, e: 'Sign bit 1, magnitude 0000101.' },
      { q: 'Sign-extend the 4-bit two’s complement number 1011 to 8 bits:', o: ['11111011', '00001011', '10001011', '10110000'], a: 0, e: 'Copy the MSB (1) into the new positions.' },
      { q: 'Why do computers prefer two’s complement?', o: ['One zero and the same adder works for signed numbers', 'It has a larger positive range', 'It needs no sign bit', 'Negation is just setting the MSB'], a: 0, e: 'Single zero and no special subtraction hardware.' },
      { q: 'In two’s complement, 11110100 equals:', o: ['−12', '−116', '244', '−11'], a: 0, e: 'Invert 00001011, +1 = 00001100 = 12 → −12.' },
    ],
  });
})();
