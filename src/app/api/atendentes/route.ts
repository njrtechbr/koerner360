/**
 * API Routes para gerenciamento de atendentes
 * GET /api/atendentes - Lista atendentes com filtros e paginação
 * POST /api/atendentes - Cria novo atendente
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth.ts';
import { prisma } from '@/lib/prisma';
import { 
  criarAtendenteSchema, 
  queryAtendenteSchema,
  formatarCPF,
  formatarTelefone
} from '@/lib/validations/atendente';
import { StatusAtendente } from '@/types/atendente';
import { TipoUsuario } from '@prisma/client';

/**
 * GET /api/atendentes
 * Lista atendentes com filtros, paginação e ordenação
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões - apenas admin e supervisor podem listar atendentes
    if (session.user.userType === 'ATENDENTE') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validar parâmetros de query
    const validatedParams = queryAtendenteSchema.parse(queryParams);
    const { search, status, setor, cargo, portaria, pagina, limite, coluna, direcao } = validatedParams;

    // Construir filtros do Prisma
    const where: any = {};
    
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

    return NextResponse.json({
      success: true,
      data: {
        atendentes: atendentesFormatados,
        paginacao: {
          paginaAtual: pagina,
          totalPaginas,
          totalItens,
          itensPorPagina: limite,
          temProximaPagina,
          temPaginaAnterior
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar atendentes:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões - apenas admin e supervisor podem criar atendentes
    if (session.user.userType === 'ATENDENTE') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar dados de entrada
    const dadosValidados = criarAtendenteSchema.parse(body);
    
    // Verificar se email já existe
    const emailExistente = await prisma.atendente.findUnique({
      where: { email: dadosValidados.email }
    });
    
    if (emailExistente) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 409 }
      );
    }
    
    // Verificar se CPF já existe
    const cpfExistente = await prisma.atendente.findUnique({
      where: { cpf: dadosValidados.cpf }
    });
    
    if (cpfExistente) {
      return NextResponse.json(
        { success: false, error: 'CPF já está em uso' },
        { status: 409 }
      );
    }
    
    // Verificar se RG já existe
    const rgExistente = await prisma.atendente.findUnique({
      where: { rg: dadosValidados.rg }
    });
    
    if (rgExistente) {
      return NextResponse.json(
        { success: false, error: 'RG já está em uso' },
        { status: 409 }
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
        cargo: dadosValidados.cargo
      }
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        acao: 'CREATE',
        entidade: 'Atendente',
        entidadeId: novoAtendente.id,
        usuarioId: session.user.id,
        atendenteId: novoAtendente.id,
        detalhes: {
          nome: novoAtendente.nome,
          email: novoAtendente.email,
          setor: novoAtendente.setor,
          cargo: novoAtendente.cargo
        }
      }
    });

    // Formatar dados de resposta
    const atendenteFormatado = {
      ...novoAtendente,
      cpf: formatarCPF(novoAtendente.cpf),
      telefone: formatarTelefone(novoAtendente.telefone)
    };

    return NextResponse.json({
      success: true,
      data: {
        atendente: atendenteFormatado
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar atendente:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}