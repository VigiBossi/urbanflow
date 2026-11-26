// Inlines assets/styles.css and assets/app.js into one self-contained HTML file
// (evora-standalone.html) that opens from disk or any host with no other files.
import { readFileSync, writeFileSync } from 'node:fs';

let html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/styles.css', 'utf8');
const js = readFileSync('assets/app.js', 'utf8').replace(/<\/script/gi, '<\\/script');

html = html.replace('<link rel="stylesheet" href="assets/styles.css" />', () => `<style>\n${css}\n</style>`);
html = html.replace('<script defer src="assets/app.js"></script>', '');
html = html.replace('</body>', () => `<script>\n${js}\n</script>\n</body>`);

writeFileSync('evora-standalone.html', html);
console.log(`evora-standalone.html — ${(html.length / 1024).toFixed(0)} KB`);
