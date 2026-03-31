"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  icon?: React.ReactNode
}

/**
 * Input de busca com estado local isolado.
 * O input responde imediatamente ao digitar (estado local),
 * e propaga a mudança para o pai em cada keystroke sem bloquear a UI.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  icon,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sincroniza com o valor externo (ex: navegação com back/forward)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <span className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground">
        {icon ?? <Search className="h-4 w-4" />}
      </span>
      <Input
        placeholder={placeholder}
        className="pl-8"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
      />
    </div>
  )
}
