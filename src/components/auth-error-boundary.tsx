'use client'

import React from 'react'
import { handleAuthError } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary capturou um erro:', error, errorInfo)
    
    // Verifica se é um erro de autenticação e trata adequadamente
    handleAuthError(error)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            Erro na Aplicação
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-600">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={resetError} className="w-full" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full"
          >
            Recarregar Página
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-600 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthErrorBoundary