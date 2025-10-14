import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um token salvo
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Aqui você pode fazer uma chamada para validar o token
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      console.log('Tentando fazer login...', { username })
      const response = await api.post('/auth/login', { username, password })
      console.log('Resposta do login:', response.data)
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ ...userData, token })
      
      console.log('Login bem-sucedido, user setado:', { ...userData, token })
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      console.error('Detalhes do erro:', error.response?.data)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      }
    }
  }

  const logout = () => {
    console.log('Fazendo logout...')
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    console.log('Logout concluído')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
