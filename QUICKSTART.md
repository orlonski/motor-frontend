# 🚀 Início Rápido

Guia rápido para colocar o frontend funcionando em minutos.

## ⚡ Setup em 3 Passos

### 1️⃣ Instalar Dependências

```bash
cd frontend
npm install
```

### 2️⃣ Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

### 3️⃣ Acessar Aplicação

Abra o navegador em: **http://localhost:3000**

## 🎯 Primeiro Acesso

### Login
Use as credenciais configuradas no backend (exemplo):
- **Usuário**: `admin`
- **Senha**: `senha123`

## 📝 Fluxo de Uso Básico

### 1. Criar uma Integração
1. Na tela inicial, clique em **"Nova Integração"**
2. Preencha:
   - **Nome**: `CRM XPTO`
   - **Descrição**: `Integração com CRM XPTO`
3. Clique em **"Criar"**

### 2. Adicionar um Endpoint
1. Clique na seta (→) da integração criada
2. Clique em **"Novo Endpoint"**
3. Preencha:
   - **Nome**: `Criar Cliente`
   - **Método HTTP**: `POST`
   - **URL**: `https://api.crm.com/v1/customers`
   - **Headers** (opcional):
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer {{token}}"
     }
     ```
   - **Tipo de Autenticação**: `Bearer`
4. Clique em **"Criar"**

### 3. Configurar Mapeamentos
1. Clique na seta (→) do endpoint criado
2. Clique em **"Novo Mapeamento"**

#### Mapeamento de Request
3. Preencha:
   - **Direção**: `request`
   - **Caminho de Origem**: `data.customer.name`
   - **Caminho de Destino**: `customer.fullName`
4. Clique em **"Criar"**

#### Mapeamento de Response
5. Clique em **"Novo Mapeamento"** novamente
6. Preencha:
   - **Direção**: `response`
   - **Caminho de Origem**: `customer.id`
   - **Caminho de Destino**: `cliente.id_externo`
7. Clique em **"Criar"**

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Visualiza build localmente

# Qualidade de Código
npm run lint         # Verifica erros de lint
```

## 🌐 Configuração do Backend

O frontend espera que o backend esteja rodando em `https://swagger-motor-backend.zj8v6e.easypanel.host`.

Se o backend estiver em outra porta, edite `vite.config.js`:

```javascript
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:PORTA_DO_BACKEND', // Altere aqui
        changeOrigin: true,
      }
    }
  }
})
```

## 📱 Recursos Principais

### ✅ Navegação em Cascata
```
Home → Integrações → Endpoints → Mapeamentos
```

### ✅ Busca
Todas as telas possuem busca em tempo real.

### ✅ Breadcrumbs
Navegação contextual no topo da página.

### ✅ Validação
Formulários com validação de campos obrigatórios.

### ✅ Confirmação de Exclusão
Diálogos de confirmação antes de excluir dados.

## 🎨 Interface

### Cores
- **Primária**: Azul (`#0ea5e9`)
- **Sucesso**: Verde
- **Perigo**: Vermelho
- **Neutro**: Cinza

### Ícones
Todos os ícones são da biblioteca **Lucide React**.

## 🐛 Problemas Comuns

### Erro: "Cannot connect to backend"
**Solução**: Verifique se o backend está rodando na porta 5000.

```bash
# No diretório do backend
npm start
```

### Erro: "Module not found"
**Solução**: Reinstale as dependências.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Página em branco
**Solução**: Verifique o console do navegador (F12) para erros.

### Rotas não funcionam após refresh
**Solução**: Configure o servidor para redirecionar todas as rotas para `index.html`.

## 📚 Próximos Passos

1. **Leia o README.md** - Documentação completa
2. **Veja API_EXAMPLES.md** - Exemplos de requisições
3. **Consulte CONTRIBUTING.md** - Padrões de código
4. **Leia DEPLOYMENT.md** - Como fazer deploy

## 💡 Dicas

### Atalhos do Navegador
- **F12**: Abrir DevTools
- **Ctrl + Shift + C**: Inspecionar elemento
- **Ctrl + Shift + R**: Hard refresh (limpa cache)

### React DevTools
Instale a extensão React DevTools para facilitar o debug:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Hot Reload
O Vite possui hot reload automático. Salve o arquivo e veja as mudanças instantaneamente.

## 🎯 Estrutura de Arquivos Importantes

```
frontend/
├── src/
│   ├── pages/              # Páginas principais
│   │   ├── Login.jsx
│   │   ├── Integrations.jsx
│   │   ├── Endpoints.jsx
│   │   └── FieldMappings.jsx
│   │
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Modal.jsx
│   │   ├── SearchBar.jsx
│   │   └── ...
│   │
│   ├── services/
│   │   └── api.js         # Configuração Axios
│   │
│   └── contexts/
│       └── AuthContext.jsx # Autenticação
│
├── package.json           # Dependências
├── vite.config.js        # Configuração Vite
└── tailwind.config.js    # Configuração Tailwind
```

## 🔐 Segurança

- Tokens JWT são armazenados no `localStorage`
- Rotas protegidas redirecionam para login
- Logout limpa todos os dados de autenticação

## 📞 Suporte

Problemas? Consulte:
1. **README.md** - Documentação completa
2. **Console do navegador** - Mensagens de erro
3. **Logs do backend** - Erros de API

## ✨ Recursos Avançados

### Modo de Desenvolvimento
```bash
npm run dev -- --host  # Acessa de outros dispositivos na rede
```

### Build Otimizado
```bash
npm run build          # Gera build otimizado
npm run preview        # Testa o build localmente
```

### Análise do Bundle
Adicione ao `package.json`:
```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

---

**Pronto!** 🎉 Você está pronto para usar o Motor de Integrações!
