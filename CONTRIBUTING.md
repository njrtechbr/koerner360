# Guia de Contribuição

Obrigado por considerar contribuir para o Koerner 360! Este documento fornece diretrizes e informações sobre como contribuir para o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você deve seguir este código.

## Como Contribuir

Existem várias maneiras de contribuir para o Koerner 360:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 📝 Melhorar a documentação
- 🔧 Corrigir bugs existentes
- ✨ Implementar novas funcionalidades
- 🧪 Escrever testes
- 🎨 Melhorar a interface do usuário

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git
- Conta no Supabase (para desenvolvimento)

### Configuração Local

1. **Fork o repositório**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/koerner360.git
   cd koerner360
   ```

3. **Adicione o repositório original como upstream**
   ```bash
   git remote add upstream https://github.com/koerner-team/koerner360.git
   ```

4. **Instale as dependências**
   ```bash
   npm install
   ```

5. **Configure as variáveis de ambiente**
   ```bash
   cp .env.local.example .env.local
   # Edite .env.local com suas configurações
   ```

6. **Execute o projeto**
   ```bash
   npm run dev
   ```

## Padrões de Código

### Linguagem e Nomenclatura

- **Código**: Sempre em português brasileiro
- **Variáveis**: camelCase (`nomeUsuario`, `idAvaliacao`)
- **Funções**: camelCase (`criarUsuario`, `buscarAvaliacoes`)
- **Classes**: PascalCase (`GerenciadorUsuarios`, `ServicoAvaliacao`)
- **Arquivos**: kebab-case (`criar-usuario.tsx`, `servico-avaliacao.ts`)
- **Comentários**: Sempre em português brasileiro

### Estrutura de Arquivos

```
src/
├── app/                    # Páginas (App Router)
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
├── types/                # Definições de tipos
└── hooks/                # Hooks customizados
```

### Convenções de Código

1. **TypeScript**: Sempre use tipagem estática
2. **Componentes**: Use function components com hooks
3. **Imports**: Organize em ordem alfabética
4. **Props**: Sempre defina interfaces para props
5. **Comentários**: Documente funções complexas

### Exemplo de Componente

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormularioUsuarioProps {
  onSubmit: (dados: DadosUsuario) => void;
  carregando?: boolean;
}

/**
 * Componente para criação e edição de usuários
 */
export function FormularioUsuario({ onSubmit, carregando = false }: FormularioUsuarioProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome do usuário"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <Input
        type="email"
        placeholder="Email do usuário"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={carregando}>
        {carregando ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

## Processo de Pull Request

1. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Faça suas alterações**
   - Siga os padrões de código
   - Adicione testes se necessário
   - Atualize a documentação

3. **Teste suas alterações**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit suas alterações**
   ```bash
   git add .
   git commit -m "feat: adicionar funcionalidade X"
   ```

5. **Push para seu fork**
   ```bash
   git push origin feature/nome-da-feature
   ```

6. **Abra um Pull Request**
   - Use um título descritivo
   - Descreva as mudanças realizadas
   - Referencie issues relacionadas
   - Adicione screenshots se aplicável

### Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Mudanças de formatação
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Mudanças em ferramentas/configurações

## Reportando Bugs

Antes de reportar um bug:

1. Verifique se já existe uma issue similar
2. Teste na versão mais recente
3. Colete informações sobre o ambiente

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 0.1.0]
```

## Sugerindo Melhorias

Para sugerir melhorias:

1. Verifique se já existe uma issue similar
2. Descreva claramente a melhoria
3. Explique por que seria útil
4. Forneça exemplos se possível

### Template de Feature Request

```markdown
**Descrição da Funcionalidade**
Descrição clara da funcionalidade desejada.

**Problema que Resolve**
Que problema esta funcionalidade resolveria?

**Solução Proposta**
Descreva como você imagina que funcionaria.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Qualquer outra informação relevante.
```

## Dúvidas?

Se você tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/koerner-team/koerner360/discussions)
- Entre em contato via email: dev@koerner360.com
- Consulte a [documentação](docs/)

---

**Obrigado por contribuir para o Koerner 360!** 🚀