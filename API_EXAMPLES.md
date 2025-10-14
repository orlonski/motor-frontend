# Exemplos de Requisições da API

Este documento contém exemplos de como o frontend interage com o backend.

## Autenticação

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin"
  }
}
```

## Integrações

### Listar Integrações
```http
GET /api/integrations
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "name": "CRM XPTO",
    "description": "Integração com CRM XPTO",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Criar Integração
```http
POST /api/integrations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "CRM XPTO",
  "description": "Integração com CRM XPTO"
}
```

### Atualizar Integração
```http
PUT /api/integrations/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "CRM XPTO Atualizado",
  "description": "Nova descrição"
}
```

### Deletar Integração
```http
DELETE /api/integrations/{id}
Authorization: Bearer {token}
```

## Endpoints

### Listar Endpoints de uma Integração
```http
GET /api/integrations/{integrationId}/endpoints
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "integration_id": "uuid-integration",
    "name": "Criar Cliente",
    "http_method": "POST",
    "url": "https://api.crm.com/v1/customers",
    "headers_template": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{token}}"
    },
    "authentication_type": "Bearer",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Buscar Endpoint Específico
```http
GET /api/endpoints/{id}
Authorization: Bearer {token}
```

### Criar Endpoint
```http
POST /api/endpoints
Authorization: Bearer {token}
Content-Type: application/json

{
  "integration_id": "uuid-integration",
  "name": "Criar Cliente",
  "http_method": "POST",
  "url": "https://api.crm.com/v1/customers",
  "headers_template": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{token}}"
  },
  "authentication_type": "Bearer"
}
```

### Atualizar Endpoint
```http
PUT /api/endpoints/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Criar Cliente Atualizado",
  "http_method": "POST",
  "url": "https://api.crm.com/v2/customers",
  "headers_template": {
    "Content-Type": "application/json"
  },
  "authentication_type": "None"
}
```

### Deletar Endpoint
```http
DELETE /api/endpoints/{id}
Authorization: Bearer {token}
```

## Mapeamentos de Campos

### Listar Mapeamentos de um Endpoint
```http
GET /api/endpoints/{endpointId}/mappings
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "uuid-1",
    "endpoint_id": "uuid-endpoint",
    "direction": "request",
    "source_path": "data.customer.name",
    "target_path": "customer.fullName",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid-2",
    "endpoint_id": "uuid-endpoint",
    "direction": "response",
    "source_path": "customer.id",
    "target_path": "cliente.id_externo",
    "created_at": "2024-01-15T10:31:00Z"
  }
]
```

### Criar Mapeamento
```http
POST /api/mappings
Authorization: Bearer {token}
Content-Type: application/json

{
  "endpoint_id": "uuid-endpoint",
  "direction": "request",
  "source_path": "data.customer.email",
  "target_path": "customer.email_address"
}
```

### Atualizar Mapeamento
```http
PUT /api/mappings/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "direction": "request",
  "source_path": "data.customer.email",
  "target_path": "customer.primary_email"
}
```

### Deletar Mapeamento
```http
DELETE /api/mappings/{id}
Authorization: Bearer {token}
```

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Recurso deletado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

## Exemplo de Fluxo Completo

### 1. Login
```bash
curl -X POST https://swagger-motor-backend.zj8v6e.easypanel.host/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

### 2. Criar Integração
```bash
curl -X POST https://swagger-motor-backend.zj8v6e.easypanel.host/api/integrations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"CRM XPTO","description":"Integração com CRM"}'
```

### 3. Criar Endpoint
```bash
curl -X POST https://swagger-motor-backend.zj8v6e.easypanel.host/api/endpoints \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "integration_id": "{integration_id}",
    "name": "Criar Cliente",
    "http_method": "POST",
    "url": "https://api.crm.com/v1/customers",
    "headers_template": {"Content-Type": "application/json"},
    "authentication_type": "Bearer"
  }'
```

### 4. Criar Mapeamento de Request
```bash
curl -X POST https://swagger-motor-backend.zj8v6e.easypanel.host/api/mappings \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "{endpoint_id}",
    "direction": "request",
    "source_path": "data.customer.name",
    "target_path": "customer.fullName"
  }'
```

### 5. Criar Mapeamento de Response
```bash
curl -X POST https://swagger-motor-backend.zj8v6e.easypanel.host/api/mappings \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_id": "{endpoint_id}",
    "direction": "response",
    "source_path": "customer.id",
    "target_path": "cliente.id_externo"
  }'
```
