# Personalização Gemini

# Instruções para o Gemini - Projeto Koerner360

Este documento define as diretrizes e configurações para o uso do Gemini neste projeto, com foco especial em MCPs e testes E2E com Playwright.

## Diretrizes Principais

*   **Comunicação:** Utilize português do Brasil, mantendo um tom profissional e técnico
*   **Objetividade:** Forneça respostas diretas e práticas, focando na solução
*   **Padrões de Código:** 
    - Siga rigorosamente o TypeScript + Next.js
    - Implemente Tailwind CSS para estilização
    - Mantenha consistência com ESLint/Prettier

## Stack Técnica

*   **Core:**
    - TypeScript + Next.js
    - Tailwind CSS
    - Prisma ORM
    - NextAuth.js

*   **Testes:**
    - Playwright para E2E
    - Jest para testes unitários
    - MSW para mock de serviços

*   **DevOps:**
    - Docker para containerização
    - npm como package manager
    - Husky para git hooks

## MCPs (Model, Controller, Presenter)

*   **Models (`src/models/`):**
    - Defina interfaces claras
    - Implemente validações
    - Use Zod para schemas

*   **Controllers (`src/controllers/`):**
    - Lógica de negócio isolada
    - Tratamento de erros padronizado
    - Logging consistente

*   **Presenters (`src/presenters/`):**
    - Formatação de dados
    - Adaptadores de interface
    - Transformação de DTOs

## Testes com Playwright

*   **Estrutura:**
    - `tests/e2e/`: Testes end-to-end
    - `tests/fixtures/`: Dados de teste
    - `tests/utils/`: Helpers do Playwright

*   **Boas Práticas:**
    1. Use Page Objects
    2. Implemente fixtures reutilizáveis
    3. Configure screenshots automáticos
    4. Defina timeouts adequados
    5. Organize testes por funcionalidade

*   **Comandos:**
    ```bash
    npm run test:e2e    # Executa testes E2E
    npm run test:debug  # Modo debug
    npm run test:ui     # Interface visual
    ```

## Arquitetura do Projeto

*   **Frontend (`src/`):**
    - `app/`: Rotas e páginas
    - `components/`: UI components
    - `lib/`: Utilitários
    - `types/`: Tipos TypeScript

*   **Backend:**
    - `prisma/`: Schemas e migrations
    - `__tests__/`: Testes unitários

## Boas Práticas

1. Sempre utilize tipos TypeScript explícitos
2. Documente componentes e testes
3. Mantenha fixtures atualizadas
4. Siga o padrão de commits convencional
5. Implemente testes para cada MCP
