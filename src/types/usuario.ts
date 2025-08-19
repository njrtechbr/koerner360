/**
 * Tipos TypeScript para o módulo de usuários
 * Parte do padrão Model do MCP (Model-Controller-Presenter)
 */

import { TipoUsuario } from '@/lib/validations/usuario';

// Interface base do usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  supervisorId: string | null;
  supervisor?: {
    id: string;
    nome: string;
  } | null;
  _count?: {
    supervisoes: number;
    avaliacoesFeitas: number;
    avaliacoesRecebidas: number;
  };
}

// Interface para criação de usuário
export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  supervisorId?: string | null;
}

// Interface para atualização de usuário
export interface AtualizarUsuarioRequest {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  supervisorId?: string | null;
  senha?: string;
  confirmarSenha?: string;
}

// Interface para filtros de usuário
export interface FiltrosUsuario {
  busca?: string;
  tipoUsuario?: TipoUsuario;
  ativo?: boolean;
  supervisorId?: string | null;
}

// Interface para ordenação
export interface OrdenacaoUsuario {
  coluna: 'nome' | 'email' | 'tipoUsuario' | 'ativo' | 'criadoEm';
  direcao: 'asc' | 'desc';
}

// Interface para paginação
export interface PaginacaoUsuario {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

// Interface para resposta paginada
export interface UsuariosPaginados {
  usuarios: Usuario[];
  paginacao: PaginacaoUsuario;
  total: number;
}

// Interface para parâmetros de busca
export interface BuscarUsuariosParams {
  filtros?: FiltrosUsuario;
  ordenacao?: OrdenacaoUsuario;
  paginacao?: {
    pagina: number;
    limite: number;
  };
  incluirInativos?: boolean;
  incluirContadores?: boolean;
}

// Interface para resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Interface para resposta de lista de usuários
export interface ListarUsuariosResponse extends ApiResponse<UsuariosPaginados> {
  data: UsuariosPaginados;
}

// Interface para resposta de usuário único
export interface ObterUsuarioResponse extends ApiResponse<Usuario> {
  data: Usuario;
}

// Interface para resposta de criação/atualização
export interface MutarUsuarioResponse extends ApiResponse<Usuario> {
  data: Usuario;
}

// Interface para estatísticas de usuários
export interface EstatisticasUsuarios {
  total: number;
  ativos: number;
  inativos: number;
  porTipo: {
    ADMIN: number;
    SUPERVISOR: number;
    ATENDENTE: number;
    CONSULTOR: number;
  };
  criadosUltimos30Dias: number;
  ultimaAtualizacao: Date;
}

// Interface para permissões de usuário
export interface PermissoesUsuario {
  podeGerenciarUsuarios: boolean;
  podeCriarUsuarios: boolean;
  podeEditarUsuarios: boolean;
  podeDesativarUsuarios: boolean;
  podeVerDetalhesUsuarios: boolean;
  podeGerenciarAtendentes: boolean;
  podeGerenciarSupervisores: boolean;
}

// Interface para contexto de usuário logado
export interface ContextoUsuarioLogado {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  permissoes: PermissoesUsuario;
}

// Interface para formulário de usuário
export interface FormularioUsuarioData {
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  supervisorId?: string;
  senha?: string;
  confirmarSenha?: string;
}

// Interface para estado do formulário
export interface EstadoFormularioUsuario {
  data: FormularioUsuarioData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Interface para ações da tabela de usuários
export interface AcoesUsuario {
  onVerDetalhes: (usuario: Usuario) => void;
  onEditar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  onAtivar: (usuario: Usuario) => void;
  onExcluir?: (usuario: Usuario) => void;
}

// Interface para configurações da tabela
export interface ConfiguracaoTabelaUsuarios {
  mostrarFiltros: boolean;
  mostrarPaginacao: boolean;
  mostrarEstatisticas: boolean;
  colunas: {
    nome: boolean;
    email: boolean;
    tipoUsuario: boolean;
    ativo: boolean;
    supervisor: boolean;
    criadoEm: boolean;
    acoes: boolean;
  };
  acoesPorLinha: {
    verDetalhes: boolean;
    editar: boolean;
    desativar: boolean;
    excluir: boolean;
  };
}

// Interface para estado da lista de usuários
export interface EstadoListaUsuarios {
  usuarios: Usuario[];
  carregando: boolean;
  erro: string | null;
  filtros: FiltrosUsuario;
  ordenacao: OrdenacaoUsuario;
  paginacao: PaginacaoUsuario;
  selecionados: string[];
  configuracao: ConfiguracaoTabelaUsuarios;
}

// Interface para supervisores disponíveis
export interface SupervisorDisponivel {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  quantidadeAtendentes: number;
}

// Interface para validação de email único
export interface ValidacaoEmailUnico {
  email: string;
  usuarioId?: string; // Para excluir o próprio usuário na validação
}

// Interface para histórico de alterações
export interface HistoricoAlteracaoUsuario {
  id: string;
  usuarioId: string;
  alteradoPor: string;
  alteradoPorNome: string;
  campoAlterado: string;
  valorAnterior: string;
  valorNovo: string;
  dataAlteracao: Date;
  motivo?: string;
}

// Interface para auditoria de usuários
export interface AuditoriaUsuario {
  usuario: Usuario;
  historico: HistoricoAlteracaoUsuario[];
  ultimoLogin?: Date;
  tentativasLoginFalhas: number;
  contaBloqueada: boolean;
  dataUltimaBloqueio?: Date;
}

// Tipos utilitários
export type UsuarioSemSenha = Omit<Usuario, 'senha'>;
export type UsuarioParaEdicao = Omit<Usuario, 'criadoEm' | 'atualizadoEm' | '_count'>;
export type UsuarioResumo = Pick<Usuario, 'id' | 'nome' | 'email' | 'tipoUsuario' | 'ativo'>;
export type CamposObrigatoriosUsuario = Pick<Usuario, 'nome' | 'email' | 'tipoUsuario'>;

// Enums para facilitar o uso
export enum StatusUsuario {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  BLOQUEADO = 'bloqueado',
  PENDENTE = 'pendente'
}

export enum AcaoUsuario {
  CRIAR = 'criar',
  EDITAR = 'editar',
  DESATIVAR = 'desativar',
  ATIVAR = 'ativar',
  EXCLUIR = 'excluir',
  VER_DETALHES = 'ver_detalhes'
}

// Constantes úteis
export const LIMITE_USUARIOS_POR_PAGINA = {
  MIN: 5,
  MAX: 100,
  DEFAULT: 10
} as const;

export const TAMANHO_MAXIMO_NOME = 100;
export const TAMANHO_MAXIMO_EMAIL = 255;
export const TAMANHO_MINIMO_SENHA = 8;
export const TAMANHO_MAXIMO_SENHA = 128;

// Mensagens de erro padronizadas
export const MENSAGENS_ERRO_USUARIO = {
  NOME_OBRIGATORIO: 'Nome é obrigatório',
  NOME_MUITO_CURTO: 'Nome deve ter pelo menos 2 caracteres',
  NOME_MUITO_LONGO: 'Nome deve ter no máximo 100 caracteres',
  EMAIL_OBRIGATORIO: 'Email é obrigatório',
  EMAIL_INVALIDO: 'Email inválido',
  EMAIL_JA_EXISTE: 'Este email já está em uso',
  SENHA_OBRIGATORIA: 'Senha é obrigatória',
  SENHA_MUITO_FRACA: 'Senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial',
  SENHAS_NAO_COINCIDEM: 'Senhas não coincidem',
  TIPO_USUARIO_OBRIGATORIO: 'Tipo de usuário é obrigatório',
  SUPERVISOR_OBRIGATORIO_ATENDENTE: 'Atendente deve ter um supervisor',
  SUPERVISOR_NAO_PERMITIDO_SUPERVISOR: 'Supervisor não pode ter outro supervisor',
  USUARIO_NAO_ENCONTRADO: 'Usuário não encontrado',
  PERMISSAO_NEGADA: 'Você não tem permissão para esta ação',
  ERRO_INTERNO: 'Erro interno do servidor'
} as const;