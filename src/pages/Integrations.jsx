import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowRight } from 'lucide-react'
import api from '../services/api'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

function Integrations() {
  const [integrations, setIntegrations] = useState([])
  const [filteredIntegrations, setFilteredIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchIntegrations()
  }, [])

  useEffect(() => {
    // Garantir que integrations é um array antes de filtrar
    if (!Array.isArray(integrations)) {
      setFilteredIntegrations([])
      return
    }
    const filtered = integrations.filter(
      (integration) =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredIntegrations(filtered)
  }, [searchTerm, integrations])

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations')
      console.log('Integrations response:', response.data)
      console.log('Response type:', typeof response.data)
      console.log('Is array?', Array.isArray(response.data))
      // Garantir que sempre temos um array
      const data = Array.isArray(response.data) ? response.data : []
      if (!Array.isArray(response.data)) {
        console.warn('API retornou dados não-array:', response.data)
      }
      setIntegrations(data)
      setFilteredIntegrations(data)
    } catch (error) {
      console.error('Error fetching integrations:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      // Em caso de erro, definir arrays vazios
      setIntegrations([])
      setFilteredIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (integration = null) => {
    if (integration) {
      setSelectedIntegration(integration)
      setFormData({ name: integration.name, description: integration.description || '' })
    } else {
      setSelectedIntegration(null)
      setFormData({ name: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedIntegration(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedIntegration) {
        await api.put(`/integrations/${selectedIntegration.id}`, formData)
      } else {
        await api.post('/integrations', formData)
      }
      fetchIntegrations()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving integration:', error)
      alert('Erro ao salvar integração')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/integrations/${selectedIntegration.id}`)
      fetchIntegrations()
    } catch (error) {
      console.error('Error deleting integration:', error)
      alert('Erro ao excluir integração')
    }
  }

  const handleOpenDeleteDialog = (integration) => {
    setSelectedIntegration(integration)
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Integrações</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Integração</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar integrações..."
          />
        </div>

        {filteredIntegrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma integração encontrada' : 'Nenhuma integração cadastrada'}
            </p>
          </div>
        ) : (
          <>
            {/* Visualização em Cards para Mobile */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredIntegrations.map((integration) => (
                <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{integration.description || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/integrations/${integration.id}/endpoints`)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Ver endpoints"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(integration)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteDialog(integration)}
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
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIntegrations.map((integration) => (
                  <tr key={integration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {integration.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {integration.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/integrations/${integration.id}/endpoints`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver endpoints"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(integration)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteDialog(integration)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedIntegration ? 'Editar Integração' : 'Nova Integração'}
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedIntegration ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Integração"
        message={`Tem certeza que deseja excluir a integração "${selectedIntegration?.name}"? Esta ação não pode ser desfeita e todos os endpoints e mapeamentos associados também serão excluídos.`}
      />
    </div>
  )
}

export default Integrations
