import type { LocaleId } from '../i18n/types';

/** Front matter of a post, plus what the loader derives (slug, reading time). */
export interface PostMeta {
  slug: string;
  locale: LocaleId;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  updated?: string;
  tags: string[];
  minutes: number;
}

export interface Post extends PostMeta {
  /** Rendered from Markdown at build time. */
  html: string;
}

/**
 * Which page of a market is being rendered. The home page needs nothing
 * extra; blog pages carry their data, embedded in the HTML as JSON so the
 * client bundle never has to ship every post.
 */
export type Page =
  | { kind: 'home' }
  | { kind: 'blog'; posts: PostMeta[] }
  | { kind: 'post'; post: Post };

export const blogPath = (marketPath: string) => `${marketPath}blog/`;
export const postPath = (marketPath: string, slug: string) => `${marketPath}blog/${slug}/`;
