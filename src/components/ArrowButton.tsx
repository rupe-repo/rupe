import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';

type Variant = 'solid' | 'outline' | 'ghost' | 'circle';

interface ArrowButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  variant?: Variant;
  tone?: 'light' | 'dark';
  magnetic?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Arrow glyph shared by every CTA — drawn, not a font character. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 12h15M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowButton({
  children,
  variant = 'solid',
  tone = 'light',
  magnetic = true,
  size = 'md',
  className,
  ...rest
}: ArrowButtonProps) {
  const ref = useMagnetic<HTMLAnchorElement>(magnetic ? 12 : 0);

  return (
    <a
      ref={magnetic ? ref : undefined}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${tone}`,
        `btn--${size}`,
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {children ? <span className="btn__label">{children}</span> : null}
      <span className="btn__icon" aria-hidden="true">
        <Arrow />
        <Arrow />
      </span>
    </a>
  );
}
