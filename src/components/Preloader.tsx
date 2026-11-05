/**
 * The cinematic preloader (DESIGN.md §signature, §10).
 *
 * A Ø forming while real asset progress is reported in mono. It exists to
 * hold the first paint while fonts and the first chunk arrive — and it
 * MUST NOT hold the page longer than that. Hard ceiling 2.5s, then it
 * exits regardless of what has loaded.
 *
 * Rendered in pure CSS + DOM (no JS animation dependency) so it is itself
 * instant and cannot be the thing it is waiting for.
 */

import { useEffect, useRef, useState } from 'react';
import { identity } from '../content';

const CEILING_MS = 2500;
const MIN_SHOW_MS = 650;

export interface PreloaderProps {
  /** 0..1 real progress, reported by the app's asset pipeline. */
  progress: number;
  /** True when the app is ready to hand control over. */
  ready: boolean;
  onDone: () => void;
}

export default function Preloader({ progress, ready, onDone }: PreloaderProps) {
  const [exiting, setExiting] = useState(false);
  const shownAt = useRef(performance.now());

  useEffect(() => {
    const elapsed = performance.now() - shownAt.current;
    const remaining = Math.max(0, MIN_SHOW_MS - elapsed);
    const ceiling = Math.max(0, CEILING_MS - elapsed);

    if (!ready) {
      // Not ready: still enforce the ceiling, just from a timer.
      if (ceiling <= 0) setExiting(true);
      return;
    }

    // Ready: wait out the minimum on-screen time, then exit.
    const t = window.setTimeout(() => setExiting(true), remaining);
    return () => window.clearTimeout(t);
  }, [ready]);

  // Hard ceiling, independent of readiness.
  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), CEILING_MS);
    return () => window.clearTimeout(t);
  }, []);

  // After the exit animation, hand control over.
  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(onDone, 620);
    return () => window.clearTimeout(t);
  }, [exiting, onDone]);

  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div
      className={`preloader${exiting ? ' is-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="preloader-core" aria-hidden="true">
        <ZeroMark progress={progress} />
      </div>

      <div className="preloader-meta">
        <span className="preloader-word">{identity.handle}</span>
        <span className="t-micro preloader-pct">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  );
}

/**
 * The Ø forming. A ring that draws itself around the circumference and a
 * slash that sweeps through it — the motif's first appearance, built from
 * real `stroke-dashoffset` so it tracks actual progress.
 */
function ZeroMark({ progress }: { progress: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const drawn = circumference * Math.min(1, Math.max(0, progress));
  const slashOn = progress > 0.72;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="z-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FB2FF" />
          <stop offset="0.55" stopColor="#3D8BFF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#3D8BFF" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* faint guide ring behind the drawn one */}
      <circle cx="60" cy="60" r={r} stroke="rgb(255 255 255 / 0.10)" strokeWidth="1" />

      {/* the ring that draws itself with real progress */}
      <circle
        cx="60"
        cy="60"
        r={r}
        stroke="url(#z-edge)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${drawn} ${circumference}`}
        transform="rotate(-90 60 60)"
      />

      {/* the slash, swept in once the ring is near-complete */}
      <line
        x1="44"
        y1="76"
        x2="76"
        y2="44"
        stroke="#7FB2FF"
        strokeWidth="3"
        strokeLinecap="butt"
        strokeDasharray="45.25"
        strokeDashoffset={slashOn ? 0 : 45.25}
        style={{ transition: 'stroke-dashoffset 380ms var(--ease-out-expo)' }}
      />
    </svg>
  );
}
