import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://swagger-motor-backend.zj8v6e.easypanel.host/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Os interceptors agora são configurados em apiInterceptors.js
// após o LoadingContext estar disponível

export default api
