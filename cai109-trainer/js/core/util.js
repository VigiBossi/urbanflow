/* Shared helpers. Everything lives on the global CAI namespace so the app
   works from file:// without a bundler or ES-module loader. */
(function () {
  const CAI = (window.CAI = window.CAI || { modules: [], ui: {} });
  const U = (CAI.util = {});

  U.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  U.rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (arr, k) => U.shuffle(arr).slice(0, k);
  U.uid = () => Math.random().toString(36).slice(2, 10);
  U.pad = (s, n, c = '0') => String(s).padStart(n, c);
  U.popcount = (x) => { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; };

  /* Split a bit string into groups of n from the right: "1011010" -> "101 1010" */
  U.group = (s, n = 4) => {
    const out = [];
    for (let i = s.length; i > 0; i -= n) out.unshift(s.slice(Math.max(0, i - n), i));
    return out.join(' ');
  };

  U.$ = (sel, root = document) => root.querySelector(sel);
  U.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Range 0..n-1 */
  U.range = (n) => Array.from({ length: n }, (_, i) => i);

  U.fmtTime = (sec) => {
    sec = Math.max(0, Math.round(sec));
    return `${Math.floor(sec / 60)}:${U.pad(sec % 60, 2)}`;
  };

  U.toast = (msg, kind = '') => {
    if (typeof document === 'undefined') return;
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
  };
})();
