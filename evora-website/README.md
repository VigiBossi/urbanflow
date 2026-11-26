# Evora — Bath & Design · Website

Luxury showroom website for **Evora — Bath & Design**, a sanitaryware and ceramic tiles showroom in Gostivar, North Macedonia.
It has real-time 3D scenes built entirely from procedural Three.js geometry and canvas textures. There are no `.glb`, HDR or image files.

## Run it

The built site is committed, so nothing needs installing:

- **Open** `index.html` directly in a browser (works from `file://`), **or**
- serve the folder with any static server, e.g.

```bash
python3 -m http.server 5173
```

You can deploy by uploading `index.html` and `assets/` to any static host (Netlify, GitHub Pages, cPanel…).

## Edit business details

Phone, WhatsApp number, Facebook URL, street address and opening hours are in **`src/config.js`**. After editing, rebuild:

```bash
npm install
```

```bash
npm run build
```

`npm run dev` rebuilds on save and serves at http://localhost:5173.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup (all sections) |
| `assets/styles.css` | Design system & layout (edited directly, not built) |
| `assets/app.js` | Bundled JS output from `npm run build` — don't edit by hand |
| `src/config.js` | Contact details, hours, WhatsApp number |
| `src/i18n.js` | EN / SQ / MK / TR translations |
| `src/products.js` | Catalog (names, dimensions, finishes, 4-language descriptions) |
| `src/illustrations.js` | SVG line drawings for product cards |
| `src/textures.js` | Procedural marble / travertine / concrete / limestone canvas textures |
| `src/finishes.js` | Finish & slab definitions, shared finish state |
| `src/three/stage.js` | Renderer host: PMREM studio reflections, resize, off-screen pause, adaptive resolution, disposal |
| `src/three/fixture.js` | Pedestal basin + arched floor mixer with live PBR finish transitions |
| `src/three/tiles.js` | Tilting slab inspector with a sweeping rect-area light |
| `src/main.js` | UI: language switcher, catalog/filters, quick view, inquiry drawer, WhatsApp, booking, reveal |

## Performance notes

- Each WebGL scene renders only while it is on screen and the tab is visible. The studio scenes are created lazily when that section approaches.
- Pixel ratio is capped (1.5 on phones) and steps down automatically if frames get slow.
- With `prefers-reduced-motion`, idle motion, floating and the light sweep are off, and frames render only when something changes.
- Finish changes tween material values without shader recompiles.
- On `pagehide`, geometries, materials, textures and render targets are disposed.
