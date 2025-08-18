const { auth } = require('../auth')

async function checkSession() {
  try {
    console.log('🔍 Verificando sessão atual...')
    
    // Tentar obter a sessão
    const session = await auth()
    
    if (!session) {
      console.log('❌ Nenhuma sessão ativa encontrada')
      console.log('💡 Faça login para acessar o sistema')
      return
    }
    
    console.log('✅ Sessão ativa encontrada:')
    console.log('📧 Email:', session.user?.email || 'N/A')
    console.log('👤 Nome:', session.user?.name || 'N/A')
    console.log('🏷️ Tipo:', session.user?.userType || 'N/A')
    console.log('🆔 ID:', session.user?.id || 'N/A')
    
    // Verificar permissões para /usuarios
    const userType = session.user?.userType
    const canAccessUsuarios = userType === 'ADMIN'
    
    console.log('\n🔐 Análise de Permissões:')
    console.log('Tipo de usuário atual:', userType)
    console.log('Acesso a /usuarios:', canAccessUsuarios ? '✅ PERMITIDO' : '❌ NEGADO')
    
    if (!canAccessUsuarios) {
      console.log('\n⚠️ PROBLEMA IDENTIFICADO:')
      console.log('🚫 O usuário atual NÃO tem permissão para acessar /usuarios')
      console.log('📋 Apenas usuários do tipo "ADMIN" podem acessar esta rota')
      console.log('🔄 Isso explica o redirecionamento para /dashboard')
      console.log('\n💡 SOLUÇÕES:')
      console.log('1. Fazer login com uma conta ADMIN (admin@koerner360.com)')
      console.log('2. Ou alterar as permissões no middleware para permitir SUPERVISOR')
    } else {
      console.log('\n✅ Usuário tem permissão adequada para acessar /usuarios')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error.message)
    console.log('\n💡 Isso pode indicar que não há sessão ativa')
  }
}

checkSession()
  .then(() => {
    console.log('\n🏁 Verificação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  })