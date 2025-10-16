import { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, Lightbulb, ChevronDown } from 'lucide-react';

function PathInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  paths = [],
  onValidate,
  direction,
  error,
  suggestion,
  suggestionReason, // NOVO: razão da sugestão
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPaths, setFilteredPaths] = useState([]);
  const [validationState, setValidationState] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar caminhos baseado no input
  useEffect(() => {
    if (!paths.length) {
      setFilteredPaths([]);
      return;
    }

    // Se não tem valor, mostra os primeiros paths
    if (!value || value.trim() === '') {
      setFilteredPaths(paths.slice(0, 10));
      return;
    }

    const search = value.toLowerCase();
    const filtered = paths
      .filter((p) => p.path.toLowerCase().includes(search))
      .slice(0, 10); // Limitar a 10 sugestões

    setFilteredPaths(filtered);
  }, [value, paths]);

  // Validar caminho quando mudar
  useEffect(() => {
    if (!value || direction === 'request' || !onValidate) {
      setValidationState(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const result = await onValidate(value, direction);
      setValidationState(result);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [value, direction, onValidate]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    // Mostra dropdown assim que começar a digitar
    if (paths.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSelectPath = (path) => {
    onChange(path);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    // Mostra dropdown ao clicar no campo (mesmo sem texto)
    if (paths.length > 0) {
      setShowDropdown(true);
    }
  };
  
  const handleToggleDropdown = () => {
    if (paths.length > 0) {
      setShowDropdown(!showDropdown);
    }
  };

  const getInputClassName = () => {
    let className = 'input font-mono pr-10';

    if (validationState) {
      if (validationState.valid) {
        className += ' border-green-500 focus:ring-green-500';
      } else if (validationState.reason !== 'no_example') {
        className += ' border-red-500 focus:ring-red-500';
      }
    }

    return className;
  };

  return (
    <div className="relative">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={label}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={getInputClassName()}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        {/* Ícone de status */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {validationState?.valid && (
            <Check className="h-5 w-5 text-green-500 pointer-events-none" />
          )}
          {validationState && !validationState.valid && validationState.reason !== 'no_example' && (
            <AlertCircle className="h-5 w-5 text-red-500 pointer-events-none" />
          )}
          {!validationState && paths.length > 0 && (
            <button
              type="button"
              onClick={handleToggleDropdown}
              className="focus:outline-none hover:text-gray-600"
              title="Mostrar/ocultar sugestões"
            >
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Dropdown de sugestões */}
        {showDropdown && filteredPaths.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">
                {!value ? (
                  <span>✨ {filteredPaths.length} caminhos disponíveis - Digite para filtrar</span>
                ) : (
                  <span>{filteredPaths.length} {filteredPaths.length === 1 ? 'caminho encontrado' : 'caminhos encontrados'}</span>
                )}
              </div>
              {filteredPaths.map((pathObj, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectPath(pathObj.path)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-start space-x-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-gray-900 truncate">
                      {pathObj.path}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          pathObj.type === 'string'
                            ? 'bg-blue-100 text-blue-800'
                            : pathObj.type === 'number'
                            ? 'bg-green-100 text-green-800'
                            : pathObj.type === 'boolean'
                            ? 'bg-purple-100 text-purple-800'
                            : pathObj.type === 'array'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pathObj.type}
                      </span>
                      {pathObj.isArray && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          array
                        </span>
                      )}
                      {pathObj.sample !== '[Object]' && pathObj.sample !== '[Array]' && (
                        <span className="text-xs text-gray-500 truncate">
                          ex: {String(pathObj.sample).substring(0, 30)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mensagens de validação */}
      {validationState && !validationState.valid && validationState.reason !== 'no_example' && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-800">{validationState.message}</p>
          {validationState.suggestions && validationState.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-700 font-medium mb-1">Sugestões:</p>
              <div className="space-y-1">
                {validationState.suggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(sugg)}
                    className="block w-full text-left text-xs font-mono bg-white px-2 py-1 rounded hover:bg-red-100 text-red-900"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sugestão de target path */}
      {suggestion && (
        <div className={`mt-2 border rounded p-3 ${
          suggestionReason === 'existing_mapping' 
            ? 'bg-yellow-50 border-yellow-300' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-2">
            {suggestionReason === 'existing_mapping' ? (
              <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {suggestionReason === 'existing_mapping' ? (
                <>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    ⚠️ Atenção: Mapeamento já existe!
                  </p>
                  <p className="text-xs text-yellow-800 mb-2">
                    Já existe um mapeamento para este caminho de origem. O destino atual é:
                  </p>
                  <div className="w-full text-left text-sm font-mono bg-white px-2 py-1 rounded border border-yellow-300 text-yellow-900">
                    {suggestion}
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    💡 Para evitar duplicatas, edite o mapeamento existente ao invés de criar um novo.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-blue-800 mb-1">Sugestão de mapeamento:</p>
                  <button
                    type="button"
                    onClick={() => onChange(suggestion)}
                    className="w-full text-left text-sm font-mono bg-white px-2 py-1 rounded hover:bg-blue-100 text-blue-900 truncate"
                  >
                    {suggestion}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Erro customizado */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Validação positiva */}
      {validationState?.valid && (
        <div className="mt-2 flex items-center space-x-2 text-green-700">
          <Check className="h-4 w-4" />
          <span className="text-xs">Caminho válido</span>
          {validationState.sample && (
            <span className="text-xs text-gray-500">
              • Tipo: {validationState.type}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PathInput;