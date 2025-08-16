import { auth } from './auth'
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/changelog", "/api/auth", "/test-session"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se é rota pública, permite acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Se não há sessão e não é rota pública, redireciona para login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Se há sessão, permite acesso
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - changelog (public changelog page)
     * - api/auth (NextAuth routes)
     * - test-session (página de teste)
     */
    "/((?!_next/static|_next/image|favicon.ico|changelog|api/auth|test-session).*)",
  ],
}