/**
 * Página principal de gerenciamento de usuários
 */

import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { canManageUsers } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Eye, Edit, UserX } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Usuários | Koerner 360',
  description: 'Gerenciamento de usuários do sistema Koerner 360',
};

interface UsuariosPageProps {
  searchParams: {
    pagina?: string;
    limite?: string;
    busca?: string;
    tipoUsuario?: string;
    ativo?: string;
  };
}

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
    ADMIN: 'bg-red-100 text-red-800',
    SUPERVISOR: 'bg-blue-100 text-blue-800',
    ATENDENTE: 'bg-green-100 text-green-800',
    CONSULTOR: 'bg-purple-100 text-purple-800'
  };
  return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

async function buscarUsuarios(searchParams: UsuariosPageProps['searchParams']) {
  try {
    const session = await auth();
    if (!session) return { usuarios: [], total: 0 };

    const page = parseInt(searchParams.pagina || '1');
    const limit = parseInt(searchParams.limite || '10');
    const search = searchParams.busca || '';
    const tipoUsuario = searchParams.tipoUsuario || '';
    const ativo = searchParams.ativo;
    
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    // Filtro baseado no tipo de usuário logado
    if (session.user.userType === 'SUPERVISOR') {
      where.OR = [
        { supervisorId: session.user.id },
        { id: session.user.id }
      ];
    }
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }
    
    if (ativo !== null && ativo !== undefined && ativo !== '') {
      where.ativo = ativo === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          ativo: true,
          criadoEm: true,
          supervisorId: true,
          supervisor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    return { usuarios, total };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { usuarios: [], total: 0 };
  }
}

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  const podeGerenciarUsuarios = canManageUsers(session.user.userType);
  if (!podeGerenciarUsuarios) {
    redirect('/dashboard');
  }

  const { usuarios, total } = await buscarUsuarios(searchParams);
  const podeCriar = session.user.userType === 'ADMIN';
  const podeEditar = session.user.userType === 'ADMIN' || session.user.userType === 'SUPERVISOR';

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
            <Link href="/usuarios/novo">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Usuários no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usuarios.filter(u => u.ativo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com acesso ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usuarios.filter(u => u.tipoUsuario === 'ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com acesso total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>
            {total} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
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
                <Card key={usuario.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{usuario.nome}</div>
                        {usuario.supervisor && (
                          <div className="text-sm text-muted-foreground">
                            Supervisor: {usuario.supervisor.nome}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-3">
                        <div className="text-sm">{usuario.email}</div>
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/usuarios/${usuario.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {podeEditar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/usuarios/${usuario.id}?tab=editar`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}