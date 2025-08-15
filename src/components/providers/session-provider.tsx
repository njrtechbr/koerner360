"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { usePathname } from "next/navigation"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  const pathname = usePathname()
  
  // Rotas públicas que não precisam do SessionProvider
  const publicRoutes = ['/changelog', '/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Se for rota pública, não usar SessionProvider
  if (isPublicRoute) {
    return <>{children}</>
  }
  
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}