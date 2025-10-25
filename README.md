
# 🌈 Bifrost - Sistema de Educação e Gestão Financeira

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 👨‍🎓 Alunos
- Daniel Debastiani - 2210875
- Luis Felipe Borges Rosa - 2211829
- Lucas Oliveira Santiago - 2210370
- Matheus de Paula Costa Cavalcante - 2210950

## 📋 Índice
- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação da API](#-documentação-da-api)
- [Testes](#-testes)
- [Contribuição](#-contribuição)

## 🔍 Visão Geral

Bifrost é uma aplicação web moderna desenvolvida para educação financeira e gestão pessoal de finanças. O sistema permite que usuários gerenciem suas finanças pessoais, aprendam conceitos financeiros importantes e realizem simulações de investimentos.

A plataforma é composta por um frontend moderno em React com TypeScript e um backend robusto em NestJS, oferecendo uma experiência completa para controle financeiro pessoal e educação financeira.

## 🚀 Funcionalidades

### 🔐 Autenticação e Gerenciamento de Usuários
- Cadastro de novos usuários com validação de e-mail
- Login seguro com JWT
- Recuperação de senha com código de 5 dígitos
- Visualização e edição de perfil
- Proteção de rotas com guards e rate limiting

### 💰 Gestão Financeira
- Registro de receitas com categorias personalizáveis
- Registro de despesas com categorias personalizáveis
- Visualização de saldo atual
- Cálculo dinâmico de balanço financeiro
- Relatórios em PDF personalizados
- Filtros avançados por data, categoria e tipo

### 🎓 Educação Financeira
- Biblioteca de conceitos financeiros categorizados
- Filtro e busca de conteúdo educacional
- Visualização detalhada de conceitos financeiros
- Níveis de dificuldade para diferentes perfis de usuário
- Dicas práticas para gestão financeira

### 📊 Simulação de Investimentos
- Cálculo de rendimentos baseados em diferentes parâmetros
- Visualização gráfica de projeções
- Comparação entre diferentes estratégias de investimento
- Taxas de investimento atualizadas (SELIC, IPCA, Poupança, CDI)

### 📈 Dashboard
- Resumo visual da situação financeira atual
- Indicadores de saúde financeira
- Gráficos e métricas de desempenho
- Exportação de dados

## 🏗 Arquitetura

O projeto Bifrost segue uma arquitetura moderna de aplicação web:

```
Bifrost/
├── frontend/       # Aplicação React (Cliente)
└── backend/        # API NestJS (Servidor)
```

### Fluxo de Dados
1. **Frontend**: Interface de usuário React que consome a API
2. **Backend**: API REST + tRPC que processa requisições e gerencia dados
3. **Banco de Dados**: PostgreSQL para armazenamento persistente
4. **Cache**: Redis para melhorar performance e gerenciar sessões

## 💻 Tecnologias

### Frontend
- **Framework**: React com TypeScript
- **Build Tool**: Vite
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: TanStack React Query
- **UI Components**: shadcn-ui
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod

### Backend
- **Framework**: NestJS com TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **API**: REST + tRPC
- **Autenticação**: JWT
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker + Docker Compose
- **Geração de PDF**: Puppeteer
- **Testes**: Jest

## 📁 Estrutura do Projeto

### Frontend
```
frontend/
├── src/                    # Código fonte da aplicação
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/             # Componentes de UI básicos (shadcn)
│   │   └── ...             # Outros componentes da aplicação
│   ├── hooks/              # Hooks personalizados
│   ├── lib/                # Utilitários e funções auxiliares
│   ├── pages/              # Componentes de página
│   ├── data/               # Dados estáticos ou mock
│   ├── types/              # Definições de tipos TypeScript
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Ponto de entrada
└── public/                 # Arquivos públicos estáticos
```

### Backend
```
backend/
├── src/                    # Código fonte da aplicação
│   ├── auth/               # Módulo de autenticação
│   ├── users/              # Módulo de usuários
│   ├── expenses/           # Módulo de despesas
│   ├── incomes/            # Módulo de receitas
│   ├── financial-concepts/ # Módulo de conceitos financeiros
│   ├── investment-rates/   # Módulo de taxas de investimento
│   ├── investment-simulations/ # Módulo de simulações
│   ├── common/             # Utilitários e helpers
│   ├── prisma/             # Serviço e configuração do Prisma
│   ├── redis/              # Serviço e configuração do Redis
│   ├── trpc/               # Configuração do tRPC
│   └── main.ts             # Ponto de entrada da aplicação
├── prisma/                 # Schema e migrações do Prisma
│   ├── migrations/         # Migrações do banco de dados
│   └── schema.prisma       # Schema do banco de dados
└── test/                   # Testes automatizados
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose
- Git

### Instalação Rápida (com Docker)
```bash
# Clone o repositório
git clone https://github.com/Biofrostunie/Bifrost
cd Bifrost

# Inicie os containers
docker-compose up -d
```

Acesse:
- Frontend: http://localhost:8080/
- Backend API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api

### Instalação Manual

#### Backend
```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco de dados
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run start:dev
```

#### Frontend
```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🛠 Desenvolvimento

### Comandos Úteis - Backend
```bash
# Desenvolvimento
npm run start:dev

# Build de produção
npm run build

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Testes de carga
npm run test:load

# Gerar migrações do Prisma
npx prisma migrate dev --name nome_da_migracao

# Gerar cliente Prisma
npx prisma generate
```

### Comandos Úteis - Frontend
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 📚 Documentação da API

A API segue o padrão REST com versionamento via URI.

- Base URL: `http://localhost:3000/api/v1`
- Prefixo global: `api`
- Versão padrão: `v1` (URI)
- Swagger UI: `http://localhost:3000/api` (com persistência de autorização)
- Autenticação: JWT (`Authorization: Bearer <token>`) extraído do header
- Respostas: envelope padrão via `TransformInterceptor` (`{ data, message, ... }`)
- Erros: tratados por `HttpExceptionFilter` com mensagens e status apropriados

### Endpoints principais
- `POST /api/v1/auth/login` — retorna `access_token` e dados do usuário
- `POST /api/v1/auth/register` — cria conta (não loga automaticamente)
- `GET /api/v1/users/profile` — perfil do usuário autenticado
- `GET /api/v1/expenses` — lista despesas com filtros (`startDate`, `endDate`, `category`, `essential`)
- `GET /api/v1/expenses/report/pdf` — gera e retorna PDF de relatório de despesas
  - Headers: `Accept: application/pdf`, `Authorization: Bearer <token>`
  - Query: `startDate`, `endDate` (ISO `YYYY-MM-DD`)

### Cabeçalhos e cache
- CORS liberado para origens de desenvolvimento
- Headers expostos: `Content-Disposition`, `X-Request-ID`, etc.
- Cache (Redis) habilitado em algumas rotas; chaves incluem usuário e filtros

---

## 🧠 Backend (NestJS) — Guia Completo

### Módulos e responsabilidades
- `auth` — login, registro, verificação de email, JWT, guards
- `users` — perfil e atualização de dados do usuário
- `expenses` — CRUD de despesas e geração de relatório PDF (via `pdf.service`)
- `incomes` — CRUD de receitas
- `financial-concepts` — conteúdos educacionais com seeds
- `investment-rates` — consulta de taxas externas (SELIC, CDI, etc.)
- `investment-simulations` — cálculos e simulações
- `redis` — serviço de cache e verificação de saúde
- `prisma` — ORM e operações com banco PostgreSQL
- `trpc` — integração tRPC

### Variáveis de ambiente (exemplos)
- `PORT=3000`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://user:pass@localhost:5432/bifrost`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=uma_chave_segura`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (se aplicável)

### PDF (Puppeteer)
- Serviço: `pdf.service.ts`
- Geração por HTML renderizado em Chromium headless
- Retorno via `application/pdf` e `Content-Disposition`
- Tratamento de erros detalhado e logs

### Banco de Dados
- Prisma com migrações em `backend/prisma/migrations`
- Seeds para conceitos financeiros em `backend/prisma/financial-concepts-seed.ts`

### Execução
- Desenvolvimento: `npm run start:dev`
- Testes: `npm run test`, `npm run test:e2e`, `npm run test:load`
- Build: `npm run build`

Para detalhes, consulte `backend/README.md`.

---

## 🎨 Frontend (React + Vite) — Guia Completo

### Ambiente e configuração
- Porta de desenvolvimento: `8080` (definida em `vite.config.ts`)
- Variáveis: `VITE_API_URL` (ex.: `http://localhost:3000/api/v1`)
- Alias de paths: `@` apontando para `src/`

### Bibliotecas
- UI: shadcn-ui, Tailwind CSS, Lucide
- Estado e requisições: TanStack React Query
- Formulários: React Hook Form + Zod
- Gráficos: Recharts

### Consumo de API
- Helper `apiFetch` em `src/lib/api.ts`
  - Prepend `API_BASE_URL`
  - Headers JSON e `Authorization` quando `token` é fornecido
  - Retorna objeto já parseado (Promise resolve para JSON). Não use `.json()` no retorno.
  - Envelope `{ success, data }` aplicado por interceptor. Para endpoints como `/investment-rates`, acesse `resp.data` (ou `resp.data.data` quando houver duplo envelope).
  - Exemplo:
    ```ts
    const resp = await apiFetch('/investment-rates');
    const rates = Array.isArray(resp?.data) ? resp.data : resp?.data?.data ?? [];
    ```
  - Notas de domínio:
    - SELIC (série 4189 – meta do Copom) é taxa anual.
    - CDI é diário; para anualizar em exibição, multiplica-se por `252`.
- Exemplo de chamada autenticada (PDF):
  - `GET {API_BASE_URL}/expenses/report/pdf?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - Headers: `Accept: application/pdf`, `Authorization: Bearer <token>`

### Autenticação
- Store `authStore` salva `token` em `localStorage` (`token`)
- `userStore` lê `token` e busca `/users/profile`

### Execução
- Desenvolvimento: `npm run dev` → `http://localhost:8080/`
  - Em Windows, caso scripts `npm` estejam bloqueados pela política de execução do PowerShell, iniciar com: `node node_modules/vite/bin/vite.js --port 8080`.
- Build: `npm run build`
- Preview: `npm run preview`

Para detalhes, consulte `frontend/README.md`.

---

## 🔗 Referências
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- API (Swagger): `http://localhost:3000/api`

### Backend
O backend inclui testes unitários, de integração e de carga:
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Testes de carga
npm run test:load
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

Desenvolvido como Projeto Final de Curso (PFC) na UniEVANGÉLICA.
