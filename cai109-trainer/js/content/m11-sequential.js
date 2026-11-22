(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m11', id, o);
  const tt = (head, rows) => `<table class="work mono tt"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

  CAI.modules.push({
    id: 'm11', num: 11, icon: '⏱️', title: 'Intro to Sequential Circuits',
    summary: 'Memory through feedback: SR latches, gated D latches, and D, JK and T flip-flops.',
    generators: ['ffSeq', 'ffNext'],
    lessons: [
      {
        id: 'm11l1', title: 'Latches: SR and gated D', minutes: 8,
        intuition: `<p>Everything so far was <b>combinational</b>: outputs depend only on the current inputs. Feed a gate’s output back into its input and the circuit can <b>remember</b>. Two cross-coupled NOR gates form an <b>SR latch</b>: pulse S to Set the memory to 1, pulse R to Reset it to 0, and with both inputs at 0 it simply holds what it had.</p>`,
        rule: `${tt(['S', 'R', 'Q⁺ (NOR latch)', 'Action'], [[0, 0, 'Q', 'hold'], [0, 1, 0, 'reset'], [1, 0, 1, 'set'], [1, 1, '—', 'forbidden (Q = Q\' = 0)']])}<ul><li>A NAND latch (S'R') is active-low: S' = 0 sets, R' = 0 resets, 11 holds, 00 is forbidden.</li><li><b>Gated D latch</b>: when Enable = 1, Q follows D (transparent); when Enable = 0, Q holds. No forbidden state.</li><li>Characteristic equation (SR): Q⁺ = S + R'Q with SR = 0.</li></ul>`,
        example: {
          prompt: 'An SR NOR latch starts with Q = 0. The inputs (S,R) are applied in turn: (1,0), (0,0), (0,1), (0,0). Give Q after each.',
          steps: [
            { title: '(1,0): set', html: 'Q = <b>1</b>' },
            { title: '(0,0): hold the previous value', html: 'Q = <b>1</b>' },
            { title: '(0,1): reset', html: 'Q = <b>0</b>' },
            { title: '(0,0): hold, and double-check', html: 'Q = <b>0</b>. Holding always copies the value from the step before ✔' },
          ],
          answer: 'Q sequence: <b class="mono">1100</b>',
        },
        practice: G.make('ffSeq', { type: 'SR', q0: 1, seq: [[0, 0], [0, 1], [1, 0], [0, 0]] }),
        more: 'ffSeq',
      },
      {
        id: 'm11l2', title: 'Flip-flops: D, JK and T', minutes: 9,
        intuition: `<p>A latch is “transparent” the whole time it is enabled, which makes timing messy. A <b>flip-flop</b> only changes at the instant of a <b>clock edge</b> (e.g. the rising edge ↑). Between edges it ignores its inputs. This lets millions of flip-flops update in lock-step — the heartbeat of every processor.</p>`,
        rule: `${tt(['Type', 'Behaviour at the clock edge', 'Characteristic equation'], [['D', 'Q⁺ = D (copy)', 'Q⁺ = D'], ['JK', '00 hold · 01 reset · 10 set · 11 toggle', "Q⁺ = JQ' + K'Q"], ['T', 'T = 0 hold · T = 1 toggle', 'Q⁺ = T ⊕ Q'], ['SR', '00 hold · 01 reset · 10 set · 11 forbidden', "Q⁺ = S + R'Q"]])}<p>Asynchronous preset/clear inputs override the clock. A JK with J = K = 1 is a T flip-flop; a JK with K = J' is a D flip-flop.</p>`,
        example: {
          prompt: 'A JK flip-flop starts at Q = 0. At successive rising edges (J,K) = (1,0), (0,0), (1,1), (1,1), (0,1). Give Q after each edge.',
          steps: [
            { title: 'Edge 1: J=1, K=0 → set', html: 'Q = <b>1</b>' },
            { title: 'Edge 2: J=0, K=0 → hold', html: 'Q = <b>1</b>' },
            { title: 'Edge 3: J=1, K=1 → toggle', html: 'Q = <b>0</b>' },
            { title: 'Edge 4: toggle again', html: 'Q = <b>1</b>' },
            { title: 'Edge 5: J=0, K=1 → reset, then double-check', html: "Q = <b>0</b>. Check edge 3 with Q⁺ = JQ' + K'Q = 1·0 + 0·1 = 0 ✔" },
          ],
          answer: 'Q sequence: <b class="mono">11010</b>',
        },
        practice: G.make('ffSeq', { type: 'JK', q0: 1, seq: [[0, 1], [1, 1], [0, 0], [1, 0], [1, 1]] }),
        more: 'ffSeq',
      },
    ],
    bank: [
      G.make('ffSeq', { type: 'D', q0: 0, seq: [[1], [1], [0], [1], [0]] }),
      G.make('ffSeq', { type: 'T', q0: 0, seq: [[1], [1], [0], [1], [1], [0]] }),
      G.make('ffSeq', { type: 'JK', q0: 0, seq: [[1, 1], [0, 0], [0, 1], [1, 1], [1, 0]] }),
      G.make('ffNext', { type: 'JK', q: 1, x: [1, 1] }),
      G.make('ffNext', { type: 'T', q: 1, x: [1] }),
      C('sr-forbidden', {
        prompt: 'For a NOR-based SR latch, which input combination is not allowed?', choices: ['S = 1, R = 1', 'S = 0, R = 0', 'S = 1, R = 0', 'S = 0, R = 1'],
        answer: { type: 'choice', value: 0 }, explain: 'S = R = 1 forces both Q and Q\' to 0, and when both inputs return to 0 the final state is unpredictable (race).',
        hints: ['Think about what each NOR gate outputs when one of its inputs is 1.', 'With S = R = 1 both NOR outputs are forced to 0.', 'Q and Q\' are supposed to be complements.'],
      }),
      C('latch-vs-ff', {
        prompt: 'What is the main difference between a latch and a flip-flop?', choices: ['A flip-flop changes only at a clock edge; a latch is level-sensitive', 'A latch has no feedback', 'A flip-flop cannot store a bit', 'A latch needs a clock edge'],
        answer: { type: 'choice', value: 0 }, explain: 'Latches are transparent while enabled (level-triggered); flip-flops sample their inputs only at the active clock edge (edge-triggered).',
        hints: ['Both store one bit using feedback.', 'Think about WHEN each one is allowed to change.', 'Level vs edge.'],
      }),
      C('t-counter', {
        prompt: 'A T flip-flop has T = 1 permanently and starts at Q = 0. What is Q after <b>7</b> clock edges?', format: '0 or 1',
        answer: { type: 'bits', value: '1', width: 1 },
        hints: ['T = 1 means toggle on every edge.', 'Q goes 1, 0, 1, 0 …', 'After an odd number of toggles Q is the opposite of where it started.'],
        steps: [{ ask: 'Q after 1 edge?', value: '1', vtype: 'exact', show: '1' }, { ask: 'Q after 2 edges?', value: '0', vtype: 'exact', show: '0' }, { ask: 'Q after 7 edges?', value: '1', vtype: 'exact', show: '7 is odd → <b>1</b>' }],
        finalCheck: 'Odd number of toggles → opposite of the start value.',
      }),
    ],
    review: `
      <h3>Combinational vs sequential</h3><p>Sequential outputs depend on inputs AND stored state (memory via feedback). Synchronous circuits change at clock edges.</p>
      <h3>Latches (level-sensitive)</h3><ul><li>SR NOR: 00 hold, 01 reset, 10 set, 11 forbidden.</li><li>S'R' NAND: active-low; 00 forbidden, 11 hold.</li><li>Gated D: EN = 1 → Q = D; EN = 0 → hold.</li></ul>
      <h3>Flip-flops (edge-triggered)</h3>
      ${tt(['FF', 'Q⁺'], [['D', 'D'], ['JK', "JQ' + K'Q"], ['T', 'T ⊕ Q'], ['SR', "S + R'Q (SR = 0)"]])}
      <h3>Excitation table (what inputs cause Q → Q⁺)</h3>
      ${tt(['Q → Q⁺', 'D', 'T', 'J K', 'S R'], [['0 → 0', '0', '0', '0 X', '0 X'], ['0 → 1', '1', '1', '1 X', '1 0'], ['1 → 0', '0', '1', 'X 1', '0 1'], ['1 → 1', '1', '0', 'X 0', 'X 0']])}
      <p class="tip">⚠ Exam traps: using the new Q instead of the present Q; forgetting the JK toggle case; confusing active-low NAND latch inputs with NOR latch inputs.</p>`,
    blanks: [
      { s: 'Circuits whose outputs depend on present inputs and on past history are called ___ circuits.', a: ['sequential'] },
      { s: 'In an SR NOR latch, S = R = 1 is ___.', a: ['forbidden', 'not allowed', 'invalid', 'illegal'] },
      { s: 'A JK flip-flop with J = K = 1 will ___ its output at each clock edge.', a: ['toggle', 'invert', 'complement'] },
      { s: 'The characteristic equation of a T flip-flop is Q⁺ = T ___ Q.', a: ['XOR', '⊕', 'xor'] },
      { s: 'A flip-flop changes state only on a clock ___.', a: ['edge', 'transition'] },
      { s: 'A gated D latch is called ___ because Q follows D while the enable is 1.', a: ['transparent'] },
    ],
    quiz: [
      { q: 'A D flip-flop has D = 1 at a rising clock edge. Q becomes:', o: ['1', '0', 'Q (unchanged)', "Q'"], a: 0, e: 'Q⁺ = D.' },
      { q: 'A JK flip-flop with Q = 1, J = 0, K = 0 after an edge:', o: ['1', '0', 'toggles to 0', 'undefined'], a: 0, e: 'JK = 00 holds.' },
      { q: 'A T flip-flop with T = 1 and Q = 1 after an edge:', o: ['0', '1', 'undefined', 'stays 1'], a: 0, e: 'T = 1 toggles.' },
      { q: 'In a NAND-based S\'R\' latch, which input combination holds the state?', o: ['S\' = 1, R\' = 1', 'S\' = 0, R\' = 0', 'S\' = 0, R\' = 1', 'S\' = 1, R\' = 0'], a: 0, e: 'Inputs are active-low, so 1s are “inactive” → hold.' },
      { q: 'Which flip-flop has no forbidden input combination and can toggle?', o: ['JK', 'SR', 'D', 'SR latch'], a: 0, e: 'JK replaces the forbidden SR = 11 with toggle.' },
      { q: 'Excitation: to make a JK flip-flop go from Q = 0 to Q = 1, J and K must be:', o: ['J = 1, K = X', 'J = 0, K = 1', 'J = X, K = 1', 'J = 0, K = X'], a: 0, e: 'Either set (10) or toggle (11) works, so K is a don’t-care.' },
      { q: 'Edge-triggered means the flip-flop:', o: ['Samples its inputs only at a clock transition', 'Changes whenever its inputs change', 'Needs no clock', 'Has two outputs that are equal'], a: 0, e: 'It responds at the rising (or falling) edge only.' },
      { q: 'A T flip-flop with T = 1 toggling on every edge of a 100 kHz clock produces an output of:', o: ['50 kHz', '100 kHz', '200 kHz', '25 kHz'], a: 0, e: 'Two edges per output period → frequency halves (a divide-by-2 counter).' },
      { q: 'The characteristic equation Q⁺ = JQ\' + K\'Q belongs to the:', o: ['JK flip-flop', 'T flip-flop', 'D flip-flop', 'SR latch'], a: 0, e: 'Set when J = 1 and Q = 0; keep 1 when K = 0.' },
    ],
  });
})();
