"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  disabled?: boolean
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const [jumpValue, setJumpValue] = useState("")

  const handleJump = () => {
    const n = parseInt(jumpValue, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n)
    }
    setJumpValue("")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
      {/* Left: range summary */}
      <span className="shrink-0">
        {total === 0
          ? "Nenhum registro encontrado"
          : `Mostrando ${from}–${to} de ${total} registro${total !== 1 ? "s" : ""}`}
      </span>

      {/* Right: controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v))
              }}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Prev / page indicator / Next */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            disabled={page <= 1 || disabled}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="px-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            disabled={page >= totalPages || disabled}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>

        {/* Jump to page */}
        {totalPages > 2 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs">Ir para:</span>
            <Input
              className="h-8 w-14 text-xs text-center"
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              placeholder="—"
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJump()
              }}
              onBlur={handleJump}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}
