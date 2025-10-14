import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Integrations from './pages/Integrations'
import Endpoints from './pages/Endpoints'
import FieldMappings from './pages/FieldMappings'

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App
