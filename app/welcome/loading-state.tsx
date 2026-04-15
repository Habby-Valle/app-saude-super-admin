export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f6f4fe] via-white to-[#f6f4fe]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#764b9d] border-t-transparent" />
        <p className="text-[#764b9d]">Redirecionando...</p>
      </div>
    </div>
  )
}
