# Documento de Design - Correção de Erros ESLint

## Visão Geral

Este documento detalha a estratégia técnica para corrigir todos os erros e warnings de ESLint identificados no projeto Koerner 360, garantindo que o build de produção execute com sucesso e que o código atenda aos padrões de qualidade estabelecidos.

## Arquitetura da Solução

### Estratégia de Correção

A correção será realizada em **4 fases sequenciais** para minimizar riscos e garantir que as funcionalidades sejam preservadas:

1. **Fase 1**: Correção de erros críticos (tipos `any`)
2. **Fase 2**: Limpeza de código não utilizado
3. **Fase 3**: Correção de hooks React
4. **Fase 4**: Otimizações finais e configuração

### Princípios de Design

- **Preservação de Funcionalidade**: Todas as correções devem manter o comportamento existente
- **Tipagem Progressiva**: Implementar tipos específicos sem quebrar a compatibilidade
- **Limpeza Conservadora**: Remover apenas código comprovadamente não utilizado
- **Validação Contínua**: Testar após cada correção significativa

## Componentes e Interfaces

### 1. Sistema de Tipos

#### Interfaces Necessárias

```typescript
// src/types/ui-components.ts
export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: unknown;
}

export interface TableColumn<T = unknown> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MetricData {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
}
```

#### Tipos Utilitários

```typescript
// src/types/common.ts
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;
export type ComponentProps<T = Record<string, unknown>> = T & {
  className?: string;
  children?: React.ReactNode;
};
```

### 2. Correções por Categoria

#### 2.1 Correção de Tipos `any`

**Estratégia**: Substituir todos os usos de `any` por tipos específicos ou genéricos.

```typescript
// Antes
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// Depois
function processData<T extends { value: unknown }>(data: T[]): unknown[] {
  return data.map((item) => item.value);
}
```

#### 2.2 Limpeza de Imports

**Estratégia**: Análise automatizada e remoção conservadora.

```typescript
// Ferramenta de análise
const unusedImports = [
  'LineChart', 'Upload', 'Settings', 'Minus', // advanced-filters.tsx
  'useMemo', 'ReferenceArea', 'DropdownMenuLabel', // analytics-dashboard.tsx
  // ... outros imports não utilizados
];
```

#### 2.3 Correção de Hooks

**Estratégia**: Análise de dependências e correção sistemática.

```typescript
// Antes
useEffect(() => {
  fetchData();
}, []); // Missing dependency: fetchData

// Depois
const fetchData = useCallback(async () => {
  // implementation
}, [dependency1, dependency2]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

## Modelos de Dados

### Estrutura de Correções

```typescript
interface CorrectionsMap {
  file: string;
  errors: {
    type: 'no-explicit-any' | 'no-unused-vars' | 'exhaustive-deps';
    line: number;
    column: number;
    message: string;
    fix: string;
  }[];
  warnings: {
    type: string;
    line: number;
    message: string;
    action: 'remove' | 'fix' | 'ignore';
  }[];
}
```

### Mapeamento de Tipos

```typescript
// Mapeamento de tipos comuns para substituir 'any'
const TYPE_MAPPINGS = {
  'event handlers': 'React.MouseEvent<HTMLElement>',
  'form data': 'Record<string, unknown>',
  'api response': 'ApiResponse<T>',
  'chart data': 'ChartDataPoint[]',
  'table data': 'TableRow[]',
  'filter config': 'FilterConfig',
};
```

## Estratégia de Implementação

### Fase 1: Correção de Erros Críticos (Semana 1)

#### Arquivos Prioritários
1. `components/ui/advanced-filters.tsx` - 3 erros `any`
2. `components/ui/analytics-dashboard.tsx` - 4 erros `any`
3. `components/ui/audit-system.tsx` - 4 erros `any`
4. `components/ui/data-table.tsx` - 12 erros `any`
5. `components/ui/integration-system.tsx` - 15 erros `any`

#### Abordagem por Arquivo

**advanced-filters.tsx**:
```typescript
// Linha 261: Unexpected any
// Antes
const handleFilterChange = (field: string, value: any, operator: any) => {

// Depois
const handleFilterChange = (
  field: string, 
  value: unknown, 
  operator: FilterOperator
) => {
```

**data-table.tsx**:
```typescript
// Múltiplos usos de any em funções de tabela
interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
}
```

### Fase 2: Limpeza de Código (Semana 2)

#### Estratégia de Remoção

1. **Imports Não Utilizados**: Remoção automática via script
2. **Variáveis Não Utilizadas**: Análise manual e remoção
3. **Funções Não Utilizadas**: Verificação de uso e remoção/marcação

#### Script de Limpeza

```typescript
// scripts/clean-unused-imports.ts
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles('components/**/*.tsx');

sourceFiles.forEach(file => {
  file.fixUnusedIdentifiers();
  file.saveSync();
});
```

### Fase 3: Correção de Hooks (Semana 3)

#### Padrões de Correção

**useEffect com dependências faltando**:
```typescript
// Antes
useEffect(() => {
  if (data) {
    processData(data);
  }
}, []); // Missing: data, processData

// Depois
const processData = useCallback((data: DataType) => {
  // implementation
}, []);

useEffect(() => {
  if (data) {
    processData(data);
  }
}, [data, processData]);
```

**useMemo com dependências faltando**:
```typescript
// Antes
const processedData = useMemo(() => {
  return data.map(item => transform(item));
}, []); // Missing: data, transform

// Depois
const processedData = useMemo(() => {
  return data.map(item => transform(item));
}, [data, transform]);
```

### Fase 4: Otimizações e Configuração (Semana 4)

#### Ajustes na Configuração ESLint

```json
// .eslintrc.json - Ajustes necessários
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_" 
    }],
    "react-hooks/exhaustive-deps": "warn"
  },
  "overrides": [
    {
      "files": ["**/*.test.tsx", "**/*.stories.tsx"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

## Tratamento de Erros

### Estratégias de Fallback

1. **Tipos Genéricos**: Quando o tipo exato não pode ser determinado
2. **Union Types**: Para valores que podem ter múltiplos tipos
3. **Type Guards**: Para validação de tipos em runtime
4. **Unknown Type**: Como alternativa segura ao `any`

### Validação de Tipos

```typescript
// Type guards para validação segura
function isValidData(data: unknown): data is DataType {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'name' in data;
}

// Uso seguro
function processData(data: unknown) {
  if (isValidData(data)) {
    // data é agora do tipo DataType
    return data.name;
  }
  throw new Error('Invalid data format');
}
```

## Estratégia de Testes

### Validação de Correções

1. **Build Test**: Verificar se `npm run build` executa sem erros
2. **Type Check**: Executar `npm run type-check` após cada correção
3. **Unit Tests**: Garantir que os testes existentes continuem passando
4. **Integration Tests**: Verificar funcionalidades críticas

### Testes Automatizados

```typescript
// scripts/validate-corrections.ts
import { execSync } from 'child_process';

const validationSteps = [
  'npm run type-check',
  'npm run lint',
  'npm run test',
  'npm run build'
];

validationSteps.forEach(step => {
  try {
    execSync(step, { stdio: 'inherit' });
    console.log(`✅ ${step} passed`);
  } catch (error) {
    console.error(`❌ ${step} failed`);
    process.exit(1);
  }
});
```

## Monitoramento e Métricas

### KPIs de Sucesso

- **Erros ESLint**: 0 erros críticos
- **Warnings ESLint**: Redução de 90%+ dos warnings
- **Build Time**: Manter ou melhorar tempo de build
- **Bundle Size**: Não aumentar significativamente
- **Test Coverage**: Manter cobertura atual

### Ferramentas de Monitoramento

```typescript
// scripts/eslint-metrics.ts
interface ESLintMetrics {
  totalErrors: number;
  totalWarnings: number;
  errorsByType: Record<string, number>;
  warningsByType: Record<string, number>;
  filesCorrected: string[];
}

function generateMetrics(): ESLintMetrics {
  // Implementation
}
```

## Documentação das Correções

### Changelog das Correções

```markdown
## Correções Realizadas

### Tipos `any` Substituídos
- `advanced-filters.tsx`: 3 ocorrências → tipos específicos
- `data-table.tsx`: 12 ocorrências → interfaces genéricas
- `integration-system.tsx`: 15 ocorrências → union types

### Imports Removidos
- Total de imports não utilizados removidos: 150+
- Redução estimada no bundle: 5-10%

### Hooks Corrigidos
- `useEffect` com dependências faltando: 15 correções
- `useMemo` com dependências faltando: 8 correções
```

### Guia de Manutenção

```typescript
// Padrões estabelecidos para futuras implementações

// ✅ Bom: Tipos específicos
interface ComponentProps {
  data: DataType[];
  onSelect: (item: DataType) => void;
}

// ❌ Evitar: Tipos any
interface ComponentProps {
  data: any[];
  onSelect: (item: any) => void;
}

// ✅ Bom: Hooks com dependências corretas
const memoizedValue = useMemo(() => {
  return processData(data);
}, [data]);

// ❌ Evitar: Dependências faltando
const memoizedValue = useMemo(() => {
  return processData(data);
}, []);
```

## Riscos e Mitigações

### Riscos Identificados

1. **Quebra de Funcionalidade**: Correções podem alterar comportamento
   - **Mitigação**: Testes extensivos após cada correção

2. **Tipos Muito Restritivos**: Podem causar erros em casos edge
   - **Mitigação**: Usar union types e tipos opcionais quando necessário

3. **Performance**: Correções podem impactar performance
   - **Mitigação**: Monitoramento de métricas de build e runtime

4. **Regressões**: Mudanças podem introduzir novos bugs
   - **Mitigação**: Code review rigoroso e testes automatizados

### Plano de Rollback

```typescript
// Estratégia de rollback por arquivo
const rollbackPlan = {
  'advanced-filters.tsx': 'commit-hash-before-changes',
  'data-table.tsx': 'commit-hash-before-changes',
  // ... outros arquivos
};
```

## Conclusão

Esta estratégia de correção garante uma abordagem sistemática e segura para resolver todos os problemas de ESLint identificados, mantendo a qualidade e funcionalidade do código enquanto melhora a manutenibilidade e type safety do projeto Koerner 360.