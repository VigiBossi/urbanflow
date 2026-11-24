/* Small shared helpers: HTML escaping and forgiving name matching. */
(function (root) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function canon(s) {
    let n = norm(s)
      .replace(/(identifier|number|num|nr|no|code)$/, 'id'); // MemberNo = MemberID = MemberNumber
    if (n.length > 3 && n.endsWith('s') && !n.endsWith('ss')) n = n.slice(0, -1);
    return n;
  }
  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  /** 0 = exact, 1 = alias, 2 = fuzzy, -1 = no match */
  function nameScore(user, model, aliases, opts) {
    const u = canon(user), m = canon(model);
    if (!u) return -1;
    if (u === m) return 0;
    const al = (aliases && (aliases[model] || aliases[norm(model)] || aliases[String(model).toUpperCase()])) || [];
    if (al.some(a => canon(a) === u)) return 1;
    // tolerate a table/entity prefix: "DoctorPhone" vs "Phone", "EmpName" vs "Name"
    const tol = m.length >= 9 ? 2 : (m.length >= 6 ? 1 : 0);
    if (lev(u, m) <= tol) return 2;
    if (al.some(a => { const c = canon(a); return lev(u, c) <= (c.length >= 9 ? 2 : c.length >= 7 ? 1 : 0); })) return 2;
    // for entity / table names: "CARD" matches "LIBRARY_CARD", "BOOKCOPY" matches "COPY"
    if (opts && opts.contains && Math.min(u.length, m.length) >= 4 && (u.includes(m) || m.includes(u))) return 3;
    return -1;
  }
  /** Greedy matching of model names to user names. Returns Map(modelIndex -> userIndex) */
  function matchNames(modelNames, userNames, aliases, opts) {
    const res = new Map(), used = new Set();
    for (const level of [0, 1, 2, 3]) {
      modelNames.forEach((mn, mi) => {
        if (res.has(mi)) return;
        const ui = userNames.findIndex((un, i) => !used.has(i) && nameScore(un, mn, aliases, opts) === level);
        if (ui >= 0) { res.set(mi, ui); used.add(ui); }
      });
    }
    return res;
  }
  const U = { esc, norm, canon, lev, nameScore, matchNames };
  root.U = U;
  if (typeof module !== 'undefined') module.exports = U;
})(typeof window !== 'undefined' ? window : globalThis);
