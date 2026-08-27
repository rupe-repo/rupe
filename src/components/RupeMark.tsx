import { RUPE_MARK_ASPECT, RUPE_MARK_RINGS } from '../three/rupeMarkPath';

/**
 * The RUPE symbol drawn from the same contour data the 3D model extrudes,
 * so the 2D and 3D marks can never drift apart.
 * Model space is Y-up and centred; SVG space is Y-down from the top-left.
 */
const VIEW_H = 100;
const VIEW_W = RUPE_MARK_ASPECT * VIEW_H;

const PATHS = RUPE_MARK_RINGS.map((ring) => {
  let d = '';
  for (let i = 0; i < ring.length; i += 2) {
    const x = (ring[i] * VIEW_H + VIEW_W / 2).toFixed(2);
    const y = (-ring[i + 1] * VIEW_H + VIEW_H / 2).toFixed(2);
    d += `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }
  return `${d}Z`;
});

interface RupeMarkProps {
  className?: string;
  /** Draws the outline only — used as the oversized watermark in the final CTA. */
  outline?: boolean;
  strokeWidth?: number;
  title?: string;
}

export function RupeMark({ className, outline = false, strokeWidth = 1.1, title }: RupeMarkProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW_W.toFixed(2)} ${VIEW_H}`}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill={outline ? 'none' : 'currentColor'}
      stroke={outline ? 'currentColor' : 'none'}
      strokeWidth={outline ? strokeWidth : undefined}
      strokeLinejoin="round"
      fillRule="evenodd"
      focusable="false"
    >
      {PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  href?: string;
  label?: string;
}

export function Wordmark({ className, href = '#top', label = 'RUPE — home' }: WordmarkProps) {
  return (
    <a className={`wordmark ${className ?? ''}`} href={href} aria-label={label}>
      <RupeMark className="wordmark__mark" />
      <span className="wordmark__type">RUPE</span>
    </a>
  );
}
