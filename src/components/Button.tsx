import type { ReactNode, MouseEventHandler } from 'react';
import { Magnetic } from './Magnetic';

/**
 * Buttons. DESIGN.md §8.
 *
 * Radius is decided once, system-wide: the primary action is fully round
 * (it echoes the Ø), everything else is square. Flat fills only — no
 * gradients. One primary action per viewport, enforced by review.
 *
 * `primary` is magnetic; `ghost` and `quiet` are not, because a magnetic
 * secondary action competes with the primary one for attention.
 */

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'quiet';
  onClick?: MouseEventHandler;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'ghost',
  onClick,
  href,
  type = 'button',
  disabled,
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = `btn btn-${variant} ${className}`.trim();

  if (variant === 'primary') {
    return (
      <Magnetic
        href={href}
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </Magnetic>
    );
  }

  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      className={classes}
      href={href}
      type={href ? undefined : type}
      onClick={onClick}
      disabled={href ? undefined : disabled}
      aria-label={ariaLabel}
    >
      <span className="btn-inner">{children}</span>
    </Tag>
  );
}
