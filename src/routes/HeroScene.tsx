import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import ZeroObject from '../scene/ZeroObject';
import { getAtmosphere } from '../lib/atmosphere';
import { isMotionReducedNow } from '../lib/motion';

/**
 * The hero's own canvas — separate from the global Scene, layered under
 * the hero content. It holds the Ø and the volumetric light that wraps it.
 *
 * Rendered only when WebGL exists; on the fallback path the hero still
 * shows the wordmark, positioning copy and status strip over the CSS
 * aurora, which §7.5 requires to look composed rather than broken.
 */
export default function HeroScene({ bounces, reduced }: { bounces: number; reduced: boolean }) {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio || 1, bounces > 0 ? 2 : 1)}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4.6], fov: 42, near: 0.1, far: 40 }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <VolumetricLight />
      <ZeroObject bounces={bounces} />
      {/* A faint ground plane far below, only to catch light falloff. */}
      <gridHelper args={[40, 40, '#0b1a33', '#04070d']} position={[0, -3.4, 0]} />
    </Canvas>
  );
}

/**
 * Volumetric light: three beams converging on the Ø, additive and very
 * soft, so the object reads as lit by a real source rather than glowing
 * of its own accord. This is the "everything glows, nothing is premium"
 * guard made literal — one source, and it is the object.
 */
function VolumetricLight() {
  const beams = useRef<THREE.Group>(null);

  useFrame((st) => {
    if (!beams.current || isMotionReducedNow()) return;
    const atmos = getAtmosphere();
    const t = st.clock.elapsedTime;
    beams.current.rotation.z = Math.sin(t * 0.1) * 0.04;
    // Scroll tightens the light — the object is lit harder as it recedes.
    beams.current.scale.y = 1 - atmos.scroll * 0.18;
  });

  return (
    <group ref={beams}>
      <Beam from={[-5, 3.2, -3]} to={[0, 0, 0]} intensity={0.5} color="#3d8bff" />
      <Beam from={[5, 4, -4]} to={[0.2, 0.3, 0]} intensity={0.34} color="#1e6b73" />
      <Beam from={[0, -5, -2]} to={[0, 0.2, 0]} intensity={0.26} color="#2b2f6b" />
      {/* A key light for the transmission material itself */}
      <pointLight position={[-4, 3, 3]} intensity={2.4} color="#7fb2ff" distance={18} />
      <pointLight position={[4, -2, 2]} intensity={0.9} color="#1e4680" distance={16} />
      <ambientLight intensity={0.08} color="#0b1a33" />
    </group>
  );
}

/** One volumetric beam: a soft additive cone from a point toward the origin. */
function Beam({
  from,
  to,
  intensity,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  intensity: number;
  color: string;
}) {
  const geo = beamGeometry(from, to);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.16}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function beamGeometry(from: [number, number, number], to: [number, number, number]) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(0.02, 1.4, len, 20, 1, true);
  geo.translate(0, len / 2, 0);
  // Orient the cone from `to` (apex) toward `from` (wide end).
  const mesh = new THREE.Object3D();
  mesh.position.copy(b);
  mesh.lookAt(a);
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geo.applyMatrix4(new THREE.Matrix4().makeTranslation(b.x, b.y, b.z));
  return geo;
}
