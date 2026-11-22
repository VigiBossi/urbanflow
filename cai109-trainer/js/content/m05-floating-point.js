(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m5', id, o);

  CAI.modules.push({
    id: 'm5', num: 5, icon: '🌊', title: 'Floating Point (IEEE 754)',
    summary: 'Normalised binary scientific notation, the single-precision format, encoding, decoding and special values.',
    generators: ['ieeeEnc', 'ieeeDec'],
    lessons: [
      {
        id: 'm5l1', title: 'Encoding a number in IEEE 754', minutes: 9,
        intuition: `<p>Scientific notation writes 6 500 000 as 6.5 × 10<sup>6</sup>: a few significant digits plus “how far to move the point”. IEEE 754 does the same in binary: <b>±1.something × 2<sup>e</sup></b>. Since the leading digit of a normalised binary number is always 1, it is not even stored (the “hidden 1”).</p>`,
        rule: `<table class="work"><tr><th>Format</th><th>Sign</th><th>Exponent</th><th>Fraction</th><th>Bias</th></tr><tr><td>Single (32-bit)</td><td>1</td><td>8</td><td>23</td><td>127</td></tr><tr><td>Double (64-bit)</td><td>1</td><td>11</td><td>52</td><td>1023</td></tr></table><div class="formula">value = (−1)<sup>S</sup> × 1.F × 2<sup>E − bias</sup></div><ol><li>Sign bit S (1 = negative).</li><li>Write |x| in binary.</li><li>Normalise to 1.F × 2<sup>e</sup> (move the point next to the first 1).</li><li>Store E = e + 127 in 8 bits.</li><li>Store the bits after the leading 1 as F, padded with zeros to 23 bits.</li></ol>`,
        example: {
          prompt: 'Encode <b>−13.25</b> in single precision.',
          steps: [
            { title: 'Sign', html: 'negative → S = <b>1</b>' },
            { title: '|x| in binary', html: '13 = 1101, 0.25 = .01 → <span class="mono">1101.01</span>' },
            { title: 'Normalise', html: '1101.01 = <b>1.10101 × 2<sup>3</sup></b> (point moved 3 places left)' },
            { title: 'Biased exponent', html: 'E = 3 + 127 = 130 = <span class="mono">10000010</span>' },
            { title: 'Fraction (drop the hidden 1, pad to 23 bits)', html: '<span class="mono">10101000000000000000000</span>' },
            { title: 'Assemble and convert to hex', html: '<span class="mono">1 10000010 10101000000000000000000</span> → 1100 0001 0101 0100 0000 … → <b>0xC1540000</b>' },
          ],
          answer: '−13.25 = <b class="mono">0xC1540000</b>',
        },
        practice: G.make('ieeeEnc', { x: 9.75 }),
        more: 'ieeeEnc',
      },
      {
        id: 'm5l2', title: 'Decoding and special values', minutes: 7,
        intuition: `<p>Decoding is the recipe backwards: split the 32 bits into their three fields, undo the bias, put the hidden 1 back, and shift the point. A few exponent patterns are reserved for special meanings like zero, infinity and “not a number”.</p>`,
        rule: `<ol><li>Hex → 32 bits; split 1 | 8 | 23.</li><li>e = E − 127.</li><li>Value = (−1)<sup>S</sup> × 1.F × 2<sup>e</sup>.</li></ol><table class="work"><tr><th>E</th><th>F</th><th>Meaning</th></tr><tr><td>0</td><td>0</td><td>±0</td></tr><tr><td>0</td><td>≠0</td><td>denormal: ±0.F × 2<sup>−126</sup></td></tr><tr><td>1…254</td><td>any</td><td>normal number</td></tr><tr><td>255</td><td>0</td><td>±∞</td></tr><tr><td>255</td><td>≠0</td><td>NaN</td></tr></table>`,
        example: {
          prompt: 'What value is <b class="mono">0x40C80000</b>?',
          steps: [
            { title: 'Expand to binary', html: '<span class="mono">0100 0000 1100 1000 0000 …</span>' },
            { title: 'Split the fields', html: 'S = 0 · E = <span class="mono">10000001</span> = 129 · F = <span class="mono">1001000…</span>' },
            { title: 'Undo the bias', html: 'e = 129 − 127 = 2' },
            { title: 'Shift the point', html: '1.1001 × 2² = 110.01₂ = 4 + 2 + 0.25 = <b>6.25</b>' },
          ],
          answer: '<b>6.25</b>',
        },
        practice: G.make('ieeeDec', { hex: 'C2490000' }),
        more: 'ieeeDec',
      },
    ],
    bank: [
      G.make('ieeeEnc', { x: 0.375 }),
      G.make('ieeeEnc', { x: -0.75 }),
      G.make('ieeeEnc', { x: 100.5 }),
      G.make('ieeeDec', { hex: '3F800000' }),
      G.make('ieeeDec', { hex: 'BF400000' }),
      G.make('ieeeDec', { hex: '42F00000' }),
      C('special', {
        prompt: 'The single-precision pattern <span class="mono">0x7F800000</span> represents:', choices: ['+∞', 'NaN', 'The largest normal number', '+0'],
        answer: { type: 'choice', value: 0 }, explain: '7F800000 = 0 11111111 000…0: exponent all ones with a zero fraction is ±infinity; the sign bit is 0, so +∞.',
        hints: ['Split into S | E | F.', 'E = 11111111 is the reserved “all ones” exponent.', 'With F = 0 it means infinity; with F ≠ 0 it would be NaN.'],
      }),
      C('bias', {
        prompt: 'A single-precision number has the exponent field <span class="mono">01111100</span>. What is the actual (unbiased) exponent e?', format: 'Integer, e.g. -3',
        answer: { type: 'num', base: 10, value: '-3' },
        hints: ['Convert the exponent field to decimal.', '01111100 = 124.', 'e = E − 127.'],
        steps: [{ ask: 'E in decimal?', value: '124', show: '64+32+16+8+4 = 124' }, { ask: 'e = E − 127?', value: '-3', show: '124 − 127 = <b>−3</b>' }],
        finalCheck: 'Final step: subtract the bias 127 — the result may be negative.',
      }),
    ],
    review: `
      <h3>Layout</h3><p>Single: S(1) | E(8, bias 127) | F(23). Double: S(1) | E(11, bias 1023) | F(52).</p>
      <h3>Encode</h3><ol><li>Sign bit.</li><li>|x| to binary.</li><li>Normalise 1.F × 2ᵉ.</li><li>E = e + 127 in 8 bits.</li><li>F = bits after the leading 1, pad to 23.</li><li>Group into hex.</li></ol>
      <h3>Decode</h3><p>Value = (−1)ˢ · 1.F · 2^(E−127).</p>
      <h3>Special values</h3><ul><li>E = 0, F = 0 → ±0. E = 0, F ≠ 0 → denormal (0.F × 2⁻¹²⁶).</li><li>E = 255, F = 0 → ±∞. E = 255, F ≠ 0 → NaN.</li><li>Normal E range 1…254 → e from −126 to +127.</li></ul>
      <h3>Handy patterns</h3><p>1.0 = 0x3F800000 · −1.0 = 0xBF800000 · 2.0 = 0x40000000 · 0.5 = 0x3F000000.</p>
      <p class="tip">⚠ Exam traps: forgetting the bias; storing the hidden 1; grouping the hex from the wrong end; 0.1 cannot be represented exactly.</p>`,
    blanks: [
      { s: 'The exponent bias in IEEE 754 single precision is ___.', a: ['127'] },
      { s: 'A single-precision number has ___ fraction (mantissa) bits.', a: ['23'] },
      { s: 'The leading 1 of a normalised significand is not stored; it is called the ___ bit.', a: ['hidden', 'implicit', 'implied'] },
      { s: 'An exponent field of all 1s with a non-zero fraction represents ___.', a: ['NaN', 'not a number'] },
      { s: 'The exponent bias in IEEE 754 double precision is ___.', a: ['1023'] },
      { s: 'An exponent field of all 0s with a non-zero fraction represents a ___ number.', a: ['denormal', 'denormalized', 'subnormal', 'denormalised'] },
    ],
    quiz: [
      { q: 'How many bits does the exponent field of a single-precision float have?', o: ['8', '11', '23', '7'], a: 0, e: '1 sign + 8 exponent + 23 fraction = 32.' },
      { q: '1.0 in single precision is:', o: ['0x3F800000', '0x00000001', '0x40000000', '0x3F000000'], a: 0, e: '1.0 = 1.0 × 2⁰ → E = 127 = 01111111 → 0 01111111 000… = 3F800000.' },
      { q: 'What is the biased exponent for 0.5?', o: ['126', '127', '128', '−1'], a: 0, e: '0.5 = 1.0 × 2⁻¹ → E = −1 + 127 = 126.' },
      { q: '0xC0000000 represents:', o: ['−2.0', '−1.0', '2.0', '−0.5'], a: 0, e: '1 10000000 000…: e = 128 − 127 = 1, value −1.0 × 2¹ = −2.' },
      { q: 'Why is the exponent stored with a bias?', o: ['So exponents are non-negative and floats compare like integers', 'To gain one extra fraction bit', 'To represent NaN', 'To make addition exact'], a: 0, e: 'A biased (unsigned) exponent makes ordering simple.' },
      { q: 'What is −0.75 normalised?', o: ['−1.1 × 2⁻¹', '−1.01 × 2⁻¹', '−0.11 × 2⁰', '−1.1 × 2¹'], a: 0, e: '0.75 = 0.11₂ = 1.1₂ × 2⁻¹.' },
      { q: 'Which value cannot be represented exactly in IEEE 754 binary floating point?', o: ['0.1', '0.5', '0.375', '1024'], a: 0, e: '0.1 = 0.000110011…₂ repeats forever; the others are finite binary fractions.' },
      { q: 'The pattern 0x80000000 is:', o: ['−0', 'NaN', '−∞', 'The smallest negative normal number'], a: 0, e: 'Sign 1, E = 0, F = 0 → negative zero.' },
      { q: 'The largest exponent e of a normal single-precision number is:', o: ['127', '128', '255', '126'], a: 0, e: 'E max for normal numbers is 254 → e = 254 − 127 = 127.' },
    ],
  });
})();
