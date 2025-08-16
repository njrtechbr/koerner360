/**
 * Utilitários para padronizar respostas de API e integração com notificações
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Tipos para respostas padronizadas
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  timestamp: string;
  paginacao?: {
    paginaAtual: number;
    totalPaginas: number;
    totalItens: number;
    itensPorPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

// Códigos de erro padronizados
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

// Mensagens de erro padronizadas
export const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: 'Não autorizado',
  [ErrorCodes.FORBIDDEN]: 'Acesso negado',
  [ErrorCodes.NOT_FOUND]: 'Recurso não encontrado',
  [ErrorCodes.CONFLICT]: 'Conflito de dados',
  [ErrorCodes.VALIDATION_ERROR]: 'Dados inválidos',
  [ErrorCodes.INTERNAL_ERROR]: 'Erro interno do servidor',
  [ErrorCodes.BAD_REQUEST]: 'Requisição inválida',
} as const;

/**
 * Cria uma resposta de sucesso padronizada
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Cria uma resposta de sucesso com paginação
 */
export function createPaginatedResponse<T>(
  data: T,
  paginacao: ApiResponse['paginacao'],
  message?: string
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    paginacao,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(
  code: keyof typeof ErrorCodes,
  message?: string,
  details?: unknown,
  status?: number
): NextResponse {
  const defaultStatus = getDefaultStatusForError(code);
  const errorMessage = message || ErrorMessages[code];

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: errorMessage,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: status || defaultStatus });
}

/**
 * Obtém o status HTTP padrão para cada tipo de erro
 */
function getDefaultStatusForError(code: keyof typeof ErrorCodes): number {
  switch (code) {
    case ErrorCodes.UNAUTHORIZED:
      return 401;
    case ErrorCodes.FORBIDDEN:
      return 403;
    case ErrorCodes.NOT_FOUND:
      return 404;
    case ErrorCodes.CONFLICT:
      return 409;
    case ErrorCodes.VALIDATION_ERROR:
    case ErrorCodes.BAD_REQUEST:
      return 400;
    case ErrorCodes.INTERNAL_ERROR:
    default:
      return 500;
  }
}

/**
 * Manipula erros de validação do Zod
 */
export function handleZodError(error: ZodError): NextResponse {
  return createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    'Dados inválidos',
    error.issues
  );
}

/**
 * Manipula erros genéricos e os converte em respostas padronizadas
 */
export function handleGenericError(
  error: unknown,
  context: string = 'Operação'
): NextResponse {
  console.error(`Erro em ${context}:`, error);

  // Se for erro de validação do Zod
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Se for erro conhecido do Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    
    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        return createErrorResponse(
          ErrorCodes.CONFLICT,
          'Dados já existem no sistema'
        );
      case 'P2025': // Record not found
        return createErrorResponse(
          ErrorCodes.NOT_FOUND,
          'Registro não encontrado'
        );
      default:
        break;
    }
  }

  // Erro genérico
  return createErrorResponse(
    ErrorCodes.INTERNAL_ERROR,
    `Erro interno em ${context}`
  );
}

/**
 * Wrapper para try-catch em API routes com tratamento padronizado
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string = 'API'
): Promise<T | NextResponse> {
  try {
    return await operation();
  } catch (error) {
    return handleGenericError(error, context);
  }
}

/**
 * Valida se o usuário tem permissão para a operação
 */
export function validatePermissions(
  userType: string,
  allowedTypes: string[]
): NextResponse | null {
  if (!allowedTypes.includes(userType)) {
    return createErrorResponse(ErrorCodes.FORBIDDEN);
  }
  return null;
}

/**
 * Valida se o usuário está autenticado
 */
export function validateAuthentication(session: unknown): NextResponse | null {
  if (!session) {
    return createErrorResponse(ErrorCodes.UNAUTHORIZED);
  }
  return null;
}