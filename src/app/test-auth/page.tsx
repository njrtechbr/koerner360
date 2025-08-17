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
        
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Session data:', data)
        setSessionData(data)
      } catch (err) {
        console.error('Erro ao buscar sessão:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Dados da Sessão:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(sessionData, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Recarregar
        </button>
      </div>
    </div>
  )
}