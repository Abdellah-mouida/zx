import { identity, contact, arsenal, projects, projectIndexLabel } from '../content';
import { Glass } from '../components/Glass';
import { Button } from '../components/Button';
import { Micro } from '../components/Micro';
import {
  IconZero,
  IconEnter,
  IconTerminal,
  IconCopy,
  IconTransmit,
  IconKey,
  IconConfirm,
  IconFault,
  IconChevron,
  IconClose,
  IconBack,
  IconReduceMotion,
  IconAudio,
  IconAudioMuted,
  IconRepo,
  IconBroadcast,
  IconMessage,
  IconRange,
  IconMail,
} from '../components/icons';

/**
 * Specimen — the material kitchen sink. Exercises the three glass levels,
 * the pointer sheen, every icon, the buttons and the cursor, so Task 3 is
 * verified by the harness before real pages are built on it.
 */
export default function Specimen() {
  return (
    <main className="frame">
      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <Micro accent>SYS: ONLINE — FOUNDATION SPECIMEN</Micro>
        <h1 className="t-display-xl">{identity.handle}</h1>
        <p className="t-statement" style={{ marginTop: '1.5rem', color: 'var(--color-text-2)' }}>
          {identity.tagline}
        </p>
        <p className="t-body" style={{ marginTop: '1rem' }}>
          {identity.positioning}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', alignItems: 'center' }}>
          <Button variant="primary">
            Enter <IconEnter size={14} />
          </Button>
          <Button variant="ghost">Projects</Button>
          <Button variant="quiet">
            <IconTerminal size={14} /> terminal
          </Button>
        </div>
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
          <Glass level="surface" style={{ padding: '1.5rem' }}>
            <Micro>glass-surface</Micro>
            <p className="t-body" style={{ marginTop: '0.5rem' }}>
              backdrop 12px, fill 48%, edge 0.10. Sheen on hover.
            </p>
          </Glass>
          <Glass level="raised" style={{ padding: '1.5rem' }}>
            <Micro>glass-raised</Micro>
            <p className="t-body" style={{ marginTop: '0.5rem' }}>
              backdrop 20px, fill 62%, edge 0.18, tracking sheen, bounce.
            </p>
          </Glass>
          <Glass level="overlay" style={{ padding: '1.5rem' }}>
            <Micro>glass-overlay</Micro>
            <p className="t-body" style={{ marginTop: '0.5rem' }}>
              backdrop 32px, fill 78%, edge 0.26, floats.
            </p>
          </Glass>
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 className="t-heading">Icon set</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            marginTop: '2rem',
            color: 'var(--color-text-2)',
          }}
        >
          {[
            IconZero,
            IconEnter,
            IconBack,
            IconChevron,
            IconClose,
            IconTerminal,
            IconCopy,
            IconConfirm,
            IconFault,
            IconTransmit,
            IconKey,
            IconReduceMotion,
            IconAudio,
            IconAudioMuted,
            IconRepo,
            IconBroadcast,
            IconMessage,
            IconRange,
            IconMail,
          ].map((Icon, i) => (
            <div key={i} style={{ display: 'grid', gap: '0.5rem', justifyItems: 'center' }}>
              <Icon size={24} />
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingBlock: 'var(--section-gap)' }}>
        <h2 className="t-heading">Content check</h2>
        <p className="t-body" style={{ marginTop: '1rem' }}>
          Arsenal: {arsenal.length} clusters, {arsenal.flatMap((c) => c.nodes).length} nodes. Projects:{' '}
          {projects.length} case studies.
        </p>
        <Micro>{projects.map((p) => `${p.slug} ${projectIndexLabel(p)}`).join('  ·  ')}</Micro>
        <p className="t-small" style={{ marginTop: '1rem', color: 'var(--color-text-2)' }}>
          PGP {contact.pgpFingerprint} — {contact.email}
        </p>
      </section>
    </main>
  );
}
