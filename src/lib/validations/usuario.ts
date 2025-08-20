/**
 * Validações Zod para o módulo de usuários
 * Implementa o padrão Model do MCP (Model-Controller-Presenter)
 */

import { z } from 'zod';

// Enum para tipos de usuário
export const UserTypeEnum = z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR']);

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
  
  userType: UserTypeEnum,
  
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
    if (data.userType === 'SUPERVISOR') {
      return !data.supervisorId;
    }
    // Atendente deve ter supervisorId
    if (data.userType === 'ATENDENTE') {
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
    if (data.userType === 'SUPERVISOR') {
      return !data.supervisorId;
    }
    if (data.userType === 'ATENDENTE') {
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
  userType: UserTypeEnum.optional(),
  ativo: z.boolean().optional(),
  supervisorId: z.string().uuid().optional().nullable(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  ordenacao: z.enum(['nome', 'email', 'userType', 'ativo', 'criadoEm']).default('nome'),
  direcao: z.enum(['asc', 'desc']).default('asc')
});

// Schema para parâmetros de busca da URL
export const searchParamsUsuarioSchema = z.object({
  search: z.string().optional(),
  userType: z.string().optional(),
  ativo: z.string().optional(),
  supervisorId: z.string().optional(),
  pagina: z.string().optional(),
  limite: z.string().optional(),
  ordenacao: z.string().optional(),
  direcao: z.string().optional()
}).transform((data) => {
  return {
    busca: data.search,
    userType: data.userType as any,
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
  userType: UserTypeEnum,
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

// Schema para resposta de mutação (criação/atualização/deleção)
export const mutarUsuarioResponseSchema = z.object({
  usuario: usuarioResponseSchema,
  message: z.string(),
});

// Schema para estatísticas de usuários
export const estatisticasUsuariosSchema = z.object({
  total: z.number(),
  ativos: z.number(),
  inativos: z.number(),
  porTipo: z.record(z.enum(UserTypeEnum.options), z.number()),
});

// Schema para supervisores disponíveis
export const supervisorDisponivelSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

// Schema para validação de e-mail único
export const validacaoEmailUnicoSchema = z.object({
  isUnico: z.boolean(),
  usuarioId: z.string().optional().nullable(),
});


// Tipos TypeScript derivados dos schemas
export type UserType = z.infer<typeof UserTypeEnum>;
export type UsuarioBase = z.infer<typeof usuarioBaseSchema>;
export type CriarUsuarioData = z.infer<typeof criarUsuarioSchema>;
export type AtualizarUsuarioData = z.infer<typeof atualizarUsuarioSchema>;
export type FiltrosUsuario = z.infer<typeof filtrosUsuarioSchema>;
export type SearchParamsUsuario = z.infer<typeof searchParamsUsuarioSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
export type MutarUsuarioResponse = z.infer<typeof mutarUsuarioResponseSchema>;
export type EstatisticasUsuarios = z.infer<typeof estatisticasUsuariosSchema>;
export type SupervisorDisponivel = z.infer<typeof supervisorDisponivelSchema>;
export type ValidacaoEmailUnico = z.infer<typeof validacaoEmailUnicoSchema>;

// Alias de tipos para compatibilidade
export type Usuario = UsuarioResponse;
export type Supervisor = SupervisorDisponivel;
export type ObterUsuarioResponse = UsuarioResponse;
export type AtualizarUsuarioRequest = AtualizarUsuarioData;


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
export const COLUNAS_ORDENACAO = ['nome', 'email', 'userType', 'ativo', 'criadoEm'] as const;
export const DIRECOES_ORDENACAO = ['asc', 'desc'] as const;

// Mensagens de erro padronizadas
export const USER_ERROR_MESSAGES = {
  NAO_AUTORIZADO: 'Usuário não autorizado.',
  ERRO_INTERNO: 'Ocorreu um erro interno no servidor.',
  USUARIO_NAO_ENCONTRADO: 'Usuário não encontrado.',
  PERMISSAO_NEGADA: 'Permissão negada para executar esta ação.',
  ID_INVALIDO: 'O ID do usuário é inválido.',
  DADOS_INVALIDOS: 'Os dados fornecidos são inválidos.',
  EMAIL_JA_EXISTE: 'O e-mail fornecido já está em uso.',
  NOME_OBRIGATORIO: 'Nome é obrigatório',
  NOME_MUITO_CURTO: 'Nome deve ter pelo menos 2 caracteres',
  NOME_MUITO_LONGO: 'Nome deve ter no máximo 100 caracteres',
  EMAIL_OBRIGATORIO: 'E-mail é obrigatório',
  EMAIL_INVALIDO: 'E-mail inválido',
  SENHA_OBRIGATORIA: 'Senha é obrigatória',
  SENHA_MUITO_CURTA: 'Senha deve ter pelo menos 8 caracteres',
  SENHAS_NAO_CONFEREM: 'As senhas não conferem',
  TIPO_USUARIO_OBRIGATORIO: 'O tipo de usuário é obrigatório',
  SUPERVISOR_INVALIDO: 'A configuração de supervisor é inválida para este tipo de usuário',
} as const;


// Validações de regras de negócio
export const validarRegrasNegocio = {
  podeGerenciarUsuario: (userTypeLogado: UserType, userTypeAlvo: UserType): boolean => {
    if (userTypeLogado === 'ADMIN') return true;
    if (userTypeLogado === 'SUPERVISOR') {
      return ['ATENDENTE', 'CONSULTOR'].includes(userTypeAlvo);
    }
    return false;
  },
  
  podeEditarUsuario: (userTypeLogado: UserType, userTypeAlvo: UserType): boolean => {
    if (userTypeLogado === 'ADMIN') return true;
    if (userTypeLogado === 'SUPERVISOR') {
      return userTypeAlvo === 'ATENDENTE';
    }
    return false;
  },
  
  podeDesativarUsuario: (userTypeLogado: UserType, userTypeAlvo: UserType): boolean => {
    if (userTypeLogado === 'ADMIN') return true;
    if (userTypeLogado === 'SUPERVISOR') {
      return userTypeAlvo === 'ATENDENTE';
    }
    return false;
  }
};
