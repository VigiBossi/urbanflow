# Lastra Projekt – website

Static site (HTML, CSS, vanilla JS, Three.js r160 vendored in `assets/js`). No build step.

## Run locally
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080/

## Deploy (Vercel)
Import the repo in Vercel, set **Root Directory** to `lastra-projekt`, framework preset **Other**, no build command.
`vercel.json` adds security headers and asset caching.

## Content to finish (`js/config.js`)
- `phone`, `phoneLink`, `whatsapp`, `email`, `address` are placeholders. While they are, the site hides
  phone/WhatsApp/e-mail and the quote form goes through Facebook Messenger instead.
  Enter real values and WhatsApp + e-mail switch back on automatically.
- `stats` (years / houses / satisfaction) are placeholders.
- Projects 2 and 3 use stock photos; replace with real projects and photos.

## 3D
- `js/hero3d.js` – scroll-driven hero (construction → finished → dusk → interior), photo fallback.
- `js/layers3d.js` – interactive house model in the home services section; each service builds its
  layer. Loaded only when the section approaches the viewport and WebGL 2 is available; photos are the fallback.
