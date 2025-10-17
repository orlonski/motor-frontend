import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import PathInput from '../components/PathInput';
import { useStructureValidator } from '../hooks/useStructureValidator';

const DIRECTIONS = ['request', 'response'];

function FieldMappings() {
  const { endpointId } = useParams();
  const [endpoint, setEndpoint] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('request');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [formData, setFormData] = useState({
    direction: 'request',
    source_path: '',
    target_path: '',
  });
  const [targetSuggestion, setTargetSuggestion] = useState(null);
  const [targetSuggestionReason, setTargetSuggestionReason] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);

  const handleOpenExampleModal = () => {
    setIsExampleModalOpen(true);
  };

  const handleCloseExampleModal = () => {
    setIsExampleModalOpen(false);
  };

  // Hook de validação de estrutura
  const {
    structure,
    loading: structureLoading,
    error: structureError,
    fetchStructure,
    validatePath,
    suggestTargetPath,
    hasExample,
  } = useStructureValidator(endpointId);

  useEffect(() => {
    fetchEndpoint();
    fetchMappings();
  }, [endpointId]);

  useEffect(() => {
    if (!Array.isArray(mappings)) {
      setFilteredMappings([]);
      return;
    }
    const filtered = mappings.filter((mapping) => {
      const matchesTab = mapping.direction === activeTab;

      if (!searchTerm) {
        return matchesTab;
      }

      const sourcePath = mapping.source_path || mapping.sourcePath || '';
      const targetPath = mapping.target_path || mapping.targetPath || '';

      const matchesSearch =
        sourcePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetPath.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch && matchesTab;
    });
    setFilteredMappings(filtered);
  }, [searchTerm, mappings, activeTab]);

  // Sugerir target path quando source path mudar
  useEffect(() => {
    const getSuggestion = async () => {
      if (
        formData.direction === 'response' &&
        formData.source_path &&
        !formData.target_path &&
        hasExample
      ) {
        const suggestion = await suggestTargetPath(formData.source_path);
        if (suggestion?.suggestion) {
          setTargetSuggestion(suggestion.suggestion);
          setTargetSuggestionReason(suggestion.reason);
          setIsDuplicate(suggestion.reason === 'existing_mapping');
        }
      } else {
        setTargetSuggestion(null);
        setTargetSuggestionReason(null);
        setIsDuplicate(false);
      }
    };

    const timeoutId = setTimeout(getSuggestion, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.source_path, formData.direction, formData.target_path, hasExample, suggestTargetPath]);

  const fetchEndpoint = async () => {
    try {
      const response = await api.get(`/endpoints/${endpointId}`);
      setEndpoint(response.data);
    } catch (error) {
      console.error('Error fetching endpoint:', error);
    }
  };

  const fetchMappings = async () => {
    try {
      const response = await api.get(`/endpoints/${endpointId}/mappings`);
      const data = Array.isArray(response.data) ? response.data : [];
      setMappings(data);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mapping = null) => {
    if (mapping) {
      setSelectedMapping(mapping);
      setFormData({
        direction: mapping.direction,
        source_path: mapping.source_path || mapping.sourcePath || '',
        target_path: mapping.target_path || mapping.targetPath || '',
      });
    } else {
      setSelectedMapping(null);
      setFormData({
        direction: activeTab,
        source_path: '',
        target_path: '',
      });
    }
    setTargetSuggestion(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMapping(null);
    setTargetSuggestion(null);
    setTargetSuggestionReason(null);
    setIsDuplicate(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aviso extra se for duplicata
    if (isDuplicate && !selectedMapping) {
      const confirmCreate = window.confirm(
        '⚠️ ATENÇÃO: Já existe um mapeamento para este caminho de origem!\n\n' +
        'Criar um mapeamento duplicado pode causar conflitos e comportamento inesperado.\n\n' +
        'Você tem certeza que deseja continuar?'
      );
      
      if (!confirmCreate) {
        return; // Cancela a criação
      }
    }

    try {
      const payload = {
        direction: formData.direction,
        sourcePath: formData.source_path,
        targetPath: formData.target_path,
        endpointId: endpointId,
      };

      if (selectedMapping) {
        await api.put(`/mappings/${selectedMapping.id}`, payload);
      } else {
        await api.post('/mappings', payload);
      }
      fetchMappings();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving mapping:', error);
      alert('Erro ao salvar mapeamento');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/mappings/${selectedMapping.id}`);
      fetchMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('Erro ao excluir mapeamento');
    }
  };

  const handleOpenDeleteDialog = (mapping) => {
    setSelectedMapping(mapping);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
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

      {/* Alerta sobre estrutura */}
      {!hasExample && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-900">
                Nenhum exemplo de resposta disponível
              </h4>
              <p className="text-sm text-yellow-800 mt-1">
                Execute um teste no endpoint para obter sugestões automáticas e validação de caminhos.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasExample && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  {structure?.totalPaths || 0} caminhos disponíveis para mapeamento
                </p>
                {structure?.lastTestedAt && (
                  <p className="text-xs text-green-700">
                    Última atualização: {new Date(structure.lastTestedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenExampleModal();
                }}
                className="btn btn-secondary flex items-center space-x-2 text-sm"
                title="Ver exemplo completo da resposta"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Ver Exemplo</span>
              </button>
              <button
                onClick={fetchStructure}
                disabled={structureLoading}
                className="btn btn-secondary flex items-center space-x-2 text-sm"
                type="button"
              >
                <RefreshCw className={`h-4 w-4 ${structureLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* Alerta de duplicata */}
        {isDuplicate && !selectedMapping && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-semibold">
                  ⚠️ Mapeamento Duplicado Detectado
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Já existe um mapeamento para este caminho de origem. Criar outro causará conflito.
                  <strong> Recomendamos editar o existente ao invés de criar um novo.</strong>
                </p>
              </div>
            </div>
          </div>
        )}
        
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

          {/* Input de Source Path com validação */}
          <PathInput
            label="Caminho de Origem"
            value={formData.source_path}
            onChange={(value) => setFormData({ ...formData, source_path: value })}
            placeholder="data.customer.name ou items[*].id"
            required
            paths={formData.direction === 'response' ? structure?.paths || [] : []}
            onValidate={validatePath}
            direction={formData.direction}
          />

          {/* Input de Target Path com sugestão */}
          <PathInput
            label="Caminho de Destino"
            value={formData.target_path}
            onChange={(value) => setFormData({ ...formData, target_path: value })}
            placeholder="cliente.nome ou veiculos[*].id"
            required
            suggestion={targetSuggestion}
            suggestionReason={targetSuggestionReason}
          />

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
              <p className="font-mono bg-white px-2 py-1 rounded">
                user.id → cliente.id_externo
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`btn ${isDuplicate && !selectedMapping ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'btn-primary'}`}
            >
              {isDuplicate && !selectedMapping ? '⚠️ Criar Mesmo Assim' : selectedMapping ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Mapeamento"
        message="Tem certeza que deseja excluir este mapeamento? Esta ação não pode ser desfeita."
      />

      {/* Modal de Exemplo */}
      <Modal
        isOpen={isExampleModalOpen}
        onClose={handleCloseExampleModal}
        title="Exemplo de Resposta da API"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Exemplo de resposta obtido do último teste do endpoint:
          </p>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs font-mono max-h-96">
            {(() => {
              try {
                if (structure?.structure) {
                  return JSON.stringify(structure.structure, null, 2);
                }
                if (structure?.example) {
                  return JSON.stringify(structure.example, null, 2);
                }
                if (endpoint?.response_example) {
                  const parsed = typeof endpoint.response_example === 'string'
                    ? JSON.parse(endpoint.response_example)
                    : endpoint.response_example;
                  return JSON.stringify(parsed, null, 2);
                }
                return 'Nenhum exemplo disponível';
              } catch (error) {
                return endpoint?.response_example || 'Nenhum exemplo disponível';
              }
            })()}
          </pre>
          {structure?.totalPaths > 0 && (
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Caminhos disponíveis ({structure.totalPaths}):</p>
              <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
                {structure.paths && structure.paths.length > 0 ? (
                  <ul className="space-y-1">
                    {structure.paths.map((pathObj, index) => (
                      <li key={index} className="font-mono text-xs">
                        {typeof pathObj === 'string' ? pathObj : pathObj.path}
                        {typeof pathObj === 'object' && pathObj.type && (
                          <span className="text-gray-500 ml-2">
                            ({pathObj.type}{pathObj.isArray ? '[]' : ''})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs">Nenhum caminho encontrado</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default FieldMappings;