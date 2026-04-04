"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}
