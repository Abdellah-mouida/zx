/**
 * Light trails (DESIGN.md §7.4).
 *
 * Thin additive curves that drift through the scene on catmull-rom paths
 * and stretch with scroll velocity — the "motion has purpose" element:
 * they are the visible sign that the camera is being moved, not scrolled.
 *
 * Each trail is one TubeGeometry ribbon. The shader sweeps a bright head
 * along it and fades the tail, so a trail reads as a thing travelling,
 * not as a static line.
 */

const VERT = /* glsl */ `
  attribute float aAlong;   // 0 tail .. 1 head of the ribbon
  attribute float aSide;    // -1 .. +1 across the ribbon

  varying float vAlong;
  varying float vSide;

  void main() {
    vAlong = aAlong;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform float uVelocity;
  uniform float uSeed;
  uniform float uMotionOff;
  uniform vec3 uColor;

  varying float vAlong;
  varying float vSide;

  void main() {
    float t = uTime * (1.0 - uMotionOff);

    // The bright head travels along the curve and repeats. Velocity makes
    // it faster and longer, so a hard scroll visibly whips the trails.
    float speed = 0.10 + uVelocity * 0.55;
    float headPos = fract(t * speed + uSeed);
    float len = 0.16 + uVelocity * 0.30;

    // Position of this fragment relative to the moving head, wrapped.
    float rel = fract(headPos - vAlong);
    float head = smoothstep(len, 0.0, rel);   // 1 at head, 0 after len

    // The ribbon is brightest at its centre line.
    float core = 1.0 - abs(vSide);

    float a = head * core;
    a *= a; // sharpen the falloff so the trail stays thin, not a smear

    gl_FragColor = vec4(uColor * a, a);
  }
`;

export const TRAILS = { VERT, FRAG };

export interface TrailSpec {
  /** Control points for the catmull-rom path, in world units. */
  points: [number, number, number][];
  width: number;
  seed: number;
}

/**
 * A deterministic set of trail paths. Count is a quality knob (§7.1); the
 * first `n` are taken, so demotion removes trails rather than shuffling them.
 */
export function trailSpecs(): TrailSpec[] {
  return [
    { points: [[-14, -4, -6], [-5, 2, -8], [3, 1, -7], [12, -3, -9]], width: 0.06, seed: 0.13 },
    { points: [[-12, 3, -10], [-3, -2, -11], [5, 3, -10], [14, 0, -12]], width: 0.045, seed: 0.41 },
    { points: [[-16, -2, -14], [-7, 4, -15], [4, -1, -14], [16, 5, -16]], width: 0.03, seed: 0.6 },
    { points: [[-10, 6, -7], [0, -3, -9], [8, 2, -8], [18, -4, -10]], width: 0.055, seed: 0.22 },
    { points: [[-18, 0, -13], [-8, -5, -12], [2, 5, -13], [13, -2, -14]], width: 0.04, seed: 0.78 },
    { points: [[-13, -6, -8], [-4, 0, -10], [6, -4, -9], [17, 3, -11]], width: 0.05, seed: 0.33 },
    { points: [[-15, 2, -16], [-6, -4, -17], [5, 4, -16], [15, -5, -18]], width: 0.028, seed: 0.9 },
    { points: [[-11, -3, -5], [-2, 3, -6], [7, -2, -6], [16, 4, -7]], width: 0.065, seed: 0.07 },
    { points: [[-17, -5, -12], [-8, 1, -13], [3, -4, -12], [14, 2, -14]], width: 0.035, seed: 0.55 },
    { points: [[-9, 4, -9], [1, -2, -11], [9, 5, -10], [19, -1, -12]], width: 0.048, seed: 0.29 },
    { points: [[-14, 1, -18], [-5, -3, -19], [6, 3, -18], [16, -4, -20]], width: 0.026, seed: 0.84 },
    { points: [[-12, -1, -7], [-3, 5, -8], [8, -3, -8], [18, 1, -9]], width: 0.052, seed: 0.49 },
  ];
}
