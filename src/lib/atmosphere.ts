/**
 * Atmosphere store — one source of truth for what the background is doing.
 *
 * Holds the scroll position and smoothed velocity that drive the aurora,
 * particles and trails; the current quality tier; the aurora mood; and
 * whether the scene is active at all. Everything reads from here so the
 * page, the shaders and the FPS monitor can never disagree.
 *
 * Implemented with `useSyncExternalStore` rather than a context value that
 * changes every frame — scroll updates at 60Hz and must not re-render React.
 */

import { useSyncExternalStore } from 'react';
import { probe, settingsFor, type Tier, type TierSettings, type Capabilities } from './quality';
import { isMotionReducedNow } from './motion';

export type AuroraMood = 'calm' | 'drift' | 'dense' | 'quiet' | 'signal';

export interface AtmosphereState {
  /** 0..1 page scroll progress. */
  scroll: number;
  /** Smoothed |scroll velocity|, 0..1. Drives trail stretch + aurora swirl. */
  velocity: number;
  mood: AuroraMood;
  tier: Tier;
  settings: TierSettings;
  capabilities: Capabilities;
  /** False when WebGL is missing or the whole scene is off. */
  sceneActive: boolean;
  /** The Ø shader event (the `z` Easter egg) — a monotonically rising tick. */
  zeroPulse: number;
}

// ---------------------------------------------------------------------------
// Module state + subscription

const listeners = new Set<() => void>();

let state: AtmosphereState = makeInitial();

function makeInitial(): AtmosphereState {
  const caps = typeof window === 'undefined'
    ? ({ webgl: false, renderer: null, cores: 1, memory: null, coarsePointer: false, tier: 'low' } as Capabilities)
    : probe();

  return {
    scroll: 0,
    velocity: 0,
    mood: 'calm',
    tier: caps.tier,
    settings: settingsFor(caps.tier),
    capabilities: caps,
    // Scene is off without WebGL; reduced motion handled at the shader level.
    sceneActive: caps.webgl,
    zeroPulse: 0,
  };
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getAtmosphere(): AtmosphereState {
  return state;
}

export function useAtmosphere(): AtmosphereState {
  return useSyncExternalStore(subscribe, getAtmosphere, getAtmosphere);
}

// ---------------------------------------------------------------------------
// Actions

export function setMood(mood: AuroraMood): void {
  if (state.mood === mood) return;
  state = { ...state, mood };
  emit();
}

/**
 * Called by the scroll driver each frame. Velocity is smoothed with an
 * asymmetric decay: it rises fast on a hard scroll and releases slowly, so
 * a flick reads as a whip rather than a flicker.
 */
export function setScroll(progress: number, rawVelocity: number): void {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const target = Math.min(1, Math.max(0, Math.abs(rawVelocity)));

  const up = 0.55;   // attack: fast
  const down = 0.06; // release: slow
  const velocity =
    target > state.velocity
      ? state.velocity + (target - state.velocity) * up
      : state.velocity + (target - state.velocity) * down;

  state = { ...state, scroll: clampedProgress, velocity };
  emit();
}

/** Demote one tier. Called only by the FpsMonitor; never promotes. */
export function demoteTier(next: Tier): void {
  const order: Tier[] = ['high', 'medium', 'low'];
  if (order.indexOf(next) <= order.indexOf(state.tier)) return; // never upward
  state = { ...state, tier: next, settings: settingsFor(next) };
  emit();
}

/** Fire the Ø shader event once. Each call re-triggers it. */
export function pulseZero(): void {
  state = { ...state, zeroPulse: state.zeroPulse + 1 };
  emit();
}

export function setSceneActive(active: boolean): void {
  if (state.sceneActive === active) return;
  state = { ...state, sceneActive: active };
  emit();
}

// ---------------------------------------------------------------------------
// Derived flags read elsewhere

/** True when ambient animation should run at all. */
export function sceneShouldAnimate(): boolean {
  return state.sceneActive && !isMotionReducedNow();
}
