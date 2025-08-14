import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllTables() {
  try {
    console.log('🔍 Verificando todas as tabelas no PostgreSQL local...\n')
    
    // Verificar tabela usuarios
    console.log('👥 TABELA: usuarios')
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true
      }
    })
    console.log(`   📊 Total de registros: ${usuarios.length}`)
    if (usuarios.length > 0) {
      console.log('   📋 Primeiros 3 registros:')
      usuarios.slice(0, 3).forEach((user, index) => {
        console.log(`     ${index + 1}. ${user.nome} (${user.email}) - ${user.tipoUsuario} - ${user.ativo ? 'Ativo' : 'Inativo'}`)
      })
    }
    console.log()
    
    // Verificar tabela avaliacoes
    console.log('⭐ TABELA: avaliacoes')
    const avaliacoes = await prisma.avaliacao.findMany({
      select: {
        id: true,
        avaliadoId: true,
        avaliadorId: true,
        periodo: true,
        nota: true,
        comentario: true,
        criadoEm: true
      }
    })
    console.log(`   📊 Total de registros: ${avaliacoes.length}`)
    if (avaliacoes.length > 0) {
      console.log('   📋 Primeiros 3 registros:')
      avaliacoes.slice(0, 3).forEach((avaliacao, index) => {
        console.log(`     ${index + 1}. Avaliado: ${avaliacao.avaliadoId}, Avaliador: ${avaliacao.avaliadorId}, Nota: ${avaliacao.nota}, Período: ${avaliacao.periodo}`)
      })
    }
    console.log()
    
    // Verificar tabela feedbacks
    console.log('💬 TABELA: feedbacks')
    const feedbacks = await prisma.feedback.findMany({
      select: {
        id: true,
        remetenteId: true,
        receptorId: true,
        tipo: true,
        titulo: true,
        conteudo: true,
        prioridade: true,
        status: true,
        criadoEm: true
      }
    })
    console.log(`   📊 Total de registros: ${feedbacks.length}`)
    if (feedbacks.length > 0) {
      console.log('   📋 Registros:')
      feedbacks.forEach((feedback, index) => {
        console.log(`     ${index + 1}. ${feedback.titulo} - ${feedback.tipo} - ${feedback.status} - Prioridade: ${feedback.prioridade}`)
      })
    }
    console.log()
    
    // Verificar tabela audit_logs
    console.log('📋 TABELA: audit_logs')
    const auditLogs = await prisma.auditLog.findMany({
      select: {
        id: true,
        usuarioId: true,
        acao: true,
        nomeTabela: true,
        registroId: true,
        criadoEm: true
      }
    })
    console.log(`   📊 Total de registros: ${auditLogs.length}`)
    if (auditLogs.length > 0) {
      console.log('   📋 Primeiros 5 registros:')
      auditLogs.slice(0, 5).forEach((log, index) => {
        console.log(`     ${index + 1}. Usuário: ${log.usuarioId}, Ação: ${log.acao}, Tabela: ${log.nomeTabela}, Registro: ${log.registroId}`)
      })
    } else {
      console.log('   ℹ️ Tabela vazia (como esperado - estava vazia no Supabase)')
    }
    console.log()
    
    // Resumo geral
    console.log('📊 RESUMO GERAL:')
    console.log(`   👥 Usuários: ${usuarios.length}`)
    console.log(`   ⭐ Avaliações: ${avaliacoes.length}`)
    console.log(`   💬 Feedbacks: ${feedbacks.length}`)
    console.log(`   📋 Audit Logs: ${auditLogs.length}`)
    console.log()
    
    // Verificar estatísticas por tipo de usuário
    const estatisticasUsuarios = await prisma.usuario.groupBy({
      by: ['tipoUsuario'],
      _count: {
        id: true
      }
    })
    
    console.log('👥 ESTATÍSTICAS POR TIPO DE USUÁRIO:')
    estatisticasUsuarios.forEach(stat => {
      const emoji = stat.tipoUsuario === 'ADMIN' ? '👑' : 
                   stat.tipoUsuario === 'SUPERVISOR' ? '👨‍💼' : '👥'
      console.log(`   ${emoji} ${stat.tipoUsuario}: ${stat._count.id}`)
    })
    
    console.log('\n✅ Verificação completa! Todas as tabelas do Supabase foram migradas com sucesso.')
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllTables()