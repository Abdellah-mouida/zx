/**
 * Visual verification harness.
 *
 * Screenshots a route at the four required widths (390 / 768 / 1440 / 1920),
 * collects console errors, and reports layout problems that DESIGN.md §12
 * requires checking: horizontal scroll, headlines over two lines, unequal
 * outer margins.
 *
 * Usage:
 *   node scripts/verify.mjs [path] [--out dir] [--url base]
 *
 * Example:
 *   node scripts/verify.mjs /projects --out .verify/projects
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const route = args.find((a) => !a.startsWith('--')) ?? '/';
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};

const base = flag('url', 'http://localhost:5173');
const outDir = flag('out', '.verify' + (route === '/' ? '/home' : route));

const WIDTHS = [
  { w: 390, h: 844, name: '390-phone' },
  { w: 768, h: 1024, name: '768-tablet' },
  { w: 1440, h: 900, name: '1440-laptop' },
  { w: 1920, h: 1080, name: '1920-desktop' },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];
const notes = [];

for (const { w, h, name } of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto(base + route, { waitUntil: 'networkidle' });
  // Let fonts settle so line-count measurement is real.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const viewW = window.innerWidth;

    // Headline line counts (DESIGN.md §4.2: two lines max).
    const heads = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((el) => el.offsetParent !== null && el.textContent.trim())
      .map((el) => {
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        return {
          tag: el.tagName,
          text: el.textContent.trim().slice(0, 54),
          lines: Math.round(el.getBoundingClientRect().height / lh),
          size: Math.round(parseFloat(cs.fontSize)),
        };
      });

    // Outer margins: the frame must be inset equally on both sides.
    const frames = [...document.querySelectorAll('.frame')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(window.innerWidth - r.right) };
      });

    const h1Count = document.querySelectorAll('h1').length;

    // --- Which faces actually rendered, not which were requested. ---
    const facesUsed = new Set();
    // --- Colours actually painted, to catch anything off-token. ---
    const coloursUsed = new Set();
    // --- Blank-stretch and focal checks need element boxes. ---
    const boxes = [];
    // --- Glass: did backdrop-filter survive to the rendered style? ---
    let glassCount = 0;
    let glassWithBackdrop = 0;

    for (const el of document.querySelectorAll('*')) {
      if (el.offsetParent === null && el.tagName !== 'BODY') continue;
      const cs = getComputedStyle(el);
      const hasText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
      );
      if (hasText) {
        facesUsed.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
        coloursUsed.add(cs.color);
      }
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') coloursUsed.add(cs.backgroundColor);

      if (/glass-(surface|raised|overlay)/.test(el.className || '')) {
        glassCount++;
        if (cs.backdropFilter && cs.backdropFilter !== 'none') glassWithBackdrop++;
      }

      const r = el.getBoundingClientRect();
      if (hasText && r.width > 0 && r.height > 0) {
        boxes.push({ top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY) });
      }
    }

    // Largest vertical gap with no text in it (DESIGN.md §5: never > 1/2 vh).
    boxes.sort((a, b) => a.top - b.top);
    let maxGap = 0;
    let reach = 0;
    for (const b of boxes) {
      if (b.top > reach) maxGap = Math.max(maxGap, b.top - reach);
      reach = Math.max(reach, b.bottom);
    }

    return {
      docW,
      viewW,
      heads,
      frames,
      h1Count,
      faces: [...facesUsed],
      colours: [...coloursUsed],
      glassCount,
      glassWithBackdrop,
      maxGap,
      pageH: document.documentElement.scrollHeight,
    };
  });

  if (metrics.docW > metrics.viewW + 1) {
    problems.push(`[${name}] horizontal scroll: document ${metrics.docW}px > viewport ${metrics.viewW}px`);
  }

  for (const hd of metrics.heads) {
    if (hd.lines > 2) {
      problems.push(`[${name}] ${hd.tag} wraps to ${hd.lines} lines @${hd.size}px: "${hd.text}"`);
    }
  }

  for (const f of metrics.frames) {
    if (Math.abs(f.left - f.right) > 2) {
      problems.push(`[${name}] unequal frame margins: left ${f.left}px, right ${f.right}px`);
    }
  }

  if (metrics.h1Count !== 1) {
    problems.push(`[${name}] expected exactly one h1, found ${metrics.h1Count}`);
  }

  for (const e of consoleErrors) problems.push(`[${name}] console: ${e}`);

  // --- Faces: only the three in DESIGN.md §4 may render text. ---
  const ALLOWED_FACES = ['Archivo Variable', 'Manrope Variable', 'JetBrains Mono Variable'];
  for (const f of metrics.faces) {
    if (!ALLOWED_FACES.includes(f)) {
      problems.push(`[${name}] off-system font rendering text: "${f}"`);
    }
  }

  // --- Colour: every painted colour must be a DESIGN.md §2 token. ---
  // Permits any alpha of white (the text ladder) and pure transparent.
  const ALLOWED_RGB = [
    '0, 0, 0', // void
    '5, 6, 8', // surface-1
    '10, 12, 16', // surface-2
    '17, 20, 26', // surface-3
    '61, 139, 255', // accent
    '127, 178, 255', // accent-edge
    '30, 70, 128', // accent-muted
    '11, 26, 51', // accent-deep
    '255, 255, 255', // text ladder
  ];
  for (const c of metrics.colours) {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) continue;
    const parts = m[1].split(',').map((s) => s.trim());
    const alpha = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (alpha === 0) continue;
    const rgb = parts.slice(0, 3).join(', ');
    if (!ALLOWED_RGB.includes(rgb)) {
      problems.push(`[${name}] off-token colour painted: ${c}`);
    }
  }

  // --- Glass must keep its backdrop-filter in the shipped style. ---
  if (metrics.glassCount > 0 && metrics.glassWithBackdrop < metrics.glassCount) {
    problems.push(
      `[${name}] backdrop-filter missing on ${metrics.glassCount - metrics.glassWithBackdrop}/${metrics.glassCount} glass elements`,
    );
  }

  // --- No blank stretch taller than half a viewport (§5). ---
  if (metrics.maxGap > h / 2) {
    problems.push(`[${name}] blank stretch ${metrics.maxGap}px exceeds half-viewport (${Math.round(h / 2)}px)`);
  }

  const file = `${outDir}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  notes.push(
    `${name.padEnd(14)} doc ${String(metrics.docW).padStart(5)}px  page ${String(metrics.pageH).padStart(5)}px  ` +
      `${String(metrics.heads.length).padStart(2)} headings  ${String(metrics.glassCount).padStart(2)} glass  ` +
      `gap ${String(metrics.maxGap).padStart(4)}px  -> ${file}`,
  );

  await ctx.close();
}

await browser.close();

console.log(notes.join('\n'));

if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.log('  FAIL  ' + p);
  process.exitCode = 1;
} else {
  console.log('\nOK — no layout or console problems at any width.');
}
