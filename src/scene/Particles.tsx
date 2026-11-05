import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLES, buildParticles } from '../three/particles';
import { getAtmosphere } from '../lib/atmosphere';
import { isMotionReducedNow } from '../lib/motion';

/**
 * Atmospheric dust (DESIGN.md §7.4). Three parallax layers, all movement
 * in the vertex shader. `count` comes from the quality tier; at the low
 * tier this component is not mounted at all.
 */
export default function Particles({ count, dpr }: { count: number; dpr: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  // Rebuilt only when the count changes (a tier demotion), never per frame.
  const attrs = useMemo(() => buildParticles(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uDpr: { value: dpr },
      uMotionOff: { value: 0 },
    }),
    [dpr],
  );

  useFrame((st) => {
    const u = mat.current?.uniforms;
    if (!u) return;

    const atmos = getAtmosphere();
    const reduced = isMotionReducedNow();

    u.uTime.value = st.clock.elapsedTime;
    u.uMotionOff.value = reduced ? 1 : 0;
    u.uScroll.value = atmos.scroll;
    u.uVelocity.value = reduced ? 0 : atmos.velocity;

    if (!reduced) {
      pointer.current.set(st.pointer.x * 10, st.pointer.y * 6);
      u.uPointer.value.lerp(pointer.current, 0.04);
    }
  });

  if (count <= 0) return null;

  return (
    <points frustumCulled={false} renderOrder={-50}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[attrs.sizes, 1]} />
        <bufferAttribute attach="attributes-aLayer" args={[attrs.layers, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[attrs.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={PARTICLES.VERT}
        fragmentShader={PARTICLES.FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        // Additive is the only blend mode permitted to brighten the scene (§7.4).
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
