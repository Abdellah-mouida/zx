# PROGRESS — ZEROOX

Build log. Newest entry at the bottom. Each entry: what was built, files touched,
decisions, verification, next task.

---

## 2026-11-05 — Task 0: Repo setup

**Built**
Repository scaffolding and the autonomous-build ground rules.

**Files touched**
- `.gitignore` — node_modules, dist, .env*, logs, OS files, test artifacts, local agent config
- `.env.example` — Resend + Turnstile keys, documented, server-side keys unprefixed
- `README.md` — stack table, quick start, doc pointers
- `PROGRESS.md` — this file

**Decisions**

1. **Skill conflict: `design-taste-frontend` vs the brief.** That skill's house rules
   ban glass / backdrop-blur, gradients, glows, shadows, monospace labels and tiny
   tracked caps. The brief requires all of them as the core visual identity
   ("Glass (the signature material)", "mono micro-labels", aurora, bloom).
   **Resolution:** the brief wins, per the skill system's own precedence rule
   (user instructions override skills). I keep that skill's *substance* rules, which
   do not conflict and are the parts that actually prevent slop:
   - one idea taken from the subject, not the category
   - headlines ≤ 2 lines at every width
   - a clear `h1` on the first screen, a heading on every section
   - equal outer margins, no half-empty screens, no blank stretches > ½ viewport
   - no icon-topped feature cards, no rows of identical cards, no eyebrows/pill badges
   - full content in every section, no thin filler
   - its inspect/critique loop, adapted (the glass/gradient/mono checks disabled)
2. **Skill conflict: `impeccable`.** It specifies a cream + burnt-orange + amber
   editorial palette on Chakra Petch. Directly incompatible with AMOLED black +
   single electric blue. **Resolution:** take only its authoring process — tokens
   before components, "must/should" rule language, testable a11y acceptance criteria,
   anti-pattern pairs, and a QA checklist executable in review. Its palette and type
   are discarded.
3. **The idea (per `design-taste-frontend` step 4).**
   *On this page, the null byte — zero, the handle's own origin — becomes the
   refractive object the whole site orbits.*
   Not "a hacker site with a globe". The Ø is the hero geometry, the loader, the
   cursor state, the mode toggle, the favicon and the 404. The competitor test holds:
   another red-teamer's site is terminals and green text; this one is a single piece
   of black glass.
4. **The live thing.** The command terminal (hacker mode) is real and operable, not
   a decorative prop: it navigates the site, opens projects and runs a shader event.
   It uses the site's real content, works from the keyboard, and the site is fully
   usable without it.
5. **`opencode.json` is gitignored** — it is machine-local agent config, not project
   source, and may hold local paths.

**Verification**
- `git remote -v` → `origin https://github.com/Abdellah-mouida/zx.git` (fetch + push).
  Remote confirmed present and left untouched.
- `.gitignore` covers `.env*` with a `!.env.example` negation; verified no secret
  files are tracked in the initial commit.

**Next task**
Task 1 — `DESIGN.md`: colour and glass tokens, three glass levels, type scale,
motion principles, and the phased implementation plan.

---

## 2026-11-05 — Task 1: DESIGN.md and the phased plan

**Built**
`DESIGN.md`, 13 sections: goals/non-goals/anti-goals, colour with measured contrast,
the five-layer glass spec and its three levels, the type system, layout law, motion
tokens and choreography, the 3D/shader budget with adaptive tiers, component rules,
ten testable a11y criteria, the performance budget, voice rules, a QA checklist, and
the phase table that drives tasks 2–13.

**Files touched**
- `DESIGN.md` (new)
- `PROGRESS.md`

**Decisions**

1. **Type system chosen and verified.** Display **Archivo** variable, text **Manrope**
   variable, mono **JetBrains Mono** variable. Queried the Fontsource API to confirm
   the axes actually exist before committing to them:
   - Archivo: `wght 100–900`, **`wdth 62–125`**, `ital`
   - Manrope: `wght 200–800`
   - JetBrains Mono: `wght 100–800`, `ital`

   All OFL-1.1, so self-hosting is permitted. Archivo's `wdth` axis is the reason it
   was picked over the alternatives: the brief wants a *wide technical* display face
   **and** a variable-weight shift on scroll, and one variable file delivers both
   without shipping a second family. None of the banned faces (Inter, Roboto, Space
   Grotesk, Poppins, Montserrat) is used.
2. **Contrast is measured, not estimated.** Computed every text level with the WCAG 2.x
   relative-luminance formula. My first draft asserted 19.0:1 and 8.5:1 for
   `--text-1`/`--text-2`; the real values are **17.62:1** and **8.33:1**, and the doc
   was corrected. Also computed the worst realistic glass case (text over an opaque
   `--surface-3` `#11141A`): `--text-1` 15.62:1, `--text-2` 7.94:1, `--text-3` 3.83:1,
   accent 5.56:1. Every level holds its AA rating on every surface in the system, so
   no level needed re-tuning.
3. **`--text-3` is capped at ≥24px and `--text-4` carries no information**, because at
   3.66:1 and 1.93:1 they fail AA for body copy. This is written into the token table
   as a *must not*, so the constraint travels with the token.
4. **Glass is specified as five paint layers**, not a blur utility: backdrop, fill,
   gradient edge via a `::before` mask, inner highlight hairline, 2–4% overlay grain,
   and an `--accent-deep` bounce underneath. The grain is one shared asset, never
   per-component. Exactly three levels (`surface` / `raised` / `overlay`); a fourth is
   defined as a bug. Only `overlay` gets a shadow, since only it genuinely floats —
   this is how the brief's "glow sparingly" rule is made enforceable.
5. **Adaptive quality never promotes back up** within a session. A rolling 60-frame
   median under 50fps for 2s demotes one tier, one way. Oscillating between tiers is
   more visible and worse than sitting at a lower tier.
6. **Bloom is seeded only by the Ø rim and the light trails**, never by UI or text.
   Chromatic aberration offset is capped at 0.0006 so it reads as lens quality rather
   than visible fringing. This is the concrete version of "if everything glows, nothing
   is premium".
7. **Aurora moods are a per-page uniform**, not five shaders: `calm` / `drift` / `dense`
   / `quiet` / `signal`.
8. **The LCP element must be text**, painted before WebGL initialises, and the preloader
   has a hard 2.5s ceiling after which it exits regardless of asset state. A cinematic
   loader that holds the page hostage fails the brief's own performance budget.
9. **Primary buttons are fully round, everything else square** — decided once, as the
   round form echoes the Ø motif. Removes per-component radius guessing.
10. **Banned-word list written into the doc** (passionate, crafting, journey, welcome to
    my portfolio, innovative, cutting-edge, seamless, synergy, leverage, robust, delve)
    so the voice rule is greppable rather than a vibe.

**Verification**
- Contrast ratios computed with a script against the WCAG formula; two incorrect
  figures in my first draft found and fixed. Numbers in §2.4 now match computation.
- Font axes verified live against `api.fontsource.org/v1/variable/*` — all three faces
  exist, are variable, and expose the axes the design depends on.
- No build yet to verify; Task 2 is the first compilable state.

**Next task**
Task 2 — Foundation: Vite + React + TS, the Tailwind token layer generated from §2–§6,
the three self-hosted variable faces, and the complete `src/content/*.ts` with every
item from the brief plus `placeholder: true` flags.

---

## 2026-11-05 — Task 2: Foundation

**Built**
A compiling, verified foundation: build config, token layer, three self-hosted
variable faces, the complete content model, and a visual-verification harness.

**Files touched**
- `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- `src/styles/tokens.css` — DESIGN.md §2–§6 as a Tailwind 4 `@theme` layer
- `src/content/types.ts`, `identity.ts`, `arsenal.ts`, `projects.ts`, `about.ts`, `nav.ts`, `index.ts`
- `src/main.tsx`, `src/App.tsx`, `src/routes/Specimen.tsx`
- `scripts/fetch-fonts.mjs`, `scripts/verify.mjs`
- `public/fonts/*.woff2` (3 faces, 151KB total), `public/fonts/OFL.txt`, `public/favicon.svg`
- `.gitignore` (added `.verify/`)

**Decisions**

1. **Stack versions are current, and two were corrected mid-task.**
   Vite **8.3.5**, React **19.3.1**, Tailwind **4.3.4**, three **0.187.0**,
   @react-three/fiber **9.8.2**, drei **10.7.9**, GSAP **3.15.1**, Lenis **1.3.27**,
   react-router **7.18.5**, TypeScript 5.9.
   - Framer Motion is now at **v14** (the brief's expectation of a lower major was
     stale); installed `framer-motion@^14.9.1`.
   - Started on Vite 7, but `@vitejs/plugin-react@6` peer-requires Vite ^8.0.0.
     Moved to Vite 8. 0 vulnerabilities.
2. **Vite 8 uses Rolldown, so `manualChunks` no longer exists.** My first config
   failed typecheck. Read the bundled Rolldown `.d.ts` to find the real API:
   object-form `manualChunks` → `output.codeSplitting.groups` with `{name, test}`
   entries (`advancedChunks` exists but is already deprecated). Four groups: `three`,
   `post`, `motion`, `vendor` — so the 3D stack stays off the first-paint path.
3. **Tailwind's default palette and font families are deliberately erased**
   (`--color-*: initial; --font-*: initial`) in `@theme`. If a colour is not a ZEROOX
   token it is now *unreachable from a utility class*, which enforces the strict palette
   at the framework level rather than by discipline.
4. **Font filenames are resolved from the registry, not guessed.** My first
   `fetch-fonts.mjs` guessed `-standard-` for all three and 404'd on two: Fontsource
   publishes `-standard-` only for multi-axis faces, and `-wght-` for single-axis ones.
   The script now reads the published file list from the jsDelivr API and prefers
   `-standard-` where it exists. Verified with fontTools that the downloaded files
   carry the axes the design needs:
   - `archivo-var.woff2` 88KB — `wght 100–900`, **`wdth 62–125`**
   - `manrope-var.woff2` 24KB — `wght 200–800`
   - `jetbrains-mono-var.woff2` 39KB — `wght 100–800`

   151KB for all three. `OFL.txt` ships with per-face copyright attribution.
5. **Type presets bundle their own tracking and leading** (`.t-display-xl` etc.), so a
   size can never be applied without its settings — the most common way a careful type
   scale degrades in practice.
6. **Glass edge uses `mask-composite: exclude` on an inset pseudo-element**, not a
   masked gradient fill. My first attempt produced a faded border rather than a crisp
   1px rim. The sheen rides as a second background layer on the same pseudo-element, so
   the whole material is two pseudo-elements total.
7. **The terminal's Easter-egg count is stated in one place** (the `console.log` in
   `index.html` and `terminalBanner` both say "five"), so the hint cannot drift from
   the implementation.
8. **No animation or 3D was written this task.** The brief's order puts material and
   atmosphere in tasks 3–4; adding motion now would mean verifying it twice.

**Verification**

- `npm run typecheck` → clean, strict mode with `noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`.
- `npm run build` → clean in 555ms. CSS 4.77KB gzip, vendor **81.22KB gzip** —
  well inside the §10 budget of 180KB for initial JS.
- **Built `scripts/verify.mjs`** and ran it at 390 / 768 / 1440 / 1920. It asserts:
  no horizontal scroll, no headline over two lines, equal frame margins, exactly one
  `h1`, no off-system font rendering text, no off-token colour painted,
  `backdrop-filter` surviving into the shipped style, no blank stretch over half a
  viewport, and zero console errors. Result: **clean at all four widths.**
- **Negative-tested the harness** rather than trusting a green result: injected an
  off-token colour (`#ff00aa`), an off-system face (Georgia) and a 9-line headline into
  the specimen. All three were caught at all four widths — 12 FAILs — then reverted and
  re-verified clean. The checks have teeth.
- Confirmed in-browser via `document.fonts` that all three faces reach `loaded`, with
  Archivo reporting stretch `62% 125%` — the `wdth` axis the display type depends on is
  live, not just declared.

**Known limitation, logged honestly**

**I cannot see images.** This model has no image input, so the brief's instruction to
*look at* screenshots at each width is not something I can personally satisfy. Rather
than claim a visual review I did not perform, I invested in `scripts/verify.mjs` to
convert as much of the visual review as possible into programmatic assertions (fonts,
colours, line counts, margins, blank stretches, glass integrity, console). The
screenshots are still written to `.verify/<route>/` at all four widths for a human to
review. Judgement calls that genuinely need eyes — whether the composition reads as
premium, whether the aurora looks cheap — remain unverified by me and need a human pass.
This is recorded here so it is not discovered at the end.

**Next task**
Task 3 — the material layer: the three glass levels as React components, the
context-aware cursor, magnetic buttons, the custom icon set, and the mono micro-label,
all exercised on a specimen route.



---

## 2026-11-05 — Task 3: Material layer

**Built**
The signature material and every shared interaction primitive, plus a behavioural
test harness for them.

**Files touched**
- `src/lib/motion.ts` — reduced-motion store (`useSyncExternalStore`)
- `src/lib/pointer.ts` — one shared rAF-coalesced pointer listener
- `src/components/Glass.tsx` — the three levels from DESIGN.md §3.1
- `src/components/Cursor.tsx` — context-aware cursor
- `src/components/Magnetic.tsx` — magnetic label wrapper
- `src/components/Button.tsx` — primary / ghost / quiet
- `src/components/Micro.tsx` — the mono micro-label
- `src/components/icons.tsx` — the custom icon set, including `IconZero`
- `src/styles/tokens.css` — cursor, magnetic and button rules in the component layer
- `src/App.tsx`, `src/routes/Specimen.tsx`
- `scripts/verify-material.mjs` (new)

**Decisions**

1. **One pointer listener for the whole site**, in `src/lib/pointer.ts`, coalesced to
   a single rAF. Every hover effect (sheen, magnetic, cursor) subscribes to it. The
   obvious alternative — a listener per component — multiplies handler cost by the
   number of glass panels on screen, and the Projects page will have many.
2. **Reduced motion is one store, two inputs.** The OS preference and the in-app
   "reduce effects" toggle both resolve to the same state and mirror to
   `<html data-motion="reduced">`, so CSS and JS can never disagree about it. The
   toggle persists to `localStorage`.
3. **Effects are not merely disabled under reduced motion — they are not mounted.**
   The cursor, the sheen and the magnetic transform skip their work entirely rather
   than animating to zero. Same for a coarse pointer, where a sheen that tracks a
   finger it cannot see is pure cost.
4. **The icon set is hand-drawn on a 24px grid at 1.5px stroke with square caps.**
   No Lucide, no FontAwesome, nothing in a tinted square. `IconZero` is the Ø motif
   and is reused as the mode toggle, the loader and the favicon, so the signature
   element has exactly one definition.
5. **Button shape is decided once, not per use:** primary is fully round (it echoes
   the Ø) and magnetic; ghost and quiet are square and are not. This removes
   per-component radius guessing, which is how a system drifts.

**Verification**

- `scripts/verify-material.mjs` — **15 behavioural checks, 15 pass.** These assert
  behaviour in a real browser, not the presence of classes:
  - the cursor renders, and its state moves default → link → default as the pointer
    crosses a link; the native cursor is hidden beneath it and restored afterwards
  - the magnetic label genuinely translates (measured matrix offset 1.333px)
  - the sheen tracks to the exact hover coordinates (30% / 40%) and clears on leave
  - the three glass levels resolve to three distinct blurs (12 / 20 / 32px)
  - the focus ring is 2px and present
  - `html[data-motion="reduced"]` is set under an emulated OS preference, and the
    cursor and magnetic transform are both inert in that state
  - all content is still present and readable under reduced motion
  - cursor and magnetic are inert on a coarse pointer
- **Two failures during the run were test bugs, not component bugs**, and were fixed
  in the harness rather than worked around in the components:
  1. the sheen check hovered an element below the 900px fold, so `elementFromPoint`
     returned nothing — fixed with `scrollIntoViewIfNeeded` before hovering;
  2. the focus-ring check read `getComputedStyle(el, ':focus-visible')`, which returns
     empty strings by spec — fixed by focusing the element and reading its computed
     outline.
- `npm run build` clean in 657ms. Index JS 11.87KB gzip, vendor 81.23KB gzip — still
  far inside the §10 budget.

**Known limitation**
Icon legibility at small sizes is a human-eyes judgement I cannot make (no image
input). Screenshots are in `.verify/specimen/`.

**Next task**
Task 4 — atmosphere: the aurora shader with its five per-page moods, GPU-instanced
particles, light trails, the FPS monitor and quality tiers, the router with animated
route transitions, and the cinematic preloader.

---

## 2026-11-05 — Task 4: Atmosphere — aurora, particles, trails, tiers, routing, preloader

**Built**
The complete ambient layer the site lives inside: the aurora shader field,
GPU dust, light trails, the adaptive quality system, smooth scroll, routing
with animated transitions, and the cinematic preloader.

**Files touched**
- `src/lib/quality.ts` — capability probe, three tiers, rolling-median FpsMonitor
- `src/lib/atmosphere.ts` — the store: scroll, velocity, mood, tier, scene state
- `src/lib/scroll.ts` — Lenis wired to the store and to ScrollTrigger, one clock
- `src/three/aurora.ts` — the field shader with five moods as uniforms
- `src/three/particles.ts` — instanced dust, 3 parallax layers, faked DOF
- `src/three/trails.ts` — catmull-rom ribbons with a travelling head
- `src/scene/Aurora.tsx`, `Particles.tsx`, `Trails.tsx`, `Post.tsx`, `Scene.tsx`, `StaticAurora.tsx`
- `src/components/Preloader.tsx`, `RouteTransition.tsx`, `SceneGate.tsx`
- `src/App.tsx`, `src/styles/tokens.css` (preloader + header)
- `scripts/test-quality.mjs` (12 unit checks), `scripts/verify-atmosphere.mjs` (20 browser checks)

**Decisions**

1. **Quality never oscillates.** A rolling 60-frame *median* (not mean — one GC pause
   or a tab switch must not demote a comfortable machine) under 50fps for a sustained
   2s drops exactly one tier, one way, and stops at the floor. Demotion takes trails
   and particles off the *end* of a fixed deterministic list rather than reshuffling,
   so the scene does not visibly rearrange itself when a tier drops.
2. **One shader for the aurora, five moods as uniforms.** A domain-warped fBm field
   whose warp/speed/density/brightness come from a per-page `vec4` table: calm, drift,
   dense, quiet, signal. The mood is *eased* on route change so the atmosphere shifts
   rather than cuts. Scroll lifts the field and velocity swirls it — velocity-aware,
   per §6.3. The teal/indigo mix is capped at 18% of a secondary band.
3. **DOF is faked, not rendered.** Particles use per-layer size+alpha falloff and no
   DOF pass — at this count that buys the same read for none of the cost.
4. **DOF of authority: only additive blending may brighten the scene** (particles and
   trails), enforcing "if everything glows, nothing is premium" at the renderer level.
   Bloom is seeded only by emissive (the Ø rim, trail heads), never by UI or text.
   Chromatic aberration is capped at 0.0005 so it reads as lens quality.
5. **three.js never downloads when it cannot run.** A `SceneGate` probes WebGL before
   `import()`: `lazy()` alone downloads the ~270KB-gzip chunk on mount even for
   fallback users. Verified in-browser that the `three` chunk is *not requested*
   without WebGL, and that the CSS static aurora paints instead. A first attempt put
   `StaticAurora` inside `Scene.tsx`, which statically pulled the whole scene into the
   eager chunk — moved to its own module.
6. **Scroll has exactly one clock.** GSAP's ticker drives Lenis, Lenis reports to both
   the atmosphere store and `ScrollTrigger`, so the aurora's velocity and the pinned
   camera work cannot drift apart. Under reduced motion Lenis is never started — the
   store still gets *position* but zero velocity, so nothing stretches or swirls.
7. **The preloader reports real progress and cannot hold the page.** Fonts (half) +
   document ready (half). It exits when ready, has a 650ms minimum so it does not
   flicker, and a hard 2.5s ceiling after which it exits regardless. The Ø mark's ring
   is drawn by real `stroke-dashoffset` progress and the slash sweeps in past 72%.
   The LCP element is the H1 wordmark, painted *under* the preloader.
8. **All scene movement is in shaders, not JS.** Aurora, particles and trails compute
   position from `uTime`/`uScroll`/`uVelocity` in the vertex/fragment stage; per-frame
   JS only writes uniforms and never triggers a React render (the atmosphere store is
   `useSyncExternalStore`, not context, specifically so 60Hz scroll updates don't
   re-render the tree).

**Verification**

- `scripts/test-quality.mjs` — **12/12 pass** on the trickiest logic: no demotion on
  a brief dip or a single stall, median ignores a minority of slow frames, demotion is
  one-way and stops at low, dispose halts monitoring, tiers degrade monotonically, low
  disables all post + DPR clamps to 1. Caught one real bug: `sample()`'s first call
  only primes the timestamp, so the median stays `null` one frame longer than expected.
- `scripts/verify-atmosphere.mjs` — **20/20 pass** in a real browser:
  - WebGL path: canvas mounts with a real buffer, is `aria-hidden`, does not intercept
    pointer events, compiles all shaders with zero errors, produces visible output,
    and animates (frame content differs over 900ms).
  - Preloader exits at ~2.7s and unlocks scroll.
  - **LCP element is `<H1>`**, not the canvas, at **1.4s** — inside the 2.5s budget
    and painted before WebGL initialises, exactly per §10.
  - Reduced motion: `data-motion="reduced"` set, content fully visible with no
    residual transform, render loop on demand.
  - No WebGL: no canvas, the CSS aurora paints, **three.js never downloads**, content
    renders fine.
  - Nav exposes all five routes; skip link targets `#main`.
- Two earlier test failures were harness bugs, not scene bugs: a too-narrow canvas
  selector (R3F wraps the canvas in its own div) and an rAF-cadence check that only
  measures headless software-GL throttling. Both fixed to assert real signals.
- `npm run build` clean; `three` is correctly lazy at 270KB gzip behind the gate.

**Known limitation**
Whether the aurora *looks* expensive is a human-eyes call I cannot make (no image
input). Programmatically it compiles, animates and stays legibly dark under text; the
screenshot comparison exists for a human to confirm the look.

**Next task**
Task 5 — Home: the refractive Ø hero with pointer inertia, the decode wordmark, the
status strip, the magnetic CTA, and the scroll-driven camera sequence teasing
featured projects.
