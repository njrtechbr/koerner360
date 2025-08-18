/**
 * Página principal de gerenciamento de atendentes
 * /app/atendentes - Lista e gerencia atendentes do sistema
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TipoUsuario } from '@prisma/client';
import { MainLayout } from '@/components/layout/main-layout';
import { AtendentesWrapper } from '@/components/atendentes/atendentes-wrapper';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, UserX, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gerenciamento de Atendentes | Koerner 360',
  description: 'Gerencie atendentes, visualize estatísticas e controle avaliações no sistema Koerner 360.'
};

interface PageProps {
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
 * Componente de loading para a tabela de atendentes
 */
function TabelaAtendentesLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          
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
 * Página principal de gerenciamento de atendentes
 */
export default async function AtendentesPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar se o usuário tem permissão para acessar esta página
  if (session.user.userType === TipoUsuario.ATENDENTE) {
    redirect('/dashboard');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendentes</h1>
          <p className="text-muted-foreground">
            Gerencie atendentes, visualize estatísticas e controle avaliações.
          </p>
        </div>
      </div>



      {/* Cards de ações rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/atendentes?status=ATIVO" prefetch={false}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendentes Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Visualizar todos os atendentes ativos
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/atendentes?status=FERIAS" prefetch={false}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Férias</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Atendentes em período de férias
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/atendentes?status=AFASTADO" prefetch={false}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afastados</CardTitle>
              <UserX className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Atendentes temporariamente afastados
              </p>
            </CardContent>
          </Link>
        </Card>


      </div>

      {/* Filtros e tabela de atendentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Atendentes</CardTitle>
              <CardDescription>
                Visualize, filtre e gerencie todos os atendentes do sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros e Tabela */}
            <Suspense fallback={<TabelaAtendentesLoading />}>
              <AtendentesWrapper searchParams={searchParams} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
      </div>
      

    </MainLayout>
  );
}