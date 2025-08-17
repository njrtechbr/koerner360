# Análise dos Erros 404: "/dashboard" e "/@vite/client"

## 1. Descrição do Problema

Ao iniciar o servidor de desenvolvimento (Next.js 15.4.6 com Turbopack), observam-se erros 404 para duas rotas específicas:

- GET /dashboard 404
- GET /@vite/client 404

Impacto direto:
- A navegação para a página principal autenticada ("/dashboard") não funciona, impedindo o acesso à área principal do sistema.
- O navegador tenta requisitar o recurso "/@vite/client", que não é servido pela aplicação, indicando que um cliente de desenvolvimento do Vite está sendo solicitado, mas não disponível no ambiente atual. Isso não apenas gera ruído nos logs, como pode afetar o comportamento de atualização em tempo real (HMR) esperado pelo navegador em certos contextos.

Evidências coletadas a partir dos logs do servidor de desenvolvimento:

```
✓ Ready in 1706ms
○ Compiling /_not-found/page ...
✓ Compiled /_not-found/page in 1472ms
GET /dashboard 404 in 1770ms
GET /@vite/client 404 in 70ms
GET /dashboard 404 in 115ms
```

## 2. Análise Detalhada

Abaixo, as possíveis causas e considerações para cada um dos sintomas, segmentadas por aspectos de arquitetura, configuração e ambiente.

### 2.1. Configuração de Rotas (App Router do Next.js)

- Existe um arquivo de página para o caminho "/dashboard" sob o App Router: `src/app/(auth)/dashboard/page.tsx`, com export padrão de um Client Component válido. A presença deste arquivo deveria registrar a rota `/dashboard` na aplicação.
- Entretanto, há também um diretório `app/` na raiz do projeto (paralelo a `src/`), ainda que vazio. Em projetos Next.js, a presença de um diretório `app/` na raiz e outro em `src/app/` cria uma ambiguidade estrutural sobre qual árvore de rotas o framework irá considerar como fonte de verdade. Essa ambiguidade pode levar o Next.js a priorizar o `app/` de nível raiz (que está vazio), ignorando a árvore real contida em `src/app/`. Quando isso ocorre, o servidor não registra as rotas esperadas e responde 404 para caminhos que efetivamente existem em `src/app/`.
- Sintoma colateral coerente com esse cenário: o servidor compila apenas a rota de `_not-found`, como visto nos logs, o que é típico quando não há páginas válidas visíveis na árvore considerada pelo Next.
- Consequência: apesar do arquivo existir em `src/app/(auth)/dashboard/page.tsx`, a aplicação responde 404 para `/dashboard` porque a árvore de rotas efetivamente carregada não inclui essa rota.

### 2.2. Middleware e Regras de Acesso

- O projeto possui um middleware com autenticação e redirecionamentos condicionais de acordo com o tipo de usuário, incluindo o tratamento de `/dashboard` como rota autenticada acessível para todos os tipos válidos. Esse middleware, por si só, não justificaria um 404, pois sua função é autorizar, redirecionar ou permitir a continuação da requisição.
- Em um cenário onde a árvore de rotas não está carregada (ver 2.1), o middleware pode executar normalmente, mas a requisição ainda terminará em 404 por ausência da rota no App Router ativo.

### 2.3. Caminhos de Arquivos e Recursos ("/@vite/client")

- O recurso `@vite/client` é característico do ambiente de desenvolvimento do Vite (cliente HMR). Não há dependências ou configurações do Vite listadas no `package.json`, tampouco referências explícitas a `@vite/client` no código-fonte.
- A ausência de qualquer referência direta a `@vite/client` no projeto indica que a requisição para `GET /@vite/client` não é originada por importações da base de código atual. Em vez disso, é consistente com um dos seguintes cenários de ambiente:
  - Cache do navegador ou uma página previamente servida por um servidor Vite (em outro projeto/execução) solicitando automaticamente o cliente HMR ao recarregar a origem atual.
  - Extensões/plug-ins do navegador ou um Service Worker previamente registrado que injeta ou tenta recuperar o cliente do Vite por padrão.
- No contexto atual (Next.js + Turbopack), esse caminho não é servido, resultando naturalmente em 404.

### 2.4. Configuração do Servidor de Desenvolvimento

- O projeto utiliza Next.js 15.4.6 com Turbopack no modo de desenvolvimento. Não há Vite integrado.
- A presença de dois arquivos de configuração do Next (`next.config.js` e `next.config.ts`) pode ocasionar reinicializações do servidor e comportamentos não determinísticos sobre qual configuração está efetivamente ativa. Embora isso não seja, por si só, a origem de um 404, contribui para instabilidade e ruído ao depurar o problema.
- A mensagem de log indicando reinicialização devido a alterações no `next.config.js` reforça que este arquivo está sendo observado e aplicado, o que também aponta para a importância de entender qual conjunto de configurações o servidor está usando em tempo real.

### 2.5. Problemas de Deploy ou Ambiente

- Os sintomas observados foram capturados em ambiente de desenvolvimento. Em cenários de deploy, problemas de 404 semelhantes podem ocorrer quando a árvore de rotas construída não corresponde ao que está sendo acessado, mas, no presente caso, o 404 aparece já no ambiente local.
- A requisição a `@vite/client` reforça que há um fator ambiental (cache/extensão/Service Worker ou histórico de desenvolvimento com Vite em outra aplicação/porta) influenciando as requisições do navegador.

### 2.6. Dependências Ausentes ou Mal Configuradas

- Não há dependência do Vite instalada, portanto o recurso `@vite/client` não existe no servidor atual.
- As dependências do projeto (React, Next.js, NextAuth, Prisma, Tailwind, etc.) não adicionam o cliente do Vite automaticamente. Assim, a ausência deste recurso é esperada no contexto tecnológico em uso.

## 3. Conclusão (Sem Soluções)

- O erro 404 em `/dashboard` está alinhado com um cenário onde a árvore de rotas ativa do Next.js não inclui a rota, apesar do arquivo de página existir. A coexistência de `app/` (vazio) na raiz e `src/app/` com as rotas reais é um fator estrutural que pode explicar o comportamento observado e a compilação apenas de `_not-found`.
- O erro 404 em `/@vite/client` evidencia uma requisição de cliente HMR do Vite em um ambiente que não utiliza Vite. Isso aponta para influência externa ao código (cache, Service Worker, extensão ou histórico do navegador) ou um contexto anterior em que a origem acessada já serviu Vite.

Este documento se concentra exclusivamente em descrever o problema, hipóteses e impacto, sem apresentar caminhos de correção.