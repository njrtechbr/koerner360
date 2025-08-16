const { PrismaClient } = require('@prisma/client');

async function checkAtendentes() {
  const prisma = new PrismaClient();
  
  try {
    const count = await prisma.atendente.count();
    console.log('Total de atendentes:', count);
    
    if (count > 0) {
      const atendentes = await prisma.atendente.findMany({ take: 3 });
      console.log('Primeiros 3 atendentes:', JSON.stringify(atendentes, null, 2));
    } else {
      console.log('Nenhum atendente encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar atendentes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAtendentes();