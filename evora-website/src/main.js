import { CONFIG } from './config.js';
import { LANGS, t, setLang, getLang, detectLang, onLangChange } from './i18n.js';
import { PRODUCTS, CATEGORIES, byId } from './products.js';
import { productArt } from './illustrations.js';
import { stoneDataURL } from './textures.js';
import {
  FINISHES, FINISH_ORDER, getFinishState, setFinish, onFinishChange, SLABS, SLAB_NAMES, SURFACES,
} from './finishes.js';
import { webglAvailable, reducedMotion, coarsePointer } from './three/stage.js';
import { createFixtureScene } from './three/fixture.js';
import { createTileInspector } from './three/tiles.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

// ───────────────────────── Language switcher ─────────────────────────
function initLanguage() {
  $$('.lang').forEach((group) => {
    group.innerHTML = LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="false">${l.toUpperCase()}</button>`).join('');
    group.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
  });
  onLangChange((lang) => {
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  });
}

// ───────────────────────── Navbar ─────────────────────────
function initNav() {
  const nav = $('.nav');
  const burger = $('#burger');
  const links = $('#nav-links');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // active section highlight
  const sections = ['collection', 'studio', 'showroom', 'contact'].map((id) => document.getElementById(id));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        $$('.nav__links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

// ───────────────────────── Marquee ─────────────────────────
function renderMarquee() {
  const words = CATEGORIES.slice(1).map((c) => t(`cat.${c}`));
  const row = words.map((w) => `<span>${esc(w)}</span><i>✦</i>`).join('');
  $('#marquee').innerHTML = row + row + row + row;
}

// ───────────────────────── Finish switchers ─────────────────────────
function initFinishUI() {
  const renderSwatches = () => {
    const state = getFinishState();
    $$('[data-finish-switcher]').forEach((el) => {
      el.innerHTML = ['metal', 'ceramic'].map((group) => `
        <div class="swatch-group" role="radiogroup" aria-label="${esc(t(group === 'metal' ? 'hero.fittings' : 'hero.basin'))}">
          <span class="swatch-group__label">${esc(t(group === 'metal' ? 'hero.fittings' : 'hero.basin'))}</span>
          ${FINISH_ORDER.filter((id) => FINISHES[id].group === group).map((id) => `
            <button type="button" class="swatch" role="radio" data-finish="${id}" aria-checked="${state[group] === id}"
              title="${esc(t(`finish.${id}`))}" aria-label="${esc(t(`finish.${id}`))}" style="--sw:${FINISHES[id].swatch}"></button>`).join('')}
        </div>`).join('<span class="swatch-sep" aria-hidden="true"></span>');
    });
    $$('[data-finish-list]').forEach((el) => {
      el.innerHTML = FINISH_ORDER.map((id) => `
        <button type="button" class="finish-card" data-finish="${id}" aria-pressed="${state[FINISHES[id].group] === id}">
          <span class="finish-card__chip" style="--sw:${FINISHES[id].swatch}"></span>
          <span class="finish-card__text"><strong>${esc(t(`finish.${id}`))}</strong><small>${esc(t(`finish.${id}.d`))}</small></span>
          <span class="finish-card__group">${esc(t(FINISHES[id].group === 'metal' ? 'hero.fittings' : 'hero.basin'))}</span>
        </button>`).join('');
    });
    const nameEl = $('[data-finish-name]');
    if (nameEl) nameEl.textContent = `${t(`finish.${state.metal}`)} · ${t(`finish.${state.ceramic}`)}`;
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-finish]');
    if (b) setFinish(b.dataset.finish);
  });
  onFinishChange(renderSwatches);
  onLangChange(renderSwatches);
}

// ───────────────────────── Inquiry (cart) ─────────────────────────
const inquiry = {
  items: store.get('evora.inquiry', []),
  save() { store.set('evora.inquiry', this.items); renderInquiry(); },
  add(id, qty = 1) {
    const it = this.items.find((i) => i.id === id);
    if (it) it.qty = Math.min(99, it.qty + qty);
    else this.items.push({ id, qty });
    this.save();
  },
  setQty(id, qty) {
    const it = this.items.find((i) => i.id === id);
    if (!it) return;
    if (qty <= 0) this.items = this.items.filter((i) => i.id !== id);
    else it.qty = Math.min(99, qty);
    this.save();
  },
  clear() { this.items = []; this.save(); },
  count() { return this.items.reduce((n, i) => n + i.qty, 0); },
};
inquiry.items = inquiry.items.filter((i) => byId(i.id) && Number.isFinite(i.qty) && i.qty > 0);

function thumbFor(p, size = 'sm') {
  if (p.art === 'tile') return `<img src="${stoneDataURL(p.stone, size === 'sm' ? 160 : 520)}" alt="" />`;
  return productArt(p);
}

function inquiryMessage() {
  const lines = [t('wa.inquiryIntro'), ''];
  inquiry.items.forEach((i) => {
    const p = byId(i.id);
    lines.push(`• ${i.qty} × ${p.name} — ${p.dims}, ${t(p.finish)}`);
  });
  const name = $('#inq-name').value.trim();
  const note = $('#inq-note').value.trim();
  if (note) lines.push('', `${t('wa.note')}: ${note}`);
  if (name) lines.push('', `${t('wa.name')}: ${name}`);
  lines.push('', t('wa.thanks'));
  return lines.join('\n');
}

function renderInquiry() {
  const n = inquiry.count();
  $('#bag-count').textContent = n;
  $('#bag-btn').classList.toggle('has-items', n > 0);
  $('#drawer-count').textContent = t('drawer.items', { n });
  const empty = inquiry.items.length === 0;
  $('#drawer-empty').hidden = !empty;
  $('#drawer-foot').hidden = empty;
  $('#drawer-list').innerHTML = inquiry.items.map((i) => {
    const p = byId(i.id);
    return `<li class="line-item" data-id="${p.id}">
      <div class="line-item__thumb">${thumbFor(p)}</div>
      <div class="line-item__info">
        <strong>${esc(p.name)}</strong>
        <span>${esc(p.dims)} · ${esc(t(p.finish))}</span>
        <div class="line-item__row">
          <div class="qty qty--sm">
            <button type="button" data-dec aria-label="${esc(t('modal.decrease'))}">−</button>
            <output>${i.qty}</output>
            <button type="button" data-inc aria-label="${esc(t('modal.increase'))}">+</button>
          </div>
          <button type="button" class="text-btn" data-remove>${esc(t('drawer.remove'))}</button>
        </div>
      </div>
    </li>`;
  }).join('');
  updateSendLink();
  $$('[data-add]').forEach((b) => {
    const added = inquiry.items.some((i) => i.id === b.dataset.add);
    b.classList.toggle('is-added', added);
  });
}

function updateSendLink() {
  if (inquiry.items.length) $('#inq-send').href = waUrl(inquiryMessage());
}

let lastFocus = null;
function openDrawer() {
  const d = $('#drawer');
  lastFocus = document.activeElement;
  $('#scrim').hidden = false;
  d.inert = false;
  d.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    d.classList.add('is-open');
    $('#scrim').classList.add('is-open');
  });
  $('#bag-btn').setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  setTimeout(() => $('#drawer-close').focus(), 50);
}
function closeDrawer() {
  const d = $('#drawer');
  d.classList.remove('is-open');
  $('#scrim').classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  d.inert = true;
  $('#bag-btn').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
  setTimeout(() => { $('#scrim').hidden = true; }, 400);
  lastFocus?.focus?.();
}

function initDrawer() {
  $('#bag-btn').addEventListener('click', openDrawer);
  $('#drawer-close').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#drawer-browse').addEventListener('click', closeDrawer);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#drawer').classList.contains('is-open')) closeDrawer(); });
  $('#drawer-list').addEventListener('click', (e) => {
    const li = e.target.closest('.line-item');
    if (!li) return;
    const it = inquiry.items.find((i) => i.id === li.dataset.id);
    if (e.target.closest('[data-inc]')) inquiry.setQty(it.id, it.qty + 1);
    if (e.target.closest('[data-dec]')) inquiry.setQty(it.id, it.qty - 1);
    if (e.target.closest('[data-remove]')) inquiry.setQty(it.id, 0);
  });
  $('#inq-clear').addEventListener('click', () => inquiry.clear());
  ['#inq-name', '#inq-note'].forEach((s) => $(s).addEventListener('input', updateSendLink));
  // keep focus inside drawer
  $('#drawer').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button, a[href], input, textarea', $('#drawer')).filter((el) => !el.closest('[hidden]'));
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

function addToInquiry(id, qty = 1, origin) {
  inquiry.add(id, qty);
  toast(`${t('toast.added')} — ${byId(id).name}`);
  const bag = $('#bag-btn');
  bag.classList.remove('bump');
  void bag.offsetWidth;
  bag.classList.add('bump');
  if (origin && !reducedMotion()) flyToBag(origin);
}

function flyToBag(origin) {
  const from = origin.getBoundingClientRect();
  const to = $('#bag-count').getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'fly-dot';
  dot.style.left = `${from.left + from.width / 2}px`;
  dot.style.top = `${from.top + from.height / 2}px`;
  document.body.appendChild(dot);
  dot.animate([
    { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    { transform: `translate(${to.left - from.left - from.width / 2}px, ${to.top - from.top - from.height / 2}px) translate(-50%,-50%) scale(.4)`, opacity: 0.2 },
  ], { duration: 650, easing: 'cubic-bezier(.6,0,.3,1)' }).onfinish = () => dot.remove();
}

// ───────────────────────── Catalog ─────────────────────────
let activeCat = 'all';

function renderFilters() {
  $('#filters').innerHTML = CATEGORIES.map((c) => {
    const n = c === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c).length;
    return `<button type="button" role="tab" class="filter" data-cat="${c}" aria-selected="${c === activeCat}">
      ${esc(t(`cat.${c}`))}<sup>${n}</sup></button>`;
  }).join('');
}

function renderGrid() {
  const grid = $('#product-grid');
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <article class="card" data-cat="${p.cat}" style="--i:${i % 6}">
      <div class="card__tilt">
        <button type="button" class="card__media ${p.art === 'tile' ? 'card__media--tile' : ''}" data-quick="${p.id}" aria-label="${esc(t('card.quick'))}: ${esc(p.name)}">
          ${thumbFor(p, 'lg')}
          <span class="card__badge">${esc(p.dims)}</span>
          <span class="card__finish"><i style="--sw:${(FINISHES[p.accent] || FINISHES.gold).swatch}"></i>${esc(t(p.finish))}</span>
          <span class="card__quick">${esc(t('card.quick'))}</span>
        </button>
      </div>
      <div class="card__body">
        <p class="card__cat">${esc(t(`cat.${p.cat}`))}</p>
        <h3 class="card__name">${esc(p.name)}</h3>
        <button type="button" class="card__add" data-add="${p.id}">
          <span class="card__add-label">${esc(t('card.add'))}</span>
          <span class="card__add-done">${esc(t('card.added'))} ✓</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
      </div>
    </article>`).join('');
  applyFilter(false);
  renderInquiry();
  bindTilt();
}

function applyFilter(animate = true) {
  let shown = 0;
  $$('.card').forEach((card) => {
    const show = activeCat === 'all' || card.dataset.cat === activeCat;
    card.hidden = !show;
    if (show) {
      shown++;
      if (animate && !reducedMotion()) {
        card.classList.remove('is-entering');
        void card.offsetWidth;
        card.classList.add('is-entering');
      }
    }
  });
  $('#col-count').textContent = t('col.count', { n: shown });
  $$('.filter').forEach((f) => f.setAttribute('aria-selected', String(f.dataset.cat === activeCat)));
}

function bindTilt() {
  if (coarsePointer || reducedMotion()) return;
  $$('.card__tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

function initCatalog() {
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    activeCat = b.dataset.cat;
    applyFilter(true);
  });
  $('#filters').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = $$('.filter');
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });
  $('#product-grid').addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { addToInquiry(add.dataset.add, 1, add); return; }
    const q = e.target.closest('[data-quick]');
    if (q) openQuickView(q.dataset.quick);
  });
}

// ───────────────────────── Quick view ─────────────────────────
let qv = { id: null, qty: 1 };
function renderQuickView() {
  const p = byId(qv.id);
  if (!p) return;
  $('#qv-media').innerHTML = thumbFor(p, 'lg');
  $('#qv-media').classList.toggle('modal__media--tile', p.art === 'tile');
  $('#qv-cat').textContent = t(`cat.${p.cat}`);
  $('#qv-title').textContent = p.name;
  $('#qv-desc').textContent = p.desc[getLang()] || p.desc.en;
  $('#qv-spec').innerHTML = [
    ['modal.dimensions', p.dims], ['modal.finish', t(p.finish)], ['modal.material', t(p.material)], ['modal.category', t(`cat.${p.cat}`)],
  ].map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#qv-qty').textContent = qv.qty;
}
function openQuickView(id) {
  qv = { id, qty: 1 };
  renderQuickView();
  const dlg = $('#quick-view');
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
  document.body.classList.add('modal-open');
}
function initQuickView() {
  const dlg = $('#quick-view');
  const close = () => { dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  dlg.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) close(); });
  $('#qv-minus').addEventListener('click', () => { qv.qty = Math.max(1, qv.qty - 1); $('#qv-qty').textContent = qv.qty; });
  $('#qv-plus').addEventListener('click', () => { qv.qty = Math.min(99, qv.qty + 1); $('#qv-qty').textContent = qv.qty; });
  $('#qv-add').addEventListener('click', (e) => { addToInquiry(qv.id, qv.qty, e.currentTarget); close(); });
  onLangChange(() => { if (dlg.open) renderQuickView(); });
}

// ───────────────────────── Material studio UI ─────────────────────────
const slabState = { slab: 'calacatta', surface: 'polished' };
let tileInspector = null;

function renderStudioUI() {
  $('#slab-list').innerHTML = Object.keys(SLABS).map((id) => `
    <button type="button" class="slab-btn" data-slab="${id}" aria-pressed="${slabState.slab === id}">
      <img src="${stoneDataURL(SLABS[id].stone, 96)}" alt="" /><span>${esc(SLAB_NAMES[id])}</span>
    </button>`).join('');
  $('#surface-seg').innerHTML = Object.keys(SURFACES).map((id) => `
    <button type="button" role="radio" data-surface="${id}" aria-checked="${slabState.surface === id}">${esc(t(`finish.${id}`))}</button>`).join('');
  const s = SLABS[slabState.slab];
  $('#slab-spec').innerHTML = [
    ['studio.format', `${s.format[0]} × ${s.format[1]} cm`],
    ['studio.thickness', `${s.thickness} mm`],
    ['studio.surface', t(`finish.${slabState.surface}`)],
    ['studio.use', t(s.use)],
  ].map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('');
}

function initStudioUI() {
  $('#slab-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-slab]');
    if (!b) return;
    slabState.slab = b.dataset.slab;
    tileInspector?.setSlab(slabState.slab);
    renderStudioUI();
  });
  $('#surface-seg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-surface]');
    if (!b) return;
    slabState.surface = b.dataset.surface;
    tileInspector?.setSurface(slabState.surface);
    renderStudioUI();
  });
  $('#auto-light').addEventListener('change', (e) => tileInspector?.setAutoLight(e.target.checked));
  $('#add-slab').addEventListener('click', (e) => addToInquiry(SLABS[slabState.slab].product, 1, e.currentTarget));
  onLangChange(renderStudioUI);
}

// ───────────────────────── About visuals ─────────────────────────
function paintAbout() {
  $('#arch-a').style.backgroundImage = `url(${stoneDataURL('travertine', 640, 1.4)})`;
  $('#arch-b').style.backgroundImage = `url(${stoneDataURL('calacatta', 480, 1.2)})`;
}

// ───────────────────────── Contact & booking ─────────────────────────
function renderContact() {
  const addr = [CONFIG.street, `${CONFIG.postcode} ${t('contact.city')}`, t('contact.country')].filter(Boolean);
  $('#addr').innerHTML = addr.map(esc).join('<br>');
  const h = CONFIG.hours;
  $('#hours').innerHTML = [
    ['hours.weekdays', h.weekdays], ['hours.saturday', h.saturday], ['hours.sunday', h.sunday],
  ].map(([k, v]) => `<li><span>${esc(t(k))}</span><span>${esc(v || t('hours.closed'))}</span></li>`).join('');
  const interests = ['sinks', 'toilets', 'faucets', 'showers', 'vanities', 'tiles'];
  const chosen = new Set($$('#interest-chips input:checked').map((i) => i.value));
  $('#interest-chips').innerHTML = [...interests.map((c) => `cat.${c}`), 'interest.complete'].map((k) => `
    <label class="chip"><input type="checkbox" value="${k}" ${chosen.has(k) ? 'checked' : ''}/><span>${esc(t(k))}</span></label>`).join('');
  $('#wa-link').href = waUrl(t('wa.bookIntro'));
}

function initContact() {
  $('#phone-link').href = `tel:${CONFIG.phoneHref}`;
  $('#phone-link').textContent = CONFIG.phoneDisplay;
  $('#call-link').href = `tel:${CONFIG.phoneHref}`;
  $('#fb-link').href = CONFIG.facebook;
  $('#maps-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  $('#year').textContent = new Date().getFullYear();
  const dateInput = $('#booking [name="date"]');
  const today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  $('#booking').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.name.value.trim();
    const date = f.date.value;
    const err = $('#book-error');
    if (!name || !date) {
      err.textContent = t('book.required');
      err.hidden = false;
      (!name ? f.name : f.date).focus();
      return;
    }
    err.hidden = true;
    const interests = $$('#interest-chips input:checked').map((i) => t(i.value));
    const dateFmt = new Date(`${date}T12:00:00`).toLocaleDateString(getLang(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const lines = [
      t('wa.bookIntro'), '',
      `${t('wa.name')}: ${name}`,
      `${t('wa.date')}: ${dateFmt}`,
      `${t('wa.time')}: ${t(f.time.value)}`,
    ];
    if (interests.length) lines.push(`${t('wa.interest')}: ${interests.join(', ')}`);
    lines.push('', t('wa.thanks'));
    window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
  });

  // "Book showroom visit" buttons focus the booking form
  $$('[data-book]').forEach((a) => a.addEventListener('click', () => {
    setTimeout(() => $('#booking [name="name"]').focus({ preventScroll: true }), reducedMotion() ? 0 : 700);
  }));
}

// ───────────────────────── Scroll reveal ─────────────────────────
function initReveal() {
  const els = $$('.reveal');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el, i) => {
    el.style.setProperty('--d', `${(i % 4) * 70}ms`);
    io.observe(el);
  });
}

// ───────────────────────── 3D scenes ─────────────────────────
function initScenes() {
  const scenes = [];
  if (!webglAvailable()) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  const boot = (fn) => { try { scenes.push(fn()); } catch (err) { console.error(err); document.documentElement.classList.add('no-webgl'); } };
  boot(() => createFixtureScene($('#hero-3d')));

  // Studio scenes are created lazily when the section approaches the viewport.
  const studio = $('#studio');
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    boot(() => createFixtureScene($('#studio-3d'), { closeUp: true }));
    boot(() => {
      tileInspector = createTileInspector($('#tiles-3d'));
      tileInspector.setSlab(slabState.slab);
      tileInspector.setSurface(slabState.surface);
      tileInspector.setAutoLight($('#auto-light').checked);
      return tileInspector;
    });
  }, { rootMargin: '600px 0px' });
  io.observe(studio);

  window.addEventListener('pagehide', (e) => {
    if (e.persisted) return; // keep scenes alive in the back/forward cache
    scenes.forEach((s) => s.dispose());
  });
}

// ───────────────────────── Boot ─────────────────────────
function init() {
  initLanguage();
  initNav();
  initFinishUI();
  initDrawer();
  initCatalog();
  initQuickView();
  initStudioUI();
  initContact();

  onLangChange(() => {
    renderMarquee();
    renderFilters();
    renderGrid();
    renderContact();
    renderInquiry();
  });
  setLang(detectLang());
  paintAbout();
  initReveal();
  initScenes();
  document.documentElement.classList.add('is-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
