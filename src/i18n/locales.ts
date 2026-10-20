import type { Content, LocaleId } from './types';
import { ptPT } from './pt-PT';
import { ptBR } from './pt-BR';
import { enUS } from './en-US';

/**
 * The markets, in the order the switcher lists them. The first is the
 * x-default: the .pt root is the page a searcher outside all three lands on.
 *
 * Pure data — no React — so vite.config.ts can import it to build the heads,
 * the sitemap and the prerendered pages from the same source the UI reads.
 */
export const LOCALES: readonly Content[] = [ptPT, ptBR, enUS];

export const DEFAULT_LOCALE: LocaleId = 'pt-PT';

export function contentFor(locale: string | null | undefined): Content {
  return LOCALES.find((c) => c.locale === locale) ?? ptPT;
}

/** "199 €" in Portugal, "R$ 990" in Brazil, "$299" in the US — each market's own convention. */
export function formatPrice(content: Content, amount: number): string {
  return new Intl.NumberFormat(content.locale, {
    style: 'currency',
    currency: content.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
