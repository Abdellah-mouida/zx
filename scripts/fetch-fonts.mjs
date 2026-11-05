// Downloads the three self-hosted variable faces into public/fonts/.
// Run: npm run fonts
//
// Source: the @fontsource-variable packages on jsDelivr (a Google Fonts
// mirror). All three faces are OFL-1.1, so self-hosting is permitted.
//
// Fontsource's "standard" file carries every axis the face has; the
// per-axis files (…-wght-…, …-wdth-…) are subsets. Archivo needs all
// axes because DESIGN.md §4 drives both `wght` and `wdth`.
//
// The woff2 files are committed, so a clean checkout builds with no
// network access. Re-run this only to update a face.

import { mkdir, writeFile } from 'node:fs/promises';

const OUT = new URL('../public/fonts/', import.meta.url);

const FACES = [
  { pkg: 'archivo', out: 'archivo-var.woff2', axes: 'wght 100-900, wdth 62-125' },
  { pkg: 'manrope', out: 'manrope-var.woff2', axes: 'wght 200-800' },
  { pkg: 'jetbrains-mono', out: 'jetbrains-mono-var.woff2', axes: 'wght 100-800' },
];

async function latest(pkg) {
  const r = await fetch(`https://registry.npmjs.org/@fontsource-variable/${pkg}/latest`);
  if (!r.ok) throw new Error(`registry ${r.status} for ${pkg}`);
  return (await r.json()).version;
}

/**
 * Resolve the real filename from the published file list instead of
 * guessing it. Multi-axis faces ship "standard"; single-axis faces ship
 * only "wght". Guessing broke once already.
 */
async function resolveFile(pkg, v) {
  const r = await fetch(`https://data.jsdelivr.com/v1/packages/npm/@fontsource-variable/${pkg}@${v}`);
  if (!r.ok) throw new Error(`file list ${r.status} for ${pkg}`);
  const tree = await r.json();
  const flat = (nodes, path = '') =>
    nodes.flatMap((n) => (n.type === 'directory' ? flat(n.files, `${path}/${n.name}`) : [`${path}/${n.name}`]));

  const candidates = flat(tree.files).filter(
    (f) =>
      f.endsWith('.woff2') &&
      f.includes('-latin-') &&
      !f.includes('latin-ext') &&
      f.includes('-normal.'),
  );

  // "standard" carries every axis, so prefer it where it exists.
  const pick = candidates.find((f) => f.includes('-standard-')) ?? candidates[0];
  if (!pick) throw new Error(`no latin woff2 found for ${pkg}`);
  return pick;
}

await mkdir(OUT, { recursive: true });

for (const face of FACES) {
  const v = await latest(face.pkg);
  const file = await resolveFile(face.pkg, v);
  const url = `https://cdn.jsdelivr.net/npm/@fontsource-variable/${face.pkg}@${v}${file}`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(new URL(face.out, OUT), buf);

  const kb = String(Math.round(buf.length / 1024)).padStart(4);
  console.log(`${face.out.padEnd(26)} ${kb} KB   v${v}   ${face.axes}`);
}

console.log('\nOFL-1.1 — see public/fonts/OFL.txt');
