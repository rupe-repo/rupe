import type { ReactNode } from 'react';
import { ArrowButton } from './ArrowButton';

export interface ProjectCaseData {
  index: string;
  title: string[];
  category: string;
  description: string;
  href?: string;
  cta?: string;
  status?: 'live' | 'placeholder';
}

interface ProjectCaseProps extends ProjectCaseData {
  visual: ReactNode;
}

/**
 * One slide of the portfolio carousel. Everything arrives through the shared
 * `[data-reveal]` observer, which also fires for a slide scrolled in sideways —
 * the track clips it, so it only intersects once it is actually showing.
 */
export function ProjectCase({
  index,
  title,
  category,
  description,
  href = '#contact',
  cta,
  status = 'live',
  visual,
}: ProjectCaseProps) {
  const delay = (ms: number) => ({ ['--reveal-delay' as string]: `${ms}ms` });

  return (
    <article className={`case case--${status}`} id={`case-${index}`}>
      <div className="case__inner shell">
        <div className="case__copy">
          <span className="case__index" data-reveal>
            {index}
          </span>

          <h3 className="case__title">
            {title.map((line, i) => (
              <span key={line} data-reveal-mask style={delay(i * 90)}>
                <span>{line}</span>{' '}
              </span>
            ))}
          </h3>

          <p className="case__category" data-reveal style={delay(200)}>
            {category}
          </p>

          <p className="case__desc" data-reveal style={delay(280)}>
            {description}
          </p>

          {/* Stays in the copy column on desktop. On mobile `.case__copy` turns
              into `display: contents`, which promotes this to a grid item so it
              can be ordered after the mockup. */}
          <div className="case__cta" data-reveal style={delay(360)}>
            <ArrowButton
              href={href}
              variant="outline"
              tone="dark"
              aria-disabled={status === 'placeholder' ? true : undefined}
            >
              {cta}
            </ArrowButton>
          </div>
        </div>

        <div className="case__visual" data-reveal style={{ ['--reveal-y' as string]: '32px', ...delay(420) }}>
          {visual}
        </div>
      </div>
    </article>
  );
}
