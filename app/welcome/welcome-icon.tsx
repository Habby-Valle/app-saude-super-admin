import { HeartPulse } from "lucide-react"

export function WelcomeIcon() {
  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-60" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#764b9d] to-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
          <HeartPulse className="w-10 h-10 text-white" />
        </div>
      </div>
    </div>
  )
}
