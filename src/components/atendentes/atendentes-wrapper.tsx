/**
 * Wrapper para os componentes de atendentes
 * Gerencia estado, filtros, ordenação e paginação
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { FiltrosAtendentes } from './filtros-atendentes';
import { TabelaAtendentes } from './tabela-atendentes';
import { ModalNovoAtendente } from './ModalNovoAtendente';
import {
  Atendente,
  FiltrosAtendente,
  OrdenacaoAtendente,
  PaginacaoAtendentes,
  StatusAtendente
} from '@/types/atendente';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { logError } from '@/lib/error-utils';

interface AtendentesWrapperProps {
  searchParams: {
    search?: string;
    status?: string;
    setor?: string;
    cargo?: string;
    portaria?: string;
    pagina?: string;
    limite?: string;
    coluna?: string;
    direcao?: string;
  };
}

/**
 * Filtros iniciais baseados nos searchParams
 */
function obterFiltrosIniciais(searchParams: AtendentesWrapperProps['searchParams']): FiltrosAtendente {
  // Validar se o status é um valor válido do enum
  const statusValidos = ['ATIVO', 'FERIAS', 'AFASTADO', 'INATIVO'];
  const statusValido = searchParams.status && statusValidos.includes(searchParams.status) 
    ? searchParams.status as StatusAtendente 
    : undefined;

  return {
    busca: searchParams.search || '',
    status: statusValido,
    setor: searchParams.setor || '',
    cargo: searchParams.cargo || '',
    portaria: searchParams.portaria || '',
    dataAdmissaoInicio: '',
    dataAdmissaoFim: ''
  };
}

/**
 * Ordenação inicial baseada nos searchParams
 */
function obterOrdenacaoInicial(searchParams: AtendentesWrapperProps['searchParams']): OrdenacaoAtendente {
  return {
    coluna: (searchParams.coluna as OrdenacaoAtendente['coluna']) || 'nome',
    direcao: (searchParams.direcao as 'asc' | 'desc') || 'asc'
  };
}

/**
 * Paginação inicial baseada nos searchParams
 */
function obterPaginacaoInicial(searchParams: AtendentesWrapperProps['searchParams']): PaginacaoAtendentes {
  return {
    paginaAtual: parseInt(searchParams.pagina || '1', 10),
    itensPorPagina: parseInt(searchParams.limite || '10', 10),
    totalItens: 0,
    totalPaginas: 0,
    temProximaPagina: false,
    temPaginaAnterior: false
  };
}

/**
 * Componente de loading para filtros
 */
function FiltrosLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente de loading para tabela
 */
function TabelaLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabela skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          
          {/* Paginação skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente wrapper que gerencia estado e dados dos atendentes
 */
export function AtendentesWrapper({ searchParams }: AtendentesWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showInfo } = useSonnerToast();
  
  // Estados
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAtendente>(() => obterFiltrosIniciais(searchParams));
  const [ordenacao, setOrdenacao] = useState<OrdenacaoAtendente>(() => obterOrdenacaoInicial(searchParams));
  const [paginacao, setPaginacao] = useState<PaginacaoAtendentes>(() => obterPaginacaoInicial(searchParams));
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalNovoAtendenteAberto, setModalNovoAtendenteAberto] = useState(false);


  /**
   * Buscar atendentes da API
   */
  const buscarAtendentes = useCallback(async (
    filtrosParam?: FiltrosAtendente,
    ordenacaoParam?: OrdenacaoAtendente,
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
      
      if (filtrosAtivos.busca) params.set('search', filtrosAtivos.busca);
      if (filtrosAtivos.status) params.set('status', filtrosAtivos.status);
      if (filtrosAtivos.setor) params.set('setor', filtrosAtivos.setor);
      if (filtrosAtivos.cargo) params.set('cargo', filtrosAtivos.cargo);
      if (filtrosAtivos.portaria) params.set('portaria', filtrosAtivos.portaria);
      
      params.set('pagina', paginaAtiva.toString());
      params.set('limite', itensAtivos.toString());
      params.set('coluna', ordenacaoAtiva.coluna);
      params.set('direcao', ordenacaoAtiva.direcao);

      const response = await fetch(`/api/atendentes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAtendentes(data.data || []);
        setPaginacao(prev => ({
          ...prev,
          ...data.paginacao
        }));
        
        // Notificação informativa sobre os resultados
        const totalAtendentes = data.paginacao?.totalItens || 0;
        if (totalAtendentes === 0) {
          showInfo('Nenhum atendente encontrado com os filtros aplicados');
        } else {
          const temFiltros = Object.values(filtrosAtivos).some(valor => valor && valor !== '');
          if (temFiltros) {
            showInfo(`${totalAtendentes} atendente${totalAtendentes !== 1 ? 's' : ''} encontrado${totalAtendentes !== 1 ? 's' : ''} com os filtros aplicados`);
          }
        }
      } else {
        throw new Error(data.error?.message || data.error || 'Erro ao carregar atendentes');
      }
    } catch (error) {
      logError('Erro ao buscar atendentes', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  }, [filtros, ordenacao, paginacao.paginaAtual, paginacao.itensPorPagina, showInfo]);



  /**
   * Atualizar URL com novos parâmetros
   */
  const atualizarURL = useCallback((novosFiltros: FiltrosAtendente, novaOrdenacao: OrdenacaoAtendente, novaPaginacao: Partial<PaginacaoAtendentes>) => {
    const params = new URLSearchParams();
    
    if (novosFiltros.busca) params.set('search', novosFiltros.busca);
    if (novosFiltros.status) params.set('status', novosFiltros.status);
    if (novosFiltros.setor) params.set('setor', novosFiltros.setor);
    if (novosFiltros.cargo) params.set('cargo', novosFiltros.cargo);
    if (novosFiltros.portaria) params.set('portaria', novosFiltros.portaria);
    
    if (novaPaginacao.paginaAtual && novaPaginacao.paginaAtual > 1) {
      params.set('pagina', novaPaginacao.paginaAtual.toString());
    }
    if (novaPaginacao.itensPorPagina && novaPaginacao.itensPorPagina !== 10) {
      params.set('limite', novaPaginacao.itensPorPagina.toString());
    }
    if (novaOrdenacao.coluna !== 'nome') {
      params.set('coluna', novaOrdenacao.coluna);
    }
    if (novaOrdenacao.direcao !== 'asc') {
      params.set('direcao', novaOrdenacao.direcao);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/atendentes?${queryString}` : '/atendentes';
    
    router.push(newUrl, { scroll: false });
  }, [router]);

  /**
   * Manipuladores de eventos
   */
  const handleFiltroChange = useCallback((novosFiltros: FiltrosAtendente) => {
    setFiltros(novosFiltros);
    const novaPaginacao = { ...paginacao, paginaAtual: 1 };
    setPaginacao(novaPaginacao);
    atualizarURL(novosFiltros, ordenacao, novaPaginacao);
    
    // Notificação informativa sobre aplicação de filtros
    const temFiltros = Object.values(novosFiltros).some(valor => valor && valor !== '');
    if (temFiltros) {
      showInfo('Filtros aplicados. Carregando resultados...');
    } else {
      showInfo('Filtros removidos. Carregando todos os atendentes...');
    }
    
    buscarAtendentes(novosFiltros, ordenacao, 1, paginacao.itensPorPagina);
  }, [ordenacao, paginacao, atualizarURL, buscarAtendentes, showInfo]);

  const handleOrdenacaoChange = useCallback((novaOrdenacao: OrdenacaoAtendente) => {
    setOrdenacao(novaOrdenacao);
    atualizarURL(filtros, novaOrdenacao, paginacao);
    
    // Notificação informativa sobre mudança de ordenação
    const direcaoTexto = novaOrdenacao.direcao === 'asc' ? 'crescente' : 'decrescente';
    showInfo(`Ordenando por ${novaOrdenacao.coluna} (${direcaoTexto})`);
    
    buscarAtendentes(filtros, novaOrdenacao, paginacao.paginaAtual, paginacao.itensPorPagina);
  }, [filtros, paginacao, atualizarURL, buscarAtendentes, showInfo]);

  const handlePaginacaoChange = useCallback((novaPaginacao: Partial<PaginacaoAtendentes>) => {
    const paginacaoAtualizada = { ...paginacao, ...novaPaginacao };
    setPaginacao(paginacaoAtualizada);
    atualizarURL(filtros, ordenacao, paginacaoAtualizada);
    buscarAtendentes(filtros, ordenacao, paginacaoAtualizada.paginaAtual, paginacaoAtualizada.itensPorPagina);
  }, [filtros, ordenacao, paginacao, atualizarURL, buscarAtendentes, setPaginacao]);

  const handleRecarregar = useCallback(() => {
    showInfo('Recarregando lista de atendentes...');
    buscarAtendentes();
  }, [buscarAtendentes, showInfo]);

  // Efeito inicial para carregar dados
  useEffect(() => {
    buscarAtendentes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Evitar execução na página de login ou outras rotas públicas
  if (pathname === '/login' || pathname === '/changelog') {
    return null;
  }

  // Renderização de erro
  if (erro) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar atendentes
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{erro}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão de novo atendente */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setModalNovoAtendenteAberto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Atendente
        </Button>
      </div>
      
      {/* Filtros */}
      {carregando && !atendentes.length ? (
        <FiltrosLoading />
      ) : (
        <FiltrosAtendentes
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          carregando={carregando}
        />
      )}
      
      {/* Tabela */}
      {carregando && !atendentes.length ? (
        <TabelaLoading />
      ) : (
        <TabelaAtendentes
          atendentes={atendentes}
          filtros={filtros}
          ordenacao={ordenacao}
          paginacao={paginacao}
          carregando={carregando}
          onFiltroChange={handleFiltroChange}
          onOrdenacaoChange={handleOrdenacaoChange}
          onPaginacaoChange={handlePaginacaoChange}
          onRecarregar={handleRecarregar}
        />
      )}
      
      {/* Modal de Novo Atendente */}
      <ModalNovoAtendente 
        aberto={modalNovoAtendenteAberto}
        onFechar={() => setModalNovoAtendenteAberto(false)}
        onAtendenteCriado={handleRecarregar}
      />
    </div>
  );
}