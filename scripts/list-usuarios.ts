import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsuarios() {
  try {
    const usuarios = await prisma.$queryRaw`
      SELECT id, nome, email, "tipoUsuario", ativo 
      FROM usuarios 
      WHERE ativo = true
      LIMIT 5;
    `;
    
    console.log('Usuários ativos na tabela usuarios:');
    console.log(usuarios);
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsuarios();