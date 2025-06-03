# Bifrost - Sistema de Educação e Gestão Financeira

##Alunos

- Daniel Debastiani - 2210875
- Luis Felipe Borges Rosa - 2211829
- Lucas Oliveira Santiago - 2210370
- Matheus de Paula Costa Cavalcante - 2210950

## Visão Geral

Bifrost é uma aplicação web moderna desenvolvida para educação financeira e gestão pessoal de finanças. O sistema permite que usuários gerenciem suas finanças pessoais, aprendam conceitos financeiros importantes e realizem simulações de investimentos.

## Requisitos Funcionais

1. **Autenticação e Gerenciamento de Usuários**

   - Cadastro de novos usuários
   - Login de usuários
   - Recuperação de senha
   - Visualização e edição de perfil

2. **Gestão Financeira**

   - Registro de receitas com categorias personalizáveis
   - Registro de despesas com categorias personalizáveis
   - Visualização de saldo atual
   - Cálculo dinâmico de balanço financeiro

3. **Educação Financeira**

   - Biblioteca de conceitos financeiros
   - Filtro e busca de conteúdo educacional
   - Visualização detalhada de conceitos financeiros
   - Input personalizado de dados financeiros do usuário

4. **Simulação de Investimentos**

   - Cálculo de rendimentos baseados em diferentes parâmetros
   - Visualização gráfica de projeções
   - Comparação entre diferentes estratégias de investimento

5. **Dashboard**
   - Resumo visual da situação financeira atual
   - Indicadores de saúde financeira
   - Gráficos e métricas de desempenho

## Requisitos Não Funcionais

1. **Performance**

   - Tempo de resposta menor que 1 segundo para operações regulares
   - Otimização para dispositivos móveis e desktop

2. **Usabilidade**

   - Interface responsiva para diferentes tamanhos de tela
   - Design acessível e intuitivo
   - Feedback visual para ações do usuário

3. **Segurança**

   - Autenticação segura de usuários
   - Proteção de rotas para usuários não autenticados
   - Validação de entradas para prevenção de injeções

4. **Manutenibilidade**

   - Código modular com componentes reutilizáveis
   - Padrões de design consistentes
   - Documentação de código

5. **Escalabilidade**
   - Arquitetura que permite crescimento do número de usuários
   - Estrutura para adição de novos recursos

## Tecnologias Utilizadas

- **Frontend**
  - Vite
  - TypeScript
  - React
  - React Router DOM
  - TanStack React Query
  - shadcn-ui
  - Tailwind CSS
  - Lucide React (ícones)
  - Recharts (visualização de dados)

## Estrutura do Projeto

```
bifrost/
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

## Componentes Principais

### Componentes de Layout

- **AppLayout**: Layout principal da aplicação com navegação desktop/mobile
- **Header**: Cabeçalho com título da página e configurações
- **DesktopNavigation**: Menu de navegação para desktop
- **BottomNavigation**: Menu de navegação para dispositivos móveis

### Componentes de Página

- **Login**: Autenticação de usuários
- **CreateAccount**: Registro de novos usuários
- **PasswordRecovery**: Recuperação de senha
- **Home**: Dashboard principal
- **FinancialEducation**: Página de educação financeira
- **ExpenseCalculator**: Calculadora de despesas
- **InvestmentCalculator**: Simulador de investimentos
- **KnowledgeBase**: Base de conhecimento financeiro

### Componentes de Finança

- **FinancialSummary**: Resumo da situação financeira do usuário
- **IncomeForm**: Formulário para adição de receitas
- **IncomeList**: Lista de receitas cadastradas
- **ExpenseForm**: Formulário para adição de despesas
- **ExpenseList**: Lista de despesas cadastradas
- **FinancialIndicator**: Indicadores visuais de métricas financeiras

### Componentes de UI

- Componentes baseados em shadcn-ui como Button, Card, Input, etc.
- Componentes customizados para visualização de dados financeiros

## Fluxos de Dados

1. **Autenticação**:
   - Usuário fornece credenciais -> Validação -> Armazenamento de token -> Redirecionamento para Home
2. **Gestão Financeira**:

   - Usuário registra transação -> Atualização de estado -> Recálculo de saldo -> Atualização de UI

3. **Educação Financeira**:

   - Carregamento de conceitos -> Filtro/Busca -> Exibição de detalhes

4. **Simulação de Investimentos**:
   - Input de parâmetros -> Cálculos -> Geração de gráficos -> Exibição de resultados

## Considerações Técnicas

1. **Gerenciamento de Estado**:

   - Estados locais com React useState
   - Estados globais com contextos quando necessário
   - Gerenciamento de cache e requisições com TanStack Query

2. **Roteamento**:

   - Gerenciamento de rotas com React Router DOM
   - Proteção de rotas com componente ProtectedRoute

3. **Estilização**:

   - Uso extensivo de Tailwind CSS para estilos responsivos
   - Componentes shadcn-ui para interfaces consistentes
   - Tema com suporte a modo claro/escuro

4. **Otimização**:

   - Memoização de componentes com React.memo onde apropriado
   - Lazy loading de rotas menos frequentes
   - Uso de imagens otimizadas e carregamento eficiente

5. **Validação**:
   - Validação de formulários com React Hook Form
   - Validação de esquemas com Zod

## Instalação e Desenvolvimento

Para iniciar o desenvolvimento do projeto frontend:

```sh
# Clonar o repositório
git clone https://github.com/Biofrostunie/Bifrost
cd Bifrost

#Acessar o frontend

cd frontend

# Instalar dependências
npm i

# Iniciar servidor de desenvolvimento
npm run dev
```

## Build e Deploy

Para construir a aplicação para produção:

```sh
# Gerar build de produção
npm run build

# Visualizar build localmente
npm run preview
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
