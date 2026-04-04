import Link from "next/link"
import { HeartPulse } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f6f4fe] via-white to-[#f6f4fe] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-60" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#764b9d] to-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <HeartPulse className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            Boas-vindas ao App Saúde! 🎉
          </h1>
          <p className="text-[#4a4a6a] leading-relaxed">
            Seu acesso foi confirmado com sucesso. Agora é só aguardar — seu familiar ou cuidador responsável entrará em contato em breve.
          </p>
          <p className="text-sm text-[#764b9d] font-medium">
            O app de cuidados está disponível para Cuidadores e Administradores de Clínica.
          </p>
        </div>

        {/* Ação */}
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-[#764b9d] to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:opacity-95 transition-all"
          >
            Voltar ao login
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-xs text-[#9999bb]">
          Em caso de dúvidas, entre em contato com o administrador da sua clínica.
        </p>
      </div>
    </div>
  )
}
