/**
 * Utilitários de permissões que funcionam tanto no servidor quanto no cliente
 * Este arquivo não usa 'use client' para poder ser usado em Server Components
 */

export type TipoUsuario = 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR'

export interface Permissoes {
  // Gestão de Usuários
  podeVisualizarUsuarios: boolean
  podeCriarUsuarios: boolean
  podeEditarUsuarios: boolean
  podeExcluirUsuarios: boolean
  
  // Gestão de Atendentes
  podeVisualizarAtendentes: boolean
  podeCriarAtendentes: boolean
  podeEditarAtendentes: boolean
  podeExcluirAtendentes: boolean
  
  // Avaliações
  podeVisualizarAvaliacoes: boolean
  podeCriarAvaliacoes: boolean
  podeEditarAvaliacoes: boolean
  podeExcluirAvaliacoes: boolean
  podeVisualizarTodasAvaliacoes: boolean
  
  // Relatórios
  podeVisualizarRelatorios: boolean
  podeVisualizarRelatoriosAvancados: boolean
  podeExportarRelatorios: boolean
  
  // Gamificação
  podeVisualizarGamificacao: boolean
  podeVisualizarRankings: boolean
  podeVisualizarConquistas: boolean
  podeVisualizarComparativos: boolean
  
  // Dashboard
  podeAcessarDashboardAdmin: boolean
  podeAcessarDashboardSupervisor: boolean
  podeAcessarDashboardAtendente: boolean
  
  // Sistema
  podeVisualizarLogs: boolean
  podeGerenciarSistema: boolean
}

const PERMISSOES_POR_TIPO: Record<TipoUsuario, Permissoes> = {
  ADMIN: {
    // Gestão de Usuários
    podeVisualizarUsuarios: true,
    podeCriarUsuarios: true,
    podeEditarUsuarios: true,
    podeExcluirUsuarios: true,
    
    // Gestão de Atendentes
    podeVisualizarAtendentes: true,
    podeCriarAtendentes: true,
    podeEditarAtendentes: true,
    podeExcluirAtendentes: true,
    
    // Avaliações
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: true,
    podeEditarAvaliacoes: true,
    podeExcluirAvaliacoes: true,
    podeVisualizarTodasAvaliacoes: true,
    
    // Relatórios
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: true,
    podeExportarRelatorios: true,
    
    // Gamificação
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: true,
    
    // Dashboard
    podeAcessarDashboardAdmin: true,
    podeAcessarDashboardSupervisor: true,
    podeAcessarDashboardAtendente: true,
    
    // Sistema
    podeVisualizarLogs: true,
    podeGerenciarSistema: true,
  },
  
  SUPERVISOR: {
    // Gestão de Usuários
    podeVisualizarUsuarios: true,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes
    podeVisualizarAtendentes: true,
    podeCriarAtendentes: true,
    podeEditarAtendentes: true,
    podeExcluirAtendentes: false,
    
    // Avaliações
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: true,
    podeEditarAvaliacoes: true,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: false,
    
    // Relatórios
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: true,
    podeExportarRelatorios: true,
    
    // Gamificação
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: true,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: true,
    podeAcessarDashboardAtendente: false,
    
    // Sistema
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
  
  ATENDENTE: {
    // Gestão de Usuários
    podeVisualizarUsuarios: false,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes
    podeVisualizarAtendentes: false,
    podeCriarAtendentes: false,
    podeEditarAtendentes: false,
    podeExcluirAtendentes: false,
    
    // Avaliações
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: false,
    podeEditarAvaliacoes: false,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: false,
    
    // Relatórios
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: false,
    podeExportarRelatorios: false,
    
    // Gamificação
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: false,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: false,
    podeAcessarDashboardAtendente: true,
    
    // Sistema
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
  
  CONSULTOR: {
    // Gestão de Usuários
    podeVisualizarUsuarios: false,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes
    podeVisualizarAtendentes: false,
    podeCriarAtendentes: false,
    podeEditarAtendentes: false,
    podeExcluirAtendentes: false,
    
    // Avaliações
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: false,
    podeEditarAvaliacoes: false,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: false,
    
    // Relatórios
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: false,
    podeExportarRelatorios: false,
    
    // Gamificação
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: false,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: false,
    podeAcessarDashboardAtendente: false,
    
    // Sistema
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
}

/**
 * Função para verificar se o usuário tem uma permissão específica
 * Funciona tanto no servidor quanto no cliente
 * @param userType Tipo do usuário
 * @param permissao Permissão a verificar
 * @returns boolean
 */
export function hasPermission(
  userType: TipoUsuario | undefined,
  permissao: keyof Permissoes
): boolean {
  if (!userType) return false
  return PERMISSOES_POR_TIPO[userType]?.[permissao] || false
}

/**
 * Função para verificar se o usuário pode acessar uma rota específica
 * @param userType Tipo do usuário
 * @param route Rota a verificar
 * @returns boolean
 */
export function canAccessRoute(
  userType: TipoUsuario | undefined,
  route: string
): boolean {
  if (!userType) return false
  
  const permissoes = PERMISSOES_POR_TIPO[userType]
  
  // Mapeamento de rotas para permissões
  const routePermissions: Record<string, keyof Permissoes> = {
    '/usuarios': 'podeVisualizarUsuarios',
    '/atendentes': 'podeVisualizarAtendentes',
    '/avaliacoes': 'podeVisualizarAvaliacoes',
    '/relatorios': 'podeVisualizarRelatorios',
    '/gamificacao': 'podeVisualizarGamificacao',
    '/dashboard': 'podeAcessarDashboardAdmin', // Default para admin
  }
  
  // Verificar rota específica
  for (const [routePath, permission] of Object.entries(routePermissions)) {
    if (route.startsWith(routePath)) {
      return permissoes[permission]
    }
  }
  
  // Para rotas não mapeadas, permitir acesso (será controlado individualmente)
  return true
}

/**
 * Função para obter todas as permissões de um tipo de usuário
 * @param userType Tipo do usuário
 * @returns Permissoes
 */
export function getPermissions(userType: TipoUsuario | undefined): Permissoes | null {
  if (!userType) return null
  return PERMISSOES_POR_TIPO[userType] || null
}

/**
 * Função para verificar se o usuário pode gerenciar usuários
 * Atalho para a permissão mais comum
 * @param userType Tipo do usuário
 * @returns boolean
 */
export function canManageUsers(userType: TipoUsuario | undefined): boolean {
  return userType === 'ADMIN' || userType === 'SUPERVISOR'
}