/**
 * Adaptive quality (DESIGN.md §7.1).
 *
 * A tier is chosen once from a hardware probe, then demoted by a runtime
 * FPS monitor. It never promotes back up inside a session: oscillating
 * between tiers is more visible, and worse, than sitting at a lower one.
 */

export type Tier = 'high' | 'medium' | 'low';

export interface TierSettings {
  tier: Tier;
  /** Clamp for the renderer's device pixel ratio. */
  dpr: number;
  particles: number;
  trails: number;
  /** Post-processing stack. */
  bloom: boolean;
  chromaticAberration: boolean;
  vignette: boolean;
  /** Refraction bounces on the hero Ø; 0 = matte glass. */
  refractionBounces: number;
  /** Aurora fBm octaves. */
  auroraOctaves: number;
}

export const TIERS: Record<Tier, Omit<TierSettings, 'dpr'> & { dprMax: number }> = {
  high: {
    tier: 'high',
    dprMax: 2,
    particles: 24_000,
    trails: 12,
    bloom: true,
    chromaticAberration: true,
    vignette: true,
    refractionBounces: 2,
    auroraOctaves: 3,
  },
  medium: {
    tier: 'medium',
    dprMax: 1.5,
    particles: 9_000,
    trails: 5,
    bloom: true,
    chromaticAberration: false,
    vignette: false,
    refractionBounces: 1,
    auroraOctaves: 2,
  },
  low: {
    tier: 'low',
    dprMax: 1,
    particles: 0,
    trails: 0,
    bloom: false,
    chromaticAberration: false,
    vignette: false,
    refractionBounces: 0,
    auroraOctaves: 2,
  },
};

export function settingsFor(tier: Tier): TierSettings {
  const t = TIERS[tier];
  const dpr = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, t.dprMax);
  const { dprMax: _dprMax, ...rest } = t;
  return { ...rest, dpr };
}

/** Result of the one-time hardware probe. */
export interface Capabilities {
  webgl: boolean;
  /** WEBGL_debug_renderer_info, when the browser exposes it. */
  renderer: string | null;
  /** Logical cores, when exposed. */
  cores: number;
  /** Device memory in GB, when exposed. */
  memory: number | null;
  coarsePointer: boolean;
  tier: Tier;
}

let cached: Capabilities | null = null;

/**
 * Probe once. Cheap, synchronous, and the context is released immediately
 * so it never competes with the real renderer.
 */
export function probe(): Capabilities {
  if (cached) return cached;

  if (typeof window === 'undefined') {
    cached = { webgl: false, renderer: null, cores: 1, memory: null, coarsePointer: false, tier: 'low' };
    return cached;
  }

  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl2') ??
    canvas.getContext('webgl')) as WebGLRenderingContext | null;

  let renderer: string | null = null;
  if (gl) {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    // Release immediately; this context exists only to answer the question.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const coarsePointer = window.matchMedia('(hover: none)').matches;

  cached = {
    webgl: Boolean(gl),
    renderer,
    cores,
    memory,
    coarsePointer,
    tier: pickTier({ webgl: Boolean(gl), renderer, cores, memory, coarsePointer }),
  };
  return cached;
}

function pickTier(c: Omit<Capabilities, 'tier'>): Tier {
  if (!c.webgl) return 'low';

  // Software renderers cannot hold a frame budget at any resolution.
  if (c.renderer && /swiftshader|software|llvmpipe|basic render/i.test(c.renderer)) return 'low';

  // Phones and tablets: start at medium. The scene is lighter there by
  // design (§10) and a phone GPU that can do more will still look right.
  if (c.coarsePointer) return 'medium';

  if (c.cores <= 4) return 'medium';
  if (c.memory !== null && c.memory <= 4) return 'medium';

  // Integrated graphics: capable of medium reliably, high only sometimes.
  // Start medium and let it stay there rather than demote visibly.
  if (c.renderer && /(intel|uhd|iris|vega \d|radeon graphics)/i.test(c.renderer)) return 'medium';

  return 'high';
}

/**
 * Rolling-median FPS monitor. Demotes one tier when the median of the last
 * `window` frames stays under `floor` for `sustainMs`.
 *
 * Median, not mean: a single GC pause or a tab switch should not demote a
 * machine that is otherwise comfortable.
 */
export class FpsMonitor {
  private frames: number[] = [];
  private belowSince: number | null = null;
  private last = 0;
  private disposed = false;

  private onDemote: (next: Tier) => void;
  private getTier: () => Tier;
  private readonly floor: number;
  private readonly sustainMs: number;
  private readonly window: number;

  constructor(
    onDemote: (next: Tier) => void,
    getTier: () => Tier,
    floor = 50,
    sustainMs = 2000,
    window = 60,
  ) {
    this.onDemote = onDemote;
    this.getTier = getTier;
    this.floor = floor;
    this.sustainMs = sustainMs;
    this.window = window;
  }

  /** Call once per rendered frame. */
  sample(now: number): void {
    if (this.disposed) return;

    if (this.last === 0) {
      this.last = now;
      return;
    }

    const dt = now - this.last;
    this.last = now;

    // Ignore absurd deltas: tab was backgrounded, not a real slow frame.
    if (dt <= 0 || dt > 500) {
      this.frames.length = 0;
      this.belowSince = null;
      return;
    }

    this.frames.push(1000 / dt);
    if (this.frames.length > this.window) this.frames.shift();
    if (this.frames.length < this.window) return;

    const sorted = [...this.frames].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    if (median < this.floor) {
      if (this.belowSince === null) {
        this.belowSince = now;
      } else if (now - this.belowSince >= this.sustainMs) {
        this.demote();
      }
    } else {
      this.belowSince = null;
    }
  }

  private demote(): void {
    const current = this.getTier();
    const next: Tier | null = current === 'high' ? 'medium' : current === 'medium' ? 'low' : null;

    // Already at the floor: stop monitoring, there is nothing left to give.
    if (next === null) {
      this.disposed = true;
      return;
    }

    this.frames.length = 0;
    this.belowSince = null;
    this.onDemote(next);
  }

  dispose(): void {
    this.disposed = true;
  }

  /** Current rolling median, or null before the window fills. Test seam. */
  get median(): number | null {
    if (this.frames.length < this.window) return null;
    const sorted = [...this.frames].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }
}
