import type { ReactNode } from 'react';

/**
 * The mono micro-label. DESIGN.md §4.2.
 *
 * The ONLY uppercase-tracked style in the system, and it is reserved for
 * real system data: coordinates, indices, status codes, prompts. It must
 * never be used as a decorative eyebrow above a section — that information
 * belongs in the section heading instead.
 *
 * `accent` applies the one accent colour; use it on at most one per viewport.
 */
export function Micro({
  children,
  accent = false,
  className = '',
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`t-micro ${className}`}
      style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-3)' }}
    >
      {children}
    </span>
  );
}
