import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes,
  withErrorHandling
} from '@/lib/api-response';
import { TipoUsuario } from '@prisma/client';

// Schema de validação para criação de usuário
const criarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tipoUsuario: z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE']),
  supervisorId: z.string().optional(),
});

// Schema removido - não utilizado nesta rota

// GET /api/usuarios - Listar usuários
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    // Validar permissões
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN', 'SUPERVISOR']
    );
    if (permissionError) return permissionError;

    // Filtro baseado no tipo de usuário
    let whereClause = {};
    if (session?.user?.userType === TipoUsuario.SUPERVISOR) {
      whereClause = {
        OR: [
          { supervisorId: session.user.id },
          { id: session.user.id }
        ]
      };
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tipoUsuario = searchParams.get('tipoUsuario') || '';
    const ativo = searchParams.get('ativo');
    
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Record<string, unknown> = { ...whereClause };
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }
    
    if (ativo !== null && ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true,
          supervisorId: true,
          supervisor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return createPaginatedResponse(
      { usuarios },
      {
        paginaAtual: page,
        itensPorPagina: limit,
        totalItens: total,
        totalPaginas: totalPages,
        temProximaPagina: page < totalPages,
        temPaginaAnterior: page > 1,
      }
    );
  }, 'buscar usuários');
}

// POST /api/usuarios - Criar usuário
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    // Validar permissões - apenas admin pode criar usuários
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN']
    );
    if (permissionError) return permissionError;

    const body = await request.json();
    const validatedData = criarUsuarioSchema.parse(body);

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (usuarioExistente) {
      return createErrorResponse(
        ErrorCodes.CONFLICT,
        'Email já está em uso'
      );
    }

    // Verificar se supervisor existe (se fornecido)
    if (validatedData.supervisorId) {
      const supervisor = await prisma.usuario.findUnique({
        where: { id: validatedData.supervisorId },
      });

      if (!supervisor || supervisor.tipoUsuario !== 'SUPERVISOR') {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Supervisor inválido'
        );
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(validatedData.senha, 12);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        senha: senhaHash,
        tipoUsuario: validatedData.tipoUsuario,
        supervisorId: validatedData.supervisorId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return createSuccessResponse(
      { usuario: novoUsuario },
      'Usuário criado com sucesso',
      201
    );
  }, 'criar usuário');
}