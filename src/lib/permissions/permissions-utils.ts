import type { TipoUsuario } from '@prisma/client'

/**
 * Interface para definir permissões de usuário
 */
export interface PermissoesUsuario {
  podeCriar: boolean
  podeEditar: boolean
  podeDesativar: boolean
  podeVisualizarTodos: boolean
  podeVisualizarEquipe: boolean
}

/**
 * Mapa de permissões por tipo de usuário
 */
const PERMISSOES_POR_TIPO: Record<TipoUsuario, PermissoesUsuario> = {
  ADMIN: {
    podeCriar: true,
    podeEditar: true,
    podeDesativar: true,
    podeVisualizarTodos: true,
    podeVisualizarEquipe: true,
  },
  SUPERVISOR: {
    podeCriar: false,
    podeEditar: true,
    podeDesativar: false,
    podeVisualizarTodos: false,
    podeVisualizarEquipe: true,
  },
  ATENDENTE: {
    podeCriar: false,
    podeEditar: false,
    podeDesativar: false,
    podeVisualizarTodos: false,
    podeVisualizarEquipe: false,
  },
  CONSULTOR: {
    podeCriar: false,
    podeEditar: false,
    podeDesativar: false,
    podeVisualizarTodos: false,
    podeVisualizarEquipe: false,
  },
}

/**
 * Utilitário para obter permissões de um tipo de usuário
 */
export class PermissionsUtils {
  /**
   * Obtém todas as permissões para um tipo de usuário
   */
  static obterPermissoes(tipoUsuario: TipoUsuario): PermissoesUsuario {
    return PERMISSOES_POR_TIPO[tipoUsuario]
  }

  /**
   * Verifica se o usuário pode criar outros usuários
   */
  static podeCriarUsuarios(tipoUsuario: TipoUsuario): boolean {
    return PERMISSOES_POR_TIPO[tipoUsuario].podeCriar
  }

  /**
   * Verifica se o usuário pode editar outros usuários
   */
  static podeEditarUsuarios(tipoUsuario: TipoUsuario): boolean {
    return PERMISSOES_POR_TIPO[tipoUsuario].podeEditar
  }

  /**
   * Verifica se o usuário pode desativar outros usuários
   */
  static podeDesativarUsuarios(tipoUsuario: TipoUsuario): boolean {
    return PERMISSOES_POR_TIPO[tipoUsuario].podeDesativar
  }

  /**
   * Verifica se o usuário pode visualizar todos os usuários
   */
  static podeVisualizarTodosUsuarios(tipoUsuario: TipoUsuario): boolean {
    return PERMISSOES_POR_TIPO[tipoUsuario].podeVisualizarTodos
  }

  /**
   * Verifica se o usuário pode visualizar sua equipe
   */
  static podeVisualizarEquipe(tipoUsuario: TipoUsuario): boolean {
    return PERMISSOES_POR_TIPO[tipoUsuario].podeVisualizarEquipe
  }

  /**
   * Verifica se o usuário pode acessar dados de outro usuário específico
   */
  static podeAcessarUsuario(
    tipoUsuarioLogado: TipoUsuario,
    usuarioLogadoId: string,
    usuarioAlvoId: string,
    supervisorIdAlvo?: string | null
  ): boolean {
    // Admin pode acessar qualquer usuário
    if (tipoUsuarioLogado === 'ADMIN') {
      return true
    }

    // Usuário pode acessar seus próprios dados
    if (usuarioLogadoId === usuarioAlvoId) {
      return true
    }

    // Supervisor pode acessar usuários de sua equipe
    if (tipoUsuarioLogado === 'SUPERVISOR' && supervisorIdAlvo === usuarioLogadoId) {
      return true
    }

    return false
  }

  /**
   * Aplica filtros de acesso baseados no tipo de usuário
   */
  static aplicarFiltrosAcesso(
    tipoUsuario: TipoUsuario,
    usuarioId: string
  ): Record<string, unknown> {
    const filtros: Record<string, unknown> = {}

    switch (tipoUsuario) {
      case 'ADMIN':
        // Admin vê todos os usuários
        break
        
      case 'SUPERVISOR':
        // Supervisor vê apenas sua equipe e a si mesmo
        filtros.OR = [
          { supervisorId: usuarioId },
          { id: usuarioId }
        ]
        break
        
      case 'ATENDENTE':
      case 'CONSULTOR':
        // Atendente e Consultor veem apenas a si mesmos
        filtros.id = usuarioId
        break
    }

    return filtros
  }
}

/**
 * Hook para usar permissões de usuário
 */
export function usePermissoes(tipoUsuario: TipoUsuario) {
  return PermissionsUtils.obterPermissoes(tipoUsuario)
}