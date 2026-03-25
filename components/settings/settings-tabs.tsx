"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertTriangle, Clock } from "lucide-react"
import { PlansSettings } from "./plans-settings"
import { ShiftCategoriesSettings } from "./shift-categories-settings"
import { AlertsSettings } from "./alerts-settings"
import type {
  Plan,
  ShiftCategory,
  AlertThreshold,
} from "@/app/(main)/settings/actions"

interface SettingsTabsProps {
  plans: Plan[]
  shiftCategories: ShiftCategory[]
  alertThresholds: AlertThreshold[]
}

export function SettingsTabs({
  plans,
  shiftCategories,
  alertThresholds,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="plans" className="space-y-6">
      <TabsList>
        <TabsTrigger value="plans" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Planos
        </TabsTrigger>
        <TabsTrigger value="shift-categories" className="gap-2">
          <Clock className="h-4 w-4" />
          Categorias de Turno
        </TabsTrigger>
        <TabsTrigger value="alerts" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="plans">
        <PlansSettings initialPlans={plans} />
      </TabsContent>

      <TabsContent value="shift-categories">
        <ShiftCategoriesSettings initialCategories={shiftCategories} />
      </TabsContent>

      <TabsContent value="alerts">
        <AlertsSettings initialThresholds={alertThresholds} />
      </TabsContent>
    </Tabs>
  )
}
