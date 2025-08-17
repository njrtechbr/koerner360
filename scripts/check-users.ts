import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no sistema...');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });
    
    console.log(`\n📊 Total de usuários: ${usuarios.length}`);
    
    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado no sistema.');
      return;
    }
    
    console.log('\n👥 USUÁRIOS ENCONTRADOS:');
    console.log('='.repeat(50));
    
    usuarios.forEach((usuario, index) => {
      const statusIcon = usuario.ativo ? '🟢' : '🔴';
      const tipoIcon = usuario.tipoUsuario === 'ADMIN' ? '👑' : 
                       usuario.tipoUsuario === 'SUPERVISOR' ? '👨‍💼' : 
                       usuario.tipoUsuario === 'ATENDENTE' ? '👤' : '❓';
      
      console.log(`\n${index + 1}. ${statusIcon} ${usuario.nome}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   ${tipoIcon} Tipo: ${usuario.tipoUsuario}`);
      console.log(`   📅 Criado em: ${usuario.criadoEm.toLocaleString('pt-BR')}`);
    });
    
    // Contar por tipo
    const contadores: Record<string, number> = {};
    usuarios.forEach(user => {
      contadores[user.tipoUsuario] = (contadores[user.tipoUsuario] || 0) + 1;
    });
    
    console.log('\n📈 ESTATÍSTICAS:');
    console.log('='.repeat(30));
    Object.entries(contadores).forEach(([tipo, count]) => {
      const icon = tipo === 'ADMIN' ? '👑' : 
                   tipo === 'SUPERVISOR' ? '👨‍💼' : 
                   tipo === 'ATENDENTE' ? '👤' : '❓';
      console.log(`${icon} ${tipo}: ${count}`);
    });
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();