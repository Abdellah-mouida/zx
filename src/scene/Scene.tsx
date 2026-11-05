import { Suspense, lazy, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import Aurora from './Aurora';
import Particles from './Particles';
import Trails from './Trails';
import { useAtmosphere, demoteTier, getAtmosphere } from '../lib/atmosphere';
import { FpsMonitor } from '../lib/quality';
import { useReducedMotion } from '../lib/motion';
import StaticAurora from './StaticAurora';

// Post-processing is only loaded when a tier actually wants it.
const Post = lazy(() => import('./Post'));

/** Samples the frame loop into the FPS monitor. Renders nothing. */
function FrameMonitor() {
  const monitor = useRef<FpsMonitor | null>(null);

  useEffect(() => {
    monitor.current = new FpsMonitor(demoteTier, () => getAtmosphere().tier);
    return () => monitor.current?.dispose();
  }, []);

  useFrame(() => {
    monitor.current?.sample(performance.now());
  });

  return null;
}

/**
 * The global background scene (DESIGN.md §7).
 *
 * Fixed behind the whole site, `aria-hidden` and non-interactive. It is
 * never the LCP element: the page's text paints first and this mounts
 * underneath it.
 *
 * Without WebGL this renders the static composed fallback instead (§7.5),
 * which must look deliberate rather than broken.
 */
export default function Scene() {
  const { settings, capabilities, sceneActive } = useAtmosphere();
  const reduced = useReducedMotion();

  if (!capabilities.webgl || !sceneActive) return <StaticAurora />;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        // The scene sits on the void so the first paint is never a white flash.
        backgroundColor: 'var(--color-void)',
      }}
    >
      <Canvas
        dpr={settings.dpr}
        gl={{
          antialias: false, // bloom + the dither handle edges more cheaply
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 60 }}
        // Under reduced motion the loop runs on demand only: one frame, then rest.
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Aurora />
        <Particles count={settings.particles} dpr={settings.dpr} />
        <Trails count={settings.trails} />
        {!reduced && <FrameMonitor />}
        {settings.bloom && (
          <Suspense fallback={null}>
            <Post
              chromaticAberration={settings.chromaticAberration}
              vignette={settings.vignette}
            />
          </Suspense>
        )}
      </Canvas>
    </div>
  );
}

