/**
 * Página de debug para usuários
 */

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { canManageUsers, TipoUsuario } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function UsuariosDebugPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  const podeGerenciarUsuarios = canManageUsers(session.user.userType as TipoUsuario);
  if (!podeGerenciarUsuarios) {
    redirect('/dashboard');
  }

  let usuarios: any[] = [];
  let erro: string | null = null;

  try {
    usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true,
      },
      take: 5,
      orderBy: { criadoEm: 'desc' },
    });
  } catch (error) {
    erro = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug - Usuários</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Sessão:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              userType: session.user.userType,
              supervisorId: session.user.supervisorId
            }, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Pode gerenciar usuários:</strong> {podeGerenciarUsuarios ? 'Sim' : 'Não'}
        </div>

        {erro && (
          <div>
            <strong>Erro:</strong>
            <pre className="bg-red-100 p-4 rounded mt-2 text-red-800">
              {erro}
            </pre>
          </div>
        )}

        <div>
          <strong>Usuários encontrados:</strong> {usuarios.length}
          {usuarios.length > 0 && (
            <pre className="bg-gray-100 p-4 rounded mt-2">
              {JSON.stringify(usuarios, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}