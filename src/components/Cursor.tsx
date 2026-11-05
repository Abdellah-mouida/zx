import { useEffect, useRef, useState } from 'react';
import { onPointer, pointerIsCoarse } from '../lib/pointer';
import { useReducedMotion } from '../lib/motion';

/**
 * Context-aware custom cursor. DESIGN.md §8.
 *
 * Five states, decided by the element under the pointer:
 *   default — a tight dot
 *   text    — a 1px bar, over text-entry contexts
 *   link    — a hollow ring, over interactive elements
 *   drag    — two opposing carets, over draggable things
 *   project — a labelled frame, over a [data-cursor="project"] panel
 *
 * Implemented as a small DOM element moved by transform (never by layout
 * properties) and driven by the shared pointer listener, so it is one
 * transform write per frame.
 *
 * Restored to the native cursor on touch devices and whenever a text field
 * has focus — a fake I-beam would fight the real caret. Under reduced
 * motion the native cursor stays; the custom one adds nothing a user who
 * asked for less motion would want.
 *
 * Opt in per-element with data-cursor="text|link|drag|project:<label>".
 * Bare links and buttons resolve to `link` without any attribute.
 */

type CursorState =
  | { kind: 'default' }
  | { kind: 'text' }
  | { kind: 'link' }
  | { kind: 'drag' }
  | { kind: 'project'; label: string };

const INTERACTIVE = 'a, button, [role="button"], [role="link"], select, [data-cursor]';
const TEXT_ENTRY = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
const DRAGGABLE = '[data-draggable], [draggable="true"]';

function resolve(target: Element | null): CursorState {
  if (!target || !(target instanceof Element)) return { kind: 'default' };

  const explicit = target.closest('[data-cursor]');
  if (explicit) {
    const v = explicit.getAttribute('data-cursor') ?? '';
    if (v.startsWith('project')) {
      const label = v.split(':')[1]?.trim();
      return { kind: 'project', label: label || 'open' };
    }
    if (v === 'drag') return { kind: 'drag' };
    if (v === 'text') return { kind: 'text' };
    if (v === 'link' || v === '') return { kind: 'link' };
  }
  if (target.closest(TEXT_ENTRY)) return { kind: 'text' };
  if (target.closest(DRAGGABLE)) return { kind: 'drag' };
  if (target.closest(INTERACTIVE)) return { kind: 'link' };
  return { kind: 'default' };
}

export function Cursor() {
  const reduced = useReducedMotion();
  const el = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CursorState>({ kind: 'default' });
  const [active, setActive] = useState(false);

  const disabled = pointerIsCoarse() || reduced;

  useEffect(() => {
    if (disabled) return;

    const node = el.current;
    if (!node) return;

    const off = onPointer((p) => {
      // transform only — no layout work.
      node.style.transform = `translate(${p.x}px, ${p.y}px)`;
      setActive(p.active);
      setState((prev) => {
        const next = resolve(document.elementFromPoint(p.x, p.y));
        return same(prev, next) ? prev : next;
      });
    });
    return off;
  }, [disabled]);

  if (disabled) return null;

  const kind = state.kind;
  const label = kind === 'project' ? state.label : '';

  return (
    <div
      ref={el}
      aria-hidden="true"
      className="cursor"
      data-kind={kind}
      data-active={active || undefined}
    >
      <div className="cursor-core" />
      <div className="cursor-ring" />
      <div className="cursor-drag">
        <span />
        <span />
      </div>
      {kind === 'project' ? <div className="cursor-label">{label}</div> : null}
    </div>
  );
}

function same(a: CursorState, b: CursorState) {
  return a.kind === b.kind && (a.kind !== 'project' || a.label === (b as never)['label']);
}
