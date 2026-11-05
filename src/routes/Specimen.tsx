import { identity, contact, arsenal, projects, projectIndexLabel } from '../content';

/**
 * Specimen route — a temporary kitchen sink that proves every foundation
 * token resolves and every content file loads. It is not a page design;
 * the real nav and pages replace it in tasks 4–9.
 */
export default function Specimen() {
  return (
    <main className="frame">
      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <p className="t-micro" style={{ color: 'var(--color-accent)' }}>
          SYS: ONLINE — FOUNDATION SPECIMEN
        </p>
        <h1 className="t-display-xl">{identity.handle}</h1>
        <p className="t-statement" style={{ marginTop: '1.5rem', color: 'var(--color-text-2)' }}>
          {identity.tagline}
        </p>
        <p className="t-body" style={{ marginTop: '1rem' }}>
          {identity.positioning}
        </p>
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 className="t-heading">Glass levels</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <div className="glass-surface" style={{ padding: '1.5rem' }}>
            <p className="t-micro" style={{ color: 'var(--color-text-3)' }}>
              glass-surface
            </p>
            <p className="t-body">backdrop 12px, fill 48%, edge 0.10, no shadow.</p>
          </div>
          <div className="glass-raised" style={{ padding: '1.5rem' }}>
            <p className="t-micro" style={{ color: 'var(--color-text-3)' }}>
              glass-raised
            </p>
            <p className="t-body">backdrop 20px, fill 62%, edge 0.18, tracking sheen.</p>
          </div>
          <div className="glass-overlay" style={{ padding: '1.5rem' }}>
            <p className="t-micro" style={{ color: 'var(--color-text-3)' }}>
              glass-overlay
            </p>
            <p className="t-body">backdrop 32px, fill 78%, edge 0.26, floats.</p>
          </div>
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 className="t-heading">Content check</h2>
        <p className="t-body" style={{ marginTop: '1rem' }}>
          Arsenal: {arsenal.length} clusters, {arsenal.flatMap((c) => c.nodes).length} nodes. Projects:{' '}
          {projects.length} case studies.
        </p>
        <p className="t-micro" style={{ marginTop: '1rem', color: 'var(--color-text-3)' }}>
          {projects.map((p) => `${p.slug} ${projectIndexLabel(p)}`).join('  ·  ')}
        </p>
        <p className="t-small" style={{ marginTop: '1rem', color: 'var(--color-text-2)' }}>
          PGP {contact.pgpFingerprint} — {contact.email}
        </p>
      </section>
    </main>
  );
}
