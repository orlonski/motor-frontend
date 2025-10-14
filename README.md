# Motor de Integrações - Frontend

Painel de administração web para gerenciar configurações do motor de integrações com n8n.

## 📋 Sobre o Projeto

Esta aplicação frontend permite que usuários gerenciem visualmente as configurações de integrações armazenadas em um banco de dados PostgreSQL, sem necessidade de conhecimento técnico em SQL.

### Funcionalidades

- ✅ **Gerenciamento de Integrações**: Criar, visualizar, editar e excluir integrações
- ✅ **Gerenciamento de Endpoints**: Configurar endpoints de API com métodos HTTP, URLs e headers
- ✅ **Mapeamento de Campos**: Definir mapeamentos de campos para requests e responses
- ✅ **Navegação em Cascata**: Fluxo intuitivo de navegação entre integrações → endpoints → mapeamentos
- ✅ **Busca**: Funcionalidade de busca em todas as telas
- ✅ **Breadcrumbs**: Navegação contextual para facilitar a orientação
- ✅ **Autenticação**: Sistema de login para proteger o acesso

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool moderna e rápida
- **React Router v6** - Roteamento e navegação
- **Axios** - Cliente HTTP para comunicação com o backend
- **TailwindCSS** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones moderna

## 📦 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Breadcrumbs.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SearchBar.jsx
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.jsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Endpoints.jsx
│   │   ├── FieldMappings.jsx
│   │   ├── Integrations.jsx
│   │   └── Login.jsx
│   ├── services/            # Serviços e APIs
│   │   └── api.js
│   ├── utils/               # Utilitários
│   │   └── cn.js
│   ├── App.jsx              # Componente principal
│   ├── index.css            # Estilos globais
│   └── main.jsx             # Ponto de entrada
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Backend da aplicação rodando (veja instruções do backend)

### Passo 1: Instalar Dependências

```bash
cd frontend
npm install
```

### Passo 2: Configurar Variáveis de Ambiente (Opcional)

O frontend está configurado para fazer proxy das requisições `/api` para `https://swagger-motor-backend.zj8v6e.easypanel.host`. Se o backend estiver rodando em outra porta, edite o arquivo `vite.config.js`:

```javascript
export default defineConfig({
  // ...
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://swagger-motor-backend.zj8v6e.easypanel.host', // Altere aqui se necessário
        changeOrigin: true,
      }
    }
  }
})
```

### Passo 3: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção na pasta `dist/`
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter para verificar problemas no código

## 🌐 Integração com Backend

O frontend espera que o backend forneça as seguintes rotas de API:

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Integrações
- `GET /api/integrations` - Lista todas as integrações
- `GET /api/integrations/:id` - Busca uma integração específica
- `POST /api/integrations` - Cria nova integração
- `PUT /api/integrations/:id` - Atualiza integração
- `DELETE /api/integrations/:id` - Deleta integração

### Endpoints
- `GET /api/integrations/:integrationId/endpoints` - Lista endpoints de uma integração
- `GET /api/endpoints/:id` - Busca um endpoint específico
- `POST /api/endpoints` - Cria novo endpoint
- `PUT /api/endpoints/:id` - Atualiza endpoint
- `DELETE /api/endpoints/:id` - Deleta endpoint

### Mapeamentos
- `GET /api/endpoints/:endpointId/mappings` - Lista mapeamentos de um endpoint
- `POST /api/mappings` - Cria novo mapeamento
- `PUT /api/mappings/:id` - Atualiza mapeamento
- `DELETE /api/mappings/:id` - Deleta mapeamento

## 🎨 Guia de Uso

### 1. Login
Acesse a aplicação e faça login com suas credenciais.

### 2. Gerenciar Integrações
- Na tela inicial, visualize todas as integrações cadastradas
- Clique em "Nova Integração" para adicionar uma nova
- Use os ícones de editar (✏️) ou excluir (🗑️) para modificar integrações existentes
- Clique na seta (→) para ver os endpoints de uma integração

### 3. Gerenciar Endpoints
- Após selecionar uma integração, você verá seus endpoints
- Clique em "Novo Endpoint" para adicionar um endpoint
- Configure o método HTTP (GET, POST, PUT, PATCH, DELETE)
- Defina a URL e headers em formato JSON
- Clique na seta (→) para ver os mapeamentos de um endpoint

### 4. Gerenciar Mapeamentos
- Visualize mapeamentos separados por abas: Request e Response
- **Request**: Mapeia dados do seu sistema para a API externa
- **Response**: Mapeia dados da API externa para o seu sistema
- Defina os caminhos de origem e destino (ex: `data.user.email` → `customer.email`)

## 🚢 Deploy em Produção

### Build de Produção

```bash
npm run build
```

Isso gerará uma pasta `dist/` com os arquivos otimizados para produção.

### Opções de Deploy

#### 1. Servidor Web Estático (Nginx, Apache)

Copie o conteúdo da pasta `dist/` para o diretório do servidor web.

Exemplo de configuração Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/motor-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://swagger-motor-backend.zj8v6e.easypanel.host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. Plataformas de Hospedagem

- **Vercel**: `vercel --prod`
- **Netlify**: Arraste a pasta `dist/` ou conecte ao repositório Git
- **AWS S3 + CloudFront**: Upload da pasta `dist/` para o bucket S3

**Importante**: Configure as variáveis de ambiente para apontar para a URL do backend em produção.

## 🔐 Segurança

- Tokens JWT são armazenados no `localStorage`
- Interceptors do Axios adicionam automaticamente o token em todas as requisições
- Rotas protegidas redirecionam para login se não autenticado
- Logout limpa o token e redireciona para a tela de login

## 🎯 Próximas Melhorias

- [ ] Validação de formulários com biblioteca (ex: Yup, Zod)
- [ ] Toast notifications para feedback de ações
- [ ] Paginação nas tabelas
- [ ] Exportação de configurações (JSON/CSV)
- [ ] Importação em lote de configurações
- [ ] Histórico de alterações (audit log)
- [ ] Testes unitários e de integração
- [ ] Dark mode

## 📝 Licença

Este projeto é de uso interno.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
