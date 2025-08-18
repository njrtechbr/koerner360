---
inclusion: always
---

# Contexto do Produto & Diretrizes de Desenvolvimento

## Visão Geral do Koerner 360

Koerner 360 é um sistema de feedback 360 graus e avaliação de desempenho com controle de acesso baseado em funções, gamificação e registro de auditoria abrangente.

## Hierarquia de Funções de Usuário & Permissões

Ao implementar recursos, sempre respeite esta hierarquia de permissões:

1. **Admin** (mais alto): Acesso completo ao sistema, gerenciamento de usuários, configuração
2. **Supervisor**: Gerencia atendentes, revisa avaliações, supervisão de equipe
3. **Atendente**: Recebe avaliações, visualiza métricas pessoais, participação na gamificação
4. **Consultor** (limitado): Usuários externos com acesso específico a avaliações

## Modelos de Domínio Principais

- **Usuários**: Sistema multi-função com relacionamentos hierárquicos
- **Avaliações**: Feedback 360° com classificações, comentários, opções anônimas
- **Gamificação**: Pontos, conquistas, rankings, métricas de desempenho
- **Logs de Auditoria**: Rastrear todas as ações do sistema para conformidade

## Convenções de Desenvolvimento

### Autenticação & Autorização
- Sempre verificar funções de usuário antes de conceder acesso a recursos
- Usar gerenciamento de sessão NextAuth.js consistentemente
- Implementar middleware adequado para proteção de rotas
- Validar permissões tanto no lado cliente quanto servidor

### Padrões de Acesso a Dados
- Usar Prisma ORM para todas as operações de banco de dados
- Implementar tratamento adequado de erros para consultas de banco de dados
- Seguir o padrão estabelecido de registro de auditoria para mudanças de dados
- Respeitar hierarquia de usuário ao filtrar acesso a dados

### Diretrizes de UI/UX
- Manter navegação consistente baseada em funções
- Usar componentes shadcn/ui para consistência
- Implementar estados de carregamento adequados e limites de erro
- Seguir padrões de acessibilidade para todas as interações do usuário

### Design de API
- Estruturar rotas de API por domínio (usuários, avaliações, gamificação)
- Usar códigos de status HTTP adequados e respostas de erro
- Implementar validação de requisição com esquemas Zod
- Seguir convenções RESTful onde aplicável

## Regras de Negócio

- Supervisores podem apenas gerenciar seus atendentes designados
- Avaliações devem manter anonimato quando especificado
- Pontos de gamificação devem ser calculados consistentemente
- Todas as ações significativas devem ser registradas em auditoria
- Mudanças de função de usuário requerem privilégios de admin

## Contexto de Migração

O sistema migrou do Supabase, então:
- Manter compatibilidade com estruturas de dados existentes
- Usar scripts de migração em `/scripts` para transformações de dados
- Preservar continuidade da trilha de auditoria durante atualizações
