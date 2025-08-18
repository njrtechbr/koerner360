/**
 * Página para criar novo usuário
 * /app/usuarios/novo - Formulário de criação de usuário
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
// import { TipoUsuario } from '@prisma/client';
import { FormularioUsuario } from '@/components/usuarios/formulario-usuario';
import { canManageUsers } from '@/lib/permissions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Novo Usuário | Koerner 360',
  description: 'Criar um novo usuário no sistema Koerner 360.',
};

/**
 * Página de criação de novo usuário
 */
export default async function NovoUsuarioPage() {
  // Verificar autenticação
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Verificar permissões - apenas admin pode criar usuários
  if (!canManageUsers(session.user.userType)) {
    redirect('/usuarios');
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
          <p className="text-muted-foreground">
            Crie um novo usuário no sistema. Todos os campos marcados com * são obrigatórios.
          </p>
        </div>
      </div>

      {/* Formulário de criação */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
            <CardDescription>
              Preencha as informações básicas do novo usuário. Uma senha temporária será gerada automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioUsuario onSalvar={() => {}} onCancelar={() => {}} />
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Tipos de Usuário</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Admin:</strong> Acesso total ao sistema, pode gerenciar todos os usuários e configurações.</li>
                <li><strong>Supervisor:</strong> Pode gerenciar atendentes de sua equipe e visualizar relatórios.</li>
                <li><strong>Atendente:</strong> Acesso às suas próprias avaliações e dados de performance.</li>
                <li><strong>Consultor:</strong> Acesso a dashboards comparativos e rankings de performance.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Senha Inicial</h4>
              <p className="text-sm text-muted-foreground">
                Uma senha temporária será gerada automaticamente e enviada por email para o usuário. 
                O usuário deverá alterar a senha no primeiro acesso.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Hierarquia</h4>
              <p className="text-sm text-muted-foreground">
                Atendentes devem ter um supervisor atribuído. Supervisores e Consultores podem opcionalmente 
                ter um supervisor para estruturas hierárquicas mais complexas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}