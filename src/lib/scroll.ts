/**
 * Smooth scroll (Lenis) wired into the atmosphere store.
 *
 * Lenis owns scrolling for the whole site; GSAP ScrollTrigger is driven
 * from the same loop so the two never fight over the scroll position.
 * Under reduced motion Lenis is not started at all — native scrolling is
 * both correct and what the preference asks for.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScroll } from './atmosphere';
import { useReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** The live instance, for `scrollTo` from the nav and the terminal. */
export function getLenis(): Lenis | null {
  return lenis;
}

/** Scroll to a target. Falls back to native when Lenis is not running. */
export function scrollToTarget(target: string | number | HTMLElement, offset = 0): void {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  const el =
    typeof target === 'string' ? document.querySelector(target) : target instanceof HTMLElement ? target : null;
  if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
  else if (typeof target === 'number') window.scrollTo({ top: target });
}

export function useSmoothScroll(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Native scroll. Still report progress so the aurora tracks position,
      // but with zero velocity so nothing stretches or swirls.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScroll(max > 0 ? window.scrollY / max : 0, 0);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const instance = new Lenis({
      duration: 1.05,
      // Matches --ease-out-expo in feel; no overshoot, no elastic.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native touch scrolling feels better and costs less
      gestureOrientation: 'vertical',
    });
    lenis = instance;

    instance.on('scroll', ({ progress, velocity }: { progress: number; velocity: number }) => {
      // Lenis velocity is in px/frame and can spike; normalise to 0..1.
      setScroll(progress, Math.min(1, Math.abs(velocity) / 40));
      ScrollTrigger.update();
    });

    // One loop drives Lenis, which drives ScrollTrigger. GSAP's ticker is
    // the single clock so there is never a second rAF competing with it.
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (value !== undefined) instance.scrollTo(value, { immediate: true });
        return instance.scroll;
      },
    });

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);
}
