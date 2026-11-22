(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m10', id, o);
  const cols = CAI.num.columnHTML;

  CAI.modules.push({
    id: 'm10', num: 10, icon: '⚙️', title: 'Combinational Circuits',
    summary: 'Half/full adders, ripple-carry adders, subtracters, multiplexers and decoders.',
    generators: ['rippleAdd', 'fullAdder', 'fullSub', 'mux', 'muxFunction', 'decoder'],
    lessons: [
      {
        id: 'm10l1', title: 'Adders and subtracters', minutes: 9,
        intuition: `<p>Adding two bits gives a 2-bit answer: a <b>sum</b> bit and a <b>carry</b> bit. A <b>half adder</b> adds 2 bits; a <b>full adder</b> adds 3 (two bits plus the carry from the previous column). Chain n full adders and you get an n-bit <b>ripple-carry adder</b> — the carry “ripples” from right to left exactly as in pencil-and-paper addition.</p>`,
        rule: `<ul><li>Half adder: S = A ⊕ B, C = AB.</li><li>Full adder: S = A ⊕ B ⊕ C<sub>in</sub>, C<sub>out</sub> = AB + C<sub>in</sub>(A ⊕ B) (= majority of the 3 inputs).</li><li>Half subtracter: D = A ⊕ B, B<sub>out</sub> = A'B.</li><li>Full subtracter: D = A ⊕ B ⊕ B<sub>in</sub>, B<sub>out</sub> = A'B + A'B<sub>in</sub> + B·B<sub>in</sub>.</li><li>Adder-subtracter: feed B through XOR gates controlled by M and set C₀ = M: M = 0 adds, M = 1 computes A + B' + 1 = A − B.</li></ul>`,
        example: {
          prompt: 'A 4-bit ripple-carry adder adds A = <b class="mono">1011</b> and B = <b class="mono">0110</b> (C₀ = 0). Find C₄ S₃S₂S₁S₀.',
          steps: [
            { title: 'Stage 0: A₀=1, B₀=0, C₀=0', html: 'S₀ = 1, C₁ = 0' },
            { title: 'Stage 1: A₁=1, B₁=1, C₁=0', html: 'S₁ = 0, C₂ = 1' },
            { title: 'Stage 2: A₂=0, B₂=1, C₂=1', html: 'S₂ = 0, C₃ = 1' },
            { title: 'Stage 3: A₃=1, B₃=0, C₃=1', html: 'S₃ = 0, C₄ = 1 ' + cols([{ label: 'carry', bits: '1100', cls: 'muted' }, { label: 'A', bits: '1011' }, { label: 'B', bits: '0110' }, { label: 'S', bits: '0001', cls: 'rule' }]) },
            { title: 'Result and check', html: 'C₄S₃S₂S₁S₀ = <b>10001</b> = 17 = 11 + 6 ✔' },
          ],
          answer: '<b class="mono">10001</b>',
        },
        practice: G.make('rippleAdd', { a: '0111', b: '0101' }),
        more: 'rippleAdd',
      },
      {
        id: 'm10l2', title: 'Multiplexers', minutes: 8,
        intuition: `<p>A multiplexer (MUX) is a <b>data selector</b> — a rotary switch controlled by bits. With k select lines it chooses one of 2<sup>k</sup> inputs and passes it to the output. Because it can pick a different input for every combination of the select lines, a MUX can implement any Boolean function.</p>`,
        rule: `<div class="formula">4:1 MUX: Y = S₁'S₀'I₀ + S₁'S₀I₁ + S₁S₀'I₂ + S₁S₀I₃</div><p><b>Implementing F(A,B,C) with a 4:1 MUX:</b> connect A, B to S₁, S₀. For each AB combination look at F in its two rows (C = 0 and C = 1): (0,0) → 0, (1,1) → 1, (0,1) → C, (1,0) → C'.</p>`,
        example: {
          prompt: 'Implement F(A,B,C) = Σm(1, 2, 6, 7) with a 4:1 MUX (S₁ = A, S₀ = B).',
          steps: [
            { title: 'I₀: rows AB = 00 → m0, m1', html: 'F = 0, 1 → follows C → <b>I₀ = C</b>' },
            { title: 'I₁: rows AB = 01 → m2, m3', html: "F = 1, 0 → opposite of C → <b>I₁ = C'</b>" },
            { title: 'I₂: rows AB = 10 → m4, m5', html: 'F = 0, 0 → <b>I₂ = 0</b>' },
            { title: 'I₃: rows AB = 11 → m6, m7', html: 'F = 1, 1 → <b>I₃ = 1</b>' },
            { title: 'Double-check one row', html: "Row 3 (011): select AB = 01 → I₁ = C' = 0, and m3 is not a minterm ✔" },
          ],
          answer: "I₀ = C, I₁ = C', I₂ = 0, I₃ = 1",
        },
        practice: G.make('muxFunction', { m: [0, 3, 4, 5] }),
        more: 'muxFunction',
      },
      {
        id: 'm10l3', title: 'Decoders (and encoders)', minutes: 7,
        intuition: `<p>A decoder is the opposite of a MUX: it takes an n-bit number and lights up <b>exactly one</b> of 2ⁿ output lines — the one with that number. Each output is therefore one <b>minterm</b>, so a decoder plus an OR gate can build any function. An <b>encoder</b> does the reverse: one active input line → its binary number.</p>`,
        rule: `<ul><li>n-to-2ⁿ decoder: Dᵢ = mᵢ (active-high); with an enable input E, all outputs are 0 when E = 0.</li><li>Function F = Σm(list) → OR together those decoder outputs.</li><li>Active-low decoders (bubbles) output 0 on the selected line; then use a NAND gate instead of OR.</li><li>Priority encoder: if several inputs are active, the highest-numbered one wins.</li></ul>`,
        example: {
          prompt: 'Build a full adder with a 3-to-8 decoder (inputs A, B, Cin) and OR gates.',
          steps: [
            { title: 'Truth table of S = A ⊕ B ⊕ Cin', html: 'S = 1 when an odd number of inputs are 1 → rows 1, 2, 4, 7' },
            { title: 'Truth table of Cout', html: 'Cout = 1 when at least two inputs are 1 → rows 3, 5, 6, 7' },
            { title: 'Wire the outputs', html: 'S = D₁ + D₂ + D₄ + D₇ · Cout = D₃ + D₅ + D₆ + D₇' },
            { title: 'Double-check one row', html: 'A=1,B=1,Cin=0 → input 110 = 6 → only D₆ = 1 → S = 0, Cout = 1 ✔ (1 + 1 = 10₂)' },
          ],
          answer: 'S = Σm(1,2,4,7), Cout = Σm(3,5,6,7)',
        },
        practice: G.make('exprToMinterms', { expr: "A'B + AC", decoder: true }),
        more: 'decoder',
      },
    ],
    bank: [
      G.make('fullAdder', { A: 1, Bv: 1, Ci: 1 }),
      G.make('fullAdder', { A: 1, Bv: 0, Ci: 1 }),
      G.make('fullSub', { A: 0, Bv: 1, Bi: 1 }),
      G.make('mux', { size: 4, I: [0, 1, 1, 0], sel: 2 }),
      G.make('mux', { size: 8, I: [1, 0, 0, 1, 0, 1, 1, 0], sel: 5 }),
      G.make('decoder', { ins: '110' }),
      G.make('muxFunction', { m: [1, 2, 3, 6] }),
      G.make('rippleAdd', { a: '1101', b: '1011' }),
      C('mux-select', {
        prompt: 'How many select lines does a 32-to-1 multiplexer need?', format: 'A whole number',
        answer: { type: 'num', base: 10, value: '5' },
        hints: ['k select lines choose among 2^k inputs.', 'Solve 2^k = 32.', '2^5 = 32.'],
        steps: [{ ask: 'k?', value: '5', show: '2⁵ = 32 → <b>5</b>' }],
        finalCheck: 'Check: 2 to the power of your answer must equal 32.',
      }),
      C('half-adder', {
        prompt: 'Write the Boolean expression for the <b>carry</b> output of a half adder with inputs A and B.', format: 'e.g. AB',
        answer: { type: 'bool', value: 'AB' },
        hints: ['A half adder adds two bits.', 'A carry happens only when the sum is 2.', 'That is only when A = 1 and B = 1.'],
        steps: [{ ask: 'Carry expression?', value: 'AB', vtype: 'bool', show: 'C = <b>AB</b>' }],
        finalCheck: 'Check row 11: 1 + 1 = 10, carry 1.',
      }),
    ],
    review: `
      <h3>Adders</h3><ul><li>Half adder: S = A⊕B, C = AB (1 XOR + 1 AND).</li><li>Full adder: S = A⊕B⊕Cin, Cout = AB + Cin(A⊕B) = AB + ACin + BCin. Two half adders + OR.</li><li>n-bit ripple adder: n full adders; delay grows with n (carry-lookahead speeds it up: Gᵢ = AᵢBᵢ, Pᵢ = Aᵢ⊕Bᵢ, Cᵢ₊₁ = Gᵢ + PᵢCᵢ).</li><li>Adder/subtracter: XOR each Bᵢ with M and set C₀ = M.</li></ul>
      <h3>Subtracters</h3><p>Half: D = A⊕B, Bout = A'B. Full: D = A⊕B⊕Bin, Bout = A'B + A'Bin + B·Bin.</p>
      <h3>Multiplexer</h3><ul><li>2ᵏ inputs, k select lines, 1 output.</li><li>Implements any n-variable function with n−1 select lines + the last variable / its complement / 0 / 1 on the data inputs.</li></ul>
      <h3>Decoder / encoder</h3><ul><li>Decoder n → 2ⁿ: each output is a minterm; OR them to make any function.</li><li>Enable input disables all outputs. Active-low → use NAND.</li><li>Encoder 2ⁿ → n; priority encoder resolves multiple active inputs and has a “valid” output.</li><li>Demultiplexer = decoder with the enable used as the data input.</li></ul>
      <p class="tip">⚠ Exam traps: forgetting the final carry; swapping S₁ and S₀; reversing the decoder input order.</p>`,
    blanks: [
      { s: 'A half adder’s sum output is A ___ B.', a: ['XOR', '⊕', 'xor'] },
      { s: 'A full adder has ___ inputs.', a: ['3', 'three'] },
      { s: 'A multiplexer with 3 select lines has ___ data inputs.', a: ['8', 'eight'] },
      { s: 'Each output of an active-high decoder corresponds to one ___ of its inputs.', a: ['minterm'] },
      { s: 'In a ripple-carry adder, the delay grows because each stage waits for the ___ from the previous stage.', a: ['carry'] },
      { s: 'A ___ encoder outputs the code of the highest-numbered active input.', a: ['priority'] },
    ],
    quiz: [
      { q: 'The carry output of a full adder can be written as:', o: ['AB + ACin + BCin', 'A ⊕ B ⊕ Cin', "A'B + Cin", 'AB·Cin'], a: 0, e: 'Majority function: at least two inputs are 1.' },
      { q: 'How many full adders are needed for an 8-bit ripple-carry adder?', o: ['8', '7', '16', '4'], a: 0, e: 'One per bit (the first may be a half adder if C₀ is always 0).' },
      { q: 'A 4:1 MUX has I0=1, I1=0, I2=0, I3=1. For S1S0 = 11, Y =', o: ['1', '0', 'S0', 'undefined'], a: 0, e: '11 selects I3 = 1.' },
      { q: 'A 3-to-8 decoder with input 011 activates output:', o: ['D3', 'D6', 'D1', 'D0'], a: 0, e: '011₂ = 3.' },
      { q: 'To build F = Σm(0, 5, 7) with an active-high decoder you need:', o: ['A 3-input OR gate', 'An 8-input AND gate', 'A 5-input OR gate', 'A NOT gate per output'], a: 0, e: 'OR the three selected outputs.' },
      { q: 'A half subtracter’s borrow output is:', o: ["A'B", "AB'", 'AB', 'A ⊕ B'], a: 0, e: 'You must borrow when A = 0 and B = 1.' },
      { q: 'In an adder/subtracter, setting M = 1 makes the circuit compute:', o: ['A − B', 'A + B', 'B − A', 'A + B + 1'], a: 0, e: 'B is inverted by the XORs and C₀ = 1 adds the 1: A + B\' + 1 = A − B.' },
      { q: 'A demultiplexer is essentially a:', o: ['Decoder with an enable input', 'Multiplexer in reverse with no select lines', 'Encoder', 'Full adder'], a: 0, e: 'The data input drives the enable; the select lines pick the output.' },
      { q: 'How many select lines does a 16:1 MUX need?', o: ['4', '16', '8', '2'], a: 0, e: '2⁴ = 16.' },
    ],
  });
})();
