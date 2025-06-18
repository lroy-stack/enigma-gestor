
import * as React from "react"
import { cn } from "@/lib/utils"

const IOSCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'glass'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClass = {
    default: 'ios-card',
    elevated: 'ios-card-elevated',
    glass: 'ios-card-glass'
  }[variant]

  return (
    <div
      ref={ref}
      className={cn(variantClass, className)}
      {...props}
    />
  )
})
IOSCard.displayName = "IOSCard"

const IOSCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b border-enigma-neutral-200/50", className)}
    {...props}
  />
))
IOSCardHeader.displayName = "IOSCardHeader"

const IOSCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("ios-text-headline", className)}
    {...props}
  />
))
IOSCardTitle.displayName = "IOSCardTitle"

const IOSCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("ios-text-callout text-enigma-neutral-600 mt-1", className)}
    {...props}
  />
))
IOSCardDescription.displayName = "IOSCardDescription"

const IOSCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
))
IOSCardContent.displayName = "IOSCardContent"

const IOSCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-t border-enigma-neutral-200/50 flex items-center justify-end space-x-3", className)}
    {...props}
  />
))
IOSCardFooter.displayName = "IOSCardFooter"

export {
  IOSCard,
  IOSCardHeader,
  IOSCardFooter,
  IOSCardTitle,
  IOSCardDescription,
  IOSCardContent,
}
