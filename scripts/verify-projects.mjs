/**
 * Behavioural checks for the Projects index and case-study pages.
 *
 * Asserts: the index lists all seven entries, filters actually filter and
 * state the count, rows link to case studies, the case study carries the
 * required problem/role/process/outcome/constraint shape, prev/next nav
 * walks the index, and no page has horizontal overflow or console errors
 * at four widths.
 *
 * node scripts/verify-projects.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = new URL('../.verify/projects/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

let pass = 0;
const fails = [];
const ok = (n) => { console.log('  ok    ' + n); pass++; };
const bad = (n, d) => { console.log('  FAIL  ' + n + (d ? ' — ' + d : '')); fails.push(n); };

const browser = await chromium.launch();

async function settle(page) {
  await page
    .waitForFunction(() => document.querySelector('.preloader') === null, { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(300);
}

/* ------------------------------------------------------------------ *
   1. Index: seven rows, filters work, rows link out
 * ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE + '/projects', { waitUntil: 'domcontentloaded' });
  await settle(page);

  const rows = await page.locator('.prow').count();
  if (rows === 7) ok('index lists all seven projects');
  else bad('index lists all seven projects', `${rows} rows`);

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('.prow')].map((a) => a.getAttribute('href')),
  );
  if (hrefs.every((h) => h?.startsWith('/projects/'))) {
    ok('every row links to a case-study route');
  } else bad('every row links to a case-study route', JSON.stringify(hrefs));

  // Featured rows get the bigger type — hierarchy exists.
  const featured = await page.locator('.prow.is-featured').count();
  if (featured > 0 && featured < 7) ok(`hierarchy: ${featured} featured rows, rest compact`);
  else bad('hierarchy: featured vs compact', `${featured} featured`);

  // Filter to research: SIEGE drops out, two entries remain.
  await page.getByRole('button', { name: /Research/ }).click();
  await page.waitForTimeout(400);
  const research = await page.evaluate(() => ({
    rows: document.querySelectorAll('.prow').length,
    status: document.querySelector('.filter-status')?.textContent ?? '',
  }));
  if (research.rows === 2 && research.status.includes('2 of 7')) {
    ok(`filter works: research shows 2 of 7 ("${research.status.trim()}")`);
  } else bad('filter works', JSON.stringify(research));

  // Keyboard: Tab reaches a row, Enter opens it.
  await page.getByRole('button', { name: /All/ }).click();
  await page.waitForTimeout(300);
  const firstRow = page.locator('.prow').first();
  await firstRow.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  const url = page.url();
  if (url.includes('/projects/')) ok('keyboard: focusing a row + Enter opens the case study');
  else bad('keyboard: focusing a row + Enter opens the case study', url);

  if (errors.length === 0) ok('no console errors on /projects');
  else bad('no console errors on /projects', errors[0]);

  await ctx.close();
}

/* ------------------------------------------------------------------ *
   2. Case study: required shape, facts panel, prev/next
 * ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE + '/projects/siege', { waitUntil: 'domcontentloaded' });
  await settle(page);

  const shape = await page.evaluate(() => {
    const h = (t) =>
      [...document.querySelectorAll('h2')].some((x) =>
        x.textContent?.toLowerCase().includes(t),
      );
    return {
      title: document.querySelector('h1')?.textContent ?? '',
      facts: !!document.querySelector('.case-facts'),
      roleInFacts: (document.querySelector('.case-facts')?.textContent ?? '').includes('ROLE'),
      problem: h('problem'),
      process: h('process'),
      outcome: h('outcome'),
      constraint: h('does not do'),
      steps: document.querySelectorAll('.case-process li').length,
      ordered: !!document.querySelector('.case-process'),
      placeholder: !!document.querySelector('.case-placeholder'),
    };
  });
  if (shape.title === 'SIEGE') ok('case study title renders');
  else bad('case study title', shape.title);
  if (shape.problem && shape.process && shape.outcome && shape.constraint) {
    ok('required shape: problem, process, outcome, constraint');
  } else bad('required shape', JSON.stringify(shape));
  if (shape.facts && shape.roleInFacts) ok('fact panel carries kind/year/role/stack');
  else bad('fact panel', JSON.stringify(shape));
  if (shape.ordered && shape.steps === 5) ok(`process is a real list (${shape.steps} steps)`);
  else bad('process is a real list', `${shape.steps} steps`);
  if (shape.placeholder) ok('placeholder content is flagged honestly on the page');
  else bad('placeholder flag visible on page');

  // Prev/next: SIEGE is first, so only NEXT (BLOODLINE).
  const nav = await page.evaluate(() =>
    [...document.querySelectorAll('.case-nav-link')].map((a) => ({
      href: a.getAttribute('href'),
      next: a.classList.contains('is-next'),
    })),
  );
  if (nav.length === 1 && nav[0].next && nav[0].href === '/projects/bloodline') {
    ok('prev/next nav: SIEGE (first) offers only NEXT → bloodline');
  } else bad('prev/next nav at first entry', JSON.stringify(nav));

  // Walk forward; BLOODLINE should offer both.
  await page.goto(BASE + '/projects/bloodline', { waitUntil: 'domcontentloaded' });
  await settle(page);
  const nav2 = await page.locator('.case-nav-link').count();
  if (nav2 === 2) ok('middle entry offers both prev and next');
  else bad('middle entry offers both prev and next', `${nav2}`);

  // Bad slug 404s in-page.
  await page.goto(BASE + '/projects/not-a-thing', { waitUntil: 'domcontentloaded' });
  await settle(page);
  const gone = await page.evaluate(
    () => document.querySelector('h1')?.textContent?.includes('No entry') ?? false,
  );
  if (gone) ok('unknown slug renders the in-page 404');
  else bad('unknown slug renders the in-page 404');

  if (errors.length === 0) ok('no console errors on case study');
  else bad('no console errors on case study', errors[0]);

  await ctx.close();
}

/* ------------------------------------------------------------------ *
   3. Frame holds at every width, no overflow
 * ------------------------------------------------------------------ */
for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  for (const path of ['/projects', '/projects/siege']) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const label = `${w}x${h} ${path}`;

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow <= 1) ok(`${label}: no horizontal scroll`);
    else bad(`${label}: no horizontal scroll`, `${overflow}px`);

    const h1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    if (h1 === 1) ok(`${label}: exactly one h1`);
    else bad(`${label}: exactly one h1`, `${h1}`);

    await page.screenshot({ path: `${OUT}${w}-${path.replace(/\//g, '_')}.png`, fullPage: false });
  }

  if (errors.length) bad(`${w}x${h}: no console errors`, errors[0]);
  await ctx.close();
}

await browser.close();

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  console.log('Failed: ' + fails.join(' | '));
  process.exit(1);
}
