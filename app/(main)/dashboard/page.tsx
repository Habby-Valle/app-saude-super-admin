import { Building2, Users, UserRound, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const kpiCards = [
  {
    title: 'Clínicas Ativas',
    value: '—',
    icon: Building2,
    description: 'Total de clínicas na plataforma',
  },
  {
    title: 'Usuários',
    value: '—',
    icon: Users,
    description: 'Administradores, cuidadores e familiares',
  },
  {
    title: 'Pacientes',
    value: '—',
    icon: UserRound,
    description: 'Pacientes em todas as clínicas',
  },
  {
    title: 'Checklists Hoje',
    value: '—',
    icon: ClipboardCheck,
    description: 'Execuções concluídas no dia',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma App Saúde.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Placeholder para gráficos — Feature 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="min-h-64">
          <CardHeader>
            <CardTitle className="text-base">Crescimento de Clínicas</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Gráfico disponível na Feature 3
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-64">
          <CardHeader>
            <CardTitle className="text-base">Pacientes por Clínica</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Gráfico disponível na Feature 3
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
