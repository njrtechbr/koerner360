'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { forceLogout } from '@/lib/auth-utils'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return {
          title: 'Erro de Configuração',
          description: 'Há um problema na configuração da autenticação. Entre em contato com o administrador.',
          action: 'Contatar Administrador'
        }
      case 'AccessDenied':
        return {
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar este recurso.',
          action: 'Tentar Novamente'
        }
      case 'Verification':
        return {
          title: 'Erro de Verificação',
          description: 'Não foi possível verificar sua identidade. Tente fazer login novamente.',
          action: 'Fazer Login'
        }
      case 'JWTSessionError':
      case 'SessionRequired':
        return {
          title: 'Sessão Expirada ou Corrompida',
          description: 'Sua sessão expirou ou foi corrompida. Por favor, faça login novamente.',
          action: 'Fazer Login'
        }
      default:
        return {
          title: 'Erro de Autenticação',
          description: 'Ocorreu um erro durante a autenticação. Tente novamente.',
          action: 'Tentar Novamente'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  const handleClearCookies = () => {
    forceLogout('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-600">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'JWTSessionError' || error === 'SessionRequired' ? (
            <>
              <Button 
                onClick={handleClearCookies}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpar Dados e Fazer Login
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Isso irá limpar todos os dados de sessão armazenados no seu navegador.
              </div>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/login">
                {errorInfo.action}
              </Link>
            </Button>
          )}
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-600 font-mono">
                Erro técnico: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}