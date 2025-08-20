import { prisma } from '../src/lib/prisma';

async function checkDemoUsers() {
  try {
    console.log('🔍 Verificando usuários de demonstração...');
    
    const demoUsers = await prisma.usuario.findMany({
      where: {
        email: {
          in: ['admin@koerner.com', 'supervisor@koerner.com', 'atendente@koerner.com']
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        userType: true,
        ativo: true
      }
    });
    
    console.log('👥 Usuários de demonstração encontrados:', demoUsers.length);
    
    demoUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.nome} (${user.email}) - ${user.userType} - ${user.ativo ? 'Ativo' : 'Inativo'}`);
    });
    
    if (demoUsers.length === 0) {
      console.log('❌ Nenhum usuário de demonstração encontrado!');
      console.log('💡 Execute: npm run db:create-demo-users');
    } else {
      console.log('✅ Usuários de demonstração estão disponíveis!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoUsers();