import { auth } from '@/auth'
import { hasPermission, type TipoUsuario } from '@/hooks/use-permissions'
import { ApiResponseUtils } from '@/lib/utils/api-response'
import type { Permissoes } from '@/hooks/use-permissions'

interface AuthResult {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    userType: TipoUsuario
    supervisorId?: string
  }
  error?: ReturnType<typeof ApiResponseUtils.unauthorized>
}

/**
 * Utilitário para verificações de autenticação e autorização
 */
export class AuthUtils {
  /**
   * Verifica se o usuário está autenticado
   */
  static async verificarAutenticacao(): Promise<AuthResult> {
    const session = await auth()
    
    if (!session?.user) {
      return {
        success: false,
        error: ApiResponseUtils.unauthorized('Não autorizado')
      }
    }

    return {
      success: true,
      user: {
        id: session.user.id!,
        name: session.user.name!,
        email: session.user.email!,
        userType: session.user.userType as TipoUsuario,
        supervisorId: session.user.supervisorId || undefined,
      }
    }
  }

  /**
   * Verifica autenticação e permissão específica
   */
  static async verificarAutenticacaoEPermissao(
    permissao: keyof Permissoes
  ): Promise<AuthResult> {
    const authResult = await this.verificarAutenticacao()
    
    if (!authResult.success) {
      return authResult
    }

    const userType = authResult.user!.userType
    if (!hasPermission(userType, permissao)) {
      return {
        success: false,
        error: ApiResponseUtils.forbidden(`Sem permissão para ${permissao}`)
      }
    }

    return authResult
  }

  /**
   * Verifica se o usuário pode acessar dados de um atendente específico
   */
  static async verificarAcessoAtendente(
    _atendenteId: string
  ): Promise<AuthResult> {
    const authResult = await this.verificarAutenticacao()
    
    if (!authResult.success) {
      return authResult
    }

    const user = authResult.user!
    
    // Admin pode acessar qualquer atendente
    if (user.userType === 'ADMIN') {
      return authResult
    }

    // Supervisor pode acessar apenas seus atendentes
    if (user.userType === 'SUPERVISOR') {
      // Aqui você implementaria a verificação se o atendente pertence ao supervisor
      // Por enquanto, assumindo que pode acessar
      return authResult
    }

    // Atendente pode acessar apenas seus próprios dados
    if (user.userType === 'ATENDENTE') {
      // Verificar se o atendenteId corresponde ao usuário logado
      // Esta verificação dependeria da estrutura de relacionamento
      return authResult
    }

    // Consultor tem acesso de leitura
    if (user.userType === 'CONSULTOR') {
      return authResult
    }

    return {
      success: false,
      error: ApiResponseUtils.forbidden('Acesso negado ao atendente especificado')
    }
  }

  /**
   * Aplica filtros baseados no tipo de usuário
   */
  static aplicarFiltrosPorUsuario(
    userType: TipoUsuario,
    userId: string,
    _supervisorId?: string
  ): Record<string, unknown> {
    const filtros: Record<string, unknown> = {}

    switch (userType) {
      case 'ADMIN':
        // Admin vê tudo, sem filtros adicionais
        break
        
      case 'SUPERVISOR':
        // Supervisor vê apenas seus atendentes
        filtros.supervisorId = userId
        break
        
      case 'ATENDENTE':
        // Atendente vê apenas seus próprios dados
        filtros.usuarioId = userId
        break
        
      case 'CONSULTOR':
        // Consultor tem acesso de leitura amplo, mas pode ter filtros específicos
        break
    }

    return filtros
  }
}