'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

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
  podeAcessarDashboardConsultor: boolean
  
  // Sistema
  podeVisualizarLogs: boolean
  podeGerenciarSistema: boolean
}

const PERMISSOES_POR_TIPO: Record<TipoUsuario, Permissoes> = {
  ADMIN: {
    // Gestão de Usuários - Total
    podeVisualizarUsuarios: true,
    podeCriarUsuarios: true,
    podeEditarUsuarios: true,
    podeExcluirUsuarios: true,
    
    // Gestão de Atendentes - Total
    podeVisualizarAtendentes: true,
    podeCriarAtendentes: true,
    podeEditarAtendentes: true,
    podeExcluirAtendentes: true,
    
    // Avaliações - Total
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: true,
    podeEditarAvaliacoes: true,
    podeExcluirAvaliacoes: true,
    podeVisualizarTodasAvaliacoes: true,
    
    // Relatórios - Total
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: true,
    podeExportarRelatorios: true,
    
    // Gamificação - Total
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: true,
    
    // Dashboard - Acesso a todos
    podeAcessarDashboardAdmin: true,
    podeAcessarDashboardSupervisor: true,
    podeAcessarDashboardAtendente: true,
    podeAcessarDashboardConsultor: true,
    
    // Sistema - Total
    podeVisualizarLogs: true,
    podeGerenciarSistema: true,
  },
  
  SUPERVISOR: {
    // Gestão de Usuários - Limitado
    podeVisualizarUsuarios: true,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes - Gerencia seus atendentes
    podeVisualizarAtendentes: true,
    podeCriarAtendentes: true,
    podeEditarAtendentes: true,
    podeExcluirAtendentes: false,
    
    // Avaliações - Gerencia avaliações dos seus atendentes
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: true,
    podeEditarAvaliacoes: true,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: false,
    
    // Relatórios - Limitado aos seus atendentes
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: true,
    podeExportarRelatorios: true,
    
    // Gamificação - Limitado aos seus atendentes
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: true,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: true,
    podeAcessarDashboardAtendente: false,
    podeAcessarDashboardConsultor: false,
    
    // Sistema - Sem acesso
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
  
  ATENDENTE: {
    // Gestão de Usuários - Sem acesso
    podeVisualizarUsuarios: false,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes - Apenas visualizar próprio perfil
    podeVisualizarAtendentes: false,
    podeCriarAtendentes: false,
    podeEditarAtendentes: false,
    podeExcluirAtendentes: false,
    
    // Avaliações - Apenas suas próprias
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: false,
    podeEditarAvaliacoes: false,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: false,
    
    // Relatórios - Apenas próprios
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: false,
    podeExportarRelatorios: false,
    
    // Gamificação - Apenas própria
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: false,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: false,
    podeAcessarDashboardAtendente: true,
    podeAcessarDashboardConsultor: false,
    
    // Sistema - Sem acesso
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
  
  CONSULTOR: {
    // Gestão de Usuários - Apenas visualização
    podeVisualizarUsuarios: true,
    podeCriarUsuarios: false,
    podeEditarUsuarios: false,
    podeExcluirUsuarios: false,
    
    // Gestão de Atendentes - Apenas visualização
    podeVisualizarAtendentes: true,
    podeCriarAtendentes: false,
    podeEditarAtendentes: false,
    podeExcluirAtendentes: false,
    
    // Avaliações - Apenas visualização
    podeVisualizarAvaliacoes: true,
    podeCriarAvaliacoes: false,
    podeEditarAvaliacoes: false,
    podeExcluirAvaliacoes: false,
    podeVisualizarTodasAvaliacoes: true,
    
    // Relatórios - Acesso total para análise
    podeVisualizarRelatorios: true,
    podeVisualizarRelatoriosAvancados: true,
    podeExportarRelatorios: true,
    
    // Gamificação - Acesso total para análise
    podeVisualizarGamificacao: true,
    podeVisualizarRankings: true,
    podeVisualizarConquistas: true,
    podeVisualizarComparativos: true,
    
    // Dashboard
    podeAcessarDashboardAdmin: false,
    podeAcessarDashboardSupervisor: false,
    podeAcessarDashboardAtendente: false,
    podeAcessarDashboardConsultor: true,
    
    // Sistema - Sem acesso
    podeVisualizarLogs: false,
    podeGerenciarSistema: false,
  },
}

export function usePermissions() {
  const { data: session, status } = useSession()
  
  const permissoes = useMemo(() => {
    if (status === 'loading' || !session?.user?.userType) {
      // Retorna permissões vazias durante carregamento
      return Object.keys(PERMISSOES_POR_TIPO.ATENDENTE).reduce((acc, key) => {
        acc[key as keyof Permissoes] = false
        return acc
      }, {} as Permissoes)
    }
    
    const tipoUsuario = session.user.userType as TipoUsuario
    return PERMISSOES_POR_TIPO[tipoUsuario] || PERMISSOES_POR_TIPO.ATENDENTE
  }, [session?.user?.userType, status])
  
  const usuario = useMemo(() => {
    if (!session?.user) return null
    
    return {
      id: session.user.id,
      nome: session.user.name || '',
      email: session.user.email || '',
      tipo: session.user.userType as TipoUsuario,
      supervisorId: session.user.supervisorId,
    }
  }, [session?.user])
  
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated' && !!session?.user
  
  return {
    usuario,
    permissoes,
    isLoading,
    isAuthenticated,
    isAdmin: usuario?.tipo === 'ADMIN',
    isSupervisor: usuario?.tipo === 'SUPERVISOR',
    isAtendente: usuario?.tipo === 'ATENDENTE',
    isConsultor: usuario?.tipo === 'CONSULTOR',
  }
}

/**
 * Função utilitária para verificar permissões em componentes Server
 * @param userType Tipo do usuário
 * @param permissao Nome da permissão a verificar
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
    '/consultor': 'podeAcessarDashboardConsultor',
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