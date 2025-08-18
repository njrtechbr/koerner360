import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma sessão ativa',
        data: null,
        timestamp: new Date().toISOString()
      })
    }
    
    const userType = session.user?.userType
    const canAccessUsuarios = userType === 'ADMIN'
    
    return NextResponse.json({
      success: true,
      message: 'Sessão encontrada',
      data: {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          userType: session.user?.userType
        },
        permissions: {
          canAccessUsuarios,
          explanation: canAccessUsuarios 
            ? 'Usuário ADMIN pode acessar /usuarios' 
            : `Usuário ${userType} NÃO pode acessar /usuarios (apenas ADMIN)`
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar sessão',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}