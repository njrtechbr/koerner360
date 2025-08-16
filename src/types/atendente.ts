/**
 * Tipos TypeScript para o sistema de atendentes
 * Baseado na documentação da tabela atendentes do Supabase
 */

// Importar o tipo do Prisma para compatibilidade
import type { StatusAtendente as PrismaStatusAtendente } from '@prisma/client';

// Enum para status do atendente
export enum StatusAtendente {
  ATIVO = 'ATIVO',
  FERIAS = 'FERIAS',
  AFASTADO = 'AFASTADO',
  INATIVO = 'INATIVO'
}

// Garantir compatibilidade entre os tipos
export type StatusAtendenteType = PrismaStatusAtendente;

// Interface principal do atendente
export interface Atendente {
  id: string;
  nome: string;
  email: string;
  status: PrismaStatusAtendente;
  avatarUrl?: string;
  foto?: Uint8Array | null;
  telefone: string;
  portaria: string;
  dataAdmissao: Date;
  dataNascimento: Date;
  rg: string;
  cpf: string;
  setor: string;
  cargo: string;
  endereco: string;
  observacoes?: string | null;
  usuarioId?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Interface para criação de atendente (sem campos auto-gerados)
export interface CriarAtendenteData {
  nome: string;
  email: string;
  status?: PrismaStatusAtendente;
  avatarUrl?: string | null;
  telefone: string;
  portaria: string;
  dataAdmissao: Date;
  dataNascimento: Date;
  rg: string;
  cpf: string;
  setor: string;
  cargo: string;
  endereco: string;
  observacoes?: string | null;
}

// Interface para atualização de atendente (campos opcionais)
export interface AtualizarAtendenteData {
  nome?: string;
  email?: string;
  status?: PrismaStatusAtendente;
  avatarUrl?: string | null;
  telefone?: string;
  portaria?: string;
  dataAdmissao?: Date;
  dataNascimento?: Date;
  rg?: string;
  cpf?: string;
  setor?: string;
  cargo?: string;
  endereco?: string;
  observacoes?: string | null;
  usuarioId?: string | null;
}

// Interface para dados de formulário (com strings para datas)
export interface AtendenteFormData {
  nome: string;
  email: string;
  status: PrismaStatusAtendente;
  avatarUrl?: string;
  telefone: string;
  portaria: string;
  dataAdmissao: string; // String para formulários
  dataNascimento: string; // String para formulários
  rg: string;
  cpf: string;
  setor: string;
  cargo: string;
  endereco: string;
  observacoes?: string | null;
}

// Interface para dados de formulário com campos opcionais (para edição)
export interface AtendenteFormDataParcial {
  nome?: string;
  email?: string;
  status?: PrismaStatusAtendente;
  avatarUrl?: string;
  telefone?: string;
  portaria?: string;
  dataAdmissao?: string;
  dataNascimento?: string;
  rg?: string;
  cpf?: string;
  setor?: string;
  cargo?: string;
  endereco?: string;
  observacoes?: string | null;
}

// Interface para filtros de busca
export interface FiltrosAtendente {
  busca?: string;
  search?: string; // Compatibilidade com searchParams
  status?: PrismaStatusAtendente;
  setor?: string;
  cargo?: string;
  portaria?: string;
  dataAdmissaoInicio?: string;
  dataAdmissaoFim?: string;
  ativo?: boolean;
}

// Interface para paginação
export interface PaginacaoAtendentes {
  paginaAtual: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

// Interface para resposta da API
export interface RespostaApiAtendentes {
  success: boolean;
  data?: {
    atendentes: Atendente[];
    paginacao: PaginacaoAtendentes;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Interface para resposta de atendente único
export interface RespostaApiAtendente {
  success: boolean;
  data?: {
    atendente: Atendente;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Tipo para ordenação de colunas
export type OrdenacaoColunaAtendente = 
  | 'nome' 
  | 'email' 
  | 'status' 
  | 'setor' 
  | 'cargo' 
  | 'portaria'
  | 'dataAdmissao' 
  | 'criadoEm';

// Tipo para direção da ordenação
export type DirecaoOrdenacao = 'asc' | 'desc';

// Interface para configuração de ordenação
export interface OrdenacaoAtendente {
  coluna: OrdenacaoColunaAtendente;
  direcao: DirecaoOrdenacao;
}

// Interface para estatísticas de atendentes
export interface EstatisticasAtendentes {
  totalAtendentes: number;
  atendentesMesAtual: number;
  distribuicaoPorStatus: Record<PrismaStatusAtendente, number>;
  distribuicaoPorSetor: Record<string, number>;
  distribuicaoPorCargo: Record<string, number>;
  distribuicaoPorPortaria: Record<string, number>;
  tendenciaAdmissoes: Array<{
    mes: string;
    admissoes: number;
  }>;
}

/**
 * Interface para logs de auditoria
 */
export interface LogAuditoria {
  id: string;
  usuarioId?: string | null;
  atendenteId?: string | null;
  acao: string;
  nomeTabela?: string | null;
  registroId?: string | null;
  dadosAnteriores?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  enderecoIp?: string | null;
  userAgent?: string | null;
  criadoEm: Date;
  usuario: {
    id: string;
    nome: string;
    email: string;
    foto_url?: string;
  } | null;
  atendente?: {
    id: string;
    nome: string;
  } | null;
  // Propriedade calculada para exibição (opcional)
  detalhes?: string;
}

// Labels para exibição dos status
export const StatusAtendenteLabels: Record<PrismaStatusAtendente, string> = {
  [StatusAtendente.ATIVO]: 'Ativo',
  [StatusAtendente.FERIAS]: 'Férias',
  [StatusAtendente.AFASTADO]: 'Afastado',
  [StatusAtendente.INATIVO]: 'Inativo'
};

// Cores para exibição dos status
export const StatusAtendenteCores: Record<PrismaStatusAtendente, string> = {
  [StatusAtendente.ATIVO]: 'bg-green-100 text-green-800',
  [StatusAtendente.FERIAS]: 'bg-blue-100 text-blue-800',
  [StatusAtendente.AFASTADO]: 'bg-yellow-100 text-yellow-800',
  [StatusAtendente.INATIVO]: 'bg-red-100 text-red-800'
};

// Exportações com nomes alternativos para compatibilidade
export const STATUS_ATENDENTE_LABELS = StatusAtendenteLabels;
export const STATUS_ATENDENTE_CORES = StatusAtendenteCores;