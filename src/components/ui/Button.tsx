import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "checkin" | "danger"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          // Size variants
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          // Color variants
          variant === "primary" && "bg-white text-navy hover:bg-bg-tertiary",
          variant === "secondary" && "bg-accent text-white hover:bg-accent-light",
          variant === "ghost" && "bg-transparent text-text-secondary border border-border hover:bg-bg-tertiary",
          variant === "checkin" && "bg-white/15 text-white border border-white/30 hover:bg-white/25",
          variant === "danger" && "bg-danger text-white hover:opacity-90",
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
