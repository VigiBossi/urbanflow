/* =====================================================================
   RELATIONAL SCHEMA parser + checker.
   Format (one table per line):
     DOCTOR(DoctorID PK, FirstName, LastName, Salary, DeptID FK->DEPARTMENT)
     DOCTOR_PHONE(DoctorID PK FK->DOCTOR, Phone PK)
     DEPARTMENT(DeptID PK, DeptName, HeadDoctorID FK->DOCTOR UNIQUE)
   Markers after an attribute: PK, FK->TABLE (or FK -> TABLE(col)), UNIQUE
   Matching ignores order, capitalization and small naming differences.

   Model answers use the same format, plus optional "notes" on the exercise:
     notes: { kinds: {TABLE: 'multi'|'weak'|'mn'|'1:1'}, composite: {Name:['FirstName','LastName']},
              derived: ['Age'], multivalued: {Phone:'DOCTOR_PHONE'} }
   ===================================================================== */
(function (root) {
  const U = root.U;

  function parse(text) {
    const tables = [];
    const src = String(text || '').replace(/→/g, '->');
    let i = 0;
    while (i < src.length) {
      const m = /[A-Za-z_][\w]*/.exec(src.slice(i));
      if (!m) break;
      const name = m[0]; let j = i + m.index + name.length;
      while (j < src.length && /\s/.test(src[j])) j++;
      if (src[j] !== '(') { i = j + 1; continue; }
      let depth = 0, k = j;
      for (; k < src.length; k++) { if (src[k] === '(') depth++; if (src[k] === ')') { depth--; if (depth === 0) break; } }
      if (depth !== 0) throw new Error(`Table ${name}: a parenthesis is not closed.`);
      const body = src.slice(j + 1, k);
      tables.push({ name, attrs: parseAttrs(body, name) });
      i = k + 1;
    }
    if (!tables.length) throw new Error('Write tables like TABLE(Attr1 PK, Attr2, Attr3 FK->OTHER).');
    return tables;
  }
  function parseAttrs(body, tname) {
    // split by commas not inside parentheses
    const parts = []; let depth = 0, cur = '';
    for (const ch of body) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
    if (cur.trim()) parts.push(cur);
    return parts.map(p => p.trim()).filter(Boolean).map(p => {
      let s = p;
      const a = { name: '', pk: false, fk: null, unique: false };
      const fk = s.match(/\bFK\s*(?:->|>|references|ref)?\s*([A-Za-z_][\w]*)(\s*\([^)]*\))?/i);
      if (fk) { a.fk = fk[1]; s = s.replace(fk[0], ' '); }
      if (/\bPK\b|\bPRIMARY\s+KEY\b/i.test(s)) { a.pk = true; s = s.replace(/\bPK\b|\bPRIMARY\s+KEY\b/ig, ' '); }
      if (/\bUNIQUE\b|\bUQ\b/i.test(s)) { a.unique = true; s = s.replace(/\bUNIQUE\b|\bUQ\b/ig, ' '); }
      s = s.replace(/\bNOT\s+NULL\b/ig, ' ').replace(/\b(int|integer|text|varchar|date|real)\b(\(\d+\))?/ig, ' ');
      a.name = s.trim().split(/\s+/)[0] || '';
      if (!a.name) throw new Error(`Table ${tname}: one attribute has no name ("${p.trim()}").`);
      return a;
    });
  }
  const toText = (tables) => tables.map(t => `${t.name}(${t.attrs.map(a => a.name + (a.pk ? ' PK' : '') + (a.fk ? ' FK->' + a.fk : '') + (a.unique ? ' UNIQUE' : '')).join(', ')})`).join('\n');

  /** Compare. Returns { score, passed, total, items, categories } */
  function check(userText, modelText, notes = {}, aliases = {}) {
    const user = parse(userText), model = parse(modelText);
    const items = [];
    const ok = (msg) => items.push({ ok: true, msg });
    const bad = (msg, cat) => items.push({ ok: false, msg, cat });
    const note = (msg) => items.push({ ok: null, msg });
    const kinds = notes.kinds || {};
    const comp = notes.composite || {};
    const derived = notes.derived || [];
    const multi = notes.multivalued || {};

    // 1) match tables by name, then by attribute overlap
    const tm = U.matchNames(model.map(t => t.name), user.map(t => t.name), aliases, { contains: true });
    const usedU = new Set(tm.values());
    model.forEach((mt, i) => {
      if (tm.has(i)) return;
      let best = -1, bestScore = 0;
      user.forEach((ut, j) => {
        if (usedU.has(j)) return;
        const am = U.matchNames(mt.attrs.map(a => a.name), ut.attrs.map(a => a.name), aliases);
        const sc = am.size / Math.max(mt.attrs.length, ut.attrs.length);
        if (sc > bestScore) { bestScore = sc; best = j; }
      });
      if (best >= 0 && bestScore >= 0.6) { tm.set(i, best); usedU.add(best); }
    });
    const tableNameOfUser = (name) => { // user table name -> model table name
      const j = user.findIndex(t => t.name.toLowerCase() === String(name).toLowerCase());
      for (const [mi, uj] of tm) if (uj === j) return model[mi].name;
      const k = model.findIndex(t => U.nameScore(name, t.name, aliases) >= 0);
      return k >= 0 ? model[k].name : null;
    };

    model.forEach((mt, i) => {
      const kind = kinds[mt.name];
      if (!tm.has(i)) {
        const cat = kind === 'multi' ? 'multivalued-not-split' : kind === 'weak' ? 'weak-entity-key' : kind === 'mn' ? 'mn-not-table' : 'missing-table';
        const why = kind === 'multi' ? ' — a multivalued attribute needs its own table (OwnerKey, Value).' : kind === 'mn' ? ' — an M:N relationship always becomes its own table.' : kind === 'weak' ? ' — the weak entity needs its own table with the owner\'s key.' : '';
        bad(`Missing table ${mt.name}(${mt.attrs.map(a => a.name).join(', ')})${why}`, cat);
        return;
      }
      const ut = user[tm.get(i)];
      ok(`Table ${mt.name} found${U.canon(ut.name) !== U.canon(mt.name) ? ` (you called it ${ut.name})` : ''}.`);
      // attributes: match by name, FK attributes may also match by target table
      const am = U.matchNames(mt.attrs.map(a => a.name), ut.attrs.map(a => a.name), aliases);
      const used = new Set(am.values());
      mt.attrs.forEach((ma, k) => {
        if (am.has(k) || !ma.fk) return;
        const j = ut.attrs.findIndex((ua, jj) => !used.has(jj) && ua.fk && tableNameOfUser(ua.fk) === ma.fk);
        if (j >= 0) { am.set(k, j); used.add(j); }
      });
      mt.attrs.forEach((ma, k) => {
        if (!am.has(k)) {
          const compositeName = Object.keys(comp).find(c => comp[c].some(p => U.nameScore(ma.name, p, aliases) >= 0));
          if (compositeName && ut.attrs.some(ua => U.nameScore(ua.name, compositeName, aliases) >= 0)) bad(`${mt.name}: the composite attribute ${compositeName} must be split into its simple parts (${comp[compositeName].join(', ')}). ${ma.name} is missing.`, 'composite-not-split');
          else if (ma.fk) {
            // is the FK on the other side?
            const other = model.find(t => t.name === ma.fk);
            const ui = other ? tm.get(model.indexOf(other)) : undefined;
            const reverse = ui !== undefined && user[ui].attrs.some(ua => ua.fk && tableNameOfUser(ua.fk) === mt.name);
            if (reverse && kind !== 'mn' && kind !== 'multi' && kind !== 'weak') {
              const oneToOne = ma.unique || kinds[mt.name] === '1:1';
              bad(`${mt.name} should hold the foreign key ${ma.name} -> ${ma.fk}. You put the FK in ${other.name} instead. ${oneToOne ? 'In a 1:1 relationship put the FK on the side with TOTAL participation (and mark it UNIQUE).' : 'In a 1:N relationship the FK always goes in the table on the N side.'}`, oneToOne ? 'fk-wrong-side-1to1' : 'fk-wrong-side-1toN');
            } else bad(`${mt.name} is missing the foreign key ${ma.name} -> ${ma.fk}.`, kind === 'mn' ? 'mn-not-table' : kind === 'weak' ? 'weak-entity-key' : 'missing-fk');
          } else bad(`${mt.name} is missing the attribute ${ma.name}.`, 'missing-attribute');
          return;
        }
        const ua = ut.attrs[am.get(k)];
        ok(`${mt.name}.${ma.name} present${U.canon(ua.name) !== U.canon(ma.name) ? ` (as ${ua.name})` : ''}.`);
        if (ma.fk) {
          const tgt = ua.fk ? tableNameOfUser(ua.fk) : null;
          if (tgt === ma.fk) ok(`${mt.name}.${ma.name} is a foreign key to ${ma.fk} ✓`);
          else bad(`${mt.name}.${ma.name} must be marked as a foreign key: ${ma.name} FK->${ma.fk}${ua.fk ? ` (you point to ${ua.fk})` : ''}.`, kind === 'weak' ? 'weak-entity-key' : 'missing-fk');
        }
        if (ma.unique && !ua.unique && !ua.pk) bad(`${mt.name}.${ma.name} must be UNIQUE — this FK implements a 1:1 relationship, so a value may appear only once.`, 'fk-wrong-side-1to1');
        else if (ma.unique) ok(`${mt.name}.${ma.name} is UNIQUE ✓ (1:1)`);
      });
      // primary key
      const mpk = mt.attrs.map((a, k) => a.pk ? k : -1).filter(k => k >= 0);
      const upk = ut.attrs.map((a, k) => a.pk ? k : -1).filter(k => k >= 0);
      const mapped = mpk.map(k => am.get(k));
      const pkOk = mapped.every(x => x !== undefined && ut.attrs[x].pk) && upk.length === mpk.length;
      if (pkOk) ok(`${mt.name}: primary key (${mt.attrs.filter(a => a.pk).map(a => a.name).join(', ')}) ✓`);
      else {
        const want = mt.attrs.filter(a => a.pk).map(a => a.name).join(' + ');
        const why = kind === 'weak' ? ' A weak entity\'s PK = owner\'s PK + partial key.' : kind === 'mn' ? ' An M:N table\'s PK combines both foreign keys.' : kind === 'multi' ? ' A multivalued table\'s PK is both columns (owner key + value).' : '';
        bad(`${mt.name}: the primary key should be ${want}${upk.length ? ` (you have ${upk.map(x => ut.attrs[x].name).join(' + ')})` : ' (you marked no PK)'}.${why}`, kind === 'weak' ? 'weak-entity-key' : kind === 'mn' ? 'mn-key' : kind === 'multi' ? 'multivalued-not-split' : 'pk-wrong');
      }
      // extra attributes in this table
      ut.attrs.forEach((ua, j) => {
        if ([...am.values()].includes(j)) return;
        if (derived.some(d => U.nameScore(ua.name, d, aliases) >= 0)) bad(`${ut.name}.${ua.name} is a DERIVED attribute — do not store it (compute it when needed).`, 'derived-stored');
        else if (Object.keys(multi).some(mv => U.nameScore(ua.name, mv, aliases) >= 0) && kind !== 'multi') bad(`${ut.name}.${ua.name} is MULTIVALUED — it cannot be a column here; move it to its own table ${multi[Object.keys(multi).find(mv => U.nameScore(ua.name, mv, aliases) >= 0)]}.`, 'multivalued-not-split');
        else if (Object.keys(comp).some(c => U.nameScore(ua.name, c, aliases) >= 0)) { /* already reported as composite */ }
        else {
          const home = model.find(t => t !== mt && t.attrs.some(a => !a.fk && U.nameScore(ua.name, a.name, aliases) >= 0 && !mt.attrs.some(b => U.nameScore(ua.name, b.name, aliases) >= 0)));
          if (home && !ua.fk) bad(`${ut.name}.${ua.name} is in the wrong table — it belongs in ${home.name}.`, kinds[home.name] === 'mn' ? 'rel-attr-misplaced' : 'attribute-misplaced');
          else note(`Note: ${ut.name}.${ua.name} is not in the model answer.`);
        }
      });
    });
    user.forEach((ut, j) => { if (![...tm.values()].includes(j)) note(`Note: table ${ut.name} is not in the model answer.`); });
    const graded = items.filter(x => x.ok !== null);
    const passed = graded.filter(x => x.ok).length;
    return { score: graded.length ? passed / graded.length : 0, passed, total: graded.length, items, categories: [...new Set(items.filter(x => x.ok === false && x.cat).map(x => x.cat))] };
  }

  const API = { parse, check, toText };
  root.SCHEMA = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
