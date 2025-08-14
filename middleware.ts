import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req) {
    try {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ["/login", "/api/auth"]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Controle de acesso baseado em roles
    if (token) {
      const userType = token.userType

      // Rotas apenas para admin
      if (pathname.startsWith("/usuarios") || pathname.startsWith("/configuracoes")) {
        if (userType !== "ADMIN" && userType !== "SUPERVISOR") {
          const dashboardUrl = new URL("/dashboard", req.url)
          return NextResponse.redirect(dashboardUrl)
        }
      }

      // Supervisores não podem acessar configurações
      if (pathname.startsWith("/configuracoes") && userType !== "ADMIN") {
        const dashboardUrl = new URL("/dashboard", req.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }

    return NextResponse.next()
    } catch (error) {
      // Captura erros JWT (tokens corrompidos) e redireciona para login
      console.error('Erro no middleware (provavelmente JWT corrompido):', error)
      const loginUrl = new URL('/login', req.url)
      const response = NextResponse.redirect(loginUrl)
      
      // Limpa cookies do NextAuth para forçar nova autenticação
      response.cookies.delete('next-auth.session-token')
      response.cookies.delete('__Secure-next-auth.session-token')
      response.cookies.delete('next-auth.csrf-token')
      response.cookies.delete('__Secure-next-auth.csrf-token')
      
      return response
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}