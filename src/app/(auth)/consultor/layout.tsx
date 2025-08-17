import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ConsultorSidebar } from '@/components/layout/consultor-sidebar'
import { ConsultorHeader } from '@/components/layout/consultor-header'

export const metadata: Metadata = {
  title: 'Consultor - Koerner 360',
  description: 'Dashboard do consultor para análise de rankings e performance',
}

interface ConsultorLayoutProps {
  children: React.ReactNode
}

export default async function ConsultorLayout({ children }: ConsultorLayoutProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Verificar se o usuário é do tipo CONSULTOR
  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ConsultorSidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <ConsultorHeader user={session.user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}