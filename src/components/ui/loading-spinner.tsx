import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  /** Texto para leitores de tela */
  srText?: string
  /** Texto visível abaixo do spinner */
  text?: string
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
} as const

export function LoadingSpinner({ 
  className, 
  size = "md", 
  srText = "Carregando...",
  text
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          SIZE_CLASSES[size],
          className
        )}
        role="status"
        aria-label={srText}
      >
        <span className="sr-only">{srText}</span>
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}