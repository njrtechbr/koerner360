'use client'

import { useEffect, useState } from 'react'

export default function TestDirectPage() {
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste Direto de Sessão</h1>
      
      {loading && (
        <div className="text-blue-600">Carregando sessão...</div>
      )}
      
      {error && (
        <div className="text-red-600">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Dados da Sessão:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}