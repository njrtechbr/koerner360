import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuração do Supabase
const supabaseUrl = 'https://ijlunxdyafteoacxikdg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbHVueGR5YWZ0ZW9hY3hpa2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MjA2OTkwNTg5MX0.2EsO7mJ1uxdwkFkJA_5zUP3FaLHh861QsgeQoXKsX98';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCompleteData() {
  try {
    console.log('🚀 Iniciando migração completa dos dados do Supabase...');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await prisma.auditLog.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.usuario.deleteMany();
    console.log('✅ Dados existentes removidos');

    // 1. Migrar usuários
    console.log('👥 Migrando usuários...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('id');

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    const usuariosMigrados = [];
    for (const user of users) {
      const usuarioData = {
        id: user.id,
        nome: user.name,
        email: user.email,
        senha: user.password, // Senha já está hasheada
        tipoUsuario: user.accessType === 'admin' ? 'ADMIN' : user.accessType === 'supervisor' ? 'SUPERVISOR' : 'ATENDENTE' as 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE',
        ativo: user.status === 'ativo',
        criadoEm: new Date(user.createdAt),
        atualizadoEm: new Date(user.updatedAt),
      };

      const usuarioMigrado = await prisma.usuario.create({
        data: usuarioData,
      });
      usuariosMigrados.push(usuarioMigrado);
    }
    console.log(`✅ ${usuariosMigrados.length} usuários migrados`);

    // 2. Migrar avaliações
    console.log('⭐ Migrando avaliações...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .order('id');

    if (reviewsError) {
      throw new Error(`Erro ao buscar avaliações: ${reviewsError.message}`);
    }

    const avaliacoesMigradas = [];
    const adminUser = usuariosMigrados.find(u => u.tipoUsuario === 'ADMIN') || usuariosMigrados[0];
    
    if (!adminUser) {
      throw new Error('Nenhum usuário encontrado para ser usado como avaliador padrão');
    }
    
    for (const review of reviews) {
      const avaliacaoData = {
        id: review.id,
        avaliadoId: review.attendantId,
        avaliadorId: adminUser.id, // Usando admin como avaliador padrão
        nota: review.rating,
        comentario: review.comment || '',
        periodo: new Date(review.date).toISOString().slice(0, 7) + '-' + review.id.slice(-4), // YYYY-MM-XXXX para garantir unicidade
        criadoEm: new Date(review.date),
      };

      const avaliacaoMigrada = await prisma.avaliacao.create({
        data: avaliacaoData,
      });
      avaliacoesMigradas.push(avaliacaoMigrada);
    }
    console.log(`✅ ${avaliacoesMigradas.length} avaliações migradas`);

    // 3. Migrar configurações do sistema
    console.log('⚙️ Migrando configurações do sistema...');
    const { data: systemConfig, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .order('id');

    if (configError) {
      throw new Error(`Erro ao buscar configurações: ${configError.message}`);
    }

    const { data: systemModules, error: modulesError } = await supabase
      .from('system_modules')
      .select('*')
      .order('id');

    if (modulesError) {
      throw new Error(`Erro ao buscar módulos: ${modulesError.message}`);
    }

    // Criar um feedback consolidado com as configurações
    const configData = {
      titulo: 'Configurações do Sistema Migradas',
      conteudo: JSON.stringify({
        systemConfig,
        systemModules,
        migratedAt: new Date().toISOString(),
        description: 'Configurações e módulos migrados do Supabase'
      }, null, 2),
      tipo: 'MELHORIA' as const,
      prioridade: 'ALTA' as const,
      status: 'RESOLVIDO' as const,
      receptorId: usuariosMigrados.find(u => u.tipoUsuario === 'ADMIN')?.id || usuariosMigrados[0]?.id || 'default-admin',
      remetenteId: usuariosMigrados.find(u => u.tipoUsuario === 'ADMIN')?.id || usuariosMigrados[0]?.id || 'default-admin',
    };

    const feedbackMigrado = await prisma.feedback.create({
      data: configData,
    });
    console.log(`✅ Configurações do sistema migradas como feedback`);

    // 4. Estatísticas da migração
    console.log('\n📊 Estatísticas da migração:');
    console.log(`👥 Usuários migrados: ${usuariosMigrados.length}`);
    console.log(`⭐ Avaliações migradas: ${avaliacoesMigradas.length}`);
    console.log(`⚙️ Configurações migradas: ${systemConfig.length} configs + ${systemModules.length} módulos`);
    console.log(`💬 Feedbacks criados: 1`);
    console.log(`📝 Audit logs: 0 (tabela vazia no Supabase)`);

    // Estatísticas por tipo de usuário
    const estatisticasUsuarios = usuariosMigrados.reduce((acc, usuario) => {
      acc[usuario.tipoUsuario] = (acc[usuario.tipoUsuario] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n👥 Usuários por tipo:');
    Object.entries(estatisticasUsuarios).forEach(([tipo, quantidade]) => {
      console.log(`   ${tipo}: ${quantidade}`);
    });

    // Estatísticas das avaliações
    const mediaNotas = avaliacoesMigradas.reduce((sum, av) => sum + av.nota, 0) / avaliacoesMigradas.length;
    const notasDistribuicao = avaliacoesMigradas.reduce((acc, av) => {
      acc[av.nota] = (acc[av.nota] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('\n⭐ Estatísticas das avaliações:');
    console.log(`   Média geral: ${mediaNotas.toFixed(2)}`);
    console.log(`   Distribuição por nota:`);
    Object.entries(notasDistribuicao).forEach(([nota, quantidade]) => {
      console.log(`     ${nota} estrelas: ${quantidade} avaliações`);
    });

    console.log('\n🎉 Migração completa realizada com sucesso!');
    console.log('\n📋 Dados disponíveis no PostgreSQL local:');
    console.log('   - Tabela usuarios: dados completos de todos os usuários');
    console.log('   - Tabela avaliacoes: todas as avaliações com notas e comentários');
    console.log('   - Tabela feedbacks: configurações do sistema consolidadas');
    console.log('   - Tabela audit_logs: vazia (como no Supabase)');
    console.log('\n🔧 Ferramentas disponíveis:');
    console.log('   - npm run db:check-tables (verificar dados migrados)');
    console.log('   - npm run db:list-tables (listar tabelas)');
    console.log('   - npx prisma studio (visualizar dados)');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCompleteData()
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });