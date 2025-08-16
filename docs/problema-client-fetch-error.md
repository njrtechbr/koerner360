# Problema: CLIENT_FETCH_ERROR no NextAuth.js

## 📋 Resumo do Problema

O sistema Koerner 360 está apresentando um erro crítico de autenticação onde o NextAuth.js não consegue buscar dados de sessão, resultando em `CLIENT_FETCH_ERROR` e `net::ERR_ABORTED` na rota `/api/auth/session`.

## 🔍 Sintomas Observados

### Erros no Console do Navegador
```
net::ERR_ABORTED http://localhost:3000/api/auth/session
[next-auth][error][CLIENT_FETCH_ERROR] 
https://next-auth.js.org/errors#client_fetch_error Failed to fetch
```

### Comportamento Atual
- A rota `/api/auth/session` retorna status 200 OK quando testada com `curl`
- O corpo da resposta está vazio (`{}`)
- Headers CORS estão configurados corretamente
- O erro ocorre tanto em `localhost:3000` quanto em `127.0.0.1:3000`
- O middleware foi simplificado para debug, mas o problema persiste

## 🛠️ Configuração Atual

### Stack Tecnológica
- **Next.js**: 15 (App Router)
- **NextAuth.js**: v4 (revertido de v5)
- **TypeScript**: Strict mode
- **Node.js**: Ambiente de desenvolvimento

### Arquivos de Configuração

#### `.env.local`
```env
NEXTAUTH_URL=http://127.0.0.1:3000
NEXTAUTH_SECRET=koerner360-secret-key-development-only
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/koerner360?schema=public
```

#### `src/auth.ts`
```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Lógica de autenticação
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Callbacks JWT
    },
    async session({ session, token }) {
      // Callbacks de sessão
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60 // 24 horas
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}
```

#### `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

#### `middleware.ts` (Simplificado para Debug)
```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ["/login", "/changelog", "/api/auth", "/test-session"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  console.log('Middleware: Permitindo acesso a:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 🔬 Testes Realizados

### 1. Teste com cURL
```bash
# Teste da rota de sessão
curl -v http://127.0.0.1:3000/api/auth/session

# Resultado:
# Status: 200 OK
# Body: {}
# Headers: Access-Control-Allow-Origin: *
```

### 2. Alterações de Configuração Testadas
- ✅ Mudança de `NEXTAUTH_URL` de `localhost` para `127.0.0.1`
- ✅ Simplificação do middleware
- ✅ Exclusão da rota `/test-session` do matcher do middleware
- ✅ Habilitação do modo debug no NextAuth
- ✅ Verificação de headers CORS

### 3. Página de Teste
Criada página `/test-session` para testar o `useSession()` hook:
```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function TestSession() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Sessão</h1>
      <div className="space-y-2">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Sessão:</strong> {JSON.stringify(session, null, 2)}</p>
      </div>
    </div>
  );
}
```

## 🚨 Possíveis Causas

### 1. Incompatibilidade NextAuth v4 + Next.js 15
- Next.js 15 introduziu mudanças no App Router
- NextAuth v4 pode não ser totalmente compatível
- Recomendação oficial é usar NextAuth v5 (Auth.js) com Next.js 15

### 2. Configuração de basePath
- NextAuth pode estar esperando um `basePath` específico
- Não há configuração explícita de `basePath` no `authOptions`

### 3. Problemas de Sessão
- Não há sessão ativa (usuário não logado)
- Cookies de sessão corrompidos ou inexistentes
- Configuração incorreta do `SessionProvider`

### 4. Conflitos de Middleware
- Middleware pode estar interferindo nas rotas do NextAuth
- Configuração do `matcher` pode estar bloqueando rotas necessárias

## 📊 Logs do Servidor

### Terminal de Desenvolvimento
```
✓ Ready in 2.1s
○ Compiling /middleware ...
✓ Compiled /middleware in 89ms
○ Compiling /test-session/page ...
✓ Compiled /test-session/page in 1045ms
GET /test-session 200 in 1065ms
GET /api/auth/session 200 in 15ms
```

**Observação**: O servidor retorna 200 OK para `/api/auth/session`, mas o cliente recebe `net::ERR_ABORTED`.

## 🎯 Próximos Passos Recomendados

### 1. Migração para NextAuth v5 (Auth.js)
```bash
npm uninstall next-auth
npm install @auth/core @auth/nextjs
```

### 2. Atualização da Configuração
- Migrar `authOptions` para nova sintaxe do Auth.js
- Atualizar imports e providers
- Revisar callbacks e configurações de sessão

### 3. Teste de Compatibilidade
- Criar ambiente de teste isolado
- Testar NextAuth v5 com Next.js 15
- Validar funcionamento do `useSession()`

### 4. Revisão do SessionProvider
- Verificar configuração no layout principal
- Garantir que o provider está envolvendo toda a aplicação
- Testar com configurações mínimas

## 📚 Referências

- [NextAuth.js v4 Documentation](https://next-auth.js.org/)
- [Auth.js (NextAuth v5) Documentation](https://authjs.dev/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [CLIENT_FETCH_ERROR Troubleshooting](https://next-auth.js.org/errors#client_fetch_error)

## 🏷️ Tags

`nextauth` `next.js-15` `authentication` `client-fetch-error` `app-router` `typescript` `debugging`

---

**Data de Criação**: Janeiro 2025  
**Última Atualização**: Janeiro 2025  
**Status**: 🔴 Problema Ativo  
**Prioridade**: 🔥 Alta