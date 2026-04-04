"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertTriangle, Clock, Shield, User } from "lucide-react"
import { PlansSettings } from "./plans-settings"
import { ShiftCategoriesSettings } from "./shift-categories-settings"
import { AlertsSettings } from "./alerts-settings"
import { LgpdSettings } from "./lgpd-settings"
import { AccountSettings } from "./account-settings"
import type {
  Plan,
  ShiftCategory,
  AlertThreshold,
} from "@/app/(main)/(super-admin)/super-admin/settings/actions"
import type { LgpdConfig } from "@/app/(main)/(super-admin)/super-admin/settings/lgpd-actions"

interface SettingsTabsProps {
  plans: Plan[]
  shiftCategories: ShiftCategory[]
  alertThresholds: AlertThreshold[]
  lgpdConfig: LgpdConfig
}

export function SettingsTabs({
  plans,
  shiftCategories,
  alertThresholds,
  lgpdConfig,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="plans" className="space-y-6">
      <TabsList>
        <TabsTrigger value="account" className="gap-2">
          <User className="h-4 w-4" />
          Conta
        </TabsTrigger>
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
        <TabsTrigger value="lgpd" className="gap-2">
          <Shield className="h-4 w-4" />
          LGPD / Privacidade
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="plans">
        <PlansSettings initialPlans={plans} />
      </TabsContent>

      <TabsContent value="shift-categories">
        <ShiftCategoriesSettings initialCategories={shiftCategories} />
      </TabsContent>

      <TabsContent value="alerts">
        <AlertsSettings initialThresholds={alertThresholds} />
      </TabsContent>

      <TabsContent value="lgpd">
        <LgpdSettings config={lgpdConfig} />
      </TabsContent>
    </Tabs>
  )
}
