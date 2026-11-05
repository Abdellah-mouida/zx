import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { onPointer, pointerIsCoarse } from '../lib/pointer';
import { isMotionReducedNow } from '../lib/motion';

/**
 * The signature material. DESIGN.md §3.
 *
 * Three levels and no more:
 *   surface — sits in the page: panels, strips, cards
 *   raised  — lifts on interaction: hovered project, active nav
 *   overlay — floats above: terminal, dialog, menu
 *
 * The five paint layers live in tokens.css. This component adds the pointer
 * sheen by writing `--mx`/`--my` on the element, driven by the one shared
 * pointer listener. Sheen is skipped entirely on touch and under reduced
 * motion, where it has no meaning and costs work.
 */

export type GlassLevel = 'surface' | 'raised' | 'overlay';

interface GlassProps {
  level?: GlassLevel;
  /** Renders as this element. Defaults to a div. */
  as?: ElementType;
  /** Corner radius token. Defaults to the system 4px. */
  radius?: string;
  /** Accent bounce light underneath. `raised` and `overlay` default to on. */
  bounce?: boolean;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

const LEVEL_CLASS: Record<GlassLevel, string> = {
  surface: 'glass-surface',
  raised: 'glass-raised',
  overlay: 'glass-overlay',
};

/** Bounce strength per level, from the §3.1 table. */
const BOUNCE: Record<GlassLevel, number> = {
  surface: 0,
  raised: 0.18,
  overlay: 0.28,
};

export function Glass({
  level = 'surface',
  as: Tag = 'div',
  radius,
  bounce,
  className = '',
  children,
  style,
  ...rest
}: GlassProps) {
  const ref = useRef<HTMLElement | null>(null);
  const showBounce = bounce ?? BOUNCE[level] > 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No hover to track, or motion is off: the sheen is pointless.
    if (pointerIsCoarse() || isMotionReducedNow()) return;

    let inside = false;

    const enter = () => {
      inside = true;
    };
    const leave = () => {
      inside = false;
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    };

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);

    const off = onPointer((p) => {
      if (!inside) return;
      // One layout read per frame, only while the pointer is over this panel.
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((p.x - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((p.y - r.top) / r.height) * 100}%`);
    });

    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      off();
    };
  }, []);

  const classes = [LEVEL_CLASS[level], showBounce && 'glass-bounce', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{
        ...(radius ? ({ '--glass-radius': radius } as React.CSSProperties) : null),
        ...(showBounce
          ? ({ '--bounce-strength': BOUNCE[level] } as React.CSSProperties)
          : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
