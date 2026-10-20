/**
 * "This visitor clicked the Loja online card": a pricing or maintenance CTA
 * announces what it was, and the lead form preselects it. A window event, not
 * shared state, because the two live sections apart and neither owns the other.
 */
const EVENT = 'rupe:intent';

export function announceIntent(type: string): void {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: type }));
}

export function onIntent(fn: (type: string) => void): () => void {
  const handler = (event: Event) => fn((event as CustomEvent<string>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
