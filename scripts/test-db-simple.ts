import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Teste simples de conexão
    await prisma.$connect();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    // Teste de consulta simples
    const count = await prisma.usuario.count();
    console.log(`📊 Total de usuários no banco: ${count}`);
    
    // Teste de consulta específica
    const admin = await prisma.usuario.findFirst({
      where: {
        tipoUsuario: 'ADMIN'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true
      }
    });
    
    if (admin) {
      console.log('👑 Usuário admin encontrado:', admin);
    } else {
      console.log('❌ Nenhum usuário admin encontrado');
    }
    
    console.log('✅ Teste de banco de dados concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();