'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { clearAuthCookies, forceLogout, handleAuthError } from '@/lib/auth-utils'
import { AlertTriangle, TestTube, Trash2, LogOut } from 'lucide-react'

export default function TestJWTPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testClearCookies = () => {
    try {
      clearAuthCookies()
      addResult('✅ Cookies limpos com sucesso')
    } catch (error) {
      addResult(`❌ Erro ao limpar cookies: ${error}`)
    }
  }

  const testJWTErrorDetection = () => {
    const mockJWTError = new Error('JWEDecryptionFailed: decryption operation failed')
    try {
      handleAuthError(mockJWTError)
      addResult('✅ Detecção de erro JWT funcionando')
    } catch (error) {
      addResult(`❌ Erro na detecção JWT: ${error}`)
    }
  }

  const testForceLogout = () => {
    try {
      addResult('🔄 Executando logout forçado...')
      setTimeout(() => {
        forceLogout('/login')
      }, 1000)
    } catch (error) {
      addResult(`❌ Erro no logout forçado: ${error}`)
    }
  }

  const simulateJWTError = () => {
    // Simula um erro JWT para testar o error boundary
    throw new Error('JWT_SESSION_ERROR: decryption operation failed')
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TestTube className="h-6 w-6 text-blue-600" />
            <CardTitle>Teste de Tratamento JWT</CardTitle>
          </div>
          <CardDescription>
            Página para testar o tratamento de erros JWT e funcionalidades de autenticação.
            <br />
            <strong className="text-amber-600">⚠️ Apenas para desenvolvimento!</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testClearCookies} variant="outline" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Testar Limpeza de Cookies
            </Button>
            
            <Button onClick={testJWTErrorDetection} variant="outline" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Testar Detecção JWT
            </Button>
            
            <Button onClick={testForceLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Testar Logout Forçado
            </Button>
            
            <Button onClick={simulateJWTError} variant="destructive" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Simular Erro JWT
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
                <Button onClick={clearResults} variant="ghost" size="sm">
                  Limpar
                </Button>
              </div>
              <div className="bg-gray-100 rounded-md p-4 max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-900 mb-2">Informações do Teste</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Limpeza de Cookies:</strong> Remove todos os cookies do NextAuth</li>
              <li>• <strong>Detecção JWT:</strong> Testa se erros JWT são identificados corretamente</li>
              <li>• <strong>Logout Forçado:</strong> Executa limpeza completa e redireciona</li>
              <li>• <strong>Simular Erro:</strong> Dispara um erro JWT para testar o Error Boundary</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}