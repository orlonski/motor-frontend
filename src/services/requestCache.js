// Sistema de cache simples para evitar requisições HTTP duplicadas
// Cache expira após 5 segundos

const requestCache = new Map()
const pendingRequests = new Map() // Para evitar requisições duplicadas simultâneas
const CACHE_DURATION = 5000 // 5 segundos

export function getCachedRequest(key) {
  const cached = requestCache.get(key)

  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_DURATION) {
    // Cache expirado
    requestCache.delete(key)
    return null
  }

  return cached.data
}

export function setCachedRequest(key, data) {
  requestCache.set(key, {
    data,
    timestamp: Date.now()
  })
  // Remove da lista de pendentes
  pendingRequests.delete(key)
}

export function getPendingRequest(key) {
  return pendingRequests.get(key)
}

export function setPendingRequest(key, promise) {
  pendingRequests.set(key, promise)
}

export function removePendingRequest(key) {
  pendingRequests.delete(key)
}

export function clearCache() {
  requestCache.clear()
  pendingRequests.clear()
}

// Gera uma chave única para a requisição
export function getRequestKey(method, url) {
  return `${method.toUpperCase()}:${url}`
}
