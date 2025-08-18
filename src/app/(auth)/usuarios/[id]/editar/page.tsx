/**
 * Página de edição de usuário
 */

import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { canManageUsers } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FormularioEditarUsuario } from '@/components/usuarios/formulario-editar-usuario';

export const metadata: Metadata = {
  title: 'Editar Usuário | Koerner 360',
  description: 'Editar informações do usuário no sistema Koerner 360',
};

interface EditarUsuarioPageProps {
  params: {
    id: string;
  };
}

async function buscarUsuario(id: string, session: any) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true,
          },
        },
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    if (!usuario) {
      return null;
    }

    // Verificar se o supervisor pode acessar este usuário
    if (session.user.userType === 'SUPERVISOR') {
      const podeAcessar = usuario.supervisorId === session.user.id || usuario.id === session.user.id;
      if (!podeAcessar) {
        return null;
      }
    }

    return usuario;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

async function buscarSupervisores() {
  try {
    return await prisma.usuario.findMany({
      where: {
        tipoUsuario: 'SUPERVISOR',
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar supervisores:', error);
    return [];
  }
}

export default async function EditarUsuarioPage({ params }: EditarUsuarioPageProps) {

  
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  const podeGerenciarUsuarios = canManageUsers(session.user.userType as any);
  if (!podeGerenciarUsuarios) {
    redirect('/dashboard');
  }

  const [usuario, supervisores] = await Promise.all([
    buscarUsuario(params.id, session),
    buscarSupervisores(),
  ]);

  if (!usuario) {
    notFound();
  }

  const podeEditarTipo = session.user.userType === 'ADMIN';
  const podeEditarSupervisor = session.user.userType === 'ADMIN';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/usuarios/${usuario.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Usuário</h1>
          <p className="text-muted-foreground">
            Editar informações de {usuario.nome}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Atualize as informações básicas do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioEditarUsuario
                usuario={usuario}
                supervisores={supervisores}
                podeEditarTipo={podeEditarTipo}
                podeEditarSupervisor={podeEditarSupervisor}
                userType={session.user.userType}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Informações do usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="text-sm font-mono">{usuario.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                <p className="text-sm">
                  {new Date(usuario.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última atualização</label>
                <p className="text-sm">
                  {new Date(usuario.atualizadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações perigosas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis que afetam o usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Desativar usuário</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    O usuário não poderá mais fazer login no sistema
                  </p>
                  <Button variant="destructive" size="sm" disabled>
                    Desativar Usuário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}