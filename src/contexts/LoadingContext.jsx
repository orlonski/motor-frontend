import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [requestCount, setRequestCount] = useState(0)

  const startLoading = useCallback(() => {
    setRequestCount((prev) => prev + 1)
  }, [])

  const stopLoading = useCallback(() => {
    setRequestCount((prev) => Math.max(0, prev - 1))
  }, [])

  const isLoading = requestCount > 0

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, requestCount }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider')
  }
  return context
}
