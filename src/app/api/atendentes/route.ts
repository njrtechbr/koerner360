/**
 * API Routes para gerenciamento de atendentes
 * GET /api/atendentes - Lista atendentes com filtros e paginação
 * POST /api/atendentes - Cria novo atendente
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { 
  criarAtendenteSchema, 
  queryAtendenteSchema,
  formatarCPF,
  formatarTelefone
} from '@/lib/validations/atendente';
import { StatusAtendente } from '@/types/atendente';
import { TipoUsuario } from '@prisma/client';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createPaginatedResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes 
} from '@/lib/api-response';


/**
 * GET /api/atendentes
 * Lista atendentes com filtros, paginação e ordenação
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Verificar permissões - apenas admin e supervisor podem listar atendentes
    const permissionResult = validatePermissions(session?.user?.userType || '', [TipoUsuario.ADMIN, TipoUsuario.SUPERVISOR]);
    if (permissionResult) {
      return permissionResult;
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validar parâmetros de query
    const validatedParams = queryAtendenteSchema.parse(queryParams);
    const { search, status, setor, cargo, portaria, pagina, limite, coluna, direcao } = validatedParams;

    // Construir filtros do Prisma
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search.replace(/\D/g, '') } },
        { rg: { contains: search.replace(/\D/g, '') } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (setor) {
      where.setor = { contains: setor, mode: 'insensitive' };
    }
    
    if (cargo) {
      where.cargo = { contains: cargo, mode: 'insensitive' };
    }
    
    if (portaria) {
      where.portaria = { contains: portaria, mode: 'insensitive' };
    }

    // Calcular offset para paginação
    const offset = (pagina - 1) * limite;

    // Buscar atendentes com paginação
    const [atendentes, totalItens] = await Promise.all([
      prisma.atendente.findMany({
        where,
        orderBy: {
          [coluna]: direcao
        },
        skip: offset,
        take: limite,
        select: {
          id: true,
          nome: true,
          email: true,
          status: true,
          avatarUrl: true,
          telefone: true,
          portaria: true,
          dataAdmissao: true,
          dataNascimento: true,
          rg: true,
          cpf: true,
          setor: true,
          cargo: true,
          criadoEm: true,
          atualizadoEm: true
        }
      }),
      prisma.atendente.count({ where })
    ]);

    // Calcular informações de paginação
    const totalPaginas = Math.ceil(totalItens / limite);
    const temProximaPagina = pagina < totalPaginas;
    const temPaginaAnterior = pagina > 1;

    // Formatar dados dos atendentes
    const atendentesFormatados = atendentes.map(atendente => ({
      ...atendente,
      cpf: formatarCPF(atendente.cpf),
      telefone: formatarTelefone(atendente.telefone)
    }));

    return createPaginatedResponse(
      atendentesFormatados,
      {
        paginaAtual: pagina,
        totalPaginas,
        totalItens,
        itensPorPagina: limite,
        temProximaPagina,
        temPaginaAnterior
      },
      'atendentes'
    );

  } catch (error) {
    console.error('Erro ao buscar atendentes:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Parâmetros inválidos',
        error.message
      );
    }
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

/**
 * POST /api/atendentes
 * Cria um novo atendente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Verificar permissões - apenas admin e supervisor podem criar atendentes
    const permissionResult = validatePermissions(session?.user?.userType || '', [TipoUsuario.ADMIN, TipoUsuario.SUPERVISOR]);
    if (permissionResult) {
      return permissionResult;
    }

    const body = await request.json();
    
    // Validar dados de entrada
    const dadosValidados = criarAtendenteSchema.parse(body);
    
    // Verificar se email já existe
    const emailExistente = await prisma.atendente.findUnique({
      where: { email: dadosValidados.email }
    });
    
    if (emailExistente) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Email já está em uso'
      );
    }
    
    // Verificar se CPF já existe
    const cpfExistente = await prisma.atendente.findUnique({
      where: { cpf: dadosValidados.cpf }
    });
    
    if (cpfExistente) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'CPF já está em uso'
      );
    }
    
    // Verificar se RG já existe
    const rgExistente = await prisma.atendente.findUnique({
      where: { rg: dadosValidados.rg }
    });
    
    if (rgExistente) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'RG já está em uso'
      );
    }

    // Criar atendente
    const novoAtendente = await prisma.atendente.create({
      data: {
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        status: dadosValidados.status || StatusAtendente.ATIVO,
        avatarUrl: dadosValidados.avatarUrl || null,
        telefone: dadosValidados.telefone,
        portaria: dadosValidados.portaria,
        dataAdmissao: new Date(dadosValidados.dataAdmissao),
        dataNascimento: new Date(dadosValidados.dataNascimento),
        rg: dadosValidados.rg,
        cpf: dadosValidados.cpf,
        setor: dadosValidados.setor,
        cargo: dadosValidados.cargo,
        endereco: dadosValidados.endereco,
        observacoes: dadosValidados.observacoes
      }
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        acao: 'CREATE',
        nomeTabela: 'Atendente',
        registroId: novoAtendente.id,
        usuarioId: session?.user?.id || '',
        atendenteId: novoAtendente.id,
        dadosNovos: JSON.stringify({
          nome: novoAtendente.nome,
          email: novoAtendente.email,
          setor: novoAtendente.setor,
          cargo: novoAtendente.cargo
        })
      }
    });

    // Formatar dados de resposta
    const atendenteFormatado = {
      ...novoAtendente,
      cpf: formatarCPF(novoAtendente.cpf),
      telefone: formatarTelefone(novoAtendente.telefone)
    };

    return createSuccessResponse(atendenteFormatado, 'Atendente criado com sucesso', 201);

  } catch (error) {
    console.error('Erro ao criar atendente:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Dados inválidos',
        error.message
      );
    }
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}