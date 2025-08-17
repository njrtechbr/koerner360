'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface ConsultorHeaderProps {
  user: {
    id?: string
    nome?: string | null
    email?: string | null
    userType?: string
    avatarUrl?: string | null
  }
}

export function ConsultorHeader({ user }: ConsultorHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const getUserInitials = (nome: string | null | undefined) => {
    if (!nome) return 'CO'
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserTypeLabel = (userType: string | undefined) => {
    switch (userType) {
      case 'ADMIN':
        return 'Administrador'
      case 'SUPERVISOR':
        return 'Supervisor'
      case 'CONSULTOR':
        return 'Consultor'
      case 'ATENDENTE':
        return 'Atendente'
      default:
        return 'Usuário'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar atendentes, rankings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 p-0"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificações</span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ajuda</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.nome || 'Usuário'} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user.nome || 'Usuário'}
                </span>
                <Badge variant="secondary" className="h-4 text-xs">
                  {getUserTypeLabel(user.userType)}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.nome || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email || 'email@exemplo.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}