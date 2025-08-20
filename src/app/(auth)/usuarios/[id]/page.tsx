/**
 * Página para visualizar e editar usuário
 * /app/usuarios/[id] - Detalhes e edição de usuário específico
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, type TipoUsuario } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import UsuarioDetailsPage from './usuario-details-page';

interface PageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
}

export default async function UsuarioPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userType = session.user.userType as TipoUsuario;
  if (!hasPermission(userType, 'podeVisualizarUsuarios')) {
    redirect('/dashboard');
  }

  const usuario = await buscarUsuario(params.id);
  if (!usuario) {
    notFound();
  }

  if (userType === 'SUPERVISOR' && usuario.supervisorId !== session.user.id && usuario.id !== session.user.id) {
    redirect('/dashboard');
  }

  const tabAtiva = searchParams.tab || 'detalhes';
  const podeEditar = hasPermission(userType, 'podeEditarUsuarios');

  return (
    <div className="flex-1 space-y-6 p-6">
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

      <UsuarioDetailsPage 
        usuario={usuario} 
        podeEditar={podeEditar} 
        tabAtiva={tabAtiva} 
      />
    </div>
  );
}