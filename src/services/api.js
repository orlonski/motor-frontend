import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swagger-motor-backend.zj8v6e.easypanel.host/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Interceptor request - Token:', token ? 'Presente' : 'Ausente')
    console.log('Interceptor request - URL:', config.url)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Erro no interceptor de request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log('Interceptor response - Sucesso:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('Interceptor response - Erro:', error.config?.url, error.response?.status)
    if (error.response?.status === 401) {
      console.log('Erro 401 - Redirecionando para login')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
