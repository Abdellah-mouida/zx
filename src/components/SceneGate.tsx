import { useEffect, useState, type ReactNode } from 'react';
import { useAtmosphere } from '../lib/atmosphere';
import StaticAurora from '../scene/StaticAurora';

/**
 * Gate that decides whether three.js is even imported.
 *
 * The `Scene` component and its ~270KB(gzip) three chunk must not load for
 * users who cannot run them — no-WebGL browsers and low-tier devices get
 * the CSS fallback with zero WebGL cost. `lazy()` alone always downloads
 * the chunk on mount; this wrapper skips the import entirely instead.
 */
export default function SceneGate() {
  const { capabilities } = useAtmosphere();
  const [Comp, setComp] = useState<() => ReactNode | null>(() => StaticAurora);

  const allowed = capabilities.webgl;

  useEffect(() => {
    if (!allowed) {
      setComp(() => StaticAurora);
      return;
    }
    let live = true;
    import('../scene/Scene').then((m) => {
      if (live) setComp(() => m.default);
    });
    return () => {
      live = false;
    };
  }, [allowed]);

  return <Comp />;
}
