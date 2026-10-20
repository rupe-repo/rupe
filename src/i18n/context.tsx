import { createContext, useContext, type ReactNode } from 'react';
import type { Content } from './types';
import type { Page } from '../blog/types';
import { ptPT } from './pt-PT';

const ContentContext = createContext<Content>(ptPT);
const PageContext = createContext<Page>({ kind: 'home' });

export function ContentProvider({
  value,
  page = { kind: 'home' },
  children,
}: {
  value: Content;
  page?: Page;
  children: ReactNode;
}) {
  return (
    <ContentContext.Provider value={value}>
      <PageContext.Provider value={page}>{children}</PageContext.Provider>
    </ContentContext.Provider>
  );
}

/** The current market's copy. Every visible string on the page comes through here. */
export function useContent(): Content {
  return useContext(ContentContext);
}

/** Which page of the market this is: home, blog index or a post. */
export function usePage(): Page {
  return useContext(PageContext);
}

/** Anchors every page has: the top, and the brief form at the bottom. */
const EVERYWHERE = new Set(['#top', '#contact']);

/**
 * Section anchors ("#pricing") only exist on the market's home page. On a blog
 * page they are rewritten to point there ("/br/#pricing").
 */
export function useHref(): (href: string) => string {
  const content = useContent();
  const page = usePage();
  return (href) =>
    href.startsWith('#') && page.kind !== 'home' && !EVERYWHERE.has(href) ? `${content.seo.path}${href}` : href;
}
