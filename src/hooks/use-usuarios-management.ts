import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { TipoUsuario } from '@prisma/client'

interface Usuario {
  id: string
  nome: string
  email: string
  tipoUsuario: TipoUsuario
  ativo: boolean
  criadoEm: string
  supervisorId?: string | null
  supervisor?: {
    id: string
    nome: string
  } | null
}

interface FiltrosUsuarios {
  search?: string
  tipoUsuario?: TipoUsuario
  ativo?: boolean
  supervisorId?: string
  pagina?: number
  limite?: number
  coluna?: string
  direcao?: 'asc' | 'desc'
}

interface UseUsuariosManagementReturn {
  usuarios: Usuario[]
  loading: boolean
  error: string | null
  total: number
  filtros: FiltrosUsuarios
  // Ações
  buscarUsuarios: (filtros?: FiltrosUsuarios) => Promise<void>
  alterarStatusUsuario: (id: string, ativo: boolean) => Promise<boolean>
  excluirUsuario: (id: string) => Promise<boolean>
  atualizarFiltros: (novosFiltros: Partial<FiltrosUsuarios>) => void
  limparFiltros: () => void
  // Estados derivados
  temFiltrosAtivos: boolean
  paginaAtual: number
  totalPaginas: number
}

const FILTROS_INICIAIS: FiltrosUsuarios = {
  pagina: 1,
  limite: 10,
  coluna: 'criadoEm',
  direcao: 'desc',
}

/**
 * Hook customizado para gerenciamento de usuários
 * Centraliza lógica de estado, filtros e operações CRUD
 */
export function useUsuariosManagement(
  filtrosIniciais: Partial<FiltrosUsuarios> = {}
): UseUsuariosManagementReturn {
  const router = useRouter()
  
  // Estados principais
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    ...FILTROS_INICIAIS,
    ...filtrosIniciais,
  })

  /**
   * Busca usuários com filtros aplicados
   */
  const buscarUsuarios = useCallback(async (novosFiltros?: FiltrosUsuarios) => {
    const filtrosParaBusca = novosFiltros || filtros
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      // Construir query string
      Object.entries(filtrosParaBusca).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/usuarios?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar usuários')
      }

      setUsuarios(result.data.usuarios)
      setTotal(result.data.total)
      
      // Atualizar filtros se foram fornecidos novos
      if (novosFiltros) {
        setFiltros(novosFiltros)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  /**
   * Altera status ativo/inativo de um usuário
   */
  const alterarStatusUsuario = useCallback(async (id: string, ativo: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao alterar status do usuário')
      }

      // Atualizar usuário na lista local
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === id ? { ...usuario, ativo } : usuario
        )
      )

      return true
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err)
      return false
    }
  }, [])

  /**
   * Exclui um usuário (soft delete)
   */
  const excluirUsuario = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao excluir usuário')
      }

      // Remover usuário da lista local
      setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
      setTotal(prev => prev - 1)

      return true
    } catch (err) {
      console.error('Erro ao excluir usuário:', err)
      return false
    }
  }, [])

  /**
   * Atualiza filtros e recarrega dados
   */
  const atualizarFiltros = useCallback((novosFiltros: Partial<FiltrosUsuarios>) => {
    const filtrosAtualizados = { ...filtros, ...novosFiltros }
    setFiltros(filtrosAtualizados)
    buscarUsuarios(filtrosAtualizados)
  }, [filtros, buscarUsuarios])

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = useCallback(() => {
    const filtrosLimpos = { ...FILTROS_INICIAIS }
    setFiltros(filtrosLimpos)
    buscarUsuarios(filtrosLimpos)
  }, [buscarUsuarios])

  // Estados derivados
  const temFiltrosAtivos = Boolean(
    filtros.search || 
    filtros.tipoUsuario || 
    filtros.ativo !== undefined || 
    filtros.supervisorId
  )

  const paginaAtual = filtros.pagina || 1
  const limite = filtros.limite || 10
  const totalPaginas = Math.ceil(total / limite)

  // Carregar dados iniciais
  useEffect(() => {
    buscarUsuarios()
  }, [buscarUsuarios]) // Incluir buscarUsuarios nas dependências

  return {
    usuarios,
    loading,
    error,
    total,
    filtros,
    buscarUsuarios,
    alterarStatusUsuario,
    excluirUsuario,
    atualizarFiltros,
    limparFiltros,
    temFiltrosAtivos,
    paginaAtual,
    totalPaginas,
  }
}

/**
 * Hook especializado para supervisores
 * Aplica filtros automáticos para mostrar apenas usuários da equipe
 */
export function useUsuariosEquipe(supervisorId: string) {
  return useUsuariosManagement({
    supervisorId,
  })
}

/**
 * Hook para busca de usuários com debounce
 */
export function useUsuariosBusca(termoBusca: string, delay = 300) {
  const [debouncedTermo, setDebouncedTermo] = useState(termoBusca)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermo(termoBusca)
    }, delay)

    return () => clearTimeout(timer)
  }, [termoBusca, delay])

  return useUsuariosManagement({
    search: debouncedTermo,
  })
}