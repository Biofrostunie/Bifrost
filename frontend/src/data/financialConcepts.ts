
import { FinancialConcept } from "@/types/FinancialConcept";

export const financialConcepts: FinancialConcept[] = [
  {
    id: "selic",
    title: "Tesouro Selic (LFT)",
    description: "A taxa básica de juros da economia brasileira",
    details: `A taxa Selic é a taxa básica de juros da economia brasileira, definida pelo Banco Central. Ela influencia todas as taxas de juros do país, como as taxas de empréstimos, financiamentos e aplicações financeiras.

A Selic é um instrumento de política monetária utilizado para controlar a inflação. Quando a inflação está alta, o Banco Central aumenta a Selic para desestimular o consumo e controlar os preços. Quando a inflação está baixa, o BC reduz a taxa para estimular a economia.

Investimentos atrelados à Selic, como o Tesouro Selic, tendem a acompanhar essa taxa de juros, sendo considerados investimentos seguros e de baixo risco.`,
    recommendations: [
      {
        title: "O que é a Taxa Selic e como ela afeta sua vida",
        url: "https://www.youtube.com/watch?v=WBNkhIaY7gc",
        platform: "youtube",
      },
      {
        title: "Como a Taxa Selic afeta seus investimentos",
        url: "https://www.youtube.com/watch?v=GgBfeGdGZdM",
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
    title: "IPCA (NTN-B Principal)",
    description: "Índice oficial de inflação no Brasil",
    details: `O IPCA (Índice Nacional de Preços ao Consumidor Amplo) é o índice oficial de inflação no Brasil, calculado pelo IBGE. Ele mede a variação de preços de produtos e serviços consumidos pelas famílias com rendimento entre 1 e 40 salários mínimos.

Investimentos atrelados ao IPCA, como o Tesouro IPCA+, oferecem proteção contra a inflação, pois garantem um retorno real acima da inflação medida pelo índice. Esses títulos pagam a variação do IPCA mais uma taxa de juros prefixada.`,
    recommendations: [
      {
        title: "O que é IPCA e como ele afeta seus investimentos",
        url: "https://www.youtube.com/watch?v=LLANnZaSdQ0",
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
    title: "IPCA + 6% (NTN-B Principal)",
    description: "Investimento que paga inflação mais juros fixos de 6% ao ano",
    details: `O investimento indexado ao "IPCA + 6%" oferece ao investidor um rendimento composto pela variação do IPCA (inflação oficial do Brasil) mais uma taxa fixa de 6% ao ano.

Esse tipo de investimento é muito interessante para a proteção do poder de compra, já que garante um ganho real (acima da inflação) de 6% ao ano. Os títulos do Tesouro Direto indexados ao IPCA (Tesouro IPCA+) funcionam dessa forma, embora a taxa fixa varie conforme as condições de mercado.

É considerado um investimento seguro e adequado para objetivos de médio a longo prazo, como aposentadoria ou reserva para estudos dos filhos.`,
    recommendations: [
      {
        title: "IPCA+: Vale a pena investir?",
        url: "https://www.youtube.com/shorts/0bCCXIYYmsQ",
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
        title: "O que é LCI o que precisa saber",
        url: "https://www.youtube.com/watch?v=Bz05weFEA1I",
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
        url: "https://www.youtube.com/watch?v=D7bBsf5tUXI",
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
        url: "https://www.youtube.com/watch?v=sdpc4Xv8ZeA&t=1s",
        platform: "youtube",
      },
      {
        title: "Os erros que você comete ao investir em Previdência Privada",
        url: "https://www.youtube.com/watch?v=uXENx87XQ10",
        platform: "youtube",
      }
    ],
    riskLevel: "Médio",
    expectedReturn: "Varia conforme o tipo de plano",
    timeframe: "Longo prazo",
    type: "retirement"
  },
  {
    id: "ibovespa",
    title: "IBOVESPA",
    description: "O principal índice de desempenho médio das cotações das ações negociadas na bolsa de valores do Brasil",
    details: `O Ibovespa é o principal indicador de desempenho das ações negociadas na B3 (Bolsa de Valores brasileira). Ele reúne as empresas mais negociadas e representa cerca de 80% do volume transacionado no mercado.

O índice é composto pelas ações com maior volume de negociações e é recalculado a cada quatro meses. Empresas como Petrobras, Vale, Itaú e Bradesco costumam ter peso significativo na composição do índice.

Investir no Ibovespa significa acompanhar o desempenho médio das principais empresas do país. Isso pode ser feito através de fundos de índice (ETFs) como o BOVA11, ou por meio de fundos de investimento que buscam replicar ou superar o índice.

Por envolver o mercado de ações, investimentos atrelados ao Ibovespa são considerados de risco mais elevado e maior volatilidade no curto prazo, mas com potencial de retornos maiores no longo prazo.`,
    recommendations: [
      {
        title: "O que é o Ibovespa e como investir",
        url: "https://www.youtube.com/watch?v=RAHjGxlP3G8",
        platform: "youtube",
      },
      {
        title: "Como funciona o ETF BOVA11",
        url: "https://www.youtube.com/shorts/Cvwk0z85qPY",
        platform: "youtube",
      }
    ],
    riskLevel: "Alto",
    expectedReturn: "Variável, historicamente superior à renda fixa no longo prazo",
    timeframe: "Longo prazo",
    type: "index"
  },

  {
    id: "emprestimo",
    title: "Empréstimo",
    description: "Empréstimo financeiro é um tipo de crédito, que se compromete a devolver esse valor em parcelas futuras",
    details: `O empréstimo financeiro é uma ferramenta de crédito essencial no mercado. Nele, uma instituição, como um banco ou uma cooperativa, disponibiliza um valor em dinheiro a uma pessoa física ou jurídica. Em contrapartida, quem recebe o dinheiro se compromete a devolvê-lo em parcelas pré-determinadas, que incluem o valor principal acrescido de juros e outras taxas.

O funcionamento básico envolve algumas etapas: primeiro, você solicita o crédito. Depois, a instituição faz uma análise de crédito para verificar sua capacidade de pagamento. Se tudo estiver certo, o empréstimo é aprovado e um contrato é assinado, detalhando todas as condições (valor, número de parcelas, taxa de juros, Custo Efetivo Total - CET, etc.). Só então o dinheiro é liberado. A partir daí, você inicia o pagamento das parcelas conforme o acordado até a quitação total da dívida.`,
    recommendations: [
      {
        title: "Quais os juros aplicados sobre as parcelas?",
        url: "https://www.youtube.com/watch?v=sAA8OPDFx00",
        platform: "youtube",
      },
      {
        title: "Empréstimo ou financiamento?",
        url: "https://www.youtube.com/watch?v=BzUf-ZaDbRY",
        platform: "youtube",
      }
    ],
    riskLevel: "Médio",
    expectedReturn: "Fixo(Para o credor), Custo(para o tomador)",
    timeframe: "Curto e Longo prazo",
    type: "debt"
  },

  {
    id: "financiamento",
    title: "Financiamento",
    description: "Financiamento é um empréstimo usado para comprar bens, pagos em parcelas, geralmente com o bem como garantia.",
    details: `O financiamento é uma modalidade de crédito essencial no mercado, projetada especificamente para a aquisição de bens de alto valor, como imóveis, veículos, ou até mesmo para investimentos em educação ou empresas. Basicamente, uma instituição financeira libera o valor necessário para a compra do bem, e você se compromete a devolver esse montante em parcelas regulares, acrescidas de juros e outras taxas, ao longo de um prazo determinado.

O processo de financiamento é similar ao de um empréstimo comum, mas com algumas particularidades: você solicita o crédito com a finalidade específica (a compra do bem), a instituição faz uma análise de crédito rigorosa e, muitas vezes, avalia o bem a ser financiado, já que ele servirá como garantia. Com a aprovação, um contrato detalhado é assinado, e o valor é liberado. A partir daí, você inicia o pagamento das parcelas até a quitação total da dívida.

Tabelas de Amortização: SAC e Price
Ao financiar, você se deparará com duas principais metodologias para calcular as parcelas: a Tabela SAC (Sistema de Amortização Constante) e a Tabela Price (Sistema Francês de Amortização). A escolha entre elas impacta diretamente o valor das parcelas e o montante total pago.`,
    recommendations: [
      {
        title: "TABELA SAC OU PRICE, Qual é o melhor?",
        url: "https://www.youtube.com/watch?v=JLCISOUEJSg",
        platform: "youtube",
      },
      {
        title: "Como quitar um financiamento de 30 anos em 3 anos",
        url: "https://www.youtube.com/watch?v=2kfNsNFOK6U",
        platform: "youtube",
      }
    ],
    riskLevel: "Médio",
    expectedReturn: "Retorno para a instituição financeira",
    timeframe: "Médio e Longo prazo",
    type: "debt"
  }
];
