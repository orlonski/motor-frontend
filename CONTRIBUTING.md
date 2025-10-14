# Guia de Contribuição

## 🎯 Padrões de Código

### Estrutura de Componentes

```jsx
import { useState, useEffect } from 'react'
import { Icon } from 'lucide-react'
import api from '../services/api'

function ComponentName({ prop1, prop2 }) {
  // 1. Estados
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // 2. Effects
  useEffect(() => {
    fetchData()
  }, [])

  // 3. Funções
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/endpoint')
      setData(response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 4. Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

### Nomenclatura

- **Componentes**: PascalCase (ex: `UserProfile`, `SearchBar`)
- **Funções**: camelCase (ex: `fetchData`, `handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_URL`, `MAX_ITEMS`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários

### Classes CSS com Tailwind

Use a função `cn()` para combinar classes condicionalmente:

```jsx
import { cn } from '../utils/cn'

<button
  className={cn(
    'btn',
    isPrimary ? 'btn-primary' : 'btn-secondary',
    disabled && 'opacity-50'
  )}
>
  Clique aqui
</button>
```

### Tratamento de Erros

Sempre trate erros de forma apropriada:

```jsx
try {
  await api.post('/endpoint', data)
  // Sucesso
} catch (error) {
  console.error('Error:', error)
  // Mostrar mensagem de erro ao usuário
  alert(error.response?.data?.message || 'Erro ao processar requisição')
}
```

### Validação de Formulários

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Validações
  if (!formData.name.trim()) {
    alert('Nome é obrigatório')
    return
  }
  
  // Processar
  await saveData()
}
```

## 📁 Organização de Arquivos

### Componentes

- **Componentes reutilizáveis**: `src/components/`
- **Páginas**: `src/pages/`
- **Contextos**: `src/contexts/`
- **Serviços**: `src/services/`
- **Utilitários**: `src/utils/`

### Quando criar um novo componente

Crie um novo componente quando:
- O código se repete em múltiplos lugares
- Um componente está ficando muito grande (>300 linhas)
- Uma parte da UI tem lógica complexa própria

## 🔄 Fluxo de Dados

### Estado Local vs Contexto

- **Estado Local** (`useState`): Para dados que afetam apenas um componente
- **Contexto** (`useContext`): Para dados compartilhados (ex: autenticação, tema)

### Chamadas de API

Sempre use o serviço `api.js` para fazer requisições:

```jsx
import api from '../services/api'

// ✅ Correto
const response = await api.get('/integrations')

// ❌ Evite
const response = await fetch('/api/integrations')
```

## 🎨 Estilização

### Tailwind CSS

Use classes utilitárias do Tailwind:

```jsx
// ✅ Correto
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Evite CSS inline
<div style={{ display: 'flex', padding: '16px' }}>
```

### Classes Customizadas

Defina classes customizadas em `index.css` usando `@layer`:

```css
@layer components {
  .btn-custom {
    @apply px-4 py-2 rounded-lg font-medium;
  }
}
```

## 🧪 Boas Práticas

### 1. Componentes Pequenos e Focados

Cada componente deve ter uma única responsabilidade.

### 2. Props Descritivas

```jsx
// ✅ Correto
<Modal isOpen={isOpen} onClose={handleClose} title="Editar Item" />

// ❌ Evite
<Modal open={isOpen} close={handleClose} text="Editar Item" />
```

### 3. Destructuring de Props

```jsx
// ✅ Correto
function Button({ label, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}

// ❌ Evite
function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### 4. Early Returns

```jsx
// ✅ Correto
if (loading) {
  return <LoadingSpinner />
}

if (error) {
  return <ErrorMessage />
}

return <Content data={data} />

// ❌ Evite aninhamento profundo
return (
  <div>
    {loading ? (
      <LoadingSpinner />
    ) : error ? (
      <ErrorMessage />
    ) : (
      <Content data={data} />
    )}
  </div>
)
```

### 5. Constantes

Defina constantes para valores mágicos:

```jsx
// ✅ Correto
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ❌ Evite
if (method === 'GET' || method === 'POST' || method === 'PUT')
if (fileSize > 5242880)
```

## 🐛 Debugging

### Console Logs

Use console.error para erros e remova console.logs antes do commit:

```jsx
// Durante desenvolvimento
console.log('Data:', data)

// Para erros (pode manter)
console.error('Error fetching data:', error)
```

### React DevTools

Use o React DevTools para inspecionar componentes e estado.

## 📝 Comentários

Comente apenas o que não é óbvio:

```jsx
// ✅ Útil
// Aguarda 500ms antes de fazer a busca para evitar requisições excessivas
const debouncedSearch = debounce(handleSearch, 500)

// ❌ Desnecessário
// Define o estado como true
setLoading(true)
```

## 🚀 Performance

### 1. Evite Re-renders Desnecessários

```jsx
// Use useCallback para funções passadas como props
const handleClick = useCallback(() => {
  // lógica
}, [dependencies])

// Use useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

### 2. Lazy Loading

```jsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## ✅ Checklist antes de Commit

- [ ] Código está formatado (Prettier)
- [ ] Não há erros de lint (ESLint)
- [ ] Console.logs de debug foram removidos
- [ ] Componente funciona em diferentes tamanhos de tela
- [ ] Tratamento de erros está implementado
- [ ] Código está comentado onde necessário
- [ ] Nomes de variáveis são descritivos

## 🔍 Code Review

Ao revisar código, verifique:

1. **Funcionalidade**: O código faz o que deveria?
2. **Legibilidade**: O código é fácil de entender?
3. **Performance**: Há otimizações óbvias que podem ser feitas?
4. **Segurança**: Há vulnerabilidades potenciais?
5. **Testes**: O código está testado adequadamente?

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)
