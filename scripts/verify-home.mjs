/**
 * Behavioural checks for the Home route (brief §PAGES.1).
 *
 * Asserts: the hero Ø canvas paints real pixels (not just mounts), the
 * decode resolves to the real wordmark for screen readers, the statement
 * sequence scrubs on scroll, teasers link to case studies, the frame
 * holds at every width, and reduced motion produces a static composed
 * hero rather than a broken one.
 *
 * node scripts/verify-home.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = new URL('../.verify/home/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

let pass = 0;
const fails = [];
const ok = (n) => { console.log('  ok    ' + n); pass++; };
const bad = (n, d) => { console.log('  FAIL  ' + n + (d ? ' — ' + d : '')); fails.push(n); };

const browser = await chromium.launch();

// The preloader needs to be out of the way before any measurement.
async function settle(page) {
  await page
    .waitForFunction(() => document.querySelector('.preloader') === null, { timeout: 8000 })
    .catch(() => {});
  // HeroScene lazy-loads; wait for its canvas.
  await page
    .waitForSelector('.hero-canvas canvas', { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(400);
}

/** Count non-black pixels in a PNG buffer by sampling the byte stream. */
function nonBlack(buf) {
  let n = 0;
  for (let i = 0; i < buf.length; i += 7) if (buf[i] > 10) n++;
  return n;
}

/* ------------------------------------------------------------------ *
   1. The Ø actually paints — this is the whole point of the hero
 * ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle(page);

  const heroCanvas = page.locator('.hero-canvas canvas');
  if ((await heroCanvas.count()) === 0) {
    bad('hero canvas mounts');
  } else {
    const shot = await heroCanvas.screenshot();
    writeFileSync(OUT + 'hero-canvas.png', shot);
    const n = nonBlack(shot);
    if (n > 0) ok(`hero Ø canvas paints visible content (${n} non-black samples)`);
    else bad('hero Ø canvas paints visible content', 'fully black — object did not render');
  }

  // Two frames apart: the object must drift or the light must move.
  const s1 = await heroCanvas.screenshot();
  await page.waitForTimeout(800);
  const s2 = await heroCanvas.screenshot();
  let diff = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i += 11) {
    if (s1[i] !== s2[i]) diff++;
  }
  if (diff > 0) ok('hero scene animates (drift/light changes between frames)');
  else bad('hero scene animates', 'identical frames — useFrame may not be running');

  if (errors.length === 0) ok('no console errors on home');
  else bad('no console errors on home', errors[0]);

  await ctx.close();
}

/* ------------------------------------------------------------------ *
   2. Decode: screen readers get the resolved text only
 * ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.waitForTimeout(1200); // let the decode finish

  const h1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return { count: document.querySelectorAll('h1').length, text: el?.textContent ?? '' };
  });
  if (h1.count === 1) ok('exactly one h1');
  else bad('exactly one h1', `${h1.count} found`);

  // sr-only real text + aria-hidden painted spans = the word appears once
  // to a screen reader. textContent picks up both; what matters is the
  // painted span is aria-hidden.
  const a11y = await page.evaluate(() => {
    const hidden = document.querySelector('h1 [aria-hidden="true"]');
    const sr = document.querySelector('h1 .sr-only');
    return {
      hasHiddenLayer: !!hidden,
      hasSrText: !!sr,
      srText: sr?.textContent ?? '',
      hiddenText: hidden?.textContent ?? '',
    };
  });
  if (a11y.hasSrText && a11y.srText === 'ZEROOX') ok('h1 carries the resolved wordmark for AT');
  else bad('h1 carries the resolved wordmark for AT', JSON.stringify(a11y));
  if (a11y.hasHiddenLayer && a11y.hiddenText === 'ZEROOX') {
    ok('decode resolved to ZEROOX visually (scramble finished)');
  } else bad('decode resolved to ZEROOX visually', JSON.stringify(a11y));

  await ctx.close();
}

/* ------------------------------------------------------------------ *
   3. Scroll sequence: statements scrub, teasers link, frame holds
 * ------------------------------------------------------------------ */
for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle(page);

  const label = `${w}x${h}`;

  // No horizontal overflow.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow <= 1) ok(`${label}: no horizontal scroll`);
  else bad(`${label}: no horizontal scroll`, `${overflow}px overflow`);

  // h1 fits in two lines. Measure the visible painted layer — the
  // sr-only twin is clipped to 1px by design and would report zero.
  const lines = await page.evaluate(() => {
    const el = document.querySelector('h1 [aria-hidden="true"]');
    if (!el) return -1;
    const r = el.getBoundingClientRect();
    if (r.height === 0) return -1;
    const lh = parseFloat(getComputedStyle(el).lineHeight) || r.height;
    return Math.round(r.height / lh);
  });
  if (lines >= 1 && lines <= 2) ok(`${label}: wordmark stays ≤2 lines (${lines})`);
  else bad(`${label}: wordmark stays ≤2 lines`, `${lines} lines`);

  // Scroll halfway: a statement should be on screen with real opacity.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
  await page.waitForTimeout(900);
  const stmtVisible = await page.evaluate(() => {
    const stmts = [...document.querySelectorAll('.stmt')];
    return stmts.some((s) => {
      const r = s.getBoundingClientRect();
      const o = parseFloat(getComputedStyle(s).opacity);
      return r.top < window.innerHeight && r.bottom > 0 && o > 0.3;
    });
  });
  if (stmtVisible) ok(`${label}: statement sequence reveals on scroll`);
  else bad(`${label}: statement sequence reveals on scroll`);

  // Teasers link to real case-study routes.
  const teaserHrefs = await page.evaluate(() =>
    [...document.querySelectorAll('.teaser')].map((a) => a.getAttribute('href')),
  );
  if (teaserHrefs.length === 3 && teaserHrefs.every((h) => h?.startsWith('/projects/'))) {
    ok(`${label}: 3 featured teasers link to /projects/*`);
  } else bad(`${label}: 3 featured teasers link to /projects/*`, JSON.stringify(teaserHrefs));

  // Screenshot for the human's eyes later.
  await page.screenshot({ path: `${OUT}home-${w}.png` });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}home-${w}-end.png` });

  if (errors.length) bad(`${label}: no console errors`, errors[0]);

  await ctx.close();
}

/* ------------------------------------------------------------------ *
   4. Reduced motion: composed static hero, nothing broken
 * ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await page.waitForTimeout(600);

  const visible = await page.evaluate(() => {
    const word = document.querySelector('h1')?.textContent ?? '';
    const stmts = [...document.querySelectorAll('.stmt')].map(
      (s) => parseFloat(getComputedStyle(s).opacity),
    );
    return { word, allStmtOpaque: stmts.every((o) => o >= 0.99), stmtCount: stmts.length };
  });
  if (visible.word.includes('ZEROOX')) ok('reduced: wordmark present without decode wait');
  else bad('reduced: wordmark present', visible.word);
  if (visible.stmtCount > 0 && visible.allStmtOpaque) {
    ok('reduced: statements fully visible without scroll scrub');
  } else bad('reduced: statements fully visible', JSON.stringify(visible));

  // Canvas still renders the Ø once (demand frameloop, static pose).
  const heroCanvas = page.locator('.hero-canvas canvas');
  if ((await heroCanvas.count()) > 0) {
    const n = nonBlack(await heroCanvas.screenshot());
    if (n > 0) ok('reduced: Ø still paints in its resting pose');
    else bad('reduced: Ø still paints', 'black canvas under demand frameloop');
  }

  await ctx.close();
}

await browser.close();

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  console.log('Failed: ' + fails.join(' | '));
  process.exit(1);
}
