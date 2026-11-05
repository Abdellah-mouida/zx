import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AURORA } from '../three/aurora';
import { getAtmosphere, type AuroraMood } from '../lib/atmosphere';
import { isMotionReducedNow } from '../lib/motion';

const MOOD_INDEX: Record<AuroraMood, number> = {
  calm: 0,
  drift: 1,
  dense: 2,
  quiet: 3,
  signal: 4,
};

/**
 * The aurora quad (DESIGN.md §7.3). Fullscreen, behind everything, drawn
 * first with no depth write so the rest of the scene composites over it.
 *
 * Uniforms are mutated in the frame loop and never cause a React render.
 * The mood is eased rather than snapped, so a route change reads as the
 * atmosphere shifting instead of the background cutting.
 */
export default function Aurora() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const easedMood = useRef(0);
  const pointer = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMood: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uOctaves: { value: 3 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMotionOff: { value: 0 },
    }),
    [],
  );

  useFrame((st) => {
    const u = mat.current?.uniforms;
    if (!u) return;

    const atmos = getAtmosphere();
    const reduced = isMotionReducedNow();

    u.uTime.value = st.clock.elapsedTime;
    u.uMotionOff.value = reduced ? 1 : 0;
    u.uOctaves.value = atmos.settings.auroraOctaves;
    u.uResolution.value.set(size.width, size.height);
    u.uScroll.value = atmos.scroll;
    u.uVelocity.value = reduced ? 0 : atmos.velocity;

    // Ease the mood so route changes shift the atmosphere, never cut it.
    const target = MOOD_INDEX[atmos.mood];
    easedMood.current += (target - easedMood.current) * (reduced ? 1 : 0.035);
    u.uMood.value = easedMood.current;

    if (!reduced) {
      // st.pointer is -1..1; the shader wants pixels.
      pointer.current.set(
        ((st.pointer.x + 1) / 2) * size.width,
        ((1 - st.pointer.y) / 2) * size.height,
      );
      u.uPointer.value.lerp(pointer.current, 0.05);
    } else {
      u.uPointer.value.set(size.width / 2, size.height * 0.45);
    }
  });

  return (
    <mesh frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={AURORA.VERT}
        fragmentShader={AURORA.FRAG}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
