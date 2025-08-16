import { PrismaClient } from '@prisma/client';

// Configuração global do Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Criar instância do Prisma Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

// Em desenvolvimento, reutilizar a conexão para evitar múltiplas instâncias
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Função para desconectar do banco (útil em testes)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Função para verificar conexão com o banco
export async function verificarConexao() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com o banco de dados estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error);
    return false;
  }
}

// Tipos úteis exportados do Prisma
export type { Usuario, TipoUsuario } from '@prisma/client';