import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingSpinnerWithTextProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  orientation?: "horizontal" | "vertical"
}

export function LoadingSpinnerWithText({ 
  className,
  size = "md",
  text = "Carregando...",
  orientation = "horizontal"
}: LoadingSpinnerWithTextProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        orientation === "vertical" && "flex-col",
        className
      )}
    >
      <LoadingSpinner size={size} srText={text} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}