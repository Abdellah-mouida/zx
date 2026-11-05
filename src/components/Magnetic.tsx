import { useEffect, useRef, type ReactNode, type MouseEventHandler } from 'react';
import { onPointer, pointerIsCoarse } from '../lib/pointer';
import { isMotionReducedNow } from '../lib/motion';

/**
 * Magnetic button. DESIGN.md §8.
 *
 * The label translates up to `pull` px toward the pointer while it is within
 * `radius` px of the button's centre. The motion reads as the Ø pulling the
 * element — a magnetic field — rather than a generic hover lift.
 *
 * Off entirely on touch and under reduced motion (both render a normal,
 * still-interactive control). Transform only; never layout.
 */

interface MagneticProps {
  children: ReactNode;
  onClick?: MouseEventHandler;
  /** Max translation toward the pointer, px. */
  pull?: number;
  /** Activation radius from centre, px. */
  radius?: number;
  className?: string;
  'aria-label'?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function Magnetic({
  children,
  onClick,
  pull = 6,
  radius = 120,
  className = '',
  'aria-label': ariaLabel,
  href,
  type = 'button',
  disabled,
}: MagneticProps) {
  const el = useRef<HTMLElement | null>(null);
  const inner = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = el.current;
    const label = inner.current;
    if (!node || !label) return;
    if (pointerIsCoarse() || isMotionReducedNow()) return;

    const off = onPointer((p) => {
      const r = node.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        // Scale pull down with distance so the edge is a soft catch, not a snap.
        const t = 1 - dist / radius;
        label.style.transform = `translate(${(dx / radius) * pull * t}px, ${(dy / radius) * pull * t}px)`;
      } else {
        label.style.transform = 'translate(0, 0)';
      }
    });
    return off;
  }, [pull, radius]);

  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      ref={el as never}
      className={`magnetic ${className}`}
      href={href}
      type={href ? undefined : type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={href ? undefined : disabled}
    >
      <span ref={inner} className="magnetic-inner">
        {children}
      </span>
    </Tag>
  );
}
