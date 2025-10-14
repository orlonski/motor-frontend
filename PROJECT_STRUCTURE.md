# Estrutura do Projeto

## 📂 Visão Geral

```
frontend/
├── public/                      # Arquivos públicos estáticos
│   └── vite.svg                # Favicon
│
├── src/                        # Código fonte
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Breadcrumbs.jsx    # Navegação breadcrumb
│   │   ├── ConfirmDialog.jsx  # Dialog de confirmação
│   │   ├── Layout.jsx         # Layout principal
│   │   ├── LoadingSpinner.jsx # Indicador de carregamento
│   │   ├── Modal.jsx          # Modal genérico
│   │   ├── Navbar.jsx         # Barra de navegação
│   │   ├── ProtectedRoute.jsx # HOC para rotas protegidas
│   │   └── SearchBar.jsx      # Barra de busca
│   │
│   ├── contexts/              # Contextos React
│   │   └── AuthContext.jsx   # Contexto de autenticação
│   │
│   ├── pages/                 # Páginas da aplicação
│   │   ├── Endpoints.jsx     # Gerenciamento de endpoints
│   │   ├── FieldMappings.jsx # Gerenciamento de mapeamentos
│   │   ├── Integrations.jsx  # Gerenciamento de integrações
│   │   └── Login.jsx         # Página de login
│   │
│   ├── services/              # Serviços e APIs
│   │   └── api.js            # Configuração do Axios
│   │
│   ├── utils/                 # Utilitários
│   │   └── cn.js             # Função para combinar classes CSS
│   │
│   ├── App.jsx                # Componente raiz
│   ├── index.css              # Estilos globais + Tailwind
│   └── main.jsx               # Ponto de entrada
│
├── .eslintrc.cjs              # Configuração ESLint
├── .gitignore                 # Arquivos ignorados pelo Git
├── .prettierrc                # Configuração Prettier
├── .prettierignore            # Arquivos ignorados pelo Prettier
├── index.html                 # HTML principal
├── package.json               # Dependências e scripts
├── postcss.config.js          # Configuração PostCSS
├── tailwind.config.js         # Configuração Tailwind
├── vite.config.js             # Configuração Vite
│
├── API_EXAMPLES.md            # Exemplos de uso da API
├── CONTRIBUTING.md            # Guia de contribuição
├── DEPLOYMENT.md              # Guia de deploy
├── PROJECT_STRUCTURE.md       # Este arquivo
└── README.md                  # Documentação principal
```

## 🎯 Responsabilidades dos Diretórios

### `/src/components`
Componentes reutilizáveis que podem ser usados em múltiplas páginas.

**Quando adicionar aqui:**
- Componente é usado em mais de uma página
- Componente tem lógica genérica e reutilizável
- Componente não depende de contexto específico de página

### `/src/pages`
Componentes de página que representam rotas da aplicação.

**Quando adicionar aqui:**
- Componente representa uma rota/URL
- Componente contém lógica específica de negócio
- Componente orquestra múltiplos componentes menores

### `/src/contexts`
Contextos React para compartilhar estado global.

**Quando adicionar aqui:**
- Estado precisa ser acessado por múltiplos componentes
- Dados de autenticação, tema, configurações globais

### `/src/services`
Serviços para comunicação externa (APIs, localStorage, etc).

**Quando adicionar aqui:**
- Configuração de clientes HTTP
- Funções de comunicação com APIs
- Wrappers para serviços externos

### `/src/utils`
Funções utilitárias puras sem dependências de React.

**Quando adicionar aqui:**
- Funções de formatação
- Helpers de validação
- Utilitários de manipulação de dados

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      App.jsx                           │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              AuthProvider                        │ │ │
│  │  │  ┌────────────────────────────────────────────┐ │ │ │
│  │  │  │           Router                           │ │ │ │
│  │  │  │  ┌──────────────────────────────────────┐ │ │ │ │
│  │  │  │  │        Layout                        │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │  Navbar + Breadcrumbs         │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────┘ │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │  Page Component               │ │ │ │ │ │
│  │  │  │  │  │  - Integrations               │ │ │ │ │ │
│  │  │  │  │  │  - Endpoints                  │ │ │ │ │ │
│  │  │  │  │  │  - FieldMappings              │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────┘ │ │ │ │ │
│  │  │  │  └──────────────────────────────────────┘ │ │ │ │
│  │  │  └────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests (Axios)
                            ▼
                    ┌───────────────┐
                    │   Backend API │
                    │  (Port 5000)  │
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

## 🛣️ Rotas da Aplicação

```
/
├── /login                                    # Página de login
└── / (Protected)                             # Layout com autenticação
    ├── /integrations                         # Lista de integrações
    ├── /integrations/:id/endpoints           # Endpoints de uma integração
    └── /endpoints/:id/mappings               # Mapeamentos de um endpoint
```

## 📦 Dependências Principais

### Produção
```json
{
  "react": "^18.2.0",              // Biblioteca UI
  "react-dom": "^18.2.0",          // React DOM
  "react-router-dom": "^6.20.0",   // Roteamento
  "axios": "^1.6.2",               // Cliente HTTP
  "lucide-react": "^0.294.0",      // Ícones
  "clsx": "^2.0.0",                // Utilitário de classes
  "tailwind-merge": "^2.1.0"       // Merge de classes Tailwind
}
```

### Desenvolvimento
```json
{
  "vite": "^5.0.8",                // Build tool
  "tailwindcss": "^3.3.6",         // Framework CSS
  "eslint": "^8.55.0",             // Linter
  "autoprefixer": "^10.4.16",      // PostCSS plugin
  "postcss": "^8.4.32"             // Processador CSS
}
```

## 🎨 Sistema de Design

### Cores (Tailwind)
```javascript
primary: {
  50:  '#f0f9ff',  // Muito claro
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',  // Base
  600: '#0284c7',  // Hover
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',  // Muito escuro
}
```

### Componentes Base
```css
.btn              /* Botão base */
.btn-primary      /* Botão primário (azul) */
.btn-secondary    /* Botão secundário (cinza) */
.btn-danger       /* Botão de perigo (vermelho) */
.input            /* Campo de entrada */
.card             /* Card/Container */
```

### Espaçamento
- **Padding**: `p-4` (16px), `p-6` (24px)
- **Margin**: `m-4` (16px), `m-6` (24px)
- **Gap**: `space-x-2` (8px), `space-y-4` (16px)

## 🔐 Autenticação

```
┌──────────────┐
│    Login     │
│   Component  │
└──────┬───────┘
       │ username + password
       ▼
┌──────────────┐
│ AuthContext  │
│   .login()   │
└──────┬───────┘
       │ POST /api/auth/login
       ▼
┌──────────────┐
│  Backend API │
└──────┬───────┘
       │ { token, user }
       ▼
┌──────────────┐
│ localStorage │
│ + Axios      │
│   Headers    │
└──────────────┘
```

## 📱 Responsividade

A aplicação é responsiva e funciona em:
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

Classes Tailwind usadas:
- `sm:` - Small (640px+)
- `md:` - Medium (768px+)
- `lg:` - Large (1024px+)
- `xl:` - Extra Large (1280px+)

## 🧪 Padrões de Código

### Importações
```javascript
// 1. React e hooks
import { useState, useEffect } from 'react'

// 2. Bibliotecas externas
import { useNavigate } from 'react-router-dom'
import { Plus, Edit } from 'lucide-react'

// 3. Serviços e contextos
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// 4. Componentes
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
```

### Estrutura de Componente
```javascript
function ComponentName() {
  // 1. Hooks de roteamento
  const navigate = useNavigate()
  const { id } = useParams()
  
  // 2. Contextos
  const { user } = useAuth()
  
  // 3. Estados
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  
  // 4. Effects
  useEffect(() => {
    fetchData()
  }, [])
  
  // 5. Handlers
  const handleSubmit = async (e) => {
    // lógica
  }
  
  // 6. Render condicional
  if (loading) return <LoadingSpinner />
  
  // 7. Render principal
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## 📊 Métricas

### Tamanho do Bundle (aproximado)
- **Vendor**: ~150KB (React, React Router, Axios)
- **App**: ~50KB (Código da aplicação)
- **Total**: ~200KB (gzipped)

### Performance
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: 90+

## 🔍 Debugging

### React DevTools
Instale a extensão React DevTools para inspecionar:
- Árvore de componentes
- Props e state
- Contextos
- Performance

### Network Tab
Monitore requisições HTTP:
- Status codes
- Response times
- Payloads

### Console
Use console.error para erros:
```javascript
try {
  await api.post('/endpoint', data)
} catch (error) {
  console.error('Error:', error)
}
```
