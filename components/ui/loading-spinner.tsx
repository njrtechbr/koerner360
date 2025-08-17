import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  text = 'Carregando...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 p-4', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

// Componente para loading de página inteira
export function PageLoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" text="Carregando página..." />
    </div>
  )
}

// Componente para loading de card/seção
export function CardLoadingSpinner() {
  return (
    <div className="flex h-32 items-center justify-center">
      <LoadingSpinner size="md" text="Carregando dados..." />
    </div>
  )
}

// Componente para loading inline
export function InlineLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-2">
      <LoadingSpinner size="sm" text="" />
    </div>
  )
}