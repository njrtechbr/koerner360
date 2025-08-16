import { prisma } from '@/lib/prisma';
import { StatusAtendente } from '@/types/atendente';

/**
 * Gera uma senha temporária aleatória
 * @returns Senha temporária de 8 caracteres
 */
export function gerarSenhaTemporaria(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let senha = '';
  
  for (let i = 0; i < 8; i++) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return senha;
}

/**
 * Valida se um atendente pode ter um usuário criado
 * @param atendenteId - ID do atendente
 * @returns Objeto com resultado da validação
 */
export async function validarCriacaoUsuario(atendenteId: string): Promise<{
  valido: boolean;
  erro?: string;
  atendente?: {
    id: string;
    nome: string;
    email: string;
    status: StatusAtendente;
    usuarioId: string | null;
  };
}> {
  try {
    // Buscar o atendente
    const atendente = await prisma.atendente.findUnique({
      where: { id: atendenteId },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
        usuarioId: true,
      },
    });

    if (!atendente) {
      return {
        valido: false,
        erro: 'Atendente não encontrado',
      };
    }

    // Verificar se já possui usuário
    if (atendente.usuarioId) {
      return {
        valido: false,
        erro: 'Atendente já possui usuário associado',
        atendente: {
          ...atendente,
          status: atendente.status as StatusAtendente
        },
      };
    }

    // Verificar se está ativo
    if (atendente.status !== StatusAtendente.ATIVO) {
      return {
        valido: false,
        erro: 'Atendente deve estar ativo para criar usuário',
        atendente: {
          ...atendente,
          status: atendente.status as StatusAtendente
        },
      };
    }

    // Verificar se email é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(atendente.email)) {
      return {
        valido: false,
        erro: 'Email do atendente é inválido',
        atendente: {
          ...atendente,
          status: atendente.status as StatusAtendente
        },
      };
    }

    // Verificar se nome está completo (pelo menos 2 palavras)
    const nomePartes = atendente.nome.trim().split(' ');
    if (nomePartes.length < 2 || nomePartes.some(parte => parte.length < 2)) {
      return {
        valido: false,
        erro: 'Nome do atendente deve estar completo (nome e sobrenome)',
        atendente: {
          ...atendente,
          status: atendente.status as StatusAtendente
        },
      };
    }

    // Verificar se já existe usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: atendente.email },
    });

    if (usuarioExistente) {
      return {
        valido: false,
        erro: 'Já existe um usuário com este email',
        atendente: {
          ...atendente,
          status: atendente.status as StatusAtendente
        },
      };
    }

    return {
      valido: true,
      atendente: {
        ...atendente,
        status: atendente.status as StatusAtendente
      },
    };
  } catch (error) {
    console.error('Erro ao validar criação de usuário:', error);
    return {
      valido: false,
      erro: 'Erro interno do servidor',
    };
  }
}