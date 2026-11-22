(function () {
  const CAI = window.CAI, G = CAI.gen;
  const C = (id, o) => G.custom('m4', id, o);

  CAI.modules.push({
    id: 'm4', num: 4, icon: '🗜️', title: 'Data Coding & Compression',
    summary: 'Fixed vs variable-length codes, Huffman coding, LZ77 and LZ78 dictionary compression.',
    generators: ['huffman', 'lz78', 'fixedLen'],
    lessons: [
      {
        id: 'm4l1', title: 'Huffman coding', minutes: 8,
        intuition: `<p>Morse code gives “E” (very common) a single dot and “Q” a long pattern. Huffman coding does the same, optimally: <b>frequent symbols get short codes, rare symbols get long ones</b>. Because no code is the beginning of another (it is <b>prefix-free</b>), you can decode without separators.</p>`,
        rule: `<ol><li>Make a leaf for every symbol, weighted by its frequency.</li><li>Repeatedly remove the <b>two smallest</b> weights and join them under a new node whose weight is their sum.</li><li>When one tree is left, label left branches 0 and right branches 1. A symbol’s code is the path from the root.</li></ol><div class="formula">Total bits = Σ frequency × code length &nbsp;·&nbsp; Average length = total / number of symbols</div><p>Ties can give different trees, but the <b>total length is always the same (optimal)</b>.</p>`,
        example: {
          prompt: 'Frequencies: A = 10, B = 5, C = 3, D = 2. Build Huffman codes and count the bits.',
          steps: [
            { title: 'Merge the two smallest: D(2) + C(3)', html: 'new node CD = <b>5</b>. Remaining: A10, B5, CD5' },
            { title: 'Merge the two smallest: B(5) + CD(5)', html: 'new node = <b>10</b>. Remaining: A10, BCD10' },
            { title: 'Merge the last two: A(10) + BCD(10)', html: 'root = <b>20</b>' },
            { title: 'Read the codes (left = 0, right = 1)', html: 'A = <span class="mono">0</span>, B = <span class="mono">10</span>, C = <span class="mono">110</span>, D = <span class="mono">111</span>' },
            { title: 'Total bits and comparison', html: '10·1 + 5·2 + 3·3 + 2·3 = <b>35 bits</b>. A fixed 2-bit code would need 20·2 = 40 bits.' },
          ],
          answer: '<b>35 bits</b> (average 1.75 bits/symbol)',
        },
        practice: G.make('huffman', { freqs: { A: 7, B: 3, C: 2, D: 1, E: 1 } }),
        more: 'huffman',
      },
      {
        id: 'm4l2', title: 'LZ77 and LZ78 (dictionary methods)', minutes: 9,
        intuition: `<p>Text repeats itself. Instead of storing “ABAB” twice, store it once and later say “copy what I wrote earlier”. <b>LZ77</b> points back into a sliding window of recent text; <b>LZ78</b> builds a numbered dictionary of phrases and refers to them by number. Neither needs to know symbol frequencies in advance.</p>`,
        rule: `<p><b>LZ77</b> token = (offset back, length to copy, next character). Decode by copying <i>length</i> characters starting <i>offset</i> positions back, then appending the character.</p><p><b>LZ78</b>: dictionary starts empty (entry 0 = empty phrase).</p><ol><li>Find the longest prefix of the remaining input that is already in the dictionary (index i, or 0).</li><li>Output <b>(i, next char)</b>.</li><li>Add prefix + char to the dictionary as the next entry.</li></ol>`,
        example: {
          prompt: 'Encode <b class="mono">AABABBBABAABBA</b> with LZ78.',
          steps: [
            { title: '“A” is new', html: 'output <b>(0,A)</b>, entry 1 = A' },
            { title: '“A” is entry 1, “AB” is new', html: 'output <b>(1,B)</b>, entry 2 = AB' },
            { title: '“AB” is entry 2, “ABB” is new', html: 'output <b>(2,B)</b>, entry 3 = ABB' },
            { title: '“B” is new', html: 'output <b>(0,B)</b>, entry 4 = B' },
            { title: '“AB” known, “ABA” new; then “ABB” known, “ABBA” new', html: 'output <b>(2,A)</b> (entry 5 = ABA), then <b>(3,A)</b> (entry 6 = ABBA)' },
            { title: 'Double-check', html: 'A · AB · ABB · B · ABA · ABBA = AABABBBABAABBA ✔ (14 characters, 6 tokens)' },
          ],
          answer: '<b class="mono">(0,A)(1,B)(2,B)(0,B)(2,A)(3,A)</b>',
        },
        practice: G.make('lz78', { s: 'ABABABAABB' }),
        more: 'lz78',
      },
    ],
    bank: [
      G.make('huffman', { freqs: { A: 15, B: 7, C: 6, D: 6, E: 5 } }),
      G.make('huffman', { freqs: { P: 1, Q: 1, R: 2, S: 4, T: 8 } }),
      G.make('lz78', { s: 'BABAABAAABB' }),
      G.make('lz78', { s: 'AAAABAABBBA' }),
      G.make('fixedLen', { k: 26, len: 100 }),
      C('lz77-decode', {
        prompt: 'Decode the LZ77 tokens (offset, length, next char): <span class="mono">(0,0,A) (0,0,B) (2,2,A) (3,3,B)</span>', format: 'The decoded string',
        answer: { type: 'text', value: 'ABABAABAB' },
        hints: ['(0,0,X) just outputs the character X.', 'For (o,l,c): go back o characters from the END of the output so far, copy l characters, then append c.', 'After the first three tokens the text is ABABA.'],
        steps: [{ ask: 'Output after the first two tokens?', value: 'AB', vtype: 'exact', show: 'AB' }, { ask: 'Output after (2,2,A)?', value: 'ABABA', vtype: 'exact', show: 'copy “AB”, add A → ABABA' }, { ask: 'Final output?', value: 'ABABAABAB', vtype: 'exact', show: 'back 3 = “ABA”, add B → <b>ABABAABAB</b>' }],
        finalCheck: 'Count the characters: 1 + 1 + 3 + 4 = 9.',
      }),
      C('huff-prefix', {
        prompt: 'Which code set is prefix-free (so it could be a Huffman code)?', choices: ['0, 10, 110, 111', '0, 01, 11, 110', '1, 10, 100, 1000', '00, 01, 0, 11'],
        answer: { type: 'choice', value: 0 }, explain: 'In the first set no codeword is the beginning of another. In the others, e.g. 0 is a prefix of 01, and 1 is a prefix of 10.',
        hints: ['Prefix-free: no codeword is the start of another codeword.', 'Check every short code against the longer ones.', 'Look for a code that begins with another complete code.'],
      }),
      C('compression-ratio', {
        prompt: 'A file of 400 symbols uses 8-bit ASCII. After Huffman coding it needs 1000 bits. What is the compression ratio (original : compressed) as a decimal?', format: 'Decimal, e.g. 2.5',
        answer: { type: 'dec', value: 3.2 },
        hints: ['Original size = number of symbols × 8 bits.', '400 × 8 = 3200 bits.', 'Ratio = original / compressed.'],
        steps: [{ ask: 'Original size in bits?', value: '3200', show: '400 × 8 = 3200' }, { ask: 'Ratio?', value: '3.2', show: '3200 / 1000 = <b>3.2</b>' }],
        finalCheck: 'Ratio = original ÷ compressed (bigger than 1 means it shrank).',
      }),
    ],
    review: `
      <h3>Fixed vs variable length</h3><ul><li>Fixed: ⌈log₂ k⌉ bits per symbol for k symbols.</li><li>Variable: short codes for frequent symbols; must be <b>prefix-free</b> to decode unambiguously.</li></ul>
      <h3>Huffman</h3><ul><li>Repeatedly merge the two smallest weights.</li><li>Code = path from root (0 left / 1 right).</li><li>Total = Σ fᵢ·lᵢ; average = total / Σ fᵢ. Optimal among prefix codes.</li><li>Ties → different trees but the same total.</li></ul>
      <h3>LZ77</h3><p>Sliding window; token (offset, length, next). Decoder copies from its own output (copies may overlap).</p>
      <h3>LZ78</h3><ul><li>Dictionary of phrases, entry 0 = empty.</li><li>Token (index of longest known prefix, next char); add prefix+char.</li><li>LZW (used in GIF) is a variant that outputs only indices.</li></ul>
      <h3>Measures</h3><p>Compression ratio = original size / compressed size. Huffman is <i>statistical</i>; LZ methods are <i>dictionary</i> based. Both are lossless.</p>
      <p class="tip">⚠ Exam traps: merging the wrong pair (always the two smallest); forgetting that index 0 means “empty”; adding the wrong phrase to the dictionary.</p>`,
    blanks: [
      { s: 'In Huffman coding, the two nodes with the ___ weights are merged first.', a: ['smallest', 'lowest', 'least'] },
      { s: 'A code in which no codeword is the beginning of another is called ___-free.', a: ['prefix'] },
      { s: 'In LZ78, dictionary index ___ represents the empty phrase.', a: ['0', 'zero'] },
      { s: 'An LZ77 token consists of an offset, a length and the ___ character.', a: ['next'] },
      { s: 'Huffman, LZ77 and LZ78 are all ___ compression methods (no information is lost).', a: ['lossless'] },
      { s: 'With 20 different symbols, a fixed-length code needs ___ bits per symbol.', a: ['5', 'five'] },
    ],
    quiz: [
      { q: 'Huffman coding assigns the shortest codes to:', o: ['The most frequent symbols', 'The least frequent symbols', 'Symbols alphabetically first', 'All symbols equally'], a: 0, e: 'That minimises Σ frequency × length.' },
      { q: 'Frequencies A:4, B:2, C:1, D:1. Total Huffman bits?', o: ['14', '16', '12', '15'], a: 0, e: 'Merge 1+1=2, 2+2=4, 4+4=8 → lengths A1 B2 C3 D3 → 4+4+3+3 = 14.' },
      { q: 'LZ78 output for “AAA” starts with:', o: ['(0,A)(1,A)', '(0,A)(0,A)(0,A)', '(1,A)(0,A)', '(0,AA)'], a: 0, e: '“A” is new → (0,A); then “A” is entry 1 and “AA” is new → (1,A).' },
      { q: 'Which method needs the symbol frequencies before coding?', o: ['Static Huffman', 'LZ77', 'LZ78', 'LZW'], a: 0, e: 'Static Huffman builds its tree from known frequencies; LZ methods adapt as they go.' },
      { q: 'Which code set is NOT prefix-free?', o: ['1, 10, 11', '0, 10, 11', '00, 01, 1', '0, 10, 110, 111'], a: 0, e: '1 is a prefix of 10 and 11.' },
      { q: 'Decode LZ77 (0,0,X)(1,3,Y):', o: ['XXXXY', 'XXY', 'XXXY', 'XYXY'], a: 0, e: 'Output X; then back 1, copy 3 (overlapping copy) → XXX, then Y → XXXXY.' },
      { q: '1000 symbols drawn from 8 equally likely symbols, fixed-length code. Total bits?', o: ['3000', '8000', '1000', '2000'], a: 0, e: '⌈log₂ 8⌉ = 3 bits each.' },
      { q: 'The compression ratio of a 2000-bit file compressed to 500 bits is:', o: ['4', '0.25', '1500', '2.5'], a: 0, e: '2000 / 500 = 4.' },
      { q: 'Which statement about Huffman ties is true?', o: ['Different trees, same total length', 'The code becomes invalid', 'Total length changes', 'You must use fixed-length codes'], a: 0, e: 'All Huffman trees for the same frequencies are optimal.' },
    ],
  });
})();
