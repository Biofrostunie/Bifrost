
import { FinancialConcept } from "@/types/FinancialConcept";

export const financialConcepts: FinancialConcept[] = [
  {
    id: "selic",
    title: "Taxa Selic",
    description: "A taxa básica de juros da economia brasileira",
    details: `A taxa Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central. Ela influencia todas as taxas de juros do país, como as taxas de empréstimos, financiamentos e aplicações financeiras.

A Selic é um instrumento de política monetária utilizado para controlar a inflação. Quando a inflação está alta, o Banco Central aumenta a Selic para desestimular o consumo e controlar os preços. Quando a inflação está baixa, o BC reduz a taxa para estimular a economia.

Investimentos atrelados à Selic, como o Tesouro Selic, tendem a acompanhar essa taxa de juros, sendo considerados investimentos seguros e de baixo risco.`,
    recommendations: [
      {
        title: "O que é a Taxa Selic e como ela afeta sua vida",
        url: "https://www.youtube.com/watch?v=UDgpEwMzxbQ",
        platform: "youtube",
      },
      {
        title: "Como a Taxa Selic afeta seus investimentos",
        url: "https://www.youtube.com/watch?v=2h6QVtMxYJE",
        platform: "youtube",
      }
    ],
    riskLevel: "Baixo",
    expectedReturn: "Acompanha a taxa básica de juros",
    timeframe: "Curto a médio prazo",
    type: "fixedIncome"
  },
  {
    id: "ipca",
    title: "IPCA",
    description: "Índice oficial de inflação no Brasil",
    details: `O IPCA (Índice Nacional de Preços ao Consumidor Amplo) é o índice oficial de inflação no Brasil, calculado pelo IBGE. Ele mede a variação de preços de produtos e serviços consumidos pelas famílias com rendimento entre 1 e 40 salários mínimos.

Investimentos atrelados ao IPCA, como o Tesouro IPCA+, oferecem proteção contra a inflação, pois garantem um retorno real acima da inflação medida pelo índice. Esses títulos pagam a variação do IPCA mais uma taxa de juros prefixada.`,
    recommendations: [
      {
        title: "O que é IPCA e como ele afeta seus investimentos",
        url: "https://www.youtube.com/watch?v=L1HMZ2TU9LI",
        platform: "youtube",
      }
    ],
    riskLevel: "Baixo",
    expectedReturn: "Inflação + taxa prefixada",
    timeframe: "Médio a longo prazo",
    type: "fixedIncome"
  },
  {
    id: "ipca-plus-6",
    title: "IPCA + 6%",
    description: "Investimento que paga inflação mais juros fixos de 6% ao ano",
    details: `O investimento indexado ao "IPCA + 6%" oferece ao investidor um rendimento composto pela variação do IPCA (inflação oficial do Brasil) mais uma taxa fixa de 6% ao ano.

Esse tipo de investimento é muito interessante para a proteção do poder de compra, já que garante um ganho real (acima da inflação) de 6% ao ano. Os títulos do Tesouro Direto indexados ao IPCA (Tesouro IPCA+) funcionam dessa forma, embora a taxa fixa varie conforme as condições de mercado.

É considerado um investimento seguro e adequado para objetivos de médio a longo prazo, como aposentadoria ou reserva para estudos dos filhos.`,
    recommendations: [
      {
        title: "Tesouro IPCA+: Vale a pena investir?",
        url: "https://www.youtube.com/watch?v=bYQQvcF2xGk",
        platform: "youtube",
      }
    ],
    riskLevel: "Baixo",
    expectedReturn: "IPCA + 6% ao ano",
    timeframe: "Médio a longo prazo",
    type: "fixedIncome"
  },
  {
    id: "lci",
    title: "LCI - Letra de Crédito Imobiliário",
    description: "Investimento de renda fixa isento de Imposto de Renda",
    details: `A LCI (Letra de Crédito Imobiliário) é um título de renda fixa emitido por bancos para financiar o setor imobiliário. É um investimento considerado seguro por ser garantido pelo FGC (Fundo Garantidor de Créditos) até o limite de R$ 250 mil por CPF e instituição financeira.

Uma das principais vantagens da LCI é a isenção de Imposto de Renda para pessoas físicas, o que torna seu rendimento líquido mais atrativo comparado a outras aplicações de renda fixa.

As LCIs podem ter rentabilidade prefixada, pós-fixada (atrelada ao CDI) ou híbrida. Geralmente exigem um prazo mínimo de aplicação (carência), durante o qual o investidor não pode resgatar o valor investido.`,
    recommendations: [
      {
        title: "O que é LCI e como investir?",
        url: "https://www.youtube.com/watch?v=SNnwlSq2D_I",
        platform: "youtube",
      }
    ],
    riskLevel: "Baixo",
    expectedReturn: "90% a 100% do CDI",
    timeframe: "Médio prazo",
    type: "fixedIncome"
  },
  {
    id: "lca",
    title: "LCA - Letra de Crédito do Agronegócio",
    description: "Investimento de renda fixa isento de Imposto de Renda",
    details: `A LCA (Letra de Crédito do Agronegócio) é um título de renda fixa emitido por bancos para financiar o setor agrícola. Assim como a LCI, é garantida pelo FGC até R$ 250 mil por CPF e instituição financeira.

A principal vantagem da LCA é a isenção de Imposto de Renda para pessoas físicas. As LCAs podem ter rentabilidade prefixada, pós-fixada (geralmente atrelada ao CDI) ou híbrida.

Esse investimento costuma ter um prazo mínimo de aplicação (carência), durante o qual o dinheiro não pode ser resgatado. É uma boa opção para diversificação de carteira de investimentos de renda fixa.`,
    recommendations: [
      {
        title: "LCA: O que é e vale a pena investir?",
        url: "https://www.youtube.com/watch?v=BjfF9SYLLbA",
        platform: "youtube",
      }
    ],
    riskLevel: "Baixo",
    expectedReturn: "90% a 100% do CDI",
    timeframe: "Médio prazo",
    type: "fixedIncome"
  },
  {
    id: "previdencia-privada",
    title: "Previdência Privada",
    description: "Plano de aposentadoria complementar ao INSS",
    details: `A Previdência Privada é um investimento de longo prazo voltado para a aposentadoria, funcionando como um complemento à previdência social (INSS). Existem dois tipos principais: PGBL (Plano Gerador de Benefício Livre) e VGBL (Vida Gerador de Benefício Livre).

O PGBL é indicado para quem faz declaração completa do IR, permitindo deduzir até 12% da renda bruta anual tributável. Já o VGBL é mais adequado para quem faz declaração simplificada ou já deduz os 12% em outros investimentos.

A tributação pode ser regressiva (alíquotas que diminuem conforme o tempo de investimento) ou progressiva (alíquotas que variam conforme o valor resgatado). Importante analisar as taxas cobradas (administração, carregamento), pois podem consumir parte da rentabilidade.`,
    recommendations: [
      {
        title: "Previdência Privada vale a pena? PGBL ou VGBL?",
        url: "https://www.youtube.com/watch?v=Y1GxQXPDlTw",
        platform: "youtube",
      },
      {
        title: "Os erros que você comete ao investir em Previdência Privada",
        url: "https://www.youtube.com/watch?v=klViqHla9Yo",
        platform: "youtube",
      }
    ],
    riskLevel: "Médio", // Fixed here from "Baixo a Médio" to just "Médio"
    expectedReturn: "Varia conforme o tipo de plano",
    timeframe: "Longo prazo",
    type: "retirement"
  },
  {
    id: "ibovespa",
    title: "IBOVESPA",
    description: "O principal índice da bolsa de valores brasileira",
    details: `O Ibovespa é o principal indicador de desempenho das ações negociadas na B3 (Bolsa de Valores brasileira). Ele reúne as empresas mais negociadas e representa cerca de 80% do volume transacionado no mercado.

O índice é composto pelas ações com maior volume de negociações e é recalculado a cada quatro meses. Empresas como Petrobras, Vale, Itaú e Bradesco costumam ter peso significativo na composição do índice.

Investir no Ibovespa significa acompanhar o desempenho médio das principais empresas do país. Isso pode ser feito através de fundos de índice (ETFs) como o BOVA11, ou por meio de fundos de investimento que buscam replicar ou superar o índice.

Por envolver o mercado de ações, investimentos atrelados ao Ibovespa são considerados de risco mais elevado e maior volatilidade no curto prazo, mas com potencial de retornos maiores no longo prazo.`,
    recommendations: [
      {
        title: "O que é o Ibovespa e como investir",
        url: "https://www.youtube.com/watch?v=XCUEwKpOQjQ",
        platform: "youtube",
      },
      {
        title: "Como funciona o ETF BOVA11",
        url: "https://www.youtube.com/watch?v=vDTjiKkOlr0",
        platform: "youtube",
      }
    ],
    riskLevel: "Alto",
    expectedReturn: "Variável, historicamente superior à renda fixa no longo prazo",
    timeframe: "Longo prazo",
    type: "index"
  }
];
