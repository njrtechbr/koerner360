/**
 * Página para visualizar e editar usuário
 * /app/usuarios/[id] - Detalhes e edição de usuário específico
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
// import { TipoUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DetalhesUsuario } from '@/components/usuarios/detalhes-usuario';
import { FormularioUsuario } from '@/components/usuarios/formulario-usuario';
import { hasPermission } from '@/lib/permissions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Edit, Shield } from 'lucide-react';
import Link from 'next/link';

import { type TipoUsuario } from '@/lib/permissions'

interface PageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const usuario = await buscarUsuario(params.id);
    
    if (!usuario) {
      return {
        title: 'Usuário não encontrado | Koerner 360',
        description: 'O usuário solicitado não foi encontrado no sistema.'
      };
    }

    return {
      title: `${usuario.nome} | Koerner 360`,
      description: `Detalhes e configurações do usuário ${usuario.nome} no sistema Koerner 360.`
    };
  } catch (_error) {
    return {
      title: 'Usuário | Koerner 360',
      description: 'Detalhes do usuário no sistema Koerner 360.'
    };
  }
}

/**
 * Buscar dados do usuário
 */
async function buscarUsuario(id: string) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: {
            supervisoes: true,
            avaliacoesFeitas: true
          }
        }
      }
    });

    return usuario;
  } catch (_error) {
    return null;
  }
}

/**
 * Página de detalhes do usuário
 */
export default async function UsuarioPage({ params, searchParams }: PageProps) {
  // Verificar autenticação
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Verificar permissões - apenas admin e supervisor podem visualizar usuários
  if (!hasPermission(session.user.userType as TipoUsuario, 'podeVisualizarUsuarios')) {
    redirect('/dashboard');
  }

  // Buscar dados do usuário
  const usuario = await buscarUsuario(params.id);

  if (!usuario) {
    notFound();
  }

  // Verificar se supervisor pode ver este usuário específico
  if ((session.user.userType as TipoUsuario) === 'SUPERVISOR') {
    // Supervisor só pode ver usuários de sua equipe ou a si mesmo
    if (usuario.supervisorId !== session.user.id && usuario.id !== session.user.id) {
      redirect('/dashboard');
    }
  }

  const tabAtiva = searchParams.tab || 'detalhes';
  const podeEditar = hasPermission(session.user.userType as TipoUsuario, 'podeEditarUsuarios');

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/usuarios" prefetch={false}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{usuario.nome}</h1>
          <p className="text-muted-foreground">
            {usuario.tipoUsuario} • {usuario.email} • {usuario.ativo ? 'Ativo' : 'Inativo'}
          </p>
        </div>
        {podeEditar && (
          <Button asChild>
            <Link href={`/usuarios/${params.id}?tab=editar`} prefetch={false}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs de navegação */}
      <Tabs value={tabAtiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detalhes" asChild>
            <Link href={`/usuarios/${params.id}?tab=detalhes`} prefetch={false} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Detalhes
            </Link>
          </TabsTrigger>
          {podeEditar && (
            <TabsTrigger value="editar" asChild>
              <Link href={`/usuarios/${params.id}?tab=editar`} prefetch={false} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </TabsTrigger>
          )}
          <TabsTrigger value="permissoes" asChild>
            <Link href={`/usuarios/${params.id}?tab=permissoes`} prefetch={false} className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das tabs */}
        <TabsContent value="detalhes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
              <CardDescription>
                Visualize as informações detalhadas do usuário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DetalhesUsuario
                usuarioId={params.id}
                onEditar={() => {}}
                onFechar={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {podeEditar && (
          <TabsContent value="editar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Editar Usuário
                </CardTitle>
                <CardDescription>
                  Modifique as informações do usuário. Campos marcados com * são obrigatórios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormularioUsuario
                  usuario={{
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipoUsuario: usuario.tipoUsuario,
                    ativo: usuario.ativo,
                    supervisorId: usuario.supervisorId || undefined,
                  }}
                  onSalvar={() => {}}
                  onCancelar={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="permissoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões e Acesso
              </CardTitle>
              <CardDescription>
                Visualize as permissões e níveis de acesso do usuário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Tipo de Usuário</h4>
                    <p className="text-sm text-muted-foreground">{usuario.tipoUsuario}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  {usuario.supervisor && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Supervisor</h4>
                      <p className="text-sm text-muted-foreground">
                        {usuario.supervisor.nome} ({usuario.supervisor.email})
                      </p>
                    </div>
                  )}
                  {(usuario._count?.supervisoes ?? 0) > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Atendentes Supervisionados</h4>
                      <p className="text-sm text-muted-foreground">
                        {usuario._count.supervisoes} colaborador(es) supervisionado(s)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Informações do Sistema</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Criado em:</span> {new Date(usuario.criadoEm).toLocaleString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Atualizado em:</span> {new Date(usuario.atualizadoEm).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}