import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsuariosTable() {
  try {
    // Verificar se a tabela usuarios existe
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('Estrutura da tabela usuarios:');
    console.log(result);
    
    // Verificar alguns usuários de exemplo
    const usuarios = await prisma.$queryRaw`
      SELECT id, name, email, tipo, status 
      FROM usuarios 
      LIMIT 3;
    `;
    
    console.log('\nUsuários de exemplo:');
    console.log(usuarios);
    
  } catch (error) {
    console.error('Erro ao verificar tabela usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsuariosTable();