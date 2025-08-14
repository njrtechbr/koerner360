import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listPostgresTables() {
  try {
    console.log('🔍 Listando todas as tabelas no PostgreSQL local...\n')
    
    // Consulta SQL para listar todas as tabelas
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    ` as Array<{ table_name: string; table_schema: string }>
    
    console.log('📋 TABELAS ENCONTRADAS:')
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`)
    })
    
    console.log(`\n📊 Total de tabelas: ${tables.length}`)
    
    // Verificar se todas as tabelas esperadas existem
    const expectedTables = ['usuarios', 'avaliacoes', 'feedbacks', 'audit_logs']
    const existingTables = tables.map(t => t.table_name)
    
    console.log('\n✅ VERIFICAÇÃO DE MIGRAÇÃO:')
    expectedTables.forEach(expectedTable => {
      const exists = existingTables.includes(expectedTable)
      const status = exists ? '✅' : '❌'
      console.log(`   ${status} ${expectedTable}: ${exists ? 'MIGRADA' : 'NÃO ENCONTRADA'}`)
    })
    
    // Verificar contagem de registros em cada tabela
    console.log('\n📊 CONTAGEM DE REGISTROS:')
    
    if (existingTables.includes('usuarios')) {
      const usuariosCount = await prisma.usuario.count()
      console.log(`   👥 usuarios: ${usuariosCount} registros`)
    }
    
    if (existingTables.includes('avaliacoes')) {
      const avaliacoesCount = await prisma.avaliacao.count()
      console.log(`   ⭐ avaliacoes: ${avaliacoesCount} registros`)
    }
    
    if (existingTables.includes('feedbacks')) {
      const feedbacksCount = await prisma.feedback.count()
      console.log(`   💬 feedbacks: ${feedbacksCount} registros`)
    }
    
    if (existingTables.includes('audit_logs')) {
      const auditLogsCount = await prisma.auditLog.count()
      console.log(`   📋 audit_logs: ${auditLogsCount} registros`)
    }
    
    console.log('\n🎉 Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listPostgresTables()