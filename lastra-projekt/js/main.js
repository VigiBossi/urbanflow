/* Lastra Projekt – site shell, i18n, motion and interactions (vanilla, no dependencies) */
(function () {
  const S = window.SITE, D = window.I18N, LANGS = ["sq", "mk", "en"];
  const qs = (s, r = document) => r.querySelector(s), qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const urlLang = new URLSearchParams(location.search).get("lang");
  /* storage can be blocked (private mode, sandboxed embeds): never let it stop the site */
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  let lang = LANGS.includes(urlLang) ? urlLang : store.get("lp_lang");
  if (!LANGS.includes(lang)) lang = "sq";
  if (urlLang && LANGS.includes(urlLang)) store.set("lp_lang", lang);
  const t = k => (D[lang] && D[lang][k]) || D.sq[k] || k;
  const L = o => (o && (o[lang] || o.sq)) || "";
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const small = () => innerWidth < 900;
  const pad = n => String(n).padStart(2, "0");
  /* contact channels: a value still holding a config.js placeholder is never shown or used */
  const fake = v => !v || /X|example\.|0{6,}/i.test(String(v));
  const has = { phone: !fake(S.phone) && !fake(S.phoneLink), whatsapp: !fake(S.whatsapp), email: !fake(S.email), facebook: !!S.facebook };
  const messenger = S.facebook ? "https://m.me/" + S.facebook.replace(/\/+$/, "").split("/").pop() : "";
  /* jpg path from config -> optimised webp + 800w variant */
  const webp = p => p.replace(/\.jpe?g$/i, ".webp"), webp8 = p => p.replace(/\.jpe?g$/i, "-800.webp");
  const pic = (p, alt, sizes = "100vw", cls = "", lazy = true) =>
    `<img${cls ? ` class="${cls}"` : ""} src="${webp(p)}" srcset="${webp8(p)} 800w, ${webp(p)} 1600w" sizes="${sizes}" alt="${alt.replace(/"/g, "&quot;")}" width="1600" height="1067"${lazy ? ' loading="lazy"' : ""} decoding="async">`;

  const WA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"/></svg>';
  const PH = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';
  const MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 7v18h11" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="square"/></svg>';

  const nav = [["index.html", "nav_home"], ["projects.html", "nav_projects"], ["services.html", "nav_services"], ["process.html", "nav_process"], ["about.html", "nav_about"], ["contact.html", "nav_contact"]];
  const cur = location.pathname.split("/").pop() || "index.html";
  const active = cur === "project.html" ? "projects.html" : (cur.endsWith(".html") ? cur : "index.html");
  const langBtns = () => LANGS.map(l => `<button type="button" data-lang="${l}" lang="${l}">${l.toUpperCase()}</button>`).join("");

  /* ---------------- shell: header, mobile menu, footer, quick contact ---------------- */
  function shell() {
    const hdr = qs("#site-header");
    hdr.innerHTML = `
      <a class="skip" href="#main" data-i18n="skip"></a>
      <div class="container nav-wrap">
        <a class="logo" href="index.html" aria-label="Lastra Projekt"><span class="logo-mark">${MARK}</span><span class="logo-word">Lastra<b>Projekt</b></span></a>
        <nav class="nav" aria-label="Main"><ul>${nav.slice(1).map(([h, k]) => `<li><a href="${h}"${h === active ? ' aria-current="page"' : ""}><span data-i18n="${k}"></span></a></li>`).join("")}</ul></nav>
        <div class="nav-right">
          <div class="lang" role="group" data-i18n-aria="lang">${langBtns()}</div>
          <a class="btn btn-primary btn-sm nav-cta" href="contact.html"><span data-i18n="cta_quote"></span></a>
          <button class="burger" type="button" aria-expanded="false" aria-controls="mnav"><span class="sr-only" data-i18n="menu"></span><i></i><i></i></button>
        </div>
      </div>
      <div class="scroll-progress" aria-hidden="true"><i></i></div>`;
    const m = document.createElement("div");
    m.className = "mnav"; m.id = "mnav"; m.hidden = true;
    m.innerHTML = `<div class="mnav-in">
        <nav aria-label="Mobile"><ol>${nav.map(([h, k], i) => `<li style="--i:${i}"><a href="${h}"${h === active ? ' aria-current="page"' : ""}><span class="mono">${pad(i + 1)}</span><span data-i18n="${k}"></span></a></li>`).join("")}</ol></nav>
        <div class="mnav-foot"><div class="lang" role="group" data-i18n-aria="lang">${langBtns()}</div><a class="btn btn-primary" href="contact.html"><span data-i18n="cta_quote"></span><i class="arr" aria-hidden="true"></i></a></div>
      </div>`;
    hdr.after(m);
    const year = new Date().getFullYear();
    qs("#site-footer").innerHTML = `
      <div class="container">
        <div class="f-cols">
          <div class="f-brand"><a class="logo logo-light" href="index.html" aria-label="Lastra Projekt"><span class="logo-mark">${MARK}</span><span class="logo-word">Lastra<b>Projekt</b></span></a><p data-i18n="hero_kicker"></p><p class="mono f-geo">41.79° N · 20.90° E</p></div>
          <div><h2 class="f-h mono" data-i18n="menu"></h2><ul class="flinks">${nav.map(([h, k]) => `<li><a href="${h}" data-i18n="${k}"></a></li>`).join("")}</ul></div>
          <div><h2 class="f-h mono" data-i18n="nav_contact"></h2><ul class="flinks">
            <li><a data-site="phone" href="#"></a></li><li><a data-site="email" href="#"></a></li>
            <li><a data-site="whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a></li><li><a data-site="facebook" href="#" target="_blank" rel="noopener">Facebook</a></li></ul></div>
          <div><h2 class="f-h mono" data-i18n="c_addr"></h2><ul class="flinks"><li data-site="address"></li></ul>
            <div class="lang lang-dark" role="group" data-i18n-aria="lang">${langBtns()}</div></div>
        </div>
        <p class="fine" data-i18n="fine_print"></p>
        <div class="f-word" aria-hidden="true">Lastra Projekt</div>
        <div class="f-bottom"><span>© ${year} Lastra Projekt. <span data-i18n="footer_rights"></span></span><button type="button" class="to-top"><span data-i18n="back_top"></span> ↑</button></div>
      </div>`;
    const fab = document.createElement("div");
    fab.className = "fab";
    fab.innerHTML = `<a class="fab-call" data-site="phone-icon" href="#">${PH}<span data-i18n="call"></span></a><a class="fab-wa" data-site="whatsapp" href="#" target="_blank" rel="noopener">${WA}<span>WhatsApp</span></a>`;
    document.body.appendChild(fab);
    if (!has.phone && !has.whatsapp) fab.hidden = true;

    const b = qs(".burger");
    const setMenu = o => {
      document.body.classList.toggle("nav-open", o); b.setAttribute("aria-expanded", o);
      if (o) { m.hidden = false; requestAnimationFrame(() => m.classList.add("open")); qs("a", m).focus({ preventScroll: true }); }
      else { m.classList.remove("open"); setTimeout(() => { if (!m.classList.contains("open")) m.hidden = true; }, 450); }
    };
    b.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
    addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setMenu(false); b.focus(); } });
    addEventListener("resize", () => { if (innerWidth > 1080 && document.body.classList.contains("nav-open")) setMenu(false); });
    document.addEventListener("click", e => { const btn = e.target.closest(".lang button"); if (btn) setLang(btn.dataset.lang); });
    qs(".to-top").addEventListener("click", () => {
      /* long pages: jump close to the top first so the smooth part stays short (and the 3D story isn't replayed backwards) */
      if (!reduce && scrollY > innerHeight * 3) scrollTo({ top: innerHeight * .6, behavior: "auto" });
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      qs(".logo", hdr).focus({ preventScroll: true });
    });
    /* hidden header comes back for keyboard users and when the pointer reaches the top edge */
    hdr.addEventListener("focusin", () => hdr.classList.remove("hdr-hidden"));
    if (fine) addEventListener("pointermove", e => { if (e.clientY < 60) hdr.classList.remove("hdr-hidden"); }, { passive: true });
  }

  /* ---------------- dynamic content ---------------- */
  const card = (p, i, sizes) => `
    <article class="pcard reveal" data-status="${p.status}" style="--d:${(i % 3) * 90}ms">
      <a class="pcard-link" href="project.html?id=${p.id}">
        <figure class="pcard-media">${pic(p.cover, L(p.title), sizes)}</figure>
        <div class="pcard-meta mono"><span>${pad(i + 1)}</span><span>${p.year}</span><span class="badge ${p.status}">${t("st_" + p.status)}</span></div>
        <h3 class="pcard-t">${L(p.title)}</h3>
        <p class="pcard-s">${L(p.location)} · ${p.size} m²</p>
        <span class="link"><span>${t("view")}</span><i class="arr" aria-hidden="true"></i></span>
      </a>
    </article>`;

  function renderDynamic() {
    const feat = qs("#featured");
    if (feat) feat.innerHTML = S.projects.slice(0, 3).map((p, i) => card(p, i, i === 0 ? "(max-width: 900px) 100vw, 58vw" : "(max-width: 900px) 100vw, 38vw")).join("");
    const grid = qs("#project-grid");
    if (grid) { grid.innerHTML = S.projects.map((p, i) => card(p, i, "(max-width: 900px) 100vw, 50vw")).join(""); applyFilter((qs(".filters .on") || {}).dataset?.filter || "all"); }
    qsa(".stat-num").forEach(el => { el.dataset.val = S.stats[el.dataset.stat]; el.dataset.suf = el.dataset.stat === "satisfaction" ? "" : "+"; if (!el.dataset.counted) el.textContent = el.dataset.val + el.dataset.suf; });
    qsa("[data-site]").forEach(el => {
      const k = el.dataset.site, need = k === "phone-icon" ? "phone" : k;
      if (need in has && !has[need]) { (el.closest(".cinfo li, .flinks li") || el).hidden = true; return; }
      if (k === "phone") { el.href = "tel:" + S.phoneLink; el.textContent = S.phone; }
      if (k === "phone-icon") el.href = "tel:" + S.phoneLink;
      if (k === "email") { el.href = "mailto:" + S.email; el.textContent = S.email; }
      if (k === "address") el.textContent = S.address;
      if (k === "facebook") el.href = S.facebook;
      if (k === "whatsapp") el.href = "https://wa.me/" + S.whatsapp;
      if (k === "map" && el.getAttribute("src") !== S.mapEmbed) el.src = S.mapEmbed;
    });
    const det = qs("#project-detail");
    if (det) {
      const id = new URLSearchParams(location.search).get("id");
      const p = S.projects.find(x => x.id === id) || (id ? null : S.projects[0]);
      if (!p) { det.innerHTML = `<header class="page-hero page-hero-compact"><div class="container ph-grid"><h1 class="display">${t("notfound")}</h1><a class="btn btn-primary" href="projects.html">${t("back")}</a></div></header>`; return; }
      document.title = L(p.title) + " | Lastra Projekt";
      const idx = S.projects.indexOf(p), next = S.projects[(idx + 1) % S.projects.length];
      const ph = p.phases || {};
      det.innerHTML = `
        <header class="page-hero">
          <div class="container ph-grid">
            <a class="link link-back reveal" href="projects.html"><i class="arr arr-l" aria-hidden="true"></i><span>${t("back")}</span></a>
            <h1 class="display-xl" data-split>${L(p.title)}</h1>
            <p class="lead ph-sub reveal">${L(p.desc)}</p>
          </div>
          <figure class="ph-media reveal-clip">${pic(p.cover, L(p.title), "100vw", "", false).replace("<img", '<img data-parallax=".08"')}</figure>
        </header>
        <section class="section container">
          <dl class="facts">
            <div class="reveal"><dt class="mono">${t("loc")}</dt><dd>${L(p.location)}</dd></div>
            <div class="reveal"><dt class="mono">${t("size")}</dt><dd>${p.size} m²</dd></div>
            <div class="reveal"><dt class="mono">${t("year")}</dt><dd>${p.year}</dd></div>
            <div class="reveal"><dt class="mono">${t("status")}</dt><dd><span class="badge ${p.status}">${t("st_" + p.status)}</span></dd></div>
          </dl>
          <div class="sec-head sec-head-row"><h2 class="display">${t("gallery")}</h2><span class="mono muted">${pad(p.gallery.length)}</span></div>
          <div class="gallery g-${Math.min(p.gallery.length, 4)}">${p.gallery.map((g, i) => `<button type="button" class="gitem reveal" data-full="${webp(g)}" data-cap="${L(p.title)} – ${i + 1}" aria-label="${t("gallery")} ${i + 1}: ${L(p.title)}">${pic(g, `${L(p.title)} – ${i + 1}`, i === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw")}</button>`).join("")}</div>
          ${p.compare && ph.during && ph.after ? `
          <div class="sec-head sec-head-row"><h2 class="display">${t("during")} / ${t("after")}</h2><span class="mono muted">${t("compare_hint")}</span></div>
          <div class="compare reveal" style="--pos:50%">
            ${pic(ph.after, `${L(p.title)} – ${t("after")}`, "100vw", "cmp-after")}
            <div class="cmp-before">${pic(ph.during, `${L(p.title)} – ${t("during")}`, "100vw")}</div>
            <span class="cmp-label cmp-l mono">${t("during")}</span><span class="cmp-label cmp-r mono">${t("after")}</span>
            <span class="cmp-handle" aria-hidden="true"><i></i></span>
            <input type="range" min="0" max="100" value="50" aria-label="${t("compare_hint")}: ${t("during")} / ${t("after")}">
          </div>` : ""}
          <div class="sec-head sec-head-row"><h2 class="display">${t("phases")}</h2></div>
          <div class="phases">${["before", "during", "after"].filter(k => ph[k]).map((k, i) => `<figure class="reveal" style="--d:${i * 90}ms"><button type="button" class="gitem" data-full="${webp(ph[k])}" data-cap="${t(k)}" aria-label="${t(k)}">${pic(ph[k], `${L(p.title)} – ${t(k)}`, "(max-width: 900px) 100vw, 33vw")}</button><figcaption><span class="mono">${pad(i + 1)}</span>${t(k)}</figcaption></figure>`).join("")}</div>
          <a class="next-proj reveal" href="project.html?id=${next.id}"><span class="mono">${t("view")}</span><span class="np-t">${L(next.title)}</span><i class="arr" aria-hidden="true"></i></a>
        </section>`;
      compare();
    }
  }

  function applyFilter(f) {
    qsa(".filters button").forEach(b => { b.classList.toggle("on", b.dataset.filter === f); b.setAttribute("aria-pressed", b.dataset.filter === f); });
    let n = 0;
    qsa("#project-grid .pcard").forEach(c => { const show = f === "all" || c.dataset.status === f; c.hidden = !show; if (show) n++; });
    const cnt = qs(".filter-count"); if (cnt) cnt.textContent = pad(n);
  }

  /* ---------------- i18n ---------------- */
  function splitWords(el) {
    const txt = el.textContent.trim(); el.setAttribute("aria-label", txt);
    el.innerHTML = txt.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true"><span class="wi" style="--i:${i}">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span></span>`).join(" ");
  }
  function translate() {
    document.documentElement.lang = lang;
    qsa("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    qsa("[data-i18n-alt]").forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    qsa("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    qsa("[data-split]").forEach(splitWords);
    qsa(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    if (page !== "project" && D[lang]["t_" + page]) document.title = t("t_" + page);
    const hs = qs("#hero-stage"); if (hs && !hs.textContent) hs.textContent = t("stage_construction");
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set("lp_lang", l);
    const u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.set("lang", l); history.replaceState(null, "", u); }
    renderDynamic(); translate(); qsa("[data-split]").forEach(e => e.classList.add("in")); observe();
    if (lb) lb.relabel();
    document.dispatchEvent(new CustomEvent("lp:lang", { detail: l }));
  }

  /* ---------------- reveals + counters ---------------- */
  let io;
  function countUp(el) {
    if (el.dataset.counted || reduce) return; el.dataset.counted = 1;
    const v = +el.dataset.val, suf = el.dataset.suf || "", t0 = performance.now(), dur = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(v * e) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function observe() {
    const els = qsa(".reveal:not(.in), .reveal-clip:not(.in), [data-split]:not(.in)");
    if (!("IntersectionObserver" in window) || reduce) { els.forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in"); io.unobserve(e.target);
      qsa(".stats-strip .stat-num", e.target).forEach(countUp);
    }), { threshold: .14, rootMargin: "0px 0px -6% 0px" });
    els.forEach(e => { if (!e.closest(".hero-interior")) io.observe(e); else e.classList.add("in"); });
  }

  /* ---------------- lightbox ---------------- */
  let lb = null;
  function lightbox() {
    const el = document.createElement("div");
    el.className = "lightbox"; el.hidden = true; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML = `<div class="lb-top"><span class="lb-count mono"></span><button type="button" class="lb-close"><span data-i18n="close"></span> ✕</button></div>
      <figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure>
      <button type="button" class="lb-prev lb-nav"><i class="arr arr-l" aria-hidden="true"></i></button><button type="button" class="lb-next lb-nav"><i class="arr" aria-hidden="true"></i></button>`;
    document.body.appendChild(el);
    const img = qs("img", el), cap = qs(".lb-cap", el), cnt = qs(".lb-count", el);
    let list = [], idx = 0, last = null, x0 = null;
    const show = () => { const it = list[idx]; el.classList.add("swap"); const pre = new Image(); pre.onload = pre.onerror = () => { img.src = it.src; img.alt = it.cap; cap.textContent = it.cap; cnt.textContent = `${pad(idx + 1)} ${t("of")} ${pad(list.length)}`; el.classList.remove("swap"); }; pre.src = it.src; };
    const open = g => {
      const seen = new Set(); list = qsa(".gitem").filter(x => !seen.has(x.dataset.full) && seen.add(x.dataset.full)).map(x => ({ src: x.dataset.full, cap: x.dataset.cap || "" }));
      idx = Math.max(0, list.findIndex(x => x.src === g.dataset.full)); last = g;
      show(); el.hidden = false; requestAnimationFrame(() => el.classList.add("open")); document.documentElement.classList.add("lock"); qs(".lb-close", el).focus();
    };
    const close = () => { el.classList.remove("open"); document.documentElement.classList.remove("lock"); setTimeout(() => { el.hidden = true; }, 300); last && last.focus(); };
    const go = d => { idx = (idx + d + list.length) % list.length; show(); };
    document.addEventListener("click", e => { const g = e.target.closest(".gitem"); if (g) open(g); });
    el.addEventListener("click", e => { if (e.target === el || e.target.closest(".lb-close")) close(); });
    qs(".lb-prev", el).onclick = () => go(-1); qs(".lb-next", el).onclick = () => go(1);
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener("keydown", e => {
      if (el.hidden) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1);
      if (e.key === "Tab") { const f = qsa("button", el); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    lb = { relabel() { qs(".lb-prev", el).setAttribute("aria-label", t("img_prev")); qs(".lb-next", el).setAttribute("aria-label", t("img_next")); el.setAttribute("aria-label", t("gallery")); } };
    lb.relabel();
  }

  /* ---------------- before/after compare ---------------- */
  function compare() {
    qsa(".compare").forEach(c => {
      const r = qs("input", c); if (!r || r.dataset.bound) return; r.dataset.bound = 1;
      const set = v => c.style.setProperty("--pos", v + "%");
      r.addEventListener("input", () => set(r.value));
      if (!reduce) { let shown = false; new IntersectionObserver(([e], o) => { if (e.isIntersecting && !shown) { shown = true; o.disconnect(); const t0 = performance.now(); const a = now => { const k = Math.min(1, (now - t0) / 1600); const v = 50 + Math.sin(k * Math.PI * 2) * 16 * (1 - k); set(v); r.value = v; if (k < 1) requestAnimationFrame(a); }; requestAnimationFrame(a); } }, { threshold: .5 }).observe(c); }
    });
  }

  /* ---------------- contact form (WhatsApp / e-mail, no fake success) ---------------- */
  function form() {
    const f = qs("#quote-form"); if (!f) return;
    const err = qs(".form-error", f);
    /* send channel: WhatsApp, else e-mail, else Facebook Messenger (copy + open) while the config still has placeholders */
    const mode = has.whatsapp ? "wa" : has.email ? "mail" : messenger ? "msgr" : "none";
    const submitLbl = qs('button[type="submit"] span', f), mailBtn = qs("#send-mail", f), note = qs(".form-note", f);
    const setKey = (el, k) => { if (el) { el.dataset.i18n = k; el.textContent = t(k); } };
    if (mode !== "wa" || !has.email) mailBtn.hidden = true;
    if (mode === "mail") setKey(submitLbl, "fm_mail");
    if (mode === "msgr") { setKey(submitLbl, "fm_msgr"); setKey(note, "msgr_note"); }
    if (mode === "none") qs('button[type="submit"]', f).disabled = true;
    const status = document.createElement("div"); status.className = "form-status full"; status.setAttribute("role", "status"); status.hidden = true;
    qs(".form-actions", f).after(status);
    const build = () => {
      const d = new FormData(f), miss = [];
      ["name", "phone"].forEach(n => { const ok = String(d.get(n) || "").trim(); f[n].setAttribute("aria-invalid", !ok); if (!ok) miss.push(f[n]); });
      if (miss.length) { err.textContent = t("fm_req"); err.hidden = false; miss[0].focus(); return null; }
      err.hidden = true;
      const b = f.budget.options[f.budget.selectedIndex];
      return [t("msg_intro"), "", `${t("fm_name")}: ${d.get("name")}`, `${t("fm_phone")}: ${d.get("phone")}`, `${t("fm_loc")}: ${d.get("location") || "-"}`, `${t("fm_size")}: ${d.get("size") || "-"}`, `${t("fm_budget")}: ${d.get("budget") ? b.textContent : "-"}`, `${t("fm_msg")}: ${d.get("message") || "-"}`].join("\n");
    };
    f.addEventListener("input", e => { if (e.target.getAttribute("aria-invalid") === "true" && e.target.value.trim()) e.target.setAttribute("aria-invalid", "false"); });
    const mail = m => { location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Lastra Projekt – " + t("cta_quote")) + "&body=" + encodeURIComponent(m); };
    const manual = m => { status.innerHTML = `<p>${t("msgr_manual")}</p><textarea readonly rows="7"></textarea>`; qs("textarea", status).value = m; status.hidden = false; qs("textarea", status).select(); };
    f.addEventListener("submit", e => {
      e.preventDefault(); const m = build(); if (!m) return;
      if (mode === "wa") return void window.open("https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(m), "_blank", "noopener");
      if (mode === "mail") return mail(m);
      if (mode === "msgr") {
        window.open(messenger, "_blank", "noopener");   // opened synchronously so pop-up blockers allow it
        const done = ok => { if (ok) { status.innerHTML = `<p>${t("msgr_copied")}</p>`; status.hidden = false; } else manual(m); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(m).then(() => done(true), () => done(false)); else done(false);
      }
    });
    mailBtn.addEventListener("click", () => { const m = build(); if (m) mail(m); });
  }

  /* ---------------- services index (home) ---------------- */
  function services() {
    const items = qsa(".sv-item"); if (!items.length) return;
    const pv = qs(".sv-preview"), imgs = qsa(".sv-preview img"), tag = qs(".sv-tag");
    let model = null, cur = 0;
    const preview = i => { if (i < 0) return; cur = i; imgs.forEach((im, k) => im.classList.toggle("on", k === i)); if (tag) tag.textContent = `${pad(i + 1)} / ${pad(items.length)}`; if (model) model.set(i); };
    /* interactive 3D maquette: fetched only when the block approaches the viewport; the photos stay as the fallback */
    const gl2 = () => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } };
    if (pv && "IntersectionObserver" in window && gl2()) {
      const lazy = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; lazy.disconnect();
        import("./layers3d.js").then(m => {
          model = m.mount(pv); if (!model) return; model.set(cur);
          const hint = document.createElement("span"); hint.className = "sv-hint mono"; hint.dataset.i18n = "drag_rotate"; hint.textContent = t("drag_rotate"); pv.appendChild(hint);
        }).catch(err => console.warn("3D model unavailable, showing photos", err));
      }, { rootMargin: "600px 0px" });
      lazy.observe(pv);
    }
    const openI = i => items.forEach((it, k) => { const o = k === i; it.classList.toggle("open", o); qs(".sv-btn", it).setAttribute("aria-expanded", o); if (o) preview(k); });
    items.forEach((it, i) => {
      qs(".sv-btn", it).addEventListener("click", () => openI(it.classList.contains("open") && small() ? -1 : i));
      if (fine) it.addEventListener("mouseenter", () => { if (!small()) openI(i); });
    });
    preview(0);
  }

  /* ---------------- scroll-driven motion ---------------- */
  function motion() {
    const sc = qs(".scrub");
    const steps = sc ? qsa(".scrub-steps li", sc) : [], imgs = sc ? qsa(".scrub-media img", sc) : [], bar = sc && qs(".scrub-bar i", sc), count = sc && qs(".scrub-count b", sc);
    const par = qsa("[data-parallax]"), prog = qs(".scroll-progress i"), hdr = qs("#site-header");
    let curStep = -1, tick = false, lastY = scrollY;
    const upd = () => {
      tick = false; const vh = innerHeight, y = scrollY;
      if (prog) prog.style.transform = `scaleX(${(y / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(4)})`;
      document.body.classList.toggle("scrolled", y > 20);
      const hero = qs(".hero3d"), heroEnd = hero ? hero.offsetTop + hero.offsetHeight - vh : 0;
      document.body.classList.toggle("past-hero", !hero || y > heroEnd - 10);
      if (!document.body.classList.contains("nav-open")) hdr.classList.toggle("hdr-hidden", y > 320 && y > lastY + 2 && !(hero && y < 40));
      if (y < lastY - 2) hdr.classList.remove("hdr-hidden");
      lastY = y;
      if (!reduce && !small()) par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) return; const c = (r.top + r.height / 2 - vh / 2) / vh; el.style.transform = `translate3d(0,${(c * -100 * (+el.dataset.parallax || .1)).toFixed(2)}%,0) scale(1.14)`; });
      if (sc && !small()) {
        const r = sc.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
        const i = Math.min(steps.length - 1, Math.floor(p * steps.length * .999));
        if (i !== curStep) { curStep = i; steps.forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.toggle("done", k < i); }); imgs.forEach((im, k) => im.classList.toggle("on", k === +steps[i].dataset.img)); if (count) count.textContent = pad(i + 1); }
        if (bar) bar.style.transform = `scaleX(${((i + 1) / steps.length).toFixed(3)})`;
      }
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
    addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); upd();
  }

  /* ---------------- pointer niceties (desktop only) ---------------- */
  function pointer() {
    if (!fine || reduce) return;
    document.addEventListener("pointermove", e => {
      const m = e.target.closest && e.target.closest(".magnetic"); if (!m) return;
      const r = m.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      m.style.transform = `translate(${(x * .18).toFixed(1)}px,${(y * .28).toFixed(1)}px)`; m.classList.add("mag-on");
    }, { passive: true });
    document.addEventListener("pointerout", e => { const m = e.target.closest && e.target.closest(".magnetic"); if (m && !m.contains(e.relatedTarget)) { m.style.transform = ""; m.classList.remove("mag-on"); } });
    /* "View" chip that follows the pointer over project cards */
    const chip = document.createElement("div"); chip.className = "cursor-chip"; chip.setAttribute("aria-hidden", "true"); document.body.appendChild(chip);
    let tx = 0, ty = 0, x = 0, y = 0, on = false, raf = 0;
    const loop = () => { x += (tx - x) * .2; y += (ty - y) * .2; chip.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${on ? 1 : .2})`; if (on || Math.abs(tx - x) > .5) raf = requestAnimationFrame(loop); else raf = 0; };
    document.addEventListener("pointermove", e => {
      tx = e.clientX; ty = e.clientY; const c = e.target.closest && e.target.closest(".pcard-media, .gitem");
      if (!!c !== on) { on = !!c; chip.classList.toggle("on", on); chip.textContent = t("view_short"); if (on && !raf) { x = tx; y = ty; } }
      if (!raf && on) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ---------------- page transitions ---------------- */
  function transitions() {
    addEventListener("pageshow", () => document.body.classList.remove("leaving"));
    if (reduce) return;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]"); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname) || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault(); document.body.classList.add("leaving"); setTimeout(() => { location.href = u.href; }, 380);
    });
  }

  shell(); renderDynamic(); translate();
  qsa(".filters button").forEach(b => b.addEventListener("click", () => applyFilter(b.dataset.filter)));
  lightbox(); form(); services(); observe(); motion(); pointer(); transitions();
  requestAnimationFrame(() => document.body.classList.add("ready"));
  window.__lpLang = () => lang;
})();
