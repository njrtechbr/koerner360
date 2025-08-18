/**
 * Página principal de gerenciamento de usuários
 * /app/usuarios - Lista e gerencia usuários do sistema
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TipoUsuario } from '@prisma/client';
import { canManageUsers } from '@/lib/permissions';
import { UsuariosWrapper } from '@/components/usuarios/usuarios-wrapper';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, Shield, UserCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Usuários | Koerner 360',
  description: 'Gerenciamento de usuários do sistema Koerner 360',
};

interface UsuariosPageProps {
  searchParams: {
    pagina?: string;
    limite?: string;
    busca?: string;
    tipo?: TipoUsuario;
    ativo?: string;
    ordenacao?: string;
    direcao?: 'asc' | 'desc';
  };
}

// Componentes de carregamento
function FiltrosLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function TabelaLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



/**
 * Página de gerenciamento de usuários
 */
export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  const podeGerenciarUsuarios = canManageUsers(session.user.tipo);
  if (!podeGerenciarUsuarios) {
    redirect('/dashboard');
  }

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
          <Link href="/usuarios/novo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/usuarios?ativo=true" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">-</div>
              <p className="text-xs text-muted-foreground">
                Usuários com acesso ativo
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/usuarios?tipo=admin" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">-</div>
              <p className="text-xs text-muted-foreground">
                Usuários com acesso total
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/usuarios?ativo=false" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-</div>
              <p className="text-xs text-muted-foreground">
                Usuários desativados
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Seção de filtros e tabela */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Usuários
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-6">
                  <FiltrosLoading />
                  <TabelaLoading />
                </div>
              }
            >
              <UsuariosWrapper searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}