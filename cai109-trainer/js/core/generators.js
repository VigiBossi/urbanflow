/* Problem generators. Every generator takes optional params (so lessons and
   practice banks can pin exact numbers) and otherwise randomises.
   A problem = { prompt, format, answer, hints[3], steps[{ask, value, show, vtype}], traps[], finalCheck } */
(function () {
  const CAI = window.CAI;
  const U = CAI.util, N = CAI.num, B = CAI.bool;
  const { rint, pick } = U;
  const G = (CAI.gen = { defs: {}, list: [] });
  const sub = N.SUB;
  const mono = (s) => `<span class="mono">${s}</span>`;

  function def(id, module, label, fn) { const d = { id, module, label, fn }; G.defs[id] = d; G.list.push(d); }
  G.make = (id, params) => {
    const d = G.defs[id];
    if (!d) throw new Error('No generator ' + id);
    const p = d.fn(Object.assign({}, params || {}));
    p.gen = id; p.module = d.module;
    p.id = params ? `${id}:${JSON.stringify(params)}` : `${id}:${U.uid()}`;
    p.source = params ? 'bank' : 'generated';
    p.hints = p.hints || [];
    return p;
  };
  /* Hand-written problem (used by the content files) */
  G.custom = (module, id, obj) => Object.assign({ id: module + ':' + id, module, source: 'bank', steps: [], traps: [], hints: [] }, obj);
  G.forModule = (mid) => G.list.filter((d) => d.module === mid);
  const S = (ask, value, show, vtype, extra) => Object.assign({ ask, value: value == null ? null : String(value), show, vtype }, extra || {});

  /* ================= Module 1: number systems ================= */
  def('dec2bin', 'm1', 'Decimal → binary', ({ n = rint(33, 255) }) => {
    const bin = N.toBase(n, 2), rev = N.reverse(bin);
    const rows = N.divRows(n, 2);
    return {
      prompt: `Convert <b>${n}${sub(10)}</b> to binary.`,
      format: 'Binary digits, e.g. 101101',
      answer: { type: 'num', base: 2, value: bin },
      hints: ['Use repeated division by 2. Write down every quotient and remainder.', `Start with ${n} ÷ 2 = ${rows[0].q} remainder ${rows[0].r}. Keep dividing the quotient until it reaches 0.`, 'The LAST remainder is the most significant bit (leftmost). Read the remainders from the bottom up.'],
      steps: [
        S('Write the remainders in the order you computed them (first remainder first).', rev, N.divTable(n, 2), 'exact', { noEarly: bin === rev }),
        S('Read them bottom → top. What is the binary number?', bin, `Reading the remainders from the bottom up gives <b>${bin}${sub(2)}</b>. Check: ${N.expansion(bin, 2).html}`),
      ],
      traps: bin !== rev ? [{ value: rev, vtype: 'exact', msg: 'You wrote the remainders top → bottom. The FIRST remainder is the least-significant bit (rightmost).' }] : [],
      finalCheck: `Read the remainders bottom → top, then verify by adding the place values back up to ${n}.`,
    };
  });

  def('bin2dec', 'm1', 'Binary → decimal', ({ bits = '1' + N.bits(rint(0, 127), 7) }) => {
    const n = parseInt(bits, 2);
    const vals = bits.split('').map((c, i) => (c === '1' ? 2 ** (bits.length - 1 - i) : 0)).filter(Boolean);
    return {
      prompt: `Convert <b>${bits}${sub(2)}</b> to decimal.`,
      format: 'A decimal number, e.g. 181',
      answer: { type: 'num', base: 10, value: String(n) },
      hints: ['Each bit position has a place value: 1, 2, 4, 8, 16, 32, 64, 128 … starting from the RIGHT.', 'Write the place value above each bit and keep only the ones under a 1.', `The leftmost bit here is worth ${2 ** (bits.length - 1)}. Add up the kept place values.`],
      steps: [
        S('List the place values of the 1-bits (largest first, comma separated).', vals.join(', '), `<table class="work mono"><tr>${bits.split('').map((_, i) => `<td>${2 ** (bits.length - 1 - i)}</td>`).join('')}</tr><tr>${bits.split('').map((c) => `<td><b>${c}</b></td>`).join('')}</tr></table>Kept: ${vals.join(', ')}`, 'list'),
        S('Add them. What is the decimal value?', n, `${vals.join(' + ')} = <b>${n}</b>`),
      ],
      traps: [],
      finalCheck: 'Recount the place values — the rightmost bit is worth 1, not 2.',
    };
  });

  function decToBase(id, base, label, lo, hi) {
    def(id, 'm1', label, ({ n = rint(lo, hi) }) => {
      const ans = N.toBase(n, base);
      const rows = N.divRows(n, base);
      const DIG = '0123456789ABCDEF';
      const revDigits = rows.map((r) => DIG[r.r]).join('');
      return {
        prompt: `Convert <b>${n}${sub(10)}</b> to base ${base}${base === 16 ? ' (hexadecimal)' : ' (octal)'}.`,
        format: base === 16 ? 'Hex digits, e.g. 3AF or 0x3AF' : 'Octal digits, e.g. 1537',
        answer: { type: 'num', base, value: ans },
        hints: [`Use repeated division by ${base}.`, `First: ${n} ÷ ${base} = ${rows[0].q} remainder ${rows[0].r}${base === 16 && rows[0].r > 9 ? ` (= ${DIG[rows[0].r]})` : ''}.`, `Read the remainders bottom → top${base === 16 ? ', and remember 10–15 are written A–F' : ''}.`],
        steps: [
          S(`Write the remainders in the order you computed them${base === 16 ? ' (as hex digits)' : ''}.`, revDigits, N.divTable(n, base), 'exact', { noEarly: revDigits === ans }),
          S('Read them bottom → top. What is the answer?', ans, `Answer: <b>${ans}${sub(base)}</b>. Check: ${N.expansion(ans, base).html}`),
        ],
        traps: revDigits !== ans ? [{ value: revDigits, vtype: 'exact', msg: 'Your digits are in reverse order — the first remainder is the least-significant digit.' }] : [],
        finalCheck: `Check by expanding your answer back: Σ digit × ${base}^position should give ${n}.`,
      };
    });
  }
  decToBase('dec2hex', 16, 'Decimal → hexadecimal', 200, 4095);
  decToBase('dec2oct', 8, 'Decimal → octal', 70, 999);

  function baseToBin(id, base, label) {
    const k = base === 16 ? 4 : 3;
    def(id, 'm1', label, ({ v = base === 16 ? N.toBase(rint(0x100, 0xfff), 16) : N.toBase(rint(64, 511), 8) }) => {
      v = v.toUpperCase();
      const groups = v.split('').map((c) => N.bits(N.digitVal(c), k));
      const ans = groups.join('').replace(/^0+(?=.)/, '');
      return {
        prompt: `Convert <b>${v}${sub(base)}</b> to binary.`,
        format: 'Binary digits (leading zeros optional)',
        answer: { type: 'num', base: 2, value: ans },
        hints: [`Each ${base === 16 ? 'hex' : 'octal'} digit maps to exactly ${k} bits.`, `Convert digit by digit: ${v[0]} = ${groups[0]}.`, 'Keep the leading zeros inside each group — only the zeros at the very start of the whole number may be dropped.'],
        steps: [
          ...v.split('').map((c, i) => S(`Digit ${c} as ${k} bits?`, groups[i], `${c} → ${mono(groups[i])}`, 'exact')),
          S('Join all the groups. What is the binary number?', ans, `${groups.join(' | ')} → <b>${ans}${sub(2)}</b>`),
        ],
        traps: [{ value: v.split('').map((c) => N.toBase(N.digitVal(c), 2)).join(''), vtype: 'exact', msg: `Each digit must become exactly ${k} bits — you dropped zeros inside a group.` }],
        finalCheck: `Count: your answer should have about ${k * v.length} bits (minus leading zeros only).`,
      };
    });
  }
  baseToBin('hex2bin', 16, 'Hexadecimal → binary');
  baseToBin('oct2bin', 8, 'Octal → binary');

  function binToBase(id, base, label) {
    const k = base === 16 ? 4 : 3;
    def(id, 'm1', label, ({ bits = '1' + N.bits(rint(0, 2 ** rint(8, 11) - 1), rint(8, 11)) }) => {
      const g = N.groupBits(bits, k);
      const wrongPad = (bits + '0'.repeat((k - (bits.length % k)) % k)).match(new RegExp(`.{${k}}`, 'g')).map((x) => parseInt(x, 2).toString(base).toUpperCase()).join('');
      return {
        prompt: `Convert <b>${bits}${sub(2)}</b> to ${base === 16 ? 'hexadecimal' : 'octal'}.`,
        format: base === 16 ? 'Hex digits, e.g. B7A' : 'Octal digits, e.g. 755',
        answer: { type: 'num', base, value: g.digits },
        hints: [`Split the bits into groups of ${k}, starting from the RIGHT.`, `If the leftmost group is short, pad it with zeros on the LEFT: ${g.gi.join(' ')}.`, `Convert each group to one digit (${base === 16 ? '1010=A … 1111=F' : '000=0 … 111=7'}).`],
        steps: [
          S(`Pad on the left and write the ${k}-bit groups.`, g.gi.join(' '), `Groups: ${mono(g.gi.join(' | '))}`, 'exact'),
          ...g.gi.map((grp, i) => S(`Group ${grp} → digit?`, g.digits[i], `${mono(grp)} = ${g.digits[i]}`, 'exact')),
          S('Combine the digits. What is the answer?', g.digits, `Answer: <b>${g.digits}${sub(base)}</b>`),
        ],
        traps: wrongPad !== g.digits ? [{ value: wrongPad, msg: 'You grouped from the LEFT. Always group from the right (the binary point), padding the leftmost group.' }] : [],
        finalCheck: 'Check the leftmost group — it is the one that needed padding.',
      };
    });
  }
  binToBase('bin2hex', 16, 'Binary → hexadecimal');
  binToBase('bin2oct', 8, 'Binary → octal');

  def('frac2bin', 'm1', 'Decimal fraction → binary', ({ x = rint(2, 40) + rint(1, 15) / 16 }) => {
    const ip = Math.floor(x), fp = x - ip;
    const ib = N.toBase(ip, 2), fb = N.fracToBase(fp, 2, 10);
    const ans = ib + '.' + fb;
    return {
      prompt: `Convert <b>${x}${sub(10)}</b> to binary.`,
      format: 'Binary with a point, e.g. 1010.101',
      answer: { type: 'num', base: 2, value: ans },
      hints: ['Convert the integer part and the fractional part separately.', `Fraction ${+fp.toFixed(6)}: multiply by 2 repeatedly; the integer part (0 or 1) of each result is the next bit.`, 'Read fraction bits top → bottom (the first one goes right after the point) — opposite of the integer part!'],
      steps: [
        S(`Integer part ${ip} in binary?`, ib, N.divTable(ip, 2)),
        S(`Fraction part ${+fp.toFixed(6)} in binary (just the bits after the point)?`, fb, N.fracTable(fp, 2), 'exact'),
        S('Combine them. Full answer?', ans, `${ib} . ${fb} → <b>${ans}${sub(2)}</b>`),
      ],
      traps: [{ value: ib + '.' + N.reverse(fb), vtype: 'exact', msg: 'Fraction bits are read TOP → bottom (first multiplication gives the first bit after the point).' }],
      finalCheck: 'Check the fraction: each bit after the point is worth 1/2, 1/4, 1/8 … — do they add up to ' + +fp.toFixed(6) + '?',
    };
  });

  def('binadd', 'm1', 'Binary addition', ({ a = rint(20, 160), b = rint(20, 95) }) => {
    const w = 8;
    const A = N.bits(a, w), Bb = N.bits(b, w);
    const r = N.addWork(a, b, w);
    const sum = N.toBase(a + b, 2);
    return {
      prompt: `Add in binary: <span class="mono">${A} + ${Bb}</span>`,
      format: 'Binary result, e.g. 10101000',
      answer: { type: 'num', base: 2, value: sum },
      hints: ['Work right to left, one column at a time: 0+0=0, 0+1=1, 1+1=10 (write 0, carry 1), 1+1+1=11 (write 1, carry 1).', 'Write each carry above the next column to the left so you do not forget it.', `Sanity check in decimal: ${a} + ${b} = ${a + b}.`],
      steps: [
        S('Carry INTO each column, written left → right for the 8 columns (rightmost column gets 0).', r.carries, N.columnHTML([{ label: 'carry', bits: r.carries, cls: 'muted' }, { label: '', bits: A }, { label: '+', bits: Bb }, { label: '=', bits: r.sum, cls: 'rule' }]), 'exact'),
        S('Write the sum (include a final carry-out if there is one).', sum, `Sum = <b>${sum}${sub(2)}</b>${r.carryOut ? ' (the carry out of the leftmost column becomes the 9th bit)' : ''}. Check: ${a} + ${b} = ${a + b} ✔`),
      ],
      traps: r.carryOut ? [{ value: r.sum, msg: 'You dropped the final carry. In plain (unsigned) addition the carry out of the last column is part of the answer.' }] : [{ value: N.bits(a ^ b, w), msg: 'You wrote 1+1 = 0 but forgot to carry the 1 into the next column.' }],
      finalCheck: 'Re-add the leftmost column with its carry — that is where most slips happen.',
    };
  });

  def('binsub', 'm1', 'Binary subtraction', ({ a = rint(120, 250), b = rint(20, 110) }) => {
    if (b > a) [a, b] = [b, a];
    const w = 8;
    const A = N.bits(a, w), Bb = N.bits(b, w);
    const r = N.subWork(a, b, w);
    const ans = N.toBase(a - b, 2);
    return {
      prompt: `Subtract in binary: <span class="mono">${A} − ${Bb}</span>`,
      format: 'Binary result',
      answer: { type: 'num', base: 2, value: ans },
      hints: ['Right to left: 1−0=1, 1−1=0, 0−0=0, and 0−1 needs a BORROW: it becomes 10−1 = 1 and the next column loses 1.', 'Write each borrow above the column that pays it so you subtract it there.', `Check in decimal: ${a} − ${b} = ${a - b}.`],
      steps: [
        S('Borrow INTO each column, left → right for 8 columns (rightmost gets 0).', r.borrows, N.columnHTML([{ label: 'borrow', bits: r.borrows, cls: 'muted' }, { label: '', bits: A }, { label: '−', bits: Bb }, { label: '=', bits: r.diff, cls: 'rule' }]), 'exact'),
        S('Write the difference.', ans, `Difference = <b>${ans}${sub(2)}</b> = ${a - b}${sub(10)} ✔`),
      ],
      traps: [{ value: N.bits(a ^ b, w), msg: 'You treated 0 − 1 as 1 without borrowing from the next column.' }],
      finalCheck: 'Check the columns where you borrowed: did the next column really lose 1?',
    };
  });

  /* ================= Module 2: signed numbers ================= */
  def('dec2twos', 'm2', 'Decimal → 8-bit two’s complement', ({ n = -rint(1, 128), w = 8 }) => {
    const ans = N.twos(n, w);
    if (n >= 0) {
      return {
        prompt: `Write <b>${n}</b> as a ${w}-bit two’s complement number.`, format: `${w} bits`,
        answer: { type: 'bits', value: ans, width: w },
        hints: ['Positive numbers look exactly like unsigned binary.', 'Convert to binary and pad with zeros.', `You need exactly ${w} bits.`],
        steps: [S(`${n} in ${w}-bit binary?`, ans, `Positive → plain binary: <b>${ans}</b>`, 'exact')], traps: [], finalCheck: 'Pad to the full width.',
      };
    }
    const mag = N.bits(-n, w), inv = N.invert(mag);
    return {
      prompt: `Write <b>${n}</b> as a ${w}-bit two’s complement number.`,
      format: `Exactly ${w} bits, e.g. 11010011`,
      answer: { type: 'bits', value: ans, width: w },
      hints: [`Start with the positive value ${-n} in ${w}-bit binary.`, 'Invert every bit (that gives the 1’s complement).', 'Now ADD 1 — do not stop after inverting!'],
      steps: [
        S(`Write |${n}| = ${-n} in ${w}-bit binary.`, mag, `${-n} = ${mono(mag)}`, 'exact'),
        S('Invert every bit.', inv, `invert → ${mono(inv)}`, 'exact'),
        S('Add 1. What is the two’s complement?', ans, `${mono(inv)} + 1 = <b class="mono">${ans}</b>. Check: −128·${ans[0]} + ${parseInt(ans.slice(1), 2)} = ${n} ✔`, 'exact'),
      ],
      traps: [{ value: N.signMag(n, w), vtype: 'exact', msg: 'That is SIGN-MAGNITUDE (you only set the sign bit). Two’s complement = invert all bits, then add 1.' }],
      finalCheck: 'Last step check: after inverting, did you add 1 and propagate the carry correctly?',
    };
  });

  def('twos2dec', 'm2', '8-bit two’s complement → decimal', ({ bits = '1' + N.bits(rint(0, 127), 7) }) => {
    const v = N.fromTwos(bits);
    if (v >= 0) {
      return {
        prompt: `The 8-bit two’s complement number <b class="mono">${bits}</b> represents which decimal value?`, format: 'Decimal, e.g. -45',
        answer: { type: 'num', base: 10, value: String(v) },
        hints: ['Look at the MSB first.', 'MSB 0 → the number is positive.', 'Just convert it like unsigned binary.'],
        steps: [S('Is it negative? (yes/no)', 'no', 'MSB = 0 → positive', 'word'), S('Decimal value?', v, `= <b>${v}</b>`)], traps: [], finalCheck: 'Positive numbers need no inversion.',
      };
    }
    const inv = N.invert(bits);
    const mag = N.bits(-v, 8);
    return {
      prompt: `The 8-bit two’s complement number <b class="mono">${bits}</b> represents which decimal value?`,
      format: 'Decimal, e.g. -45',
      answer: { type: 'num', base: 10, value: String(v) },
      hints: ['The MSB is 1, so the number is negative.', 'To find its magnitude: invert all bits, then add 1.', 'Shortcut check: the MSB is worth −128; add the other place values to it.'],
      steps: [
        S('Is it negative? (yes/no)', 'yes', 'MSB = 1 → negative', 'word'),
        S('Invert every bit.', inv, mono(inv), 'exact'),
        S('Add 1 (this is the magnitude in binary).', mag, `${mono(inv)} + 1 = ${mono(mag)}`, 'exact'),
        S('Magnitude in decimal?', -v, `${mono(mag)} = ${-v}`),
        S('Final answer (with sign)?', v, `<b>${v}</b>. Check: −128 + ${parseInt(bits.slice(1), 2)} = ${v} ✔`),
      ],
      traps: [{ value: String(parseInt(bits, 2)), msg: `${parseInt(bits, 2)} is the UNSIGNED value. In two’s complement the MSB is worth −128.` }, { value: String(-v), msg: 'You found the magnitude correctly, but forgot the minus sign (final step!).' }],
      finalCheck: 'Final step: the MSB was 1, so the answer must be negative.',
    };
  });

  def('signmag', 'm2', 'Decimal → 8-bit sign-magnitude', ({ n = -rint(1, 127) }) => {
    const ans = N.signMag(n, 8), mag = N.bits(Math.abs(n), 7);
    return {
      prompt: `Write <b>${n}</b> in 8-bit <b>sign-magnitude</b> form.`, format: '8 bits',
      answer: { type: 'bits', value: ans, width: 8 },
      hints: ['Sign-magnitude = 1 sign bit + 7 magnitude bits.', `Write ${Math.abs(n)} in 7 bits.`, 'Put the sign bit (1 = negative) in front. No inverting!'],
      steps: [S(`${Math.abs(n)} in 7 bits?`, mag, mono(mag), 'exact'), S('Sign bit?', n < 0 ? 1 : 0, n < 0 ? 'negative → 1' : 'positive → 0', 'exact'), S('Full 8-bit pattern?', ans, `<b class="mono">${ans}</b>`, 'exact')],
      traps: [{ value: N.twos(n, 8), vtype: 'exact', msg: 'That is two’s complement. Sign-magnitude only sets the sign bit; the magnitude stays unchanged.' }, { value: N.ones(n, 8), vtype: 'exact', msg: 'That is one’s complement. In sign-magnitude, do not invert the magnitude.' }],
      finalCheck: 'Check you have exactly 8 bits: 1 sign + 7 magnitude.',
    };
  });

  def('onescomp', 'm2', 'Decimal → 8-bit one’s complement', ({ n = -rint(1, 127) }) => {
    const mag = N.bits(Math.abs(n), 8), ans = N.ones(n, 8);
    return {
      prompt: `Write <b>${n}</b> in 8-bit <b>one’s complement</b> form.`, format: '8 bits',
      answer: { type: 'bits', value: ans, width: 8 },
      hints: [`Write ${Math.abs(n)} in 8-bit binary.`, 'For a negative number, invert every bit.', 'Do NOT add 1 — that would be two’s complement.'],
      steps: [S(`${Math.abs(n)} in 8 bits?`, mag, mono(mag), 'exact'), S('Invert every bit.', ans, `<b class="mono">${ans}</b>`, 'exact')],
      traps: [{ value: N.twos(n, 8), vtype: 'exact', msg: 'You added 1 — that gives two’s complement. One’s complement is just the inversion.' }],
      finalCheck: 'Compare bit by bit with the positive version: every bit must be flipped.',
    };
  });

  def('twosAdd', 'm2', 'Two’s complement addition', ({ a = rint(-100, 100), b = rint(-100, 100) }) => {
    const A = N.twos(a, 8), Bb = N.twos(b, 8);
    const raw = (parseInt(A, 2) + parseInt(Bb, 2)).toString(2);
    const ans = N.twos(a + b, 8);
    const ovf = a + b > 127 || a + b < -128;
    return {
      prompt: `Using 8-bit two’s complement, compute <b>${a} + (${b})</b>. Give the 8-bit result.`,
      format: '8 bits',
      answer: { type: 'bits', value: ans, width: 8 },
      hints: ['Convert both numbers to 8-bit two’s complement first.', 'Add them as ordinary binary numbers.', 'Discard any carry out of bit 7 — keep exactly 8 bits.'],
      steps: [
        S(`${a} in 8-bit two’s complement?`, A, mono(A), 'exact'),
        S(`${b} in 8-bit two’s complement?`, Bb, mono(Bb), 'exact'),
        S('Add them (write all bits, including any 9th carry bit).', raw, N.columnHTML([{ label: '', bits: raw.length > 8 ? ' ' + A : A }, { label: '+', bits: raw.length > 8 ? ' ' + Bb : Bb }, { label: '=', bits: raw.padStart(8, '0'), cls: 'rule' }]), 'exact', { noEarly: raw === ans }),
        S('Keep 8 bits. Result?', ans, `Result <b class="mono">${ans}</b> = ${N.fromTwos(ans)}${ovf ? ` — ⚠ overflow! The true answer ${a + b} does not fit in 8 bits.` : ' ✔'}`, 'exact'),
      ],
      traps: [],
      finalCheck: 'Last step: drop the carry out of bit 7 and keep exactly 8 bits.',
    };
  });

  def('overflow', 'm2', 'Overflow detection', ({ a = rint(-128, 127), b = rint(-128, 127) }) => {
    const A = N.twos(a, 8), Bb = N.twos(b, 8), R = N.twos(a + b, 8);
    const ovf = a + b > 127 || a + b < -128;
    return {
      prompt: `In 8-bit two’s complement, ${mono(A)} + ${mono(Bb)} = ${mono(R)} (carry discarded). Did <b>overflow</b> occur?`,
      choices: ['Yes, overflow', 'No overflow'],
      answer: { type: 'choice', value: ovf ? 0 : 1 },
      explain: `Signs of the operands: ${A[0]} and ${Bb[0]}; sign of the result: ${R[0]}. Overflow happens only when both operands have the SAME sign and the result has a DIFFERENT sign. (${a} + ${b} = ${a + b}, ${ovf ? 'outside' : 'inside'} −128…127.)`,
      hints: ['Ignore the carry out of bit 7 — that is not the overflow test.', 'Look at the sign bits (MSBs) of the two operands.', 'Overflow ⇔ same-sign operands produce a result with the opposite sign.'],
      steps: [], traps: [],
    };
  });

  /* ================= Module 3: binary codes ================= */
  def('dec2bcd', 'm3', 'Decimal → BCD', ({ n = rint(10, 999) }) => {
    const digits = String(n).split('');
    const ans = N.bcd(n);
    return {
      prompt: `Encode <b>${n}</b> in BCD (8421 code).`, format: `${digits.length * 4} bits (spaces allowed)`,
      answer: { type: 'bits', value: ans.replace(/ /g, ''), width: digits.length * 4 },
      hints: ['BCD encodes EACH decimal digit separately.', 'Every digit becomes exactly 4 bits (0 = 0000 … 9 = 1001).', 'Do not convert the whole number to binary!'],
      steps: [...digits.map((d) => S(`Digit ${d} as 4 bits?`, N.bits(+d, 4), mono(N.bits(+d, 4)), 'exact')), S('Join the groups.', ans, `<b class="mono">${ans}</b>`, 'exact')],
      traps: [{ value: N.toBase(n, 2), msg: 'That is the plain binary value of the whole number. BCD codes each digit separately in 4 bits.' }],
      finalCheck: 'Check the last group: is it the 4-bit code of the last digit?',
    };
  });

  def('bin2gray', 'm3', 'Binary → Gray code', ({ bits = '1' + N.bits(rint(0, 31), rint(4, 5)) }) => {
    const g = N.gray(bits);
    return {
      prompt: `Convert the binary number <b class="mono">${bits}</b> to Gray code.`, format: `${bits.length} bits`,
      answer: { type: 'bits', value: g, width: bits.length },
      hints: ['The first (leftmost) Gray bit equals the first binary bit.', 'Each next Gray bit = XOR of two NEIGHBOURING binary bits (bᵢ ⊕ bᵢ₊₁).', 'XOR gives 1 when the two bits differ, 0 when they are the same.'],
      steps: [
        S('First Gray bit?', g[0], `copy MSB → ${g[0]}`, 'exact'),
        S('XOR each neighbouring pair of binary bits (left to right) — write those bits.', g.slice(1), bits.split('').slice(1).map((c, i) => `${bits[i]}⊕${c}=${g[i + 1]}`).join(', '), 'exact'),
        S('Full Gray code?', g, `<b class="mono">${g}</b>`, 'exact'),
      ],
      traps: [{ value: N.grayToBin(bits), vtype: 'exact', msg: 'You used the Gray → binary rule (XOR with the previous RESULT). For binary → Gray, XOR neighbouring BINARY bits.' }],
      finalCheck: 'Last bit: XOR of the last two binary bits.',
    };
  });

  def('gray2bin', 'm3', 'Gray code → binary', ({ g = '1' + N.bits(rint(0, 31), rint(4, 5)) }) => {
    const b = N.grayToBin(g);
    return {
      prompt: `Convert the Gray code <b class="mono">${g}</b> to binary.`, format: `${g.length} bits`,
      answer: { type: 'bits', value: b, width: g.length },
      hints: ['The first binary bit equals the first Gray bit.', 'Each next binary bit = (previous BINARY bit) ⊕ (current Gray bit).', 'Work strictly left to right, using the binary bit you just wrote.'],
      steps: g.split('').map((c, i) => i === 0 ? S('Binary bit 1?', b[0], `b1 = g1 = ${b[0]}`, 'exact', { noEarly: true }) : S(`Binary bit ${i + 1} = b${i} ⊕ g${i + 1}?`, b[i], `${b[i - 1]} ⊕ ${c} = ${b[i]}`, 'exact', { noEarly: true })).concat([S('Full binary number?', b, `<b class="mono">${b}</b>`, 'exact')]),
      traps: [{ value: N.gray(g), vtype: 'exact', msg: 'You XORed neighbouring Gray bits (that is the binary → Gray rule). For Gray → binary, XOR with the previous BINARY result.' }],
      finalCheck: 'Last bit: previous binary bit ⊕ last Gray bit.',
    };
  });

  def('parity', 'm3', 'Parity bit', ({ bits = N.bits(rint(1, 127), 7), even = Math.random() < 0.5 }) => {
    const ones = bits.split('').filter((c) => c === '1').length;
    const p = even ? ones % 2 : 1 - (ones % 2);
    return {
      prompt: `What ${even ? '<b>even</b>' : '<b>odd</b>'} parity bit should be added to <span class="mono">${bits}</span>?`, format: '0 or 1',
      answer: { type: 'bits', value: String(p), width: 1 },
      hints: ['Count the 1s in the data.', `${even ? 'Even' : 'Odd'} parity means the TOTAL number of 1s (data + parity bit) must be ${even ? 'even' : 'odd'}.`, 'Choose the parity bit that makes the total right.'],
      steps: [S('How many 1s are in the data?', ones, `${ones} ones`), S('Parity bit?', p, `${ones} + ${p} = ${ones + p} → ${even ? 'even' : 'odd'} ✔`, 'exact')],
      traps: [{ value: String(1 - p), msg: `With that bit the total would be ${ones + 1 - p} — ${even ? 'odd' : 'even'}. Recheck which parity is required.` }],
      finalCheck: 'Add your bit to the count and confirm the total is ' + (even ? 'even' : 'odd') + '.',
    };
  });

  def('hammingEnc', 'm3', 'Hamming (7,4) encode', ({ data = N.bits(rint(1, 15), 4) }) => {
    const h = N.hammingEncode(data);
    const [d1, d2, d3, d4] = data.split('');
    return {
      prompt: `Encode the data bits <b class="mono">${data}</b> (d1 d2 d3 d4) with Hamming(7,4), even parity. Bit order: <span class="mono">p1 p2 d1 p4 d2 d3 d4</span>.`, format: '7 bits',
      answer: { type: 'bits', value: h.code, width: 7 },
      hints: ['Parity bits sit at positions 1, 2, 4 (powers of two); data at 3, 5, 6, 7.', 'p1 checks positions 1,3,5,7 → p1 = d1⊕d2⊕d4. p2 checks 2,3,6,7 → p2 = d1⊕d3⊕d4. p4 checks 4,5,6,7 → p4 = d2⊕d3⊕d4.', 'Assemble in the order p1 p2 d1 p4 d2 d3 d4.'],
      steps: [
        S('p1 = d1⊕d2⊕d4 ?', h.p1, `${d1}⊕${d2}⊕${d4} = ${h.p1}`, 'exact', { noEarly: true }),
        S('p2 = d1⊕d3⊕d4 ?', h.p2, `${d1}⊕${d3}⊕${d4} = ${h.p2}`, 'exact', { noEarly: true }),
        S('p4 = d2⊕d3⊕d4 ?', h.p4, `${d2}⊕${d3}⊕${d4} = ${h.p4}`, 'exact', { noEarly: true }),
        S('Codeword (p1 p2 d1 p4 d2 d3 d4)?', h.code, `<b class="mono">${h.p1} ${h.p2} ${d1} ${h.p4} ${d2} ${d3} ${d4}</b>`, 'exact'),
      ],
      traps: [{ value: `${h.p1}${h.p2}${h.p4}${data}`, vtype: 'exact', msg: 'You put the parity bits first and the data after. They are interleaved: p1 p2 d1 p4 d2 d3 d4.' }],
      finalCheck: 'Final step: put the bits in the order p1 p2 d1 p4 d2 d3 d4 — double-check positions 3 and 4.',
    };
  });

  def('hammingDec', 'm3', 'Hamming (7,4) correct an error', ({ data = N.bits(rint(1, 15), 4), err = rint(1, 7) }) => {
    const code = N.hammingEncode(data).code;
    const recv = N.flipBit(code, err);
    const s = N.hammingSyndrome(recv);
    const b = (i) => recv[i - 1];
    return {
      prompt: `A Hamming(7,4) codeword (even parity, order <span class="mono">p1 p2 d1 p4 d2 d3 d4</span>) was received as <b class="mono">${recv}</b>. One bit may be wrong. Give the <b>corrected 7-bit codeword</b>.`, format: '7 bits',
      answer: { type: 'bits', value: code, width: 7 },
      hints: ['Recompute three checks: c1 over positions 1,3,5,7; c2 over 2,3,6,7; c4 over 4,5,6,7 (XOR of the received bits).', 'The syndrome c4 c2 c1, read as a binary number, is the position of the wrong bit (0 = no error).', 'Flip exactly that one bit.'],
      steps: [
        S('c1 = b1⊕b3⊕b5⊕b7 ?', s.c1, `${b(1)}⊕${b(3)}⊕${b(5)}⊕${b(7)} = ${s.c1}`, 'exact', { noEarly: true }),
        S('c2 = b2⊕b3⊕b6⊕b7 ?', s.c2, `${b(2)}⊕${b(3)}⊕${b(6)}⊕${b(7)} = ${s.c2}`, 'exact', { noEarly: true }),
        S('c4 = b4⊕b5⊕b6⊕b7 ?', s.c4, `${b(4)}⊕${b(5)}⊕${b(6)}⊕${b(7)} = ${s.c4}`, 'exact', { noEarly: true }),
        S('Error position (decimal value of c4c2c1)?', s.pos, `${s.c4}${s.c2}${s.c1}${sub(2)} = ${s.pos}`, null, { noEarly: true }),
        S('Corrected codeword?', code, `Flip bit ${s.pos}: ${mono(recv)} → <b class="mono">${code}</b>`, 'exact'),
      ],
      traps: [{ value: recv, vtype: 'exact', msg: 'That is the received word unchanged — you still need to flip the bit at the syndrome position.' }, { value: N.flipBit(recv, 8 - s.pos), vtype: 'exact', msg: 'You flipped the wrong bit — positions are counted from the LEFT, starting at 1. Read the syndrome as c4 c2 c1.' }],
      finalCheck: 'Final step: count positions from the left starting at 1, and flip only that bit.',
    };
  });

  def('crc', 'm3', 'CRC remainder', ({ data = '1' + N.bits(rint(0, 127), rint(5, 7)), gen = pick(['1011', '1101', '1001', '10011']) }) => {
    const c = N.crc(data, gen);
    const r = gen.length - 1;
    const noPad = N.crc(data.slice(0, -r) || data, gen);
    return {
      prompt: `Data <b class="mono">${data}</b>, generator <b class="mono">${gen}</b>. Compute the <b>CRC</b> (the ${r}-bit remainder) to append.`, format: `${r} bits`,
      answer: { type: 'bits', value: c.rem, width: r },
      hints: [`The generator has ${gen.length} bits, so append ${r} zeros to the data first.`, 'Divide using XOR (modulo-2): whenever the leading bit is 1, XOR the generator under it; if it is 0, just shift.', `The remainder is the last ${r} bits once the generator can no longer fit.`],
      steps: [
        S(`Data with ${r} zeros appended?`, c.padded, mono(c.padded), 'exact'),
        S('Remainder (CRC)?', c.rem, N.crcHTML(data, gen), 'exact'),
      ],
      traps: data.length > r ? [{ value: noPad.rem, vtype: 'exact', msg: `Remember to append ${r} zeros before dividing.` }] : [],
      finalCheck: `Your remainder must have exactly ${r} bits. The transmitted frame would be ${data} followed by it.`,
    };
  });

  /* ================= Module 4: data coding ================= */
  def('huffman', 'm4', 'Huffman: total encoded bits', ({ freqs }) => {
    if (!freqs) {
      const syms = 'ABCDEF'.slice(0, rint(4, 6)).split('');
      freqs = {}; syms.forEach((s) => (freqs[s] = rint(1, 20)));
    }
    const h = N.huffman(freqs);
    const n = Object.keys(freqs).length;
    const count = Object.values(freqs).reduce((a, b) => a + b, 0);
    const fixed = Math.ceil(Math.log2(n)) * count;
    return {
      prompt: `A message uses symbols with frequencies ${Object.entries(freqs).map(([k, v]) => `<b>${k}</b>:${v}`).join(', ')}. Using Huffman coding, how many bits does the whole encoded message need?`,
      format: 'A whole number of bits',
      answer: { type: 'num', base: 10, value: String(h.total) },
      hints: ['Repeatedly take the two SMALLEST weights and merge them into one node whose weight is their sum.', 'Each symbol’s code length = the number of merges above it (its depth in the tree).', 'Total bits = Σ frequency × code length.'],
      steps: [
        S('List the new (merged) weights in the order you create them.', h.merges.map((m) => m.sum).join(', '), h.merges.map((m, i) => `${i + 1}. ${m.a} + ${m.b} = <b>${m.sum}</b>`).join('<br>'), 'list', { ordered: false }),
        S('Code lengths, e.g. for each symbol (just give the total bits on the next step).', null, Object.entries(h.codes).map(([k, c]) => `${k}: ${mono(c)} (${c.length} bits)`).join('<br>')),
        S('Total bits = Σ freq × length?', h.total, Object.entries(freqs).map(([k, v]) => `${v}×${h.codes[k].length}`).join(' + ') + ` = <b>${h.total}</b>`),
      ],
      traps: [{ value: String(fixed), msg: `${fixed} bits is what a FIXED-length code (${Math.ceil(Math.log2(n))} bits/symbol) would need. Huffman gives frequent symbols shorter codes.` }, { value: String(count), msg: 'That is just the number of symbols. Multiply each frequency by its code length.' }],
      finalCheck: 'Final step: multiply each frequency by its code length and add — recheck that sum.',
    };
  });

  def('lz78', 'm4', 'LZ78 encoding', ({ s }) => {
    if (!s) { let r; do { s = U.range(rint(9, 13)).map(() => pick(['A', 'B'])).join(''); r = N.lz78(s); } while (!r.clean || r.tokens.length < 5); }
    const r = N.lz78(s);
    return {
      prompt: `Encode <b class="mono">${s}</b> with LZ78. Give the output as (index,char) pairs, e.g. <span class="mono">(0,A)(0,B)(1,B)</span>. Index 0 means “empty phrase”; dictionary entries are numbered from 1.`,
      format: '(index,char) pairs',
      answer: { type: 'text', value: r.str },
      hints: ['Read the longest prefix that is ALREADY in the dictionary, then one more character.', 'Output (dictionary index of that prefix, the new character) and add prefix+char as the next dictionary entry.', 'A brand-new single character is output as (0,char).'],
      steps: [
        S('List the dictionary phrases in order (comma separated).', r.phrases.join(','), `<table class="work mono"><tr><th>#</th><th>Phrase</th><th>Output</th></tr>${r.phrases.map((p, i) => `<tr><td>${i + 1}</td><td>${p}</td><td>(${r.tokens[i][0]},${r.tokens[i][1]})</td></tr>`).join('')}</table>`, 'exact'),
        S('Output tokens?', r.str, `<b class="mono">${r.str}</b>`, 'exact'),
      ],
      traps: [],
      finalCheck: 'Check: concatenating the phrases must give back the original string exactly.',
    };
  });

  def('fixedLen', 'm4', 'Fixed-length code size', ({ k = rint(5, 40), len = rint(20, 200) }) => {
    const b = Math.ceil(Math.log2(k));
    return {
      prompt: `An alphabet has <b>${k}</b> different symbols. With a fixed-length binary code, how many bits are needed to store a message of <b>${len}</b> symbols?`, format: 'A whole number',
      answer: { type: 'num', base: 10, value: String(b * len) },
      hints: ['First find the bits per symbol: the smallest b with 2^b ≥ number of symbols.', `2^${b - 1} = ${2 ** (b - 1)} < ${k} ≤ 2^${b} = ${2 ** b}.`, 'Multiply bits per symbol by the message length.'],
      steps: [S('Bits per symbol?', b, `2<sup>${b}</sup> = ${2 ** b} ≥ ${k} → ${b} bits`), S('Total bits?', b * len, `${b} × ${len} = <b>${b * len}</b>`)],
      traps: [{ value: String(Math.floor(Math.log2(k)) * len), msg: 'Round the bits per symbol UP: you need 2^b ≥ number of symbols.' }],
      finalCheck: 'Last step: multiply by the message length.',
    };
  });

  /* ================= Module 5: IEEE 754 ================= */
  def('ieeeEnc', 'm5', 'Decimal → IEEE 754 single', ({ x }) => {
    if (x == null) { do { x = (Math.random() < 0.5 ? -1 : 1) * rint(1, 255) / 2 ** rint(0, 4); } while (x === 0); }
    const r = N.ieeeEncode(x);
    const wrongBias = `${r.s}${N.bits(r.e & 255, 8)}${r.f23}`;
    const withHidden = `${r.s}${r.Ebits}${('1' + r.frac + '0'.repeat(23)).slice(0, 23)}`;
    return {
      prompt: `Write <b>${x}</b> in IEEE 754 single precision. Give the 32 bits or 8 hex digits (e.g. <span class="mono">0xC1540000</span>).`,
      format: '32 bits or 8 hex digits',
      answer: { type: 'bits', value: r.bits, width: 32, display: `0x${r.hex} = ${r.bits[0]} ${r.Ebits} ${r.f23}` },
      hints: ['Write |x| in binary (integer part and fraction part separately).', 'Normalise to 1.xxxx × 2^e, then the stored exponent is E = e + 127 (8 bits).', 'Fraction = the bits AFTER the leading 1 (the 1 is hidden), padded with zeros to 23 bits. Layout: sign | exponent | fraction.'],
      steps: [
        S('Sign bit?', r.s, x < 0 ? 'negative → 1' : 'positive → 0', 'exact', { noEarly: true }),
        S(`|x| = ${Math.abs(x)} in binary?`, r.bin, `${Math.abs(x)} = ${mono(r.bin)}${sub(2)}`, null, { noEarly: true }),
        S('Exponent e in 1.f × 2^e (decimal)?', r.e, `${mono(r.bin)} = ${r.norm}`, null, { noEarly: true }),
        S('Biased exponent E = e + 127, as 8 bits?', r.Ebits, `${r.e} + 127 = ${r.E} = ${mono(r.Ebits)}`, 'exact', { noEarly: true }),
        S('Fraction bits (after the hidden 1, before padding)?', r.frac, `fraction = ${mono(r.frac)} → padded to 23 bits: ${mono(r.f23)}`, 'exact', { noEarly: true }),
        S('Final 32-bit pattern (or hex)?', r.bits, `<span class="mono">${r.s} | ${r.Ebits} | ${r.f23}</span> = <b class="mono">0x${r.hex}</b>`),
      ],
      traps: [
        { value: wrongBias, vtype: 'exact', msg: 'Your exponent field is not biased. Store E = e + 127.' },
        { value: '0x' + N.bitsToHex(wrongBias), msg: 'Your exponent field is not biased. Store E = e + 127.' },
        { value: withHidden, vtype: 'exact', msg: 'You stored the leading 1. In IEEE 754 the leading 1 is hidden — the fraction starts AFTER it.' },
        { value: '0x' + N.bitsToHex(withHidden), msg: 'You stored the leading 1. In IEEE 754 the leading 1 is hidden — the fraction starts AFTER it.' },
      ],
      finalCheck: 'Final step: group the 32 bits into fours from the LEFT for hex, and check the sign bit is first.',
    };
  });

  def('ieeeDec', 'm5', 'IEEE 754 single → decimal', ({ hex }) => {
    if (!hex) { let x; do { x = (Math.random() < 0.5 ? -1 : 1) * rint(1, 255) / 2 ** rint(0, 5); } while (!x); hex = N.ieeeEncode(x).hex; }
    const r = N.ieeeDecode(hex);
    return {
      prompt: `What decimal value does the IEEE 754 single-precision pattern <b class="mono">0x${hex}</b> represent?`, format: 'Decimal, e.g. -6.25',
      answer: { type: 'dec', value: r.value },
      hints: ['Expand the hex into 32 bits, then split: 1 sign | 8 exponent | 23 fraction.', 'Actual exponent e = E − 127.', 'Value = (−1)^sign × 1.fraction × 2^e. Shift the binary point e places.'],
      steps: [
        S('Sign bit?', r.s, `bits: ${mono(r.bits[0] + ' ' + r.Ebits + ' ' + r.f23)}`, 'exact', { noEarly: true }),
        S('Exponent field E (decimal)?', r.E, `${mono(r.Ebits)} = ${r.E}`, null, { noEarly: true }),
        S('Actual exponent e = E − 127?', r.e, `${r.E} − 127 = ${r.e}`, null, { noEarly: true }),
        S('Significand 1.f written in binary?', '1.' + r.frac, `1.${r.frac}`, null, { noEarly: true }),
        S('Value?', r.value, `1.${r.frac} × 2<sup>${r.e}</sup> = ${mono(N.binString(Math.abs(r.value)))} = ${Math.abs(r.value)} → <b>${r.value}</b>`),
      ],
      traps: [{ value: String(-r.value), msg: 'Wrong sign — the first bit is the sign bit (1 = negative).' }],
      finalCheck: 'Final step: apply the sign bit.',
    };
  });

  /* ================= Module 6: logic gates ================= */
  const GATE = {
    AND: (xs) => +xs.every(Boolean), OR: (xs) => +xs.some(Boolean), NAND: (xs) => 1 - xs.every(Boolean), NOR: (xs) => 1 - xs.some(Boolean),
    XOR: (xs) => xs.reduce((a, b) => a ^ b, 0), XNOR: (xs) => 1 - xs.reduce((a, b) => a ^ b, 0),
  };
  G.GATE = GATE;
  def('gateEval', 'm6', 'Gate output', ({ gate = pick(Object.keys(GATE)), ins }) => {
    ins = ins || U.range(rint(2, 3)).map(() => rint(0, 1));
    const out = GATE[gate](ins);
    const ones = ins.filter(Boolean).length;
    const why = { AND: 'AND is 1 only if ALL inputs are 1', OR: 'OR is 1 if ANY input is 1', NAND: 'NAND = NOT AND: 0 only when all inputs are 1', NOR: 'NOR = NOT OR: 1 only when all inputs are 0', XOR: 'XOR is 1 when an ODD number of inputs are 1', XNOR: 'XNOR is 1 when an EVEN number of inputs are 1' }[gate];
    return {
      prompt: `A ${ins.length}-input <b>${gate}</b> gate has inputs ${ins.map((v, i) => `${'ABC'[i]}=${v}`).join(', ')}. What is the output?`, format: '0 or 1',
      answer: { type: 'bits', value: String(out), width: 1 },
      hints: [why.split(':')[0] + '.', `Count the 1s: there ${ones === 1 ? 'is 1 one' : 'are ' + ones + ' ones'}.`, gate.startsWith('N') || gate === 'XNOR' ? 'This gate has a bubble — invert the basic gate’s result as the very last step.' : 'Apply the rule directly.'],
      steps: [S(`Output of the gate?`, out, why + ` → <b>${out}</b>`, 'exact')],
      traps: [{ value: String(1 - out), msg: gate.startsWith('N') || gate === 'XNOR' ? 'You forgot the inversion (the bubble) — last step!' : 'Recheck the gate rule.' }],
      finalCheck: 'If the gate has a bubble (NAND/NOR/XNOR), invert as the final step.',
    };
  });

  const EXPR3 = ["AB + C'", "A'C + B", "(A + B)C'", "A XOR B + C", "AB' + A'B", "(A + C')(B + C)", "A'B'C + AB", "(AB)' C", "A + B'C", "(A XOR C)B", "A'B + BC'", "(A + B + C)'", "AC + B'C'", "A NAND (B + C)", "(A NOR B) + C"];
  G.EXPR3 = EXPR3;
  def('ttColumn', 'm6', 'Truth table output column', ({ expr = pick(EXPR3) }) => {
    const ast = B.parse(expr); const vars = ['A', 'B', 'C'];
    const col = B.table(ast, vars).join('');
    const top = ast.t !== 'not' && ast.a && ast.b ? [ast.a, ast.b] : [];
    const tableHTML = `<table class="work mono tt"><tr><th>A</th><th>B</th><th>C</th>${top.map((n) => `<th>${B.toStr(n)}</th>`).join('')}<th>F</th></tr>${U.range(8).map((i) => { const env = B.envFor(i, vars); return `<tr><td>${env.A}</td><td>${env.B}</td><td>${env.C}</td>${top.map((n) => `<td>${B.evaluate(n, env)}</td>`).join('')}<td><b>${col[i]}</b></td></tr>`; }).join('')}</table>`;
    return {
      prompt: `Complete the truth table of <b class="mono">F = ${expr}</b>. Type the F column from row ABC = 000 down to 111 as 8 bits.`,
      format: '8 bits, top row first (e.g. 10101011)',
      answer: { type: 'bits', value: col, width: 8, rowVars: vars },
      hints: ['List the rows 000, 001, 010, … 111 (count in binary).', top.length ? `Make helper columns for ${top.map((n) => B.toStr(n)).join(' and ')}.` : 'Evaluate the inside first, then apply the outer NOT.', 'Combine the helper columns with the outer operator, one row at a time.'],
      steps: top.map((n) => S(`Helper column ${B.toStr(n)} (8 bits)?`, B.table(n, vars).join(''), '', 'exact', { noEarly: true })).concat([S('F column (8 bits)?', col, tableHTML, 'exact')]),
      traps: [{ value: N.reverse(col), vtype: 'exact', msg: 'Your column is upside down — the first bit is row 000, the last is row 111.' }],
      finalCheck: 'Double-check the last rows (110, 111) — careless slips cluster at the end.',
    };
  });

  def('gateIdentify', 'm6', 'Identify the gate from its truth table', ({ gate = pick(Object.keys(GATE)) }) => {
    const col = [[0, 0], [0, 1], [1, 0], [1, 1]].map((x) => GATE[gate](x));
    const choices = Object.keys(GATE);
    return {
      prompt: `A 2-input gate has this truth table. Which gate is it?<table class="work mono tt"><tr><th>A</th><th>B</th><th>Y</th></tr>${[[0, 0], [0, 1], [1, 0], [1, 1]].map((x, i) => `<tr><td>${x[0]}</td><td>${x[1]}</td><td><b>${col[i]}</b></td></tr>`).join('')}</table>`,
      choices, answer: { type: 'choice', value: choices.indexOf(gate) },
      explain: `Y = ${col.join(', ')} for AB = 00, 01, 10, 11 is the signature of ${gate}.`,
      hints: ['How many rows give 1?', 'One 1 → AND or NOR; three 1s → OR or NAND; two 1s → XOR or XNOR.', 'Check row 00 to tell the pair apart.'],
      steps: [], traps: [],
    };
  });

  /* ================= Module 7: Boolean algebra ================= */
  const DEM = [
    ["(AB')'", "A' + B", "A' + B"],
    ["(A + B'C)'", "A'(B'C)'", "A'(B + C')"],
    ["(A'B + C)'", "(A'B)'C'", "(A + B')C'"],
    ["(AB + C'D)'", "(AB)'(C'D)'", "(A' + B')(C + D')"],
    ["((A + B)C')'", "(A + B)' + C", "A'B' + C"],
    ["(A' + BC)'", "A(BC)'", "A(B' + C')"],
    ["((A' + B)(C + D'))'", "(A' + B)' + (C + D')'", "AB' + C'D"],
    ["(A + B + C')'", "A'B'C", "A'B'C"],
    ["(A'B'C)'", "A + B + C'", "A + B + C'"],
    ["(AB'C + D)'", "(AB'C)'D'", "(A' + B + C')D'"],
  ];
  def('deMorgan', 'm7', 'Apply DeMorgan’s theorems', ({ i = rint(0, DEM.length - 1) }) => {
    const [e, mid, fin] = DEM[i];
    return {
      prompt: `Use DeMorgan’s theorems to remove the outer complement: <b class="mono">F = ${e}</b>. In your answer, NOT (') may only appear on single variables.`,
      format: "Plain text, e.g. A'B + C or (A + B')C",
      answer: { type: 'bool', value: fin, noGroupNot: true, display: fin },
      hints: ['DeMorgan: (XY)\' = X\' + Y\' and (X + Y)\' = X\'Y\'. “Break the bar, change the sign.”', `Apply it to the OUTERMOST bar first: ${e} → ${mid}.`, 'If a group still has a bar over it, apply DeMorgan again, and remember (X\')\' = X.'],
      steps: [S('After applying DeMorgan to the outer bar once?', mid, mono(mid), 'bool', { noEarly: mid === fin }), S('Final answer with NOT only on single variables?', fin, `<b class="mono">${fin}</b>`, 'bool')],
      traps: [],
      finalCheck: 'Final step: no bar may remain over a group — and double negations cancel.',
    };
  });

  def('simplifyAlg', 'm7', 'Simplify a canonical SOP', ({ ms }) => {
    const vars = ['A', 'B', 'C'];
    if (!ms) { do { ms = U.sample(U.range(8), rint(3, 5)).sort((a, b) => a - b); } while (B.minSOP(vars, ms).literals >= 3 * ms.length - 1); }
    const expr = B.canonicalSOP(vars, ms);
    const min = B.minSOP(vars, ms);
    return {
      prompt: `Simplify using Boolean algebra: <b class="mono">F = ${expr}</b>`,
      format: "Simplest expression, e.g. A + B'C",
      answer: { type: 'bool', vars, minterms: ms, minimal: true, display: min.expr },
      hints: ['Look for two terms that differ in exactly ONE variable: XY + XY\' = X.', 'You may reuse a term (idempotent law X = X + X) to combine it twice.', `The simplest form has ${min.terms.length} term${min.terms.length > 1 ? 's' : ''}.`],
      steps: [S('How many terms does the simplest SOP have?', min.terms.length, min.terms.map((t) => `${t.cov.map((m) => B.mintermStr(m, vars)).join(' + ')} → <b>${B.termSOP(t, vars)}</b>`).join('<br>'), null, { noEarly: true }), S('Simplified expression?', min.expr, `F = <b class="mono">${min.expr}</b>`, 'bool')],
      traps: [],
      finalCheck: 'Before submitting: could any pair of your terms still be combined?',
    };
  });

  def('evalExpr', 'm7', 'Evaluate an expression', ({ expr = pick(EXPR3), env }) => {
    const ast = B.parse(expr);
    env = env || { A: rint(0, 1), B: rint(0, 1), C: rint(0, 1) };
    const out = B.evaluate(ast, env);
    const subs = B.subexprs(ast);
    return {
      prompt: `Evaluate <b class="mono">F = ${expr}</b> for A=${env.A}, B=${env.B}, C=${env.C}.`, format: '0 or 1',
      answer: { type: 'bits', value: String(out), width: 1 },
      hints: ['Substitute the values first.', 'Evaluate NOTs first, then ANDs, then ORs (like × before +).', 'Work from the innermost brackets outwards.'],
      steps: [S('Inner results', null, subs.map((s) => `${s.str} = ${B.evaluate(s.node, env)}`).join('<br>')), S('F?', out, `F = <b>${out}</b>`, 'exact')],
      traps: [], finalCheck: 'Check the outermost operator last.',
    };
  });

  /* ================= Module 8: minterms / maxterms ================= */
  def('exprToMinterms', 'm8', 'Expression → minterm list', ({ expr = pick(EXPR3), decoder = false }) => {
    const ast = B.parse(expr); const vars = ['A', 'B', 'C'];
    const ms = B.minterms(ast, vars);
    const col = B.table(ast, vars).join('');
    return {
      prompt: decoder
        ? `F = <b class="mono">${expr}</b> is built from a 3-to-8 decoder (inputs A B C, A = MSB) and one OR gate. Which decoder outputs must go into the OR gate?`
        : `List the minterms of <b class="mono">F(A,B,C) = ${expr}</b>, i.e. F = Σm( ? ).`,
      format: 'Numbers separated by commas, e.g. 1, 3, 5',
      answer: { type: 'list', value: ms },
      hints: ['Build the truth table: rows 0 (000) to 7 (111), with A as the MSB.', 'A minterm number is the row number where F = 1.', 'A product term with a missing variable covers TWO rows (that variable can be 0 or 1).'],
      steps: [S('F column for rows 0…7 (8 bits)?', col, `F = ${mono(col)}`, 'exact', { noEarly: true }), S('Minterms?', ms.join(', '), `Σm(<b>${ms.join(', ')}</b>)`, 'list')],
      traps: [{ value: U.range(8).filter((i) => !ms.includes(i)).join(','), vtype: 'list', msg: 'Those are the rows where F = 0 — the MAXterms. Minterms are the rows where F = 1.' }],
      finalCheck: 'Final check: plug one of your minterms back into F — does it really give 1?',
    };
  });

  def('min2max', 'm8', 'Σm → ΠM conversion', ({ n = pick([3, 4]), m }) => {
    m = m || U.sample(U.range(1 << n), rint(3, (1 << n) - 3)).sort((a, b) => a - b);
    const M = U.range(1 << n).filter((i) => !m.includes(i));
    const vars = 'ABCD'.slice(0, n).split('').join(',');
    return {
      prompt: `F(${vars}) = Σm(${m.join(', ')}). Write F as a product of maxterms: F = ΠM( ? ).`, format: 'Numbers separated by commas',
      answer: { type: 'list', value: M },
      hints: [`There are ${1 << n} rows (0 … ${(1 << n) - 1}).`, 'Every row is either a minterm (F=1) or a maxterm (F=0) — never both.', 'So the maxterms are all the numbers NOT in the minterm list.'],
      steps: [S('How many rows in total?', 1 << n, `${n} variables → 2<sup>${n}</sup> = ${1 << n} rows`, null, { noEarly: true }), S('Maxterm list?', M.join(', '), `ΠM(<b>${M.join(', ')}</b>)`, 'list')],
      traps: [{ value: m.join(','), vtype: 'list', msg: 'Those are the same numbers. ΠM uses the rows that are NOT minterms.' }],
      finalCheck: `Final check: your list plus the minterm list should contain every number 0 … ${(1 << n) - 1} exactly once.`,
    };
  });

  def('maxToPOS', 'm8', 'ΠM → POS expression', ({ M }) => {
    const vars = ['A', 'B', 'C'];
    M = M || U.sample(U.range(8), 2).sort((a, b) => a - b);
    const ones = U.range(8).filter((i) => !M.includes(i));
    const expr = M.map((i) => B.maxtermStr(i, vars)).join('');
    return {
      prompt: `Write the canonical product-of-sums for <b>F(A,B,C) = ΠM(${M.join(', ')})</b>.`, format: "e.g. (A + B + C')(A' + B + C)",
      answer: { type: 'bool', vars, minterms: ones, form: 'pos', display: expr },
      hints: ['A maxterm is a SUM containing every variable.', 'In a maxterm, a variable is complemented when its bit is 1 (opposite of minterms!).', `M${M[0]}: ${M[0]} = ${N.bits(M[0], 3)} → write each variable plain for 0, primed for 1.`],
      steps: M.map((i) => S(`Maxterm M${i}?`, B.maxtermStr(i, vars), mono(`M${i} = ${N.bits(i, 3)} → ${B.maxtermStr(i, vars)}`), 'exact', { noEarly: true })).concat([S('Product of the maxterms?', expr, `<b class="mono">${expr}</b>`, 'bool')]),
      traps: [{ value: M.map((i) => '(' + B.mintermStr(i, vars).split('').join('+').replace(/\+'/g, "'") + ')').join(''), vtype: 'bool', msg: 'You complemented the variables the minterm way (0 → primed). For maxterms: bit 0 → plain variable, bit 1 → complemented.' }],
      finalCheck: 'Plug the maxterm’s row into your sum — it must give exactly 0.',
    };
  });

  /* ================= Module 9: K-maps ================= */
  G.kmapHTML = (n, ms, dc = [], vals) => {
    const L = B.kmapLayout(n);
    const vn = 'ABCD'.slice(0, n);
    const rv = vn.slice(0, L.rb), cv = vn.slice(L.rb);
    const g = (x, bits) => N.bits(x, bits);
    let h = `<table class="kmap-static"><tr><th class="corner">${rv}\\${cv}</th>${L.cols.map((c) => `<th>${g(c, L.cb)}</th>`).join('')}</tr>`;
    L.rows.forEach((r, ri) => {
      h += `<tr><th>${g(r, L.rb)}</th>`;
      L.cols.forEach((c, ci) => { const m = L.cell(ri, ci); const v = vals ? vals[m] : ms.includes(m) ? '1' : dc.includes(m) ? 'X' : '0'; h += `<td class="v${vals ? 'n' : v}"><span>${v}</span>${vals ? '' : `<small>${m}</small>`}</td>`; });
      h += '</tr>';
    });
    return h + '</table>';
  };
  const groupsHTML = (terms, vars, pos) => terms.map((t) => `cells ${t.cov.join(', ')} → <b class="mono">${pos ? '(' + B.termPOS(t, vars) + ')' : B.termSOP(t, vars)}</b>`).join('<br>');

  function randomKmap(n, withDc) {
    const vars = 'ABCD'.slice(0, n).split('');
    let ms, dc, sop;
    for (let t = 0; t < 200; t++) {
      const cells = U.shuffle(U.range(1 << n));
      const k = n === 3 ? rint(3, 5) : rint(5, 9);
      ms = cells.slice(0, k).sort((a, b) => a - b);
      dc = withDc ? cells.slice(k, k + rint(1, 3)).sort((a, b) => a - b) : [];
      sop = B.minSOP(vars, ms, dc);
      if (sop.terms.length >= 2 && sop.terms.length <= 4 && sop.literals < ms.length * n - 2) break;
    }
    return { vars, ms, dc, sop };
  }

  def('kmap', 'm9', 'K-map → minimal SOP', ({ n = pick([3, 4, 4]), m, dc }) => {
    let vars;
    if (!m) { const r = randomKmap(n, n === 4 && Math.random() < 0.5); m = r.ms; dc = r.dc; }
    dc = dc || []; vars = 'ABCD'.slice(0, n).split('');
    const sop = B.minSOP(vars, m, dc);
    return {
      prompt: `Use a K-map to find the <b>minimal SOP</b> for F(${vars.join(',')}) = Σm(${m.join(', ')})${dc.length ? ` + d(${dc.join(', ')})` : ''}.${G.kmapHTML(n, m, dc)}`,
      format: "Sum of products, e.g. A'B + CD'",
      answer: { type: 'bool', vars, minterms: m, dc, minimal: true, form: 'sop', display: sop.expr },
      hints: ['Groups must be rectangles of 1, 2, 4, 8 cells. Edges wrap around (left↔right, top↔bottom; the 4 corners are neighbours in a 4-var map).', `Make each group as LARGE as possible${dc.length ? ' — X cells (don’t cares) may be used to enlarge a group' : ''}, and use as FEW groups as possible.`, `The minimal answer uses ${sop.terms.length} group${sop.terms.length > 1 ? 's' : ''}. For each group keep only the variables that do not change.`],
      steps: [S('How many groups are in the minimal cover?', sop.terms.length, groupsHTML(sop.terms, vars), null, { noEarly: true }), S('Minimal SOP?', sop.expr, `F = <b class="mono">${sop.expr}</b>`, 'bool')],
      traps: [],
      finalCheck: 'Final check: every 1 is covered at least once, no 0 is covered, and no group could be made bigger.',
    };
  });

  def('kmapPOS', 'm9', 'K-map → minimal POS', ({ n = pick([3, 4]), m }) => {
    const vars = 'ABCD'.slice(0, n).split('');
    if (!m) { let pos; do { m = U.sample(U.range(1 << n), n === 3 ? rint(4, 6) : rint(8, 12)).sort((a, b) => a - b); pos = B.minPOS(vars, m); } while (pos.terms.length < 2 || pos.terms.length > 3); }
    const pos = B.minPOS(vars, m);
    const zeros = U.range(1 << n).filter((i) => !m.includes(i));
    return {
      prompt: `Find the <b>minimal POS</b> for F(${vars.join(',')}) = Σm(${m.join(', ')}). (Group the 0s!)${G.kmapHTML(n, m)}`,
      format: "Product of sums, e.g. (A + C)(B' + C)",
      answer: { type: 'bool', vars, minterms: m, minimal: true, form: 'pos', display: pos.expr },
      hints: ['Group the 0 cells instead of the 1s — this gives F\' as an SOP.', 'Then apply DeMorgan: each group becomes a SUM term with each variable complemented.', 'Shortcut: for a group of 0s, write a variable plain if it is 0 throughout the group, primed if it is 1.'],
      steps: [S('Which cells are 0 (maxterms)?', zeros.join(', '), `ΠM(${zeros.join(', ')})`, 'list', { noEarly: true }), S('How many groups of 0s?', pos.terms.length, groupsHTML(pos.terms, vars, true), null, { noEarly: true }), S('Minimal POS?', pos.expr, `F = <b class="mono">${pos.expr}</b>`, 'bool')],
      traps: [{ value: B.minSOP(vars, zeros).expr, vtype: 'bool', msg: 'That is F\' (the SOP of the zeros). Last step: apply DeMorgan to turn it into a product of sums for F.' }],
      finalCheck: 'Final step: in each sum, a variable that is 1 throughout the group appears complemented.',
    };
  });

  /* ================= Module 10: combinational circuits ================= */
  def('rippleAdd', 'm10', '4-bit ripple-carry adder', ({ a = N.bits(rint(1, 15), 4), b = N.bits(rint(1, 15), 4) }) => {
    const r = N.addWork(parseInt(a, 2), parseInt(b, 2), 4);
    const ans = r.carryOut + r.sum;
    const carries = r.carryOut + r.carries.slice(0, 3); // C4 C3 C2 C1
    return {
      prompt: `A 4-bit ripple-carry adder adds A = <b class="mono">${a}</b> and B = <b class="mono">${b}</b> with C0 = 0. Give the 5-bit output <span class="mono">C4 S3 S2 S1 S0</span>.`, format: '5 bits',
      answer: { type: 'bits', value: ans, width: 5 },
      hints: ['Each full adder: S = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B).', 'Start at bit 0 with Cin = 0; each carry-out feeds the next stage.', 'The final carry C4 is the leftmost output bit.'],
      steps: [S('Carries C4 C3 C2 C1 ?', carries, N.columnHTML([{ label: 'carry', bits: r.carries, cls: 'muted' }, { label: 'A', bits: a }, { label: 'B', bits: b }, { label: 'S', bits: r.sum, cls: 'rule' }]), 'exact', { noEarly: true }), S('Output C4 S3 S2 S1 S0?', ans, `<b class="mono">${ans}</b> (= ${parseInt(a, 2)} + ${parseInt(b, 2)} = ${parseInt(ans, 2)})`, 'exact')],
      traps: [{ value: '0' + r.sum, vtype: 'exact', msg: 'You lost the final carry C4 — the last stage’s carry-out is the leftmost output.' }],
      finalCheck: 'Last stage: does bit 3 generate a carry-out?',
    };
  });

  def('fullAdder', 'm10', 'Full adder outputs', ({ A = rint(0, 1), Bv = rint(0, 1), Ci = rint(0, 1) }) => {
    const s = A ^ Bv ^ Ci, c = (A & Bv) | (Ci & (A ^ Bv));
    return {
      prompt: `A full adder has A=${A}, B=${Bv}, Cin=${Ci}. Give the outputs as two bits <span class="mono">Cout S</span>.`, format: '2 bits: Cout then S',
      answer: { type: 'bits', value: `${c}${s}`, width: 2 },
      hints: ['A full adder adds three bits; the result is a 2-bit number Cout S.', `Count the 1s: ${A + Bv + Ci}.`, 'Write that count in binary as 2 bits.'],
      steps: [S('S = A ⊕ B ⊕ Cin ?', s, `${A}⊕${Bv}⊕${Ci} = ${s}`, 'exact', { noEarly: true }), S('Cout = AB + Cin(A⊕B) ?', c, `${A & Bv} + ${Ci & (A ^ Bv)} = ${c}`, 'exact', { noEarly: true }), S('Cout S ?', `${c}${s}`, `${A}+${Bv}+${Ci} = ${A + Bv + Ci} = <b>${c}${s}</b>${sub(2)}`, 'exact')],
      traps: [{ value: `${s}${c}`, vtype: 'exact', msg: 'Order! Cout comes first (it is the 2s place), then S.' }],
      finalCheck: 'Order of the two bits: Cout first, then S.',
    };
  });

  def('fullSub', 'm10', 'Full subtractor outputs', ({ A = rint(0, 1), Bv = rint(0, 1), Bi = rint(0, 1) }) => {
    const d = A ^ Bv ^ Bi, bo = ((1 - A) & Bv) | ((1 - A) & Bi) | (Bv & Bi);
    return {
      prompt: `A full subtractor computes A − B − Bin with A=${A}, B=${Bv}, Bin=${Bi}. Give <span class="mono">D Bout</span> (difference first, then borrow-out).`, format: '2 bits: D then Bout',
      answer: { type: 'bits', value: `${d}${bo}`, width: 2 },
      hints: ['D = A ⊕ B ⊕ Bin (same as the sum of a full adder).', 'Bout = A\'B + A\'Bin + B·Bin — a borrow is needed when A is too small.', `Think numerically: ${A} − ${Bv} − ${Bi} = ${A - Bv - Bi}. If negative, borrow 2.`],
      steps: [S('D?', d, `${A}⊕${Bv}⊕${Bi} = ${d}`, 'exact', { noEarly: true }), S('Bout?', bo, `A'B + A'Bin + B·Bin = ${bo}`, 'exact', { noEarly: true }), S('D Bout?', `${d}${bo}`, `<b>${d}${bo}</b>`, 'exact')],
      traps: [{ value: `${bo}${d}`, vtype: 'exact', msg: 'Order: D first, then Bout.' }],
      finalCheck: 'Check the order D, Bout.',
    };
  });

  def('mux', 'm10', 'Multiplexer output', ({ size = pick([4, 8]), I, sel }) => {
    I = I || U.range(size).map(() => rint(0, 1));
    sel = sel == null ? rint(0, size - 1) : sel;
    const k = Math.log2(size);
    const sbits = N.bits(sel, k);
    return {
      prompt: `A ${size}-to-1 multiplexer has data inputs ${I.map((v, i) => `I${i}=${v}`).join(', ')} and select lines ${sbits.split('').map((b, i) => `S${k - 1 - i}=${b}`).join(', ')}. What is the output Y?`, format: '0 or 1',
      answer: { type: 'bits', value: String(I[sel]), width: 1 },
      hints: ['The select lines form a binary number that chooses ONE input.', `S${k - 1} is the MSB of the select number.`, `Select = ${sbits}${sub(2)} → which input index?`],
      steps: [S('Which input index is selected?', sel, `${sbits}${sub(2)} = ${sel}`, null, { noEarly: true }), S('Y?', I[sel], `Y = I${sel} = <b>${I[sel]}</b>`, 'exact')],
      traps: [{ value: String(I[parseInt(N.reverse(sbits), 2)]), msg: `Careful with bit order: S${k - 1} is the most significant select bit.` }],
      finalCheck: 'Final step: read the value of the selected input, not its index.',
    };
  });

  def('decoder', 'm10', 'Decoder: active output', ({ ins = N.bits(rint(0, 7), 3) }) => {
    const v = parseInt(ins, 2);
    return {
      prompt: `A 3-to-8 decoder (active-high outputs, enabled) has inputs A=${ins[0]}, B=${ins[1]}, C=${ins[2]} (A is the MSB). Which output D<sub>i</sub> is 1? Give i.`, format: 'A number 0–7',
      answer: { type: 'num', base: 10, value: String(v) },
      hints: ['Exactly one output is 1: the one whose number equals the input.', 'Read ABC as a binary number with A as the MSB.', `${ins}${sub(2)} = ?`],
      steps: [S('Value of ABC?', v, `${ins}${sub(2)} = ${v} → D${v} = 1`)],
      traps: [{ value: String(parseInt(N.reverse(ins), 2)), msg: 'You read the inputs backwards — A is the MSB.' }],
      finalCheck: 'Check: A is worth 4, B 2, C 1.',
    };
  });

  def('muxFunction', 'm10', 'Implement F with a 4:1 MUX', ({ m }) => {
    if (!m) do { m = U.sample(U.range(8), rint(3, 5)).sort((a, b) => a - b); } while (false);
    const items = [0, 1, 2, 3].map((k) => {
      const f0 = m.includes(2 * k) ? 1 : 0, f1 = m.includes(2 * k + 1) ? 1 : 0;
      if (f0 === f1) return [String(f0)];
      return f1 ? ['C'] : ["C'", 'NOTC', '~C', '!C'];
    });
    const main = items.map((x) => x[0]);
    return {
      prompt: `Implement F(A,B,C) = Σm(${m.join(', ')}) with a 4-to-1 MUX, using A, B as the select lines (A = S1). What must be connected to I0, I1, I2, I3? Each is 0, 1, C or C'.`,
      format: "Four items, e.g. C, C', 1, 0",
      answer: { type: 'seq', items, labels: ['I0', 'I1', 'I2', 'I3'], display: main.join(', ') },
      hints: ['Each data input Ik handles the two rows where AB = k (C = 0 and C = 1).', 'Compare F in those two rows: (0,0) → 0, (1,1) → 1, (0,1) → C, (1,0) → C\'.', `For I0 look at minterms 0 and 1; for I1 at 2 and 3; I2: 4, 5; I3: 6, 7.`],
      steps: [0, 1, 2, 3].map((k) => S(`I${k} (rows ${2 * k}, ${2 * k + 1})?`, main[k], `F(${2 * k}) = ${m.includes(2 * k) ? 1 : 0}, F(${2 * k + 1}) = ${m.includes(2 * k + 1) ? 1 : 0} → ${main[k]}`, 'exact', { noEarly: true })).concat([S('All four inputs I0, I1, I2, I3?', main.join(', '), `<b class="mono">${main.join(', ')}</b>`)]),
      traps: [],
      finalCheck: 'Double-check I3 (minterms 6 and 7) — the last item is a common slip.',
    };
  });

  /* ================= Module 11: sequential ================= */
  const FF = {
    SR: { next: (q, [s, r]) => (s && r ? null : s ? 1 : r ? 0 : q), inputs: ['S', 'R'] },
    D: { next: (q, [d]) => d, inputs: ['D'] },
    T: { next: (q, [t]) => q ^ t, inputs: ['T'] },
    JK: { next: (q, [j, k]) => (j && k ? 1 - q : j ? 1 : k ? 0 : q), inputs: ['J', 'K'] },
  };
  G.FF = FF;
  const ffRule = { SR: 'S=1 sets, R=1 resets, S=R=0 holds (S=R=1 is not allowed)', D: 'Q⁺ = D', T: 'Q⁺ = T ⊕ Q (T=1 toggles)', JK: 'J=1,K=0 set; J=0,K=1 reset; 00 hold; 11 toggle' };
  def('ffSeq', 'm11', 'Flip-flop sequence', ({ type = pick(['D', 'T', 'JK', 'SR']), q0 = rint(0, 1), seq }) => {
    const f = FF[type];
    if (!seq) seq = U.range(rint(4, 6)).map(() => { let x; do { x = f.inputs.map(() => rint(0, 1)); } while (type === 'SR' && x[0] && x[1]); return x; });
    let q = q0; const qs = [];
    seq.forEach((x) => { q = f.next(q, x); qs.push(q); });
    const ans = qs.join('');
    const latch = type === 'SR';
    return {
      prompt: `${latch ? 'An SR (NOR) latch' : `A positive-edge-triggered ${type} flip-flop`} starts with Q = ${q0}. ${latch ? 'These input combinations are applied in turn' : 'At successive clock edges the inputs are'}: ${seq.map((x, i) => `${i + 1}) ${f.inputs.map((n, k) => `${n}=${x[k]}`).join(' ')}`).join(', ')}. Give Q after each one as a bit string.`,
      format: `${seq.length} bits`,
      answer: { type: 'bits', value: ans, width: seq.length },
      hints: [`Rule: ${ffRule[type]}.`, 'Go one step at a time; the NEW Q becomes the “old” Q for the next step.', 'Write each Q down before moving on — don’t skip ahead.'],
      steps: seq.map((x, i) => S(`Q after step ${i + 1}?`, qs[i], `${f.inputs.map((n, k) => `${n}=${x[k]}`).join(' ')}, Q=${i ? qs[i - 1] : q0} → Q⁺ = <b>${qs[i]}</b>`, 'exact', { noEarly: true })).concat([S('Full sequence?', ans, `<b class="mono">${ans}</b>`, 'exact')]),
      traps: [],
      finalCheck: 'Re-check the final edge using the Q from the step before it.',
    };
  });

  def('ffNext', 'm11', 'Next state from characteristic table', ({ type = pick(['JK', 'T', 'D', 'SR']), q, x }) => {
    const f = FF[type];
    q = q == null ? rint(0, 1) : q;
    if (!x) do { x = f.inputs.map(() => rint(0, 1)); } while (type === 'SR' && x[0] && x[1]);
    const nx = f.next(q, x);
    return {
      prompt: `${type} flip-flop: present state Q = ${q}, inputs ${f.inputs.map((n, k) => `${n}=${x[k]}`).join(', ')}. What is Q after the clock edge?`, format: '0 or 1',
      answer: { type: 'bits', value: String(nx), width: 1 },
      hints: [`Characteristic rule: ${ffRule[type]}.`, type === 'JK' ? 'Characteristic equation: Q⁺ = JQ\' + K\'Q.' : type === 'T' ? 'Q⁺ = T ⊕ Q.' : type === 'SR' ? 'Q⁺ = S + R\'Q.' : 'Q⁺ = D.', 'Substitute the values.'],
      steps: [S('Q⁺?', nx, `<b>${nx}</b>`, 'exact')], traps: [], finalCheck: 'Use the PRESENT Q in the equation.',
    };
  });
})();
