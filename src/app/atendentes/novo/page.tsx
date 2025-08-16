/**
 * Página para criar novo atendente
 * /app/atendentes/novo - Formulário de criação de atendente
 */

import { Metadata } from 'next';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import { TipoUsuario } from '@prisma/client';
import { FormularioAtendente } from '@/components/atendentes/formulario-atendente';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Novo Atendente | Koerner 360',
  description: 'Adicione um novo atendente ao sistema Koerner 360.'
};

/**
 * Página para criar novo atendente
 */
export default async function NovoAtendentePage() {
  // Verificar autenticação
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Verificar permissões - apenas admin e supervisor podem criar atendentes
  if (session.user.userType === TipoUsuario.ATENDENTE) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/atendentes" prefetch={false}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Atendente</h1>
          <p className="text-muted-foreground">
            Preencha as informações para adicionar um novo atendente ao sistema.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Atendente</CardTitle>
            <CardDescription>
              Todos os campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioAtendente modo="criar" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}