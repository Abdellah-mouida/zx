import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useMemo } from 'react';

/**
 * Post-processing (DESIGN.md §7.2).
 *
 * Deliberately restrained. Bloom is seeded only by what genuinely emits —
 * the Ø rim and the trails — and never by UI or text. Chromatic aberration
 * is capped so low it reads as lens quality rather than visible fringing;
 * if you can see colour separation, it is wrong.
 *
 * Lazily loaded, and only mounted when the tier asks for it.
 */
export default function Post({
  chromaticAberration,
  vignette,
}: {
  chromaticAberration: boolean;
  vignette: boolean;
}) {
  // §7.2: offset <= 0.0006.
  const caOffset = useMemo(() => new THREE.Vector2(0.0005, 0.0005), []);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        radius={0.6}
        mipmapBlur
      />
      {chromaticAberration ? (
        <ChromaticAberration
          offset={caOffset}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : (
        <></>
      )}
      {vignette ? <Vignette offset={0.32} darkness={0.55} eskil={false} /> : <></>}
    </EffectComposer>
  );
}
