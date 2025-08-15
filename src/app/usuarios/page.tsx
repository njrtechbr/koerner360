'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Users,
  Loader2,
} from 'lucide-react';

// Importar componentes específicos de usuários
import { FormularioUsuario } from '@/components/usuarios/formulario-usuario';
import { DetalhesUsuario } from '@/components/usuarios/detalhes-usuario';
import { ConfirmarDesativacao } from '@/components/usuarios/confirmar-desativacao';
import { FiltrosUsuariosComponent, type FiltrosUsuarios } from '@/components/usuarios/filtros-usuarios';
import { TabelaUsuarios } from '@/components/usuarios/tabela-usuarios';
import { PaginacaoUsuarios } from '@/components/usuarios/paginacao-usuarios';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  supervisorId?: string;
  supervisor?: {
    id: string;
    nome: string;
  };
  _count?: {
    atendentesSupervisionados?: number;
    avaliacoes?: number;
    feedbacks?: number;
  };
}

interface PaginacaoInfo {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

type ModalTipo = 'criar' | 'editar' | 'detalhes' | 'desativar' | null;

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [permissoes, setPermissoes] = useState({
    podeGerenciarUsuarios: false,
    podeVerUsuarios: false,
    podeEditarUsuarios: false,
    podeDesativarUsuarios: false,
    usuarioAtualId: ''
  });
  
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    busca: '',
    tipoUsuario: '',
    ativo: '',
    supervisorId: '',
  });
  
  // Estados para paginação
  const [paginacao, setPaginacao] = useState<PaginacaoInfo>({
    paginaAtual: 1,
    totalPaginas: 0,
    totalItens: 0,
    itensPorPagina: 10,
    temProximaPagina: false,
    temPaginaAnterior: false,
  });

  // Carregar usuários
  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      // Usar valores padrão se a paginação não estiver inicializada
      const paginaAtual = paginacao?.paginaAtual || 1;
      const itensPorPagina = paginacao?.itensPorPagina || 10;

      const params = new URLSearchParams({
        pagina: paginaAtual.toString(),
        limite: itensPorPagina.toString(),
      });

      if (filtros.busca) params.append('busca', filtros.busca);
      if (filtros.tipoUsuario) params.append('tipoUsuario', filtros.tipoUsuario);
      if (filtros.ativo) params.append('ativo', filtros.ativo);
      if (filtros.supervisorId) params.append('supervisorId', filtros.supervisorId);

      const response = await fetch(`/api/usuarios?${params}`);
      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (response.status === 403) {
        setErro('Você não tem permissão para acessar esta página.');
        setCarregando(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao carregar usuários');
      }

      setUsuarios(data.data.usuarios);
      setPaginacao({
        paginaAtual: data.data.paginacao.paginaAtual,
        totalPaginas: data.data.paginacao.totalPaginas,
        totalItens: data.data.paginacao.totalItens,
        itensPorPagina: data.data.paginacao.itensPorPagina,
        temProximaPagina: data.data.paginacao.temProximaPagina,
        temPaginaAnterior: data.data.paginacao.temPaginaAnterior,
      });
      
      // Verificar permissões baseado na resposta da API
      // Se conseguiu acessar a API, tem pelo menos permissão de visualização
      setPermissoes({
        podeGerenciarUsuarios: true, // Será refinado baseado no tipo de usuário
        podeVerUsuarios: true,
        podeEditarUsuarios: true, // Será refinado baseado no tipo de usuário
        podeDesativarUsuarios: true, // Será refinado baseado no tipo de usuário
        usuarioAtualId: '' // Será obtido da sessão se necessário
      });
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  }, [filtros, paginacao, router]);

  // Efeito para carregar usuários
  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  // Efeito separado para mudanças de paginação
  useEffect(() => {
    if (paginacao.paginaAtual > 0) { // Só executa se paginaAtual foi inicializada
      carregarUsuarios();
    }
  }, [carregarUsuarios, paginacao.paginaAtual, paginacao.itensPorPagina]);

  // Funções de manipulação dos modais
  const abrirModal = (tipo: ModalTipo, usuario?: Usuario) => {
    setModalTipo(tipo);
    setUsuarioSelecionado(usuario || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalTipo(null);
    setUsuarioSelecionado(null);
  };

  const handleSalvarUsuario = () => {
    fecharModal();
    carregarUsuarios();
  };

  const handleDesativarUsuario = () => {
    fecharModal();
    carregarUsuarios();
  };

  // Funções de manipulação de filtros e paginação
  const handleFiltrosChange = (novosFiltros: FiltrosUsuarios) => {
    setFiltros(novosFiltros);
    setPaginacao(prev => ({ ...prev, paginaAtual: 1 })); // Reset para primeira página
  };

  const handleLimparFiltros = () => {
    setFiltros({
      busca: '',
      tipoUsuario: '',
      ativo: '',
      supervisorId: '',
    });
    setPaginacao(prev => ({ ...prev, paginaAtual: 1 }));
  };

  const handlePaginaChange = (novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, paginaAtual: novaPagina }));
  };

  const handleItensPorPaginaChange = (novosItens: number) => {
    setPaginacao(prev => ({
      ...prev,
      itensPorPagina: novosItens,
      paginaAtual: 1,
    }));
  };

  // As permissões agora são gerenciadas pelo estado local
  // e são definidas quando a API é chamada com sucesso
  const podeGerenciarUsuarios = permissoes.podeGerenciarUsuarios;
  const podeEditarUsuarios = permissoes.podeEditarUsuarios;
  const podeDesativarUsuarios = permissoes.podeDesativarUsuarios;

  // A verificação de permissões agora é feita após carregar os dados
  if (erro && erro.includes('permissão')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                {erro}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, permissões e acessos do sistema
            </p>
          </div>
        </div>
        {podeGerenciarUsuarios && (
          <Button onClick={() => abrirModal('criar')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Erro */}
      {erro && (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <FiltrosUsuariosComponent
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={handleLimparFiltros}
      />

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({paginacao.totalItens})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <TabelaUsuarios
                usuarios={usuarios}
                carregando={carregando}
                onVerDetalhes={(usuario) => abrirModal('detalhes', usuario)}
                onEditar={(usuario) => abrirModal('editar', usuario)}
                onDesativar={(usuario) => abrirModal('desativar', usuario)}
                podeEditar={podeEditarUsuarios}
                podeDesativar={podeDesativarUsuarios}
              />

              <PaginacaoUsuarios
                paginacao={paginacao}
                onPaginaChange={handlePaginaChange}
                onItensPorPaginaChange={handleItensPorPaginaChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <Dialog open={modalAberto && modalTipo === 'criar'} onOpenChange={(open) => !open && fecharModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <FormularioUsuario
            onSalvar={handleSalvarUsuario}
            onCancelar={fecharModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalAberto && modalTipo === 'editar'} onOpenChange={(open) => !open && fecharModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <FormularioUsuario
            usuario={usuarioSelecionado}
            onSalvar={handleSalvarUsuario}
            onCancelar={fecharModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalAberto && modalTipo === 'detalhes'} onOpenChange={(open) => !open && fecharModal()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {usuarioSelecionado && (
            <DetalhesUsuario
              usuarioId={usuarioSelecionado.id}
              onFechar={fecharModal}
              onEditar={() => {
                setModalTipo('editar');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmarDesativacao
        usuario={usuarioSelecionado}
        aberto={modalAberto && modalTipo === 'desativar'}
        onConfirmar={handleDesativarUsuario}
        onCancelar={fecharModal}
      />
      </div>
    </MainLayout>
  );
}