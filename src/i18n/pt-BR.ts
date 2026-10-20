import type { Content } from './types';

/**
 * Brasil — served at /br/, written for Curitiba.
 *
 * Brazilian Portuguese throughout (site, loja virtual, contato, por trás), not
 * a re-spelling of the Portuguese page: the two markets search with different
 * words, and Google treats near-identical pt-PT/pt-BR pages as duplicates.
 * Curitiba appears where a local search reads it — title, description, the
 * hero eyebrow, services, pricing and the CTA — and nowhere it would be filler.
 */
export const ptBR: Content = {
  locale: 'pt-BR',

  seo: {
    path: '/br/',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    title: 'Criação de Sites em Curitiba | RUPE Estúdio Digital',
    description:
      'Criação de sites em Curitiba a partir de R$ 400, no ar em 2 dias — você só paga se gostar. Sites, landing pages e lojas virtuais otimizados para o Google.',
    ogTitle: 'RUPE — Criação de Sites em Curitiba',
    ogImageAlt: 'Marca RUPE — Estúdio de criação de sites em Curitiba',
    areaServed: [
      { type: 'City', name: 'Curitiba' },
      { type: 'Country', name: 'Brasil' },
    ],
    noscript:
      'A RUPE cria sites, landing pages e lojas virtuais para empresas de Curitiba e de todo o Brasil. Landing pages a partir de R$ 400, no ar em 2 dias, e você só paga se gostar. WhatsApp: +55 41 8895-5910.',
  },

  currency: 'BRL',
  marketName: 'Brasil',
  contactEmail: 'rupe@rupeai.pt',
  whatsapp: {
    number: '554188955910',
    display: '+55 41 8895-5910',
    message: 'Olá! Vim pelo site da RUPE e quero criar um site.',
    label: 'Falar no WhatsApp',
  },

  skipLink: 'Pular para o conteúdo',
  homeLabel: 'RUPE — início',
  tagline: 'Estúdio de experiências digitais',

  nav: {
    links: [
      { label: 'PROJETOS', href: '#work' },
      { label: 'SERVIÇOS', href: '#services' },
      { label: 'PREÇOS', href: '#pricing' },
      { label: 'BLOG', href: '/br/blog/' },
    ],
    cta: 'Quero meu site',
    open: 'Abrir menu',
    close: 'Fechar menu',
    primaryLabel: 'Principal',
    menuLabel: 'Menu',
  },

  hero: {
    eyebrow: 'Criação de sites em Curitiba',
    headline: [
      { text: 'CRIAMOS' },
      { text: 'EXPERIÊNCIAS', accent: true },
      { text: 'DIGITAIS QUE' },
      { text: 'FAZEM NEGÓCIOS' },
      { text: 'AVANÇAR.', accent: true },
    ],
    lead: 'Sites, lojas virtuais e experiências digitais feitos para valorizar marcas, simplificar a jornada do cliente e gerar resultado.',
    cta: 'Quero meu site',
    offer: 'No ar em 2 dias · Só paga se gostar',
    badge: 'AVANÇAR · AVANÇAR ·',
    scroll: 'Descobrir',
  },

  portfolio: {
    capabilities: ['WEB DESIGN', 'LOJA VIRTUAL', 'DESENVOLVIMENTO', '3D & MOTION', 'IDENTIDADE DE MARCA', 'EXPERIÊNCIAS COM IA'],
    eyebrow: 'Projetos selecionados',
    title: 'TRABALHO QUE FAZ',
    titleAccent: 'MARCAS AVANÇAREM.',
    note: 'Todo projeto começa com uma pergunta simples: o que precisa acontecer depois que alguém chega até aqui?',
    caseAlt: 'Projeto Doce & Arte exibido no desktop e no celular',
    prev: 'Projeto anterior',
    next: 'Próximo projeto',
    slideOf: 'de',
    cases: [
      {
        title: ['DOCE & ARTE', 'CONFEITARIA'],
        category: 'LOJA VIRTUAL / WEB DESIGN / DESENVOLVIMENTO',
        description:
          'Transformamos uma compra que dependia de mensagens em uma experiência digital mais simples, sofisticada e pronta para crescer.',
        cta: 'Ver projeto',
      },
    ],
    placeholder: {
      title: ['PRÓXIMO PROJETO', 'EM BREVE'],
      category: 'EM ANDAMENTO',
      description: 'Um novo projeto está em andamento. Ele aparece aqui assim que estiver no ar.',
      cta: 'Em breve',
      slot: 'Projeto em andamento',
    },
  },

  services: {
    eyebrow: 'O que fazemos',
    title: 'SOLUÇÕES DIGITAIS',
    titleLead: 'PENSADAS PARA',
    titleAccent: 'FAZER AVANÇAR.',
    note: 'Unimos estratégia, design e tecnologia para criar sites e lojas virtuais que fortalecem marcas e ajudam empresas de Curitiba a crescer.',
    items: [
      {
        title: 'SITES',
        copy: 'Sites rápidos, responsivos e feitos sob medida para comunicar valor, fortalecer a marca e transformar visitas em clientes.',
      },
      {
        title: 'LOJA VIRTUAL',
        copy: 'Lojas virtuais pensadas para facilitar a decisão de compra, valorizar a marca e vender mais.',
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
    note: 'Três formas de colocar sua empresa de Curitiba no ar em 2 dias. Você só paga se gostar do resultado.',
    featuredLabel: 'Mais escolhido',
    cta: 'Pedir orçamento',
    onRequest: 'Sob consulta',
    footnote: 'Pagamento único por projeto, só depois de você aprovar o site. A manutenção é opcional.',
    plans: [
      {
        name: 'Essencial',
        kind: 'Landing page',
        price: 400,
        summary: 'Uma página para apresentar sua empresa e receber contatos.',
        features: [
          'Página única e responsiva',
          'Formulário de contato e botão de WhatsApp',
          'SEO básico configurado',
        ],
      },
      {
        name: 'Profissional',
        kind: 'Site institucional',
        price: 700,
        summary: 'O site completo da sua empresa, com várias páginas.',
        features: [
          'Até 5 páginas',
          'Design sob medida para a sua marca',
          'SEO em todas as páginas',
          'Google Maps e redes sociais',
        ],
        featured: true,
      },
      {
        name: 'Loja',
        kind: 'Loja virtual',
        price: 1000,
        summary: 'Para vender pela internet, com catálogo e pagamentos.',
        features: [
          'Catálogo de produtos',
          'Pagamentos online e gestão de pedidos',
          'Painel para você gerenciar a loja',
          'SEO para produtos e categorias',
        ],
      },
    ],
  },

  care: {
    eyebrow: 'Manutenção',
    title: 'SEU SITE TRABALHANDO',
    titleAccent: 'NO GOOGLE.',
    note: 'Colocar no ar é só o começo. Com a manutenção, cuidamos do site todo mês para ele se apresentar bem e ser encontrado em Curitiba — no Google e nas respostas de inteligência artificial. Estas são as estratégias que usamos.',
    price: null,
    per: '/mês',
    onRequest: 'Sob consulta',
    cta: 'Quero manutenção',
    items: [
      {
        tag: 'SEO',
        title: 'Otimização para buscadores',
        copy: 'Trabalhamos títulos, textos, estrutura e links internos para o Google entender o que você oferece e mostrar seu site para quem procura exatamente isso.',
      },
      {
        tag: 'SEO local',
        title: 'Google Meu Negócio',
        copy: 'Criamos e cuidamos do perfil da empresa no Google, para você aparecer no mapa e nas buscas feitas em Curitiba e região.',
      },
      {
        tag: 'GEO',
        title: 'Otimização para IA generativa',
        copy: 'Preparamos o conteúdo para ser citado pelo ChatGPT, Gemini, Perplexity e pelas respostas com IA do Google: informação clara, objetiva e bem organizada.',
      },
      {
        tag: 'Schema',
        title: 'Dados estruturados',
        copy: 'Descrevemos serviços, preços e perguntas frequentes em schema.org, a linguagem que os buscadores leem, para resultados mais completos.',
      },
      {
        tag: 'Performance',
        title: 'Velocidade e Core Web Vitals',
        copy: 'Mantemos o site rápido no celular. Velocidade conta para o ranking e para quem decide se fica ou vai embora.',
      },
      {
        tag: 'Conteúdo',
        title: 'Blog e conteúdo',
        copy: 'Publicamos artigos que respondem às dúvidas dos seus clientes e trazem visitas novas todo mês.',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    title: 'SIMPLES. RÁPIDO.',
    titleAccent: 'SEM RISCO.',
    steps: [
      { title: 'PEDIDO', copy: 'Você preenche o formulário: o que vende, as cores, o logo e o que imagina.' },
      { title: 'CRIAÇÃO', copy: 'Desenhamos e construímos o site sob medida para a sua marca.' },
      { title: 'APROVAÇÃO', copy: 'Você vê o site pronto. Gostou, paga. Não gostou, não paga.' },
      { title: 'NO AR', copy: 'Em 2 dias o site está publicado — com manutenção, se você quiser.' },
    ],
  },

  about: {
    eyebrow: 'A RUPE',
    title: ['NÃO CRIAMOS', 'APENAS SITES.'],
    lead: 'Criamos experiências que as pessoas lembram.',
    body: 'A RUPE trabalha onde design, engenharia e tecnologia se encontram. Tratamos interface, código, 3D e inteligência artificial como partes da mesma experiência — porque uma boa ideia só funciona quando cada detalhe aponta para a mesma direção.',
    pillars: ['Design', 'Desenvolvimento', 'Tecnologia', '3D', 'Inteligência artificial'],
  },

  story: {
    eyebrow: 'Nossa história',
    marker: '2026 — AVANÇAR',
    title: 'COMEÇOU',
    titleLead: 'COM UMA',
    titleAccent: 'DECISÃO.',
    narrative: [
      'A RUPE nasceu de dois irmãos e de uma decisão em comum: parar de seguir caminhos traçados por outros e começar a construir o nosso.',
      'Deixamos o previsível para trás para criar um estúdio onde design, tecnologia e ambição pudessem existir no mesmo lugar.',
      'Nunca quisemos ser só mais uma agência. Queríamos criar um trabalho do qual pudéssemos nos orgulhar, construir relações duradouras e provar que o lugar onde começamos não define até onde podemos chegar.',
    ],
    turn: 'Essa decisão virou a RUPE.',
    signature: ['Dois irmãos.', 'Um estúdio.', 'Uma história que seguimos construindo.'],
    go: 'Avançar',
    mission: {
      eyebrow: 'Missão',
      title: 'Criar experiências digitais que fazem negócios avançarem.',
      copy: 'Unimos design, engenharia e tecnologia para transformar ideias em experiências digitais que geram valor real.',
    },
    vision: {
      eyebrow: 'Visão',
      title: 'Ir além do esperado.',
      copy: 'Queremos construir um estúdio digital reconhecido pela qualidade, pelo pensamento e pelo impacto por trás de cada projeto — não importa para onde o próximo desafio nos leve.',
    },
  },

  values: {
    eyebrow: 'Princípios',
    title: 'NO QUE',
    titleAccent: 'ACREDITAMOS.',
    items: [
      { title: 'ASSUMIR O TRABALHO.', copy: 'Assumimos a responsabilidade pelo que criamos. Não entregamos nada em que não acreditamos.' },
      { title: 'O DETALHE IMPORTA.', copy: 'Grandes experiências são feitas de pequenas decisões bem tomadas.' },
      { title: 'SEGUIR AVANÇANDO.', copy: 'A tecnologia muda. Os negócios mudam. Nós também.' },
      { title: 'CRIAR COM PROPÓSITO.', copy: 'Não usamos tecnologia só porque podemos. Cada decisão precisa de um motivo.' },
      { title: 'CONTINUAR HUMANOS.', copy: 'Por trás de cada interface existem pessoas. É para elas que criamos.' },
    ],
  },

  finalCta: {
    eyebrow: 'Peça seu site',
    title: 'GOSTOU?',
    titleAccent: 'AÍ VOCÊ PAGA.',
    copy: 'Conte o que você quer — cores, logo, o que vende. A gente cria seu site e coloca no ar em 2 dias. Atendemos Curitiba e todo o Brasil, e você só paga se gostar.',
    promise: ['No ar em 2 dias', 'Só paga se gostar', 'Manutenção opcional'],
    orWrite: 'Prefere conversar direto?',
  },

  form: {
    title: 'Conte o que você quer',
    name: 'Nome',
    email: 'E-mail',
    phone: 'WhatsApp (opcional)',
    business: 'Nome da empresa',
    type: 'O que você precisa',
    typeCare: 'Manutenção e SEO',
    typeUnsure: 'Ainda não sei',
    brief: 'Seu projeto',
    briefPlaceholder: 'O que você vende, para quem, quais páginas imagina, sites de que gosta…',
    colors: 'Cores da marca',
    addColor: 'Adicionar cor',
    removeColor: 'Remover cor',
    colorsPlaceholder: 'Ou descreva: azul-marinho, dourado…',
    logo: 'Logo (opcional)',
    logoHint: 'PNG, JPG, SVG ou PDF, até 5 MB.',
    logoTooBig: 'O arquivo tem mais de 5 MB.',
    reference: 'Site atual ou referência (opcional)',
    referencePlaceholder: 'https://',
    consent: 'Concordo que a RUPE use estes dados para responder ao meu pedido.',
    submit: 'Enviar pedido',
    sending: 'Enviando…',
    successTitle: 'Pedido recebido!',
    successBody: 'Vamos responder em {email}. Se você gostar do resultado, paga — e o site fica no ar em 2 dias.',
    errorTitle: 'Não foi possível enviar.',
    errorBody: 'Tente de novo ou fale com a gente pelo',
  },

  blog: {
    navLabel: 'BLOG',
    eyebrow: 'Blog',
    title: 'IDEIAS PARA',
    titleAccent: 'VENDER ONLINE.',
    note: 'Guias práticos sobre sites, lojas virtuais e como aparecer no Google — para empresas de Curitiba e de todo o Brasil.',
    seoTitle: 'Blog — Sites, Lojas Virtuais e SEO em Curitiba | RUPE',
    seoDescription: 'Guias práticos sobre criação de sites, lojas virtuais, SEO e Google Meu Negócio para empresas de Curitiba e do Brasil.',
    readMore: 'Ler artigo',
    back: 'Todos os artigos',
    minutes: 'min de leitura',
    empty: 'Em breve, os primeiros artigos.',
    ctaTitle: 'Quer um site assim?',
    ctaCopy: 'No ar em 2 dias. Você só paga se gostar.',
    ctaButton: 'Quero meu site',
  },

  footer: {
    menuLabel: 'Menu',
    menu: [
      { label: 'PROJETOS', href: '#work' },
      { label: 'SERVIÇOS', href: '#services' },
      { label: 'PREÇOS', href: '#pricing' },
      { label: 'MANUTENÇÃO', href: '#care' },
      { label: 'SOBRE', href: '#about' },
      { label: 'BLOG', href: '/br/blog/' },
      { label: 'CONTATO', href: '#contact' },
    ],
    socialLabel: 'Redes',
    contactLabel: 'Contato',
    schedule: 'Agendar uma conversa',
    legalLabel: 'Legal',
    legal: [
      { label: 'PRIVACIDADE', href: '/br/privacidade' },
      { label: 'COOKIES', href: '/br/cookies' },
    ],
    marketsLabel: 'País',
    entityLabel: 'Empresa',
    entity: 'RUPE é uma marca operada pela E&F Barons LLC, empresa constituída nos Estados Unidos.',
    signature: ['Pensado.', 'Criado.', 'Feito para avançar.'],
    signatureBy: 'Pela RUPE.',
    rights: 'Todos os direitos reservados.',
    top: 'Voltar ao topo',
  },
};
