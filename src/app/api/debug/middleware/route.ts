import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    // Simular o que o middleware vê
    const middlewareAuth = await auth()
    const isLoggedIn = !!middlewareAuth
    const userType = middlewareAuth?.user?.userType
    
    // Verificar permissões como o middleware faz
    function canAccessRoute(userType: string | undefined, route: string): boolean {
      if (!userType) return false
      
      if (route.startsWith('/usuarios')) {
        return userType === 'ADMIN'
      }
      
      return true
    }
    
    const pathname = '/usuarios'
    const canAccess = canAccessRoute(userType, pathname)
    
    return NextResponse.json({
      success: true,
      message: 'Debug do middleware',
      data: {
        middlewareDetection: {
          isLoggedIn,
          userType,
          authObject: middlewareAuth ? {
            user: {
              id: middlewareAuth.user?.id,
              name: middlewareAuth.user?.name,
              email: middlewareAuth.user?.email,
              userType: middlewareAuth.user?.userType
            }
          } : null
        },
        permissionCheck: {
          route: pathname,
          canAccess,
          reason: canAccess 
            ? 'Usuário tem permissão' 
            : isLoggedIn 
              ? `Usuário ${userType} não tem permissão (precisa ser ADMIN)` 
              : 'Usuário não está logado'
        },
        expectedBehavior: {
          shouldRedirectTo: isLoggedIn 
            ? (canAccess ? 'Permitir acesso' : '/dashboard') 
            : '/login',
          explanation: isLoggedIn 
            ? (canAccess 
                ? 'Usuário logado com permissão adequada' 
                : 'Usuário logado mas sem permissão - redireciona para dashboard'
              )
            : 'Usuário não logado - deveria redirecionar para login'
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro no debug do middleware:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro no debug do middleware',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}