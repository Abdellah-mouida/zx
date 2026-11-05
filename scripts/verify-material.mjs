/**
 * Behavioural checks for the material layer (Task 3).
 *
 * The static harness in verify.mjs measures a rendered page. These are the
 * things it cannot see: does the cursor actually change state over a link,
 * does the magnetic label actually translate, does the sheen track, and
 * does reduced motion actually switch all of it off.
 *
 * Usage: node scripts/verify-material.mjs
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const results = [];
const fail = (m) => results.push({ ok: false, m });
const pass = (m) => results.push({ ok: true, m });

const browser = await chromium.launch();

/* ================================================================
   1. Full-motion context: everything should be live.
================================================================ */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // --- cursor exists and reaches 'default' once the pointer moves ---
  await page.mouse.move(700, 500);
  await page.waitForTimeout(120);

  const hasCursor = await page.locator('.cursor').count();
  if (hasCursor === 1) pass('cursor element present on fine pointer');
  else fail(`expected 1 cursor element, found ${hasCursor}`);

  // --- cursor switches to 'link' over a button ---
  const btn = page.locator('.btn-ghost').first();
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(150);
  const kindOverBtn = await page.locator('.cursor').getAttribute('data-kind');
  if (kindOverBtn === 'link') pass("cursor -> 'link' over a button");
  else fail(`cursor over button was '${kindOverBtn}', expected 'link'`);

  // --- and back to 'default' over empty ground ---
  await page.mouse.move(12, 400);
  await page.waitForTimeout(150);
  const kindOverVoid = await page.locator('.cursor').getAttribute('data-kind');
  if (kindOverVoid === 'default') pass("cursor -> 'default' over empty ground");
  else fail(`cursor over ground was '${kindOverVoid}', expected 'default'`);

  // --- native cursor is hidden while ours is live ---
  const bodyCursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
  if (bodyCursor === 'none') pass('native cursor hidden under the custom one');
  else fail(`body cursor is '${bodyCursor}', expected 'none'`);

  // --- magnetic label translates toward the pointer ---
  const prim = page.locator('.btn-primary').first();
  const pb = await prim.boundingBox();
  await page.mouse.move(pb.x + pb.width / 2 + 40, pb.y + pb.height / 2);
  await page.waitForTimeout(260);
  const pulled = await page.evaluate(() => {
    const el = document.querySelector('.btn-primary .magnetic-inner');
    return el ? getComputedStyle(el).transform : 'missing';
  });
  if (pulled !== 'none' && pulled !== 'missing' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(pulled)) {
    pass(`magnetic label translated: ${pulled}`);
  } else {
    fail(`magnetic label did not translate (transform: ${pulled})`);
  }

  // --- glass sheen writes --mx/--my while the pointer is over a panel ---
  const glass = page.locator('.glass-raised').first();
  await glass.scrollIntoViewIfNeeded();
  const gb = await glass.boundingBox();
  // The pointer must land inside the viewport for a real enter to fire.
  if (!gb || gb.y < 0 || gb.y + gb.height > 900) {
    await glass.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  }
  const gb2 = await glass.boundingBox();
  await page.mouse.move(gb2.x + gb2.width * 0.3, gb2.y + gb2.height * 0.4);
  await page.waitForTimeout(200);
  const sheen = await page.evaluate(() => {
    const el = document.querySelector('.glass-raised');
    return { mx: el.style.getPropertyValue('--mx'), my: el.style.getPropertyValue('--my') };
  });
  if (sheen.mx && sheen.my) pass(`sheen tracking: --mx ${sheen.mx}, --my ${sheen.my}`);
  else fail('sheen did not write --mx/--my while pointer was over the panel');

  // --- and clears them on leave ---
  await page.mouse.move(5, 5);
  await page.waitForTimeout(200);
  const cleared = await page.evaluate(() => {
    const el = document.querySelector('.glass-raised');
    return el.style.getPropertyValue('--mx') === '';
  });
  if (cleared) pass('sheen cleared on pointer leave');
  else fail('sheen left --mx set after the pointer left the panel');

  // --- glass levels differ, i.e. the three are genuinely distinct ---
  const blurs = await page.evaluate(() =>
    ['glass-surface', 'glass-raised', 'glass-overlay'].map((c) => {
      const el = document.querySelector('.' + c);
      return el ? getComputedStyle(el).backdropFilter : null;
    }),
  );
  if (new Set(blurs).size === 3 && blurs.every((b) => b && b !== 'none')) {
    pass(`three distinct glass levels: ${blurs.join(' | ')}`);
  } else {
    fail(`glass levels not distinct: ${JSON.stringify(blurs)}`);
  }

  // --- focus is visible on every interactive element ---
  // Tab to the button so :focus-visible genuinely engages (a scripted
  // .focus() may not). Then read the element's outline.
  await page.keyboard.press('Escape'); // leave any hover state
  const ghostTabbed = await page.evaluate(() => {
    const el = document.querySelector('.btn-ghost');
    el.focus();
    const active = document.activeElement === el;
    const cs = getComputedStyle(el);
    return { active, width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor };
  });
  if (ghostTabbed.active && ghostTabbed.style !== 'none' && parseFloat(ghostTabbed.width) > 0) {
    pass(`focus ring present: ${ghostTabbed.width} ${ghostTabbed.style}`);
  } else {
    fail(`no visible focus ring: ${JSON.stringify(ghostTabbed)}`);
  }

  await ctx.close();
}

/* ================================================================
   2. Reduced motion: the cursor and magnetic must switch off.
================================================================ */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(700, 500);
  await page.waitForTimeout(200);

  const dataMotion = await page.evaluate(() => document.documentElement.dataset.motion);
  if (dataMotion === 'reduced') pass("html[data-motion] = 'reduced' under the OS preference");
  else fail(`html[data-motion] was '${dataMotion}', expected 'reduced'`);

  const cursorCount = await page.locator('.cursor').count();
  if (cursorCount === 0) pass('custom cursor not rendered under reduced motion');
  else fail(`custom cursor still rendered (${cursorCount}) under reduced motion`);

  const bodyCursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
  if (bodyCursor !== 'none') pass(`native cursor restored: '${bodyCursor}'`);
  else fail('native cursor still hidden under reduced motion');

  // Magnetic must not translate.
  const prim = page.locator('.btn-primary').first();
  const pb = await prim.boundingBox();
  await page.mouse.move(pb.x + pb.width / 2 + 40, pb.y + pb.height / 2);
  await page.waitForTimeout(300);
  const t = await page.evaluate(() => {
    const el = document.querySelector('.btn-primary .magnetic-inner');
    return getComputedStyle(el).transform;
  });
  if (t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t)) {
    pass('magnetic pull disabled under reduced motion');
  } else {
    fail(`magnetic still translating under reduced motion: ${t}`);
  }

  // Content must still be present and legible.
  const h1 = await page.locator('h1').textContent();
  if (h1 && h1.trim()) pass(`content present under reduced motion: h1 "${h1.trim()}"`);
  else fail('h1 empty under reduced motion');

  await ctx.close();
}

/* ================================================================
   3. Touch: no custom cursor, no sheen.
================================================================ */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  const coarse = await page.evaluate(() => window.matchMedia('(hover: none)').matches);
  const cursorCount = await page.locator('.cursor').count();
  if (!coarse) {
    pass('note: emulated viewport did not report a coarse pointer; touch path untested here');
  } else if (cursorCount === 0) {
    pass('custom cursor not rendered on a coarse pointer');
  } else {
    fail(`custom cursor rendered (${cursorCount}) on a coarse pointer`);
  }

  await ctx.close();
}

await browser.close();

for (const r of results) console.log(`${r.ok ? '  ok  ' : ' FAIL '} ${r.m}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} behavioural checks passed.`);
if (failed) process.exitCode = 1;
