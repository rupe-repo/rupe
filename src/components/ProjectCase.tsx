import { useRef, type ReactNode } from 'react';
import { ArrowButton } from './ArrowButton';
import { useCaseScrollMotion } from '../hooks/useCaseScrollMotion';

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
  /**
   * 'reveal' — the shared IntersectionObserver fade used across the site.
   * 'scrub'  — this case's copy and mockup are driven by scroll position
   *            instead, so the two must not both own opacity/transform.
   */
  motion?: 'reveal' | 'scrub';
}

export function ProjectCase({
  index,
  title,
  category,
  description,
  href = '#contact',
  cta = 'View project',
  status = 'live',
  visual,
  motion = 'reveal',
}: ProjectCaseProps) {
  const articleRef = useRef<HTMLElement>(null);
  const scrub = motion === 'scrub';
  useCaseScrollMotion(articleRef, scrub);

  // With 'scrub' the scroll timeline owns these elements; handing them
  // `data-reveal` too would put two systems on the same opacity.
  return (
    <article className={`case case--${status}`} id={`case-${index}`} ref={articleRef}>
      <div className="case__inner shell">
        <div className="case__copy">
          <span className={`case__index ${scrub ? 'case__scrub' : ''}`} {...(scrub ? {} : { 'data-reveal': true })}>
            {index}
          </span>

          <h3 className="case__title">
            {title.map((line, i) =>
              scrub ? (
                <span key={line} className="case__scrub">
                  {line}{' '}
                </span>
              ) : (
                <span
                  key={line}
                  data-reveal-mask
                  style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
                >
                  <span>{line}</span>{' '}
                </span>
              ),
            )}
          </h3>

          <p className={`case__category ${scrub ? 'case__scrub' : ''}`} {...(scrub ? {} : { 'data-reveal': true, style: { ['--reveal-delay' as string]: '200ms' } })}>
            {category}
          </p>

          <p className={`case__desc ${scrub ? 'case__scrub' : ''}`} {...(scrub ? {} : { 'data-reveal': true, style: { ['--reveal-delay' as string]: '280ms' } })}>
            {description}
          </p>


          {/* Stays in the copy column on desktop. On mobile `.case__copy` turns
              into `display: contents`, which promotes this to a grid item so it
              can be ordered after the mockup. */}
          <div className={`case__cta ${scrub ? 'case__scrub' : ''}`} {...(scrub ? {} : { 'data-reveal': true, style: { ['--reveal-delay' as string]: '360ms' } })}>
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

        <div
          className="case__visual"
          {...(scrub
            ? {}
            : {
                'data-reveal': true,
                style: {
                  ['--reveal-y' as string]: '32px',
                  ['--reveal-delay' as string]: '420ms',
                },
              })}
        >
          {visual}
        </div>
      </div>
    </article>
  );
}
