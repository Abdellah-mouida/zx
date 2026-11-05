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

