/**
 * Página de usuários melhorada - Aplicando padrões de design
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PermissionsUtils } from '@/lib/permissions/permissions-utils'
import { UsuariosWrapper } from '@/components/usuarios/usuarios-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import type { TipoUsuario } from '@prisma/client'

interface PageProps {
  searchParams: {
    search?: string
    tipoUsuario?: string
    ativo?: string
    supervisorId?: string
    pagina?: string
    limite?: string
    coluna?: string
    direcao?: string
  }
}

export const metadata: Metadata = {
  title: 'Usuários | Koerner 360',
  description: 'Gerenciamento de usuários do sistema Koerner 360.',
}

/**
 * Skeleton de loading para a página
 */
function UsuariosPageSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Página principal de usuários
 */
export default async function UsuariosPage({ searchParams }: PageProps) {
  // Verificar autenticação
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const tipoUsuario = session.user.userType as TipoUsuario

  // Verificar permissões usando o utilitário centralizado
  const permissoes = PermissionsUtils.obterPermissoes(tipoUsuario)
  
  if (!permissoes.podeVisualizarTodos && !permissoes.podeVisualizarEquipe) {
    redirect('/dashboard')
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>
        
        {permissoes.podeCriar && (
          <Button asChild>
            <Link href="/usuarios/novo" prefetch={false}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Link>
          </Button>
        )}
      </div>

      {/* Conteúdo principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsuariosTableSkeleton />}>
            <UsuariosWrapper 
              searchParams={searchParams}
              podeCriar={permissoes.podeCriar}
              podeEditar={permissoes.podeEditar}
              podeDesativar={permissoes.podeDesativar}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Skeleton específico para a tabela de usuários
 */
function UsuariosTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtros skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Tabela skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginação skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}