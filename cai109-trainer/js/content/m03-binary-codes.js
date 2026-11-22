(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m3', id, o);

  CAI.modules.push({
    id: 'm3', num: 3, icon: '🧬', title: 'Binary Codes',
    summary: 'BCD, Gray code, parity, Hamming code (error detection & correction) and CRC.',
    generators: ['dec2bcd', 'bin2gray', 'gray2bin', 'parity', 'hammingEnc', 'hammingDec', 'crc'],
    lessons: [
      {
        id: 'm3l1', title: 'BCD, Gray code and parity', minutes: 7,
        intuition: `<p>A <b>code</b> is just an agreed way to map information to bits. Different codes optimise different things: <b>BCD</b> keeps decimal digits easy to display, <b>Gray code</b> makes neighbouring values differ by only one bit (great for rotary encoders — no glitches), and a <b>parity bit</b> lets a receiver notice a single flipped bit.</p>`,
        rule: `<ul><li><b>BCD (8421):</b> each decimal digit → its own 4-bit pattern. 1010–1111 are unused (invalid).</li><li><b>Binary → Gray:</b> g<sub>MSB</sub> = b<sub>MSB</sub>; every other gᵢ = bᵢ ⊕ bᵢ₊₁ (XOR with the neighbour on the left).</li><li><b>Gray → binary:</b> b<sub>MSB</sub> = g<sub>MSB</sub>; every other bᵢ = bᵢ₊₁ ⊕ gᵢ (XOR with the binary bit you just produced).</li><li><b>Parity:</b> even parity makes the total number of 1s even; odd parity makes it odd. Detects any odd number of bit errors, corrects none.</li></ul>`,
        example: {
          prompt: 'Convert binary <b class="mono">10110</b> to Gray code.',
          steps: [
            { title: 'Copy the MSB', html: 'g₄ = b₄ = <b>1</b>' },
            { title: 'XOR neighbouring binary bits, left to right', html: '1⊕0 = <b>1</b>, 0⊕1 = <b>1</b>, 1⊕1 = <b>0</b>, 1⊕0 = <b>1</b>' },
            { title: 'Write the Gray code', html: '<b class="mono">11101</b>' },
            { title: 'Double-check by converting back', html: 'b = 1, 1⊕1 = 0, 0⊕1 = 1, 1⊕0 = 1, 1⊕1 = 0 → 10110 ✔' },
          ],
          answer: '10110 (binary) = <b class="mono">11101</b> (Gray)',
        },
        practice: G.make('bin2gray', { bits: '110100' }),
        more: 'bin2gray',
      },
      {
        id: 'm3l2', title: 'Hamming code: detect and correct', minutes: 9,
        intuition: `<p>One parity bit can tell you <i>something</i> is wrong but not <i>where</i>. Hamming’s trick: use several parity bits that each watch a different overlapping set of positions. When a bit flips, the pattern of failing checks spells out its <b>position number in binary</b>.</p>`,
        rule: `<p><b>Hamming(7,4), even parity.</b> Positions 1…7 hold <span class="mono">p1 p2 d1 p4 d2 d3 d4</span> (parity bits at the powers of two).</p><ul><li>p1 covers positions 1,3,5,7 → p1 = d1⊕d2⊕d4</li><li>p2 covers 2,3,6,7 → p2 = d1⊕d3⊕d4</li><li>p4 covers 4,5,6,7 → p4 = d2⊕d3⊕d4</li></ul><p><b>Decoding:</b> recompute c1, c2, c4 over the received bits. The syndrome <b>c4 c2 c1</b> read as binary is the error position (0 = no error). Flip that bit. Number of parity bits r must satisfy 2<sup>r</sup> ≥ m + r + 1. Adding one overall parity bit gives SEC-DED (correct 1, detect 2).</p>`,
        example: {
          prompt: 'Encode data <b class="mono">1011</b>, then decode the received word <b class="mono">0110001</b>.',
          steps: [
            { title: 'Compute the parity bits (d1 d2 d3 d4 = 1 0 1 1)', html: 'p1 = 1⊕0⊕1 = 0 · p2 = 1⊕1⊕1 = 1 · p4 = 0⊕1⊕1 = 0' },
            { title: 'Assemble p1 p2 d1 p4 d2 d3 d4', html: '<b class="mono">0 1 1 0 0 1 1</b> = 0110011' },
            { title: 'Receiver: recompute the checks on 0110001', html: 'c1 = b1⊕b3⊕b5⊕b7 = 0⊕1⊕0⊕1 = 0<br>c2 = b2⊕b3⊕b6⊕b7 = 1⊕1⊕0⊕1 = 1<br>c4 = b4⊕b5⊕b6⊕b7 = 0⊕0⊕0⊕1 = 1' },
            { title: 'Syndrome → position', html: 'c4 c2 c1 = 110₂ = <b>6</b> → flip bit 6: 0110001 → <b class="mono">0110011</b> ✔ (matches what was sent)' },
          ],
          answer: 'Codeword <b class="mono">0110011</b>; the error was in position 6.',
        },
        practice: G.make('hammingDec', { data: '0110', err: 3 }),
        more: 'hammingDec',
      },
      {
        id: 'm3l3', title: 'CRC (cyclic redundancy check)', minutes: 8,
        intuition: `<p>CRC is “divide and keep the remainder”. Sender and receiver agree on a divisor (the <b>generator</b>). The sender appends the remainder so the whole frame divides exactly; if the receiver’s division leaves a non-zero remainder, the data was damaged. The division uses XOR instead of subtraction, so there are no borrows.</p>`,
        rule: `<ol><li>Generator with r+1 bits ⇒ append <b>r zeros</b> to the data.</li><li>Modulo-2 long division: if the leading bit is 1, XOR the generator under it; if 0, move on.</li><li>The last r bits are the remainder = the <b>CRC</b>.</li><li>Transmit data followed by the CRC. Receiver divides the frame: remainder 0 ⇒ accept.</li></ol><p>Generators are often written as polynomials: 1011 = x³ + x + 1.</p>`,
        example: {
          prompt: 'Data <b class="mono">110101</b>, generator <b class="mono">1011</b>. Find the CRC.',
          steps: [
            { title: 'Generator has 4 bits → append 3 zeros', html: '<span class="mono">110101 000</span>' },
            { title: 'Long division with XOR', html: CAI.num.crcHTML('110101', '1011') },
            { title: 'Remainder = CRC', html: '<b class="mono">111</b>' },
            { title: 'Transmitted frame (and a check)', html: '<span class="mono">110101 111</span> — dividing this by 1011 leaves remainder 000 ✔' },
          ],
          answer: 'CRC = <b class="mono">111</b>',
        },
        practice: G.make('crc', { data: '101110', gen: '1001' }),
        more: 'crc',
      },
    ],
    bank: [
      G.make('dec2bcd', { n: 2024 }),
      G.make('gray2bin', { g: '1101' }),
      G.make('parity', { bits: '1011001', even: true }),
      G.make('parity', { bits: '1110110', even: false }),
      G.make('hammingEnc', { data: '1001' }),
      G.make('hammingDec', { data: '1100', err: 5 }),
      G.make('crc', { data: '1101011', gen: '1101' }),
      C('hamming-r', {
        prompt: 'How many parity bits does a single-error-correcting Hamming code need for <b>8 data bits</b>?', format: 'A whole number',
        answer: { type: 'num', base: 10, value: '4' },
        hints: ['The condition is 2^r ≥ m + r + 1.', 'Here m = 8. Try r = 3, then r = 4.', 'r = 3: 8 ≥ 12? r = 4: 16 ≥ 13?'],
        steps: [{ ask: 'Does r = 3 work? (yes/no)', value: 'no', vtype: 'word', show: '2³ = 8 < 8 + 3 + 1 = 12' }, { ask: 'Smallest r?', value: '4', show: '2⁴ = 16 ≥ 13 ✔ → <b>4</b>' }],
        finalCheck: 'Plug your r back into 2^r ≥ m + r + 1.',
      }),
    ],
    review: `
      <h3>BCD</h3><p>Each decimal digit in 4 bits: 59 → 0101 1001. Codes 1010–1111 are invalid. BCD needs more bits than plain binary.</p>
      <h3>Gray code</h3><ul><li>Successive values differ in exactly one bit (also wraps around).</li><li>B→G: g = b ⊕ (b shifted right), i.e. gᵢ = bᵢ ⊕ bᵢ₊₁.</li><li>G→B: bᵢ = bᵢ₊₁ ⊕ gᵢ (uses the binary result).</li><li>Used for K-map labels (00 01 11 10) and position encoders.</li></ul>
      <h3>Parity</h3><p>Even parity: total 1s even. Detects single (odd-count) errors, cannot locate them.</p>
      <h3>Hamming(7,4)</h3><ul><li>Order p1 p2 d1 p4 d2 d3 d4.</li><li>p1: 1,3,5,7 · p2: 2,3,6,7 · p4: 4,5,6,7.</li><li>Syndrome c4c2c1 = position of the error.</li><li>2ʳ ≥ m + r + 1. Minimum distance 3 → correct 1 error; add overall parity (distance 4) → SEC-DED.</li></ul>
      <h3>CRC</h3><ul><li>Append r zeros (r = generator length − 1), divide with XOR, remainder = CRC.</li><li>Frame = data + CRC; receiver remainder 0 ⇒ OK.</li><li>Detects all single-bit errors and all burst errors of length ≤ r.</li></ul>
      <p class="tip">⚠ Exam traps: forgetting to append zeros; mixing up the B→G and G→B rules; reading the syndrome in the wrong order (it is c4 c2 c1).</p>`,
    blanks: [
      { s: 'In BCD, each decimal digit is represented by ___ bits.', a: ['4', 'four'] },
      { s: 'In Gray code, consecutive values differ in exactly ___ bit.', a: ['one', '1'] },
      { s: 'With even parity, the total number of 1s including the parity bit is ___.', a: ['even'] },
      { s: 'In a Hamming code, parity bits are placed at positions that are powers of ___.', a: ['2', 'two'] },
      { s: 'The number formed by the failing Hamming checks c4 c2 c1 is called the ___.', a: ['syndrome'] },
      { s: 'Before CRC division, the sender appends as many zeros as the ___ of the generator polynomial.', a: ['degree'] },
      { s: 'A single parity bit can detect an error but cannot ___ it.', a: ['correct', 'locate', 'fix'] },
    ],
    quiz: [
      { q: 'The BCD code of 73 is:', o: ['0111 0011', '0100 1001', '0111 0010', '1001 0011'], a: 0, e: '7 = 0111, 3 = 0011.' },
      { q: 'Which is NOT a valid BCD digit?', o: ['1100', '1001', '0000', '0111'], a: 0, e: '1100 = 12; only 0000–1001 are valid.' },
      { q: 'The Gray code of binary 0111 is:', o: ['0100', '0111', '0101', '1000'], a: 0, e: '0, 0⊕1=1, 1⊕1=0, 1⊕1=0 → 0100.' },
      { q: 'Gray code 1110 in binary is:', o: ['1011', '1001', '1100', '1010'], a: 0, e: 'b=1, 1⊕1=0, 0⊕1=1, 1⊕0=1 → 1011.' },
      { q: 'An even-parity receiver gets 1101 0110 (parity bit included). Conclusion?', o: ['An error is detected (odd number of 1s)', 'The word is correct', 'Bit 3 is wrong', 'Two bits are wrong'], a: 0, e: 'There are five 1s — odd — so an error is detected, but its position is unknown.' },
      { q: 'In Hamming(7,4), parity bit p2 checks positions:', o: ['2, 3, 6, 7', '2, 4, 6', '1, 3, 5, 7', '4, 5, 6, 7'], a: 0, e: 'Positions whose binary index has the 2s bit set: 2 (010), 3 (011), 6 (110), 7 (111).' },
      { q: 'A Hamming(7,4) syndrome c4c2c1 = 101 means:', o: ['Bit 5 is in error', 'Bit 3 is in error', 'No error', 'Two errors'], a: 0, e: '101₂ = 5.' },
      { q: 'With generator 10011, how many zeros are appended before CRC division?', o: ['4', '5', '3', '2'], a: 0, e: '5-bit generator = degree 4 → append 4 zeros; CRC is 4 bits.' },
      { q: 'What is the main advantage of Gray code?', o: ['Only one bit changes between neighbouring values', 'It uses fewer bits than binary', 'It detects all errors', 'It is easy to add'], a: 0, e: 'Single-bit changes avoid glitches when several bits would otherwise switch together.' },
    ],
  });
})();
