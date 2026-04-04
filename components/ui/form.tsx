"use client"

import * as React from "react"
import type {
  FieldPath,
  FieldValues,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form"
import { useForm } from "react-hook-form"

import { cn } from "@/lib/utils"
import { FormItem } from "@/components/ui/form-item"
import { FormControl } from "@/components/ui/form-control"
import { FormFieldContext, FormItemContext } from "@/components/ui/form-context"
import { FormMessage } from "@/components/ui/form-message"

// ============================================
// Form Components
// ============================================

export interface FormProps<
  TFieldValues extends FieldValues,
> extends UseFormProps<TFieldValues> {
  children: React.ReactNode
  className?: string
}

function Form<TFieldValues extends FieldValues>({
  className,
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <form className={cn("space-y-6", className)} {...props}>
      {children}
    </form>
  )
}

// ============================================
// Form Field
// ============================================

export interface FormFieldProps {
  name: string
  render: (props: {
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
    formState: {
      errors: Record<string, { message?: string }>
    }
  }) => React.ReactElement
}

function FormField({ name, render }: FormFieldProps) {
  const methods = React.useContext(
    FormFieldContext
  ) as UseFormReturn<FieldValues> | null
  if (!methods) {
    throw new Error("FormField must be used within FormProvider")
  }

  return (
    <FormFieldContext.Provider
      value={
        { name, ...methods } as UseFormReturn<FieldValues> & { name: string }
      }
    >
      <FormItemContext.Provider value={{ name }}>
        {render({
          field: {
            value: methods.getValues(name as FieldPath<FieldValues>),
            onChange: (...event: unknown[]) => {
              const e = event[0] as React.ChangeEvent<HTMLInputElement>
              methods.setValue(name, e.target.value)
            },
            onBlur: () => methods.trigger(name),
            ref: methods.register(name as FieldPath<FieldValues>).ref,
          },
          fieldState: {
            invalid: Boolean(methods.formState.errors[name]),
            isTouched: methods.formState.touchedFields[name] as boolean,
            isDirty: methods.formState.dirtyFields[name] as boolean,
            error: methods.formState.errors[name] as
              | { message?: string }
              | undefined,
          },
          formState: {
            errors: methods.formState.errors as Record<
              string,
              { message?: string }
            >,
          },
        })}
      </FormItemContext.Provider>
    </FormFieldContext.Provider>
  )
}

// ============================================
// Exports
// ============================================

export { Form, FormField, FormControl, FormItem, FormMessage }

export function useFormContext<TFieldValues extends FieldValues>() {
  const ctx = React.useContext(FormFieldContext) as
    | (UseFormReturn<FieldValues> & { name: string })
    | null
  if (!ctx) {
    throw new Error("useFormContext must be used within FormProvider")
  }
  return ctx as UseFormReturn<TFieldValues>
}

export function FormProvider<TFieldValues extends FieldValues>(
  props: UseFormProps<TFieldValues> & { children: React.ReactNode }
) {
  const { children, ...formProps } = props
  const methods = useForm<TFieldValues>(formProps)

  return (
    <FormFieldContext.Provider
      value={
        { ...methods, name: "" } as UseFormReturn<FieldValues> & {
          name: string
        }
      }
    >
      {children}
    </FormFieldContext.Provider>
  )
}
