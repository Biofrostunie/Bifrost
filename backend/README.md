# 🏦 Bifröst Education Platform

Uma plataforma completa de educação financeira e rastreamento de despesas construída com **NestJS**, **Prisma**, **PostgreSQL** e **Docker**.

## 🚀 Funcionalidades

### 🔐 **Autenticação Completa**
- ✅ Registro de usuários com validação de e-mail
- ✅ Login seguro com JWT
- ✅ Confirmação de conta via e-mail
- ✅ Recuperação de senha com código de 5 dígitos
- ✅ Proteção de rotas com guards

### 👤 **Gestão de Usuários**
- ✅ CRUD completo de usuários
- ✅ Atualização individual de campos (nome, e-mail, telefone, endereço)
- ✅ Perfil financeiro (renda mensal, objetivos, tolerância ao risco)
- ✅ Exclusão de conta

### 💰 **Controle Financeiro**
- ✅ Rastreamento de despesas e receitas
- ✅ Categorização automática
- ✅ Filtros avançados por data, categoria e tipo
- ✅ Relatórios em PDF personalizados
- ✅ Simulações de investimento

### 📊 **Relatórios e Analytics**
- ✅ Geração de PDF com Puppeteer
- ✅ Templates HTML responsivos
- ✅ Gráficos e estatísticas detalhadas
- ✅ Exportação via tRPC

### 🎓 **Conteúdo Educacional "Em fase de teste"**
- ✅ Conceitos financeiros categorizados
- ✅ Níveis de dificuldade
- ✅ Sistema de interações (curtir, salvar, visualizar)
- ✅ Recomendações personalizadas

### 🔧 **Tecnologias e Arquitetura**
- ✅ **Backend**: NestJS com TypeScript
- ✅ **Banco de Dados**: PostgreSQL com Prisma ORM
- ✅ **API**: REST + tRPC para comunicação tipada
- ✅ **Documentação**: Swagger/OpenAPI
- ✅ **Containerização**: Docker + Docker Compose
- ✅ **Cache E Performace**: Redis
- ✅ **Testes**: Jest (unitários, integração e carga)
- ✅ **E-mail**: SMTP configurável
- ✅ **PDF**: Puppeteer para relatórios

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **Docker** e **Docker Compose**
- **PostgreSQL** (ou usar via Docker)

## 🛠️ Instalação e Configuração

### 1. **Clone o Repositório**
```bash
git clone <repository-url>
cd financial-education-platform
```

### 2. **Configuração do Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis obrigatórias no .env
```

### 3. **Variáveis de Ambiente Obrigatórias**
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
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreplybifrost@gmail.com"
SMTP_PASS="qfchctnvfmyulonn"
EMAIL_FROM="noreplybifrost@gmail.com"
EMAIL_FROM_NAME="Bifröst Education Platform"
```

## 🐳 Execução com Docker (Recomendado)

### **Iniciar todos os serviços**
```bash
# Construir e iniciar todos os containers
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down
```

### **Serviços Disponíveis**
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 (cache)

## 🔧 Desenvolvimento Local

### **1. Instalar Dependências**
```bash
npm install
```

### **2. Configurar Banco de Dados**
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

### **3. Executar em Modo Desenvolvimento**
```bash
npm run start:dev
```

## 📚 Documentação da API

### **Endpoints Principais**

#### **🔐 Autenticação**
```
POST /api/auth/register          # Registro de usuário
POST /api/auth/verify-email      # Verificação de e-mail
POST /api/auth/login             # Login
POST /api/auth/forgot-password   # Solicitar reset de senha
POST /api/auth/reset-password    # Redefinir senha
```

#### **👤 Usuários**
```
GET  /api/users/profile          # Obter perfil
PUT  /api/users                  # Atualizar dados gerais
PUT  /api/users/name             # Atualizar nome
PUT  /api/users/email            # Atualizar e-mail
PUT  /api/users/phone            # Atualizar telefone
PUT  /api/users/address          # Atualizar endereço
DELETE /api/users                # Excluir conta
```

#### **💰 Despesas**
```
GET  /api/expenses               # Listar despesas
POST /api/expenses               # Criar despesa
GET  /api/expenses/report/pdf    # Gerar relatório PDF
PUT  /api/expenses/:id           # Atualizar despesa
DELETE /api/expenses/:id         # Excluir despesa
```

#### **📊 Simulações de Investimento**
```
GET  /api/investment-simulations              # Listar simulações
POST /api/investment-simulations/calculate    # Calcular investimento
POST /api/investment-simulations              # Criar simulação
GET  /api/investment-simulations/:id/calculate # Simulação com cálculo
```

### **📖 Swagger Documentation**
Acesse: http://localhost:3000/api

### **🔧 tRPC Endpoint**
Acesse: http://localhost:3000/trpc

## 🧪 Testes

### **Testes Unitários**
```bash
npm run test
```

### **Testes de Integração (E2E)**
```bash
npm run test:e2e
```

### **Testes de Carga**
```bash
npm run test:load
```

### **Cobertura de Testes**
```bash
npm run test:cov
```

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── controllers/         # Controllers REST
│   ├── services/           # Lógica de negócio
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Guards de autenticação
│   └── strategies/         # Estratégias Passport
├── users/                  # Módulo de usuários
├── expenses/               # Módulo de despesas
├── incomes/                # Módulo de receitas
├── investment-simulations/ # Módulo de simulações
├── financial-concepts/     # Módulo educacional
├── common/                 # Módulos compartilhados
│   ├── services/           # Serviços (Email, PDF)
│   ├── filters/            # Exception filters
│   ├── interceptors/       # Response interceptors
│   └── decorators/         # Decorators customizados
├── trpc/                   # Configuração tRPC
└── prisma/                 # Configuração Prisma
```

## 🔒 Segurança

- ✅ **JWT** para autenticação
- ✅ **Bcrypt** para hash de senhas
- ✅ **Rate limiting** configurado
- ✅ **Validação** robusta com class-validator
- ✅ **Sanitização** de dados sensíveis
- ✅ **Guards** para proteção de rotas

## 📧 Configuração de E-mail

O sistema utiliza SMTP para envio de e-mails. Configure as credenciais no arquivo `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreplybifrost@gmail.com"
SMTP_PASS="qfchctnvfmyulonn"
EMAIL_FROM="noreplybifrost@gmail.com"
EMAIL_FROM_NAME="Bifröst Education Platform"
```

## 📄 Geração de PDF

O sistema gera relatórios PDF das despesas usando **Puppeteer**:

- Templates HTML responsivos
- Gráficos e estatísticas
- Download via endpoint REST
- Disponível via tRPC (base64)

## 🚀 Deploy em Produção

### **1. Configurar Variáveis de Ambiente**
```bash
# Definir NODE_ENV como production
NODE_ENV=production

# Usar JWT_SECRET forte
JWT_SECRET="your-super-strong-production-secret"

# Configurar DATABASE_URL para produção
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### **2. Build e Deploy**
```bash
# Build da aplicação
npm run build

# Executar migrações
npm run prisma:deploy

# Iniciar em produção
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

## 🆘 Suporte

Para suporte, envie um e-mail para noreplybifrost@gmail.com ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ pela equipe Bifröst Education Platform**
