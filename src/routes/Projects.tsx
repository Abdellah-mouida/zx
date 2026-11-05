import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Micro } from '../components/Micro';
import { useReducedMotion } from '../lib/motion';
import { projects, projectIndexLabel } from '../content';
import type { ProjectKind } from '../content/types';

gsap.registerPlugin(ScrollTrigger);

const KINDS: { id: ProjectKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tooling', label: 'Tooling' },
  { id: 'research', label: 'Research' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'archive', label: 'Archive' },
];

/**
 * PROJECTS (brief §PAGES.2).
 *
 * An index, not a card grid. Each entry is a full-width editorial row whose
 * scale comes from its weight: featured work gets display type and its
 * process count, the rest stay compact. Filtering by kind is a real
 * client-side filter on the content, with the count stated.
 */
export default function Projects() {
  const [kind, setKind] = useState<ProjectKind | 'all'>('all');
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);

  const shown = useMemo(
    () => (kind === 'all' ? projects : projects.filter((p) => p.kind === kind)),
    [kind],
  );

  // Rows rise in as they enter. One trigger per row, killed on filter change.
  useEffect(() => {
    if (reduced) return;
    const el = listRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.prow'),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced, kind]);

  return (
    <div className="page projects">
      <header className="page-head frame">
        <Micro accent>INDEX</Micro>
        <h1 className="t-display-l page-title">Work</h1>
        <p className="page-lede">
          Seven entries. Each one states what it set out to do, what it cost, and what it
          deliberately does not publish.
        </p>
      </header>

      <div className="frame">
        <div className="filters" role="group" aria-label="Filter by kind">
          {KINDS.map((k) => {
            const count =
              k.id === 'all' ? projects.length : projects.filter((p) => p.kind === k.id).length;
            const active = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                className={`filter${active ? ' is-active' : ''}`}
                onClick={() => setKind(k.id)}
                aria-pressed={active}
                data-cursor="link"
              >
                {k.label}
                <Micro className="filter-count">{String(count)}</Micro>
              </button>
            );
          })}
        </div>

        <p className="filter-status" role="status">
          <Micro>{`${shown.length} of ${projects.length} shown`}</Micro>
        </p>

        <ul ref={listRef} className="prows">
          {shown.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.slug}`}
                className={`prow${p.featured ? ' is-featured' : ''}`}
                data-cursor="project"
              >
                <Micro className="prow-idx">{projectIndexLabel(p)}</Micro>

                <h2 className={`prow-title ${p.featured ? 't-display-m' : 't-heading'}`}>
                  {p.title}
                </h2>

                <p className="prow-blurb">{p.blurb}</p>

                <div className="prow-meta">
                  <Micro className="prow-kind">{p.kind.toUpperCase()}</Micro>
                  <Micro>{p.year}</Micro>
                </div>

                <div className="prow-stack">
                  {p.stack.map((s) => (
                    <Micro key={s} className="chip">
                      {s}
                    </Micro>
                  ))}
                </div>

                <span className="prow-go" aria-hidden="true">
                  <Micro accent>READ →</Micro>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {shown.length === 0 && (
          <p className="page-lede">Nothing under that kind yet.</p>
        )}
      </div>
    </div>
  );
}
