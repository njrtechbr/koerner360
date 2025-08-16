# Criação de Usuário Baseado em Dados do Atendente

## 📋 Visão Geral

Este documento descreve a funcionalidade de criação automática de usuários do sistema baseado nos dados cadastrados dos atendentes, permitindo que os atendentes tenham acesso ao sistema Koerner 360.

## 🎯 Objetivo

Permitir que supervisores e administradores criem contas de usuário para atendentes de forma rápida e eficiente, utilizando os dados já cadastrados no sistema, garantindo que os atendentes possam acessar suas próprias avaliações e feedbacks.

## 🔧 Funcionalidade

### Localização
- **Página**: `/atendentes` (Lista de Atendentes)
- **Componente**: Botão "Criar Usuário" na linha de cada atendente
- **Visibilidade**: Apenas para usuários com perfil `admin` ou `supervisor`

### Comportamento do Botão

#### Estados do Botão
1. **Atendente sem usuário**: Botão "Criar Usuário" habilitado
2. **Atendente com usuário**: Botão "Usuário Criado" desabilitado ou ícone de confirmação
3. **Dados incompletos**: Botão desabilitado com tooltip explicativo

#### Validações Pré-Criação
Antes de permitir a criação do usuário, o sistema deve validar:
- ✅ **Email válido**: Atendente deve ter email cadastrado
- ✅ **Email único**: Email não pode estar em uso por outro usuário
- ✅ **Nome completo**: Atendente deve ter nome cadastrado
- ✅ **Status ativo**: Atendente deve estar ativo no sistema

## 🔄 Fluxo de Criação

### 1. Clique no Botão
```
Usuário clica em "Criar Usuário"
↓
Sistema valida dados do atendente
↓
Exibe modal de confirmação
```

### 2. Modal de Confirmação
**Título**: "Criar Usuário para Atendente"

**Conteúdo**:
- Nome do atendente
- Email que será usado
- Tipo de usuário: `attendant`
- Senha temporária gerada automaticamente

**Ações**:
- Botão "Cancelar"
- Botão "Criar Usuário"

### 3. Processo de Criação
```
Usuário confirma criação
↓
Sistema gera senha temporária
↓
Cria registro na tabela usuarios
↓
Vincula usuario_id ao atendente
↓
Exibe modal com credenciais
↓
Envia email com credenciais (opcional)
```

### 4. Modal de Sucesso
**Título**: "Usuário Criado com Sucesso!"

**Conteúdo**:
- ✅ Usuário criado para: [Nome do Atendente]
- 📧 Email: [email@exemplo.com]
- 🔑 Senha temporária: [senha-gerada]
- ⚠️ **Importante**: O atendente deve alterar a senha no primeiro acesso

**Texto para Copiar**:
Um campo de texto formatado contendo as credenciais completas para facilitar o compartilhamento:
```
🔐 CREDENCIAIS DE ACESSO - KOERNER 360

Olá [Nome do Atendente],

Seu acesso ao sistema Koerner 360 foi criado com sucesso!

📧 Email: [email@exemplo.com]
🔑 Senha temporária: [senha-gerada]
🌐 Link de acesso: [URL do sistema]

⚠️ IMPORTANTE:
- Esta é uma senha temporária
- Você DEVE alterar a senha no primeiro acesso
- Mantenha suas credenciais em segurança

Em caso de dúvidas, entre em contato com o suporte.

Equipe Koerner 360
```

**Ações**:
- Botão "Copiar Credenciais" (copia o texto formatado)
- Botão "Copiar Apenas Dados" (copia só email e senha)
- Botão "Enviar por Email" (se configurado)
- Botão "Fechar"

## 🗄️ Estrutura de Dados

### Alterações no Schema Prisma

```prisma
model Atendente {
  id            String   @id @default(cuid())
  nome          String
  email         String?  @unique
  telefone      String?
  cargo         String?
  departamento  String?
  ativo         Boolean  @default(true)
  usuario_id    String?  @unique  // Nova coluna
  usuario       Usuario? @relation(fields: [usuario_id], references: [id])
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt
  
  @@map("atendentes")
}

model Usuario {
  id            String     @id @default(cuid())
  nome          String
  email         String     @unique
  senha_hash    String
  tipo          TipoUsuario
  ativo         Boolean    @default(true)
  senha_temporaria Boolean @default(false)  // Nova coluna
  atendente     Atendente? // Relação inversa
  criado_em     DateTime   @default(now())
  atualizado_em DateTime   @updatedAt
  
  @@map("usuarios")
}
```

### Migration Necessária
```sql
-- Adicionar coluna usuario_id na tabela atendentes
ALTER TABLE atendentes ADD COLUMN usuario_id TEXT UNIQUE;

-- Adicionar coluna senha_temporaria na tabela usuarios
ALTER TABLE usuarios ADD COLUMN senha_temporaria BOOLEAN DEFAULT false;

-- Adicionar foreign key
ALTER TABLE atendentes ADD CONSTRAINT atendentes_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
```

## 🔧 Implementação Técnica

### 1. API Route
**Arquivo**: `src/app/api/atendentes/[id]/criar-usuario/route.ts`

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validar permissões (admin ou supervisor)
    if (!session || !['admin', 'supervisor'].includes(session.user.tipo)) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const atendenteId = params.id;
    
    // Buscar atendente
    const atendente = await prisma.atendente.findUnique({
      where: { id: atendenteId },
      include: { usuario: true }
    });

    // Validações
    if (!atendente) {
      return NextResponse.json(
        { success: false, error: 'Atendente não encontrado' },
        { status: 404 }
      );
    }

    if (atendente.usuario_id) {
      return NextResponse.json(
        { success: false, error: 'Atendente já possui usuário' },
        { status: 400 }
      );
    }

    if (!atendente.email) {
      return NextResponse.json(
        { success: false, error: 'Atendente não possui email cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se email já está em uso
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: atendente.email }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso por outro usuário' },
        { status: 400 }
      );
    }

    // Gerar senha temporária
    const senhaTemporaria = gerarSenhaTemporaria();
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    // Criar usuário em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const novoUsuario = await tx.usuario.create({
        data: {
          nome: atendente.nome,
          email: atendente.email,
          senha_hash: senhaHash,
          tipo: 'attendant',
          senha_temporaria: true,
          ativo: true
        }
      });

      // Vincular usuário ao atendente
      await tx.atendente.update({
        where: { id: atendenteId },
        data: { usuario_id: novoUsuario.id }
      });

      return { usuario: novoUsuario, senhaTemporaria };
    });

    return NextResponse.json({
      success: true,
      data: {
        usuario: {
          id: resultado.usuario.id,
          nome: resultado.usuario.nome,
          email: resultado.usuario.email,
          tipo: resultado.usuario.tipo
        },
        credenciais: {
          email: resultado.usuario.email,
          senhaTemporaria: resultado.senhaTemporaria
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao criar usuário para atendente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### 2. Função Utilitária
**Arquivo**: `src/lib/senha-utils.ts`

```typescript
/**
 * Gera uma senha temporária segura
 * @returns Senha temporária de 8 caracteres
 */
export function gerarSenhaTemporaria(): string {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let senha = '';
  
  for (let i = 0; i < 8; i++) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return senha;
}

/**
 * Valida se um atendente pode ter usuário criado
 */
export function validarCriacaoUsuario(atendente: Atendente): {
  valido: boolean;
  motivo?: string;
} {
  if (!atendente.ativo) {
    return { valido: false, motivo: 'Atendente inativo' };
  }
  
  if (!atendente.email) {
    return { valido: false, motivo: 'Email não cadastrado' };
  }
  
  if (atendente.usuario_id) {
    return { valido: false, motivo: 'Usuário já existe' };
  }
  
  return { valido: true };
}
```

### 3. Componente do Botão
**Arquivo**: `src/components/atendentes/botao-criar-usuario.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ModalCriarUsuario } from './modal-criar-usuario';
import { ModalCredenciais } from './modal-credenciais';
import type { Atendente } from '@/types/atendente';

interface BotaoCriarUsuarioProps {
  atendente: Atendente & { usuario?: { id: string } | null };
  onUsuarioCriado?: () => void;
}

export function BotaoCriarUsuario({ atendente, onUsuarioCriado }: BotaoCriarUsuarioProps) {
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [modalCredenciais, setModalCredenciais] = useState(false);
  const [credenciais, setCredenciais] = useState<{ email: string; senhaTemporaria: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Verificar se pode criar usuário
  const podeCrearUsuario = atendente.ativo && atendente.email && !atendente.usuario;
  const jaTemUsuario = !!atendente.usuario;

  const handleCriarUsuario = async () => {
    setCarregando(true);
    
    try {
      const response = await fetch(`/api/atendentes/${atendente.id}/criar-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setCredenciais(data.data.credenciais);
        setModalConfirmacao(false);
        setModalCredenciais(true);
        onUsuarioCriado?.();
        
        toast({
          title: 'Usuário criado com sucesso!',
          description: `Usuário criado para ${atendente.nome}`,
        });
      } else {
        toast({
          title: 'Erro ao criar usuário',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    } finally {
      setCarregando(false);
    }
  };

  if (jaTemUsuario) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Check className="h-4 w-4 mr-2" />
        Usuário Criado
      </Button>
    );
  }

  if (!podeCrearUsuario) {
    const motivo = !atendente.ativo 
      ? 'Atendente inativo' 
      : !atendente.email 
      ? 'Email não cadastrado'
      : 'Dados incompletos';

    return (
      <Button variant="outline" size="sm" disabled title={motivo}>
        <AlertCircle className="h-4 w-4 mr-2" />
        Criar Usuário
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => setModalConfirmacao(true)}
        disabled={carregando}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Criar Usuário
      </Button>

      <ModalCriarUsuario
        aberto={modalConfirmacao}
        onFechar={() => setModalConfirmacao(false)}
        atendente={atendente}
        onConfirmar={handleCriarUsuario}
        carregando={carregando}
      />

      {credenciais && (
        <ModalCredenciais
          aberto={modalCredenciais}
          onFechar={() => setModalCredenciais(false)}
          credenciais={credenciais}
          nomeAtendente={atendente.nome}
        />
      )}
    </>
  );
}
```

### 4. Componente Modal de Credenciais
**Arquivo**: `src/components/atendentes/modal-credenciais.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Mail, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ModalCredenciaisProps {
  aberto: boolean;
  onFechar: () => void;
  credenciais: { email: string; senhaTemporaria: string };
  nomeAtendente: string;
}

export function ModalCredenciais({ aberto, onFechar, credenciais, nomeAtendente }: ModalCredenciaisProps) {
  const [copiado, setCopiado] = useState<'completo' | 'simples' | null>(null);

  // Texto formatado completo para copiar
  const textoCompleto = `🔐 CREDENCIAIS DE ACESSO - KOERNER 360

Olá ${nomeAtendente},

Seu acesso ao sistema Koerner 360 foi criado com sucesso!

📧 Email: ${credenciais.email}
🔑 Senha temporária: ${credenciais.senhaTemporaria}
🌐 Link de acesso: ${typeof window !== 'undefined' ? window.location.origin : '[URL do sistema]'}

⚠️ IMPORTANTE:
- Esta é uma senha temporária
- Você DEVE alterar a senha no primeiro acesso
- Mantenha suas credenciais em segurança

Em caso de dúvidas, entre em contato com o suporte.

Equipe Koerner 360`;

  // Texto simples apenas com dados
  const textoSimples = `Email: ${credenciais.email}\nSenha: ${credenciais.senhaTemporaria}`;

  const copiarTexto = async (texto: string, tipo: 'completo' | 'simples') => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      
      toast({
        title: 'Credenciais copiadas!',
        description: tipo === 'completo' 
          ? 'Texto completo copiado para a área de transferência'
          : 'Email e senha copiados para a área de transferência'
      });
      
      // Reset do estado após 2 segundos
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar para a área de transferência',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Usuário Criado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações básicas */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-2">
              <p><strong>✅ Usuário criado para:</strong> {nomeAtendente}</p>
              <p><strong>📧 Email:</strong> {credenciais.email}</p>
              <p><strong>🔑 Senha temporária:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{credenciais.senhaTemporaria}</code></p>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>⚠️ Importante:</strong> O atendente deve alterar a senha no primeiro acesso ao sistema.
            </p>
          </div>

          {/* Texto para copiar */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Texto formatado para compartilhar:</label>
            <Textarea 
              value={textoCompleto}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button 
              onClick={() => copiarTexto(textoCompleto, 'completo')}
              className="flex items-center gap-2"
              variant={copiado === 'completo' ? 'secondary' : 'default'}
            >
              {copiado === 'completo' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiado === 'completo' ? 'Copiado!' : 'Copiar Texto Completo'}
            </Button>
            
            <Button 
              onClick={() => copiarTexto(textoSimples, 'simples')}
              variant={copiado === 'simples' ? 'secondary' : 'outline'}
              className="flex items-center gap-2"
            >
              {copiado === 'simples' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiado === 'simples' ? 'Copiado!' : 'Copiar Apenas Dados'}
            </Button>
            
            {/* Botão de email (opcional - pode ser implementado futuramente) */}
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Mail className="h-4 w-4" />
              Enviar por Email
            </Button>
            
            <Button variant="ghost" onClick={onFechar} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 🔒 Segurança

### Validações de Segurança
1. **Autorização**: Apenas `admin` e `supervisor` podem criar usuários
2. **Validação de dados**: Email único e válido
3. **Senha segura**: Geração automática de senha temporária
4. **Hash de senha**: Uso do bcryptjs com salt 12
5. **Transação**: Criação atômica de usuário e vinculação

### Auditoria
- Log de criação de usuários
- Timestamp de criação
- Usuário responsável pela criação
- Status de senha temporária

## 📧 Notificações (Opcional)

### Email de Boas-vindas
Pode ser implementado um sistema de envio de email com:
- Credenciais de acesso
- Link para primeiro login
- Instruções de alteração de senha
- Informações sobre o sistema

## 🧪 Testes

### Cenários de Teste
1. ✅ Criar usuário com dados válidos
2. ❌ Tentar criar usuário sem permissão
3. ❌ Tentar criar usuário para atendente inativo
4. ❌ Tentar criar usuário sem email
5. ❌ Tentar criar usuário com email duplicado
6. ❌ Tentar criar usuário já existente
7. ✅ Validar geração de senha temporária
8. ✅ Validar vinculação atendente-usuário

## 📋 Checklist de Implementação

### Backend
- [ ] Criar migration para adicionar `usuario_id` em atendentes
- [ ] Criar migration para adicionar `senha_temporaria` em usuarios
- [ ] Implementar API route `/api/atendentes/[id]/criar-usuario`
- [ ] Criar função `gerarSenhaTemporaria()`
- [ ] Criar função `validarCriacaoUsuario()`
- [ ] Implementar validações de segurança
- [ ] Adicionar logs de auditoria

### Frontend
- [ ] Criar componente `BotaoCriarUsuario`
- [ ] Criar componente `ModalCriarUsuario`
- [ ] Criar componente `ModalCredenciais`
- [ ] Integrar botão na lista de atendentes
- [ ] Implementar estados visuais do botão
- [ ] Adicionar tooltips explicativos
- [ ] Implementar feedback de sucesso/erro

### Testes
- [ ] Testes unitários da API
- [ ] Testes de integração
- [ ] Testes de componentes React
- [ ] Testes de validação de dados
- [ ] Testes de permissões

### Documentação
- [ ] Atualizar documentação da API
- [ ] Documentar novos componentes
- [ ] Atualizar guia do usuário
- [ ] Documentar processo de criação de usuários

## ⚠️ Pré-requisitos

Antes de implementar a funcionalidade de criação de usuários para atendentes, é necessário refatorar a interface de gerenciamento de atendentes para utilizar modais:

### Modais Necessários
1. **Modal Adicionar Atendente** - Substituir página `/atendentes/novo` por modal
2. **Modal Editar Atendente** - Substituir página `/atendentes/[id]/editar` por modal
3. **Modal Visualizar Atendente** - Criar modal para visualização detalhada
4. **Modal Excluir Atendente** - Criar modal de confirmação para exclusão

### Benefícios da Refatoração
- **UX Melhorada**: Navegação mais fluida sem mudança de página
- **Performance**: Carregamento mais rápido das ações
- **Consistência**: Padrão unificado de interface
- **Preparação**: Base sólida para o modal de criação de usuários

### Componentes a Criar
```
src/components/atendentes/
├── modal-adicionar-atendente.tsx
├── modal-editar-atendente.tsx
├── modal-visualizar-atendente.tsx
├── modal-excluir-atendente.tsx
└── modal-criar-usuario.tsx (futuro)
```

## 🚀 Próximos Passos

### Fase 1: Refatoração para Modais (Pré-requisito)
1. **Criar Modal Adicionar Atendente** - Formulário completo em modal
2. **Criar Modal Editar Atendente** - Formulário de edição em modal
3. **Criar Modal Visualizar Atendente** - Exibição detalhada em modal
4. **Criar Modal Excluir Atendente** - Confirmação de exclusão
5. **Atualizar Lista de Atendentes** - Integrar todos os modais
6. **Remover páginas antigas** - `/atendentes/novo` e `/atendentes/[id]/editar`
7. **Testar funcionalidades** - Garantir que tudo funciona corretamente

### Fase 2: Implementação da Criação de Usuários
1. **Implementar migration** para adicionar colunas necessárias
2. **Desenvolver API route** para criação de usuários
3. **Criar componentes React** para interface
4. **Integrar na lista** de atendentes
5. **Implementar testes** unitários e de integração
6. **Documentar funcionalidade** para usuários finais
7. **Deploy e validação** em ambiente de teste

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Autor**: Equipe de Desenvolvimento Koerner 360