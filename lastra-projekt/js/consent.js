/* Lastra Projekt – minimal cookie / privacy notice (SQ / MK / EN)
   • The site itself sets no tracking cookies. localStorage only keeps the language and this choice.
   • Optional analytics (SITE.analytics, a self-hosted script path) is injected ONLY after "Accept all".
   • "Cookie preferences" in the footer ([data-consent-open]) re-opens the notice at any time. */
(function () {
  const KEY = "lp_consent", VERSION = 1;
  const UI = window.LPUI || {}, S = window.SITE || {}, LP = window.LP || {};
  const t = k => (UI.t ? UI.t(k) : k);
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && v.v === VERSION ? v : null; } catch (e) { return null; } };
  const write = choice => { try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice, at: new Date().toISOString() })); } catch (e) {} };

  let el = null, analyticsLoaded = false;
  function loadOptional(choice) {
    window.LP_CONSENT = choice;
    document.dispatchEvent(new CustomEvent("lp:consent", { detail: choice }));
    if (choice !== "all" || analyticsLoaded || !S.analytics) return;
    if (!/^[\w./-]+\.js$/.test(S.analytics)) return;             // self-hosted relative path only
    analyticsLoaded = true;
    const sc = document.createElement("script"); sc.src = S.analytics; sc.defer = true; document.head.appendChild(sc);
  }
  function label() {
    if (!el) return;
    el.querySelectorAll("[data-ck]").forEach(n => { n.textContent = t(n.dataset.ck); });
    el.setAttribute("aria-label", t("consent_t"));
  }
  function build() {
    el = document.createElement("div");
    el.className = "consent"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "false"); el.hidden = true;
    el.innerHTML = `
      <p class="consent-t" data-ck="consent_t"></p>
      <p class="consent-d"><span data-ck="consent_d"></span> <a href="privacy.html" data-ck="privacy_link"></a></p>
      <div class="consent-a"><button type="button" class="btn btn-primary btn-sm" data-choice="all"><span data-ck="consent_all"></span></button><button type="button" class="btn btn-outline btn-sm" data-choice="essential"><span data-ck="consent_ess"></span></button></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-choice]"); if (!b) return;
      write(b.dataset.choice); hide(); loadOptional(b.dataset.choice);
    });
    el.addEventListener("keydown", e => { if (e.key === "Escape" && read()) hide(); });
    label();
  }
  function show(focus) {
    if (!el) build();
    el.hidden = false;
    const go = () => el.classList.add("open");
    window.gsap ? window.gsap.delayedCall(0, go) : setTimeout(go, 16);
    if (focus) { const b = el.querySelector("[data-choice]"); b && b.focus({ preventScroll: true }); }
  }
  function hide() { if (!el) return; el.classList.remove("open"); setTimeout(() => { if (!el.classList.contains("open")) el.hidden = true; }, 400); }

  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("[data-consent-open]")) { e.preventDefault(); show(true); } });
  document.addEventListener("lp:lang", label);

  const saved = read();
  if (saved) loadOptional(saved.choice);
  else setTimeout(() => show(false), 1400);          // never blocks the hero; appears after first paint
  LP.consent = { show: () => show(true), get: () => (read() || {}).choice || null };
})();
