import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para verificar todos os atendentes criados
 * e mostrar estatísticas detalhadas
 */
async function verificarAtendentes() {
  try {
    console.log('🔍 Verificando atendentes no sistema...');

    // Buscar todos os atendentes
    const atendentes = await prisma.atendente.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    // Buscar usuários atendentes
    const usuariosAtendentes = await prisma.usuario.findMany({
      where: {
        userType: 'ATENDENTE'
      }
    });

    // Buscar avaliações
    const avaliacoes = await prisma.avaliacao.findMany();

    console.log('\n📋 RELATÓRIO COMPLETO DE ATENDENTES');
    console.log('=' .repeat(60));

    // Estatísticas gerais
    const totalAtendentes = atendentes.length;
    const atendentesComUsuario = atendentes.filter(a => a.usuarioId !== null).length;
    const atendentesSemUsuario = atendentes.filter(a => a.usuarioId === null).length;
    const atendentesAtivos = atendentes.filter(a => a.status === 'ATIVO').length;

    console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de atendentes: ${totalAtendentes}`);
    console.log(`   Atendentes com usuário: ${atendentesComUsuario}`);
    console.log(`   Atendentes sem usuário: ${atendentesSemUsuario}`);
    console.log(`   Atendentes ativos: ${atendentesAtivos}`);

    // Distribuição por setor
    const setores = atendentes.reduce((acc, atendente) => {
      acc[atendente.setor] = (acc[atendente.setor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n🏢 DISTRIBUIÇÃO POR SETOR:`);
    Object.entries(setores).forEach(([setor, quantidade]) => {
      console.log(`   ${setor}: ${quantidade} atendente(s)`);
    });

    // Distribuição por cargo
    const cargos = atendentes.reduce((acc, atendente) => {
      acc[atendente.cargo] = (acc[atendente.cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n👔 DISTRIBUIÇÃO POR CARGO:`);
    Object.entries(cargos).forEach(([cargo, quantidade]) => {
      console.log(`   ${cargo}: ${quantidade} atendente(s)`);
    });

    // Lista detalhada
    console.log(`\n👥 LISTA DETALHADA DE ATENDENTES:`);
    console.log('-'.repeat(80));
    
    atendentes.forEach((atendente, index) => {
      const numeroAvaliacoes = avaliacoes.filter(av => av.atendenteId === atendente.id).length;
      const usuario = usuariosAtendentes.find(u => u.id === atendente.usuarioId);
      const userType = usuario ? `(${(usuario as any).userType})` : '(Sem usuário)';
      const statusIcon = atendente.status === 'ATIVO' ? '🟢' : '🔴';
      
      console.log(`${index + 1}. ${statusIcon} ${atendente.nome}`);
      console.log(`   📧 Email: ${atendente.email}`);
      console.log(`   🏢 Setor: ${atendente.setor} | Cargo: ${atendente.cargo}`);
      console.log(`   📱 Telefone: ${atendente.telefone}`);
      console.log(`   🚪 Portaria: ${atendente.portaria}`);
      console.log(`   👤 Tipo: ${userType}`);
      console.log(`   ⭐ Avaliações: ${numeroAvaliacoes}`);
      console.log(`   📅 Admissão: ${atendente.dataAdmissao.toLocaleDateString('pt-BR')}`);
      console.log('');
    });

    // Atendentes sem usuário (conforme solicitado)
    const atendentesSomenteCadastro = atendentes.filter(a => a.usuarioId === null);
    console.log(`\n🎯 ATENDENTES QUE NÃO SÃO USUÁRIOS (${atendentesSomenteCadastro.length}):`);
    console.log('-'.repeat(50));
    
    atendentesSomenteCadastro.forEach((atendente, index) => {
      console.log(`${index + 1}. ${atendente.nome} - ${atendente.setor}/${atendente.cargo}`);
    });

    console.log(`\n✅ Verificação concluída com sucesso!`);
    console.log(`📝 Total de ${atendentesSomenteCadastro.length} atendentes criados sem usuário do sistema.`);

  } catch (error) {
    console.error('❌ Erro ao verificar atendentes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
verificarAtendentes()
  .then(() => {
    console.log('\n🎉 Verificação executada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na verificação:', error);
    process.exit(1);
  });