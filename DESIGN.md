# DESIGN.md — ZEROOX

The authority for every visual and motion decision in this repo. Code references
tokens, never raw values. When this document and an instinct disagree, this document wins.

**Rule language:** *must* is non-negotiable. *should* is a strong default that needs a
stated reason to break.

---

## 1. Context and goals

A portfolio for an anonymous offensive-security specialist and digital developer.
It must read as a luxury object: a high-end automotive launch film crossed with a
private console. Restrained, mysterious, expensive.

**The idea.** *The null byte — zero, the handle's own origin — becomes the refractive
object the whole site orbits.* The Ø is hero geometry, preloader, cursor state, mode
toggle, favicon and 404. Every other red-team site is green text on black; this one is
a single piece of black glass.

**Goals**
- One focal point per viewport. The visitor always knows where to look.
- The page feels *shot*, not scrolled: camera moves, rack focus, dollies.
- Real substance. Every section carries its full content, not three cards of filler.
- Operable: the terminal genuinely drives the site.

**Non-goals**
- Not a resume. No percentage skill bars, no logo grids, no timeline-as-list.
- Not a toy. No gaming tropes, no badges, no XP.
- Not a showcase of effects. Nothing that costs frames without carrying meaning.

**Anti-goals** — these make it a failure even if it ships and works:
- It looks like a Tailwind template with a dark theme.
- Everything glows, so nothing reads as premium.
- The 3D is impressive and the content is thin.
- It is unusable without WebGL, with a keyboard, or with reduced motion on.

---

## 2. Colour

Strict. Five families, one accent hue. Any colour not derivable from these is a bug.

### 2.1 Ground

| Token | Value | Use |
|---|---|---|
| `--void` | `#000000` | page ground. True AMOLED black, everywhere |
| `--surface-1` | `#050608` | the faintest lift off the void |
| `--surface-2` | `#0A0C10` | panel fill under glass, section field change |
| `--surface-3` | `#11141A` | raised panel fill, terminal chrome |

Surfaces separate by a **tone step, never a border line and never a shadow**. The only
1px lines in the system are the glass gradient edges (§3) and real form fields.

### 2.2 Accent — one hue, derived

| Token | Value | Use |
|---|---|---|
| `--accent` | `#3D8BFF` | the accent. Actions, active state, light sources |
| `--accent-edge` | `#7FB2FF` | tint. Bright end of a glass edge, focus ring |
| `--accent-glow` | `rgba(61,139,255,0.55)` | light emission, bloom seed |
| `--accent-muted` | `#1E4680` | shade. Inactive, trailing, de-emphasised |
| `--accent-deep` | `#0B1A33` | deepest shade. Bounce light under glass |

The accent **must** appear on the primary action and at most one other thing per
viewport. A viewport where three things glow has no accent at all.

### 2.3 Aurora-only hues

Permitted **only** inside the aurora shader, never in UI, never above 18% mix:

| Token | Value |
|---|---|
| `--aurora-teal` | `#1E6B73` |
| `--aurora-indigo` | `#2B2F6B` |

### 2.4 Text — measured, not guessed

Contrast computed against `--void`. These numbers decide what each level may hold.

| Token | Value | Contrast | May be used for |
|---|---|---|---|
| `--text-1` | `rgba(255,255,255,0.92)` | **17.62:1** | headlines, body, anything that must be read |
| `--text-2` | `rgba(255,255,255,0.64)` | **8.33:1** | secondary copy, captions, nav rest state. AA at all sizes |
| `--text-3` | `rgba(255,255,255,0.40)` | **3.66:1** | large text ≥ 24px only, or disabled. **Must not** carry body copy |
| `--text-4` | `rgba(255,255,255,0.24)` | **1.93:1** | decorative texture only. **Must never** carry information |

Accent on void is **6.34:1**; `--accent-edge` is **9.71:1**. Both safe for normal text
and for focus rings.

Worst realistic case on glass is text over an opaque `--surface-3` (`#11141A`):
`--text-1` **15.62:1**, `--text-2` **7.94:1**, `--text-3` **3.83:1**, accent **5.56:1**.
Every level therefore holds its rating on every surface in the system.

Measured with the WCAG 2.x relative-luminance formula; recompute if any value changes.

**Must:** running copy is `--text-1` at ≥ 16px. A page set entirely in `--text-2` and
below reads unfinished. **Must not:** place any text the visitor needs on `--text-4`.

On glass, text contrast is verified against the *darkest* backdrop the panel can sit
over, not against the panel fill.

---

## 3. Glass — the signature material

Not `backdrop-blur` plus a white border. Five layers, in paint order:

1. **Backdrop** — `backdrop-filter: blur(Npx) saturate(1.1)`
2. **Fill** — a near-black surface token at low alpha
3. **Edge** — a 1px gradient border, bright at top-left → transparent at bottom-right.
   Implemented with a `::before` mask so the gradient is real, not a flat colour.
4. **Inner highlight** — a single `inset 0 1px 0` hairline of white at low alpha, the
   light catching the top lip
5. **Grain** — a tiled 128px SVG noise at 2–4% opacity, `mix-blend-mode: overlay`.
   Kills the plastic look. One shared asset, never per-component.
6. **Bounce** — a soft `--accent-deep` radial *underneath* the panel, as if the blue
   light below is reflecting up. The only place a glow is ambient.

**Pointer sheen.** A radial highlight tracks the pointer across the panel, driven by
two CSS custom properties (`--mx`, `--my`) set from a single throttled listener.
Opacity 0 at rest → 0.06 on hover. It **must** be disabled under reduced motion and on
touch (no hover to track).

### 3.1 The three levels

Reuse these. A fourth level is a bug.

| | `glass-surface` | `glass-raised` | `glass-overlay` |
|---|---|---|---|
| Role | sits in the page: panels, cards, strips | lifts on interaction: hovered project, active nav | floats above: terminal, dialog, menu |
| Blur | 12px | 20px | 32px |
| Fill | `--surface-1` @ 48% | `--surface-2` @ 62% | `--surface-3` @ 78% |
| Edge alpha | 0.10 → 0 | 0.18 → 0 | 0.26 → 0 |
| Inner highlight | 0.04 | 0.07 | 0.10 |
| Bounce | none | 18% | 28% |
| Shadow | none | none | `0 24px 64px -16px rgba(0,0,0,.9)` |
| Sheen | on hover | always tracking | on hover |

Only `glass-overlay` carries a shadow, because only it genuinely floats. Things at rest
get no shadow and no glow.

### 3.2 Fallback

`@supports not (backdrop-filter: blur(1px))` → the fill goes opaque at 92% and the blur
is dropped. The layout must not shift.

---

## 4. Typography

Three faces, self-hosted, variable where possible, `font-display: swap`, subset to latin.

| Role | Face | Why |
|---|---|---|
| Display | **Archivo** variable (`wght` 100–900, `wdth` 62–125) | wide, technical, editorial. The `wdth` axis gives the wide headline *and* the scroll weight-shift from one file |
| Text | **Manrope** variable (`wght` 200–800) | refined, quiet, excellent at small sizes |
| Mono | **JetBrains Mono** variable | system detail: coordinates, indices, status codes, the terminal |

None of Inter, Roboto, Space Grotesk, Poppins or Montserrat appears in this project.

### 4.1 Scale

Fluid, five visible steps. Headline-to-body ratio at desktop is ~11:1 — far past the
4.3 median, which is the point.

| Token | Clamp | Face / settings |
|---|---|---|
| `--fs-display-xl` | `clamp(3.5rem, 11vw, 11rem)` | Archivo, `wdth 118`, `wght 500`, tracking `-0.045em`, leading `0.86` |
| `--fs-display-l` | `clamp(2.5rem, 7vw, 6rem)` | Archivo, `wdth 112`, `wght 500`, tracking `-0.035em`, leading `0.92` |
| `--fs-display-m` | `clamp(2rem, 4.5vw, 3.5rem)` | Archivo, `wdth 105`, `wght 500`, tracking `-0.025em`, leading `1.0` |
| `--fs-heading` | `clamp(1.5rem, 2.5vw, 2rem)` | Archivo, `wdth 100`, `wght 600`, tracking `-0.015em`, leading `1.1` |
| `--fs-statement` | `clamp(1.25rem, 2vw, 1.75rem)` | Manrope, `wght 300`, leading `1.35` |
| `--fs-body` | `clamp(1rem, 1.1vw, 1.125rem)` | Manrope, `wght 400`, leading `1.55` |
| `--fs-small` | `0.875rem` | Manrope, `wght 400`, leading `1.5` |
| `--fs-micro` | `0.6875rem` | JetBrains Mono, `wght 500`, tracking `+0.14em`, uppercase |

### 4.2 Laws

- **Every headline fits two lines or fewer at 390, 768, 1440 and 1920.** Cut words
  first, widen the measure second, reduce size last. Budget ≈ 32 characters.
- A statement set large is a `<p>` or `<blockquote>`, caps at `--fs-statement`
  (28px desktop), runs to ~25 words. Larger than that it is a headline and the
  two-line law applies.
- Measure 45–75 characters. Left-aligned by default; at most one centred moment per page.
- Five sizes per page is the ceiling.
- `--fs-micro` is the *only* uppercase-tracked style, and it is reserved for genuine
  system data: `42.3601° N`, `IDX 03/08`, `SYS: ONLINE`, `AUTH: REQUIRED`. It must never
  label a section the way an eyebrow does — that information goes in the heading.

### 4.3 Animated type

- **Decode/scramble** on `ZEROOX` and at most two other labels per page. Cycles glyphs
  from a fixed charset, resolves left to right, 420ms + 18ms per character, runs once.
- **Line masks** on headline entrance: `clip-path` reveal, `--ease-out-expo`, 60ms stagger.
- **Variable-weight shift** on scroll: `wght` 500 → 620 mapped to scroll progress on
  pinned statements only.

All three: the final text is in the DOM as real text from first paint. The animation
only ever *reveals* it. Under `prefers-reduced-motion`, the text is simply present.
Decode is skipped on any element the visitor has already seen this session.

---

## 5. Layout

- One grid: 12 columns, `--gutter` 24px desktop / 16px phone, max content width 1440px
  with the page content inset by **equal** outer margins at every width.
- Section rhythm: 120–240px vertical gap on desktop, 72–120px on phone. The gap
  between sections is clearly larger than any gap inside one.
- **Asymmetry lives inside the grid, never in the frame.** Both outer margins are
  always equal. An off-centre heading **must** be answered by something at the far side:
  its figure, a second column, a mono data block. A void is placed only when something
  closes it.
- No stretch of the page taller than ~½ viewport holds nothing. One deliberate rest per
  page is the limit; a rest is a placed object or a field of colour, not emptiness.
- Neighbouring sections **must not** share a composition.
- Every section opens with a heading that names it. The first screen carries the one `h1`.

### Banned layouts
Three-card rows. Uniform rounded-card grids. Centred-everything. Icon-topped feature
cards. Eyebrow labels above headings. Index numbering (`01 / 02 / 03`). Hairline
dividers used as decoration.

---

## 6. Motion

Motion has purpose and **rest**. A page where something is always moving is noise.

### 6.1 Easing — no elastic, no bounce, ever

| Token | Curve | Use |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | the default. Entrances, reveals |
| `--ease-in-out-quint` | `cubic-bezier(0.83, 0, 0.17, 1)` | camera moves, route transitions, pinned sections |
| `--ease-out-quad` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | small state changes, hover |
| `--ease-linear` | `linear` | only continuous ambient drift (aurora, particles) |

### 6.2 Duration

| Token | ms | Use |
|---|---|---|
| `--dur-tap` | 120 | press feedback |
| `--dur-micro` | 240 | hover, focus, toggle |
| `--dur-enter` | 480 | element entrance |
| `--dur-route` | 720 | page transition |
| `--dur-camera` | 1400 | cinematic camera move |

### 6.3 Choreography

- Section entrance: heading → copy → figure, 70ms stagger, 24px rise + opacity, once.
- Scroll-linked motion is **velocity-aware**: light trails stretch and the aurora
  densifies with scroll speed, then settle. Lenis provides the smoothed velocity.
- Camera: dolly, tilt and rack-focus between sections. Never a spin, never a barrel roll.
- Transform and opacity only. Never animate layout properties.

### 6.4 Reduced motion

`prefers-reduced-motion: reduce` **and** a visible "reduce effects" toggle (persisted)
both route to the same state:
- aurora → a static rendered gradient field, no animation loop
- particles and trails → off
- camera moves → instant cuts
- decode/scramble → final text immediately
- all travel → 0, opacity transitions kept at `--dur-micro`

**Content is never hidden behind an animation.** Everything is in the DOM and legible
with JavaScript disabled or a failed script.

---

## 7. 3D and shaders

### 7.1 Scene budget

| | High | Medium | Low |
|---|---|---|---|
| DPR | `min(devicePixelRatio, 2)` | 1.5 | 1 |
| Particles | 24,000 | 9,000 | 0 |
| Light trails | 12 | 5 | 0 |
| Post | bloom + light CA + vignette | bloom only | none |
| Ø material | refraction (MSAA, 2 bounces) | refraction (1 bounce) | matte glass, no refraction |
| Shadows | off (light is volumetric, not cast) | off | off |

Tier is chosen once from a hardware probe, then **demoted** by a runtime FPS monitor:
a rolling 60-frame median under 50fps for 2 consecutive seconds drops one tier. It
never promotes back up in a session — flip-flopping is worse than a lower tier.

### 7.2 Post-processing

Bloom: threshold 0.82, intensity 0.5, radius 0.6. Seeded by the Ø's emissive rim and
the trails only — **never** by UI or text. Chromatic aberration: offset ≤ 0.0006, so
it registers as lens quality and is never visible as colour fringing. Vignette subtle.

### 7.3 Aurora

A single fullscreen shader quad behind everything. Domain-warped fBm, 3 octaves, deep
blue with ≤18% teal/indigo mix. Uniforms: time, scroll progress, scroll velocity,
pointer, and a per-page `mood`:

| Page | Mood | Reads as |
|---|---|---|
| Home | `calm` | slow, wide, low density |
| Projects | `drift` | lateral motion following traversal |
| Arsenal | `dense` | tighter warp, more structure, highest density |
| About | `quiet` | near-still, very low contrast |
| Contact | `signal` | faint directional pulse toward the panel |

### 7.4 Particles and trails

Particles: GPU-instanced points, 3 parallax depth layers, DOF-faked by size+alpha
per layer. Trails: additive thin curves on a catmull-rom path, drifting, reacting to
scroll velocity. Additive blending is the only blend mode that may brighten the scene.

### 7.5 WebGL unavailable

Detect once. Fall back to a still, composed hero: the Ø as a crisp SVG with a real
gradient edge over a static aurora image. It must look deliberate, not broken. All
content and navigation work.

---

## 8. Components

- **Buttons:** flat, one fill, fully round or square-cornered — decided once: this
  system uses **fully round** for the primary action (it echoes the Ø) and square for
  everything else. No gradient fills. Primary action per viewport: one.
- **Magnetic button:** the label translates up to 6px toward the pointer within a 120px
  radius, `--ease-out-quad`. Off under reduced motion and on touch.
- **Cursor:** a custom context-aware cursor (default dot → text bar → link ring →
  drag arrows → project frame). The native cursor is restored on touch devices and
  whenever a form field has focus.
- **Nav:** wordmark, four links, the Ø mode toggle. A plain bar. No floating pill.
- **Icons:** one custom set, drawn as a single consistent 24px grid, 1.5px stroke,
  square caps. No Lucide, no FontAwesome, no emoji, never an icon in a tinted square.
- **Focus:** `outline: 2px solid var(--accent-edge)` with a 3px offset, on every
  interactive element, always visible. Focus is never removed, only restyled.
- Every control works from the keyboard in reading order and has an accessible name.

---

## 9. Accessibility — testable criteria

Each line is a check a reviewer can execute.

1. Tab through every page: every interactive element is reachable, in reading order,
   with a visible focus ring at ≥3:1 against its backdrop.
2. Body copy measures ≥4.5:1; text ≥24px measures ≥3:1. `--text-4` carries no information.
3. Every page has exactly one `h1`; heading levels never skip.
4. The terminal overlay traps focus while open, closes on `Escape`, and returns focus
   to the toggle.
5. Arsenal's constellation has a keyboard-navigable list fallback exposing the same data.
6. The contact form associates every label, announces errors via `aria-live`, and never
   relies on colour alone.
7. With JS disabled, all page text is present and readable.
8. With `prefers-reduced-motion: reduce`, no element travels and no loop runs.
9. All decorative canvases are `aria-hidden="true"`.
10. No horizontal scroll at 390, 768, 1440, 1920.

---

## 10. Performance budget

- 60fps on a mid-range laptop; adaptive tiers per §7.1.
- Lighthouse: Performance ≥90 desktop, Accessibility ≥95.
- LCP < 2.5s. The LCP element is **text**, painted before WebGL initialises.
- Initial JS (gzip) < 180KB excluding the lazy 3D chunk. Three.js and the scene load
  per-route and never block first paint.
- Preloader shows real asset progress and **must not** hold the page once assets are
  ready. Hard ceiling 2.5s, then it exits regardless.
- Textures KTX2, geometry Draco where either is used at all.

---

## 11. Voice

Spare, confident, dry. Short sentences. Specific.

**Banned words:** passionate, crafting, journey, welcome to my portfolio, innovative,
cutting-edge, seamless, synergy, leverage, robust, delve.

No lorem ipsum. No invented testimonials, client logos, awards or metrics. Placeholder
content carries `placeholder: true` in `src/content/*.ts` so it is greppable.

---

## 12. QA checklist — run before any task is marked done

- [ ] Screenshotted at 390 / 768 / 1440 / 1920, and the screenshots were *opened and looked at*
- [ ] No headline exceeds two lines at any of those widths
- [ ] Outer margins equal; no section stranded on one side; no empty stretch > ½ viewport
- [ ] One focal point and at most one accent-glowing element per viewport
- [ ] Neighbouring sections differ in composition
- [ ] Keyboard pass completed; focus visible everywhere
- [ ] `prefers-reduced-motion` pass: nothing travels, nothing loops, nothing is hidden
- [ ] No horizontal scroll at any width
- [ ] FPS ≥ 55 on the dev machine at the default tier
- [ ] Zero console errors or warnings
- [ ] Checked against the anti-slop list in the brief

---

## 13. Phased plan

Built page by page. Each phase ends with the §12 checklist, a PROGRESS.md entry, and a
commit.

| # | Phase | Delivers | Done when |
|---|---|---|---|
| 2 | Foundation | Vite/React/TS, Tailwind token layer, 3 self-hosted faces, `src/content/*.ts` complete | `npm run build` clean; tokens resolve; content typed |
| 3 | Material | 3 glass levels, grain asset, cursor, magnetic button, icon set, mono micro-label | a kitchen-sink route shows all three levels and every icon |
| 4 | Atmosphere | aurora shader + moods, particles, trails, FPS monitor + tiers, router, route transitions, preloader | tier demotion observed; transitions clean; preloader exits ≤2.5s |
| 5 | Home | 3D Ø hero, decode wordmark, status strip, magnetic CTA, scroll camera sequence, featured teasers | §12 passes; LCP text < 2.5s |
| 6 | Projects | depth-space traversal, tilt/sweep/parallax, shared-element transition, 7 case studies | every case study reachable and complete |
| 7 | Arsenal | orbital constellation, offsec as dominant cluster, telemetry readout, keyboard list fallback | full keyboard parity with the 3D view |
| 8 | About | manifesto, pinned principles, boot-log timeline, ethics line | pinning correct at all widths |
| 9 | Contact | terminal-prompt fields, live validation, transmit animation, real backend + Turnstile | a real message arrives at the inbox |
| 10 | Hacker mode | theme switch, terminal with history + autocomplete, discovery counter, 5 Easter eggs, optional audio off by default | every command works; audio silent until opted in |
| 11 | Shell | 404, meta/OG, favicon Ø, a11y pass, reduced-motion toggle, WebGL fallback | §9 all ten criteria pass |
| 12 | Hardening | perf pass, Playwright smoke tests, CSP + headers, Lighthouse | budgets in §10 met; tests green |
| 13 | Ship | README, deploy config, anti-slop self-review | deployed; every violation fixed |
