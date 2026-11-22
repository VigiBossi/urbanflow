(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m1', id, o);

  CAI.modules.push({
    id: 'm1', num: 1, icon: '🔢', title: 'Number Systems',
    summary: 'Binary, octal and hexadecimal conversions and binary arithmetic.',
    generators: ['dec2bin', 'bin2dec', 'dec2hex', 'dec2oct', 'hex2bin', 'oct2bin', 'bin2hex', 'bin2oct', 'frac2bin', 'binadd', 'binsub'],
    lessons: [
      {
        id: 'm1l1', title: 'Place values: any base → decimal', minutes: 6,
        intuition: `<p>In decimal, the 3 in <b>352</b> is worth 300 because of <i>where</i> it sits: each position is worth 10× the one to its right. Binary works exactly the same way, except each position is worth <b>2×</b> the one to its right: 1, 2, 4, 8, 16, 32, 64, 128…</p><p>So reading a binary number is just: “which place values are switched on?” — then add them up.</p>`,
        rule: `<p>A number with digits d<sub>k</sub>…d<sub>1</sub>d<sub>0</sub> in base b has the value</p><div class="formula">N = d<sub>k</sub>·b<sup>k</sup> + … + d<sub>1</sub>·b<sup>1</sup> + d<sub>0</sub>·b<sup>0</sup></div><p>Digits after the point have negative powers: b<sup>−1</sup>, b<sup>−2</sup>, … Bases used in this course: 2 (binary, digits 0–1), 8 (octal, 0–7), 10 (decimal), 16 (hex, 0–9 and A=10 … F=15).</p>`,
        example: {
          prompt: 'Convert <b>10110101<sub>2</sub></b> to decimal.',
          steps: [
            { title: 'Write the place values above the bits (right to left: 1, 2, 4 …)', html: '<table class="work mono"><tr><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr><tr><td><b>1</b></td><td>0</td><td><b>1</b></td><td><b>1</b></td><td>0</td><td><b>1</b></td><td>0</td><td><b>1</b></td></tr></table>' },
            { title: 'Keep only the place values under a 1', html: '128, 32, 16, 4, 1' },
            { title: 'Add them', html: '128 + 32 + 16 + 4 + 1 = <b>181</b>' },
            { title: 'Double-check the final step', html: 'Re-add in a different order: 1 + 4 + 16 + 32 + 128 = 181 ✔' },
          ],
          answer: '10110101<sub>2</sub> = <b>181<sub>10</sub></b>',
        },
        practice: G.make('bin2dec', { bits: '11001011' }),
        more: 'bin2dec',
      },
      {
        id: 'm1l2', title: 'Decimal → binary (repeated division)', minutes: 7,
        intuition: `<p>Dividing by 2 asks “is this number odd or even?” — the remainder is the rightmost bit. Then you throw that bit away (the quotient) and ask again for the next bit. You discover the bits from <b>right to left</b>, so you read your remainders <b>bottom → top</b>.</p>`,
        rule: `<p><b>Integer part:</b> divide by the target base repeatedly, keep the remainders, stop when the quotient is 0. The <b>first remainder is the LSB</b>, the last is the MSB.</p><p><b>Fraction part:</b> multiply by the base repeatedly; the integer part of each product is the next digit, read <b>top → bottom</b>.</p><p>The same method converts decimal to octal (÷8) or hex (÷16).</p>`,
        example: {
          prompt: 'Convert <b>156<sub>10</sub></b> to binary.',
          steps: [
            { title: 'Divide by 2 until the quotient is 0', html: CAI.num.divTable(156, 2) },
            { title: 'Remainders in the order found (top → bottom)', html: '<span class="mono">0 0 1 1 1 0 0 1</span>' },
            { title: 'Read them bottom → top', html: '<span class="mono"><b>10011100</b></span>' },
            { title: 'Double-check the final step', html: '128 + 16 + 8 + 4 = 156 ✔' },
          ],
          answer: '156<sub>10</sub> = <b>10011100<sub>2</sub></b>',
        },
        practice: G.make('dec2bin', { n: 217 }),
        more: 'dec2bin',
      },
      {
        id: 'm1l3', title: 'Binary ↔ octal ↔ hex shortcuts', minutes: 6,
        intuition: `<p>8 = 2<sup>3</sup> and 16 = 2<sup>4</sup>, so one octal digit is exactly 3 bits and one hex digit is exactly 4 bits. No arithmetic needed — just chop the bits into groups.</p>`,
        rule: `<p><b>Binary → hex/octal:</b> starting at the binary point and moving LEFT, split into groups of 4 (hex) or 3 (octal). Pad the leftmost group with zeros. Convert each group to one digit.</p><p><b>Hex/octal → binary:</b> replace each digit by its 4-bit (or 3-bit) pattern — keep the zeros inside each group!</p><table class="work mono small"><tr><td>0 0000</td><td>4 0100</td><td>8 1000</td><td>C 1100</td></tr><tr><td>1 0001</td><td>5 0101</td><td>9 1001</td><td>D 1101</td></tr><tr><td>2 0010</td><td>6 0110</td><td>A 1010</td><td>E 1110</td></tr><tr><td>3 0011</td><td>7 0111</td><td>B 1011</td><td>F 1111</td></tr></table>`,
        example: {
          prompt: 'Convert <b>1101011110<sub>2</sub></b> to hexadecimal and to octal.',
          steps: [
            { title: 'Hex: groups of 4 from the right (pad left)', html: '<span class="mono">0011 | 0101 | 1110</span>' },
            { title: 'Each group → one hex digit', html: '0011 = 3, 0101 = 5, 1110 = E → <b>35E<sub>16</sub></b>' },
            { title: 'Octal: groups of 3 from the right', html: '<span class="mono">001 | 101 | 011 | 110</span> → 1, 5, 3, 6 → <b>1536<sub>8</sub></b>' },
            { title: 'Double-check via decimal', html: '35E<sub>16</sub> = 3·256 + 5·16 + 14 = 862; 1536<sub>8</sub> = 512 + 320 + 24 + 6 = 862 ✔' },
          ],
          answer: '<b>0x35E</b> and <b>1536<sub>8</sub></b>',
        },
        practice: G.make('bin2hex', { bits: '101101111010' }),
        more: 'bin2hex',
      },
      {
        id: 'm1l4', title: 'Binary addition and subtraction', minutes: 7,
        intuition: `<p>Binary addition is decimal addition with a tiny times-table: as soon as a column reaches 2, you write 0 and carry 1 — just like reaching 10 in decimal.</p>`,
        rule: `<div class="formula">0+0 = 0 &nbsp; 0+1 = 1 &nbsp; 1+1 = 10 (0, carry 1) &nbsp; 1+1+1 = 11 (1, carry 1)</div><p><b>Subtraction:</b> 0−0 = 0, 1−0 = 1, 1−1 = 0, 0−1 = 1 with a <b>borrow</b> from the next column (the next column then has 1 less). Always work right → left and write carries/borrows above the columns.</p>`,
        example: {
          prompt: 'Add <span class="mono">01101101 + 00111011</span>.',
          steps: [
            { title: 'Columns 0–3 (right to left)', html: '1+1 = 0 c1 · 0+1+1 = 0 c1 · 1+0+1 = 0 c1 · 1+1+1 = 1 c1' },
            { title: 'Columns 4–7', html: '0+1+1 = 0 c1 · 1+1+1 = 1 c1 · 1+0+1 = 0 c1 · 0+0+1 = 1 c0' },
            { title: 'Result with the carry row', html: CAI.num.columnHTML([{ label: 'carry', bits: '11111110', cls: 'muted' }, { label: '', bits: '01101101' }, { label: '+', bits: '00111011' }, { label: '=', bits: '10101000', cls: 'rule' }]) },
            { title: 'Double-check in decimal', html: '109 + 59 = 168 and 10101000<sub>2</sub> = 128 + 32 + 8 = 168 ✔' },
          ],
          answer: '<b>10101000<sub>2</sub></b>',
        },
        practice: G.make('binadd', { a: 94, b: 55 }),
        more: 'binadd',
      },
    ],
    bank: [
      G.make('dec2bin', { n: 45 }),
      G.make('bin2dec', { bits: '11100110' }),
      G.make('dec2hex', { n: 2748 }),
      G.make('hex2bin', { v: 'F3A' }),
      G.make('bin2oct', { bits: '110101101' }),
      G.make('dec2oct', { n: 500 }),
      G.make('frac2bin', { x: 12.375 }),
      G.make('binsub', { a: 200, b: 73 }),
      C('hex2dec', {
        prompt: 'Convert <b>0x2C7</b> to decimal.', format: 'Decimal number',
        answer: { type: 'num', base: 10, value: '711' },
        hints: ['Hex place values: 1, 16, 256, 4096 …', 'C = 12.', '2·256 + 12·16 + 7·1 = ?'],
        steps: [{ ask: 'Value of C in decimal?', value: '12', show: 'C = 12' }, { ask: 'Sum of digit × place value?', value: '711', show: '2·256 + 12·16 + 7 = 512 + 192 + 7 = <b>711</b>' }],
        finalCheck: 'Re-add 512 + 192 + 7.',
      }),
    ],
    review: `
      <h3>Positional value</h3><p>N = Σ dᵢ·bⁱ. Powers of 2: 1 2 4 8 16 32 64 128 256 512 1024. Fraction places: ½ ¼ ⅛ 1/16.</p>
      <h3>Decimal → base b</h3><ul><li>Integer: divide by b repeatedly; remainders read <b>bottom → top</b> (first remainder = LSB).</li><li>Fraction: multiply by b repeatedly; integer parts read <b>top → bottom</b>.</li></ul>
      <h3>Base b → decimal</h3><p>Multiply each digit by its place value and add.</p>
      <h3>Shortcuts</h3><ul><li>1 hex digit = 4 bits, 1 octal digit = 3 bits.</li><li>Group from the binary point outwards; pad with zeros at the ends.</li><li>Octal ↔ hex: go through binary.</li></ul>
      <h3>Binary arithmetic</h3><ul><li>1+1 = 10, 1+1+1 = 11 (write the right bit, carry the left one).</li><li>0−1 → borrow: write 1, the next column loses 1.</li><li>An n-bit unsigned number ranges 0 … 2ⁿ−1.</li></ul>
      <p class="tip">⚠ Exam traps: reading remainders in the wrong order; dropping zeros inside a hex/octal group; forgetting the final carry.</p>`,
    blanks: [
      { s: 'When converting decimal to binary by repeated division, the first remainder is the ___ significant bit.', a: ['least', 'LSB'] },
      { s: 'One hexadecimal digit corresponds to exactly ___ bits.', a: ['4', 'four'] },
      { s: 'One octal digit corresponds to exactly ___ bits.', a: ['3', 'three'] },
      { s: 'In binary, 1 + 1 = ___ (write the full result).', a: ['10'] },
      { s: 'The largest unsigned value that fits in 8 bits is ___.', a: ['255'] },
      { s: 'To convert a decimal fraction to binary, repeatedly ___ by 2.', a: ['multiply', 'multiplying'] },
      { s: 'The hex digit for the bit pattern 1011 is ___.', a: ['B'] },
    ],
    quiz: [
      { q: 'What is 110110₂ in decimal?', o: ['54', '27', '108', '46'], a: 0, e: '32 + 16 + 4 + 2 = 54.' },
      { q: 'What is 77₁₀ in binary?', o: ['1001101', '1011001', '1001011', '1100101'], a: 0, e: '77 = 64 + 8 + 4 + 1 → 1001101.' },
      { q: 'What is 0xA7 in decimal?', o: ['167', '157', '177', '107'], a: 0, e: 'A·16 + 7 = 160 + 7 = 167.' },
      { q: 'Convert 11101011₂ to hexadecimal.', o: ['EB', 'D7', 'BE', 'E3'], a: 0, e: '1110 = E, 1011 = B → 0xEB.' },
      { q: 'Convert 345₈ to binary.', o: ['011100101', '011100110', '111001010', '010100101'], a: 0, e: '3 = 011, 4 = 100, 5 = 101 → 011 100 101.' },
      { q: 'What is 0.625₁₀ in binary?', o: ['0.101', '0.011', '0.110', '0.1001'], a: 0, e: '0.625·2 = 1.25 → 1; 0.25·2 = 0.5 → 0; 0.5·2 = 1.0 → 1 → 0.101.' },
      { q: '1011₂ + 0111₂ = ?', o: ['10010', '10001', '11010', '1110'], a: 0, e: '11 + 7 = 18 = 10010.' },
      { q: '1100₂ − 0101₂ = ?', o: ['0111', '0110', '1001', '0101'], a: 0, e: '12 − 5 = 7 = 0111.' },
      { q: 'How many bits are needed to represent the decimal number 300 in unsigned binary?', o: ['9', '8', '10', '12'], a: 0, e: '2⁸ = 256 ≤ 300 < 512 = 2⁹, so 9 bits.' },
      { q: 'Which is the largest?', o: ['0x7F', '1111110₂', '176₈', '120₁₀'], a: 0, e: '0x7F = 127; 1111110₂ = 126; 176₈ = 126; 120.' },
    ],
  });
})();
