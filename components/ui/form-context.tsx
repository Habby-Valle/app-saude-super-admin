"use client"

import * as React from "react"

export interface FormFieldContextValue {
  name: string
}

export const FormFieldContext =
  React.createContext<FormFieldContextValue | null>(null)

export interface FormItemContextValue {
  name: string
}

export const FormItemContext = React.createContext<FormItemContextValue | null>(
  null
)

export function useFormField(): {
  formItem: { id: string }
  field: {
    value: unknown
    onChange: (...event: unknown[]) => void
    onBlur: () => void
    ref: React.Ref<unknown>
  }
  fieldState: {
    invalid: boolean
    isTouched: boolean
    isDirty: boolean
    error?: { message?: string }
  }
} {
  const formFieldContext = React.useContext(FormFieldContext)
  if (!formFieldContext) {
    throw new Error("FormFieldContext not found")
  }
  const formItemContext = React.useContext(FormItemContext)
  if (!formItemContext) {
    throw new Error("FormItemContext not found")
  }

  return {
    formItem: { id: formItemContext.name },
    field: {} as never,
    fieldState: {} as never,
  }
}
