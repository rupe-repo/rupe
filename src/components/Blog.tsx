import type { Post, PostMeta } from '../blog/types';
import { postPath, blogPath } from '../blog/types';
import { useContent } from '../i18n/context';
import { Arrow } from './ArrowButton';
import './Blog.css';

function useDate() {
  const t = useContent();
  // Noon, so no time zone can move the day.
  return (iso: string) =>
    new Intl.DateTimeFormat(t.locale, { dateStyle: 'long' }).format(new Date(`${iso}T12:00:00Z`));
}

/** The market's blog: every post, newest first. */
export function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const t = useContent();
  const b = t.blog;
  const date = useDate();

  return (
    <section className="blog" id="top" data-nav-theme="light">
      <div className="shell">
        <header className="blog__head">
          <p className="eyebrow" data-reveal>
            {b.eyebrow}
          </p>
          <h1 className="blog__title">
            <span data-reveal-mask>
              <span>{b.title}</span>
            </span>{' '}
            <span data-reveal-mask style={{ ['--reveal-delay' as string]: '90ms' }}>
              <span className="accent">{b.titleAccent}</span>
            </span>
          </h1>
          <p className="blog__note" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            {b.note}
          </p>
        </header>

        {posts.length ? (
          <ul className="blog__list">
            {posts.map((post, i) => (
              <li key={post.slug} data-reveal style={{ ['--reveal-delay' as string]: `${(i % 3) * 90}ms` }}>
                <a className="blog__card" href={postPath(t.seo.path, post.slug)}>
                  <p className="blog__meta">
                    <time dateTime={post.date}>{date(post.date)}</time> · {post.minutes} {b.minutes}
                  </p>
                  <h2 className="blog__card-title">{post.title}</h2>
                  <p className="blog__card-desc">{post.description}</p>
                  <span className="blog__more">
                    {b.readMore} <Arrow />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="blog__empty">{b.empty}</p>
        )}
      </div>
    </section>
  );
}

/** One post. The HTML comes from the Markdown file, rendered at build time. */
export function BlogPost({ post }: { post: Post }) {
  const t = useContent();
  const b = t.blog;
  const date = useDate();

  return (
    <article className="blog blog--post" id="top" data-nav-theme="light">
      <div className="shell post">
        <nav className="post__crumbs" aria-label="Breadcrumb">
          <a href={t.seo.path}>RUPE</a>
          <span aria-hidden="true">/</span>
          <a href={blogPath(t.seo.path)}>{b.eyebrow}</a>
        </nav>

        <header className="post__head">
          <h1 className="post__title">{post.title}</h1>
          <p className="blog__meta">
            <time dateTime={post.date}>{date(post.date)}</time> · {post.minutes} {b.minutes}
          </p>
        </header>

        <div className="post__body" dangerouslySetInnerHTML={{ __html: post.html }} />

        <aside className="post__cta">
          <p className="post__cta-title">{b.ctaTitle}</p>
          <p>{b.ctaCopy}</p>
          <a className="post__cta-link" href="#contact">
            {b.ctaButton} <Arrow />
          </a>
        </aside>

        <a className="post__back" href={blogPath(t.seo.path)}>
          <Arrow /> {b.back}
        </a>
      </div>
    </article>
  );
}
