import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useStructureValidator(endpointId) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar estrutura do endpoint
  const fetchStructure = useCallback(async () => {
    if (!endpointId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/endpoints/${endpointId}/structure`);
      setStructure(response.data);
    } catch (err) {
      console.error('Error fetching structure:', err);
      setError(err.response?.data?.message || 'Erro ao carregar estrutura');
    } finally {
      setLoading(false);
    }
  }, [endpointId]);

  // Buscar ao montar
  useEffect(() => {
    fetchStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointId]);

  // Validar um caminho
  const validatePath = useCallback(
    async (sourcePath, direction = 'response') => {
      if (!endpointId || !sourcePath) {
        return { valid: false, message: 'Caminho vazio' };
      }

      try {
        const response = await api.post(`/endpoints/${endpointId}/validate-path`, {
          sourcePath,
          direction,
        });
        return response.data;
      } catch (err) {
        console.error('Error validating path:', err);
        return {
          valid: false,
          message: err.response?.data?.message || 'Erro ao validar caminho',
        };
      }
    },
    [endpointId]
  );

  // Sugerir target path
  const suggestTargetPath = useCallback(
    async (sourcePath) => {
      if (!endpointId || !sourcePath) {
        return null;
      }

      try {
        const response = await api.post(`/endpoints/${endpointId}/suggest-target`, {
          sourcePath,
        });
        return response.data;
      } catch (err) {
        console.error('Error suggesting target:', err);
        return null;
      }
    },
    [endpointId]
  );

  // Filtrar caminhos baseado na busca
  const filterPaths = useCallback(
    (searchTerm) => {
      if (!structure?.paths) return [];
      if (!searchTerm) return structure.paths;

      const search = searchTerm.toLowerCase();
      return structure.paths.filter((p) =>
        p.path.toLowerCase().includes(search)
      );
    },
    [structure]
  );

  return {
    structure,
    loading,
    error,
    fetchStructure,
    validatePath,
    suggestTargetPath,
    filterPaths,
    hasExample: structure?.hasExample || false,
  };
}