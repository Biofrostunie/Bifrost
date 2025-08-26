# 🏦 Bifröst Education Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Uma plataforma completa de educação financeira e rastreamento de despesas construída com **NestJS**, **Prisma**, **PostgreSQL**, **Redis** e **Docker**.

---

## 📑 TL;DR (Resumo Rápido)

```bash
# Clone o projeto
git clone <repository-url>
cd backend-bifrost

# Copie e edite o .env
docker-compose up -d

# Acesse: http://localhost:3000/api (Swagger)
```

---

## 🧭 Navegação Rápida

- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#️-instalação-e-configuração)
- [Execução com Docker](#-execução-com-docker-recomendado)
- [Desenvolvimento Local](#-desenvolvimento-local)
- [Documentação da API](#-documentação-da-api)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Segurança](#-segurança)
- [Configuração de E-mail](#-configuração-de-e-mail)
- [Geração de PDF](#-geração-de-pdf)
- [Deploy em Produção](#-deploy-em-produção)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Suporte](#-suporte)

---

## 🚀 Funcionalidades

### 🔐 **Autenticação Completa**

- Registro de usuários com validação de e-mail
- Login seguro com JWT
- Confirmação de conta via e-mail
- Recuperação de senha com código de 5 dígitos
- Proteção de rotas com guards e rate limiting

### 👤 **Gestão de Usuários**

- CRUD completo de usuários
- Atualização individual de campos (nome, e-mail, telefone, endereço)
- Perfil financeiro (renda mensal, objetivos, tolerância ao risco)
- Exclusão de conta

### 💰 **Controle Financeiro**

- Rastreamento de despesas e receitas
- Categorização automática
- Filtros avançados por data, categoria e tipo
- Relatórios em PDF personalizados
- Simulações de investimento

### 📈 **Taxas de Investimento**

- Consulta em tempo real das principais taxas brasileiras
- **SELIC**: Taxa meta definida pelo Copom
- **IPCA**: Índice de inflação oficial
- **Poupança**: Taxa da poupança diária
- **CDI**: Taxa do CDI diário
- Cache inteligente com Redis (1 hora)
- Integração direta com API do Banco Central
- Resposta padronizada com todas as taxas

### 📊 **Relatórios e Analytics**

- Geração de PDF com Puppeteer
- Templates HTML responsivos
- Gráficos e estatísticas detalhadas
- Exportação via tRPC

### 🎓 **Conteúdo Educacional**

- Conceitos financeiros categorizados
- Níveis de dificuldade

### 🔧 **Tecnologias e Arquitetura**

- **Backend**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **API**: REST + tRPC para comunicação tipada
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker + Docker Compose
- **Cache e Performance**: Redis (cache, rate limiting, sessões)
- **Testes**: Jest (unitários, integração e carga)
- **E-mail**: SMTP configurável
- **PDF**: Puppeteer para relatórios
- **Integração com APIs externas:** consulta de taxas do Banco Central

---

## 📋 Pré-requisitos

- **Node.js** 18+
- **Docker** e **Docker Compose**
- **PostgreSQL** (ou usar via Docker)

---

## 🛠️ Instalação e Configuração

### 1. **Clone o Repositório**

```bash
git clone <repository-url>
cd backend-bifrost
```

### 2. **Configuração do Ambiente**

```bash
cp .env.example .env
# Edite as variáveis obrigatórias no .env
```

### 3. **Variáveis de Ambiente Obrigatórias**

> Mantenha o arquivo `.env.example` sempre atualizado!

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/financial_education_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Application
NODE_ENV="development"
PORT=3000
LOG_LEVEL="debug"

# SMTP Configuration (OBRIGATÓRIO)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="noreplybifrost@gmail.com"
SMTP_PASS="qfchctnvfmyulonn"
EMAIL_FROM="noreplybifrost@gmail.com"
EMAIL_FROM_NAME="Bifröst Education Platform"
```

---

## 🐳 Execução com Docker (Recomendado)

### **Iniciar todos os serviços**

```bash
docker-compose up -d
docker-compose logs -f backend
docker-compose down
```

### **Serviços Disponíveis**

- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 (cache)

---

## 🔧 Desenvolvimento Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio # (Opcional)
```

### 3. Executar em Modo Desenvolvimento

```bash
npm run start:dev
```

---

## 📚 Documentação da API

### **Endpoints Principais**

#### 🔐 Autenticação

```
POST /api/auth/register          # Registro de usuário
POST /api/auth/verify-email      # Verificação de e-mail
POST /api/auth/login             # Login
POST /api/auth/forgot-password   # Solicitar reset de senha
POST /api/auth/reset-password    # Redefinir senha
```

#### 👤 Usuários

```
GET  /api/users/profile          # Obter perfil
PUT  /api/users                  # Atualizar dados gerais
PUT  /api/users/name             # Atualizar nome
PUT  /api/users/email            # Atualizar e-mail
PUT  /api/users/phone            # Atualizar telefone
PUT  /api/users/address          # Atualizar endereço
DELETE /api/users                # Excluir conta
```

#### 💰 Despesas

```
GET  /api/expenses               # Listar despesas
POST /api/expenses               # Criar despesa
GET  /api/expenses/report/pdf    # Gerar relatório PDF
PUT  /api/expenses/:id           # Atualizar despesa
DELETE /api/expenses/:id         # Excluir despesa
```

#### 📊 Simulações de Investimento

```
GET  /api/investment-simulations              # Listar simulações
POST /api/investment-simulations/calculate    # Calcular investimento
POST /api/investment-simulations              # Criar simulação
GET  /api/investment-simulations/:id/calculate # Simulação com cálculo
```

#### 📈 Taxas de Investimento

```
GET  /api/investment-rates                    # Obter todas as taxas (SELIC, IPCA, Poupança, CDI)
```

### **📖 Swagger Documentation**

Acesse: http://localhost:3000/api

### **🔧 tRPC Endpoint**

Acesse: http://localhost:3000/trpc

### **🧪 Testando o Endpoint de Taxas**

```bash
# Teste via curl
curl -X GET "http://localhost:3000/api/investment-rates" \
  -H "Content-Type: application/json"

# Teste via Swagger
# Acesse: http://localhost:3000/api
# Procure por "investment-rates" e teste o endpoint GET
```

---

## 🔑 Fluxo de Autenticação

- Utiliza JWT para autenticação stateless
- Guards protegem rotas sensíveis
- Estratégias Passport (local, JWT)
- Rate limiting via Redis para segurança
- Recuperação e confirmação de conta por e-mail

## ⚡ Sobre tRPC

- Comunicação tipada entre backend e frontend
- Permite queries e mutations seguras
- Ideal para integração com frontends modernos (React, Next.js, etc)

## 📈 Taxas de Investimento

### **Funcionalidades**

- **Consulta em Tempo Real**: Integração direta com API do Banco Central
- **Taxas Disponíveis**:
  - **SELIC** (Código 4189): Taxa meta definida pelo Copom
  - **IPCA** (Código 433): Índice de inflação oficial
  - **Poupança** (Código 196): Taxa da poupança diária
  - **CDI** (Código 12): Taxa do CDI diário

### **Arquitetura SOLID**

- **Single Responsibility**: Cada classe tem responsabilidade única
- **Open/Closed**: Configuração centralizada para adicionar novas séries
- **Dependency Inversion**: Injeção de dependências via interfaces
- **Interface Segregation**: Interfaces específicas para cada necessidade

### **Cache Inteligente**

- **TTL**: 1 hora (3600 segundos)
- **Chaves**: `investment_rates:{tipo_taxa}`
- **Benefícios**: Performance, redução de carga no BCB, disponibilidade

## 🚦 Redis: Cache e Rate Limiting

- Cache de respostas para endpoints críticos
- Rate limiting para evitar abusos
- Armazenamento de sessões temporárias

---

## 🧪 Testes

- **Testes Unitários:**
  ```bash
  npm run test
  ```
- **Testes de Integração (E2E):**
  ```bash
  npm run test:e2e
  ```
- **Testes de Carga:**
  ```bash
  npm run test:load
  ```
- **Cobertura de Testes:**
  ```bash
  npm run test:cov
  ```

Arquivos de teste ficam em `test/` e `src/**/services/*.spec.ts`.

---

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação (login, registro, guards, estratégias)
├── users/                   # Usuários (CRUD, perfil, atualização)
├── expenses/                # Despesas (CRUD, relatórios, filtros)
├── incomes/                 # Receitas (CRUD)
├── investment-simulations/  # Simulações de investimento
├── investment-rates/        # Taxas de investimento (SELIC, IPCA, Poupança, CDI)
├── financial-concepts/      # Conteúdo educacional financeiro
├── common/                  # Serviços compartilhados (e-mail, PDF, filtros, interceptors)
├── trpc/                    # Configuração e rotas tRPC
├── prisma/                  # Integração com banco de dados Prisma
├── redis/                   # Serviços de cache, rate limiting e sessões
└── main.ts                  # Bootstrap da aplicação
```

---

## 🔒 Segurança

- JWT para autenticação
- Bcrypt para hash de senhas
- Rate limiting com Redis
- Validação robusta com class-validator
- Sanitização de dados sensíveis
- Guards para proteção de rotas

---

## 📧 Configuração de E-mail

O sistema utiliza SMTP para envio de e-mails. Configure as credenciais no arquivo `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="noreplybifrost@gmail.com"
SMTP_PASS="qfchctnvfmyulonn"
EMAIL_FROM="noreplybifrost@gmail.com"
EMAIL_FROM_NAME="Bifröst Education Platform"
FRONTEND_URL="http://192.168.0.132:8080"
```

---

## 📄 Geração de PDF

- Relatórios PDF de despesas usando **Puppeteer**
- Templates HTML responsivos
- Gráficos e estatísticas
- Download via endpoint REST ou tRPC (base64)

---

## 🚀 Deploy em Produção

### 1. Configurar Variáveis de Ambiente

```bash
NODE_ENV=production
JWT_SECRET="your-super-strong-production-secret"
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_HOST=localhost
REDIS_PASSWORD=algumasenhaboa
REDIS_KEY_PREFIX=bifrost:
```

### 2. Build e Deploy

```bash
npm run build
npm run prisma:deploy
npm run start:prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte & Comunidade

- Email: noreplybifrost@gmail.com
- Contribua, sugira melhorias ou reporte bugs!

---

**Desenvolvido com ❤️ pela equipe Bifröst Education Platform**
