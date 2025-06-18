
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const iosButtonVariants = cva(
  "ios-button",
  {
    variants: {
      variant: {
        primary: "ios-button-primary",
        secondary: "ios-button-secondary",
        accent: "ios-button-accent",
        ghost: "ios-button-ghost",
        outline: "ios-button-outline",
      },
      size: {
        default: "px-6 py-3 text-ios-body min-h-[44px] min-w-[44px] touch-manipulation",
        sm: "px-4 py-2 text-ios-callout min-h-[44px] min-w-[44px] touch-manipulation", // Aumentado para cumplir 44px
        lg: "px-8 py-4 text-ios-headline min-h-[52px] min-w-[52px] touch-manipulation",
        icon: "ios-button-icon min-h-[44px] min-w-[44px] touch-manipulation",
        // Nuevo: tamaño extra para tablet
        xl: "px-10 py-5 text-ios-title3 min-h-[56px] min-w-[56px] touch-manipulation",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface IOSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iosButtonVariants> {
  asChild?: boolean
}

const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(iosButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
IOSButton.displayName = "IOSButton"

export { IOSButton, iosButtonVariants }
