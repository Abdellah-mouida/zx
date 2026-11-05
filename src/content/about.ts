import type { BootLogEntry, Certification } from './types';

/**
 * Education — rendered as a boot log (a timeline of state changes),
 * not a resume list. `placeholder: true` on each because the brief marks
 * the whole section provisional; the specifics are invented and must be
 * replaced with the real record before launch.
 */

export const bootLog: BootLogEntry[] = [
  {
    period: '2016',
    title: 'First terminal',
    body: 'Started with Python and Linux. Shipped small tools. Broke a lot of them.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
  {
    period: '2018–2019',
    title: 'Secondary school, science track',
    body: 'Won the first local CTF entered. Learned C, then enough assembly to stop being afraid of it.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
  {
    period: '2019–2022',
    title: 'B.Sc. Computer Science',
    body: 'Specialization in Information Security. Thesis on detection gaps in Windows event telemetry — the seed of the TELEMETRY LAB work.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
  {
    period: '2021',
    title: 'First bounty acknowledgement',
    body: 'A real finding in a real program, and the first write-up that was worth keeping.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
  {
    period: '2022–2023',
    title: 'M.Sc. track, Cybersecurity',
    body: 'Adversary simulation, malware analysis, secure systems design.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
  {
    period: '2023–present',
    title: 'Independent',
    body: 'Red-team research, tooling and 3D/web engineering under the ZEROOX identity.',
    placeholder: true,
    placeholderNote: 'Invented record. Replace with the real boot history.',
  },
];

/**
 * Certifications — a quiet credentials log.
 *
 * ALL placeholder. These are the canonical red-team certs used as the
 * shape of the section; they are not held by anyone in particular and
 * must be replaced with the real set before launch.
 */
export const certifications: Certification[] = [
  {
    abbr: 'OSCP',
    name: 'OffSec Certified Professional',
    issuer: 'OffSec',
    status: 'held',
    placeholder: true,
    placeholderNote: 'Placeholder cert. Replace with the real credentials held.',
  },
  {
    abbr: 'CRTO',
    name: 'Certified Red Team Operator',
    issuer: 'Zero-Point Security',
    status: 'held',
    placeholder: true,
    placeholderNote: 'Placeholder cert. Replace with the real credentials held.',
  },
  {
    abbr: 'eJPT',
    name: 'eLearnSecurity Junior Penetration Tester',
    issuer: 'INE',
    status: 'held',
    placeholder: true,
    placeholderNote: 'Placeholder cert. Replace with the real credentials held.',
  },
  {
    abbr: 'PNPT',
    name: 'Practical Network Penetration Tester',
    issuer: 'TCM Security',
    status: 'in-progress',
    placeholder: true,
    placeholderNote: 'Placeholder cert. Replace with the real credentials held.',
  },
];
