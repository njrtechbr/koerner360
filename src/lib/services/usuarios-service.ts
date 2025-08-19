import { prisma } from '@/lib/prisma';
import type { TipoUsuario } from '@prisma/client';

export interface UsuarioFiltros {
  busca?: string;
  tipoUsuario?: TipoUsuario;
  ativo?: boolean;
  supervisorId?: string;
}

export interface UsuarioPaginacao {
  page: number;
  limit: number;
  ordenacao: string;
  direcao: 'asc' | 'desc';
}

export interface UsuarioCompleto {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  supervisorId: string | null;
  supervisor?: {
    id: string;
    nome: string;
  } | null;
  _count: {
    supervisoes: number;
    avaliacoesFeitas: number;
    avaliacoesRecebidas: number;
  };
}

export interface UsuariosResult {
  usuarios: UsuarioCompleto[];
  total: number;
  paginacao: {
    paginaAtual: number;
    totalPaginas: number;
    totalItens: number;
    itensPorPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

/**
 * Service para operações relacionadas a usuários
 */
export class UsuariosService {
  private static readonly USUARIO_SELECT_FIELDS = {
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
    _count: {
      select: {
        supervisoes: true,
        avaliacoesFeitas: true,
        avaliacoesRecebidas: true,
      }
    }
  } as const;

  /**
   * Busca usuários com filtros e paginação
   */
  static async buscarUsuarios(
    filtros: UsuarioFiltros,
    paginacao: UsuarioPaginacao,
    userType: string,
    userId: string
  ): Promise<UsuariosResult> {
    try {
      const whereClause = this.construirWhereClause(filtros, userType, userId);
      const orderBy = { [paginacao.ordenacao]: paginacao.direcao };
      const skip = (paginacao.page - 1) * paginacao.limit;

      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where: whereClause,
          skip,
          take: paginacao.limit,
          select: this.USUARIO_SELECT_FIELDS,
          orderBy,
        }),
        prisma.usuario.count({ where: whereClause }),
      ]);

      return this.criarResultadoPaginado(usuarios, total, paginacao);
    } catch {
      throw new Error('Falha ao buscar usuários');
    }
  }

  /**
   * Constrói cláusula WHERE baseada nos filtros e permissões do usuário
   */
  private static construirWhereClause(
    filtros: UsuarioFiltros,
    userType: string,
    userId: string
  ) {
    const where: Record<string, unknown> = {};

    // Filtros baseados no tipo de usuário logado
    if (userType === 'SUPERVISOR') {
      where.OR = [
        { supervisorId: userId },
        { id: userId }
      ];
    }

    // Filtro de busca
    if (filtros.busca) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { nome: { contains: filtros.busca, mode: 'insensitive' } },
          { email: { contains: filtros.busca, mode: 'insensitive' } },
        ]
      });
    }

    // Filtro por tipo de usuário
    if (filtros.tipoUsuario) {
      where.tipoUsuario = filtros.tipoUsuario;
    }

    // Filtro por status ativo
    if (filtros.ativo !== undefined) {
      where.ativo = filtros.ativo;
    }

    // Filtro por supervisor
    if (filtros.supervisorId) {
      where.supervisorId = filtros.supervisorId;
    }

    return where;
  }

  /**
   * Cria resultado paginado
   */
  private static criarResultadoPaginado(
    usuarios: UsuarioCompleto[],
    total: number,
    paginacao: UsuarioPaginacao
  ): UsuariosResult {
    const totalPaginas = Math.ceil(total / paginacao.limit);

    return {
      usuarios,
      total,
      paginacao: {
        paginaAtual: paginacao.page,
        totalPaginas,
        totalItens: total,
        itensPorPagina: paginacao.limit,
        temProximaPagina: paginacao.page < totalPaginas,
        temPaginaAnterior: paginacao.page > 1,
      }
    };
  }

  /**
   * Calcula estatísticas dos usuários
   */
  static calcularEstatisticas(usuarios: UsuarioCompleto[]) {
    return {
      total: usuarios.length,
      usuariosAtivos: usuarios.filter(u => u.ativo).length,
      usuariosInativos: usuarios.filter(u => !u.ativo).length,
      admins: usuarios.filter(u => u.tipoUsuario === 'ADMIN').length,
      supervisores: usuarios.filter(u => u.tipoUsuario === 'SUPERVISOR').length,
      atendentes: usuarios.filter(u => u.tipoUsuario === 'ATENDENTE').length,
      consultores: usuarios.filter(u => u.tipoUsuario === 'CONSULTOR').length,
    };
  }

  /**
   * Valida parâmetros de paginação
   */
  static validarParametrosPaginacao(searchParams: Record<string, unknown>): UsuarioPaginacao {
    const page = Math.max(1, parseInt(searchParams.pagina || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.limite || '10')));
    const ordenacao = ['nome', 'email', 'tipoUsuario', 'ativo', 'criadoEm'].includes(searchParams.ordenacao) 
      ? searchParams.ordenacao 
      : 'nome';
    const direcao = searchParams.direcao === 'desc' ? 'desc' : 'asc';

    return { page, limit, ordenacao, direcao };
  }

  /**
   * Valida e sanitiza filtros
   */
  static validarFiltros(searchParams: Record<string, unknown>): UsuarioFiltros {
    const filtros: UsuarioFiltros = {};

    if (searchParams.busca && typeof searchParams.busca === 'string') {
      filtros.busca = searchParams.busca.trim();
    }

    if (searchParams.tipoUsuario && ['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR'].includes(searchParams.tipoUsuario)) {
      filtros.tipoUsuario = searchParams.tipoUsuario as TipoUsuario;
    }

    if (searchParams.ativo !== undefined && searchParams.ativo !== '') {
      filtros.ativo = searchParams.ativo === 'true';
    }

    if (searchParams.supervisorId && typeof searchParams.supervisorId === 'string') {
      filtros.supervisorId = searchParams.supervisorId;
    }

    return filtros;
  }
}