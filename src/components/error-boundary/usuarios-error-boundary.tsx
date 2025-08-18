'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

/**
 * Error Boundary especializado para componentes de usuários
 * Implementa retry logic, logging e fallbacks específicos
 */
export class UsuariosErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryDelay = 1000

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log estruturado do erro
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      retryCount: this.state.retryCount,
    }

    console.error('UsuariosErrorBoundary capturou um erro:', errorReport)
    
    // Callback personalizado de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
    })

    // Enviar para serviço de monitoramento (implementar conforme necessário)
    this.reportError(errorReport)
  }

  private reportError = (errorReport: any) => {
    // Integração com serviços de monitoramento
    // Por exemplo: Sentry, LogRocket, etc.
    
    // Por enquanto, apenas log no console
    if (process.env.NODE_ENV === 'production') {
      // Em produção, enviar para serviço de logging
      console.error('Erro reportado:', errorReport)
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      // Delay progressivo para retry
      const delay = this.retryDelay * Math.pow(2, this.state.retryCount)
      
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1,
        }))
      }, delay)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })
  }

  private getErrorType = (error: Error): string => {
    if (error.message.includes('fetch')) return 'Erro de Rede'
    if (error.message.includes('permission')) return 'Erro de Permissão'
    if (error.message.includes('validation')) return 'Erro de Validação'
    if (error.message.includes('auth')) return 'Erro de Autenticação'
    return 'Erro do Sistema'
  }

  private getErrorSuggestion = (error: Error): string => {
    if (error.message.includes('fetch')) {
      return 'Verifique sua conexão com a internet e tente novamente.'
    }
    if (error.message.includes('permission')) {
      return 'Você não tem permissão para realizar esta ação. Entre em contato com o administrador.'
    }
    if (error.message.includes('validation')) {
      return 'Verifique se todos os campos foram preenchidos corretamente.'
    }
    if (error.message.includes('auth')) {
      return 'Sua sessão pode ter expirado. Faça login novamente.'
    }
    return 'Tente recarregar a página ou entre em contato com o suporte.'
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      const errorType = this.state.error ? this.getErrorType(this.state.error) : 'Erro Desconhecido'
      const suggestion = this.state.error ? this.getErrorSuggestion(this.state.error) : ''
      const canRetry = this.state.retryCount < this.maxRetries

      // Fallback padrão
      return (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{errorType}</strong>
              <br />
              {this.state.error?.message || 'Ocorreu um erro inesperado'}
            </AlertDescription>
          </Alert>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Erro ao Carregar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-red-600">
                <p className="font-medium mb-2">O que aconteceu?</p>
                <p>{suggestion}</p>
              </div>

              {this.state.retryCount > 0 && (
                <div className="text-sm text-gray-600">
                  <p>Tentativas realizadas: {this.state.retryCount} de {this.maxRetries}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                )}

                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Resetar
                </Button>

                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </div>

              {/* Detalhes técnicos em desenvolvimento */}
              {(process.env.NODE_ENV === 'development' || this.props.showDetails) && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-700 flex items-center gap-1">
                    <Bug className="h-4 w-4" />
                    Detalhes Técnicos
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Erro:</strong> {this.state.error?.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC para envolver componentes com Error Boundary
 */
export function withUsuariosErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <UsuariosErrorBoundary fallback={fallback}>
      <Component {...props} />
    </UsuariosErrorBoundary>
  )

  WrappedComponent.displayName = `withUsuariosErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Componente de erro simples para casos específicos
 */
export function UsuariosErrorFallback({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry?: () => void 
}) {
  return (
    <Card className="border-red-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="font-semibold text-red-700">Erro ao Carregar Usuários</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}