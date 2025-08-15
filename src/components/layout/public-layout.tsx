'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/changelog" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-900">Koerner 360</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fazer Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            © 2025 Koerner 360. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}