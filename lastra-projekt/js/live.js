/* =========================================================
   LASTRA PROJEKT – live content from Firestore (zero-downtime)
   ---------------------------------------------------------
   Runs right after js/config.js, before the page renders.
   1. If Firebase isn't configured (js/firebase-config.js has no projectId): does nothing –
      the site uses js/config.js exactly as before.
   2. Applies the last successfully fetched data from localStorage synchronously, so the
      first paint already shows the latest content (no flash, no blank screen).
   3. Fetches fresh data in the background through the public Firestore REST API (a few KB,
      no SDK), merges it into window.SITE and re-renders only if something changed.
   Any error, timeout or offline state silently keeps the current (local / cached) data.
   Only published projects are requested; firestore.rules allow public reads of exactly that.
   ========================================================= */
(function () {
  const FB = window.LP_FIREBASE || {}, SITE = window.SITE;
  if (!SITE || !FB.projectId || !FB.apiKey) return;
  const CACHE = "lp_live_v1", TIMEOUT = 7000;
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FB.projectId)}/databases/(default)/documents`;
  const local = JSON.parse(JSON.stringify({ projects: SITE.projects, architect: SITE.architect, estimator: SITE.estimator, models: SITE.models }));

  /* Firestore REST value → plain JS */
  const val = v => {
    if (!v || typeof v !== "object") return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return Number(v.doubleValue);
    if ("booleanValue" in v) return v.booleanValue;
    if ("nullValue" in v) return null;
    if ("timestampValue" in v) return v.timestampValue;
    if ("mapValue" in v) return fields(v.mapValue.fields || {});
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(val);
    return null;
  };
  const fields = f => { const o = {}; for (const k in f) o[k] = val(f[k]); return o; };

  /* merge only meaningful values: empty strings / null never wipe out local content */
  const deep = (target, src) => {
    for (const k in src) {
      const v = src[k];
      if (v === null || v === undefined || v === "") continue;
      if (Array.isArray(v)) { if (v.length) target[k] = v; continue; }
      if (typeof v === "object") { if (!target[k] || typeof target[k] !== "object" || Array.isArray(target[k])) target[k] = {}; deep(target[k], v); continue; }
      target[k] = v;
    }
    return target;
  };
  const SETTINGS = ["phone", "phoneLink", "whatsapp", "email", "address", "officeHours", "facebook", "instagram", "mapEmbed", "estimator", "models", "architect", "legal"];
  function apply(data) {
    if (!data) return;
    const s = data.settings || {};
    for (const k of SETTINGS) if (k in s) {
      const v = s[k];
      if (v && typeof v === "object" && !Array.isArray(v)) SITE[k] = deep(JSON.parse(JSON.stringify(SITE[k] || local[k] || {})), v);
      else if (v !== "" && v !== null && v !== undefined) SITE[k] = v;
    }
    if (Array.isArray(data.projects) && data.projects.length) {
      SITE.projects = data.projects
        .filter(p => p && p.published !== false && p.id && p.title)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(p => ({ ...p, gallery: (p.gallery && p.gallery.length ? p.gallery : [p.cover]).filter(Boolean), phases: p.phases || {} }))
        .filter(p => p.cover);
      if (!SITE.projects.length) SITE.projects = local.projects;
    }
  }

  /* 1 · cached data, synchronously */
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE) || "null"); } catch (e) {}
  if (cached && cached.project === FB.projectId) { try { apply(cached.data); } catch (e) { cached = null; } }

  /* 2 · fresh data in the background */
  const timed = (url, opt = {}) => {
    const ctl = "AbortController" in window ? new AbortController() : null, t = setTimeout(() => ctl && ctl.abort(), TIMEOUT);
    return fetch(url, { ...opt, signal: ctl && ctl.signal, credentials: "omit", cache: "no-store" }).finally(() => clearTimeout(t));
  };
  async function load() {
    const key = `key=${encodeURIComponent(FB.apiKey)}`;
    const [sRes, pRes] = await Promise.all([
      timed(`${base}/site/settings?${key}`),
      timed(`${base}:runQuery?${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "projects" }], where: { fieldFilter: { field: { fieldPath: "published" }, op: "EQUAL", value: { booleanValue: true } } } } }) })
    ]);
    const data = {};
    if (sRes.ok) data.settings = fields((await sRes.json()).fields || {});
    else if (sRes.status !== 404) throw new Error("settings " + sRes.status);
    if (pRes.ok) data.projects = (await pRes.json()).filter(r => r.document).map(r => ({ ...fields(r.document.fields || {}), _doc: r.document.name.split("/").pop() }));
    else throw new Error("projects " + pRes.status);
    data.projects.forEach(p => { if (!p.id) p.id = p._doc; delete p._doc; });
    return data;
  }
  const refresh = () => { if (window.LPUI && window.LPUI.refresh) window.LPUI.refresh(); else document.addEventListener("DOMContentLoaded", () => window.LPUI && window.LPUI.refresh && window.LPUI.refresh(), { once: true }); };
  const start = () => load().then(data => {
    const fresh = JSON.stringify(data);
    if (cached && JSON.stringify(cached.data) === fresh) return;          // nothing changed
    try { localStorage.setItem(CACHE, JSON.stringify({ project: FB.projectId, at: Date.now(), data })); } catch (e) {}
    /* rebuild from the local defaults so removed values don't linger, then re-render */
    SITE.projects = JSON.parse(JSON.stringify(local.projects)); SITE.architect = JSON.parse(JSON.stringify(local.architect));
    SITE.estimator = JSON.parse(JSON.stringify(local.estimator)); SITE.models = JSON.parse(JSON.stringify(local.models));
    apply(data); refresh();
  }).catch(err => { if (window.console) console.info("[lastra] live content unavailable, using local data:", err && err.message); });
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
  window.LP_LIVE = { reload: start, clearCache: () => { try { localStorage.removeItem(CACHE); } catch (e) {} } };
})();
