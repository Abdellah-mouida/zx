import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { getAtmosphere } from '../lib/atmosphere';
import { isMotionReducedNow } from '../lib/motion';

/**
 * The hero Ø (the Zero motif, DESIGN.md signature elements).
 *
 * A refractive glass torus with a slash through it, floating in volumetric
 * light. It answers the pointer with inertia — it is heavy, so it lags and
 * settles rather than snapping, which is most of what makes it read as a
 * real object instead of a CSS trick.
 *
 * Refraction quality comes from the tier: 2 bounces high, 1 medium, and at
 * the low tier it falls back to a matte glass material with no transmission
 * at all (transmission is the single most expensive thing in the scene).
 */
export default function ZeroObject({
  bounces,
  scrollRange = 1,
}: {
  bounces: number;
  scrollRange?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const slash = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  // Inertia state: velocity-based easing toward the pointer target.
  const rot = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pulseRef = useRef({ last: 0, t: 0 });

  const torus = useMemo(() => new THREE.TorusGeometry(1.32, 0.33, 48, 160), []);
  const slashGeo = useMemo(() => new THREE.CapsuleGeometry(0.115, 2.5, 12, 24), []);

  useFrame((st, delta) => {
    if (!group.current) return;

    const atmos = getAtmosphere();
    const reduced = isMotionReducedNow();
    const d = Math.min(delta, 1 / 30); // clamp so a stall cannot fling it

    // --- the Ø shader event (the `z` Easter egg) ---
    if (atmos.zeroPulse !== pulseRef.current.last) {
      pulseRef.current.last = atmos.zeroPulse;
      pulseRef.current.t = 1;
    }
    if (pulseRef.current.t > 0) pulseRef.current.t = Math.max(0, pulseRef.current.t - d * 0.6);
    const pulse = pulseRef.current.t;

    if (reduced) {
      // §6.4 — a composed resting pose, no motion at all.
      group.current.rotation.set(-0.22, 0.42, 0.08);
      group.current.position.set(0, 0, 0);
      group.current.scale.setScalar(1);
      return;
    }

    // --- pointer inertia -----------------------------------------
    // Target rotation from the pointer, limited so it never spins.
    const targetY = st.pointer.x * 0.52;
    const targetX = -st.pointer.y * 0.34;

    // Spring toward the target: acceleration proportional to error,
    // damped. This is what gives it mass.
    const k = 5.2;      // stiffness
    const damp = 0.86;  // damping
    rot.current.vy += (targetY - rot.current.y) * k * d;
    rot.current.vx += (targetX - rot.current.x) * k * d;
    rot.current.vy *= damp;
    rot.current.vx *= damp;
    rot.current.y += rot.current.vy;
    rot.current.x += rot.current.vx;

    // A slow continuous drift on the third axis so it never looks frozen
    // when the pointer is still.
    const t = st.clock.elapsedTime;
    group.current.rotation.set(
      rot.current.x + Math.sin(t * 0.21) * 0.04,
      rot.current.y + t * 0.055,
      Math.cos(t * 0.17) * 0.05,
    );

    // --- scroll: the object recedes and sinks as the page moves ---
    const p = Math.min(1, atmos.scroll / Math.max(0.0001, scrollRange));
    group.current.position.y = -p * 1.9 + Math.sin(t * 0.5) * 0.045;
    group.current.position.z = -p * 2.4;

    // Velocity gives it a brief stretch, and the pulse a swell.
    const swell = 1 + atmos.velocity * 0.035 + pulse * 0.14;
    group.current.scale.setScalar(swell * (1 - p * 0.12));

    // The slash counter-rotates very slightly, so the two read as separate
    // pieces of glass rather than one welded object.
    if (slash.current) {
      slash.current.rotation.z = Math.PI / 4 + Math.sin(t * 0.3) * 0.02 + pulse * 0.25;
    }
  });

  // Low tier: no transmission. Matte glass, still a real object.
  const matte = bounces <= 0;

  return (
    <group ref={group} scale={responsiveScale(size.width)}>
      {/* The ring */}
      <mesh geometry={torus} castShadow={false} receiveShadow={false}>
        {matte ? (
          <meshStandardMaterial
            color="#0a1526"
            metalness={0.55}
            roughness={0.28}
            emissive="#0b1a33"
            emissiveIntensity={0.6}
          />
        ) : (
          <MeshTransmissionMaterial
            samples={bounces >= 2 ? 8 : 4}
            resolution={bounces >= 2 ? 512 : 256}
            thickness={1.1}
            ior={1.42}
            chromaticAberration={0.035}
            anisotropy={0.1}
            distortion={0.22}
            distortionScale={0.3}
            temporalDistortion={0.08}
            roughness={0.06}
            attenuationDistance={2.4}
            attenuationColor="#0b1a33"
            color="#a8c8ff"
            background={new THREE.Color('#000000')}
          />
        )}
      </mesh>

      {/* The slash — this is what makes it a Ø and not a torus */}
      <mesh ref={slash} geometry={slashGeo} rotation={[0, 0, Math.PI / 4]}>
        {matte ? (
          <meshStandardMaterial
            color="#1b3b6b"
            metalness={0.5}
            roughness={0.3}
            emissive="#3d8bff"
            emissiveIntensity={0.35}
          />
        ) : (
          <MeshTransmissionMaterial
            samples={bounces >= 2 ? 6 : 3}
            resolution={256}
            thickness={0.6}
            ior={1.46}
            chromaticAberration={0.02}
            roughness={0.04}
            attenuationDistance={1.2}
            attenuationColor="#13325e"
            color="#cfe0ff"
            background={new THREE.Color('#000000')}
          />
        )}
      </mesh>

      {/* The emissive rim that seeds bloom (§7.2) — nothing else does. */}
      <mesh scale={1.055}>
        <torusGeometry args={[1.32, 0.012, 8, 160]} />
        <meshBasicMaterial color="#7fb2ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * The object must dominate its viewport at every width without overflowing.
 * Scaled by viewport width rather than by media query so it is continuous.
 */
function responsiveScale(width: number): number {
  if (width < 480) return 0.62;
  if (width < 768) return 0.78;
  if (width < 1200) return 0.92;
  return 1;
}
