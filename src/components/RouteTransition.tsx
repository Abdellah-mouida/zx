import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../lib/motion';
import { setMood } from '../lib/atmosphere';
import { routes } from '../content';

/**
 * The animated route-transition layer (DESIGN.md §6.2, --dur-route 720ms).
 *
 * One transition for the whole site: the outgoing page sinks and fades
 * while the incoming one rises into place. No slide-in from the side, no
 * scale-bounce — a page change should read as a camera cut, not a carousel.
 *
 * It also sets the aurora mood for the new route, so the atmosphere shifts
 * with the page rather than being set inside each page component.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navType = useNavigationType();
  const reduced = useReducedMotion();
  const firstRender = useRef(true);

  // Mood follows the route (§7.3).
  useEffect(() => {
    const match =
      routes.find((r) => r.path === location.pathname) ??
      // Case-study pages inherit the Projects mood.
      (location.pathname.startsWith('/projects/') ? routes.find((r) => r.path === '/projects') : undefined);
    if (match) setMood(match.mood);
  }, [location.pathname]);

  // Scroll to top on a push, but not when the browser restores a position.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  if (reduced) {
    // §6.4 — no travel. The content is simply present.
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{
          duration: 0.72,
          // --ease-in-out-quint: the camera-move curve.
          ease: [0.83, 0, 0.17, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
