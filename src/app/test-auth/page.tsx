import { auth } from '@/auth'

export default async function TestAuthPage() {
  const session = await auth()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Dados da Sessão:</h2>
        <pre className="text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Status: {session ? 'Autenticado' : 'Não autenticado'}
        </p>
        {session?.user && (
          <p className="text-sm text-gray-600">
            Usuário: {session.user.nome} ({session.user.email})
          </p>
        )}
      </div>
    </div>
  )
}