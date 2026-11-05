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
