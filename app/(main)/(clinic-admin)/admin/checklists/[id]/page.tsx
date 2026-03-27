import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckSquare, ListChecks } from "lucide-react"
import { getClinicChecklistById } from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChecklistEditButton } from "./edit-button"

export const metadata = {
  title: "Detalhes do Checklist",
}

interface ChecklistDetailPageProps {
  params: Promise<{ id: string }>
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  boolean: "Sim/Não",
  text: "Texto",
  number: "Número",
  select: "Seleção",
}

interface ChecklistItemData {
  id: string
  name: string
  type: string
  required: boolean
  has_observation: boolean
  checklist_item_options?: { id: string; label: string; value: string }[]
}

async function ChecklistDetailContent({ id }: { id: string }) {
  const checklist = await getClinicChecklistById(id)

  if (!checklist) {
    notFound()
    return null
  }

  const items =
    (checklist.checklist_items as unknown as ChecklistItemData[]) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/checklists">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {checklist.icon ? (
              <span className="text-2xl">{checklist.icon}</span>
            ) : (
              <ListChecks className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{checklist.name}</h1>
              <Badge variant={checklist.is_global ? "default" : "secondary"}>
                {checklist.is_global ? "Global" : "Da clínica"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <CheckSquare className="mr-1 inline-block h-3.5 w-3.5" />
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {checklist.is_mine && <ChecklistEditButton checklist={checklist} />}
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criado em
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(checklist.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de itens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4" />
            Itens do Checklist ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item cadastrado neste checklist.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ITEM_TYPE_LABELS[item.type] ?? item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.required ? (
                          <Badge variant="destructive">Sim</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.has_observation ? (
                          <Badge variant="secondary">Sim</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.type === "select" &&
                        item.checklist_item_options ? (
                          <div className="flex flex-wrap gap-1">
                            {item.checklist_item_options
                              .slice(0, 3)
                              .map((opt) => (
                                <Badge
                                  key={opt.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {opt.label}
                                </Badge>
                              ))}
                            {item.checklist_item_options.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.checklist_item_options.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ChecklistDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex flex-1 items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function ChecklistDetailPage({
  params,
}: ChecklistDetailPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <Suspense fallback={<ChecklistDetailSkeleton />}>
        <ChecklistDetailContent id={id} />
      </Suspense>
    </div>
  )
}
