import { useLoading } from '../contexts/LoadingContext'

function GlobalSpinner() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-primary-600"></div>
        <p className="text-white text-lg font-medium">Carregando...</p>
      </div>
    </div>
  )
}

export default GlobalSpinner
