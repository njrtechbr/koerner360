import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Utilitário para padronizar respostas da API
 */
export class ApiResponseUtils {
  /**
   * Resposta de sucesso
   */
  static success(data: any, status = 200) {
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }, { status })
  }

  /**
   * Resposta de erro não autorizado
   */
  static unauthorized(message = 'Não autorizado') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 401 })
  }

  /**
   * Resposta de erro proibido
   */
  static forbidden(message = 'Acesso negado') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 403 })
  }

  /**
   * Resposta de erro de validação
   */
  static badRequest(message = 'Dados inválidos', details?: string) {
    return NextResponse.json({
      success: false,
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    }, { status: 400 })
  }

  /**
   * Resposta de erro interno
   */
  static internalError(message = 'Erro interno do servidor') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }

  /**
   * Manipulador genérico de erros
   */
  static handleError(error: unknown) {
    console.error('Erro na API:', error)

    if (error instanceof ZodError) {
      return this.badRequest('Parâmetros inválidos', error.message)
    }

    if (error instanceof Error) {
      return this.internalError(error.message)
    }

    return this.internalError()
  }
}