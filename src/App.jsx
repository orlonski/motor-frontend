import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { LoadingProvider, useLoading } from './contexts/LoadingContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import GlobalSpinner from './components/GlobalSpinner'
import Login from './pages/Login'
import Integrations from './pages/Integrations'
import Endpoints from './pages/Endpoints'
import FieldMappings from './pages/FieldMappings'
import api from './services/api'
import { setupLoadingInterceptors } from './services/apiInterceptors'

// Componente interno para configurar interceptors após LoadingContext estar disponível
function AppContent() {
  const loadingContext = useLoading()

  useEffect(() => {
    // Configura os interceptors uma única vez quando o app inicia
    setupLoadingInterceptors(api, loadingContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <GlobalSpinner />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/integrations" replace />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="integrations/:integrationId/endpoints" element={<Endpoints />} />
            <Route path="endpoints/:endpointId/mappings" element={<FieldMappings />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LoadingProvider>
  )
}

export default App
