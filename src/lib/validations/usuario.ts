/**
 * Validações Zod para o módulo de usuários
 * Implementa o padrão Model do MCP (Model-Controller-Presenter)
 */

import { z } from 'zod';

// Enum para tipos de usuário
export const TipoUsuarioEnum = z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR'], {
  errorMap: () => ({ message: 'Tipo de usuário inválido' })
});

// Schema base para usuário
export const usuarioBaseSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .transform(val => val.trim()),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .transform(val => val.trim()),
  
  tipoUsuario: TipoUsuarioEnum,
  
  ativo: z.boolean().default(true),
  
  supervisorId: z
    .string()
    .uuid('ID do supervisor deve ser um UUID válido')
    .optional()
    .nullable()
});

// Schema para criação de usuário
export const criarUsuarioSchema = usuarioBaseSchema.extend({
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    ),
  
  confirmarSenha: z.string()
}).refine(
  (data) => data.senha === data.confirmarSenha,
  {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha']
  }
).refine(
  (data) => {
    // Supervisor deve ter supervisorId null
    if (data.tipoUsuario === 'SUPERVISOR') {
      return !data.supervisorId;
    }
    // Atendente deve ter supervisorId
    if (data.tipoUsuario === 'ATENDENTE') {
      return !!data.supervisorId;
    }
    // Admin e Consultor não precisam de supervisor
    return true;
  },
  {
    message: 'Configuração de supervisor inválida para o tipo de usuário',
    path: ['supervisorId']
  }
);

// Schema para atualização de usuário
export const atualizarUsuarioSchema = usuarioBaseSchema.extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    )
    .optional(),
  
  confirmarSenha: z.string().optional()
}).refine(
  (data) => {
    // Se senha foi fornecida, confirmarSenha é obrigatória
    if (data.senha && !data.confirmarSenha) {
      return false;
    }
    // Se ambas foram fornecidas, devem coincidir
    if (data.senha && data.confirmarSenha) {
      return data.senha === data.confirmarSenha;
    }
    return true;
  },
  {
    message: 'Senhas não coincidem',
    path: ['confirmarSenha']
  }
).refine(
  (data) => {
    // Validação de supervisor baseada no tipo
    if (data.tipoUsuario === 'SUPERVISOR') {
      return !data.supervisorId;
    }
    if (data.tipoUsuario === 'ATENDENTE') {
      return !!data.supervisorId;
    }
    return true;
  },
  {
    message: 'Configuração de supervisor inválida para o tipo de usuário',
    path: ['supervisorId']
  }
);

// Schema para filtros de usuário
export const filtrosUsuarioSchema = z.object({
  busca: z.string().max(255).optional(),
  tipoUsuario: TipoUsuarioEnum.optional(),
  ativo: z.boolean().optional(),
  supervisorId: z.string().uuid().optional().nullable(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  ordenacao: z.enum(['nome', 'email', 'tipoUsuario', 'ativo', 'criadoEm']).default('nome'),
  direcao: z.enum(['asc', 'desc']).default('asc')
});

// Schema para parâmetros de busca da URL
export const searchParamsUsuarioSchema = z.object({
  search: z.string().optional(),
  tipoUsuario: z.string().optional(),
  ativo: z.string().optional(),
  supervisorId: z.string().optional(),
  pagina: z.string().optional(),
  limite: z.string().optional(),
  ordenacao: z.string().optional(),
  direcao: z.string().optional()
}).transform((data) => {
  return {
    busca: data.search,
    tipoUsuario: data.tipoUsuario as any,
    ativo: data.ativo ? data.ativo === 'true' : undefined,
    supervisorId: data.supervisorId,
    pagina: data.pagina ? parseInt(data.pagina) : 1,
    limite: data.limite ? parseInt(data.limite) : 10,
    ordenacao: data.ordenacao as any || 'nome',
    direcao: data.direcao as any || 'asc'
  };
});

// Schema para resposta de usuário (sem dados sensíveis)
export const usuarioResponseSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string().email(),
  tipoUsuario: TipoUsuarioEnum,
  ativo: z.boolean(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
  supervisorId: z.string().uuid().nullable(),
  supervisor: z.object({
    id: z.string().uuid(),
    nome: z.string()
  }).nullable().optional(),
  _count: z.object({
    supervisoes: z.number(),
    avaliacoesFeitas: z.number(),
    avaliacoesRecebidas: z.number()
  }).optional()
});

// Tipos TypeScript derivados dos schemas
export type TipoUsuario = z.infer<typeof TipoUsuarioEnum>;
export type UsuarioBase = z.infer<typeof usuarioBaseSchema>;
export type CriarUsuarioData = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioData = z.infer<typeof atualizarUsuarioSchema>;
export type FiltrosUsuario = z.infer<typeof filtrosUsuarioSchema>;
export type SearchParamsUsuario = z.infer<typeof searchParamsUsuarioSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;

// Utilitários de validação
export const validarCriarUsuario = (data: unknown) => {
  return criarUsuarioSchema.safeParse(data);
};

export const validarAtualizarUsuario = (data: unknown) => {
  return atualizarUsuarioSchema.safeParse(data);
};

export const validarFiltrosUsuario = (data: unknown) => {
  return filtrosUsuarioSchema.safeParse(data);
};

export const validarSearchParamsUsuario = (data: unknown) => {
  return searchParamsUsuarioSchema.safeParse(data);
};

// Constantes úteis
export const TIPOS_USUARIO = ['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR'] as const;
export const COLUNAS_ORDENACAO = ['nome', 'email', 'tipoUsuario', 'ativo', 'criadoEm'] as const;
export const DIRECOES_ORDENACAO = ['asc', 'desc'] as const;

// Validações de regras de negócio
export const validarRegrasNegocio = {
  podeGerenciarUsuario: (tipoUsuarioLogado: TipoUsuario, tipoUsuarioAlvo: TipoUsuario): boolean => {
    if (tipoUsuarioLogado === 'ADMIN') return true;
    if (tipoUsuarioLogado === 'SUPERVISOR') {
      return ['ATENDENTE', 'CONSULTOR'].includes(tipoUsuarioAlvo);
    }
    return false;
  },
  
  podeEditarUsuario: (tipoUsuarioLogado: TipoUsuario, tipoUsuarioAlvo: TipoUsuario): boolean => {
    if (tipoUsuarioLogado === 'ADMIN') return true;
    if (tipoUsuarioLogado === 'SUPERVISOR') {
      return tipoUsuarioAlvo === 'ATENDENTE';
    }
    return false;
  },
  
  podeDesativarUsuario: (tipoUsuarioLogado: TipoUsuario, tipoUsuarioAlvo: TipoUsuario): boolean => {
    if (tipoUsuarioLogado === 'ADMIN') return true;
    if (tipoUsuarioLogado === 'SUPERVISOR') {
      return tipoUsuarioAlvo === 'ATENDENTE';
    }
    return false;
  }
};