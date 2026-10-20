/**
 * Everything a market page says, in one shape.
 *
 * Each market (Portugal, Brasil, United States) is one object of this type, so
 * a string that exists in one language and is forgotten in another is a type
 * error, not a page that quietly mixes languages.
 */

export type LocaleId = 'pt-PT' | 'pt-BR' | 'en-US';

export interface Line {
  text: string;
  accent?: boolean;
}

export interface PricingPlan {
  name: string;
  /** What it is, in the words people search with — "Landing page", "Loja online". */
  kind: string;
  /** `null` = no public price yet: the card shows `pricing.onRequest` and no Offer is emitted. */
  price: number | null;
  summary: string;
  features: string[];
  featured?: boolean;
}

export interface Content {
  locale: LocaleId;

  /** Head, schema and sitemap. Not rendered in the body. */
  seo: {
    /** Path under the origin, with trailing slash: '/', '/br/', '/us/'. */
    path: string;
    hreflang: string;
    ogLocale: string;
    title: string;
    description: string;
    ogTitle: string;
    ogImageAlt: string;
    /** schema.org `areaServed` for this market. */
    areaServed: Array<{ type: 'Country' | 'City'; name: string }>;
    noscript: string;
  };

  currency: 'EUR' | 'BRL' | 'USD';
  /** Shown in the footer market switcher, in that market's own language. */
  marketName: string;
  contactEmail: string;
  /** Brazil only — WhatsApp is the channel that converts there. */
  whatsapp?: { number: string; display: string; message: string; label: string };

  skipLink: string;
  homeLabel: string;
  tagline: string;

  nav: {
    links: Array<{ label: string; href: string }>;
    cta: string;
    open: string;
    close: string;
    primaryLabel: string;
    menuLabel: string;
  };

  hero: {
    eyebrow: string;
    headline: Line[];
    lead: string;
    cta: string;
    /** The offer, under the CTA: "Publicado em 2 dias · Só paga se gostar". */
    offer: string;
    badge: string;
    scroll: string;
  };

  portfolio: {
    capabilities: string[];
    eyebrow: string;
    title: string;
    titleAccent: string;
    note: string;
    caseAlt: string;
    /** Carousel controls: previous / next project, and the slide label ("1 de 3"). */
    prev: string;
    next: string;
    slideOf: string;
    cases: Array<{
      title: string[];
      category: string;
      description: string;
      cta: string;
    }>;
    placeholder: { title: string[]; category: string; description: string; cta: string; slot: string };
  };

  services: {
    eyebrow: string;
    title: string;
    titleLead: string;
    titleAccent: string;
    note: string;
    items: Array<{ title: string; copy: string }>;
  };

  pricing: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    note: string;
    plans: PricingPlan[];
    featuredLabel: string;
    cta: string;
    onRequest: string;
    footnote: string;
  };

  /** The maintenance plan: what keeps the site found, explained one strategy at a time. */
  care: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    note: string;
    /** Monthly, in the market's currency. `null` = not public yet. */
    price: number | null;
    per: string;
    onRequest: string;
    cta: string;
    items: Array<{ tag: string; title: string; copy: string }>;
  };

  process: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    steps: Array<{ title: string; copy: string }>;
  };

  about: {
    eyebrow: string;
    title: [string, string];
    lead: string;
    body: string;
    pillars: string[];
  };

  story: {
    eyebrow: string;
    marker: string;
    title: string;
    titleLead: string;
    titleAccent: string;
    narrative: string[];
    turn: string;
    signature: [string, string, string];
    go: string;
    mission: { eyebrow: string; title: string; copy: string };
    vision: { eyebrow: string; title: string; copy: string };
  };

  values: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    items: Array<{ title: string; copy: string }>;
  };

  finalCta: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    copy: string;
    promise: string[];
    orWrite: string;
  };

  form: {
    title: string;
    name: string;
    email: string;
    phone: string;
    business: string;
    type: string;
    typeCare: string;
    typeUnsure: string;
    brief: string;
    briefPlaceholder: string;
    colors: string;
    addColor: string;
    removeColor: string;
    colorsPlaceholder: string;
    logo: string;
    logoHint: string;
    logoTooBig: string;
    reference: string;
    referencePlaceholder: string;
    consent: string;
    submit: string;
    sending: string;
    successTitle: string;
    /** `{email}` is replaced with the address the visitor typed. */
    successBody: string;
    errorTitle: string;
    errorBody: string;
  };

  blog: {
    navLabel: string;
    eyebrow: string;
    title: string;
    titleAccent: string;
    note: string;
    seoTitle: string;
    seoDescription: string;
    readMore: string;
    back: string;
    minutes: string;
    empty: string;
    ctaTitle: string;
    ctaCopy: string;
    ctaButton: string;
  };

  footer: {
    menuLabel: string;
    menu: Array<{ label: string; href: string }>;
    socialLabel: string;
    contactLabel: string;
    schedule: string;
    legalLabel: string;
    legal: Array<{ label: string; href: string }>;
    marketsLabel: string;
    entityLabel: string;
    entity: string;
    signature: [string, string, string];
    signatureBy: string;
    rights: string;
    top: string;
  };
}
