import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Micro } from '../components/Micro';
import { Glass } from '../components/Glass';
import { useReducedMotion } from '../lib/motion';
import { projects, projectBySlug, projectIndexLabel } from '../content';

gsap.registerPlugin(ScrollTrigger);

/**
 * CASE STUDY (brief §PAGES.2).
 *
 * The required shape: problem, role, process, outcome, constraint. Set as
 * an article with one dominant title, a fact panel pinned beside the body
 * on wide screens, and a process rendered as a real ordered list — the
 * numbers carry sequence, which is information, not decoration.
 */
export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? projectBySlug(slug) : undefined;
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !project) return;
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(el.querySelectorAll('.cs-block')).forEach((b) => {
        gsap.fromTo(
          b,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: b, start: 'top 88%', once: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, project, slug]);

  // Scroll back to the top when moving between case studies.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="page frame">
        <header className="page-head">
          <Micro accent>404</Micro>
          <h1 className="t-display-m page-title">No entry under that name</h1>
          <p className="page-lede">
            The index has seven. <Link to="/projects" className="inline-link">Go back to it.</Link>
          </p>
        </header>
      </div>
    );
  }

  const i = projects.findIndex((p) => p.id === project.id);
  const prev = projects[i - 1];
  const next = projects[i + 1];

  return (
    <article ref={root} className="page case">
      <header className="case-head frame">
        <Link to="/projects" className="case-back" data-cursor="link">
          <Micro>← INDEX</Micro>
        </Link>

        <Micro className="case-idx">{projectIndexLabel(project)}</Micro>
        <h1 className="t-display-l case-title">{project.title}</h1>
        <p className="t-statement case-blurb">{project.blurb}</p>

        {project.placeholder && (
          <p className="case-placeholder">
            <Micro accent>PLACEHOLDER</Micro>
            <span>{project.placeholderNote}</span>
          </p>
        )}
      </header>

      <div className="case-body frame">
        {/* The facts, as system data beside the prose — not a stat row. */}
        <Glass level="surface" as="aside" className="case-facts" aria-label="Project facts">
          <dl>
            <div>
              <dt>
                <Micro>KIND</Micro>
              </dt>
              <dd>{project.kind}</dd>
            </div>
            <div>
              <dt>
                <Micro>YEAR</Micro>
              </dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>
                <Micro>ROLE</Micro>
              </dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>
                <Micro>STACK</Micro>
              </dt>
              <dd className="case-stack">
                {project.stack.map((s) => (
                  <Micro key={s} className="chip">
                    {s}
                  </Micro>
                ))}
              </dd>
            </div>
          </dl>
        </Glass>

        <div className="case-prose">
          <section className="cs-block">
            <h2 className="t-heading">The problem</h2>
            <p>{project.problem}</p>
          </section>

          <section className="cs-block">
            <h2 className="t-heading">Process</h2>
            <ol className="case-process">
              {project.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="cs-block">
            <h2 className="t-heading">Outcome</h2>
            <p>{project.outcome}</p>
          </section>

          {project.constraint && (
            <section className="cs-block case-constraint">
              <h2 className="t-heading">What it does not do</h2>
              <p>{project.constraint}</p>
            </section>
          )}
        </div>
      </div>

      <nav className="case-nav frame" aria-label="Other projects">
        {prev ? (
          <Link to={`/projects/${prev.slug}`} className="case-nav-link" data-cursor="project">
            <Micro>← PREV</Micro>
            <span className="t-heading">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/projects/${next.slug}`}
            className="case-nav-link is-next"
            data-cursor="project"
          >
            <Micro>NEXT →</Micro>
            <span className="t-heading">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
