# Evora — Bath & Design · Website

Luxury showroom website for **Evora — Bath & Design**, a sanitaryware and ceramic tiles showroom in Gostivar, North Macedonia.
It includes an interactive 3D showroom built entirely from procedural Three.js geometry and canvas-generated PBR maps. No `.glb`, HDR or image files are required. Real `.glb` models can optionally replace any product (see below).

## Run it

The built site is committed, so nothing needs installing:

- **`evora-standalone.html`**: the whole site in one file. Double-click it, or upload it on its own.
- **`index.html` + `assets/`**: the same site as separate files, for any static host. You can also run it locally:

```bash
python3 -m http.server 5173
```

## Edit & rebuild

Business details (phone, WhatsApp, Facebook, address, hours) are in **`src/config.js`**.

```bash
npm install
```

```bash
npm run build
```

`npm run build` bundles `src/` into `assets/app.js` and regenerates `evora-standalone.html`.
`npm run dev` rebuilds on save and serves at http://localhost:5173.

## 3D showroom features

- **Six products**, one module each in `src/three/models/`: Basin & Faucet, Rain Shower (with real transmission glass), Vanity & backlit LED Mirror, freestanding Bathtub, Tile Wall, and Wall-hung WC.
  - The WC lets the catalog's toilets open in 3D as well.
- **Finishes** (Brushed Gold, Matte Black, Brushed Chrome, Travertine, Matte White Porcelain) tween the metal, ceramic and stone materials live.
  - Travertine switches stone surfaces to travertine; Matte White switches them to Calacatta marble.
- **Camera:** damped orbit (never below the floor), with wheel zoom after clicking into the viewer, pinch zoom on touch, and the presets Front / 3/4 Studio / Detail / Reset.
- **Water:** an animated stream from the faucet or tub filler, rain from the shower head, ripples, and a rising fill in the bathtub. It is disabled on the Tile Wall and WC.
- **Lighting:** Warm 3000K, Daylight 5500K and Evening. Evening dims the room so the LED mirror halo and the metallic rim highlights stand out.
- **Dimensions:** live cm callouts. **Hotspots:** numbered pins with translated spec cards.
- **"View in 3D"** on every catalog card opens the matching model, with its finishes (and, for tiles, its stone) already selected.
- The **Material Studio** slab inspector shares the same albedo/normal/roughness maps and follows the lighting preset.

## Optional real models

Put `<slot>.glb` in `assets/models/` and list the slot in `assets/models/manifest.json`. See `assets/models/README.md` for details. Real models are fetched only over http(s); from `file://` the procedural models are used, and no requests are made either way unless the manifest lists them.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup |
| `assets/styles.css` | Design system & layout (edited directly) |
| `assets/app.js` | Bundled JS (generated; don't edit by hand) |
| `src/config.js` | Contact details, hours, WhatsApp number |
| `src/i18n.js` | EN / SQ / MK / TR translations (UI, 3D controls, hotspot cards) |
| `src/products.js` | Catalog data and the `VIEW_3D` product → model/finish map |
| `src/finishes.js` | Finish, lighting-preset and slab definitions; shared stores |
| `src/textures.js` | Procedural stone/wood/metal/porcelain albedo, normal & roughness maps |
| `src/three/stage.js` | Renderer host: ACES tone mapping, PMREM softbox studio, off-screen pause, adaptive resolution |
| `src/three/materials.js` | Shared PBR material library and finish transitions |
| `src/three/fixture.js` | The showcase engine: switching, camera, lighting, dimensions, hotspots, GLB loading |
| `src/three/water.js` | Stream, rain, ripple and tub-fill effects |
| `src/three/models/*.js` | One procedural model per product |
| `src/three/tiles.js` | Material Studio slab inspector |
| `src/main.js` | UI wiring: language, catalog, quick view, inquiry drawer, WhatsApp, booking, 3D controls |

## Performance notes

- Each canvas renders only while on screen and while the tab is visible. The studio scenes are created lazily.
- Pixel ratio is capped (1.5 on phones) and steps down automatically if frames get slow. Geometry and shadow-map detail are reduced on phones.
- Switching products disposes the old model's geometries and per-model materials. Shared library materials are reused.
- With `prefers-reduced-motion`, idle motion, transitions and glides become instant, and frames render only when something changes.
