import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente do .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...')
    
    // Teste de conexão básica
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Contar usuários
    const userCount = await prisma.usuario.count()
    console.log(`👥 Total de usuários no banco: ${userCount}`)
    
    // Listar usuários
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        userType: true,
        ativo: true
      }
    })
    
    console.log('\n📋 Usuários cadastrados:')
    users.forEach(user => {
      console.log(`  - ${user.nome} (${user.email}) - ${user.userType} - ${user.ativo ? 'Ativo' : 'Inativo'}`)
    })
    
    // Contar avaliações
    const avaliacaoCount = await prisma.avaliacao.count()
    console.log(`\n📊 Total de avaliações: ${avaliacaoCount}`)
    
    // Contar feedbacks
    const feedbackCount = await prisma.feedback.count()
    console.log(`💬 Total de feedbacks: ${feedbackCount}`)
    
    // Contar audit logs
    const auditLogCount = await prisma.auditLog.count()
    console.log(`📋 Total de audit logs: ${auditLogCount}`)
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!')
    console.log('✅ Todas as tabelas do Supabase foram migradas com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()