# 📚 API Documentation

## 🔗 Base URL
```
Development: http://localhost:3000/api
Production: https://api.bifrost-platform.com/api
```

## 🔐 Authentication

### JWT Token
Todos os endpoints protegidos requerem um token JWT no header:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting
- **Geral**: 100 requests/minuto
- **Autenticação**: Limites específicos por endpoint
- **Headers de resposta**: `X-RateLimit-*`

## 📋 Endpoints

### 🔐 Authentication (`/auth`)

#### POST `/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isEmailVerified": false
  }
}
```

#### POST `/auth/login`
Autentica um usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

#### POST `/auth/verify-email`
Verifica o e-mail do usuário.

**Body:**
```json
{
  "token": "verification-token"
}
```

#### POST `/auth/forgot-password`
Solicita redefinição de senha.

**Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password`
Redefine a senha com código.

**Body:**
```json
{
  "token": "12345",
  "newPassword": "newpassword123"
}
```

### 👤 Users (`/users`)

#### GET `/users/profile`
Obtém o perfil completo do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "isEmailVerified": true,
    "profile": {
      "monthlyIncome": 5000,
      "financialGoals": ["retirement", "house"],
      "riskTolerance": "moderate"
    }
  }
}
```

#### PUT `/users/profile`
Atualiza o perfil financeiro.

**Body:**
```json
{
  "monthlyIncome": 6000,
  "financialGoals": ["retirement", "house", "emergency_fund"],
  "riskTolerance": "aggressive"
}
```

#### PUT `/users`
Atualiza dados gerais do usuário.

**Body:**
```json
{
  "fullName": "John Updated Doe",
  "phone": "+1987654321",
  "address": "456 New St"
}
```

### 💰 Expenses (`/expenses`)

#### GET `/expenses`
Lista despesas do usuário com filtros opcionais.

**Query Parameters:**
- `startDate`: Data início (YYYY-MM-DD)
- `endDate`: Data fim (YYYY-MM-DD)
- `category`: Categoria
- `essential`: true/false

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "description": "Lunch",
      "amount": 25.50,
      "category": "Food",
      "date": "2024-01-15",
      "essential": false,
      "notes": "Restaurant lunch"
    }
  ]
}
```

#### POST `/expenses`
Cria nova despesa.

**Body:**
```json
{
  "description": "Lunch at restaurant",
  "amount": 50.99,
  "category": "Food",
  "date": "2024-01-15",
  "essential": false,
  "notes": "Business lunch"
}
```

#### GET `/expenses/report/pdf`
Gera relatório PDF das despesas.

**Query Parameters:** Mesmos do GET `/expenses`

**Response:** Arquivo PDF para download

### 💵 Incomes (`/incomes`)

#### GET `/incomes`
Lista receitas do usuário.

#### POST `/incomes`
Cria nova receita.

**Body:**
```json
{
  "source": "Salary",
  "amount": 3000.00,
  "recurrent": true,
  "description": "Monthly salary"
}
```

#### GET `/incomes/total`
Obtém total de receitas.

### 📊 Investment Simulations (`/investment-simulations`)

#### POST `/investment-simulations/calculate`
Calcula projeção de investimento.

**Body:**
```json
{
  "initialAmount": 10000,
  "monthlyContribution": 500,
  "annualReturnRate": 8,
  "timePeriodMonths": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "futureValue": 150000.00,
    "totalContributions": 70000.00,
    "totalReturns": 80000.00,
    "roi": 114.29
  }
}
```

#### POST `/investment-simulations`
Salva simulação de investimento.

#### GET `/investment-simulations`
Lista simulações do usuário.

### 🎓 Financial Concepts (`/financial-concepts`)

#### GET `/financial-concepts`
Lista conceitos financeiros.

**Query Parameters:**
- `category`: Categoria
- `difficultyLevel`: beginner/intermediate/advanced

#### GET `/financial-concepts/popular`
Lista conceitos mais populares.

## 🔧 tRPC Endpoints

### Base URL
```
http://localhost:3000/trpc
```

### Available Procedures

#### `health`
```typescript
trpc.health.query()
```

#### `getUser`
```typescript
trpc.getUser.query({ id: "user-uuid" })
```

#### `generateExpenseReportPdf`
```typescript
trpc.generateExpenseReportPdf.mutate({
  userId: "user-uuid",
  startDate: "2024-01-01",
  endDate: "2024-01-31"
})
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Validation failed |
| 401  | Unauthorized - Invalid credentials |
| 403  | Forbidden - Access denied |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## 📊 Status Codes

- **200**: OK
- **201**: Created
- **204**: No Content
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error

## 🔍 Testing

### Swagger UI
Acesse a documentação interativa em:
```
http://localhost:3000/api
```

### Postman Collection
Importe a collection disponível em `/docs/postman/`

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch","amount":25.50,"category":"Food","date":"2024-01-15"}'
```

## 🔒 Security Headers

A API retorna os seguintes headers de segurança:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## 📈 Monitoring

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Bifröst Education Platform API is running",
  "version": "1.0.0"
}
```

### Metrics
- Response times
- Error rates
- Request counts
- Database connection status

---

Para mais detalhes, consulte a [documentação Swagger](http://localhost:3000/api) ou entre em contato conosco.