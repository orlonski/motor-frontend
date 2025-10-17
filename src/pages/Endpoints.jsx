import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowRight, Play, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const REQUEST_TYPES = ['REST', 'SOAP']

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
    request_type: 'REST',
  })

  // Estados para teste de endpoint
  const [testingEndpointId, setTestingEndpointId] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [isTestResultModalOpen, setIsTestResultModalOpen] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchIntegration()
    fetchEndpoints()
  }, [integrationId])

  useEffect(() => {
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
      const data = Array.isArray(response.data) ? response.data : []
      setEndpoints(data)
      setFilteredEndpoints(data)
    } catch (error) {
      console.error('Error fetching endpoints:', error)
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
        request_type: endpoint.requestType || 'REST',
      })
    } else {
      setSelectedEndpoint(null)
      setFormData({
        name: '',
        httpMethod: 'GET',
        url: '',
        headersTemplate: '',
        authentication_type: 'None',
        request_type: 'REST',
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
        headersTemplate: formData.headersTemplate ? JSON.parse(formData.headersTemplate) : null,
        authenticationType: formData.authentication_type,
        requestType: formData.request_type,
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

  // Nova função para testar o endpoint
  const handleTestEndpoint = async (endpoint) => {
    setTestingEndpointId(endpoint.id)
    setTestResult(null)

    try {
      const response = await api.post(`/endpoints/${endpoint.id}/test`)

      setTestResult({
        success: true,
        endpoint: endpoint,
        data: response.data,
        status: response.status,
        statusText: response.statusText || 'OK',
      })

      setIsTestResultModalOpen(true)
    } catch (error) {
      console.error('Error testing endpoint:', error)

      setTestResult({
        success: false,
        endpoint: endpoint,
        error: error.response?.data?.message || error.message || 'Erro desconhecido',
        status: error.response?.status,
        statusText: error.response?.statusText,
        details: error.response?.data,
      })

      setIsTestResultModalOpen(true)
    } finally {
      setTestingEndpointId(null)
    }
  }

  const handleCloseTestResultModal = () => {
    setIsTestResultModalOpen(false)
    setTestResult(null)
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Endpoints</h1>
          {integration && <p className="text-sm sm:text-base text-gray-600 mt-1">Integração: {integration.name}</p>}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
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
          <>
            {/* Visualização em Cards para Mobile */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredEndpoints.map((endpoint) => (
                <div key={endpoint.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{endpoint.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            endpoint.httpMethod === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : endpoint.httpMethod === 'POST'
                              ? 'bg-green-100 text-green-800'
                              : endpoint.httpMethod === 'PUT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : endpoint.httpMethod === 'PATCH'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {endpoint.httpMethod}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            endpoint.requestType === 'SOAP'
                              ? 'bg-blue-100 text-blue-800'
                              : endpoint.requestType === 'REST'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {endpoint.requestType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    {endpoint.url}
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleTestEndpoint(endpoint)}
                      disabled={testingEndpointId === endpoint.id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      title="Testar endpoint"
                    >
                      {testingEndpointId === endpoint.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-green-600"></div>
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
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
                </div>
              ))}
            </div>

            {/* Visualização em Tabela para Desktop */}
            <div className="hidden md:block overflow-x-auto">
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
                    Tipo request
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
                      <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          endpoint.httpMethod === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : endpoint.httpMethod === 'POST'
                            ? 'bg-green-100 text-green-800'
                            : endpoint.httpMethod === 'PUT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : endpoint.httpMethod === 'PATCH'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.httpMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          endpoint.requestType === 'SOAP'
                            ? 'bg-blue-100 text-blue-800'
                            : endpoint.requestType === 'REST'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {endpoint.requestType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-md">{endpoint.url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Botão de Teste - NOVO */}
                        <button
                          onClick={() => handleTestEndpoint(endpoint)}
                          disabled={testingEndpointId === endpoint.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Testar endpoint"
                        >
                          {testingEndpointId === endpoint.id ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-green-600"></div>
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>

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
          </>
        )}
      </div>

      {/* Modal de Formulário */}
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
            <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Request *
            </label>
            <select
              id="request_type"
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className="input"
              required
            >
              {REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
            <label
              htmlFor="authentication_type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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
            <label
              htmlFor="headersTemplate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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

      {/* Modal de Resultado do Teste - NOVO */}
      <Modal
        isOpen={isTestResultModalOpen}
        onClose={handleCloseTestResultModal}
        title="Resultado do Teste"
      >
        {testResult && (
          <div className="space-y-4">
            {/* Header com ícone de sucesso/erro */}
            <div
              className={`flex items-start space-x-3 p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-sm font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {testResult.success ? 'Teste executado com sucesso!' : 'Erro ao executar teste'}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  Endpoint: <strong>{testResult.endpoint.name}</strong>
                </p>
                {testResult.status && (
                  <p
                    className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}
                  >
                    Status: <strong>{testResult.status}</strong> - {testResult.statusText}
                  </p>
                )}
              </div>
            </div>

            {/* Resposta detalhada */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {testResult.success ? 'Resposta:' : 'Detalhes do Erro:'}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(
                    testResult.success ? testResult.data : testResult.details || testResult.error,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleCloseTestResultModal} className="btn btn-primary">
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dialog de Confirmação de Exclusão */}
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
