'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Home, Users, UserCheck, BarChart3, MessageSquare, Settings, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'SUPERVISOR', 'ATENDENTE'],
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: Users,
    roles: ['ADMIN', 'SUPERVISOR'],
  },
  {
    title: 'Atendentes',
    href: '/atendentes',
    icon: UserCheck,
    roles: ['ADMIN', 'SUPERVISOR'],
  },

  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    roles: ['ADMIN'],
  },
  {
    title: 'Changelog',
    href: '/changelog',
    icon: FileText,
    roles: ['ADMIN', 'SUPERVISOR', 'ATENDENTE'],
  },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(session?.user?.userType || '')
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'attendant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'ATENDENTE':
        return 'Atendente';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Koerner 360</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <Badge
                  className={cn(
                    'text-xs',
                    getRoleBadgeColor(session?.user?.userType || '')
                  )}
                >
                  {getRoleLabel(session?.user?.userType || '')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}