import { build, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LOCALES, contentFor } from './src/i18n/locales';
import { buildHead, buildNoscript, buildPageData, buildRobots, buildSitemap } from './src/i18n/head';
import type { Content } from './src/i18n/types';
import type { Page, Post, PostMeta } from './src/blog/types';
import { blogPath, postPath } from './src/blog/types';
import { loadPosts } from './scripts/blog';

/**
 * Canonical origin for the site. This is the ONE place it is declared: it feeds
 * every market page's canonical, hreflang, og: and JSON-LD, plus robots.txt and
 * sitemap.xml. Override with SITE_URL in the deploy environment.
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://www.rupeai.pt').replace(/\/+$/, '');

const ROOT = import.meta.dirname;
const SSR_OUT = resolve(ROOT, 'node_modules/.rupe-prerender');

/** Fills the template's markers for one page. `app` is the prerendered body, or '' in dev. */
function fill(template: string, content: Content, app: string, page: Page): string {
  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${content.locale}">`)
    .replace('<!--rupe:head-->', buildHead(content, SITE_URL, page))
    .replace('<!--rupe:noscript-->', buildNoscript(content))
    .replace('<!--rupe:data-->', buildPageData(page))
    .replace('<!--rupe:app-->', app);
}

/** '/br/…' → pt-BR, '/us/…' → en-US, anything else → the Portugal root. */
function localeForUrl(url: string | undefined): Content {
  const path = (url ?? '/').split('?')[0];
  const match = LOCALES.find((l) => l.seo.path !== '/' && path.startsWith(l.seo.path.slice(0, -1)));
  return match ?? contentFor('pt-PT');
}

const summary = ({ html: _html, ...meta }: Post): PostMeta => meta;

/** Every page of one market: home, blog index, one per post. */
function pagesOf(content: Content): Array<{ path: string; page: Page }> {
  const posts = loadPosts(ROOT, content.locale);
  return [
    { path: content.seo.path, page: { kind: 'home' } },
    { path: blogPath(content.seo.path), page: { kind: 'blog', posts: posts.map(summary) } },
    ...posts.map((post) => ({ path: postPath(content.seo.path, post.slug), page: { kind: 'post', post } as Page })),
  ];
}

/** The page a dev-server URL asks for. Posts are re-read on every request. */
function pageForUrl(url: string | undefined): { content: Content; page: Page } {
  const content = localeForUrl(url);
  const path = (url ?? '/').split('?')[0].replace(/\/?$/, '/');
  const match = pagesOf(content).find((p) => p.path === path);
  return { content, page: match?.page ?? { kind: 'home' } };
}

function markets(): Plugin {
  const robots = buildRobots(SITE_URL);
  const sitemap = () =>
    buildSitemap(SITE_URL, Object.fromEntries(LOCALES.map((l) => [l.locale, loadPosts(ROOT, l.locale)])));
  let isBuild = false;
  let outDir = '';

  return {
    name: 'rupe-markets',
    configResolved(config) {
      isBuild = config.command === 'build' && !config.build.ssr;
      outDir = resolve(config.root, config.build.outDir);
    },

    // Dev: fill the head for whichever market the URL asks for. The SPA
    // fallback already serves index.html for /br/ and /us/.
    // Build: leave the markers — closeBundle fills one copy per market.
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => {
        if (isBuild) return html;
        const { content, page } = pageForUrl(ctx.originalUrl);
        return fill(html, content, '', page);
      },
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.end(robots);
        }
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          return res.end(sitemap());
        }
        next();
      });
    },

    generateBundle() {
      if (!isBuild) return;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
    },

    /**
     * Prerender. A second, server-side build of src/entry-server.tsx renders
     * every page of every market to HTML, each written into a copy of the
     * built template: dist/index.html, dist/blog/index.html,
     * dist/br/blog/<slug>/index.html and so on. The client bundle hydrates it.
     */
    async closeBundle() {
      if (!isBuild) return;

      await build({
        configFile: false,
        root: ROOT,
        logLevel: 'warn',
        plugins: [react()],
        ssr: { noExternal: true },
        build: {
          ssr: 'src/entry-server.tsx',
          outDir: SSR_OUT,
          emptyOutDir: true,
          rollupOptions: { output: { format: 'es', entryFileNames: 'entry-server.mjs' } },
        },
      });

      const { render } = (await import(pathToFileURL(resolve(SSR_OUT, 'entry-server.mjs')).href)) as {
        render: (locale: string, page: Page) => string;
      };
      const template = await readFile(resolve(outDir, 'index.html'), 'utf8');

      for (const content of LOCALES) {
        for (const { path, page } of pagesOf(content)) {
          const file = resolve(outDir, `.${path}index.html`);
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file, fill(template, content, render(content.locale, page), page));
        }
      }

      await rm(SSR_OUT, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), markets()],
  server: { host: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'], gsap: ['gsap'] },
      },
    },
  },
});
