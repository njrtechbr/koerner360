/**
 * Serviço de usuários - Controller do padrão MCP
 * Implementa toda a lógica de negócio para gerenciamento de usuários
 */

import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import {
  validarCriarUsuario,
  validarAtualizarUsuario,
  validarFiltrosUsuario,
  validarRegrasNegocio,
  type TipoUsuario,
  type CriarUsuarioData,
  type AtualizarUsuarioData
} from '@/lib/validations/usuario';
import {
  type Usuario,
  type UsuariosPaginados,
  type BuscarUsuariosParams,
  type EstatisticasUsuarios,
  type SupervisorDisponivel,
  type ValidacaoEmailUnico,
  MENSAGENS_ERRO_USUARIO
} from '@/types/usuario';
import { logError } from '@/lib/error-utils';

// Classe de erro personalizada para usuários
export class UsuarioError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'UsuarioError';
  }
}

// Campos selecionados para otimizar consultas
const USUARIO_SELECT_FIELDS = {
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
      nome: true
    }
  },
  _count: {
    select: {
      supervisoes: true,
      avaliacoesFeitas: true,
      avaliacoesRecebidas: true
    }
  }
} as const;

export class UsuarioService {
  /**
   * Busca usuários com filtros, ordenação e paginação
   */
  static async buscarUsuarios(
    params: BuscarUsuariosParams,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<UsuariosPaginados> {
    try {
      const {
        filtros = {},
        ordenacao = { coluna: 'nome', direcao: 'asc' },
        paginacao = { pagina: 1, limite: 10 },
        incluirInativos = false,
        incluirContadores = true
      } = params;

      // Validar filtros
      const filtrosValidados = validarFiltrosUsuario({
        ...filtros,
        pagina: paginacao.pagina,
        limite: paginacao.limite,
        ordenacao: ordenacao.coluna,
        direcao: ordenacao.direcao
      });

      if (!filtrosValidados.success) {
        throw new UsuarioError(
          'Filtros inválidos',
          'FILTROS_INVALIDOS',
          400
        );
      }

      const { data: filtrosData } = filtrosValidados;

      // Construir condições WHERE
      const where: Record<string, unknown> = {};

      // Filtro por tipo de usuário logado
      if (usuarioLogado.tipoUsuario === 'SUPERVISOR') {
        where.OR = [
          { tipoUsuario: 'ATENDENTE', supervisorId: usuarioLogado.id },
          { id: usuarioLogado.id }
        ];
      }

      // Filtros adicionais
      if (filtrosData.busca) {
        where.OR = [
          { nome: { contains: filtrosData.busca, mode: 'insensitive' } },
          { email: { contains: filtrosData.busca, mode: 'insensitive' } }
        ];
      }

      if (filtrosData.tipoUsuario) {
        where.tipoUsuario = filtrosData.tipoUsuario;
      }

      if (filtrosData.ativo !== undefined) {
        where.ativo = filtrosData.ativo;
      } else if (!incluirInativos) {
        where.ativo = true;
      }

      if (filtrosData.supervisorId) {
        where.supervisorId = filtrosData.supervisorId;
      }

      // Calcular offset
      const offset = (filtrosData.pagina - 1) * filtrosData.limite;

      // Executar consultas em paralelo
      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where,
          select: incluirContadores ? USUARIO_SELECT_FIELDS : {
            ...USUARIO_SELECT_FIELDS,
            _count: false
          },
          orderBy: {
            [filtrosData.ordenacao]: filtrosData.direcao
          },
          skip: offset,
          take: filtrosData.limite
        }),
        prisma.usuario.count({ where })
      ]);

      // Calcular informações de paginação
      const totalPaginas = Math.ceil(total / filtrosData.limite);
      const paginacaoInfo = {
        paginaAtual: filtrosData.pagina,
        totalPaginas,
        totalItens: total,
        itensPorPagina: filtrosData.limite,
        temProximaPagina: filtrosData.pagina < totalPaginas,
        temPaginaAnterior: filtrosData.pagina > 1
      };

      return {
        usuarios: usuarios as Usuario[],
        paginacao: paginacaoInfo,
        total
      };
    } catch (error) {
      logError('Erro ao buscar usuários', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_BUSCAR_USUARIOS',
        500
      );
    }
  }

  /**
   * Busca usuário por ID
   */
  static async buscarPorId(
    id: string,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<Usuario | null> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: USUARIO_SELECT_FIELDS
      });

      if (!usuario) {
        return null;
      }

      // Verificar permissões
      if (!validarRegrasNegocio.podeGerenciarUsuario(
        usuarioLogado.tipoUsuario,
        usuario.tipoUsuario as TipoUsuario
      ) && usuarioLogado.id !== id) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA,
          'PERMISSAO_NEGADA',
          403
        );
      }

      return usuario as Usuario;
    } catch (error) {
      logError('Erro ao buscar usuário por ID', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_BUSCAR_USUARIO',
        500
      );
    }
  }

  /**
   * Cria novo usuário
   */
  static async criar(
    data: CriarUsuarioData,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<Usuario> {
    try {
      // Validar dados
      const validacao = validarCriarUsuario(data);
      if (!validacao.success) {
        throw new UsuarioError(
          validacao.error.errors[0]?.message || 'Dados inválidos',
          'DADOS_INVALIDOS',
          400
        );
      }

      const dadosValidados = validacao.data;

      // Verificar permissões
      if (!validarRegrasNegocio.podeGerenciarUsuario(
        usuarioLogado.tipoUsuario,
        dadosValidados.tipoUsuario
      )) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA,
          'PERMISSAO_NEGADA',
          403
        );
      }

      // Verificar se email já existe
      const emailExiste = await this.verificarEmailUnico({
        email: dadosValidados.email
      });
      if (!emailExiste) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.EMAIL_JA_EXISTE,
          'EMAIL_JA_EXISTE',
          409
        );
      }

      // Verificar se supervisor existe (se fornecido)
      if (dadosValidados.supervisorId) {
        const supervisor = await prisma.usuario.findUnique({
          where: {
            id: dadosValidados.supervisorId,
            tipoUsuario: 'SUPERVISOR',
            ativo: true
          }
        });

        if (!supervisor) {
          throw new UsuarioError(
            'Supervisor não encontrado ou inativo',
            'SUPERVISOR_INVALIDO',
            400
          );
        }
      }

      // Hash da senha
      const senhaHash = await hash(dadosValidados.senha, 12);

      // Criar usuário
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome: dadosValidados.nome,
          email: dadosValidados.email,
          senha: senhaHash,
          tipoUsuario: dadosValidados.tipoUsuario,
          ativo: dadosValidados.ativo,
          supervisorId: dadosValidados.supervisorId || null
        },
        select: USUARIO_SELECT_FIELDS
      });

      return novoUsuario as Usuario;
    } catch (error) {
      logError('Erro ao criar usuário', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_CRIAR_USUARIO',
        500
      );
    }
  }

  /**
   * Atualiza usuário existente
   */
  static async atualizar(
    data: AtualizarUsuarioData,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<Usuario> {
    try {
      // Validar dados
      const validacao = validarAtualizarUsuario(data);
      if (!validacao.success) {
        throw new UsuarioError(
          validacao.error.errors[0]?.message || 'Dados inválidos',
          'DADOS_INVALIDOS',
          400
        );
      }

      const dadosValidados = validacao.data;

      // Buscar usuário existente
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: dadosValidados.id }
      });

      if (!usuarioExistente) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.USUARIO_NAO_ENCONTRADO,
          'USUARIO_NAO_ENCONTRADO',
          404
        );
      }

      // Verificar permissões
      if (!validarRegrasNegocio.podeEditarUsuario(
        usuarioLogado.tipoUsuario,
        usuarioExistente.tipoUsuario as TipoUsuario
      ) && usuarioLogado.id !== dadosValidados.id) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA,
          'PERMISSAO_NEGADA',
          403
        );
      }

      // Verificar se email já existe (excluindo o próprio usuário)
      if (dadosValidados.email !== usuarioExistente.email) {
        const emailExiste = await this.verificarEmailUnico({
          email: dadosValidados.email,
          usuarioId: dadosValidados.id
        });
        if (!emailExiste) {
          throw new UsuarioError(
            MENSAGENS_ERRO_USUARIO.EMAIL_JA_EXISTE,
            'EMAIL_JA_EXISTE',
            409
          );
        }
      }

      // Preparar dados para atualização
      const dadosAtualizacao: Record<string, unknown> = {
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        tipoUsuario: dadosValidados.tipoUsuario,
        ativo: dadosValidados.ativo,
        supervisorId: dadosValidados.supervisorId || null
      };

      // Atualizar senha se fornecida
      if (dadosValidados.senha) {
        dadosAtualizacao.senha = await hash(dadosValidados.senha, 12);
      }

      // Atualizar usuário
      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: dadosValidados.id },
        data: dadosAtualizacao,
        select: USUARIO_SELECT_FIELDS
      });

      return usuarioAtualizado as Usuario;
    } catch (error) {
      logError('Erro ao atualizar usuário', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_ATUALIZAR_USUARIO',
        500
      );
    }
  }

  /**
   * Desativa usuário
   */
  static async desativar(
    id: string,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<Usuario> {
    try {
      const usuario = await this.buscarPorId(id, usuarioLogado);
      if (!usuario) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.USUARIO_NAO_ENCONTRADO,
          'USUARIO_NAO_ENCONTRADO',
          404
        );
      }

      // Verificar permissões
      if (!validarRegrasNegocio.podeDesativarUsuario(
        usuarioLogado.tipoUsuario,
        usuario.tipoUsuario
      )) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA,
          'PERMISSAO_NEGADA',
          403
        );
      }

      // Não permitir desativar a si mesmo
      if (usuarioLogado.id === id) {
        throw new UsuarioError(
          'Não é possível desativar sua própria conta',
          'AUTODESATIVACAO_NEGADA',
          400
        );
      }

      const usuarioDesativado = await prisma.usuario.update({
        where: { id },
        data: { ativo: false },
        select: USUARIO_SELECT_FIELDS
      });

      return usuarioDesativado as Usuario;
    } catch (error) {
      logError('Erro ao desativar usuário', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_DESATIVAR_USUARIO',
        500
      );
    }
  }

  /**
   * Ativa usuário
   */
  static async ativar(
    id: string,
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<Usuario> {
    try {
      const usuario = await this.buscarPorId(id, usuarioLogado);
      if (!usuario) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.USUARIO_NAO_ENCONTRADO,
          'USUARIO_NAO_ENCONTRADO',
          404
        );
      }

      // Verificar permissões
      if (!validarRegrasNegocio.podeGerenciarUsuario(
        usuarioLogado.tipoUsuario,
        usuario.tipoUsuario
      )) {
        throw new UsuarioError(
          MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA,
          'PERMISSAO_NEGADA',
          403
        );
      }

      const usuarioAtivado = await prisma.usuario.update({
        where: { id },
        data: { ativo: true },
        select: USUARIO_SELECT_FIELDS
      });

      return usuarioAtivado as Usuario;
    } catch (error) {
      logError('Erro ao ativar usuário', error);
      if (error instanceof UsuarioError) {
        throw error;
      }
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_ATIVAR_USUARIO',
        500
      );
    }
  }

  /**
   * Busca supervisores disponíveis
   */
  static async buscarSupervisores(): Promise<SupervisorDisponivel[]> {
    try {
      const supervisores = await prisma.usuario.findMany({
        where: {
          tipoUsuario: 'SUPERVISOR',
          ativo: true
        },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
          _count: {
            select: {
              supervisoes: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return supervisores.map(supervisor => ({
        id: supervisor.id,
        nome: supervisor.nome,
        email: supervisor.email,
        ativo: supervisor.ativo,
        quantidadeAtendentes: supervisor._count.supervisoes
      }));
    } catch (error) {
      logError('Erro ao buscar supervisores', error);
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_BUSCAR_SUPERVISORES',
        500
      );
    }
  }

  /**
   * Verifica se email é único
   */
  static async verificarEmailUnico(params: ValidacaoEmailUnico): Promise<boolean> {
    try {
      const where: Record<string, unknown> = { email: params.email };
      
      if (params.usuarioId) {
        where.NOT = { id: params.usuarioId };
      }

      const usuario = await prisma.usuario.findFirst({ where });
      return !usuario; // Retorna true se email é único (não encontrou usuário)
    } catch (error) {
      logError('Erro ao verificar email único', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  static async obterEstatisticas(
    usuarioLogado: { id: string; tipoUsuario: TipoUsuario }
  ): Promise<EstatisticasUsuarios> {
    try {
      const where: Record<string, unknown> = {};
      
      // Filtrar por permissões
      if (usuarioLogado.tipoUsuario === 'SUPERVISOR') {
        where.OR = [
          { tipoUsuario: 'ATENDENTE', supervisorId: usuarioLogado.id },
          { id: usuarioLogado.id }
        ];
      }

      const [total, ativos, porTipo, criadosRecentemente] = await Promise.all([
        prisma.usuario.count({ where }),
        prisma.usuario.count({ where: { ...where, ativo: true } }),
        prisma.usuario.groupBy({
          by: ['tipoUsuario'],
          where,
          _count: true
        }),
        prisma.usuario.count({
          where: {
            ...where,
            criadoEm: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
            }
          }
        })
      ]);

      const porTipoObj = {
        ADMIN: 0,
        SUPERVISOR: 0,
        ATENDENTE: 0,
        CONSULTOR: 0
      };

      porTipo.forEach(item => {
        porTipoObj[item.tipoUsuario as keyof typeof porTipoObj] = item._count;
      });

      return {
        total,
        ativos,
        inativos: total - ativos,
        porTipo: porTipoObj,
        criadosUltimos30Dias: criadosRecentemente,
        ultimaAtualizacao: new Date()
      };
    } catch (error) {
      logError('Erro ao obter estatísticas', error);
      throw new UsuarioError(
        MENSAGENS_ERRO_USUARIO.ERRO_INTERNO,
        'ERRO_OBTER_ESTATISTICAS',
        500
      );
    }
  }

  /**
   * Valida senha do usuário
   */
  static async validarSenha(email: string, senha: string): Promise<Usuario | null> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { email, ativo: true },
        select: {
          ...USUARIO_SELECT_FIELDS,
          senha: true
        }
      });

      if (!usuario) {
        return null;
      }

      const senhaValida = await compare(senha, usuario.senha);
      if (!senhaValida) {
        return null;
      }

      // Remover senha do retorno
      const { senha: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha as Usuario;
    } catch (error) {
      logError('Erro ao validar senha', error);
      return null;
    }
  }
}