import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarBancoDados() {
  try {
    console.log('🔍 Verificando estrutura do banco de dados...');
    
    // Verificar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar tabela de usuários
    const totalUsuarios = await prisma.usuario.count();
    console.log(`👤 Total de usuários: ${totalUsuarios}`);
    
    const usuariosPorTipo = await prisma.usuario.groupBy({
      by: ['tipoUsuario'],
      _count: {
        id: true
      }
    });
    
    console.log('📊 Usuários por tipo:');
    usuariosPorTipo.forEach(grupo => {
      console.log(`   ${grupo.tipoUsuario}: ${grupo._count.id}`);
    });
    
    // Verificar tabela de atendentes
    const totalAtendentes = await prisma.atendente.count();
    console.log(`👥 Total de atendentes: ${totalAtendentes}`);
    
    // Verificar tabela de avaliações
    const totalAvaliacoes = await prisma.avaliacao.count();
    console.log(`⭐ Total de avaliações: ${totalAvaliacoes}`);
    
    // Verificar tabela de feedbacks
    const totalFeedbacks = await prisma.feedback.count();
    console.log(`💬 Total de feedbacks: ${totalFeedbacks}`);
    
    // Verificar relacionamentos
    const usuariosComAtendentes = await prisma.usuario.findMany({
      where: {
        tipoUsuario: 'ATENDENTE'
      },
      include: {
        atendente: true
      }
    });
    
    const atendentesComUsuario = usuariosComAtendentes.filter(u => u.atendente !== null).length;
    console.log(`🔗 Atendentes com usuário vinculado: ${atendentesComUsuario}`);
    
    // Verificar dados específicos
    const adminUser = await prisma.usuario.findFirst({
      where: {
        tipoUsuario: 'ADMIN'
      }
    });
    
    if (adminUser) {
      console.log(`🔑 Usuário admin encontrado: ${adminUser.email}`);
    }
    
    const supervisorUser = await prisma.usuario.findFirst({
      where: {
        tipoUsuario: 'SUPERVISOR'
      }
    });
    
    if (supervisorUser) {
      console.log(`👨‍💼 Usuário supervisor encontrado: ${supervisorUser.email}`);
    }
    
    // Listar todos os atendentes
    const atendentes = await prisma.atendente.findMany({
      include: {
        usuario: {
          select: {
            email: true,
            nome: true
          }
        }
      }
    });
    
    console.log('\n📋 Lista de atendentes:');
    atendentes.forEach(atendente => {
      console.log(`   • ${atendente.nome} (${atendente.email}) - ${atendente.cargo}`);
      if (atendente.usuario) {
        console.log(`     Usuário: ${atendente.usuario.email}`);
      }
    });
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verificarBancoDados();