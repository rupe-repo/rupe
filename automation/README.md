# Automações (n8n)

Dois workflows para importar no n8n: **Workflows → Import from File**.

## 1. Leads do site — `n8n-leads.json`

O formulário "Conte-nos o que quer" (Portugal, Brasil e EUA) envia cada pedido para este
workflow, que:

1. recebe o pedido no webhook `POST /webhook/rupe-leads` (com o logótipo, se houver);
2. descarta bots (campo armadilha) e pedidos sem nome ou email;
3. envia um email para **rupe@rupeai.pt** com tudo o que o cliente escreveu, as cores
   desenhadas como bolinhas e o logótipo em anexo — responder ao email responde ao cliente;
4. envia ao cliente uma confirmação no idioma dele;
5. responde ao site, que mostra "Pedido recebido".

**Configurar**

1. Importe o ficheiro.
2. Crie uma credencial **SMTP** para rupe@rupeai.pt (os dados SMTP vêm do seu fornecedor de
   email) e escolha-a nos dois nós de email.
3. Ative o workflow (interruptor *Active*).
4. Abra o nó **Formulário do site** e copie o **Production URL**. Se for diferente do que está
   em `.env.production` (`VITE_LEADS_WEBHOOK_URL`), atualize lá e faça um novo build.
5. Se o site ficar noutro domínio além de rupe.pt, acrescente-o em *Allowed Origins (CORS)* no
   mesmo nó.

**Testar:** preencha o formulário no site publicado (ou em `npm run preview`). O email deve
chegar em segundos. Se o logótipo não vier em anexo, abra a execução no n8n e veja o nome do
campo binário que o webhook criou; ponha esse nome em *Attachments* no nó "Email para a RUPE".

Quer guardar os leads também numa folha? Acrescente um nó **Google Sheets → Append row** depois
de "Preparar lead".

## 2. Ideias semanais para o blog — `n8n-blog-ideas.json`

Todas as segundas às 9h:

1. lê `https://rupe.pt/sitemap.xml` para saber que artigos já existem;
2. pede ao Claude (modelo `claude-sonnet-5-5`) 5 ideias por mercado — Portugal, Brasil/Curitiba
   e EUA — com título, palavra-chave, intenção de pesquisa, porque traz clientes e a estrutura
   do artigo;
3. envia tudo num email para rupe@rupeai.pt.

**Configurar**

1. Importe o ficheiro.
2. Crie uma credencial **Header Auth** com nome `x-api-key` e, como valor, a sua chave da API
   da Anthropic (console.anthropic.com). Escolha-a no nó "Pedir ideias ao Claude".
3. Escolha a mesma credencial SMTP no nó "Enviar ideias".
4. Ative o workflow. Para testar já, clique em *Execute workflow*.

## Publicar um artigo

Cada artigo é um ficheiro Markdown:

```
content/blog/pt-PT/<slug>.md   →  rupe.pt/blog/<slug>/
content/blog/pt-BR/<slug>.md   →  rupe.pt/br/blog/<slug>/
content/blog/en-US/<slug>.md   →  rupe.pt/us/blog/<slug>/
```

Com este cabeçalho:

```markdown
---
title: Título do artigo (até ~65 caracteres)
description: Uma frase para o Google, entre 140 e 160 caracteres.
date: 2026-10-27
tags: [websites, preços]
---

**Resposta curta:** responda à pergunta do título logo no primeiro parágrafo — é o que o
Google e as IAs citam.

## Primeiro subtítulo
...
```

Um ficheiro começado por `_` é um rascunho e não é publicado. O build gera a página, junta-a
ao blog e ao sitemap, e descreve-a ao Google com os dados estruturados de artigo.
