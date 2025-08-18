import { auth } from '@/auth'

export type TipoUsuario = 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR'

// Função server-side para verificar acesso a rotas
function canAccessRoute(userType: TipoUsuario | undefined, route: string): boolean {
  if (!userType) return false

  // Rotas administrativas - apenas ADMIN
  if (route.startsWith('/admin')) {
    return userType === 'ADMIN'
  }

  // Rotas autenticadas dentro do grupo (auth) - verificar permissões específicas
  if (route.startsWith('/usuarios')) {
    return userType === 'ADMIN' || userType === 'SUPERVISOR'
  }

  if (route.startsWith('/atendentes') || route.startsWith('/avaliacoes') || route.startsWith('/feedbacks')) {
    return userType === 'ADMIN' || userType === 'SUPERVISOR'
  }

  // Dashboard do consultor - apenas CONSULTOR
  if (route.startsWith('/consultor')) {
    return userType === 'CONSULTOR'
  }

  // Dashboard geral - todos os tipos autenticados
  if (route.startsWith('/dashboard')) {
    return ['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR'].includes(userType)
  }

  // Outras rotas autenticadas
  return true
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userType = req.auth?.user?.userType as TipoUsuario | undefined





  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/changelog', '/test-auth-simple']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se não está logado e não é uma rota pública, redirecionar para login
  if (!isLoggedIn && !isPublicRoute) {

    return Response.redirect(new URL('/login', req.url))
  }

  // Se está logado e está na página de login, redirecionar para dashboard apropriado
  if (isLoggedIn && pathname === '/login') {
    const dashboardUrl = getDashboardUrl(userType)

    return Response.redirect(new URL(dashboardUrl, req.url))
  }

  // Redirecionar root para dashboard apropriado se logado
  if (isLoggedIn && pathname === '/') {
    const dashboardUrl = getDashboardUrl(userType)

    return Response.redirect(new URL(dashboardUrl, req.url))
  }

  // Controle de acesso baseado em permissões
  if (isLoggedIn && !isPublicRoute) {
    // Verificar se o usuário tem permissão para acessar a rota
    if (!canAccessRoute(userType, pathname)) {
      // Redirecionar para dashboard apropriado se não tem permissão
      const dashboardUrl = getDashboardUrl(userType)

      return Response.redirect(new URL(dashboardUrl, req.url))
    }
  }
})

/**
 * Determina a URL do dashboard baseada no tipo de usuário
 */
function getDashboardUrl(userType: TipoUsuario | undefined): string {
  switch (userType) {
    case 'ADMIN':
      return '/dashboard'
    case 'SUPERVISOR':
      return '/dashboard'
    case 'ATENDENTE':
      return '/dashboard'
    case 'CONSULTOR':
      return '/consultor'
    default:
      return '/dashboard'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - test-fetch (test page)
     * - test-auth (test page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|test-fetch|test-auth|test-direct).*)',
  ],
}