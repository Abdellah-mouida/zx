/**
 * No-WebGL and low-tier fallback (DESIGN.md §7.5).
 *
 * A still, composed field in the same palette — rendered in CSS so it
 * costs nothing and cannot fail. It must read as an intentional dark
 * gradient, not as a missing canvas.
 *
 * Kept in its own module, not inside Scene: SceneGate imports this
 * synchronously and Scene asynchronously, and a shared file would force
 * the whole three.js scene into the eager chunk.
 */
export default function StaticAurora() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: 'var(--color-void)',
        backgroundImage: [
          'radial-gradient(60rem 40rem at 18% 72%, rgb(30 70 128 / 0.30), transparent 70%)',
          'radial-gradient(44rem 30rem at 76% 28%, rgb(11 26 51 / 0.55), transparent 72%)',
          'radial-gradient(70rem 50rem at 50% 110%, rgb(61 139 255 / 0.10), transparent 68%)',
        ].join(','),
      }}
    />
  );
}
