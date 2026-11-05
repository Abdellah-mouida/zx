import { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Cursor } from './components/Cursor';
import Preloader from './components/Preloader';
import RouteTransition from './components/RouteTransition';
import { Micro } from './components/Micro';
import { IconZero } from './components/icons';
import { useSmoothScroll } from './lib/scroll';
import { routes } from './content';

const Home = lazy(() => import('./routes/Home'));
const Specimen = lazy(() => import('./routes/Specimen'));
const SceneGate = lazy(() => import('./components/SceneGate'));

/**
 * Asset progress for the preloader. Real, not faked: fonts from
 * document.fonts and the document's own readiness.
 */
function useAssetProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let fontsDone = false;
    let docDone = false;
    const update = () => {
      // Two real gates: fonts half the bar, document the other half.
      const p = (fontsDone ? 0.5 : 0.15) + (docDone ? 0.5 : 0);
      setProgress(p);
    };

    update();

    document.fonts.ready.then(() => {
      fontsDone = true;
      update();
    });

    if (document.readyState === 'complete') {
      docDone = true;
      update();
    } else {
      const onLoad = () => {
        docDone = true;
        update();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return progress;
}

function Header() {
  const location = useLocation();
  return (
    <header className="site-header frame">
      <Link to="/" className="wordmark" aria-label="ZEROOX — home">
        <IconZero size={20} className="wordmark-mark" aria-hidden="true" />
        <span className="wordmark-text">ZEROOX</span>
      </Link>

      <nav aria-label="Primary" className="site-nav">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            end={r.path === '/'}
          >
            {r.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="mode-toggle" aria-label="Terminal mode" aria-pressed="false" data-cursor="link">
        <IconZero size={22} aria-hidden="true" />
      </button>

      <span className="header-path" aria-hidden="true">
        <Micro>{routes.find((r) => r.path === location.pathname)?.prompt ?? location.pathname}</Micro>
      </span>
    </header>
  );
}

export default function App() {
  const progress = useAssetProgress();
  const [loaded, setLoaded] = useState(false);
  const ready = progress >= 0.9;
  useSmoothScroll();

  // Keep body scroll locked while the preloader owns the screen.
  useEffect(() => {
    document.documentElement.style.overflow = loaded ? '' : 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [loaded]);

  const shell = useMemo(
    () => (
      <>
        <Cursor />
        <Suspense fallback={null}>
          <SceneGate />
        </Suspense>

        <div className="app-shell" style={{ position: 'relative', zIndex: 1 }}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">
            <RouteTransition>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/_specimen" element={<Specimen />} />
                </Routes>
              </Suspense>
            </RouteTransition>
          </main>
        </div>
      </>
    ),
    [],
  );

  return (
    <>
      {!loaded && <Preloader progress={progress} ready={ready} onDone={() => setLoaded(true)} />}
      {/* The shell mounts beneath the preloader so first paint is text,
          not a blank canvas — the LCP element is the wordmark. */}
      {shell}
    </>
  );
}
