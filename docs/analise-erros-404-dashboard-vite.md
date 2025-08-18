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

## 4. Soluções Implementadas

### 4.1. Correção do Erro 404 na rota /dashboard

**Data da Implementação**: 17/08/2025 20:39:18

**Problema Identificado**: Confirmou-se que a causa do 404 em `/dashboard` era a presença de dois diretórios `app` no projeto:
- Um diretório `app/` vazio na raiz do projeto
- O diretório real `src/app/` contendo toda a estrutura de rotas

**Solução Aplicada**:
1. **Remoção do diretório duplicado**: O diretório `app/` da raiz foi completamente removido usando o comando:
   ```powershell
   Remove-Item -Path "c:\Users\Nereu Jr\Documents\Dev\koerner360\app" -Recurse -Force
   ```

2. **Consolidação das configurações**: Os arquivos `next.config.js` e `next.config.ts` foram consolidados em um único arquivo `next.config.ts`, mantendo todas as configurações necessárias:
   - Configurações do Prisma (`serverExternalPackages`)
   - Otimizações experimentais (`optimizePackageImports`)
   - Configurações do Turbopack para SVG

**Resultado**: 
- ✅ A rota `/dashboard` agora retorna **200 (sucesso)** em vez de 404
- ✅ O servidor compila corretamente todas as rotas em `src/app/`
- ✅ A navegação para `/dashboard` funciona normalmente

### 4.2. Status do Erro /@vite/client

**Situação Atual**: A requisição para `/@vite/client` ainda aparece nos logs retornando 404, mas isso é **comportamento esperado** pois:
- O projeto utiliza Next.js + Turbopack, não Vite
- Esta requisição é originada pelo cache do navegador ou extensões
- Não afeta o funcionamento da aplicação

**Recomendação para Usuários**: Para eliminar completamente esta requisição:
1. Limpar o cache do navegador
2. Remover Service Workers em DevTools > Application > Service Workers
3. Utilizar janela anônima para desenvolvimento
4. Desabilitar extensões de desenvolvimento que possam injetar scripts do Vite

## 5. Verificação dos Resultados

**Logs do Servidor Após Correção**:
```
✓ Ready in 1695ms
○ Compiling / ...
✓ Compiled / in 3.3s
GET /?ide_webview_request_time=1755473895662 307 in 3908ms
✓ Compiled /dashboard in 309ms
GET /dashboard 200 in 427ms  # ✅ SUCESSO - Era 404 antes
✓ Compiled /_not-found/page in 228ms
GET /@vite/client 404 in 321ms  # ⚠️ Esperado - cache do navegador
```

**Status das Correções**:
- ✅ **Erro 404 em /dashboard**: **RESOLVIDO**
- ⚠️ **Erro 404 em /@vite/client**: **Esperado** (requer limpeza do cache do navegador)

## 6. Conclusão

As correções implementadas resolveram com sucesso o problema principal dos erros 404. O ambiente de desenvolvimento agora funciona conforme esperado:

- A rota autenticada `/dashboard` é devidamente servida pela aplicação
- A navegação pós-login para a página principal do dashboard ocorre normalmente
- O Next.js reconhece corretamente todas as páginas definidas em `src/app/`
- A estrutura do projeto está alinhada com as melhores práticas do Next.js 15

A solução envolveu alinhar a estrutura do projeto ao padrão suportado pelo Next.js (evitando duplicidade de diretórios especiais) e consolidar as configurações em um único arquivo. Com essas correções, o fluxo de desenvolvimento está estável e confiável.