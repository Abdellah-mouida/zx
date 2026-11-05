import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Decode } from '../components/Decode';
import { Magnetic } from '../components/Magnetic';
import { Micro } from '../components/Micro';
import { useAtmosphere } from '../lib/atmosphere';
import { useReducedMotion } from '../lib/motion';
import { scrollToTarget } from '../lib/scroll';
import { identity, featuredProjects, projectIndexLabel } from '../content';

// The hero object only exists when the scene is alive.
const HeroScene = lazy(() => import('./HeroScene'));

gsap.registerPlugin(ScrollTrigger);

/**
 * HOME (brief §PAGES.1).
 *
 * A full-viewport hero: the refractive Ø in volumetric light, the ZEROOX
 * wordmark resolving with a decode, one line of positioning copy, one
 * magnetic CTA, and a mono status strip. Below, a scroll sequence moves
 * the camera through key statements and teases featured projects.
 */
export default function Home() {
  const { capabilities, settings } = useAtmosphere();
  const reduced = useReducedMotion();

  return (
    <div className="home">
      <Hero showScene={capabilities.webgl} bounces={settings.refractionBounces} reduced={reduced} />
      <StatementSequence />
      <FeaturedTeasers />
      <HomeClose />
    </div>
  );
}

/* ================================================================ *
   HERO
 * ================================================================ */

function Hero({
  showScene,
  bounces,
  reduced,
}: {
  showScene: boolean;
  bounces: number;
  reduced: boolean;
}) {
  const [time, setTime] = useState('');

  // Local time in the status strip, updated on the second.
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero" aria-label="Introduction">
      {showScene && (
        <Suspense fallback={null}>
          <div className="hero-canvas" aria-hidden="true">
            <HeroScene bounces={bounces} reduced={reduced} />
          </div>
        </Suspense>
      )}

      <div className="hero-inner frame">
        {/* The system-status strip sits at the top edge, never centred. */}
        <div className="hero-status" role="status" aria-live="off">
          <Micro accent>SYS: ONLINE</Micro>
          <Micro className="hero-status-sep">·</Micro>
          <Micro>{`LOC ${time || '--:--:--'}`}</Micro>
          <Micro className="hero-status-sep">·</Micro>
          <Micro>RDY</Micro>
        </div>

        <div className="hero-core">
          <h1 className="t-display-xl hero-wordmark">
            <Decode id="hero-wordmark">{identity.handle}</Decode>
          </h1>

          <p className="t-statement hero-line">
            <Decode id="hero-line" delay={300}>
              {identity.positioning}
            </Decode>
          </p>

          <div className="hero-cta">
            <Magnetic>
              <Link to="/contact" className="btn btn-primary" data-cursor="link">
                Open a channel
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* The scroll cue is the only motion hint on the first screen. */}
        <button
          type="button"
          className="hero-scroll"
          onClick={() => scrollToTarget('.hero-after', -20)}
          data-cursor="link"
          aria-label="Scroll to continue"
        >
          <Micro>SCROLL</Micro>
          <span className="hero-scroll-line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ================================================================ *
   SCROLL SEQUENCE — camera through key statements
 * ================================================================ */

function StatementSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const items = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('.stmt'));
    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0.06, y: 60, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top 92%',
              end: 'top 42%',
              scrub: 0.6,
            },
          },
        );
        if (i < items.length - 1) {
          gsap.to(item, {
            opacity: 0.04,
            y: -46,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'center 38%',
              end: 'center -8%',
              scrub: 0.6,
            },
          });
        }
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={ref} className="hero-after" aria-label="Positioning">
      {identity.tagline && (
        <p className="stmt t-statement">{identity.tagline}</p>
      )}
      {['One practice: offense to understand, engineering to fix.', 'Two halves of the same skill. Exactness either way.'].map(
        (s) => (
          <p className="stmt t-statement" key={s}>
            {s}
          </p>
        ),
      )}
    </div>
  );
}

/* ================================================================ *
   FEATURED TEASERS — the real content, not a grid of cards
 * ================================================================ */

function FeaturedTeasers() {
  const featured = featuredProjects.slice(0, 3);
  return (
    <section className="teasers frame" aria-label="Selected work">
      <header className="teasers-head">
        <h2 className="t-heading">Selected work</h2>
        <Link to="/projects" className="teasers-all" data-cursor="link">
          <Micro>ALL →</Micro>
        </Link>
      </header>

      <ul className="teasers-list">
        {featured.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.slug}`} className="teaser" data-cursor="project">
              <Micro className="teaser-idx">{projectIndexLabel(p)}</Micro>
              <span className="teaser-title t-display-m">{p.title}</span>
              <span className="teaser-blurb">{p.blurb}</span>
              <span className="teaser-meta">
                <Micro>{p.year}</Micro>
                <Micro>{p.stack.slice(0, 3).join(' · ')}</Micro>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================ *
   CLOSE — one quiet availability line, not a CTA wall
 * ================================================================ */

function HomeClose() {
  return (
    <section className="home-close frame" aria-label="Availability">
      <p className="t-statement home-close-line">{identity.availability}</p>
      <Link to="/contact" className="btn btn-ghost" data-cursor="link">
        contact@zeroox.dev
      </Link>
    </section>
  );
}
