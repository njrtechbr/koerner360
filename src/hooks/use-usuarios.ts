/**
 * Hook personalizado para gerenciamento de usuários
 * Implementa a lógica de negócio (Controller do padrão MCP)
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  type Usuario,
  type CriarUsuarioData as CriarUsuarioRequest,
  type AtualizarUsuarioData as AtualizarUsuarioRequest,
  type FiltrosUsuario,
  type OrdenacaoUsuario,
  type PaginacaoUsuario,
  type EstatisticasUsuarios,
  type SupervisorDisponivel,
  type UsuarioResponse as ListarUsuariosResponse,
  type ObterUsuarioResponse,
  type MutarUsuarioResponse,
  USER_ERROR_MESSAGES
} from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';

// Estado do hook
interface UseUsuariosState {
  usuarios: Usuario[];
  usuario: Usuario | null;
  supervisores: SupervisorDisponivel[];
  estatisticas: EstatisticasUsuarios | null;
  loading: boolean;
  error: string | null;
  paginacao: PaginacaoUsuario;
  filtros: FiltrosUsuario;
  ordenacao: OrdenacaoUsuario;
}

// Configurações do hook
interface UseUsuariosConfig {
  autoLoad?: boolean;
  filtrosIniciais?: Partial<FiltrosUsuario>;
  ordenacaoInicial?: Partial<OrdenacaoUsuario>;
  paginacaoInicial?: Partial<PaginacaoUsuario>;
}

// Retorno do hook
interface UseUsuariosReturn extends UseUsuariosState {
  // Ações de listagem
  buscarUsuarios: (params?: {
    filtros?: Partial<FiltrosUsuario>;
    ordenacao?: Partial<OrdenacaoUsuario>;
    paginacao?: Partial<PaginacaoUsuario>;
  }) => Promise<void>;
  recarregarUsuarios: () => Promise<void>;
  
  // Ações de CRUD
  buscarUsuario: (id: string) => Promise<Usuario | null>;
  criarUsuario: (data: CriarUsuarioRequest) => Promise<Usuario | null>;
  atualizarUsuario: (data: AtualizarUsuarioRequest) => Promise<Usuario | null>;
  desativarUsuario: (id: string) => Promise<boolean>;
  ativarUsuario: (id: string) => Promise<boolean>;
  
  // Ações auxiliares
  buscarSupervisores: () => Promise<void>;
  obterEstatisticas: () => Promise<void>;
  verificarEmailUnico: (email: string, usuarioId?: string) => Promise<boolean>;
  
  // Controles de estado
  setFiltros: (filtros: Partial<FiltrosUsuario>) => void;
  setOrdenacao: (ordenacao: Partial<OrdenacaoUsuario>) => void;
  setPaginacao: (paginacao: Partial<PaginacaoUsuario>) => void;
  limparFiltros: () => void;
  limparErro: () => void;
}

// Estado inicial
const estadoInicial: UseUsuariosState = {
  usuarios: [],
  usuario: null,
  supervisores: [],
  estatisticas: null,
  loading: false,
  error: null,
  paginacao: {
    paginaAtual: 1,
    totalPaginas: 1,
    totalItens: 0,
    itensPorPagina: 10,
    temProximaPagina: false,
    temPaginaAnterior: false
  },
  filtros: {
    busca: '',
        userType: undefined,
    ativo: undefined,
    supervisorId: undefined
  },
  ordenacao: {
    coluna: 'nome',
    direcao: 'asc'
  }
};

/**
 * Hook principal para gerenciamento de usuários
 */
export function useUsuarios(config: UseUsuariosConfig = {}): UseUsuariosReturn {
  const { data: session } = useSession();
  const [state, setState] = useState<UseUsuariosState>(() => ({
    ...estadoInicial,
    filtros: { ...estadoInicial.filtros, ...config.filtrosIniciais },
    ordenacao: { ...estadoInicial.ordenacao, ...config.ordenacaoInicial },
    paginacao: { ...estadoInicial.paginacao, ...config.paginacaoInicial }
  }));

  // Usar useRef para armazenar a referência mais recente do estado
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Função auxiliar para fazer requisições
  const fazerRequisicao = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        let errorDetails = 'Erro desconhecido na requisição.';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || JSON.stringify(errorData);
        } catch (jsonError) {
          errorDetails = `Erro HTTP: ${response.status} - Não foi possível parsear a resposta de erro.`;
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Resposta da API indica falha sem mensagem de erro.');
      }

      return data.data || data;
    } catch (error) {
      logError('Erro na requisição', error);
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Erro desconhecido' }));
      return null;
    }
  }, []);

  // Buscar usuários
  const buscarUsuarios = useCallback(async (params?: {
    filtros?: Partial<FiltrosUsuario>;
    ordenacao?: Partial<OrdenacaoUsuario>;
    paginacao?: Partial<PaginacaoUsuario>;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Acessar o estado mais recente via stateRef.current
      const currentFiltros = stateRef.current.filtros;
      const currentOrdenacao = stateRef.current.ordenacao;
      const currentPaginacao = stateRef.current.paginacao;

      const filtrosAtivos = { ...currentFiltros, ...params?.filtros };
      const ordenacaoAtiva = { ...currentOrdenacao, ...params?.ordenacao };
      const paginacaoAtiva = { ...currentPaginacao, ...params?.paginacao };

      const searchParams = new URLSearchParams();
      
      // Adicionar filtros
      if (filtrosAtivos.busca) searchParams.set('busca', filtrosAtivos.busca);
      if (filtrosAtivos.userType) searchParams.set('userType', filtrosAtivos.userType);
      if (filtrosAtivos.ativo !== undefined) searchParams.set('ativo', String(filtrosAtivos.ativo));
      if (filtrosAtivos.supervisorId) searchParams.set('supervisorId', filtrosAtivos.supervisorId);
      
      // Adicionar ordenação
      searchParams.set('ordenacao', ordenacaoAtiva.coluna);
      searchParams.set('direcao', ordenacaoAtiva.direcao);
      
      // Adicionar paginação
      searchParams.set('pagina', String(paginacaoAtiva.paginaAtual));
      searchParams.set('limite', String(paginacaoAtiva.itensPorPagina));

      const response = await fazerRequisicao<ListarUsuariosResponse>(
        `/api/usuarios?${searchParams.toString()}`
      );

      if (response) {
        setState(prev => ({
          ...prev,
          usuarios: response.usuarios,
          paginacao: response.paginacao,
          loading: false
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      logError('Erro ao buscar usuários', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO
      }));
    }
  }, [fazerRequisicao]);

  // Recarregar usuários
  const recarregarUsuarios = useCallback(async () => {
    // Chamar buscarUsuarios sem argumentos, pois ela acessará o estado mais recente via stateRef
    await buscarUsuarios();
  }, [buscarUsuarios]);

  // ... (outras funções useCallback)

  // Buscar usuário por ID
  const buscarUsuario = useCallback(async (id: string): Promise<Usuario | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fazerRequisicao<ObterUsuarioResponse>(`/api/usuarios/${id}`);
      
      if (response) {
        setState(prev => ({
          ...prev,
          usuario: response.usuario,
          loading: false
        }));
        return response.usuario;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return null;
    } catch (error) {
      logError('Erro ao buscar usuário', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO
      }));
      return null;
    }
  }, [fazerRequisicao]);

  // Criar usuário
  const criarUsuario = useCallback(async (data: CriarUsuarioRequest): Promise<Usuario | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fazerRequisicao<MutarUsuarioResponse>('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response) {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Usuário criado com sucesso!');
        await recarregarUsuarios();
        return response.usuario;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return null;
    } catch (error) {
      logError('Erro ao criar usuário', error);
      const errorMessage = error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      return null;
    }
  }, [fazerRequisicao, recarregarUsuarios]);

  // Atualizar usuário
  const atualizarUsuario = useCallback(async (data: AtualizarUsuarioRequest): Promise<Usuario | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fazerRequisicao<MutarUsuarioResponse>(`/api/usuarios/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response) {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Usuário atualizado com sucesso!');
        await recarregarUsuarios();
        return response.usuario;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return null;
    } catch (error) {
      logError('Erro ao atualizar usuário', error);
      const errorMessage = error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      return null;
    }
  }, [fazerRequisicao, recarregarUsuarios]);

  // Desativar usuário
  const desativarUsuario = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fazerRequisicao<MutarUsuarioResponse>(`/api/usuarios/${id}/desativar`, {
        method: 'PATCH'
      });

      if (response) {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Usuário desativado com sucesso!');
        await recarregarUsuarios();
        return true;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      logError('Erro ao desativar usuário', error);
      const errorMessage = error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      return false;
    }
  }, [fazerRequisicao, recarregarUsuarios]);

  // Ativar usuário
  const ativarUsuario = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fazerRequisicao<MutarUsuarioResponse>(`/api/usuarios/${id}/ativar`, {
        method: 'PATCH'
      });

      if (response) {
        setState(prev => ({ ...prev, loading: false }));
        toast.success('Usuário ativado com sucesso!');
        await recarregarUsuarios();
        return true;
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      logError('Erro ao ativar usuário', error);
      const errorMessage = error instanceof Error ? error.message : USER_ERROR_MESSAGES.ERRO_INTERNO;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      return false;
    }
  }, [fazerRequisicao, recarregarUsuarios]);

  // Buscar supervisores
  const buscarSupervisores = useCallback(async () => {
    try {
      const response = await fazerRequisicao<SupervisorDisponivel[]>('/api/usuarios/supervisores');
      
      if (response) {
        setState(prev => ({ ...prev, supervisores: response }));
      }
    } catch (error) {
      logError('Erro ao buscar supervisores', error);
    }
  }, [fazerRequisicao]);

  // Obter estatísticas
  const obterEstatisticas = useCallback(async () => {
    try {
      const response = await fazerRequisicao<EstatisticasUsuarios>('/api/usuarios/estatisticas');
      
      if (response) {
        setState(prev => ({ ...prev, estatisticas: response }));
      }
    } catch (error) {
      logError('Erro ao obter estatísticas', error);
    }
  }, [fazerRequisicao]);

  // Verificar email único
  const verificarEmailUnico = useCallback(async (email: string, usuarioId?: string): Promise<boolean> => {
    try {
      const searchParams = new URLSearchParams({ email });
      if (usuarioId) {
        searchParams.set('usuarioId', usuarioId);
      }

      const response = await fazerRequisicao<{ emailUnico: boolean }>(
        `/api/usuarios/verificar-email?${searchParams.toString()}`
      );
      
      return response?.emailUnico ?? false;
    } catch (error) {
      logError('Erro ao verificar email único', error);
      return false;
    }
  }, [fazerRequisicao]);

  // Controles de estado
  const setFiltros = useCallback((filtros: Partial<FiltrosUsuario>) => {
    setState(prev => ({
      ...prev,
      filtros: { ...prev.filtros, ...filtros },
      paginacao: { ...prev.paginacao, paginaAtual: 1 } // Reset para primeira página
    }));
  }, []);

  const setOrdenacao = useCallback((ordenacao: Partial<OrdenacaoUsuario>) => {
    setState(prev => ({
      ...prev,
      ordenacao: { ...prev.ordenacao, ...ordenacao },
      paginacao: { ...prev.paginacao, paginaAtual: 1 } // Reset para primeira página
    }));
  }, []);

  const setPaginacao = useCallback((paginacao: Partial<PaginacaoUsuario>) => {
    setState(prev => ({
      ...prev,
      paginacao: { ...prev.paginacao, ...paginacao }
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    setState(prev => ({
      ...prev,
      filtros: estadoInicial.filtros,
      paginacao: { ...prev.paginacao, paginaAtual: 1 }
    }));
  }, []);

  const limparErro = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  

  // Auto-load inicial
  useEffect(() => {
    if (config.autoLoad !== false && session) {
      recarregarUsuarios();
    }
  }, [session, config.autoLoad, recarregarUsuarios]);

  return {
    ...state,
    buscarUsuarios,
    recarregarUsuarios,
    buscarUsuario,
    criarUsuario,
    atualizarUsuario,
    desativarUsuario,
    ativarUsuario,
    buscarSupervisores,
    obterEstatisticas,
    verificarEmailUnico,
    setFiltros,
    setOrdenacao,
    setPaginacao,
    limparFiltros,
    limparErro
  };
}

/**
 * Hook simplificado para buscar um usuário específico
 */
export function useUsuario(id: string | null) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarUsuario = useCallback(async (usuarioId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro na resposta da API');
      }

      setUsuario(data.data.usuario);
    } catch (error) {
      logError('Erro ao buscar usuário', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      buscarUsuario(id);
    } else {
      setUsuario(null);
      setError(null);
    }
  }, [id, buscarUsuario]);

  return {
    usuario,
    loading,
    error,
    refetch: () => id ? buscarUsuario(id) : Promise.resolve()
  };
}

/**
 * Hook para gerenciar permissões de usuário
 */
export function usePermissoesUsuario() {
  const { data: session } = useSession();
  
  const permissoes = {
    podeGerenciarUsuarios: session?.user?.userType === 'ADMIN',
    podeGerenciarAtendentes: ['ADMIN', 'SUPERVISOR'].includes(session?.user?.userType || ''),
    podeCriarUsuarios: session?.user?.userType === 'ADMIN',
    podeEditarUsuarios: ['ADMIN', 'SUPERVISOR'].includes(session?.user?.userType || ''),
    podeDesativarUsuarios: ['ADMIN', 'SUPERVISOR'].includes(session?.user?.userType || ''),
    podeVerEstatisticas: ['ADMIN', 'SUPERVISOR'].includes(session?.user?.userType || '')
  };

  return permissoes;
}