import { useMemo } from 'react'

export function useMappingValidator(mappings, currentMapping = null) {
  return useMemo(() => {
    console.log('🔍 DEBUG VALIDADOR:')
    console.log('Total de mappings recebidos:', mappings.length)
    console.log('Mappings:', mappings.map(m => ({
      source: m.source_path || m.sourcePath,
      target: m.target_path || m.targetPath,
      direction: m.direction
    })))
    console.log('Current mapping:', currentMapping)
    // NÃO VALIDA se os campos estão vazios
    if (currentMapping && (!currentMapping.source_path || !currentMapping.target_path)) {
      return { valid: true, errors: [], warnings: [], scenario: null }
    }

    // Se currentMapping existe, adiciona temporariamente para validar
    const allMappings = currentMapping 
      ? [...mappings, { 
          source_path: currentMapping.source_path, 
          target_path: currentMapping.target_path,
          direction: currentMapping.direction 
        }]
      : mappings

    // Filtra apenas response mappings para validação
    const responseMappings = allMappings.filter(m => m.direction === 'response')
    
    if (responseMappings.length === 0) {
      return { valid: true, errors: [], warnings: [], scenario: null }
    }

    const errors = []
    const warnings = []
    
    // Separa mappings com e sem arrays
    const arrayMappings = responseMappings.filter(m => 
      (m.source_path || m.sourcePath || '').includes('[*]')
    )
    const simpleMappings = responseMappings.filter(m => 
      !(m.source_path || m.sourcePath || '').includes('[*]')
    )
    
    if (arrayMappings.length === 0) {
      return { valid: true, errors, warnings, scenario: 'simple_object' }
    }
    
    // Identifica arrays root
    const rootArrays = new Set()
    arrayMappings.forEach(m => {
      const sourcePath = m.source_path || m.sourcePath || ''
      const firstArrayPath = sourcePath.split('[*]')[0]
      if (firstArrayPath) {
        rootArrays.add(firstArrayPath)
      }
    })
    
    if (rootArrays.size > 1) {
      errors.push({
        type: 'MULTIPLE_ROOT_ARRAYS',
        message: `Múltiplos arrays root detectados: ${Array.from(rootArrays).join(', ')}`,
        severity: 'error'
      })
      return { valid: false, errors, warnings, scenario: 'invalid' }
    }
    
    const rootArrayPath = Array.from(rootArrays)[0]
    const isShallowArray = rootArrayPath.split('.').length <= 2
    
    if (!isShallowArray) {
      // Array profundo - SOAP ou estrutura complexa
      return { valid: true, errors, warnings, scenario: 'object_with_nested_arrays' }
    }
    
    // Determina o cenário
    const hasFieldsOutsideArray = simpleMappings.length > 0
    
    if (hasFieldsOutsideArray) {
      // CENÁRIO: Objeto com array dentro
      // Exemplo: { status: "OK", object: [{ id: 1 }] }
      // Mappings: status → situacao (simples)
      //           object[*].id → veiculos[*].id (array)
      
      const scenario = 'object_with_arrays'
      
      // Valida se os target_paths dos arrays têm prefixo [*]
      arrayMappings.forEach(m => {
        const targetPath = m.target_path || m.targetPath || ''
        const sourcePath = m.source_path || m.sourcePath || ''
        
        // Só valida se for o mapping atual que está sendo editado/criado
        const isCurrentMapping = currentMapping && 
          sourcePath === currentMapping.source_path && 
          targetPath === currentMapping.target_path
        
        if (isCurrentMapping && !targetPath.includes('[*]')) {
          errors.push({
            type: 'ARRAY_MAPPING_WITHOUT_ARRAY_TARGET',
            field: 'target_path',
            message: `Como você tem campos fora do array, o destino também precisa ter [*]`,
            suggestion: `Sugestão: items[*].${targetPath}`,
            mapping: m,
            severity: 'error'
          })
        }
      })
      
      return { valid: errors.length === 0, errors, warnings, scenario }
      
    } else {
      // CENÁRIO: Array Root
      // Exemplo: { records: [{ id: 1, placa: "ABC" }] }
      // Mappings: records[*].id → id
      //           records[*].placa → placa
      
      const scenario = 'array_root'
      
      // Valida se os target_paths NÃO têm prefixo indevido
      arrayMappings.forEach(m => {
        const targetPath = m.target_path || m.targetPath || ''
        const sourcePath = m.source_path || m.sourcePath || ''
        
        // Só valida se for o mapping atual que está sendo editado/criado
        const isCurrentMapping = currentMapping && 
          sourcePath === currentMapping.source_path && 
          targetPath === currentMapping.target_path
        
        if (isCurrentMapping && targetPath.includes('[*]')) {
          const targetPrefix = targetPath.split('[*]')[0]
          if (targetPrefix && targetPrefix.length > 0) {
            const fixedPath = targetPath.substring(targetPrefix.length + 3)
            errors.push({
              type: 'ARRAY_ROOT_WITH_PREFIXED_TARGET',
              field: 'target_path',
              message: `Para array root, o destino NÃO deve ter prefixo com [*]`,
              suggestion: `Sugestão: ${fixedPath || 'campo_sem_prefixo'}`,
              mapping: m,
              severity: 'error'
            })
          }
        }
      })
      
      return { valid: errors.length === 0, errors, warnings, scenario }
    }
  }, [mappings, currentMapping])
}