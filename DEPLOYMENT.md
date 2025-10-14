# Guia de Deploy

Este documento descreve como fazer o deploy da aplicação frontend em diferentes ambientes.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Acesso ao servidor/plataforma de hospedagem
- Backend da aplicação já deployado e acessível

## 🏗️ Build de Produção

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.production`:

```bash
VITE_API_URL=https://api.seudominio.com/api
```

### 2. Gerar Build

```bash
npm run build
```

Isso criará uma pasta `dist/` com os arquivos otimizados.

### 3. Testar Build Localmente

```bash
npm run preview
```

Acesse `http://localhost:4173` para testar o build.

## 🚀 Opções de Deploy

### Opção 1: Vercel (Recomendado para Desenvolvimento Rápido)

#### Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Via GitHub

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

**Configuração no Vercel:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Opção 2: Netlify

#### Via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Via Interface Web

1. Arraste a pasta `dist/` para o Netlify
2. Ou conecte ao repositório Git

**Arquivo `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Opção 3: AWS S3 + CloudFront

#### 1. Criar Bucket S3

```bash
aws s3 mb s3://motor-integrations-frontend
```

#### 2. Configurar Bucket para Hospedagem

```bash
aws s3 website s3://motor-integrations-frontend \
  --index-document index.html \
  --error-document index.html
```

#### 3. Upload dos Arquivos

```bash
aws s3 sync dist/ s3://motor-integrations-frontend --delete
```

#### 4. Configurar CloudFront

- Crie uma distribuição CloudFront apontando para o bucket S3
- Configure Custom Error Response para redirecionar 404 para index.html

### Opção 4: Nginx (Servidor Próprio)

#### 1. Copiar Arquivos

```bash
scp -r dist/* usuario@servidor:/var/www/motor-frontend/
```

#### 2. Configurar Nginx

Crie `/etc/nginx/sites-available/motor-frontend`:

```nginx
server {
    listen 80;
    server_name motor.seudominio.com;
    root /var/www/motor-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass https://swagger-motor-backend.zj8v6e.easypanel.host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/motor-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL com Let's Encrypt

```bash
sudo certbot --nginx -d motor.seudominio.com
```

### Opção 5: Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
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

#### Build e Run

```bash
# Build
docker build -t motor-frontend .

# Run
docker run -d -p 80:80 motor-frontend
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://swagger-motor-backend.zj8v6e.easypanel.host/api
    depends_on:
      - backend
```

## 🔧 Configurações Importantes

### CORS

Certifique-se de que o backend permite requisições do domínio do frontend:

```javascript
// Backend (Express.js)
app.use(cors({
  origin: 'https://motor.seudominio.com',
  credentials: true
}))
```

### Variáveis de Ambiente

Configure no ambiente de produção:

```bash
VITE_API_URL=https://api.seudominio.com/api
```

### Security Headers

Adicione headers de segurança no Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## 📊 Monitoramento

### Logs de Acesso

Configure logs para monitorar acessos:

```nginx
access_log /var/log/nginx/motor-frontend-access.log;
error_log /var/log/nginx/motor-frontend-error.log;
```

### Analytics

Considere adicionar Google Analytics ou similar:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 CI/CD

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        
    - name: Deploy to Server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: /var/www/motor-frontend
        SOURCE: dist/
```

## ✅ Checklist de Deploy

- [ ] Build de produção gerado sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado no backend
- [ ] SSL/HTTPS configurado
- [ ] Headers de segurança adicionados
- [ ] Compressão Gzip habilitada
- [ ] Cache de assets estáticos configurado
- [ ] Logs configurados
- [ ] Backup do código anterior realizado
- [ ] Testes realizados no ambiente de produção

## 🐛 Troubleshooting

### Problema: Página em branco após deploy

**Solução:**
- Verifique o console do navegador para erros
- Confirme que o caminho base está correto no `vite.config.js`
- Verifique se todos os assets foram copiados

### Problema: Rotas não funcionam (404)

**Solução:**
- Configure o servidor para redirecionar todas as rotas para `index.html`
- No Nginx: `try_files $uri $uri/ /index.html;`

### Problema: API não responde

**Solução:**
- Verifique se a URL da API está correta
- Confirme que o CORS está configurado no backend
- Verifique os logs do backend

### Problema: Assets não carregam

**Solução:**
- Verifique se o `base` está configurado corretamente no `vite.config.js`
- Confirme que os caminhos dos assets estão relativos

## 📞 Suporte

Para problemas de deploy, contate a equipe de DevOps ou consulte a documentação específica da plataforma escolhida.
