"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export function FormMessage({
  className,
  children,
  ...props
}: FormMessageProps) {
  if (!children) return null

  return (
    <p
      ref={undefined}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
}
