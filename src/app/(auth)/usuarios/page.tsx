/**
 * Página principal de gerenciamento de usuários - CRUD Completo
 */

import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { canManageUsers } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Eye, Edit, UserX, Search, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import dynamic from 'next/dynamic';

// Lazy loading para componentes pesados
const UsuarioActions = dynamic(() => 
  import('@/components/usuarios/usuario-actions').then(mod => ({ default: mod.UsuarioActions })),
  { 
    loading: () => <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />
  }
);
import { EstatisticasUsuarios } from '@/components/usuarios/estatisticas-usuarios';
import { FiltrosUsuariosAvancados } from '@/components/usuarios/filtros-usuarios-avancados';
import { UsuariosService } from '@/lib/services/usuarios-service';

export const metadata: Metadata = {
  title: 'Usuários | Koerner 360',
  description: 'Gerenciamento de usuários do sistema Koerner 360',
};

// Constantes para evitar magic numbers
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT_COLUMN = 'nome';
const DEFAULT_SORT_DIRECTION = 'asc' as const;

// Campos selecionados para otimizar consultas
const USUARIO_SELECT_FIELDS = {
  id: true,
  nome: true,
  email: true,
  userType: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true,
  supervisorId: true,
  supervisor: {
    select: {
      id: true,
      nome: true,
    },
  },
  _count: {
    select: {
      supervisoes: true,
      avaliacoesFeitas: true,
      avaliacoesRecebidas: true,
    }
  }
} as const;

// Helper para criar resposta paginada
function createPaginatedResponse(usuarios: any[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    usuarios,
    total,
    paginacao: {
      paginaAtual: page,
      totalPaginas: totalPages,
      totalItens: total,
      itensPorPagina: limit,
      temProximaPagina: page < totalPages,
      temPaginaAnterior: page > 1,
    }
  };
}

interface UsuariosPageProps {
  searchParams: {
    pagina?: string;
    limite?: string;
    busca?: string;
    tipoUsuario?: string;
    ativo?: string;
    ordenacao?: string;
    direcao?: 'asc' | 'desc';
  };
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  userType: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR';
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  supervisorId: string | null;
  supervisor?: {
    id: string;
    nome: string;
  } | null;
  _count: {
    supervisoes: number;
    avaliacoesFeitas: number;
    avaliacoesRecebidas: number;
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

interface BuscarUsuariosResult {
  usuarios: Usuario[];
  total: number;
  paginacao: PaginacaoInfo | null;
}

type SessionUser = {
  id: string;
  userType: string;
};

const getTipoLabel = (tipo: string) => {
  const labels = {
    ADMIN: 'Admin',
    SUPERVISOR: 'Supervisor',
    ATENDENTE: 'Atendente',
    CONSULTOR: 'Consultor'
  };
  return labels[tipo as keyof typeof labels] || tipo;
};

const getTipoColor = (tipo: string) => {
  const colors = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    SUPERVISOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ATENDENTE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CONSULTOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };
  return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

async function buscarUsuarios(
  searchParams: UsuariosPageProps['searchParams'], 
  session: { user: SessionUser }
): Promise<BuscarUsuariosResult> {
  try {
    const filtros = UsuariosService.validarFiltros(searchParams);
    const paginacao = UsuariosService.validarParametrosPaginacao(searchParams);
    
    const resultado = await UsuariosService.buscarUsuarios(
      filtros,
      paginacao,
      session.user.userType,
      session.user.id
    );

    return {
      usuarios: resultado.usuarios,
      total: resultado.total,
      paginacao: resultado.paginacao
    };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { usuarios: [], total: 0, paginacao: null };
  }
}

import { UsuariosPageErrorBoundary } from '@/components/usuarios/usuarios-error-boundary';

async function UsuariosPageContent({ searchParams }: { searchParams: Awaited<UsuariosPageProps['searchParams']> }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  const podeGerenciarUsuarios = canManageUsers(session.user.userType as any);
  if (!podeGerenciarUsuarios) {
    redirect('/dashboard');
  }

  const { usuarios, total, paginacao } = await buscarUsuarios(searchParams, session);
  
  const podeCriar = session.user.userType === 'ADMIN';
  const podeEditar = session.user.userType === 'ADMIN' || session.user.userType === 'SUPERVISOR';
  const podeDesativar = session.user.userType === 'ADMIN';

  // Estatísticas calculadas de forma otimizada
  const estatisticas = UsuariosService.calcularEstatisticas(usuarios);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários do sistema Koerner 360
          </p>
        </div>
        <div className="flex gap-2">
          {podeCriar && (
            <Button asChild>
              <Link href="/usuarios/novo">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/usuarios">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <EstatisticasUsuarios
        total={estatisticas.total}
        usuariosAtivos={estatisticas.usuariosAtivos}
        admins={estatisticas.admins}
        supervisores={estatisticas.supervisores}
      />

      {/* Filtros */}
      <FiltrosUsuariosAvancados searchParams={searchParams} />

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>
            {paginacao ? `Página ${paginacao.paginaAtual} de ${paginacao.totalPaginas} • ${paginacao.totalItens} usuário(s) encontrado(s)` : `${usuarios.length} usuário(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchParams.busca || searchParams.tipoUsuario || searchParams.ativo 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando um novo usuário.'
                }
              </p>
              {podeCriar && (
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/usuarios/novo">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Usuário
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header da tabela */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
                <div className="col-span-3">Nome</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Criado</div>
                <div className="col-span-1">Ações</div>
              </div>

              {/* Linhas da tabela */}
              {usuarios.map((usuario) => (
                <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{usuario.nome}</div>
                        {usuario.supervisor && (
                          <div className="text-sm text-muted-foreground">
                            Supervisor: {usuario.supervisor.nome}
                          </div>
                        )}
                        {usuario._count.supervisoes > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {usuario._count.supervisoes} supervisionado(s)
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-3">
                        <div className="text-sm">{usuario.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {usuario._count.avaliacoesFeitas} avaliações feitas
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <Badge className={getTipoColor(usuario.tipoUsuario)}>
                          {getTipoLabel(usuario.tipoUsuario)}
                        </Badge>
                      </div>
                      
                      <div className="col-span-1">
                        <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(usuario.criadoEm), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <UsuarioActions 
                          usuario={usuario}
                          podeEditar={podeEditar}
                          podeDesativar={podeDesativar}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {paginacao && paginacao.totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {((paginacao.paginaAtual - 1) * paginacao.itensPorPagina) + 1} a {Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, paginacao.totalItens)} de {paginacao.totalItens} usuários
              </div>
              
              <div className="flex items-center gap-2">
                {paginacao.temPaginaAnterior && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/usuarios?${new URLSearchParams({
                      ...(searchParams.busca && { busca: searchParams.busca }),
                      ...(searchParams.tipoUsuario && { tipoUsuario: searchParams.tipoUsuario }),
                      ...(searchParams.ativo && { ativo: searchParams.ativo }),
                      ...(searchParams.ordenacao && { ordenacao: searchParams.ordenacao }),
                      ...(searchParams.direcao && { direcao: searchParams.direcao }),
                      ...(searchParams.limite && { limite: searchParams.limite }),
                      pagina: (paginacao.paginaAtual - 1).toString()
                    }).toString()}`}>
                      Anterior
                    </Link>
                  </Button>
                )}
                
                <span className="text-sm">
                  Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                </span>
                
                {paginacao.temProximaPagina && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/usuarios?${new URLSearchParams({
                      ...(searchParams.busca && { busca: searchParams.busca }),
                      ...(searchParams.tipoUsuario && { tipoUsuario: searchParams.tipoUsuario }),
                      ...(searchParams.ativo && { ativo: searchParams.ativo }),
                      ...(searchParams.ordenacao && { ordenacao: searchParams.ordenacao }),
                      ...(searchParams.direcao && { direcao: searchParams.direcao }),
                      ...(searchParams.limite && { limite: searchParams.limite }),
                      pagina: (paginacao.paginaAtual + 1).toString()
                    }).toString()}`}>
                      Próxima
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function UsuariosPage(props: UsuariosPageProps) {
  const resolvedSearchParams = await props.searchParams;
  return (
    <UsuariosPageErrorBoundary>
      <UsuariosPageContent searchParams={resolvedSearchParams} />
    </UsuariosPageErrorBoundary>
  );
}