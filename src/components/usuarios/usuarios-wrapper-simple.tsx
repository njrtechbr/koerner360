'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiltrosUsuariosComponent, FiltrosUsuarios } from './filtros-usuarios-simple';
import { TabelaUsuarios } from './tabela-usuarios-simple';
import { PaginacaoUsuarios } from './paginacao-usuarios-simple';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

export function UsuariosWrapper({ searchParams, podeCriar, podeEditar, podeDesativar }: UsuariosWrapperProps) {
  const router = useRouter();
  
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Filtros iniciais
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    busca: searchParams.search || '',
    tipoUsuario: searchParams.tipoUsuario || '',
    ativo: searchParams.ativo || '',
    supervisorId: searchParams.supervisorId || ''
  });

  // Paginação inicial
  const [paginacao, setPaginacao] = useState<PaginacaoUsuarios>({
    paginaAtual: parseInt(searchParams.pagina || '1'),
    totalPaginas: 1,
    totalItens: 0,
    itensPorPagina: parseInt(searchParams.limite || '10'),
    temProximaPagina: false,
    temPaginaAnterior: false,
  });

  // Ordenação inicial
  const [ordenacao, setOrdenacao] = useState({
    coluna: (searchParams.coluna as 'nome' | 'email' | 'tipoUsuario' | 'ativo' | 'criadoEm') || 'nome',
    direcao: (searchParams.direcao as 'asc' | 'desc') || 'asc'
  });

  // Buscar usuários
  const buscarUsuarios = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const params = new URLSearchParams();
      
      if (filtros.busca) params.append('search', filtros.busca);
      if (filtros.tipoUsuario) params.append('tipoUsuario', filtros.tipoUsuario);
      if (filtros.ativo) params.append('ativo', filtros.ativo);
      if (filtros.supervisorId) params.append('supervisorId', filtros.supervisorId);
      
      params.append('pagina', paginacao.paginaAtual.toString());
      params.append('limite', paginacao.itensPorPagina.toString());
      params.append('coluna', ordenacao.coluna);
      params.append('direcao', ordenacao.direcao);

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
        itensPorPagina: 10,
        temProximaPagina: false,
        temPaginaAnterior: false,
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    buscarUsuarios();
  }, [filtros, paginacao.paginaAtual, paginacao.itensPorPagina, ordenacao, buscarUsuarios]);

  // Manipular filtros
  const handleFiltrosChange = (novosFiltros: FiltrosUsuarios) => {
    setFiltros(novosFiltros);
    setPaginacao(prev => ({ ...prev, paginaAtual: 1 }));
    
    // Atualizar URL
    const params = new URLSearchParams();
    if (novosFiltros.busca) params.append('search', novosFiltros.busca);
    if (novosFiltros.tipoUsuario) params.append('tipoUsuario', novosFiltros.tipoUsuario);
    if (novosFiltros.ativo) params.append('ativo', novosFiltros.ativo);
    if (novosFiltros.supervisorId) params.append('supervisorId', novosFiltros.supervisorId);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/usuarios?${queryString}` : '/usuarios';
    router.push(newUrl, { scroll: false });
    
    // Buscar com novos filtros
    setTimeout(buscarUsuarios, 100);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      tipoUsuario: '',
      ativo: '',
      supervisorId: ''
    };
    setFiltros(filtrosLimpos);
    setPaginacao(prev => ({ ...prev, paginaAtual: 1 }));
    router.push('/usuarios', { scroll: false });
    setTimeout(buscarUsuarios, 100);
  };

  // Manipular paginação
  const handlePaginaChange = (novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, paginaAtual: novaPagina }));
    setTimeout(buscarUsuarios, 100);
  };

  const handleItensPorPaginaChange = (novosItens: number) => {
    setPaginacao(prev => ({ 
      ...prev, 
      itensPorPagina: novosItens,
      paginaAtual: 1 
    }));
    setTimeout(buscarUsuarios, 100);
  };

  // Manipular ordenação
  const handleOrdenacaoChange = (novaOrdenacao: typeof ordenacao) => {
    setOrdenacao(novaOrdenacao);
    setTimeout(buscarUsuarios, 100);
  };

  // Ações da tabela
  const handleVerDetalhes = (usuario: Usuario) => {
    router.push(`/usuarios/${usuario.id}`);
  };

  const handleEditar = (usuario: Usuario) => {
    router.push(`/usuarios/${usuario.id}?tab=editar`);
  };

  const handleDesativar = async (usuario: Usuario) => {
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: false }),
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar usuário');
      }

      // Recarregar dados
      buscarUsuarios();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
    }
  };

  if (erro && !carregando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar usuários: {erro}</p>
            <Button onClick={buscarUsuarios} variant="outline">
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
      <FiltrosUsuariosComponent
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={handleLimparFiltros}
      />

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
        </CardContent>
      </Card>
    </div>
  );
}