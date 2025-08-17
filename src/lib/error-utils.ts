/**
 * Utilitários para tratamento de erros
 * Fornece funções padronizadas para converter erros em mensagens legíveis
 */

/**
 * Converte um erro em uma mensagem de string legível
 * @param error - O erro a ser convertido
 * @param defaultMessage - Mensagem padrão caso o erro não seja reconhecido
 * @returns String com a mensagem de erro
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Erro inesperado'): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return defaultMessage;
}

/**
 * Registra um erro no console de forma padronizada
 * @param context - Contexto onde o erro ocorreu
 * @param error - O erro a ser registrado
 */
export function logError(context: string, error: unknown): void {
  console.error(`${context}:`, {
    message: getErrorMessage(error),
    error: error instanceof Error ? error : { type: typeof error, value: error },
    timestamp: new Date().toISOString()
  });
}

/**
 * Converte um erro em um objeto estruturado para APIs
 * @param error - O erro a ser convertido
 * @param context - Contexto onde o erro ocorreu
 * @returns Objeto com informações do erro
 */
export function formatApiError(error: unknown, context?: string) {
  const message = getErrorMessage(error);
  
  return {
    success: false,
    error: message,
    context,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        type: typeof error,
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  };
}

/**
 * Wrapper para funções async que padroniza o tratamento de erros
 * @param fn - Função async a ser executada
 * @param context - Contexto para logging
 * @returns Promise com resultado ou erro tratado
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logError(context, error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Tipos de erro comuns da aplicação
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  NETWORK = 'NETWORK_ERROR'
}

/**
 * Classe de erro customizada para a aplicação
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly context?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode = 500,
    context?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;

    // Manter stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Converte o erro em formato JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cria um erro de validação
   */
  static validation(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.VALIDATION, 400, context);
  }

  /**
   * Cria um erro de autenticação
   */
  static authentication(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, 401, context);
  }

  /**
   * Cria um erro de autorização
   */
  static authorization(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.AUTHORIZATION, 403, context);
  }

  /**
   * Cria um erro de não encontrado
   */
  static notFound(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, 404, context);
  }

  /**
   * Cria um erro de conflito
   */
  static conflict(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.CONFLICT, 409, context);
  }

  /**
   * Cria um erro interno
   */
  static internal(message: string, context?: string): AppError {
    return new AppError(message, ErrorType.INTERNAL, 500, context);
  }
}