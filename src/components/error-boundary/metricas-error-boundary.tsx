'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

/**
 * Error Boundary especializado para componentes de métricas
 * Implementa retry logic e logging de erros
 */
export class MetricasErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

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
    // Log do erro
    console.error('MetricasErrorBoundary capturou um erro:', error, errorInfo)
    
    // Callback personalizado de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
    })

    // Enviar erro para serviço de monitoramento (se configurado)
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // Por enquanto, apenas log no console
    console.error('Relatório de erro:', errorReport)
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
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

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback padrão
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Erro ao Carregar Métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-600">
              <p className="font-medium">Algo deu errado ao carregar os dados.</p>
              <p className="mt-1">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente ({this.maxRetries - this.state.retryCount} restantes)
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
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-700 flex items-center gap-1">
                  <Bug className="h-4 w-4" />
                  Detalhes do Erro (Desenvolvimento)
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
      )
    }

    return this.props.children
  }
}

/**
 * HOC para envolver componentes com Error Boundary
 */
export function withMetricasErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <MetricasErrorBoundary fallback={fallback}>
      <Component {...props} />
    </MetricasErrorBoundary>
  )

  WrappedComponent.displayName = `withMetricasErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}