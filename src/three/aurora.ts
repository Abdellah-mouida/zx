/**
 * The aurora (DESIGN.md §7.3).
 *
 * A single fullscreen quad behind everything, domain-warped fBm in deep
 * blue with the teal/indigo mix held under 18%. One shader for the whole
 * site: the per-page personality lives in uniforms, not in five shaders.
 *
 * Uniforms:
 *   uTime        — seconds
 *   uMood        — 0 calm | 1 drift | 2 dense | 3 quiet | 4 signal
 *   uScroll      — 0..1 page progress
 *   uVelocity    — smoothed |scroll velocity|, 0..1
 *   uPointer     — vec2 in pixels
 *   uOctaves     — fBm octave count (tier: high 3, medium/low 2)
 *   uResolution  — canvas size in pixels
 *   uMotionOff   — 1 = freeze time and velocity
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uMood;
  uniform float uScroll;
  uniform float uVelocity;
  uniform vec2 uPointer;
  uniform float uOctaves;
  uniform vec2 uResolution;
  uniform float uMotionOff;

  /* ---- value noise + fbm -------------------------------------- */

  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p, float oct) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      if (float(i) >= oct) break;
      v += a * noise(p);
      p = rot * p * 2.02 + vec2(0.13);
      a *= 0.5;
    }
    return v;
  }

  /* ---- mood knobs, one table not five shaders ------------------
     Each column is a vec4: (warp, speed, density, brightness)      */

  vec4 moodKnobs(float m) {
    //            warp   speed  dens   bright
    if (m < 0.5) return vec4(0.9, 0.9, 0.55, 1.00);  // calm    (Home)
    if (m < 1.5) return vec4(1.1, 1.3, 0.62, 1.02);  // drift   (Projects)
    if (m < 2.5) return vec4(1.5, 1.0, 0.92, 1.04);  // dense   (Arsenal)
    if (m < 3.5) return vec4(0.7, 0.4, 0.40, 0.94);  // quiet   (About)
                  return vec4(1.0, 0.8, 0.72, 1.00);  // signal  (Contact)
  }

  void main() {
    float t = uTime * (1.0 - uMotionOff);
    vec4 K = moodKnobs(uMood);

    // aspect-corrected uv, origin near the lower-left focal region
    vec2 uv = vUv;
    vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - vec2(0.5, 0.42)) * asp * 2.2;

    // pointer gently pulls the field toward it (only when not frozen)
    vec2 ptr = (uPointer / uResolution - vec2(0.5, 0.42)) * asp * 2.2;
    p += (ptr - p) * 0.12 * (1.0 - uMotionOff);

    // scroll lifts the field and velocity swirls it — velocity-aware (§6.3)
    float vel = uVelocity * (1.0 - uMotionOff);
    p.y += uScroll * 0.6;
    float swirl = vel * 0.5;

    // domain warp: two rounds so the ridges bend rather than stripe
    vec2 q = vec2(
      fbm(p + vec2(0.0, t * 0.05 * K.y), uOctaves),
      fbm(p + vec2(2.3, t * 0.04 * K.y), uOctaves));
    vec2 r = vec2(
      fbm(p + K.x * q + vec2(1.7 + swirl, 9.2), uOctaves),
      fbm(p + K.x * q + vec2(8.3, 2.8 - swirl), uOctaves));
    float f = fbm(p + K.x * r + vec2(0.0, t * 0.03 * K.y), uOctaves);
    f = 0.5 + 0.5 * f;              // remap to 0..1
    f = pow(f, 1.5 / K.z);          // density shapes the ridge falloff

    /* palette: black -> deep blue -> accent, teal/indigo capped under 18% */
    vec3 deep    = vec3(0.02, 0.045, 0.09);   // near-void blue
    vec3 blue    = vec3(0.10, 0.24, 0.50);    // accent family, low sat
    vec3 accent  = vec3(0.24, 0.545, 1.00);   // --accent
    vec3 teal    = vec3(0.12, 0.42, 0.45);    // --aurora-teal
    vec3 indigo  = vec3(0.17, 0.18, 0.42);    // --aurora-indigo

    vec3 col = vec3(0.0);
    col = mix(col, deep,  smoothstep(0.00, 0.35, f));
    col = mix(col, blue,  smoothstep(0.30, 0.72, f));
    col = mix(col, accent, smoothstep(0.68, 1.00, f) * 0.55);

    // the only cool hues, capped: a faint secondary band
    float band = smoothstep(0.48, 0.62, f) * (1.0 - smoothstep(0.62, 0.80, f));
    vec3 cool = mix(teal, indigo, r.x);
    col = mix(col, cool, band * 0.18);

    // signal mood: a faint directional pulse travelling toward the contact side
    if (uMood > 3.5) {
      float ph = fract(t * 0.14 - (uv.x + uv.y) * 0.5);
      col += accent * ph * ph * (1.0 - ph) * 0.10;
    }

    // brightness falls to the edges; the page stays dark where text sits
    float vig = smoothstep(1.25, 0.25, length(uv - vec2(0.5, 0.45)));
    col *= vig;

    // the accent never floods: keep the field under text legibly dark
    col = min(col, vec3(0.42));
    col *= K.w;

    // filmic-ish soft clip
    col = col / (1.0 + col);

    // subtle temporal dither kills banding on the near-black gradients
    float g = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const AURORA = { VERT, FRAG };
