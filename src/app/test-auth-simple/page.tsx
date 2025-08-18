import { auth } from '@/auth';

export default async function TestAuthPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Sessão existe:</strong> {session ? 'Sim' : 'Não'}
        </div>
        
        {session && (
          <>
            <div>
              <strong>ID:</strong> {session.user.id}
            </div>
            <div>
              <strong>Nome:</strong> {session.user.name}
            </div>
            <div>
              <strong>Email:</strong> {session.user.email}
            </div>
            <div>
              <strong>Tipo:</strong> {session.user.userType}
            </div>
            <div>
              <strong>Supervisor ID:</strong> {session.user.supervisorId || 'N/A'}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8">
        <a href="/usuarios" className="text-blue-600 underline">
          Ir para página de usuários
        </a>
      </div>
    </div>
  );
}