/**
 * Atmospheric dust (DESIGN.md §7.4).
 *
 * GPU-instanced points across three parallax depth layers. Depth of field
 * is faked per layer with size and alpha rather than a DOF pass, which at
 * this scale buys the same read for none of the cost.
 *
 * Positions are generated once on the CPU and never updated from JS; all
 * movement happens in the vertex shader from uTime.
 */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aLayer;   // 0 near, 1 mid, 2 far
  attribute float aSeed;

  uniform float uTime;
  uniform float uScroll;
  uniform float uVelocity;
  uniform vec2 uPointer;
  uniform float uDpr;
  uniform float uMotionOff;

  varying float vAlpha;
  varying float vLayer;

  void main() {
    vLayer = aLayer;

    float t = uTime * (1.0 - uMotionOff);

    // Parallax: near layers move most. Scroll drives the vertical drift,
    // so the dust reads as depth rather than as a screensaver.
    float parallax = 1.0 - aLayer * 0.34;

    vec3 pos = position;
    pos.y += sin(t * 0.08 + aSeed * 6.28) * 0.35 * parallax;
    pos.x += cos(t * 0.06 + aSeed * 4.13) * 0.28 * parallax;
    pos.y -= uScroll * 7.0 * parallax;

    // Scroll velocity stretches the field forward briefly.
    pos.z += uVelocity * 1.4 * parallax * (1.0 - uMotionOff);

    // Wrap vertically so the field is endless without regenerating it.
    pos.y = mod(pos.y + 10.0, 20.0) - 10.0;

    // The pointer pushes nearby near-layer motes aside, very slightly.
    vec2 toPtr = pos.xy - uPointer;
    float d = length(toPtr);
    pos.xy += normalize(toPtr + 1e-4) * exp(-d * 1.6) * 0.22 * parallax * (1.0 - uMotionOff);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Faked DOF: far layers are smaller and dimmer.
    float depthFade = 1.0 - aLayer * 0.3;
    gl_PointSize = aSize * depthFade * uDpr * (24.0 / -mv.z);
    vAlpha = depthFade * 0.5;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  varying float vAlpha;
  varying float vLayer;

  void main() {
    // Round mote with a soft edge; no texture fetch needed.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    float soft = smoothstep(0.5, 0.06, d);

    // Near motes carry a faint accent tint, far ones read as cold white.
    vec3 near = vec3(0.42, 0.62, 1.0);
    vec3 far = vec3(0.72, 0.78, 0.88);
    vec3 col = mix(near, far, vLayer * 0.5);

    gl_FragColor = vec4(col, soft * vAlpha);
  }
`;

export const PARTICLES = { VERT, FRAG };

/**
 * Build the instance attributes for `count` motes across three layers.
 * Deterministic from `seed` so a reload looks identical and a tier change
 * does not reshuffle the whole field.
 */
export function buildParticles(count: number, seed = 1337) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const layers = new Float32Array(count);
  const seeds = new Float32Array(count);

  // Small deterministic PRNG (mulberry32).
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const layer = i % 3;
    const spread = 14 + layer * 9;

    positions[i * 3 + 0] = (rnd() - 0.5) * spread;
    positions[i * 3 + 1] = (rnd() - 0.5) * 20;
    positions[i * 3 + 2] = -2 - layer * 6 - rnd() * 4;

    sizes[i] = 0.7 + rnd() * (layer === 0 ? 1.6 : 0.9);
    layers[i] = layer;
    seeds[i] = rnd();
  }

  return { positions, sizes, layers, seeds };
}
