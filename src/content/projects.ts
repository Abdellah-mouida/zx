import type { Project } from './types';

/**
 * Case studies.
 *
 * EVERY entry is `placeholder: true` — these are written to the real voice
 * and shaped like genuine case studies, but the work described is invented
 * for the build. Replace with real projects before launch.
 *
 * Hard rule, enforced by content review: no operational malware, no working
 * exploit payloads, no real target names, no client identities. Design,
 * research and lessons only. `constraint` states what each project
 * deliberately does not publish.
 */

export const projects: Project[] = [
  {
    id: 'siege',
    slug: 'siege',
    title: 'SIEGE',
    blurb: 'A lab-only C2 framework built to teach adversary emulation.',
    kind: 'tooling',
    year: '2024',
    stack: ['Rust', 'Go', 'gRPC', 'SQLite'],
    problem:
      'Teaching adversary emulation with a commercial C2 puts a licence between a student and the concepts. Teaching it with a toy script teaches the script. Neither shows why a real operator makes the choices they make: why beacon jitter exists, why a sleep mask is a tradeoff, why the loudest step in a chain is usually the one nobody logs.',
    role: 'Sole designer and author. Architecture, implant protocol, operator server, course material.',
    process: [
      'Mapped the operator workflow of three public frameworks and wrote down every decision point where OPSEC and convenience disagree.',
      'Designed a listener/implant protocol that is deliberately legible: every field documented, nothing obfuscated, so the traffic can be read in Wireshark alongside the source.',
      'Built the server in Rust with a hard architectural boundary — implants cannot execute arbitrary operator-supplied code, only a fixed, auditable task set.',
      'Wrote matching Sigma rules for every task the framework can perform, so the detection half ships with the offense half.',
      'Ran it as the spine of a six-session emulation course in an isolated lab range.',
    ],
    outcome:
      'Students could articulate why each OPSEC tradeoff exists rather than repeating defaults. The paired Sigma rules turned out to be the more valuable artifact: writing detections for your own tool exposes which of its behaviours are genuinely hard to hide and which were just unexamined habit.',
    constraint:
      'Published: the architecture write-up, the protocol documentation and the Sigma ruleset. Not published: the implant source. The teaching value is in the design, and the design is what the write-up carries.',
    featured: true,
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'bloodline',
    slug: 'bloodline',
    title: 'BLOODLINE',
    blurb: 'An Active Directory attack-path visualizer for the defender side.',
    kind: 'engineering',
    year: '2024',
    stack: ['TypeScript', 'Three.js', 'Neo4j', 'Python'],
    problem:
      'BloodHound answers "is there a path" extremely well. It answers "which single change removes the most paths" far less directly, and that is the only question a defender with one maintenance window actually has. The graph is also flat, so the structural shape of a domain — tiering, the handful of accounts that bridge everything — is hard to see.',
    role: 'Sole author. Graph ingestion, scoring model, 3D renderer.',
    process: [
      'Ingested collector output into Neo4j and re-expressed the edges as a weighted graph where weight is operator effort, not a boolean.',
      'Implemented a betweenness-style score over the attack graph to rank nodes by how many distinct paths they carry.',
      'Rendered the domain in depth space with tiering on the vertical axis, so a flat tenancy looks flat and a tiered one looks tiered.',
      'Added a what-if mode: remove an edge, recompute, and show the paths that die.',
      'Validated against four deliberately misconfigured lab domains with known path counts.',
    ],
    outcome:
      'On the lab domains, the top three scored nodes accounted for a median 71% of paths to Domain Admin. The what-if mode changed how remediation got discussed: the conversation moved from a list of 200 findings to three specific changes and what each one actually bought.',
    constraint:
      'Reads collector output; never collects. No credential handling anywhere in the codebase.',
    featured: true,
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'telemetry-lab',
    slug: 'telemetry-lab',
    title: 'TELEMETRY LAB',
    blurb: 'An explorer for what EDR actually records, and what it misses.',
    kind: 'research',
    year: '2023',
    stack: ['C#', 'Python', 'ETW', 'Sigma'],
    problem:
      'Evasion discourse is mostly folklore: a technique is "quiet" because someone said so. The underlying question — which specific events a given action produces, and which sensors see them — is answerable with instrumentation, and almost nobody instruments it before forming an opinion.',
    role: 'Sole author. Harness, event correlator, write-ups. Extends the thesis work.',
    process: [
      'Built a harness that executes a catalogued action in an isolated VM while recording ETW providers, Sysmon and the audit log simultaneously.',
      'Correlated every resulting event back to the action by timestamp and process lineage, producing a per-action event signature.',
      'Catalogued 140 actions across process, credential, lateral and persistence categories.',
      'Diffed signatures across Windows builds to find where coverage silently changed between versions.',
      'Published the gaps as Sigma rules rather than as techniques.',
    ],
    outcome:
      'The findings mostly contradicted the folklore. Several widely described "quiet" actions produce a distinctive signature in a provider nobody collects by default — which makes them quiet operationally and loud architecturally. Eleven coverage gaps became Sigma rules; the method, not the gaps, is the durable part.',
    constraint:
      'Publishes detections and the methodology. Never publishes a bypass. The point of finding a gap is closing it.',
    featured: true,
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'sabot',
    slug: 'sabot',
    title: 'SABOT',
    blurb: 'A fuzzing harness collection for parsers that fail interestingly.',
    kind: 'research',
    year: '2023',
    stack: ['C', 'Rust', 'AFL++', 'libFuzzer'],
    problem:
      'Most fuzzing tutorials stop at "it found a crash". The work that matters starts there: triage, root-cause, minimising, and deciding whether a crash is a bug, a vulnerability, or an artifact of the harness. That gap is where people give up on fuzzing.',
    role: 'Sole author. Harnesses, triage tooling, write-ups.',
    process: [
      'Wrote harnesses for nine open-source parsers — image, archive and protocol formats — each with a structure-aware mutator.',
      'Built a triage pipeline that deduplicates crashes by stack hash, minimises inputs, and classifies memory errors by ASAN category.',
      'Documented every crash end to end: input, minimised repro, root cause in the source, and the upstream fix if one existed.',
      'Measured coverage honestly, including the plateaus where a harness had stopped learning and needed restructuring.',
    ],
    outcome:
      'Four of the nine harnesses reached crashes that reduced to real memory-safety bugs; three had already been fixed upstream, and one was reported and patched. The more useful output was the negative result: two harnesses plateaued because the format needed a grammar, not a mutator — which is the lesson the tutorials omit.',
    constraint:
      'Harnesses and triage tooling are public. No crash is published before an upstream fix ships.',
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'aurora-engine',
    slug: 'aurora-engine',
    title: 'AURORA ENGINE',
    blurb: 'A WebGL aurora renderer that holds 60fps on integrated graphics.',
    kind: 'engineering',
    year: '2025',
    stack: ['Rust', 'WGSL', 'GLSL', 'TypeScript'],
    problem:
      'Volumetric aurora effects on the web are usually either beautiful on a workstation and a slideshow on a laptop, or cheap enough to run anywhere and obviously cheap. The interesting constraint is holding the look while the frame budget drops by an order of magnitude.',
    role: 'Sole author. Shader authoring, tier system, benchmark suite.',
    process: [
      'Built the field as domain-warped fBm and measured the cost of every octave on four reference GPUs.',
      'Replaced the expensive third octave with a precomputed curl texture, which held the silhouette at a fraction of the per-frame cost.',
      'Designed a three-tier quality system driven by a rolling-median FPS monitor that demotes once and never oscillates.',
      'Compiled the noise generation to WASM from Rust so the CPU-side field generation stopped being the bottleneck.',
      'Benchmarked against a fixed 20-second scroll trace rather than a static frame, since scroll velocity is what actually stresses it.',
    ],
    outcome:
      'Held 60fps on integrated graphics at the medium tier and 120fps on a discrete GPU at high. The tier system is the reusable part, and it is the same one running behind this site.',
    constraint: undefined,
    featured: true,
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'zephyr',
    slug: 'zephyr',
    title: 'ZEPHYR ARCHIVE',
    blurb: 'Ninety-one CTF write-ups, indexed by the technique that mattered.',
    kind: 'archive',
    year: '2021-present',
    stack: ['TypeScript', 'MDX', 'Astro'],
    problem:
      'A CTF write-up is usually written once, for the person who already solved it. Indexed by competition it is nearly unsearchable; the thing you want to retrieve two years later is the technique, not the event.',
    role: 'Author of all entries. Also the indexing model and the site.',
    process: [
      'Rewrote every write-up to a fixed structure: what was visible, what was tried and failed, the pivot, and what the challenge was actually teaching.',
      'Tagged each by technique rather than category, with the failed approaches tagged too.',
      'Built retrieval around the failures, because a search for what did not work is the more useful query.',
      'Kept every entry short enough to read in one sitting.',
    ],
    outcome:
      'Ninety-one entries across web, binary, crypto and AD categories. The failure index gets used more than the solution index, which was unexpected and is probably the whole point.',
    constraint: undefined,
    placeholder: true,
    placeholderNote: 'Invented for the build. Replace with a real project or remove.',
  },

  {
    id: 'this-site',
    slug: 'this-site',
    title: 'THIS SITE',
    blurb: 'A portfolio built to the same budget as a product.',
    kind: 'engineering',
    year: '2026',
    stack: ['React', 'TypeScript', 'Three.js', 'GLSL', 'GSAP'],
    problem:
      'A 3D portfolio is normally a tradeoff announcement: it is impressive, and it is slow, inaccessible, and unusable without WebGL. There is no technical reason those have to travel together — only a habit of treating the budget as optional once the scene looks good.',
    role: 'Sole author. Design system, shaders, scene, accessibility and the backend.',
    process: [
      'Wrote the token system and contrast ratios before any component, and computed every text level against the real backdrops rather than estimating.',
      'Made the LCP element text, painted before WebGL initialises, so the first meaningful frame never waits on the scene.',
      'Built the adaptive quality tiers and the FPS monitor first, so every subsequent effect was added against a known budget.',
      'Gave every 3D interface a keyboard-navigable equivalent exposing the same data, including the Arsenal constellation.',
      'Built the reduced-motion path as a real state rather than a disable switch: nothing travels, nothing loops, nothing is hidden.',
      'Shipped a static composed fallback for no-WebGL that is meant to look deliberate.',
    ],
    outcome:
      'Lighthouse Performance 90+ desktop and Accessibility 95+, with the full scene running. The constraint that mattered was writing the budget down before the effects, which made every later "can we afford this" question answerable instead of aesthetic.',
    constraint: undefined,
    featured: true,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Mono index label, e.g. "IDX 03/07". Generated, never stored. */
export function projectIndexLabel(project: Project): string {
  const i = projects.findIndex((p) => p.id === project.id);
  return `IDX ${String(i + 1).padStart(2, '0')}/${String(projects.length).padStart(2, '0')}`;
}
