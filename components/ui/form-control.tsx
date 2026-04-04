"use client"

import * as React from "react"

export type FormControlProps = React.InputHTMLAttributes<HTMLInputElement>

export const FormControl = React.forwardRef<HTMLInputElement, FormControlProps>(
  ({ ...props }, ref) => {
    return <input ref={ref} {...props} />
  }
)

FormControl.displayName = "FormControl"
