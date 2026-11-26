/* Lastra Projekt – the ONE animation clock for every page.
   gsap.ticker owns the only requestAnimationFrame. Lenis is slaved to it, ScrollTrigger is
   updated from Lenis, and every other per-frame job (WebGL render, DOM lerps, counters)
   subscribes through LP.clock.add() instead of calling requestAnimationFrame itself. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const g = window.gsap;
  const jobs = new Set();
  const LP = (window.LP = window.LP || {});
  LP.reduce = reduce;
  LP.ready = !!g;

  if (!g) {
    /* GSAP failed to load: keep the page fully usable with native scroll, run jobs once. */
    LP.clock = { add: fn => { try { fn(performance.now() / 1000, 16); } catch (e) {} return () => {}; }, remove() {} };
    LP.scrollTo = (y) => window.scrollTo({ top: typeof y === "number" ? y : (y.getBoundingClientRect().top + scrollY), behavior: "auto" });
    LP.scrollY = () => window.scrollY;
    return;
  }

  if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
  g.ticker.lagSmoothing(0);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.1, syncTouch: false, anchors: { offset: -72 } });
    if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
  }
  LP.lenis = lenis;

  /* the single frame callback */
  g.ticker.add((time, delta) => {
    if (lenis) lenis.raf(time * 1000);
    for (const fn of jobs) fn(time, delta);
  });

  LP.clock = {
    add(fn) { jobs.add(fn); return () => jobs.delete(fn); },
    remove(fn) { jobs.delete(fn); }
  };
  LP.scrollY = () => (lenis ? lenis.scroll : window.scrollY);
  LP.scrollTo = (target, opts = {}) => {
    if (lenis) return lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4), ...opts });
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };
  LP.stopScroll = () => lenis && lenis.stop();
  LP.startScroll = () => lenis && lenis.start();

  /* scroll listeners go through here so they fire from Lenis (same frame) or native scroll */
  LP.onScroll = fn => { if (lenis) lenis.on("scroll", () => fn(lenis.scroll)); else addEventListener("scroll", () => fn(window.scrollY), { passive: true }); };

  document.addEventListener("visibilitychange", () => { if (document.hidden) g.ticker.sleep(); else g.ticker.wake(); });
})();
