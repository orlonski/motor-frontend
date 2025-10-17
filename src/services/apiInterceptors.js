// Este arquivo configura os interceptors do axios com o LoadingContext
// Deve ser chamado após o LoadingContext estar disponível

import {
  getCachedRequest,
  setCachedRequest,
  getRequestKey,
  getPendingRequest,
  setPendingRequest,
  removePendingRequest
} from './requestCache'

let loadingContext = null

export function setupLoadingInterceptors(api, context) {
  loadingContext = context

  // Interceptor para adicionar o token, verificar cache e iniciar loading
  api.interceptors.request.use(
    async (config) => {
      // Apenas cacheia requisições GET
      if (config.method === 'get') {
        const cacheKey = getRequestKey(config.method, config.url)

        // 1. Verifica se existe no cache
        const cachedData = getCachedRequest(cacheKey)
        if (cachedData) {
          console.log('✅ Cache HIT:', config.url)

          // Inicia e para loading imediatamente (para manter consistência)
          if (loadingContext) {
            loadingContext.startLoading()
            setTimeout(() => loadingContext.stopLoading(), 0)
          }

          // Retorna dados do cache
          return Promise.reject({
            config,
            response: {
              data: cachedData,
              status: 200,
              statusText: 'OK (from cache)',
              headers: config.headers,
              config: config,
            },
            isFromCache: true
          })
        }

        // 2. Verifica se já existe uma requisição em andamento para a mesma URL
        const pendingRequest = getPendingRequest(cacheKey)
        if (pendingRequest) {
          console.log('⏳ Requisição DUPLICADA detectada, aguardando a primeira:', config.url)

          // Inicia loading (será parado quando a primeira requisição terminar)
          if (loadingContext) {
            loadingContext.startLoading()
          }

          // Aguarda a requisição pendente
          try {
            const response = await pendingRequest
            // Para o loading desta requisição duplicada
            if (loadingContext) {
              loadingContext.stopLoading()
            }
            // Retorna os dados da primeira requisição
            return Promise.reject({
              config,
              response: response,
              isFromPending: true
            })
          } catch (error) {
            if (loadingContext) {
              loadingContext.stopLoading()
            }
            throw error
          }
        }

        // 3. É uma nova requisição - marca como pendente
        console.log('🌐 Nova requisição HTTP:', config.url)
        config.isNewRequest = true
      }

      // Inicia o loading global para requisições novas
      if (loadingContext) {
        loadingContext.startLoading()
      }

      const token = localStorage.getItem('token')
      console.log('Interceptor request - Token:', token ? 'Presente' : 'Ausente')
      console.log('Interceptor request - URL:', config.url)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      // Para o loading em caso de erro
      if (loadingContext) {
        loadingContext.stopLoading()
      }
      console.error('Erro no interceptor de request:', error)
      return Promise.reject(error)
    }
  )

  // Interceptor para tratar respostas
  api.interceptors.response.use(
    (response) => {
      // Para requisições GET novas, salva no cache e registra como pendente
      if (response.config.method === 'get' && response.config.isNewRequest && response.status === 200) {
        const cacheKey = getRequestKey(response.config.method, response.config.url)

        // Salva no cache
        setCachedRequest(cacheKey, response.data)
        console.log('💾 Cache SAVED:', response.config.url)

        // Salva como pendente para requisições simultâneas
        setPendingRequest(cacheKey, Promise.resolve(response))

        // Remove das pendentes após um curto delay (para pegar requisições simultâneas)
        setTimeout(() => removePendingRequest(cacheKey), 100)
      }

      // Para o loading quando a resposta chegar
      if (loadingContext) {
        loadingContext.stopLoading()
      }

      console.log('Interceptor response - Sucesso:', response.config.url, response.status)
      return response
    },
    (error) => {
      // Se for "erro" de cache ou pending, retorna os dados como sucesso
      if (error.isFromCache || error.isFromPending) {
        console.log('Retornando dados', error.isFromCache ? 'do cache' : 'da requisição pendente')
        return Promise.resolve(error.response)
      }

      // Remove requisição da lista de pendentes em caso de erro real
      if (error.config?.method === 'get' && error.config?.isNewRequest) {
        const cacheKey = getRequestKey(error.config.method, error.config.url)
        removePendingRequest(cacheKey)
      }

      // Para o loading em caso de erro
      if (loadingContext) {
        loadingContext.stopLoading()
      }

      console.error('Interceptor response - Erro:', error.config?.url, error.response?.status)

      if (error.response?.status === 401) {
        console.log('Erro 401 - Redirecionando para login')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }
  )
}
