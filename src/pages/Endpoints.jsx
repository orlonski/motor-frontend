import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function Endpoints() {
  const { integrationId } = useParams()
  const [integration, setIntegration] = useState(null)
  const [endpoints, setEndpoints] = useState([])
  const [filteredEndpoints, setFilteredEndpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    httpMethod: 'GET',
    url: '',
    headersTemplate: '',
    authentication_type: 'None',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchIntegration()
    fetchEndpoints()
  }, [integrationId])

  useEffect(() => {
    // Garantir que endpoints é um array antes de filtrar
    if (!Array.isArray(endpoints)) {
      setFilteredEndpoints([])
      return
    }
    const filtered = endpoints.filter(
      (endpoint) =>
        endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEndpoints(filtered)
  }, [searchTerm, endpoints])

  const fetchIntegration = async () => {
    try {
      const response = await api.get(`/integrations/${integrationId}`)
      setIntegration(response.data)
    } catch (error) {
      console.error('Error fetching integration:', error)
    }
  }

  const fetchEndpoints = async () => {
    try {
      const response = await api.get(`/integrations/${integrationId}/endpoints`)
      console.log('Endpoints response:', response.data)
      // Garantir que sempre temos um array
      const data = Array.isArray(response.data) ? response.data : []
      setEndpoints(data)
      setFilteredEndpoints(data)
    } catch (error) {
      console.error('Error fetching endpoints:', error)
      // Em caso de erro, definir arrays vazios
      setEndpoints([])
      setFilteredEndpoints([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (endpoint = null) => {
    if (endpoint) {
      setSelectedEndpoint(endpoint)
      setFormData({
        name: endpoint.name,
        httpMethod: endpoint.httpMethod,
        url: endpoint.url,
        headersTemplate: endpoint.headersTemplate
          ? JSON.stringify(endpoint.headersTemplate, null, 2)
          : '',
        authentication_type: endpoint.authentication_type || 'None',
      })
    } else {
      setSelectedEndpoint(null)
      setFormData({
        name: '',
        httpMethod: 'GET',
        url: '',
        headersTemplate: '',
        authentication_type: 'None',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEndpoint(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        httpMethod: formData.httpMethod,
        url: formData.url,
        headersTemplate: formData.headersTemplate
          ? JSON.parse(formData.headersTemplate)
          : null,
        authenticationType: formData.authentication_type,
        integrationId: integrationId,
      }

      if (selectedEndpoint) {
        await api.put(`/endpoints/${selectedEndpoint.id}`, payload)
      } else {
        await api.post('/endpoints', payload)
      }
      fetchEndpoints()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving endpoint:', error)
      alert('Erro ao salvar endpoint. Verifique o formato do JSON de headers.')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/endpoints/${selectedEndpoint.id}`)
      fetchEndpoints()
    } catch (error) {
      console.error('Error deleting endpoint:', error)
      alert('Erro ao excluir endpoint')
    }
  }

  const handleOpenDeleteDialog = (endpoint) => {
    setSelectedEndpoint(endpoint)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Endpoints</h1>
          {integration && (
            <p className="text-gray-600 mt-1">Integração: {integration.name}</p>
          )}
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Novo Endpoint</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar endpoints..."
          />
        </div>

        {filteredEndpoints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum endpoint encontrado' : 'Nenhum endpoint cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEndpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {endpoint.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        endpoint.httpMethod === 'GET' ? 'bg-blue-100 text-blue-800' :
                        endpoint.httpMethod === 'POST' ? 'bg-green-100 text-green-800' :
                        endpoint.httpMethod === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        endpoint.httpMethod === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.httpMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {endpoint.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/endpoints/${endpoint.id}/mappings`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver mapeamentos"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(endpoint)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(endpoint)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedEndpoint ? 'Editar Endpoint' : 'Novo Endpoint'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="httpMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Método HTTP *
            </label>
            <select
              id="httpMethod"
              value={formData.httpMethod}
              onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
              className="input"
              required
            >
              {HTTP_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <input
              id="url"
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="input"
              placeholder="https://api.example.com/endpoint"
              required
            />
          </div>

          <div>
            <label htmlFor="authentication_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Autenticação
            </label>
            <input
              id="authentication_type"
              type="text"
              value={formData.authentication_type}
              onChange={(e) => setFormData({ ...formData, authentication_type: e.target.value })}
              className="input"
              placeholder="None, Bearer, Basic, etc."
            />
          </div>

          <div>
            <label htmlFor="headersTemplate" className="block text-sm font-medium text-gray-700 mb-2">
              Headers (JSON)
            </label>
            <textarea
              id="headersTemplate"
              value={formData.headersTemplate}
              onChange={(e) => setFormData({ ...formData, headersTemplate: e.target.value })}
              className="input font-mono text-sm"
              rows="6"
              placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{token}}"\n}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato JSON válido. Deixe em branco se não houver headers.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedEndpoint ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Endpoint"
        message={`Tem certeza que deseja excluir o endpoint "${selectedEndpoint?.name}"? Esta ação não pode ser desfeita e todos os mapeamentos associados também serão excluídos.`}
      />
    </div>
  )
}

export default Endpoints
