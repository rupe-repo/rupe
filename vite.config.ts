import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Canonical origin for the site. This is the ONE place it is declared: the value
 * is substituted into `__SITE_URL__` in index.html (canonical, og:, twitter:,
 * JSON-LD) and used to generate robots.txt and sitemap.xml.
 *
 * `rupe.example.com` is a placeholder — replace it with the real domain (or set
 * SITE_URL in the deploy environment) before going live. Shipping the wrong
 * canonical is worse than shipping none.
 */
// Read through globalThis so this stays free of @types/node.
const envSiteUrl = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.SITE_URL;

const SITE_URL = (envSiteUrl ?? 'https://rupe.example.com').replace(/\/+$/, '');

function seoAssets(): Plugin {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  return {
    name: 'rupe-seo-assets',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
    },
    // Serve them in dev so they can be verified without a build.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req as { url?: string }).url;
        if (url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.end(robots);
        }
        if (url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          return res.end(sitemap);
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

export default defineConfig({
  plugins: [react(), seoAssets()],
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
