import { useSyncExternalStore } from 'react';

/**
 * Reduced-motion state, shared by every component and hook.
 *
 * Two inputs, one output (DESIGN.md §6.4):
 *   - the OS/media preference `prefers-reduced-motion`
 *   - the in-app "reduce effects" toggle, persisted to localStorage
 *
 * Either one engaged means motion is off. The value is also mirrored onto
 * `<html data-motion>` so pure-CSS rules in tokens.css see the toggle
 * without depending on React.
 *
 * Reads `window` only inside subscribe/getSnapshot so SSR does not crash.
 */

const STORAGE_KEY = 'zeroox:motion';
const QUERY = '(prefers-reduced-motion: reduce)';

type Listener = () => void;
const listeners = new Set<Listener>();

let mediaQuery: MediaQueryList | null = null;
function mq(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  mediaQuery ??= window.matchMedia(QUERY);
  return mediaQuery;
}

function readOS(): boolean {
  return mq()?.matches ?? false;
}

function readToggle(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'reduced';
}

/** The single source of truth. */
export function motionIsReduced(): boolean {
  return readOS() || readToggle();
}

function emit() {
  for (const l of listeners) l();
}

// Media-listener is attached once, lazily, when something first subscribes.
let mediaWired = false;
function wireMedia() {
  if (mediaWired) return;
  mediaWired = true;
  mq()?.addEventListener('change', emit);
}

function subscribe(listener: Listener): () => void {
  wireMedia();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Value exposed to useSyncExternalStore must be referentially stable
// between identical reads, so snapshot returns a boolean, not an object.
function getSnapshot(): boolean {
  return motionIsReduced();
}

function getServerSnapshot(): boolean {
  return false;
}

/** Keep the DOM in sync so CSS rules keyed on [data-motion] follow the toggle. */
function applyToDom() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.motion = motionIsReduced() ? 'reduced' : 'full';
}

let domWired = false;
function wireDom() {
  if (domWired) return;
  domWired = true;
  applyToDom();
  listeners.add(applyToDom);
}

/**
 * `true` when motion should be reduced. Reactive — re-renders when either
 * the OS preference or the in-app toggle changes.
 */
export function useReducedMotion(): boolean {
  wireDom();
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Non-reactive read for one-shot decisions (event handlers, classnames). */
export function isMotionReducedNow(): boolean {
  return motionIsReduced();
}

/** Set the in-app toggle. Persists. */
export function setReducedMotionToggle(reduced: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, reduced ? 'reduced' : 'full');
  applyToDom();
  emit();
}

/** Read the in-app toggle (does not include the OS preference). */
export function reducedMotionToggleIsOn(): boolean {
  return readToggle();
}
