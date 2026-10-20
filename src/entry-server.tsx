import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { ContentProvider } from './i18n/context';
import { contentFor } from './i18n/locales';
import type { Page } from './blog/types';

/**
 * Build-time only: the page as HTML, so crawlers that do not run JavaScript
 * (and every crawler, before it gets round to running it) read the full copy.
 * Called once per market by the prerender step in vite.config.ts.
 */
export function render(locale: string, page: Page = { kind: 'home' }): string {
  return renderToString(
    <StrictMode>
      <ContentProvider value={contentFor(locale)} page={page}>
        <App />
      </ContentProvider>
    </StrictMode>,
  );
}
