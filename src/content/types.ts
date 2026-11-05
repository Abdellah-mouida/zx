/**
 * Shared content types.
 *
 * Anything carrying `placeholder: true` is invented or provisional and must
 * be replaced before launch. Grep for it:
 *
 *     rg "placeholder: true" src/content
 */

/** Mixed into any record that is not yet real. */
export interface Placeholdable {
  /** True when this record must be replaced before launch. */
  placeholder?: true;
  /** Why it is provisional, and what the real value should be. */
  placeholderNote?: string;
}

export type ArsenalDomain =
  | 'offensive-security'
  | 'languages'
  | 'infrastructure';

/** A cluster in the Arsenal constellation. */
export interface ArsenalCluster {
  id: string;
  domain: ArsenalDomain;
  /** Shown as the cluster label. */
  name: string;
  /** One dry sentence. What this cluster actually is. */
  summary: string;
  /** Drives cluster radius and node count in the 3D view. */
  weight: number;
  nodes: ArsenalNode[];
}

/** A single capability inside a cluster. */
export interface ArsenalNode extends Placeholdable {
  id: string;
  label: string;
  /** Telemetry readout: what it is used for. One line, specific. */
  use: string;
  /** Years of practice, or a phase. Shown as system data, not a bar. */
  since?: string;
  /** Depth of practice. Drives node size, never a percentage bar. */
  depth: 'core' | 'working' | 'reading';
  /** Project ids this capability was actually used in. */
  related?: string[];
}

export type ProjectKind =
  | 'tooling'
  | 'research'
  | 'engineering'
  | 'archive';

/** A case study. */
export interface Project extends Placeholdable {
  id: string;
  /** Short name, used in the terminal `open <project>` command. */
  slug: string;
  title: string;
  /** One line on the card. Max ~70 characters so it never wraps to three. */
  blurb: string;
  kind: ProjectKind;
  year: string;
  /** Mono micro-label on the panel, e.g. "IDX 01/07". Generated, not stored. */
  stack: string[];
  /** The case study, in the brief's required shape. */
  problem: string;
  role: string;
  process: string[];
  outcome: string;
  /** What it deliberately does not do. Keeps the ethics line honest. */
  constraint?: string;
  featured?: boolean;
}

/** One entry in the boot log. */
export interface BootLogEntry extends Placeholdable {
  /** Displayed as given: "2016", "2018-2019", "2023-present". */
  period: string;
  title: string;
  body: string;
}

export interface Certification extends Placeholdable {
  abbr: string;
  name: string;
  issuer: string;
  status: 'held' | 'in-progress';
}

export interface SocialLink {
  id: string;
  label: string;
  /** What the visitor sees. */
  handle: string;
  href: string;
}

/** A scroll-pinned philosophy statement. */
export interface Principle {
  index: string;
  title: string;
  body: string;
}
