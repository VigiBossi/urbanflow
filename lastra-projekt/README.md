# Lastra Projekt – website

Static site (HTML, CSS, vanilla JS). No build step. Libraries are vendored in `assets/js`:
Three.js r160 (+ addons), GSAP 3.15 + ScrollTrigger, Lenis 1.3.

## Run locally
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080/

## Deploy (Vercel)
Root Directory `lastra-projekt`, framework preset **Other**, no build command. `vercel.json` adds security headers and asset caching.

## Edit content – `js/config.js`
- Contact: `phone`, `phoneLink`, `whatsapp`, `email`, `address`, `officeHours`, `facebook`, `instagram`.
  Values that still look like placeholders are hidden everywhere; the quote form and the estimator then
  fall back to Facebook Messenger. Enter real values and WhatsApp / phone / e-mail switch on automatically
  (floating WhatsApp button included).
- `estimator`: size range and the duration formula per finish tier (+ the deliverables shown).
- `projects`: portfolio cards, modal gallery and phase photos (before / during / after).
- `glbModel`: optional path to `assets/models/house.glb` – offered as a third model in the 3D switcher;
  the procedural houses stay if it is missing.
- Translations (sq default, mk, en): `js/i18n.js`.

## Architecture
- `js/clock.js` – the only animation clock: `gsap.ticker` drives Lenis, ScrollTrigger and every per-frame job.
- `js/hero3d.js` – one fixed WebGL canvas: scroll story (4 build phases on a CatmullRom camera spline) +
  explore mode (OrbitControls, presets, day/dusk HDRI crossfade, model & façade switchers, hotspots, cutaway).
  Pipeline: HDRI → PMREM env, ACES (exposure 1.1), soft PCF shadows, Render → Bloom → Vignette → Output → Grain.
  Mobile (< 768 px) renders without the post chain; touch devices opt in to orbiting ("Explore in 3D").
  `prefers-reduced-motion` renders a still frame. Without WebGL 2 the real photos are shown.
- `js/home.js` – before/after slider, projects + modal, turnkey estimator.
- `js/main.js` – shell (header, menu, footer, i18n, forms, lightbox) shared by every page.

Note: the repo has no brick photo set, so brick and wood are generated procedurally; the `stone_*` set
(a blue slate tile) is re-toned at load into warm limestone.
