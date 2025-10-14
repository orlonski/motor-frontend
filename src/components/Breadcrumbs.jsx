import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'

function Breadcrumbs() {
  const location = useLocation()
  const params = useParams()
  const [names, setNames] = useState({})

  useEffect(() => {
    const fetchNames = async () => {
      const newNames = {}
      
      if (params.integrationId) {
        try {
          const response = await api.get(`/integrations/${params.integrationId}`)
          newNames.integration = response.data.name
        } catch (error) {
          console.error('Error fetching integration:', error)
        }
      }
      
      if (params.endpointId) {
        try {
          const response = await api.get(`/endpoints/${params.endpointId}`)
          newNames.endpoint = response.data.name
        } catch (error) {
          console.error('Error fetching endpoint:', error)
        }
      }
      
      setNames(newNames)
    }

    fetchNames()
  }, [params.integrationId, params.endpointId])

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x)
    const crumbs = [{ name: 'Home', path: '/integrations', key: 'home' }]

    if (pathnames.includes('integrations')) {
      if (!params.integrationId) {
        crumbs.push({ name: 'Integrações', path: '/integrations', key: 'integrations' })
      } else {
        crumbs.push({ 
          name: names.integration || 'Carregando...', 
          path: `/integrations/${params.integrationId}`,
          key: `integration-${params.integrationId}`
        })
        
        if (pathnames.includes('endpoints')) {
          crumbs.push({ 
            name: 'Endpoints', 
            path: `/integrations/${params.integrationId}/endpoints`,
            key: `endpoints-${params.integrationId}`
          })
        }
      }
    }

    if (pathnames.includes('mappings') && params.endpointId) {
      crumbs.push({ 
        name: names.endpoint || 'Carregando...', 
        path: `/integrations/${params.integrationId}/endpoints`,
        key: `endpoint-${params.endpointId}`
      })
      crumbs.push({ 
        name: 'Mapeamentos', 
        path: `/endpoints/${params.endpointId}/mappings`,
        key: `mappings-${params.endpointId}`
      })
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.key} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === 0 && (
              <Home className="h-4 w-4 text-gray-400 mr-2" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-900">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
