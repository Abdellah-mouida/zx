import { useEffect, useRef, useState } from 'react';
import { isMotionReducedNow } from '../lib/motion';

/**
 * Decode / scramble reveal (DESIGN.md §4.3).
 *
 * The final text is ALWAYS in the DOM as real text — the animation only
 * ever replaces what is painted, never what is read. Screen readers and
 * search engines see the resolved string from first paint.
 *
 * Resolves left to right: 420ms base + 18ms per character. Runs once per
 * session per `id`, so navigating back does not re-scramble something the
 * visitor has already seen.
 */

const CHARSET = '01▚▞░▒▓<>/\\|=+*#$%&@';
const sessionSeen = new Set<string>();

export function Decode({
  children,
  id,
  className,
  delay = 0,
  as: Tag = 'span',
}: {
  children: string;
  /** Stable key so a reveal happens once per session. */
  id: string;
  className?: string;
  delay?: number;
  as?: 'span' | 'h1' | 'h2' | 'p' | 'div';
}) {
  const final = children;
  const reduced = isMotionReducedNow();
  const alreadySeen = sessionSeen.has(id);

  const [painted, setPainted] = useState(() => (reduced || alreadySeen ? final : ''));
  const raf = useRef(0);

  useEffect(() => {
    if (reduced || alreadySeen) {
      setPainted(final);
      return;
    }

    sessionSeen.add(id);

    const duration = 420 + final.length * 18;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now + delay;
      if (now < start) {
        raf.current = requestAnimationFrame(step);
        return;
      }

      const t = Math.min(1, (now - start) / duration);
      // Ease the resolve front so it decelerates into place.
      const eased = 1 - Math.pow(1 - t, 3);
      const resolved = Math.floor(eased * final.length);

      let out = final.slice(0, resolved);
      for (let i = resolved; i < final.length; i++) {
        // Preserve spaces so the word shape is stable while resolving.
        out += final[i] === ' ' ? ' ' : CHARSET[(Math.random() * CHARSET.length) | 0];
      }

      setPainted(out);

      if (t < 1) raf.current = requestAnimationFrame(step);
      else setPainted(final);
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [final, id, delay, reduced, alreadySeen]);

  return (
    <Tag className={className}>
      {/* The real text, for assistive tech and for SEO. */}
      <span className="sr-only">{final}</span>
      {/* The painted text, hidden from assistive tech so it is not read twice. */}
      <span aria-hidden="true">{painted || final}</span>
    </Tag>
  );
}
