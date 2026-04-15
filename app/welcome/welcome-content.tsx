import Link from "next/link"
import { Smartphone } from "lucide-react"
import { AppStoreButtons } from "./app-store-buttons"
import type { UserRole } from "@/types/database"

type DetectedRole = UserRole | null

interface WelcomeContentProps {
  role: DetectedRole
}

export function WelcomeContent({ role }: WelcomeContentProps) {
  const isExternalUser = role && ["caregiver", "family", "emergency_contact"].includes(role)
  const isAdmin = role && ["super_admin", "clinic_admin"].includes(role)

  if (isAdmin) {
    return (
      <>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            Boas-vindas ao App Saúde!
          </h1>
          <p className="text-[#4a4a6a] leading-relaxed">
            Sua conta foi confirmada. Acesse o painel administrativo para gerenciar sua clínica.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-[#764b9d] to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:opacity-95 transition-all"
          >
            Acessar Login
          </Link>
        </div>
      </>
    )
  }

  if (isExternalUser) {
    return (
      <>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            Boas-vindas ao App Saúde!
          </h1>
          <p className="text-[#4a4a6a] leading-relaxed">
            Seu acesso foi confirmado com sucesso. Para começar a usar, baixe o aplicativo de cuidados no seu celular.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#764b9d] font-medium">
            <Smartphone className="w-4 h-4" />
            Disponível para iOS e Android
          </div>
        </div>
        <AppStoreButtons />
        <p className="text-xs text-[#9999bb]">
          Depois de instalar, faça login com a mesma conta que recebeu o convite.
        </p>
      </>
    )
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-[#1a1a2e]">
        Boas-vindas ao App Saúde!
      </h1>
      <p className="text-[#4a4a6a] leading-relaxed">
        Seu acesso foi confirmado com sucesso. Aguarde — seu familiar ou cuidador responsável entrará em contato em breve.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-[#764b9d] to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:opacity-95 transition-all"
      >
        Voltar ao login
      </Link>
    </div>
  )
}
