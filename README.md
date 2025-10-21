
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
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Swagger: http://localhost:3000/api-docs

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

A documentação da API está disponível através do Swagger UI:
- Local: http://localhost:3000/api-docs
- Produção: https://api.bifrost.com/api-docs

## 🧪 Testes

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

Desenvolvido como Trabalho de Conclusão de Curso (TCC) na PUCRS.
