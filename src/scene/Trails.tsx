import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TRAILS, trailSpecs } from '../three/trails';
import { getAtmosphere } from '../lib/atmosphere';
import { isMotionReducedNow } from '../lib/motion';

/**
 * One trail ribbon. Built from a catmull-rom curve so the path bends
 * smoothly; the moving head is drawn in the fragment shader.
 */
function Trail({ spec }: { spec: ReturnType<typeof trailSpecs>[number] }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      spec.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );

    // A flat ribbon, not a tube: two vertices per step, aAlong across the
    // length and aSide across the width. Cheaper than TubeGeometry and the
    // shader only needs those two coordinates.
    const STEPS = 96;
    const pts = curve.getPoints(STEPS);
    const positions: number[] = [];
    const along: number[] = [];
    const side: number[] = [];
    const index: number[] = [];

    const up = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const p = pts[i];
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const a = p.clone().addScaledVector(normal, spec.width);
      const b = p.clone().addScaledVector(normal, -spec.width);

      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      along.push(t, t);
      side.push(1, -1);

      if (i < STEPS) {
        const o = i * 2;
        index.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
    g.setIndex(index);
    return g;
  }, [spec]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uSeed: { value: spec.seed },
      uMotionOff: { value: 0 },
      // --accent, linear-ish
      uColor: { value: new THREE.Color(0.24, 0.545, 1.0) },
    }),
    [spec.seed],
  );

  useFrame((st) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    const reduced = isMotionReducedNow();
    u.uTime.value = st.clock.elapsedTime;
    u.uMotionOff.value = reduced ? 1 : 0;
    u.uVelocity.value = reduced ? 0 : getAtmosphere().velocity;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={-40}>
      <shaderMaterial
        ref={mat}
        vertexShader={TRAILS.VERT}
        fragmentShader={TRAILS.FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * The trail field. `count` is a quality knob: demotion takes trails away
 * from the end of a fixed list rather than reshuffling, so the scene does
 * not visibly rearrange itself when a tier drops.
 */
export default function Trails({ count }: { count: number }) {
  const specs = useMemo(() => trailSpecs().slice(0, count), [count]);
  if (count <= 0) return null;
  return (
    <>
      {specs.map((s) => (
        <Trail key={s.seed} spec={s} />
      ))}
    </>
  );
}
