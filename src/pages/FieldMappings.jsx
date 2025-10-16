import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { useMappingValidator } from '../hooks/useMappingValidator'
import ValidationAlert from '../components/ValidationAlert'

const DIRECTIONS = ['request', 'response']

function FieldMappings() {
  const { endpointId } = useParams()
  const [endpoint, setEndpoint] = useState(null)
  const [mappings, setMappings] = useState([])
  const [filteredMappings, setFilteredMappings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('request')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMapping, setSelectedMapping] = useState(null)
  const [formData, setFormData] = useState({
    direction: 'request',
    source_path: '',
    target_path: '',
  })

  useEffect(() => {
    fetchEndpoint()
    fetchMappings()
  }, [endpointId])

  useEffect(() => {
    // Garantir que mappings é um array antes de filtrar
    if (!Array.isArray(mappings)) {
      setFilteredMappings([])
      return
    }
    const filtered = mappings.filter((mapping) => {
      const matchesTab = mapping.direction === activeTab

      if (!searchTerm) {
        return matchesTab
      }

      const sourcePath = mapping.source_path || mapping.sourcePath || ''
      const targetPath = mapping.target_path || mapping.targetPath || ''

      const matchesSearch =
        sourcePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetPath.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch && matchesTab
    })
    setFilteredMappings(filtered)
  }, [searchTerm, mappings, activeTab])

  const fetchEndpoint = async () => {
    try {
      const response = await api.get(`/endpoints/${endpointId}`)
      setEndpoint(response.data)
    } catch (error) {
      console.error('Error fetching endpoint:', error)
    }
  }

  const fetchMappings = async () => {
    try {
      const response = await api.get(`/endpoints/${endpointId}/mappings`)
      console.log('Mappings data:', response.data)
      // Garantir que sempre temos um array
      const data = Array.isArray(response.data) ? response.data : []
      setMappings(data)
    } catch (error) {
      console.error('Error fetching mappings:', error)
      // Em caso de erro, definir array vazio
      setMappings([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (mapping = null) => {
    if (mapping) {
      setSelectedMapping(mapping)
      setFormData({
        direction: mapping.direction,
        source_path: mapping.source_path || mapping.sourcePath || '',
        target_path: mapping.target_path || mapping.targetPath || '',
      })
    } else {
      setSelectedMapping(null)
      setFormData({
        direction: activeTab,
        source_path: '',
        target_path: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMapping(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Valida apenas se for response
    if (formData.direction === 'response' && !validation.valid) {
      alert('Corrija os erros de validação antes de salvar')
      return
    }

    try {
      const payload = {
        direction: formData.direction,
        sourcePath: formData.source_path,
        targetPath: formData.target_path,
        endpointId: endpointId,
      }

      if (selectedMapping) {
        await api.put(`/mappings/${selectedMapping.id}`, payload)
      } else {
        await api.post('/mappings', payload)
      }
      fetchMappings()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving mapping:', error)
      alert('Erro ao salvar mapeamento')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/mappings/${selectedMapping.id}`)
      fetchMappings()
    } catch (error) {
      console.error('Error deleting mapping:', error)
      alert('Erro ao excluir mapeamento')
    }
  }

  const handleOpenDeleteDialog = (mapping) => {
    setSelectedMapping(mapping)
    setIsDeleteDialogOpen(true)
  }

  const validation = useMappingValidator(
    mappings.filter((m) => m.direction === 'response'),
    isModalOpen && formData.direction === 'response' ? formData : null
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Mapeamentos de Campos</h1>
          {endpoint && (
            <p className="text-gray-600 mt-1">
              Endpoint: {endpoint.name} ({endpoint.http_method})
            </p>
          )}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Mapeamento</span>
        </button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'request'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mapeamento de Request
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'response'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mapeamento de Response
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar mapeamentos..."
            />
          </div>

          {filteredMappings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? 'Nenhum mapeamento encontrado'
                  : `Nenhum mapeamento de ${activeTab} cadastrado`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direção
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caminho de Origem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caminho de Destino
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMappings.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            mapping.direction === 'request'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {mapping.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {mapping.source_path || mapping.sourcePath || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {mapping.target_path || mapping.targetPath || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(mapping)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(mapping)}
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedMapping ? 'Editar Mapeamento' : 'Novo Mapeamento'}
      >
        {formData.direction === 'response' && <ValidationAlert validation={validation} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-2">
              Direção *
            </label>
            <select
              id="direction"
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              className="input"
              required
            >
              {DIRECTIONS.map((direction) => (
                <option key={direction} value={direction}>
                  {direction}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              <strong>request:</strong> mapeia dados enviados para a API externa.{' '}
              <strong>response:</strong> mapeia dados recebidos da API externa.
            </p>
          </div>

          <div>
            <label htmlFor="source_path" className="block text-sm font-medium text-gray-700 mb-2">
              Caminho de Origem *
            </label>
            <input
              id="source_path"
              type="text"
              value={formData.source_path}
              onChange={(e) => setFormData({ ...formData, source_path: e.target.value })}
              className="input font-mono"
              placeholder="data.customer.name"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Caminho do campo de origem (ex: data.user.email)
            </p>
          </div>

          <div>
            <label htmlFor="target_path" className="block text-sm font-medium text-gray-700 mb-2">
              Caminho de Destino *
            </label>
            <input
              id="target_path"
              type="text"
              value={formData.target_path}
              onChange={(e) => setFormData({ ...formData, target_path: e.target.value })}
              className="input font-mono"
              placeholder="cliente.nome"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Caminho do campo de destino (ex: customer.fullName)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Exemplo de Mapeamento</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p>
                <strong>Request:</strong> Mapeia dados do seu sistema para a API externa
              </p>
              <p className="font-mono bg-white px-2 py-1 rounded">
                usuario.email → user.email_address
              </p>
              <p className="mt-2">
                <strong>Response:</strong> Mapeia dados da API externa para o seu sistema
              </p>
              <p className="font-mono bg-white px-2 py-1 rounded">user.id → cliente.id_externo</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedMapping ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Mapeamento"
        message={`Tem certeza que deseja excluir este mapeamento? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}

export default FieldMappings
