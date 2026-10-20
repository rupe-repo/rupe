import type { Content } from './types';

/**
 * Portugal — the primary market, served at the root of the .pt domain.
 *
 * Written to the 1990 Orthographic Agreement (projeto, objetivos, direção),
 * which is what Portugal searches with. "Contacto" stays: the c is spoken.
 */
export const ptPT: Content = {
  locale: 'pt-PT',

  seo: {
    path: '/',
    hreflang: 'pt-PT',
    ogLocale: 'pt_PT',
    title: 'Criação de Websites e Lojas Online em Portugal | RUPE',
    description:
      'Websites a partir de 199 €, publicados em 2 dias — só paga se gostar. Criamos sites, landing pages e lojas online para negócios em Portugal.',
    ogTitle: 'RUPE — Criação de Websites e Lojas Online em Portugal',
    ogImageAlt: 'Marca RUPE — Estúdio de criação de websites',
    areaServed: [{ type: 'Country', name: 'Portugal' }],
    noscript:
      'A RUPE é um estúdio de criação de websites e lojas online para negócios em Portugal. Landing pages a partir de 199 €, websites institucionais a partir de 349 € e lojas online a partir de 499 €. Publicado em 2 dias, só paga se gostar. Contacto: rupe@rupeai.pt.',
  },

  currency: 'EUR',
  marketName: 'Portugal',
  contactEmail: 'rupe@rupeai.pt',

  skipLink: 'Saltar para o conteúdo',
  homeLabel: 'RUPE — início',
  tagline: 'Estúdio de experiências digitais',

  nav: {
    links: [
      { label: 'PROJETOS', href: '#work' },
      { label: 'SERVIÇOS', href: '#services' },
      { label: 'PREÇOS', href: '#pricing' },
      { label: 'BLOG', href: '/blog/' },
    ],
    cta: 'Pedir o meu site',
    open: 'Abrir menu',
    close: 'Fechar menu',
    primaryLabel: 'Principal',
    menuLabel: 'Menu',
  },

  hero: {
    eyebrow: 'Criação de websites e lojas online',
    headline: [
      { text: 'CRIAMOS' },
      { text: 'EXPERIÊNCIAS', accent: true },
      { text: 'DIGITAIS QUE' },
      { text: 'FAZEM NEGÓCIOS' },
      { text: 'AVANÇAR.', accent: true },
    ],
    lead: 'Websites, lojas online e experiências digitais concebidas para elevar marcas, simplificar experiências e gerar resultados.',
    cta: 'Pedir o meu site',
    offer: 'Publicado em 2 dias · Só paga se gostar',
    badge: 'AVANÇAR · AVANÇAR ·',
    scroll: 'Descobrir',
  },

  portfolio: {
    capabilities: ['WEB DESIGN', 'LOJAS ONLINE', 'DESENVOLVIMENTO', '3D & MOTION', 'SISTEMAS DE MARCA', 'EXPERIÊNCIAS COM IA'],
    eyebrow: 'Projetos selecionados',
    title: 'TRABALHO QUE FAZ',
    titleAccent: 'MARCAS AVANÇAR.',
    note: 'Cada projeto começa com uma pergunta simples: o que precisa de acontecer depois de alguém chegar até aqui?',
    caseAlt: 'Projeto Doce & Arte apresentado em desktop e mobile',
    prev: 'Projeto anterior',
    next: 'Projeto seguinte',
    slideOf: 'de',
    cases: [
      {
        title: ['DOCE & ARTE', 'CONFEITARIA'],
        category: 'LOJA ONLINE / WEB DESIGN / DESENVOLVIMENTO',
        description:
          'Transformámos uma experiência de compra dependente de mensagens numa experiência digital mais simples, sofisticada e preparada para crescer.',
        cta: 'Ver projeto',
      },
    ],
    placeholder: {
      title: ['PRÓXIMO PROJETO', 'EM BREVE'],
      category: 'EM PREPARAÇÃO',
      description: 'Um novo projeto está em curso. Será publicado aqui assim que estiver no ar.',
      cta: 'Em breve',
      slot: 'Projeto em preparação',
    },
  },

  services: {
    eyebrow: 'O que fazemos',
    title: 'SOLUÇÕES DIGITAIS',
    titleLead: 'PENSADAS PARA',
    titleAccent: 'FAZER AVANÇAR.',
    note: 'Combinamos estratégia, design e tecnologia para construir websites e lojas online que reforçam marcas e ajudam negócios em Portugal a crescer.',
    items: [
      {
        title: 'WEBSITES',
        copy: 'Websites rápidos, responsivos e desenvolvidos à medida para comunicar valor, reforçar a marca e transformar atenção em oportunidade.',
      },
      {
        title: 'LOJAS ONLINE',
        copy: 'Lojas online pensadas para simplificar a decisão de compra, elevar a perceção da marca e facilitar a venda.',
      },
      {
        title: '3D & IA',
        copy: 'Experiências interativas que combinam 3D, motion e inteligência artificial para criar interações digitais memoráveis.',
      },
    ],
  },

  pricing: {
    eyebrow: 'Preços',
    title: 'PREÇOS CLAROS.',
    titleAccent: 'SEM SURPRESAS.',
    note: 'Três pontos de partida para ter o seu negócio online, publicado em 2 dias. Só paga se gostar do resultado.',
    featuredLabel: 'Mais escolhido',
    cta: 'Pedir orçamento',
    onRequest: 'Sob consulta',
    footnote: 'Pagamento único por projeto, só depois de aprovar o site. A manutenção é opcional.',
    plans: [
      {
        name: 'Essencial',
        kind: 'Landing page',
        price: 199,
        summary: 'Uma página para apresentar o seu negócio e receber contactos.',
        features: [
          'Página única, responsiva',
          'Formulário de contacto e botão de WhatsApp',
          'Configuração base de SEO',
        ],
      },
      {
        name: 'Profissional',
        kind: 'Website institucional',
        price: 349,
        summary: 'O website completo da sua empresa, com várias páginas.',
        features: [
          'Até 5 páginas',
          'Design à medida da sua marca',
          'SEO em todas as páginas',
          'Google Maps e redes sociais',
        ],
        featured: true,
      },
      {
        name: 'Loja',
        kind: 'Loja online',
        price: 499,
        summary: 'Para vender online, com catálogo e pagamentos.',
        features: [
          'Catálogo de produtos',
          'Pagamentos online e gestão de encomendas',
          'Painel para gerir a loja sozinho',
          'SEO para produtos e categorias',
        ],
      },
    ],
  },

  care: {
    eyebrow: 'Manutenção',
    title: 'O SEU SITE A TRABALHAR',
    titleAccent: 'NO GOOGLE.',
    note: 'Publicar é o começo. Com a manutenção, cuidamos do site todos os meses para que se apresente bem e seja encontrado — no Google e nas respostas de inteligência artificial. Estas são as estratégias que usamos.',
    price: null,
    per: '/mês',
    onRequest: 'Sob consulta',
    cta: 'Quero manutenção',
    items: [
      {
        tag: 'SEO',
        title: 'Otimização para motores de busca',
        copy: 'Trabalhamos títulos, textos, estrutura e ligações internas para o Google perceber o que oferece e mostrá-lo a quem procura exatamente isso.',
      },
      {
        tag: 'SEO local',
        title: 'Google Business Profile',
        copy: 'Criamos e mantemos o perfil da empresa no Google, para aparecer no mapa e nas pesquisas feitas na sua zona.',
      },
      {
        tag: 'GEO',
        title: 'Otimização para IA generativa',
        copy: 'Preparamos o conteúdo para ser citado pelo ChatGPT, Gemini, Perplexity e pelas respostas com IA do Google: informação clara, factual e bem organizada.',
      },
      {
        tag: 'Schema',
        title: 'Dados estruturados',
        copy: 'Descrevemos serviços, preços e perguntas frequentes em schema.org, a linguagem que os motores de busca leem, para resultados mais ricos.',
      },
      {
        tag: 'Performance',
        title: 'Velocidade e Core Web Vitals',
        copy: 'Mantemos o site rápido no telemóvel. A velocidade conta para o ranking e para quem decide se fica ou sai.',
      },
      {
        tag: 'Conteúdo',
        title: 'Blog e conteúdo',
        copy: 'Publicamos artigos que respondem às perguntas dos seus clientes e trazem visitas novas todos os meses.',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    title: 'SIMPLES. RÁPIDO.',
    titleAccent: 'SEM RISCO.',
    steps: [
      { title: 'PEDIDO', copy: 'Preenche o formulário: o que vende, as cores, o logótipo e o que imagina.' },
      { title: 'CRIAÇÃO', copy: 'Desenhamos e construímos o site à medida da sua marca.' },
      { title: 'APROVAÇÃO', copy: 'Vê o site pronto. Se gostar, paga. Se não gostar, não paga.' },
      { title: 'PUBLICAÇÃO', copy: 'Em 2 dias o site está no ar — com manutenção, se quiser.' },
    ],
  },

  about: {
    eyebrow: 'A RUPE',
    title: ['NÃO CONSTRUÍMOS', 'APENAS WEBSITES.'],
    lead: 'Criamos experiências que as pessoas recordam.',
    body: 'A RUPE trabalha no ponto onde design, engenharia e tecnologia se encontram. Tratamos interface, código, 3D e inteligência artificial como partes da mesma experiência — porque uma boa ideia só funciona quando cada detalhe trabalha na mesma direção.',
    pillars: ['Design', 'Desenvolvimento', 'Tecnologia', '3D', 'Inteligência artificial'],
  },

  story: {
    eyebrow: 'A nossa história',
    marker: '2026 — AVANÇAR',
    title: 'COMEÇOU',
    titleLead: 'COM UMA',
    titleAccent: 'DECISÃO.',
    narrative: [
      'A RUPE nasceu de dois irmãos e de uma decisão em comum: deixar de seguir caminhos traçados por outros e começar a construir o nosso.',
      'Deixámos para trás o previsível para criar um estúdio onde design, tecnologia e ambição pudessem existir no mesmo lugar.',
      'Nunca quisemos construir apenas mais uma agência. Queríamos criar trabalho do qual nos pudéssemos orgulhar, construir relações duradouras e provar que o lugar onde começamos não determina até onde podemos chegar.',
    ],
    turn: 'Essa decisão tornou-se a RUPE.',
    signature: ['Dois irmãos.', 'Um estúdio.', 'Uma história que continuamos a construir.'],
    go: 'Avançar',
    mission: {
      eyebrow: 'Missão',
      title: 'Criar experiências digitais que fazem negócios avançar.',
      copy: 'Combinamos design, engenharia e tecnologia para transformar ideias em experiências digitais que criam valor real.',
    },
    vision: {
      eyebrow: 'Visão',
      title: 'Criar para além do esperado.',
      copy: 'Queremos construir um estúdio digital reconhecido pela qualidade, pensamento e impacto por detrás de cada projeto — independentemente de onde o próximo desafio nos levar.',
    },
  },

  values: {
    eyebrow: 'Princípios',
    title: 'AQUILO EM QUE',
    titleAccent: 'ACREDITAMOS.',
    items: [
      { title: 'ASSUMIR O TRABALHO.', copy: 'Assumimos responsabilidade pelo que criamos. Não entregamos algo em que não acreditamos.' },
      { title: 'O DETALHE IMPORTA.', copy: 'Grandes experiências são construídas através de pequenas decisões bem tomadas.' },
      { title: 'CONTINUAR A AVANÇAR.', copy: 'Tecnologia muda. Negócios mudam. Nós também.' },
      { title: 'CRIAR COM PROPÓSITO.', copy: 'Não adicionamos tecnologia apenas porque podemos. Cada decisão precisa de uma razão.' },
      { title: 'CONTINUAR HUMANOS.', copy: 'Por detrás de cada interface existem pessoas. É para elas que criamos.' },
    ],
  },

  finalCta: {
    eyebrow: 'Peça o seu site',
    title: 'SE GOSTAR,',
    titleAccent: 'PAGA.',
    copy: 'Diga-nos o que quer — cores, logótipo, o que vende. Criamos o seu site e publicamo-lo em 2 dias. Só paga se gostar.',
    promise: ['Publicado em 2 dias', 'Só paga se gostar', 'Manutenção opcional'],
    orWrite: 'Prefere escrever-nos?',
  },

  form: {
    title: 'Conte-nos o que quer',
    name: 'Nome',
    email: 'Email',
    phone: 'Telemóvel (opcional)',
    business: 'Nome do negócio',
    type: 'O que precisa',
    typeCare: 'Manutenção e SEO',
    typeUnsure: 'Ainda não sei',
    brief: 'O seu projeto',
    briefPlaceholder: 'O que vende, para quem, que páginas imagina, sites de que gosta…',
    colors: 'Cores da marca',
    addColor: 'Adicionar cor',
    removeColor: 'Remover cor',
    colorsPlaceholder: 'Ou descreva: azul-escuro, dourado…',
    logo: 'Logótipo (opcional)',
    logoHint: 'PNG, JPG, SVG ou PDF, até 5 MB.',
    logoTooBig: 'O ficheiro tem mais de 5 MB.',
    reference: 'Site atual ou referência (opcional)',
    referencePlaceholder: 'https://',
    consent: 'Aceito que a RUPE use estes dados para responder ao meu pedido.',
    submit: 'Enviar pedido',
    sending: 'A enviar…',
    successTitle: 'Pedido recebido.',
    successBody: 'Vamos responder para {email}. Se gostar do resultado, paga — e o site fica publicado em 2 dias.',
    errorTitle: 'Não foi possível enviar.',
    errorBody: 'Tente novamente ou escreva-nos para',
  },

  blog: {
    navLabel: 'BLOG',
    eyebrow: 'Blog',
    title: 'IDEIAS PARA',
    titleAccent: 'VENDER ONLINE.',
    note: 'Guias práticos sobre websites, lojas online e como ser encontrado no Google — para negócios em Portugal.',
    seoTitle: 'Blog — Websites, Lojas Online e SEO em Portugal | RUPE',
    seoDescription: 'Guias práticos sobre criação de websites, lojas online, SEO e presença no Google para negócios em Portugal.',
    readMore: 'Ler artigo',
    back: 'Todos os artigos',
    minutes: 'min de leitura',
    empty: 'Em breve, os primeiros artigos.',
    ctaTitle: 'Quer um site assim?',
    ctaCopy: 'Publicado em 2 dias. Só paga se gostar.',
    ctaButton: 'Pedir o meu site',
  },

  footer: {
    menuLabel: 'Menu',
    menu: [
      { label: 'PROJETOS', href: '#work' },
      { label: 'SERVIÇOS', href: '#services' },
      { label: 'PREÇOS', href: '#pricing' },
      { label: 'MANUTENÇÃO', href: '#care' },
      { label: 'SOBRE', href: '#about' },
      { label: 'BLOG', href: '/blog/' },
      { label: 'CONTACTO', href: '#contact' },
    ],
    socialLabel: 'Redes',
    contactLabel: 'Contacto',
    schedule: 'Marcar uma conversa',
    legalLabel: 'Legal',
    legal: [
      { label: 'PRIVACIDADE', href: '/privacidade' },
      { label: 'COOKIES', href: '/cookies' },
    ],
    marketsLabel: 'País',
    entityLabel: 'Entidade legal',
    entity: 'RUPE é uma marca operada pela E&F Barons LLC, sociedade constituída nos Estados Unidos.',
    signature: ['Pensado.', 'Criado.', 'Feito para avançar.'],
    signatureBy: 'Pela RUPE.',
    rights: 'Todos os direitos reservados.',
    top: 'Voltar ao topo',
  },
};
