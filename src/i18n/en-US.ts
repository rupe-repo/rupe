import type { Content } from './types';

/** United States — served at /us/, in American English. */
export const enUS: Content = {
  locale: 'en-US',

  seo: {
    path: '/us/',
    hreflang: 'en-US',
    ogLocale: 'en_US',
    title: 'Web Design & Development Studio | RUPE',
    description:
      'Small business websites from $300, live in 2 days — and you only pay if you love it. Custom websites, landing pages and online stores built to rank on Google.',
    ogTitle: 'RUPE — Web Design & Development Studio',
    ogImageAlt: 'RUPE logo — Web design and development studio',
    areaServed: [{ type: 'Country', name: 'United States' }],
    noscript:
      'RUPE is a web design and development studio. Landing pages from $300, business websites from $525 and online stores from $750 — live in 2 days, and you only pay if you love it. Contact: rupe@rupeai.pt.',
  },

  currency: 'USD',
  marketName: 'United States',
  contactEmail: 'rupe@rupeai.pt',

  skipLink: 'Skip to content',
  homeLabel: 'RUPE — home',
  tagline: 'Digital experience studio',

  nav: {
    links: [
      { label: 'WORK', href: '#work' },
      { label: 'SERVICES', href: '#services' },
      { label: 'PRICING', href: '#pricing' },
      { label: 'BLOG', href: '/us/blog/' },
    ],
    cta: 'Get my website',
    open: 'Open menu',
    close: 'Close menu',
    primaryLabel: 'Main',
    menuLabel: 'Menu',
  },

  hero: {
    eyebrow: 'Web design & development',
    headline: [
      { text: 'WE CREATE' },
      { text: 'DIGITAL', accent: true },
      { text: 'EXPERIENCES THAT' },
      { text: 'MOVE BUSINESSES' },
      { text: 'FORWARD.', accent: true },
    ],
    lead: 'Websites, online stores and digital experiences designed to elevate brands, simplify the journey and drive results.',
    cta: 'Get my website',
    offer: 'Live in 2 days · Pay only if you love it',
    badge: 'FORWARD · FORWARD ·',
    scroll: 'Explore',
  },

  portfolio: {
    capabilities: ['WEB DESIGN', 'E-COMMERCE', 'DEVELOPMENT', '3D & MOTION', 'BRAND SYSTEMS', 'AI EXPERIENCES'],
    eyebrow: 'Selected work',
    title: 'WORK THAT MOVES',
    titleAccent: 'BRANDS FORWARD.',
    note: 'Every project starts with one simple question: what needs to happen after someone lands here?',
    caseAlt: 'Doce & Arte project shown on desktop and mobile',
    prev: 'Previous project',
    next: 'Next project',
    slideOf: 'of',
    cases: [
      {
        title: ['DOCE & ARTE', 'BAKERY'],
        category: 'E-COMMERCE / WEB DESIGN / DEVELOPMENT',
        description:
          'We turned a buying process that ran on text messages into a digital experience that is simpler, more refined and ready to grow.',
        cta: 'View project',
      },
    ],
    placeholder: {
      title: ['NEXT PROJECT', 'COMING SOON'],
      category: 'IN PROGRESS',
      description: 'A new project is underway. It will be published here as soon as it goes live.',
      cta: 'Coming soon',
      slot: 'Project in progress',
    },
  },

  services: {
    eyebrow: 'What we do',
    title: 'DIGITAL SOLUTIONS',
    titleLead: 'BUILT TO',
    titleAccent: 'MOVE FORWARD.',
    note: 'We combine strategy, design and technology to build websites and online stores that strengthen brands and help businesses grow.',
    items: [
      {
        title: 'WEBSITES',
        copy: 'Fast, responsive, custom-built websites that communicate value, strengthen the brand and turn attention into opportunity.',
      },
      {
        title: 'E-COMMERCE',
        copy: 'Online stores designed to simplify the buying decision, elevate how the brand is perceived and make selling easier.',
      },
      {
        title: '3D & AI',
        copy: 'Interactive experiences that combine 3D, motion and artificial intelligence to create memorable digital interactions.',
      },
    ],
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'CLEAR PRICING.',
    titleAccent: 'NO SURPRISES.',
    note: 'Three ways to get your business online in 2 days. You only pay if you love the result.',
    featuredLabel: 'Most popular',
    cta: 'Get a quote',
    onRequest: 'On request',
    footnote: 'One-time payment per project, only after you approve the site. Maintenance is optional.',
    plans: [
      {
        name: 'Essential',
        kind: 'Landing page',
        price: 300,
        summary: 'One page to introduce your business and capture leads.',
        features: ['Single responsive page', 'Contact form and WhatsApp button', 'Basic SEO setup'],
      },
      {
        name: 'Professional',
        kind: 'Business website',
        price: 525,
        summary: 'Your full company website, with multiple pages.',
        features: ['Up to 5 pages', 'Custom design for your brand', 'SEO on every page', 'Google Maps and social links'],
        featured: true,
      },
      {
        name: 'Store',
        kind: 'Online store',
        price: 750,
        summary: 'Sell online with a product catalog and payments.',
        features: [
          'Product catalog',
          'Online payments and order management',
          'Dashboard to run the store yourself',
          'SEO for products and categories',
        ],
      },
    ],
  },

  care: {
    eyebrow: 'Maintenance',
    title: 'YOUR SITE WORKING',
    titleAccent: 'ON GOOGLE.',
    note: 'Going live is just the start. With maintenance we look after your site every month so it presents well and gets found — on Google and in AI answers. These are the strategies we use.',
    price: null,
    per: '/mo',
    onRequest: 'On request',
    cta: 'I want maintenance',
    items: [
      {
        tag: 'SEO',
        title: 'Search engine optimization',
        copy: 'We work on titles, copy, structure and internal links so Google understands what you offer and shows you to people searching for exactly that.',
      },
      {
        tag: 'Local SEO',
        title: 'Google Business Profile',
        copy: 'We set up and maintain your business profile on Google, so you show up on the map and in local searches.',
      },
      {
        tag: 'GEO',
        title: 'Generative engine optimization',
        copy: 'We shape your content to be cited by ChatGPT, Gemini, Perplexity and Google’s AI answers: clear, factual, well-organized information.',
      },
      {
        tag: 'Schema',
        title: 'Structured data',
        copy: 'We describe your services, prices and FAQs in schema.org, the language search engines read, for richer results.',
      },
      {
        tag: 'Performance',
        title: 'Speed and Core Web Vitals',
        copy: 'We keep your site fast on mobile. Speed counts for ranking and for visitors deciding whether to stay.',
      },
      {
        tag: 'Content',
        title: 'Blog and content',
        copy: 'We publish articles that answer your customers’ questions and bring in new visitors every month.',
      },
    ],
  },

  process: {
    eyebrow: 'How it works',
    title: 'SIMPLE. FAST.',
    titleAccent: 'NO RISK.',
    steps: [
      { title: 'REQUEST', copy: 'Fill in the form: what you sell, your colors, your logo and what you have in mind.' },
      { title: 'BUILD', copy: 'We design and build the site around your brand.' },
      { title: 'APPROVAL', copy: 'You see the finished site. Love it, pay. Don’t, and you don’t pay.' },
      { title: 'LAUNCH', copy: 'In 2 days your site is live — with maintenance if you want it.' },
    ],
  },

  about: {
    eyebrow: 'RUPE',
    title: ['WE DON’T JUST', 'BUILD WEBSITES.'],
    lead: 'We create experiences people remember.',
    body: 'RUPE works where design, engineering and technology meet. We treat interface, code, 3D and artificial intelligence as parts of the same experience — because a good idea only works when every detail pulls in the same direction.',
    pillars: ['Design', 'Development', 'Technology', '3D', 'Artificial intelligence'],
  },

  story: {
    eyebrow: 'Our story',
    marker: '2026 — FORWARD',
    title: 'IT STARTED',
    titleLead: 'WITH A',
    titleAccent: 'DECISION.',
    narrative: [
      'RUPE was founded by two brothers and one shared decision: stop following paths drawn by others and start building our own.',
      'We left the predictable behind to create a studio where design, technology and ambition could live in the same place.',
      'We never wanted to be just another agency. We wanted to make work we could be proud of, build lasting relationships and prove that where you start doesn’t decide how far you can go.',
    ],
    turn: 'That decision became RUPE.',
    signature: ['Two brothers.', 'One studio.', 'A story we keep building.'],
    go: 'Forward',
    mission: {
      eyebrow: 'Mission',
      title: 'Create digital experiences that move businesses forward.',
      copy: 'We combine design, engineering and technology to turn ideas into digital experiences that create real value.',
    },
    vision: {
      eyebrow: 'Vision',
      title: 'Go beyond what’s expected.',
      copy: 'We want to build a digital studio known for the quality, thinking and impact behind every project — wherever the next challenge takes us.',
    },
  },

  values: {
    eyebrow: 'Principles',
    title: 'WHAT WE',
    titleAccent: 'BELIEVE IN.',
    items: [
      { title: 'OWN THE WORK.', copy: 'We take responsibility for what we make. We don’t ship anything we don’t believe in.' },
      { title: 'DETAIL MATTERS.', copy: 'Great experiences are built from small decisions made well.' },
      { title: 'KEEP MOVING FORWARD.', copy: 'Technology changes. Businesses change. So do we.' },
      { title: 'BUILD WITH PURPOSE.', copy: 'We don’t add technology just because we can. Every decision needs a reason.' },
      { title: 'STAY HUMAN.', copy: 'Behind every interface there are people. They are who we build for.' },
    ],
  },

  finalCta: {
    eyebrow: 'Get your website',
    title: 'LOVE IT?',
    titleAccent: 'THEN PAY.',
    copy: 'Tell us what you want — colors, logo, what you sell. We build your site and publish it in 2 days. You only pay if you love it.',
    promise: ['Live in 2 days', 'Pay only if you love it', 'Optional maintenance'],
    orWrite: 'Rather email us?',
  },

  form: {
    title: 'Tell us what you want',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    business: 'Business name',
    type: 'What you need',
    typeCare: 'Maintenance and SEO',
    typeUnsure: 'Not sure yet',
    brief: 'Your project',
    briefPlaceholder: 'What you sell, who to, which pages you picture, sites you like…',
    colors: 'Brand colors',
    addColor: 'Add color',
    removeColor: 'Remove color',
    colorsPlaceholder: 'Or describe them: navy, gold…',
    logo: 'Logo (optional)',
    logoHint: 'PNG, JPG, SVG or PDF, up to 5 MB.',
    logoTooBig: 'The file is larger than 5 MB.',
    reference: 'Current site or reference (optional)',
    referencePlaceholder: 'https://',
    consent: 'I agree that RUPE may use this data to reply to my request.',
    submit: 'Send request',
    sending: 'Sending…',
    successTitle: 'Request received.',
    successBody: 'We’ll reply to {email}. If you love the result, you pay — and your site goes live in 2 days.',
    errorTitle: 'Couldn’t send.',
    errorBody: 'Please try again or email us at',
  },

  blog: {
    navLabel: 'BLOG',
    eyebrow: 'Blog',
    title: 'IDEAS TO',
    titleAccent: 'SELL ONLINE.',
    note: 'Practical guides on websites, online stores and getting found on Google — for small businesses.',
    seoTitle: 'Blog — Small Business Websites, E-commerce & SEO | RUPE',
    seoDescription: 'Practical guides on small business websites, online stores, SEO and getting found on Google.',
    readMore: 'Read article',
    back: 'All articles',
    minutes: 'min read',
    empty: 'First articles coming soon.',
    ctaTitle: 'Want a site like this?',
    ctaCopy: 'Live in 2 days. Pay only if you love it.',
    ctaButton: 'Get my website',
  },

  footer: {
    menuLabel: 'Menu',
    menu: [
      { label: 'WORK', href: '#work' },
      { label: 'SERVICES', href: '#services' },
      { label: 'PRICING', href: '#pricing' },
      { label: 'MAINTENANCE', href: '#care' },
      { label: 'ABOUT', href: '#about' },
      { label: 'BLOG', href: '/us/blog/' },
      { label: 'CONTACT', href: '#contact' },
    ],
    socialLabel: 'Social',
    contactLabel: 'Contact',
    schedule: 'Book a call',
    legalLabel: 'Legal',
    legal: [
      { label: 'PRIVACY', href: '/us/privacy' },
      { label: 'COOKIES', href: '/us/cookies' },
    ],
    marketsLabel: 'Country',
    entityLabel: 'Legal entity',
    entity: 'RUPE is a brand operated by E&F Barons LLC, a company incorporated in the United States.',
    signature: ['Thought through.', 'Crafted.', 'Built to move forward.'],
    signatureBy: 'By RUPE.',
    rights: 'All rights reserved.',
    top: 'Back to top',
  },
};
