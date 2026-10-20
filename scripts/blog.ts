import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';
import type { LocaleId } from '../src/i18n/types';
import type { Post } from '../src/blog/types';

/**
 * Node only — read by vite.config.ts at build time and by the dev server.
 *
 * Posts are Markdown files under content/blog/<locale>/<slug>.md with a small
 * front matter block:
 *
 *   ---
 *   title: Quanto custa um site em Portugal em 2026?
 *   description: One sentence for Google, 140–160 characters.
 *   date: 2026-10-20
 *   tags: [preços, websites]
 *   ---
 *
 * A file whose name starts with `_` is a draft and is skipped.
 */

const WORDS_PER_MINUTE = 220;

function parseFrontMatter(source: string, file: string) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source.replace(/\r\n/g, '\n'));
  if (!match) throw new Error(`[blog] ${file}: missing front matter`);

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const kv = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key, raw] = kv;
    const value = raw.trim();
    data[key] = value.startsWith('[')
      ? value.slice(1, -1).split(',').map((v) => v.trim()).filter(Boolean)
      : value.replace(/^["']|["']$/g, '');
  }
  return { data, body: match[2] };
}

export function loadPosts(root: string, locale: LocaleId): Post[] {
  const dir = resolve(root, 'content/blog', locale);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((file) => {
      const { data, body } = parseFrontMatter(readFileSync(resolve(dir, file), 'utf8'), file);
      for (const key of ['title', 'description', 'date'] as const) {
        if (!data[key]) throw new Error(`[blog] ${locale}/${file}: missing "${key}"`);
      }
      const words = body.split(/\s+/).filter(Boolean).length;
      return {
        slug: file.replace(/\.md$/, ''),
        locale,
        title: String(data.title),
        description: String(data.description),
        date: String(data.date),
        updated: data.updated ? String(data.updated) : undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        html: marked.parse(body, { async: false }),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
