import { AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react'

function ValidationAlert({ validation }) {
  if (!validation || (validation.errors.length === 0 && validation.warnings.length === 0)) {
    return null
  }

  return (
    <div className="space-y-2 mb-4">
      {/* Erros */}
      {validation.errors.map((error, idx) => (
        <div key={`error-${idx}`} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Erro no mapeamento</h4>
              <p className="text-sm text-red-800">{error.message}</p>
              {error.suggestion && (
                <div className="mt-2 flex items-start bg-red-100 rounded p-2">
                  <Lightbulb className="h-4 w-4 text-red-700 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-red-900 font-mono">{error.suggestion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {validation.warnings.map((warning, idx) => (
        <div key={`warning-${idx}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Atenção</h4>
              <p className="text-sm text-yellow-800">{warning.message}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Info do cenário detectado */}
      {validation.scenario && validation.valid && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Cenário detectado:</strong>{' '}
            {validation.scenario === 'simple_object' && 'Objeto simples (sem arrays)'}
            {validation.scenario === 'array_root' && 'Array root - retornará um array de objetos'}
            {validation.scenario === 'object_with_arrays' && 'Objeto com arrays aninhados'}
            {validation.scenario === 'object_with_nested_arrays' && 'Estrutura complexa com arrays profundos'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ValidationAlert