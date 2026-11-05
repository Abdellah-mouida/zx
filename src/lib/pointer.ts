/**
 * One pointer source for the whole app.
 *
 * The glass sheen, the custom cursor and every magnetic button all need the
 * pointer position. Each attaching its own listener would mean N listeners
 * and N layout reads per frame, so instead there is one listener here,
 * sampled once per animation frame, and everything else subscribes.
 *
 * DESIGN.md §3 (sheen), §8 (cursor, magnetic).
 */

export interface PointerState {
  /** Viewport coordinates, CSS pixels. */
  x: number;
  y: number;
  /** Pixels moved since the previous frame. Drives velocity-aware motion. */
  dx: number;
  dy: number;
  /** False until the pointer has actually moved once. */
  active: boolean;
  /** True for a coarse pointer (touch). Hover effects must switch off. */
  coarse: boolean;
}

type Listener = (p: PointerState) => void;

const state: PointerState = { x: 0, y: 0, dx: 0, dy: 0, active: false, coarse: false };
const listeners = new Set<Listener>();

let raf = 0;
let pendingX = 0;
let pendingY = 0;
let wired = false;

function flush() {
  raf = 0;
  state.dx = pendingX - state.x;
  state.dy = pendingY - state.y;
  state.x = pendingX;
  state.y = pendingY;
  state.active = true;
  for (const l of listeners) l(state);
}

function onMove(e: PointerEvent) {
  pendingX = e.clientX;
  pendingY = e.clientY;
  // Coalesce to one update per frame regardless of event rate.
  if (!raf) raf = requestAnimationFrame(flush);
}

function wire() {
  if (wired || typeof window === 'undefined') return;
  wired = true;
  state.coarse = window.matchMedia('(hover: none)').matches;
  // Passive: we never preventDefault, so the browser can keep scrolling smooth.
  window.addEventListener('pointermove', onMove, { passive: true });
}

/** Subscribe to per-frame pointer updates. Returns an unsubscribe function. */
export function onPointer(listener: Listener): () => void {
  wire();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

/** Current pointer state. Do not mutate. */
export function pointer(): Readonly<PointerState> {
  wire();
  return state;
}

/** True on touch devices, where hover-driven effects should not run. */
export function pointerIsCoarse(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
}
