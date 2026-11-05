import type { SVGProps } from 'react';

/**
 * The icon set. DESIGN.md §8.
 *
 * One grid (24), one stroke width (1.5), square caps, no fills, no icon ever
 * placed in a tinted square. Drawn here rather than pulled from Lucide or
 * FontAwesome so the set stays small, consistent and ours.
 *
 * Every icon is `aria-hidden` by default: an icon beside a label is
 * decoration. When an icon is the only content of a control, the control
 * carries the accessible name, not the icon.
 */

type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered size in px. Stroke scales to stay optically 1.5 at 24. */
  size?: number;
  /** Set when the icon is the sole content of a control. */
  title?: string;
};

function Icon({ size = 24, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------- *
   The motif
 * ---------------------------------------------------------------- */

/** The Ø. The recurring signature: nav toggle, loader, cursor, 404. */
export function IconZero(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.3 17.7 17.7 6.3" />
    </Icon>
  );
}

/* ---------------------------------------------------------------- *
   Navigation and structure
 * ---------------------------------------------------------------- */

/** Traversal into depth. Used for "enter case study". */
export function IconEnter(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h13" />
      <path d="M12 7l5 5-5 5" />
      <path d="M20 4v16" />
    </Icon>
  );
}

export function IconBack(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12H7" />
      <path d="M12 7l-5 5 5 5" />
      <path d="M4 4v16" />
    </Icon>
  );
}

/** Previous / next in the project camera move. */
export function IconChevron(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  );
}

/* ---------------------------------------------------------------- *
   System and state
 * ---------------------------------------------------------------- */

/** Terminal. The hacker-mode affordance. */
export function IconTerminal(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M7 10l2.5 2L7 14" />
      <path d="M12.5 15h4" />
    </Icon>
  );
}

/** Copy to clipboard. Used on the PGP fingerprint. */
export function IconCopy(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" />
      <path d="M15 5H4v11" />
    </Icon>
  );
}

/** Confirmation after a copy or a successful transmit. */
export function IconConfirm(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Icon>
  );
}

/** Failure state. Deliberately not a circle-with-cross cliche. */
export function IconFault(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v10" />
      <path d="M12 17.5v2" />
    </Icon>
  );
}

/** Transmit. The contact form's send action. */
export function IconTransmit(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12h7" />
      <path d="M21 4L10 12l11 8z" />
    </Icon>
  );
}

/** Encryption / signed. Beside the PGP block. */
export function IconKey(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9" />
      <path d="M17 12v3.5" />
      <path d="M20 12v2.5" />
    </Icon>
  );
}

/** Reduce effects toggle. A waveform flattening. */
export function IconReduceMotion(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12h4l2-5 2 10 2-7 2 4h6" />
    </Icon>
  );
}

/** Audio on. */
export function IconAudio(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9v6h3l5 4V5L7 9H4z" />
      <path d="M16 9.5a3.5 3.5 0 010 5" />
    </Icon>
  );
}

/** Audio muted — the default state. */
export function IconAudioMuted(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9v6h3l5 4V5L7 9H4z" />
      <path d="M16 10l4 4" />
      <path d="M20 10l-4 4" />
    </Icon>
  );
}

/* ---------------------------------------------------------------- *
   Social — drawn to the same grid, never brand logos in squares
 * ---------------------------------------------------------------- */

/** Repository. Stands in for GitHub without copying the mark. */
export function IconRepo(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M9 4v8l2.5-2L14 12V4" />
    </Icon>
  );
}

/** Short-form broadcast. For X. */
export function IconBroadcast(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
    </Icon>
  );
}

/** Direct message. For Telegram and Discord. */
export function IconMessage(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h16v11H9l-5 4z" />
    </Icon>
  );
}

/** Range / lab. For Hack The Box and TryHackMe. */
export function IconRange(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4v3" />
      <path d="M12 17v3" />
    </Icon>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 7l9 6 9-6" />
    </Icon>
  );
}

/** Maps a social link id to its icon. */
export const socialIcons: Record<string, (p: IconProps) => React.ReactElement> = {
  github: IconRepo,
  x: IconBroadcast,
  telegram: IconMessage,
  discord: IconMessage,
  hackthebox: IconRange,
  tryhackme: IconRange,
  email: IconMail,
};
