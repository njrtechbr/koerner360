'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Users,
  Award,
  Target,
  PieChart,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/consultor',
    icon: BarChart3,
    description: 'Visão geral e estatísticas',
  },
  {
    title: 'Rankings',
    href: '/consultor/rankings',
    icon: Trophy,
    description: 'Rankings e classificações',
  },
  {
    title: 'Comparativos',
    href: '/consultor/comparativos',
    icon: TrendingUp,
    description: 'Análises comparativas',
  },
  {
    title: 'Performance',
    href: '/consultor/performance',
    icon: Activity,
    description: 'Métricas de performance',
  },
  {
    title: 'Conquistas',
    href: '/consultor/conquistas',
    icon: Award,
    description: 'Sistema de gamificação',
  },
  {
    title: 'Atendentes',
    href: '/consultor/atendentes',
    icon: Users,
    description: 'Gestão de atendentes',
  },
  {
    title: 'Metas',
    href: '/consultor/metas',
    icon: Target,
    description: 'Acompanhamento de metas',
  },
  {
    title: 'Relatórios',
    href: '/consultor/relatorios',
    icon: PieChart,
    description: 'Relatórios avançados',
  },
]

export function ConsultorSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Koerner 360</span>
              <span className="text-xs text-muted-foreground">Consultor</span>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-10',
                    collapsed && 'justify-center px-2',
                    isActive && 'bg-secondary font-medium'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Dashboard Consultor
            </p>
            <p className="text-xs text-muted-foreground">
              Versão 1.0.0
            </p>
          </div>
        )}
      </div>
    </div>
  )
}