import type { Content } from './types';
import type { Page, PostMeta } from '../blog/types';
import { blogPath, postPath } from '../blog/types';
import { LOCALES } from './locales';

/**
 * Everything that goes in a market page's <head>, plus robots.txt and the
 * sitemap. Built at build time by the Vite plugin, so every page ships its own
 * title, canonical, hreflang set and JSON-LD in the static HTML — none of it
 * waits for JavaScript.
 *
 * Pure string building with no DOM and no React: vite.config.ts imports it.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON inside <script> must not be able to close the tag. */
const jsonForScript = (value: unknown) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');

const pageUrl = (site: string, c: Content) => `${site}${c.seo.path}`;

/** Where a page lives, absolute. */
function urlOf(site: string, c: Content, page: Page): string {
  if (page.kind === 'blog') return `${site}${blogPath(c.seo.path)}`;
  if (page.kind === 'post') return `${site}${postPath(c.seo.path, page.post.slug)}`;
  return pageUrl(site, c);
}

const HOME: Page = { kind: 'home' };

/** A real address is required before contact details go into structured data. */
const isRealEmail = (email: string) => !/@example\.(com|org|net)$/i.test(email);

function baseGraph(c: Content, site: string) {
  const org = `${site}/#organization`;
  return [
      {
        '@type': 'Organization',
        '@id': org,
        name: 'RUPE',
        alternateName: 'RUPE Studio',
        url: `${site}/`,
        logo: { '@type': 'ImageObject', url: `${site}/rupe-logo.png`, width: 1024, height: 1024 },
        image: `${site}/og-rupe.jpg`,
        ...(isRealEmail(c.contactEmail) ? { email: c.contactEmail } : {}),
        ...(c.whatsapp ? { telephone: c.whatsapp.display } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        url: `${site}/`,
        name: 'RUPE',
        inLanguage: LOCALES.map((l) => l.locale),
        publisher: { '@id': org },
      },
  ];
}

function breadcrumbs(items: Array<[string, string]>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
  };
}

function structuredData(c: Content, site: string, page: Page) {
  const url = urlOf(site, c, page);
  const org = `${site}/#organization`;
  const home = pageUrl(site, c);

  if (page.kind === 'blog') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        ...baseGraph(c, site),
        {
          '@type': 'Blog',
          '@id': `${url}#blog`,
          url,
          name: c.blog.seoTitle,
          description: c.blog.seoDescription,
          inLanguage: c.locale,
          publisher: { '@id': org },
          blogPost: page.posts.map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `${site}${postPath(c.seo.path, p.slug)}`,
            datePublished: p.date,
          })),
        },
        breadcrumbs([['RUPE', home], [c.blog.eyebrow, url]]),
      ],
    };
  }

  if (page.kind === 'post') {
    const p = page.post;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        ...baseGraph(c, site),
        {
          '@type': 'BlogPosting',
          '@id': `${url}#post`,
          headline: p.title,
          description: p.description,
          url,
          mainEntityOfPage: url,
          datePublished: p.date,
          dateModified: p.updated ?? p.date,
          inLanguage: c.locale,
          keywords: p.tags.join(', '),
          image: `${site}/og-rupe.jpg`,
          author: { '@id': org },
          publisher: { '@id': org },
        },
        breadcrumbs([['RUPE', home], [c.blog.eyebrow, `${site}${blogPath(c.seo.path)}`], [p.title, url]]),
      ],
    };
  }

  const priced = c.pricing.plans.filter((p) => p.price !== null);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...baseGraph(c, site),
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: c.seo.title,
        description: c.seo.description,
        inLanguage: c.locale,
        isPartOf: { '@id': `${site}/#website` },
        about: { '@id': org },
      },
      {
        // `Service`, not `LocalBusiness`: there is no public street address to
        // give, and a LocalBusiness without one is an incomplete entity.
        '@type': 'Service',
        '@id': `${url}#service`,
        name: c.seo.ogTitle,
        description: c.seo.description,
        serviceType: c.pricing.plans.map((p) => p.kind),
        provider: { '@id': org },
        areaServed: c.seo.areaServed.map((a) => ({ '@type': a.type, name: a.name })),
        ...(priced.length
          ? {
              offers: [
                ...priced.map((p) => ({
                  '@type': 'Offer',
                  name: `${p.name} — ${p.kind}`,
                  description: p.summary,
                  price: p.price,
                  priceCurrency: c.currency,
                  url: `${url}#pricing`,
                })),
                ...(c.care.price !== null
                  ? [{
                      '@type': 'Offer',
                      name: c.form.typeCare,
                      price: c.care.price,
                      priceCurrency: c.currency,
                      priceSpecification: {
                        '@type': 'UnitPriceSpecification',
                        price: c.care.price,
                        priceCurrency: c.currency,
                        unitCode: 'MON',
                      },
                      url: `${url}#care`,
                    }]
                  : []),
              ],
            }
          : {}),
      },
    ],
  };
}

export function buildHead(c: Content, site: string, page: Page = HOME): string {
  const url = urlOf(site, c, page);
  const title =
    page.kind === 'blog' ? c.blog.seoTitle : page.kind === 'post' ? `${page.post.title} | RUPE` : c.seo.title;
  const description =
    page.kind === 'blog' ? c.blog.seoDescription : page.kind === 'post' ? page.post.description : c.seo.description;

  // Home and blog index exist in every market, so they carry the full hreflang
  // set. A post is written for one market and stands alone.
  const alternates =
    page.kind === 'post'
      ? []
      : [
          ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.seo.hreflang}" href="${urlOf(site, l, page)}" />`),
          `<link rel="alternate" hreflang="x-default" href="${urlOf(site, LOCALES[0], page)}" />`,
        ];
  const ogAlternates =
    page.kind === 'post'
      ? []
      : LOCALES.filter((l) => l !== c).map((l) => `<meta property="og:locale:alternate" content="${l.seo.ogLocale}" />`);
  const article =
    page.kind === 'post'
      ? [
          `<meta property="article:published_time" content="${page.post.date}" />`,
          ...(page.post.updated ? [`<meta property="article:modified_time" content="${page.post.updated}" />`] : []),
        ]
      : [];

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    ...alternates,
    '',
    `<meta property="og:type" content="${page.kind === 'post' ? 'article' : 'website'}" />`,
    ...article,
    `<meta property="og:site_name" content="RUPE" />`,
    `<meta property="og:locale" content="${c.seo.ogLocale}" />`,
    ...ogAlternates,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(page.kind === 'home' ? c.seo.ogTitle : title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${site}/og-rupe.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(c.seo.ogImageAlt)}" />`,
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.kind === 'home' ? c.seo.ogTitle : title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${site}/og-rupe.jpg" />`,
    '',
    `<script type="application/ld+json">\n${jsonForScript(structuredData(c, site, page))}\n</script>`,
  ].join('\n    ');
}

/** Shown when JavaScript is off; also hides the preloader the prerender leaves in the markup. */
export function buildNoscript(c: Content): string {
  return `<noscript><style>.preloader{display:none!important}[data-reveal],[data-reveal-mask]>span{opacity:1!important;transform:none!important}</style><p>${esc(c.seo.noscript)}</p></noscript>`;
}

/** Blog pages carry their own data, so the client bundle never ships every post. */
export function buildPageData(page: Page): string {
  if (page.kind === 'home') return '';
  return `<script type="application/json" id="rupe-page">${JSON.stringify(page).replace(/</g, '\\u003c')}</script>`;
}

export function buildRobots(site: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`;
}

/**
 * Home and blog index: one <url> per market, each listing every alternate —
 * the sitemap form of hreflang. Posts: one <url> each, with their date.
 */
export function buildSitemap(site: string, posts: Record<string, PostMeta[]> = {}): string {
  const group = (page: Page) => {
    const links = LOCALES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l.seo.hreflang}" href="${urlOf(site, l, page)}"/>`,
    ).concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf(site, LOCALES[0], page)}"/>`);
    return LOCALES.map((l) => `  <url>\n    <loc>${urlOf(site, l, page)}</loc>\n${links.join('\n')}\n  </url>`);
  };

  const articles = LOCALES.flatMap((l) =>
    (posts[l.locale] ?? []).map(
      (p) =>
        `  <url>\n    <loc>${site}${postPath(l.seo.path, p.slug)}</loc>\n    <lastmod>${p.updated ?? p.date}</lastmod>\n  </url>`,
    ),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...group(HOME), ...group({ kind: 'blog', posts: [] }), ...articles].join('\n')}
</urlset>
`;
}
