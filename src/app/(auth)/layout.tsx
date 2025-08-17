import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SimpleLayout } from '@/components/layout/simple-layout'

export const metadata: Metadata = {
  title: 'Dashboard - Koerner 360',
  description: 'Sistema de gestão de feedback e avaliações',
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <SimpleLayout>
      {children}
    </SimpleLayout>
  )
}