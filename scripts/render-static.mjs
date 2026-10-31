// Copies a built kb page into rendered/ as one self-contained HTML file: stylesheets inlined,
// client scripts and preloads dropped. The desk reads it without running the site.
//   pnpm build && node scripts/render-static.mjs kb/incidents/4471-split
import fs from 'node:fs';
import path from 'node:path';

const route = process.argv[2];
if (!route) throw new Error('usage: node scripts/render-static.mjs <route under build/>');

const build = path.resolve('build');
const pageDir = path.join(build, route);
let html = fs.readFileSync(path.join(pageDir, 'index.html'), 'utf8');

let inlined = 0;
html = html.replace(/<link href="([^"]+)" rel="stylesheet">/g, (_, href) => {
  inlined++;
  return `<style>${fs.readFileSync(path.resolve(pageDir, href), 'utf8')}</style>`;
});
html = html.replace(/[ \t]*<link href="[^"]+" rel="modulepreload">\s*/g, '');
html = html.replace(/\s*<script>[\s\S]*?<\/script>/g, '');
if (!inlined) throw new Error('no stylesheet found to inline');

const out = path.join('rendered', `${route.replace(/\//g, '-')}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out}: ${inlined} stylesheets inlined, ${html.length} bytes`);
