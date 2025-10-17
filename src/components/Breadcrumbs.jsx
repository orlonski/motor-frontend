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

      // Se temos endpointId mas não temos integrationId, precisamos buscar o endpoint primeiro
      // para pegar o integrationId dele
      if (params.endpointId && !params.integrationId) {
        try {
          const endpointResponse = await api.get(`/endpoints/${params.endpointId}`)
          newNames.endpoint = endpointResponse.data.name
          newNames.endpointIntegrationId = endpointResponse.data.integrationId

          // Agora busca a integração usando o ID que veio do endpoint
          if (endpointResponse.data.integrationId) {
            try {
              const integrationResponse = await api.get(`/integrations/${endpointResponse.data.integrationId}`)
              newNames.integration = integrationResponse.data.name
            } catch (error) {
              console.error('Error fetching integration:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching endpoint:', error)
        }
      } else {
        // Fluxo normal: quando temos integrationId na URL
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
            newNames.endpointIntegrationId = response.data.integrationId
          } catch (error) {
            console.error('Error fetching endpoint:', error)
          }
        }
      }

      setNames(newNames)
    }

    fetchNames()
  }, [params.integrationId, params.endpointId])

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x)
    const crumbs = [{ name: 'Home', path: '/integrations', key: 'home' }]

    // Pega o integrationId correto (da URL ou do endpoint)
    const integrationId = params.integrationId || names.endpointIntegrationId

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
      // Adiciona breadcrumb da integração se não estiver na URL mas temos o ID do endpoint
      if (!params.integrationId && integrationId) {
        crumbs.push({
          name: names.integration || 'Carregando...',
          path: `/integrations/${integrationId}`,
          key: `integration-${integrationId}`
        })
      }

      // Adiciona breadcrumb de Endpoints
      if (integrationId) {
        crumbs.push({
          name: 'Endpoints',
          path: `/integrations/${integrationId}/endpoints`,
          key: `endpoints-${integrationId}`
        })
      }

      // Adiciona breadcrumb de Mapeamentos (último, não clicável)
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
