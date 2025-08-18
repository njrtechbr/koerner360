import { auth } from '../auth'
import { NextRequest } from 'next/server'

async function checkCurrentSession() {
  try {
    console.log('🔍 Verificando sessão atual...')
    
    // Simular uma requisição para obter a sessão
    const session = await auth()
    
    if (!session) {
      console.log('❌ Nenhuma sessão ativa encontrada')
      return
    }
    
    console.log('✅ Sessão ativa encontrada:')
    console.log('📧 Email:', session.user?.email)
    console.log('👤 Nome:', session.user?.name)
    console.log('🏷️ Tipo:', session.user?.userType)
    console.log('🆔 ID:', session.user?.id)
    
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error)
  }
}

checkCurrentSession()
  .then(() => {
    console.log('\n✅ Verificação de sessão concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })