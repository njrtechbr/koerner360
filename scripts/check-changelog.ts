import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkChangelog() {
  try {
    console.log('🔍 Verificando dados do changelog...');
    
    // Buscar todos os changelogs com seus itens
    const changelogs = await prisma.changelog.findMany({
      include: {
        itens: {
          orderBy: {
            ordem: 'asc'
          }
        },
        autor: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataLancamento: 'desc'
      }
    });
    
    console.log(`📊 Total de changelogs encontrados: ${changelogs.length}`);
    console.log('');
    
    for (const changelog of changelogs) {
      console.log(`📋 Versão: ${changelog.versao}`);
      console.log(`   📅 Data: ${changelog.dataLancamento.toLocaleDateString('pt-BR')}`);
      console.log(`   🏷️  Tipo: ${changelog.tipo}`);
      console.log(`   📝 Título: ${changelog.titulo}`);
      console.log(`   📄 Descrição: ${changelog.descricao.substring(0, 100)}...`);
      console.log(`   🔖 Categoria: ${changelog.categoria || 'N/A'}`);
      console.log(`   ⚡ Prioridade: ${changelog.prioridade}`);
      console.log(`   👁️  Publicado: ${changelog.publicado ? 'Sim' : 'Não'}`);
      console.log(`   👤 Autor: ${changelog.autor?.nome || 'Sistema'}`);
      console.log(`   📝 Itens: ${changelog.itens.length}`);
      
      if (changelog.itens.length > 0) {
        console.log('   📋 Lista de itens:');
        changelog.itens.forEach((item, index) => {
          console.log(`      ${index + 1}. [${item.tipo}] ${item.titulo}`);
          console.log(`         ${item.descricao.substring(0, 80)}...`);
        });
      }
      
      console.log('');
    }
    
    // Estatísticas gerais
    const totalItens = await prisma.changelogItem.count();
    const publicados = await prisma.changelog.count({ where: { publicado: true } });
    const naoPublicados = await prisma.changelog.count({ where: { publicado: false } });
    
    console.log('📊 Estatísticas Gerais:');
    console.log(`   📋 Total de changelogs: ${changelogs.length}`);
    console.log(`   📝 Total de itens: ${totalItens}`);
    console.log(`   ✅ Publicados: ${publicados}`);
    console.log(`   ❌ Não publicados: ${naoPublicados}`);
    
    // Estatísticas por tipo
    const tipoStats = await prisma.changelogItem.groupBy({
      by: ['tipo'],
      _count: {
        tipo: true
      }
    });
    
    console.log('\n📊 Estatísticas por Tipo:');
    tipoStats.forEach(stat => {
      console.log(`   ${stat.tipo}: ${stat._count.tipo} itens`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar changelog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkChangelog()
    .then(() => {
      console.log('\n✅ Verificação concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na verificação:', error);
      process.exit(1);
    });
}

export { checkChangelog };