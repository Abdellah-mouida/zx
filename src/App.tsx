import { Routes, Route } from 'react-router-dom';
import Specimen from './routes/Specimen';
import { Cursor } from './components/Cursor';
import { useReducedMotion, setReducedMotionToggle } from './lib/motion';

/**
 * App shell.
 *
 * The real nav lands in Task 4 with routing and the preloader. For now this
 * mounts the custom cursor and a minimal bar so the material layer has a
 * real host to be verified against, including a working reduce-effects
 * toggle.
 */
export default function App() {
  const reduced = useReducedMotion();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Cursor />

      <header
        style={{
          position: 'fixed',
          inset: '0 0 auto 0',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem var(--gutter)',
        }}
      >
        <a
          href="/"
          className="t-micro"
          style={{ color: 'var(--color-text-1)', letterSpacing: '0.2em' }}
        >
          ZEROØX
        </a>

        <button
          className="t-micro"
          onClick={() => setReducedMotionToggle(!reduced)}
          aria-pressed={reduced}
          style={{
            color: 'var(--color-text-2)',
            padding: '0.4rem 0.75rem',
            border: '1px solid rgb(255 255 255 / 0.14)',
            borderRadius: '2px',
          }}
        >
          {reduced ? 'effects: off' : 'effects: on'}
        </button>
      </header>

      <div id="main">
        <Routes>
          <Route path="/" element={<Specimen />} />
          <Route path="/_specimen" element={<Specimen />} />
        </Routes>
      </div>
    </>
  );
}
