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
  
  // Rotas públicas que precisam de configuração diferente
  const publicRoutes = ['/changelog', '/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  return (
    <SessionProvider 
      session={session}
      refetchInterval={isPublicRoute ? 0 : 5 * 60} // Não refetch em rotas públicas
      refetchOnWindowFocus={!isPublicRoute}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}