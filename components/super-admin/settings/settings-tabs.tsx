"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertTriangle, Shield, User, Settings } from "lucide-react"
import { PlansSettings } from "./plans-settings"
import { AlertsSettings } from "./alerts-settings"
import { LgpdSettings } from "./lgpd-settings"
import { AccountSettings } from "./account-settings"
import { SystemSettings } from "./system-settings"
import type { Plan, AlertThreshold } from "@/types/database"
import type { LgpdConfig } from "@/app/(main)/(super-admin)/super-admin/settings/lgpd-actions"

interface SettingsTabsProps {
  plans: Plan[]
  alertThresholds: AlertThreshold[]
  lgpdConfig: LgpdConfig
  systemSettings: {
    maintenance_mode: boolean
    maintenance_message: string
    maintenance_planned_end: string | null
  }
}

export function SettingsTabs({
  plans,
  alertThresholds,
  lgpdConfig,
  systemSettings,
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
        <TabsTrigger value="alerts" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas
        </TabsTrigger>
        <TabsTrigger value="lgpd" className="gap-2">
          <Shield className="h-4 w-4" />
          LGPD / Privacidade
        </TabsTrigger>
        <TabsTrigger value="system" className="gap-2">
          <Settings className="h-4 w-4" />
          Sistema
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="plans">
        <PlansSettings initialPlans={plans} />
      </TabsContent>

      <TabsContent value="alerts">
        <AlertsSettings initialThresholds={alertThresholds} />
      </TabsContent>

      <TabsContent value="lgpd">
        <LgpdSettings config={lgpdConfig} />
      </TabsContent>

      <TabsContent value="system">
        <SystemSettings initialSettings={systemSettings} />
      </TabsContent>
    </Tabs>
  )
}
