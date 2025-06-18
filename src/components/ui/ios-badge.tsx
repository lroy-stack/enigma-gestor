
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iosBadgeVariants = cva(
  "ios-badge",
  {
    variants: {
      variant: {
        available: "ios-badge-available",
        occupied: "ios-badge-occupied",
        reserved: "ios-badge-reserved",
        cleaning: "ios-badge-cleaning",
        maintenance: "ios-badge-maintenance",
        primary: "bg-enigma-primary/10 text-enigma-primary border-enigma-primary/20",
        secondary: "bg-enigma-secondary/10 text-enigma-secondary border-enigma-secondary/20",
        accent: "bg-enigma-accent/10 text-enigma-accent border-enigma-accent/20",
        neutral: "bg-enigma-neutral-100 text-enigma-neutral-700 border-enigma-neutral-200",
        custom: "border",
      },
      size: {
        default: "",
        lg: "ios-badge-lg",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

export interface IOSBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iosBadgeVariants> {}

function IOSBadge({ className, variant, size, ...props }: IOSBadgeProps) {
  return (
    <div className={cn(iosBadgeVariants({ variant, size }), className)} {...props} />
  )
}

export { IOSBadge, iosBadgeVariants }
