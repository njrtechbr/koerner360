import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/usuarios',
  '/avaliacoes',
  '/relatorios',
  '/configuracoes',
  '/perfil'
];

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/login',
  '/api/auth'
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Se está na raiz, redireciona para o dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Permite acesso a rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Para rotas protegidas, verifica se há sessão
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};