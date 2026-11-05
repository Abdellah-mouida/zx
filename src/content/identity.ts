import type { Principle, SocialLink } from './types';

/**
 * Identity, voice and contact.
 *
 * Voice rules (DESIGN.md §11): spare, confident, dry. Short sentences.
 * Banned: passionate, crafting, journey, welcome to my portfolio,
 * innovative, cutting-edge, seamless, synergy, leverage, robust, delve.
 */

export const identity = {
  handle: 'ZEROOX',

  /**
   * The chosen tagline. Picked over the two alternatives because it is the
   * only one that states a method rather than a posture — and the method is
   * what the rest of the site demonstrates.
   */
  tagline: 'Break it. Understand it. Build it better.',

  /** Kept for the terminal `whoami` output and the OG description. */
  taglineAlternates: ['Zero trust. Zero noise. Full control.', 'Offense is the best teacher.'],

  role: 'Independent digital developer and offensive-security specialist',
  focus: 'Red team',

  /** One line of positioning copy on the hero. Under 2 lines at 390px. */
  positioning: 'I break systems in authorized engagements, then build the things that hold.',

  /** The anonymity is the brand. This is stated once, plainly, in About. */
  anonymity:
    'No real name here. The handle does the work, and the work is the only credential that matters.',

  /** Shown once, in About. Non-negotiable, never softened. */
  ethics:
    'Every offensive engagement on this page happened under written authorization, in a lab I own, or in a CTF. No exceptions, no grey areas, no operational payloads published.',

  availability: 'Open to select engagements. Response time under 24h.',
  responseWindow: 'under 24h',
} as const;

export const contact = {
  email: 'contact@zeroox.dev',

  /** Copy-on-click. Grouped in fours the way GnuPG prints it. */
  pgpFingerprint: '3D8B FF00 A7C2 91E4 5B0D 7F36 C19A E208 44BD 0ZXX',
} as const;

export const socials: SocialLink[] = [
  { id: 'github', label: 'GitHub', handle: 'github.com/zeroox', href: 'https://github.com/zeroox' },
  { id: 'x', label: 'X', handle: '@zeroox_dev', href: 'https://x.com/zeroox_dev' },
  { id: 'telegram', label: 'Telegram', handle: '@zeroox', href: 'https://t.me/zeroox' },
  { id: 'discord', label: 'Discord', handle: 'zeroox', href: 'https://discord.com/users/zeroox' },
  {
    id: 'hackthebox',
    label: 'Hack The Box',
    handle: 'ZEROOX',
    href: 'https://app.hackthebox.com/users/zeroox',
  },
  {
    id: 'tryhackme',
    label: 'TryHackMe',
    handle: 'zeroox',
    href: 'https://tryhackme.com/p/zeroox',
  },
];

/**
 * The manifesto. Four short paragraphs, read as one piece.
 * Each sentence states something specific or is cut.
 */
export const manifesto: string[] = [
  'Most security work is performed in the wrong order. A system gets built, shipped, and only then handed to someone paid to find out whether it survives contact. By that point the interesting decisions are already made.',
  'I work from the other end. Learn how a thing fails, in detail, against a real adversary model — then build with that knowledge in the room from the first commit.',
  'The two halves are the same skill. Reading a binary in Ghidra and writing a shader are both exercises in holding an exact mental model of a machine that will not forgive an approximation.',
  'So: offense to understand, engineering to fix. Nothing here is a hobby project pretending to be a practice, and nothing is a practice pretending to be a product.',
];

/** Scroll-pinned, one per viewport. Body stays under ~25 words (§4.2). */
export const principles: Principle[] = [
  {
    index: 'I',
    title: 'Assume breach',
    body: 'The perimeter already failed. Design for the attacker who is inside, authenticated, and patient.',
  },
  {
    index: 'II',
    title: 'Depth over coverage',
    body: 'One protocol understood to the byte beats forty tools run from a checklist. Depth transfers; checklists do not.',
  },
  {
    index: 'III',
    title: 'Build the thing you broke',
    body: 'An attack you cannot defend against is a trick. Write the detection, then the fix, then the tool.',
  },
  {
    index: 'IV',
    title: 'Leave no noise',
    body: 'Good operations are quiet. So is good engineering. If it draws attention to itself, it is not finished.',
  },
];

/** The personal glimpse. Specific, never cheesy, no life story. */
export const personal = {
  heading: 'Behind the handle',
  body: 'Based in a timezone that makes European mornings and American afternoons both workable. Reads disassembly faster than documentation. Keeps a lab of eleven machines, four of which exist only to be destroyed on a schedule. Runs long distances to think, writes shaders to stop thinking.',
  /** Mono system-data strip under the paragraph. Real values only. */
  facts: [
    { k: 'Lab nodes', v: '11' },
    { k: 'Primary editor', v: 'Neovim' },
    { k: 'Daily driver', v: 'Arch / Kali' },
    { k: 'Timezone', v: 'UTC+01' },
  ],
} as const;
