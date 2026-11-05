# ZEROOX

Cinematic 3D portfolio for an independent digital developer and offensive-security
identity. AMOLED black, one electric-blue accent, glass as the signature material.

> Break it. Understand it. Build it better.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript |
| 3D | three.js via @react-three/fiber, drei, postprocessing |
| Shaders | custom GLSL (aurora, light trails, particles) |
| Scroll | GSAP + ScrollTrigger, Lenis smooth scroll |
| UI motion | Framer Motion (micro-interactions, route transitions) |
| Styling | Tailwind with a custom token layer, no default palette |
| Routing | react-router with an animated transition layer |
| Tests | Playwright smoke tests |

## Quick start

```bash
npm install
cp .env.example .env   # fill in keys
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | dev server on :5173 |
| `npm run build` | production build to `dist/` |
| `npm run preview` | serve the production build |
| `npm run test:e2e` | Playwright smoke tests |

## Documentation

- `DESIGN.md` — tokens, glass spec, type scale, motion principles
- `PROGRESS.md` — build log, decisions, verification
- Content lives in `src/content/*.ts`. Anything with `placeholder: true` must be
  replaced before launch.

## Status

In active construction. See `PROGRESS.md` for the current task.
