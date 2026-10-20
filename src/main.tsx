import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

// Global layers first, component styles after, so component rules win.
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';

import App from './App';
import { ContentProvider } from './i18n/context';
import { contentFor } from './i18n/locales';
import type { Page } from './blog/types';

// Each market page is the same app; <html lang> says which copy it carries,
// and a blog page brings its posts along as embedded JSON.
const content = contentFor(document.documentElement.lang);
const pageData = document.getElementById('rupe-page')?.textContent;
const page: Page = pageData ? JSON.parse(pageData) : { kind: 'home' };
const container = document.getElementById('root')!;

const app = (
  <StrictMode>
    <ContentProvider value={content} page={page}>
      <App />
    </ContentProvider>
  </StrictMode>
);

// Built pages arrive prerendered and are hydrated; the dev server sends an
// empty root and is rendered from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
