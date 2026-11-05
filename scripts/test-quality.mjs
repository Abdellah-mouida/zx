/**
 * Assert-based self-check for the adaptive quality logic (DESIGN.md §7.1).
 * No test runner needed: node scripts/test-quality.mjs
 *
 * Covers the rules that are easy to get wrong and expensive to get wrong:
 * demotion only after a sustained dip, one tier at a time, never upward,
 * medians immune to single stalls, and a hard stop at the floor.
 */

import assert from 'node:assert/strict';

// Node 24 strips TypeScript types natively, so the test imports and exercises
// the shipped module directly — no transform step, no second source of truth.
const { FpsMonitor, TIERS, settingsFor } = await import('../src/lib/quality.ts');

let pass = 0;
const check = (name, fn) => {
  fn();
  console.log('  ok  ' + name);
  pass++;
};

/** Feed `count` frames at `fps`, starting at `t0`. Returns the end time. */
function feed(monitor, fps, count, t0 = 0) {
  const step = 1000 / fps;
  let t = t0;
  for (let i = 0; i < count; i++) {
    t += step;
    monitor.sample(t);
  }
  return t;
}

function make(startTier = 'high') {
  let tier = startTier;
  const demotions = [];
  const m = new FpsMonitor(
    (next) => {
      tier = next;
      demotions.push(next);
    },
    () => tier,
  );
  return { m, demotions, tier: () => tier };
}

console.log('adaptive quality');

check('60fps never demotes', () => {
  const { m, demotions } = make();
  feed(m, 60, 600); // 10 seconds
  assert.equal(demotions.length, 0);
});

check('a brief dip does not demote', () => {
  const { m, demotions } = make();
  let t = feed(m, 60, 120);
  t = feed(m, 30, 30, t); // ~1s under the floor, short of sustainMs
  feed(m, 60, 200, t);
  assert.equal(demotions.length, 0);
});

check('a sustained dip demotes exactly one tier', () => {
  const { m, demotions } = make();
  const t = feed(m, 60, 60); // fill the window
  feed(m, 30, 200, t); // well past 2s under the floor
  assert.deepEqual(demotions, ['medium']);
});

check('demotion never goes upward', () => {
  const { m, demotions, tier } = make();
  let t = feed(m, 60, 60);
  t = feed(m, 30, 200, t); // -> medium
  feed(m, 144, 600, t); // fast again: must NOT promote
  assert.deepEqual(demotions, ['medium']);
  assert.equal(tier(), 'medium');
});

check('high -> medium -> low, then stops at the floor', () => {
  const { m, demotions, tier } = make();
  let t = feed(m, 60, 60);
  t = feed(m, 20, 300, t); // -> medium
  t = feed(m, 20, 300, t); // -> low
  feed(m, 20, 600, t); // nothing below low exists
  assert.deepEqual(demotions, ['medium', 'low']);
  assert.equal(tier(), 'low');
});

check('a single long stall is discarded, not counted as slow', () => {
  const { m, demotions } = make();
  let t = feed(m, 60, 120);
  t += 3000; // backgrounded tab: one 3s frame
  m.sample(t);
  feed(m, 60, 200, t);
  assert.equal(demotions.length, 0);
});

check('median ignores a minority of slow frames', () => {
  const { m, demotions } = make();
  let t = 0;
  // 2 slow frames in every 10 -> median stays at 60
  for (let i = 0; i < 400; i++) {
    t += i % 5 === 0 ? 1000 / 25 : 1000 / 60;
    m.sample(t);
  }
  assert.equal(demotions.length, 0);
});

check('median is null until the window fills', () => {
  const { m } = make();
  // The first sample only primes the timestamp, so N calls yield N-1 frames.
  const t = feed(m, 60, 60);
  assert.equal(m.median, null, '60 calls = 59 frames, still one short');
  feed(m, 60, 1, t);
  assert.ok(m.median > 0, 'the 60th frame fills the window');
});

check('dispose stops demotion', () => {
  const { m, demotions } = make();
  const t = feed(m, 60, 60);
  m.dispose();
  feed(m, 10, 400, t);
  assert.equal(demotions.length, 0);
});

check('tiers degrade monotonically', () => {
  const h = TIERS.high;
  const md = TIERS.medium;
  const lo = TIERS.low;
  assert.ok(h.particles > md.particles && md.particles > lo.particles);
  assert.ok(h.trails > md.trails && md.trails > lo.trails);
  assert.ok(h.dprMax >= md.dprMax && md.dprMax >= lo.dprMax);
  assert.ok(h.refractionBounces > md.refractionBounces);
  assert.equal(lo.particles, 0);
  assert.equal(lo.trails, 0);
  assert.equal(lo.bloom, false);
});

check('low tier disables all post-processing', () => {
  globalThis.window = { devicePixelRatio: 3 };
  const s = settingsFor('low');
  assert.equal(s.bloom, false);
  assert.equal(s.chromaticAberration, false);
  assert.equal(s.vignette, false);
  assert.equal(s.dpr, 1, 'dpr must clamp to 1 on low even on a 3x screen');
  delete globalThis.window;
});

check('dpr clamps to the tier maximum', () => {
  globalThis.window = { devicePixelRatio: 3 };
  assert.equal(settingsFor('high').dpr, 2);
  assert.equal(settingsFor('medium').dpr, 1.5);
  globalThis.window = { devicePixelRatio: 1 };
  assert.equal(settingsFor('high').dpr, 1, 'never upscales past the real dpr');
  delete globalThis.window;
});

console.log(`\n${pass}/${pass} pass`);
