/* Answer checking + diagnosis.
   check(problem, input) -> { ok, error?, msgs[], earlyStep? }
   Answer specs (problem.answer):
     {type:'num',  base, value}                 number in a base (leading zeros ignored)
     {type:'bits', value, width?, rowVars?}     exact bit pattern (hex accepted when width%4==0)
     {type:'dec',  value}                       decimal number (fractions like 3/4 ok)
     {type:'list', value:[...], ordered?}       set of integers ("1, 3, 5")
     {type:'text', value, alts?:[]}             free text, spaces/case ignored
     {type:'seq',  items:[[alts...],...], labels?}  comma separated items
     {type:'choice', value: index}
     {type:'bool', value? | minterms+vars, dc?, minimal?, form?, noGroupNot?, ops?} */
(function () {
  const CAI = window.CAI;
  const B = CAI.bool;
  const C = (CAI.check = {});

  const normText = (s) => String(s).toUpperCase().replace(/[’‘`´′]/g, "'").replace(/\s+/g, '');
  const normLoose = (s) => {
    let t = normText(s).replace(/_/g, '').replace(/\(([0-9]+)\)$/, '').replace(/[₀-₉]+$/, '');
    t = t.replace(/^(-?)0[XB]/, '$1');
    if (/^-?[0-9A-F]+(\.[0-9A-F]+)?$/.test(t)) {
      const neg = t[0] === '-'; if (neg) t = t.slice(1);
      let [ip, fp] = t.split('.');
      ip = ip.replace(/^0+(?=.)/, '');
      if (fp !== undefined) { fp = fp.replace(/0+$/, ''); t = fp ? ip + '.' + fp : ip; } else t = ip;
      if (neg) t = '-' + t;
    }
    return t;
  };
  C.normText = normText;
  C.normLoose = normLoose;
  const parseIntList = (s) => String(s).split(/[\s,;]+/).filter(Boolean).map((x) => (/^-?\d+$/.test(x) ? +x : NaN));

  /* Compare an input with a step's expected value (used for step-check, traps and "stopped early") */
  C.stepMatches = (step, input) => {
    if (input == null || String(input).trim() === '') return false;
    const vt = step.vtype || 'loose';
    if (vt === 'bool') {
      const r = B.tryParse(input); const e = B.tryParse(step.value);
      return !!(r.ast && e.ast && B.equivalent(r.ast, e.ast));
    }
    if (vt === 'list') {
      const a = parseIntList(input), b = parseIntList(step.value);
      if (a.some(isNaN)) return false;
      if (step.ordered) return a.join(',') === b.join(',');
      return a.length === b.length && [...a].sort((x, y) => x - y).join(',') === [...b].sort((x, y) => x - y).join(',');
    }
    if (vt === 'exact') return normText(input).replace(/_/g, '') === normText(step.value);
    if (vt === 'word') return step.value.split('|').some((v) => normText(input).replace(/[^A-Z0-9]/g, '') === normText(v).replace(/[^A-Z0-9]/g, ''));
    return normLoose(input) === normLoose(step.value);
  };

  /* ---------- number in base ---------- */
  function parseNumIn(input, base) {
    let s = String(input).trim().toUpperCase().replace(/[\s_]/g, '').replace(/[₀-₉]+$/, '').replace(/\((2|8|10|16)\)$/, '');
    if (base === 16) s = s.replace(/^(-?)0X/, '$1').replace(/H$/, '');
    if (base === 2) s = s.replace(/^(-?)0B/, '$1').replace(/B$/, '');
    if (base === 8) s = s.replace(/^(-?)0O/, '$1').replace(/O$/, '');
    if (!s) return { error: 'Please type an answer.' };
    let neg = false;
    if (s[0] === '-') { neg = true; s = s.slice(1); }
    if (s[0] === '+') s = s.slice(1);
    const allowed = '0123456789ABCDEF'.slice(0, base);
    if ((s.match(/\./g) || []).length > 1) return { error: 'There is more than one point "." in your number.' };
    for (const ch of s) if (ch !== '.' && !allowed.includes(ch)) return { error: `"${ch}" is not a valid base-${base} digit (allowed: ${allowed.split('').join(' ')}).` };
    let [ip, fp = ''] = s.split('.');
    ip = ip.replace(/^0+(?=.)/, '') || '0';
    fp = fp.replace(/0+$/, '');
    const canon = (neg && (ip !== '0' || fp) ? '-' : '') + ip + (fp ? '.' + fp : '');
    return { canon, ip, fp, neg };
  }

  function checkNum(p, input) {
    const a = p.answer; const base = a.base;
    const u = parseNumIn(input, base);
    if (u.error) return { error: u.error };
    const e = parseNumIn(a.value, base);
    if (u.canon === e.canon) return { ok: true };
    const msgs = [];
    if (u.neg !== e.neg) msgs.push(e.neg ? 'Your number is missing the minus sign — the sign is part of the final step.' : 'The answer should not be negative.');
    if (u.ip === e.ip && u.fp !== e.fp) msgs.push('The integer part is right ✔. The fractional part is off — recheck the repeated multiplication (and read those digits top → bottom).');
    else if (u.fp === e.fp) {
      const rev = parseNumIn(CAI.num.reverse(e.ip), base).ip;
      if (u.ip === rev && e.ip.length > 1) msgs.push('Your digits are in reverse order. With repeated division, the FIRST remainder is the least-significant (rightmost) digit — read the remainders from the bottom up.');
      else if (u.ip.length === e.ip.length) {
        const diff = []; for (let i = 0; i < u.ip.length; i++) if (u.ip[i] !== e.ip[i]) diff.push(i);
        if (diff.length === 1) {
          const pos = u.ip.length - 1 - diff[0];
          msgs.push(pos === 0 ? 'Only the LAST (rightmost) digit is wrong — that is your final step. Redo it slowly.' : `Only one digit is wrong: digit ${diff[0] + 1} from the left (place value ${base}<sup>${pos}</sup>). Recheck that step.`);
        } else msgs.push(`${diff.length} digits differ from the correct answer. Use “Check my steps” to find the first step that goes wrong.`);
      } else if (Math.abs(u.ip.length - e.ip.length) === 1) msgs.push(u.ip.length > e.ip.length ? 'You have one digit too many — did you add an extra remainder or a leading digit?' : 'You are one digit short — did you stop dividing before the quotient reached 0 (the last remainder is the MSB)?');
    }
    if (base === 10 && /^[01]{4,}$/.test(u.canon) && e.canon !== u.canon) msgs.unshift('That looks like a binary number — the answer must be written in decimal (base 10).');
    if (base !== 10 && /^\d+$/.test(String(input).trim()) && +String(input).trim() === Math.round(CAI.num.parseBase(e.ip, base)) && u.canon !== e.canon) msgs.unshift(`It looks like you wrote the value in decimal. The answer must be in base ${base}.`);
    return { ok: false, msgs };
  }

  /* ---------- exact bit pattern ---------- */
  function parseBits(input, width) {
    let s = String(input).trim().toUpperCase().replace(/[\s_]/g, '');
    if (!s) return { error: 'Please type an answer.' };
    let hex = null;
    if (/^0X[0-9A-F]+$/.test(s)) hex = s.slice(2);
    else if (/^[0-9A-F]+H$/.test(s) && width && width % 4 === 0) hex = s.slice(0, -1);
    else if (width && width % 4 === 0 && s.length === width / 4 && width > 4 && /^[0-9A-F]+$/.test(s) && /[2-9A-F]/.test(s)) hex = s;
    else if (width && width % 4 === 0 && s.length === width / 4 && width >= 16 && /^[01]+$/.test(s)) hex = s;
    if (hex) s = CAI.num.hexToBits(hex);
    s = s.replace(/^0B/, '');
    const bad = s.match(/[^01]/);
    if (bad) return { error: `"${bad[0]}" is not a bit. Type only 0s and 1s${width && width % 4 === 0 ? ' (or hex with 0x…)' : ''}.` };
    return { bits: s };
  }

  function rowName(i, vars) {
    return vars.map((v, k) => `${v}=${(i >> (vars.length - 1 - k)) & 1}`).join(', ');
  }

  function checkBits(p, input) {
    const a = p.answer; const exp = a.value.replace(/\s/g, '');
    const u = parseBits(input, a.width || exp.length);
    if (u.error) return { error: u.error };
    if (u.bits === exp) return { ok: true };
    const msgs = [];
    if (u.bits.length !== exp.length) {
      const stripped = u.bits.replace(/^0+/, ''), estr = exp.replace(/^0+/, '');
      if (stripped === estr) msgs.push(`The value is right, but you need exactly ${exp.length} bits — pad with leading zeros.`);
      else msgs.push(`Your answer has ${u.bits.length} bits; it should have exactly ${exp.length}.`);
      return { ok: false, msgs };
    }
    if (u.bits === CAI.num.invert(exp)) msgs.push('Every bit is flipped — your answer is the complement of the correct one.');
    const diff = []; for (let i = 0; i < exp.length; i++) if (u.bits[i] !== exp[i]) diff.push(i);
    if (a.rowVars) {
      const rows = diff.slice(0, 4).map((i) => `row ${rowName(i, a.rowVars)} (should be ${exp[i]})`);
      msgs.push(`${diff.length} row${diff.length > 1 ? 's are' : ' is'} wrong: ${rows.join('; ')}${diff.length > 4 ? '…' : ''}.`);
    } else if (diff.length === 1) {
      msgs.push(diff[0] === exp.length - 1 ? 'Only the LAST (rightmost) bit is wrong — that is exactly the final step. Redo it slowly.' : `Only bit ${diff[0] + 1} (counting from the left) is wrong.`);
    } else if (!msgs.length) msgs.push(`${diff.length} bits differ (positions ${diff.slice(0, 6).map((i) => i + 1).join(', ')}${diff.length > 6 ? '…' : ''} from the left).`);
    return { ok: false, msgs };
  }

  /* ---------- decimal ---------- */
  function parseDec(input) {
    const s = String(input).trim().replace(/\s/g, '').replace(/,/g, '.');
    if (!s) return { error: 'Please type an answer.' };
    let m = s.match(/^([+-]?\d+)\/(\d+)$/);
    if (m) return { v: +m[1] / +m[2] };
    if (/^(\+|-)?(INF|INFINITY|∞)$/i.test(s)) return { v: s[0] === '-' ? -Infinity : Infinity };
    if (/^NAN$/i.test(s)) return { v: NaN };
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return { error: 'Type a decimal number such as -13.25 (or a fraction like 3/8).' };
    return { v: parseFloat(s) };
  }
  function checkDec(p, input) {
    const u = parseDec(input); if (u.error) return { error: u.error };
    const e = typeof p.answer.value === 'number' ? p.answer.value : parseDec(String(p.answer.value)).v;
    if ((Number.isNaN(e) && Number.isNaN(u.v)) || u.v === e || Math.abs(u.v - e) <= 1e-9 * Math.max(1, Math.abs(e))) return { ok: true };
    const msgs = [];
    if (u.v === -e) msgs.push('The magnitude is right but the sign is wrong — check the sign bit / the final sign step.');
    else if (e !== 0 && Number.isFinite(u.v / e) && [2, 4, 8, 0.5, 0.25, 0.125].includes(Math.abs(u.v / e))) msgs.push(`Your answer is off by a factor of ${Math.abs(u.v / e) >= 1 ? Math.abs(u.v / e) : '1/' + 1 / Math.abs(u.v / e)} — that usually means the exponent is off. Recheck the exponent / bias step.`);
    return { ok: false, msgs };
  }

  /* ---------- list of integers ---------- */
  function checkList(p, input) {
    const items = parseIntList(input);
    if (!items.length) return { error: 'Type numbers separated by commas, e.g. 1, 3, 5.' };
    if (items.some(isNaN)) return { error: 'Use whole numbers separated by commas or spaces, e.g. 1, 3, 5.' };
    const exp = p.answer.value.map(Number);
    if (p.answer.ordered) {
      if (items.join(',') === exp.join(',')) return { ok: true };
      const sameSet = items.length === exp.length && [...items].sort((a, b) => a - b).join() === [...exp].sort((a, b) => a - b).join();
      return { ok: false, msgs: [sameSet ? 'Right numbers, wrong order.' : 'Some numbers are wrong.'] };
    }
    const us = new Set(items), es = new Set(exp);
    const missing = exp.filter((x) => !us.has(x)), extra = [...us].filter((x) => !es.has(x));
    if (!missing.length && !extra.length) return { ok: true };
    const msgs = [];
    if (missing.length) msgs.push(`You are missing ${missing.length} item${missing.length > 1 ? 's' : ''}.`);
    if (extra.length) msgs.push(`You included ${extra.length} item${extra.length > 1 ? 's' : ''} that should not be there${extra.length <= 2 ? ': ' + extra.join(', ') : ''}.`);
    return { ok: false, msgs };
  }

  /* ---------- text / sequence ---------- */
  function checkText(p, input) {
    if (!String(input).trim()) return { error: 'Please type an answer.' };
    const clean = (s) => normText(s).replace(/\),\(/g, ')(').replace(/[.]$/, '');
    const cand = [p.answer.value, ...(p.answer.alts || [])].map(clean);
    if (cand.includes(clean(input))) return { ok: true };
    if (p.answer.loose) {
      const w = (s) => normText(s).replace(/[^A-Z0-9+\-']/g, '');
      if ([p.answer.value, ...(p.answer.alts || [])].map(w).includes(w(input))) return { ok: true };
    }
    return { ok: false, msgs: [] };
  }
  function checkSeq(p, input) {
    const parts = String(input).split(/[,;]/).map((s) => normText(s)).filter((s) => s.length);
    const items = p.answer.items;
    if (parts.length !== items.length) return { error: `Give exactly ${items.length} items separated by commas${p.answer.labels ? ' (' + p.answer.labels.join(', ') + ')' : ''}.` };
    const bad = [];
    items.forEach((alts, i) => { if (!alts.map(normText).includes(parts[i])) bad.push(i); });
    if (!bad.length) return { ok: true };
    const lab = (i) => (p.answer.labels ? p.answer.labels[i] : 'item ' + (i + 1));
    const msgs = [`${bad.map(lab).join(', ')} ${bad.length > 1 ? 'are' : 'is'} wrong.`];
    if (bad.length === 1 && bad[0] === items.length - 1) msgs.push('Only the last item is wrong — the final step again!');
    return { ok: false, msgs };
  }

  /* ---------- Boolean expressions ---------- */
  C.boolTarget = (a) => {
    if (a._t) return a._t;
    let vars = a.vars, ones = a.minterms;
    if (a.value != null && !ones) {
      const ast = B.parse(a.value);
      vars = vars || B.vars(ast);
      ones = B.minterms(ast, vars);
    }
    const dc = a.dc || [];
    const sop = B.minSOP(vars, ones, dc), pos = B.minPOS(vars, ones, dc);
    a._t = { vars, ones, dc, sop, pos };
    Object.defineProperty(a, '_t', { enumerable: false, value: a._t });
    return a._t;
  };

  function checkBool(p, input) {
    const a = p.answer;
    const r = B.tryParse(input);
    if (r.error) return { error: r.error + (r.pos != null ? ` (near character ${r.pos + 1})` : '') };
    const T = C.boolTarget(a);
    const uvars = B.vars(r.ast);
    const extraVars = uvars.filter((v) => !T.vars.includes(v));
    if (extraVars.length) return { error: `Your expression uses ${extraVars.join(', ')}, but this problem only has the variables ${T.vars.join(', ')}.` };
    const userCol = B.table(r.ast, T.vars);
    const dcset = new Set(T.dc);
    const wrongRows = [];
    userCol.forEach((v, i) => { if (dcset.has(i)) return; if (v !== (T.ones.includes(i) ? 1 : 0)) wrongRows.push(i); });
    const msgs = [];
    if (wrongRows.length) {
      const rows = wrongRows.slice(0, 3).map((i) => `${rowName(i, T.vars)} → should be ${T.ones.includes(i) ? 1 : 0}`);
      msgs.push(`Not equivalent: your expression gives the wrong output on ${wrongRows.length} row${wrongRows.length > 1 ? 's' : ''} (e.g. ${rows.join('; ')}).`);
      if (wrongRows.length === 1) msgs.push(`Only one input combination (minterm ${wrongRows[0]}) is wrong — typically one cell missed or one extra cell in the very last grouping/simplification step.`);
      return { ok: false, msgs };
    }
    if (a.noGroupNot && !B.notOnlyOnVars(r.ast)) return { ok: false, msgs: ['Equivalent ✔, but you still have a NOT over a group. Finish the job: push every complement down onto single variables (apply DeMorgan again).'] };
    if (a.ops) {
      const used = [...B.opsUsed(r.ast)].filter((o) => !a.ops.includes(o));
      if (used.length) return { ok: false, msgs: [`Equivalent ✔, but you may only use ${a.ops.map((o) => o.toUpperCase()).join('/')} here — you used ${used.map((o) => (o === 'not' ? "NOT/'" : o.toUpperCase())).join(', ')}.`] };
    }
    if (a.form === 'sop' && !B.isSOP(r.ast)) return { ok: false, msgs: ['Equivalent ✔, but please write it as a sum of products (e.g. AB\' + C) — no parentheses around sums.'] };
    if (a.form === 'pos' && !B.isPOS(r.ast)) return { ok: false, msgs: ["Equivalent ✔, but please write it as a product of sums, e.g. (A + B')(C + D)."] };
    if (a.minimal) {
      const target = a.form === 'pos' ? T.pos.literals : T.sop.literals;
      const L = B.literals(r.ast);
      if (L > target) return { ok: false, msgs: [`Logically correct ✔ but not fully simplified: you have ${L} literals, the minimum is ${target}. The last simplification step can go further — look for a bigger group or another law (absorption, consensus).`] };
    }
    return { ok: true };
  }

  C.check = function (p, input) {
    const a = p.answer;
    let r;
    try {
      switch (a.type) {
        case 'num': r = checkNum(p, input); break;
        case 'bits': r = checkBits(p, input); break;
        case 'dec': r = checkDec(p, input); break;
        case 'list': r = checkList(p, input); break;
        case 'text': r = checkText(p, input); break;
        case 'seq': r = checkSeq(p, input); break;
        case 'bool': r = checkBool(p, input); break;
        case 'choice': r = { ok: +input === +a.value, msgs: [] }; break;
        default: r = { error: 'Unknown answer type ' + a.type };
      }
    } catch (e) { r = { error: 'Could not read that answer: ' + e.message }; }
    if (r.ok || r.error) return r;
    r.msgs = r.msgs || [];
    /* traps: known wrong answers with a specific explanation */
    for (const t of p.traps || []) if (C.stepMatches(t, input)) { r.msgs.unshift(t.msg); break; }
    /* did the student stop at an intermediate step? */
    const steps = (p.steps || []).filter((s) => s.value != null);
    for (let i = steps.length - 2; i >= 0; i--) {
      const st = steps[i];
      if (st.noEarly) continue;
      if (C.stepMatches(st, input)) {
        r.earlyStep = i;
        r.msgs.unshift(`Your answer equals the result of <b>Step ${i + 1}</b> (“${st.ask}”). You jumped to the answer too early — there ${steps.length - 1 - i === 1 ? 'is still 1 step' : 'are still ' + (steps.length - 1 - i) + ' steps'} after that.`);
        break;
      }
    }
    return r;
  };

  C.displayAnswer = (p) => {
    const a = p.answer;
    if (a.display) return a.display;
    switch (a.type) {
      case 'bool': return a.value != null && !a.minimal ? a.value : (a.form === 'pos' ? C.boolTarget(a).pos.expr : C.boolTarget(a).sop.expr);
      case 'list': return a.value.join(', ');
      case 'seq': return a.items.map((x) => x[0]).join(', ');
      case 'choice': return p.choices[a.value];
      case 'bits': return a.value;
      default: return String(a.value);
    }
  };
})();
