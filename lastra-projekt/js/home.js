/* Lastra Projekt – home page sections: before/after slider, projects + modal, estimator.
   All per-frame work runs in the shared gsap.ticker clock (LP.clock); overlays only move via transform/opacity. */
(function () {
  const UI = window.LPUI, S = window.SITE, LP = window.LP || {}, G = window.gsap;
  if (!UI || document.body.dataset.page !== "home") return;
  const { t, L, pad, has, messenger, reduce } = UI;
  const qs = (s, r = document) => r.querySelector(s), qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const kdt = (k, dt) => 1 - Math.pow(1 - k, (dt || 16.7) / 16.7);

  /* ---------------- before / after: damped drag handle, transform-only masking ---------------- */
  function beforeAfter() {
    const el = qs(".ba-slider"); if (!el) return;
    const range = qs(".ba-range", el), clip = qs(".ba-before", el), img = qs(".ba-before img", el), handle = qs(".ba-handle", el);
    let target = 50, cur = 50, drawn = -1, dragging = false;
    const draw = v => {
      const off = 100 - v;
      clip.style.transform = `translate3d(${-off}%,0,0)`; img.style.transform = `translate3d(${off}%,0,0)`;
      handle.style.transform = `translate3d(${(v / 100) * el.clientWidth}px,0,0)`;
    };
    const fromX = x => { const r = el.getBoundingClientRect(); return Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)); };
    el.addEventListener("pointerdown", e => { if (e.pointerType === "touch") return; dragging = true; el.setPointerCapture(e.pointerId); target = fromX(e.clientX); el.classList.add("drag"); });
    el.addEventListener("pointermove", e => { if (dragging) target = fromX(e.clientX); });
    const up = () => { dragging = false; el.classList.remove("drag"); };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    /* touch: horizontal drags move the handle, vertical swipes keep scrolling the page */
    let tx = null, ty = null, lockX = false;
    el.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; lockX = false; }, { passive: true });
    el.addEventListener("touchmove", e => {
      if (tx == null) return; const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
      if (!lockX && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) lockX = true;
      if (lockX) { e.preventDefault(); target = fromX(e.touches[0].clientX); }
    }, { passive: false });
    el.addEventListener("touchend", () => { tx = null; });
    range.addEventListener("input", () => { target = +range.value; });
    addEventListener("resize", () => { drawn = -1; });
    const tick = (time, dt) => {
      cur = reduce ? target : cur + (target - cur) * kdt(dragging ? .22 : .09, dt);
      if (Math.abs(cur - drawn) > .01) { drawn = cur; draw(cur); range.value = cur.toFixed(1); }
    };
    if (LP.clock && !reduce) LP.clock.add(tick); else { range.addEventListener("input", () => tick()); el.addEventListener("pointermove", () => tick()); draw(50); }
    /* a gentle first hint when it scrolls into view */
    if (!reduce && G && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); G.to({}, { duration: 0.01, onComplete: () => { target = 68; G.delayedCall(.9, () => { if (!dragging) target = 50; }); } }); }, { threshold: .6 });
      io.observe(el);
    }
  }

  /* ---------------- projects: filter + modal with gallery and phase tabs ---------------- */
  function projects() {
    const grid = qs("#project-grid"), modal = qs("#pmodal"); if (!grid || !modal) return;
    const body = qs(".pm-body", modal);
    let open = null, lastFocus = null;
    const render = p => {
      const ph = p.phases || {}, keys = ["before", "during", "after"].filter(k => ph[k]);
      body.innerHTML = `
        <p class="pm-meta mono"><span class="badge ${p.status}">${t("st_" + p.status)}</span><span>${L(p.location)}</span><span>${p.size} m²</span><span>${p.year}</span></p>
        <h2 id="pm-title" class="display">${L(p.title)}</h2>
        <p class="lead">${L(p.desc)}</p>
        ${keys.length ? `<div class="pm-tabs" role="tablist" aria-label="${t("phases")}">${keys.map((k, i) => `<button type="button" role="tab" id="pmt-${k}" aria-controls="pmp" aria-selected="${i === keys.length - 1}" data-ph="${k}"><span class="mono">${pad(i + 1)}</span>${t(k)}</button>`).join("")}</div>
        <figure class="pm-phase" id="pmp" role="tabpanel">${keys.map((k, i) => UI.pic(ph[k], `${L(p.title)} – ${t(k)}`, "(max-width: 900px) 100vw, 900px", i === keys.length - 1 ? "on" : "")).join("")}</figure>` : ""}
        <h3 class="pm-h mono">${t("gallery")} · ${pad(p.gallery.length)}</h3>
        <div class="pm-gallery">${p.gallery.map((g, i) => `<button type="button" class="gitem" data-full="${UI.webp(g)}" data-cap="${L(p.title)} – ${i + 1}" aria-label="${t("gallery")} ${i + 1}: ${L(p.title)}">${UI.pic(g, `${L(p.title)} – ${i + 1}`, "(max-width: 900px) 50vw, 420px")}</button>`).join("")}</div>
        <div class="pm-actions"><a class="btn btn-primary" href="#contact" data-close><span>${t("cta_quote")}</span><i class="arr" aria-hidden="true"></i></a><a class="link" href="project.html?id=${p.id}"><span>${t("pm_page")}</span><i class="arr" aria-hidden="true"></i></a></div>`;
      const imgs = qsa(".pm-phase img", body);
      qsa(".pm-tabs button", body).forEach((b, i, all) => {
        b.addEventListener("click", () => { all.forEach(x => x.setAttribute("aria-selected", x === b)); imgs.forEach((im, k) => im.classList.toggle("on", k === i)); });
        b.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const n = all[(i + d + all.length) % all.length]; n.focus(); n.click(); } });
      });
    };
    const show = id => {
      const p = S.projects.find(x => x.id === id); if (!p) return false;
      open = p; lastFocus = document.activeElement; render(p);
      modal.hidden = false; document.documentElement.classList.add("lock"); LP.stopScroll && LP.stopScroll();
      qs(".pm-panel", modal).scrollTop = 0;
      G ? G.delayedCall(0, () => modal.classList.add("open")) : modal.classList.add("open");
      qs(".pm-close", modal).focus({ preventScroll: true });
      return true;
    };
    const hide = () => {
      if (!open) return; open = null; modal.classList.remove("open");
      document.documentElement.classList.remove("lock"); LP.startScroll && LP.startScroll();
      setTimeout(() => { if (!open) modal.hidden = true; }, 450);
      lastFocus && lastFocus.focus({ preventScroll: true });
    };
    /* capture phase: open the modal before the page-transition handler sees the link */
    document.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("#project-grid .pcard-link"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const id = new URL(a.href, location.href).searchParams.get("id");
      if (show(id)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    modal.addEventListener("click", e => {
      const c = e.target.closest("[data-close]"); if (!c) return;
      const href = c.getAttribute("href"); hide();
      if (href && href.startsWith("#")) { e.preventDefault(); const tgt = qs(href); tgt && setTimeout(() => LP.scrollTo ? LP.scrollTo(tgt, { offset: -72 }) : tgt.scrollIntoView(), 60); }
    });
    document.addEventListener("keydown", e => {
      if (!open || qs(".lightbox.open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "Tab") { const f = qsa("button, a[href]", modal).filter(x => x.offsetParent); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    document.addEventListener("lp:lang", () => { if (open) render(open); });
  }

  /* ---------------- turnkey estimator ---------------- */
  function estimator() {
    const f = qs("#est-form"); if (!f) return;
    const E = S.estimator, size = qs("#est-size", f), sizeOut = qs("#est-size-out"), num = qs("#est-num"), list = qs("#est-list"), send = qs("#est-send"), meter = qs(".est-meter i"), status = qs(".est-status");
    Object.assign(size, { min: E.min, max: E.max, step: E.step }); size.value = E.start;
    const mode = has.whatsapp ? "wa" : messenger ? "msgr" : has.email ? "mail" : "none";
    const shown = { v: 0 };
    const calc = () => {
      const d = new FormData(f), m2 = +size.value, floors = +d.get("floors"), tier = d.get("tier"), T = E.tiers[tier];
      const months = T.base + m2 * T.perM2 + Math.max(0, floors - 1) * T.extraFloor, lo = Math.max(2, Math.round(months - E.range)), hi = Math.round(months + E.range);
      return { m2, floors, tier, T, months, lo, hi };
    };
    const msg = r => [t("est_msg_intro"), "", `${t("est_size")}: ${r.m2} m²`, `${t("est_floors")}: ${r.floors}`, `${t("est_tier")}: ${t("tier_" + r.tier)}`, `${t("est_dur")}: ${r.lo}–${r.hi} ${t("est_months")}`, "", `${t("est_incl")}:`, ...r.T.items.map(k => "• " + t(k)), "", t("est_msg_outro")].join("\n");
    const update = () => {
      const r = calc();
      sizeOut.textContent = `${r.m2} m²`;
      size.style.setProperty("--p", ((r.m2 - E.min) / (E.max - E.min)).toFixed(3));
      size.setAttribute("aria-valuetext", `${r.m2} m²`);
      list.innerHTML = r.T.items.map(k => `<li>${t(k)}</li>`).join("");
      /* number + meter ease to the new value (transform only) */
      const to = r.months, apply = () => { const a = Math.max(2, Math.round(shown.v - E.range)), b = Math.round(shown.v + E.range); num.textContent = `${a}–${b}`; meter.style.transform = `scaleX(${Math.min(1, shown.v / 22).toFixed(3)})`; };
      if (G && !reduce) G.to(shown, { v: to, duration: .9, ease: "expo.out", overwrite: true, onUpdate: apply, onComplete: () => { shown.v = to; num.textContent = `${r.lo}–${r.hi}`; } }); else { shown.v = to; apply(); num.textContent = `${r.lo}–${r.hi}`; }
      const text = msg(r);
      if (mode === "wa") send.href = "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(text);
      else if (mode === "mail") { send.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Lastra Projekt – " + t("est_k")) + "&body=" + encodeURIComponent(text); send.removeAttribute("target"); }
      else if (mode === "msgr") send.href = messenger;
      send.dataset.msg = text;
    };
    /* label reflects the channel actually available (placeholders in config.js are never used) */
    const lbl = qs("span", send);
    const setLbl = () => { lbl.dataset.i18n = mode === "wa" ? "est_wa" : mode === "mail" ? "est_mail" : "est_msgr"; lbl.textContent = t(lbl.dataset.i18n); qs(".wa-ic", send).style.display = mode === "wa" ? "" : "none"; };
    if (mode === "none") send.hidden = true;
    send.addEventListener("click", () => {
      if (mode !== "msgr") return;
      const text = send.dataset.msg, done = ok => { status.hidden = false; status.textContent = ok ? t("msgr_copied") : t("msgr_manual") + "\n\n" + text; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); else done(false);
    });
    f.addEventListener("input", update); f.addEventListener("change", update);
    document.addEventListener("lp:lang", () => { setLbl(); update(); });
    setLbl(); update();
  }

  /* ---------------- header colour over the dark 3D scenes ---------------- */
  function headerTone() {
    const story = qs(".story"), x = qs(".explore"); if (!story) return;
    /* offsets are cached (re-measured on resize / ScrollTrigger refresh) so the per-frame job never reads layout */
    let endX = 0, last = "";
    const measure = () => { endX = x ? x.offsetTop + x.offsetHeight - 70 : story.offsetTop + story.offsetHeight - 70; last = ""; };
    measure(); addEventListener("resize", measure); window.ScrollTrigger && window.ScrollTrigger.addEventListener("refresh", measure);
    const upd = () => {
      const y = scrollY, dark = y < endX && (story.classList.contains("is-dusk") || (x && x.classList.contains("is-dusk") && document.body.classList.contains("x-mode")));
      const key = (dark ? 1 : 0) + "" + (y > endX ? 1 : 0); if (key === last) return; last = key;
      document.body.classList.toggle("hero-dusk", !!dark);
      document.body.classList.toggle("past-hero", y > endX);
    };
    LP.clock ? LP.clock.add(upd) : addEventListener("scroll", upd, { passive: true });
    upd();
  }

  beforeAfter(); projects(); estimator(); headerTone();
})();
