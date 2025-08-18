/**
 * Wrapper para os componentes de usuários
 * Gerencia estado, filtros, ordenação e paginação
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { FiltrosUsuariosComponent, FiltrosUsuarios } from './filtros-usuarios';
import { TabelaUsuarios } from './tabela-usuarios';
import { PaginacaoUsuarios } from './paginacao-usuarios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { logError } from '@/lib/error-utils';
import Link from 'next/link';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR';
  ativo: boolean;
  criadoEm: string;
  supervisorId?: string;
  supervisor?: {
    id: string;
    nome: string;
  };
}

interface FiltrosUsuario {
  busca?: string;
  tipoUsuario?: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR';
  ativo?: boolean;
  supervisorId?: string;
}

interface OrdenacaoUsuario {
  coluna: 'nome' | 'email' | 'tipoUsuario' | 'ativo' | 'criadoEm';
  direcao: 'asc' | 'desc';
}

interface PaginacaoUsuarios {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

interface UsuariosWrapperProps {
  searchParams: {
    search?: string;
    tipoUsuario?: string;
    ativo?: string;
    supervisorId?: string;
    pagina?: string;
    limite?: string;
    coluna?: string;
    direcao?: string;
  };
  podeCriar: boolean;
  podeEditar: boolean;
  podeDesativar: boolean;
}

/**
 * Filtros iniciais baseados nos searchParams
 */
function obterFiltrosIniciais(searchParams: UsuariosWrapperProps['searchParams']): FiltrosUsuario {
  // Validar se o tipo é um valor válido do enum
  const tiposValidos = ['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR'];
  const tipoValido = searchParams.tipoUsuario && tiposValidos.includes(searchParams.tipoUsuario) 
    ? searchParams.tipoUsuario as FiltrosUsuario['tipoUsuario']
    : undefined;

  return {
    busca: searchParams.search || '',
    tipoUsuario: tipoValido,
    ativo: searchParams.ativo ? searchParams.ativo === 'true' : undefined,
    supervisorId: searchParams.supervisorId || undefined,
  };
}

/**
 * Ordenação inicial baseada nos searchParams
 */
function obterOrdenacaoInicial(searchParams: UsuariosWrapperProps['searchParams']): OrdenacaoUsuario {
  const colunasValidas = ['nome', 'email', 'tipoUsuario', 'ativo', 'criadoEm'];
  const coluna = searchParams.coluna && colunasValidas.includes(searchParams.coluna) 
    ? searchParams.coluna as OrdenacaoUsuario['coluna']
    : 'nome';
  const direcao = searchParams.direcao === 'desc' ? 'desc' : 'asc';
  
  return { coluna, direcao };
}

/**
 * Paginação inicial baseada nos searchParams
 */
function obterPaginacaoInicial(searchParams: UsuariosWrapperProps['searchParams']): PaginacaoUsuarios {
  const pagina = parseInt(searchParams.pagina || '1', 10);
  const limite = parseInt(searchParams.limite || '10', 10);
  
  return {
    paginaAtual: pagina > 0 ? pagina : 1,
    totalPaginas: 1,
    totalItens: 0,
    itensPorPagina: limite > 0 && limite <= 100 ? limite : 10,
    temProximaPagina: false,
    temPaginaAnterior: false,
  };
}

/**
 * Loading component para filtros
 */
function FiltrosLoading() {
  return (
    <div className="flex gap-4 mb-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

/**
 * Loading component para tabela
 */
function TabelaLoading() {
  return (
    <div className="space-y-4">
      {/* Cabeçalho da tabela */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Linhas da tabela */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      
      {/* Paginação */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Componente wrapper que gerencia estado e dados dos usuários
 */
export function UsuariosWrapper({ searchParams, podeCriar, podeEditar, podeDesativar }: UsuariosWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showInfo, showError } = useSonnerToast();
  
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtros, setFiltros] = useState<FiltrosUsuario>(() => obterFiltrosIniciais(searchParams));
  const [ordenacao, setOrdenacao] = useState<OrdenacaoUsuario>(() => obterOrdenacaoInicial(searchParams));
  const [paginacao, setPaginacao] = useState<PaginacaoUsuarios>(() => obterPaginacaoInicial(searchParams));
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Buscar usuários da API
   */
  const buscarUsuarios = useCallback(async (
    filtrosParam?: FiltrosUsuario,
    ordenacaoParam?: OrdenacaoUsuario,
    paginaAtual?: number,
    itensPorPagina?: number
  ) => {
    try {
      setCarregando(true);
      setErro(null);

      const filtrosAtivos = filtrosParam || filtros;
      const ordenacaoAtiva = ordenacaoParam || ordenacao;
      const paginaAtiva = paginaAtual || paginacao.paginaAtual;
      const itensAtivos = itensPorPagina || paginacao.itensPorPagina;

      // Construir query string
      const params = new URLSearchParams();
      
      if (filtrosAtivos.busca) {
        params.append('search', filtrosAtivos.busca);
      }
      if (filtrosAtivos.tipoUsuario) {
        params.append('tipoUsuario', filtrosAtivos.tipoUsuario);
      }
      if (filtrosAtivos.ativo !== undefined) {
        params.append('ativo', filtrosAtivos.ativo.toString());
      }
      if (filtrosAtivos.supervisorId) {
        params.append('supervisorId', filtrosAtivos.supervisorId);
      }
      
      params.append('pagina', paginaAtiva.toString());
      params.append('limite', itensAtivos.toString());
      params.append('coluna', ordenacaoAtiva.coluna);
      params.append('direcao', ordenacaoAtiva.direcao);

      const response = await fetch(`/api/usuarios?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar usuários');
      }

      setUsuarios(data.data || []);
      setPaginacao(data.paginacao || {
        paginaAtual: 1,
        totalPaginas: 1,
        totalItens: 0,
        itensPorPagina: itensAtivos,
        temProximaPagina: false,
        temPaginaAnterior: false,
      });

    } catch (error) {
      logError('Erro ao buscar usuários', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
      showError('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  }, [filtros, ordenacao, paginacao.paginaAtual, paginacao.itensPorPagina, showError]);

  /**
   * Atualizar URL com os parâmetros atuais
   */
  const atualizarURL = useCallback((novosFiltros?: FiltrosUsuario, novaOrdenacao?: OrdenacaoUsuario, novaPagina?: number) => {
    const params = new URLSearchParams();
    
    const filtrosAtivos = novosFiltros || filtros;
    const ordenacaoAtiva = novaOrdenacao || ordenacao;
    const paginaAtiva = novaPagina || paginacao.paginaAtual;
    
    if (filtrosAtivos.busca) {
      params.append('search', filtrosAtivos.busca);
    }
    if (filtrosAtivos.tipoUsuario) {
      params.append('tipoUsuario', filtrosAtivos.tipoUsuario);
    }
    if (filtrosAtivos.ativo !== undefined) {
      params.append('ativo', filtrosAtivos.ativo.toString());
    }
    if (filtrosAtivos.supervisorId) {
      params.append('supervisorId', filtrosAtivos.supervisorId);
    }
    if (paginaAtiva > 1) {
      params.append('pagina', paginaAtiva.toString());
    }
    if (paginacao.itensPorPagina !== 10) {
      params.append('limite', paginacao.itensPorPagina.toString());
    }
    if (ordenacaoAtiva.coluna !== 'nome') {
      params.append('coluna', ordenacaoAtiva.coluna);
    }
    if (ordenacaoAtiva.direcao !== 'asc') {
      params.append('direcao', ordenacaoAtiva.direcao);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(newUrl, { scroll: false });
  }, [filtros, ordenacao, paginacao.paginaAtual, paginacao.itensPorPagina, pathname, router]);

  /**
   * Manipular mudança de filtros
   */
  const handleFiltrosChange = useCallback((novosFiltros: FiltrosUsuarios) => {
    // Converter FiltrosUsuarios para FiltrosUsuario
    const filtrosConvertidos: FiltrosUsuario = {
      busca: novosFiltros.busca || undefined,
      tipoUsuario: novosFiltros.tipoUsuario as 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR' || undefined,
      ativo: novosFiltros.ativo === 'true' ? true : novosFiltros.ativo === 'false' ? false : undefined,
      supervisorId: novosFiltros.supervisorId || undefined
    };
    
    setFiltros(filtrosConvertidos);
    const novaPagina = 1; // Reset para primeira página
    setPaginacao(prev => ({ ...prev, paginaAtual: novaPagina }));
    atualizarURL(filtrosConvertidos, undefined, novaPagina);
    buscarUsuarios(filtrosConvertidos, undefined, novaPagina);
  }, [atualizarURL, buscarUsuarios]);

  /**
   * Limpar filtros
   */
  const handleLimparFiltros = useCallback(() => {
    const filtrosLimpos: FiltrosUsuario = {
      busca: undefined,
      tipoUsuario: undefined,
      ativo: undefined,
      supervisorId: undefined
    };
    
    setFiltros(filtrosLimpos);
    const novaPagina = 1;
    setPaginacao(prev => ({ ...prev, paginaAtual: novaPagina }));
    atualizarURL(filtrosLimpos, undefined, novaPagina);
    buscarUsuarios(filtrosLimpos, undefined, novaPagina);
  }, [atualizarURL, buscarUsuarios]);

  /**
   * Manipular mudança de ordenação
   */
  const handleOrdenacaoChange = useCallback((novaOrdenacao: OrdenacaoUsuario) => {
    setOrdenacao(novaOrdenacao);
    atualizarURL(undefined, novaOrdenacao);
    buscarUsuarios(undefined, novaOrdenacao);
  }, [atualizarURL, buscarUsuarios]);

  /**
   * Manipular mudança de página
   */
  const handlePaginaChange = useCallback((novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, paginaAtual: novaPagina }));
    atualizarURL(undefined, undefined, novaPagina);
    buscarUsuarios(undefined, undefined, novaPagina);
  }, [atualizarURL, buscarUsuarios]);

  /**
   * Manipular mudança de itens por página
   */
  const handleItensPorPaginaChange = useCallback((novosItens: number) => {
    const novaPagina = 1; // Reset para primeira página
    setPaginacao(prev => ({ 
      ...prev, 
      itensPorPagina: novosItens,
      paginaAtual: novaPagina 
    }));
    atualizarURL(undefined, undefined, novaPagina);
    buscarUsuarios(undefined, undefined, novaPagina, novosItens);
  }, [atualizarURL, buscarUsuarios]);

  /**
   * Manipular ações da tabela
   */
  const handleVerDetalhes = useCallback((usuario: Usuario) => {
    router.push(`/usuarios/${usuario.id}`);
  }, [router]);

  const handleEditar = useCallback((usuario: Usuario) => {
    router.push(`/usuarios/${usuario.id}?tab=editar`);
  }, [router]);

  const handleDesativar = useCallback(async (usuario: Usuario) => {
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao desativar usuário');
      }

      showInfo(`Usuário ${usuario.nome} foi desativado com sucesso`);
      
      // Recarregar dados
      buscarUsuarios();
    } catch (error) {
      logError('Erro ao desativar usuário', error);
      showError('Erro ao desativar usuário');
    }
  }, [showInfo, showError, buscarUsuarios]);

  // Carregar dados iniciais
  useEffect(() => {
    buscarUsuarios();
  }, [buscarUsuarios]);

  // Renderizar erro se houver
  if (erro && !carregando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar usuários: {erro}</p>
            <Button onClick={() => buscarUsuarios()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {carregando ? (
        <FiltrosLoading />
      ) : (
        <FiltrosUsuariosComponent
          filtros={{
            busca: filtros.busca || '',
            tipoUsuario: filtros.tipoUsuario || '',
            ativo: filtros.ativo !== undefined ? filtros.ativo.toString() : '',
            supervisorId: filtros.supervisorId || ''
          }}
          onFiltrosChange={handleFiltrosChange}
          onLimparFiltros={handleLimparFiltros}
        />
      )}

      {/* Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Lista de Usuários</h3>
              <p className="text-sm text-muted-foreground">
                {paginacao.totalItens} usuário(s) encontrado(s)
              </p>
            </div>
            {podeCriar && (
              <Button asChild>
                <Link href="/usuarios/novo">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <TabelaLoading />
          ) : (
            <>
              <TabelaUsuarios
                usuarios={usuarios}
                carregando={carregando}
                onVerDetalhes={handleVerDetalhes}
                onEditar={handleEditar}
                onDesativar={handleDesativar}
                podeEditar={podeEditar}
                podeDesativar={podeDesativar}
                ordenacao={ordenacao}
                onOrdenacaoChange={handleOrdenacaoChange}
              />
              
              {paginacao.totalItens > 0 && (
                <div className="mt-6">
                  <PaginacaoUsuarios
                    paginacao={paginacao}
                    onPaginaChange={handlePaginaChange}
                    onItensPorPaginaChange={handleItensPorPaginaChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}