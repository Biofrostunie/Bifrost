// Sistema de dicas financeiras com rotação temporal
export interface FinancialTip {
    id: string;
    content: string;
    category: 'daily' | 'weekly' | 'monthly';
  }
  
  export const dailyTips: FinancialTip[] = [
    {
      id: 'daily1',
      content: 'Guardar pelo menos 10% da sua renda mensal pode fazer uma grande diferença no longo prazo. Considere investir em títulos indexados ao CDI para proteger seu dinheiro da inflação.',
      category: 'daily'
    },
    {
      id: 'daily2',
      content: 'Antes de investir, quite suas dívidas de cartão de crédito. Os juros do cartão (até 400% ao ano) são muito maiores que qualquer rentabilidade de investimento.',
      category: 'daily'
    },
    {
      id: 'daily3',
      content: 'Diversifique seus investimentos. Não coloque todos os ovos na mesma cesta. Uma carteira balanceada reduz riscos e pode aumentar retornos.',
      category: 'daily'
    },
    {
      id: 'daily4',
      content: 'Tenha uma reserva de emergência equivalente a 6 meses de gastos. Mantenha em investimentos líquidos como CDB com liquidez diária.',
      category: 'daily'
    },
    {
      id: 'daily5',
      content: 'Acompanhe a taxa Selic. Ela influencia diretamente a rentabilidade dos seus investimentos em renda fixa e o custo do dinheiro no mercado.',
      category: 'daily'
    },
    {
      id: 'daily6',
      content: 'Invista regularmente, mesmo que seja pouco. R$ 50 mensais investidos a 12% ao ano se tornam R$ 46.000 em 20 anos devido aos juros compostos.',
      category: 'daily'
    },
    {
      id: 'daily7',
      content: 'Renda fixa não é só poupança. CDBs, LCIs, LCAs e Tesouro Direto oferecem rentabilidades superiores com segurança similar.',
      category: 'daily'
    },
    {
      id: 'daily8',
      content: 'Planeje seus gastos mensais. Use a regra 50-30-20: 50% necessidades, 30% desejos, 20% poupança e investimentos.',
      category: 'daily'
    },
    {
      id: 'daily9',
      content: 'Negocie taxas com seu banco. Tarifas de conta, cartão e investimentos podem ser reduzidas se você for um bom cliente.',
      category: 'daily'
    },
    {
      id: 'daily10',
      content: 'Estude antes de investir. Conhecimento é seu melhor ativo. Comece com investimentos simples e vá evoluindo gradualmente.',
      category: 'daily'
    }
  ];
  
  export const weeklyTips: FinancialTip[] = [
    {
      id: 'weekly1',
      content: 'Se você investir R$ 100 por mês com um rendimento médio de 10% ao ano, em 30 anos terá acumulado aproximadamente R$ 226.000.',
      category: 'weekly'
    },
    {
      id: 'weekly2',
      content: 'A regra dos 72 permite estimar em quantos anos seu dinheiro irá dobrar: basta dividir 72 pela taxa de juros anual. Ex: a 8% ao ano, seu dinheiro dobra em 9 anos.',
      category: 'weekly'
    },
    {
      id: 'weekly3',
      content: 'O Brasil já teve 8 moedas diferentes desde 1942: Cruzeiro, Cruzeiro Novo, Cruzeiro (2ª vez), Cruzado, Cruzado Novo, Cruzeiro (3ª vez), Cruzeiro Real e finalmente o Real em 1994.',
      category: 'weekly'
    },
    {
      id: 'weekly4',
      content: 'Warren Buffett, um dos maiores investidores do mundo, acumulou mais de 99% de sua fortuna depois dos 50 anos de idade.',
      category: 'weekly'
    },
    {
      id: 'weekly5',
      content: 'A primeira bolsa de valores do mundo foi criada em Amsterdam, na Holanda, em 1602.',
      category: 'weekly'
    },
    {
      id: 'weekly6',
      content: 'Apenas 3 em cada 10 brasileiros possuem algum tipo de investimento além da poupança, segundo dados da ANBIMA.',
      category: 'weekly'
    },
    {
      id: 'weekly7',
      content: 'Em 1980, a inflação no Brasil chegou a 110% ao ano. Em 1993, no auge da hiperinflação, chegou a incrível marca de 2.477%.',
      category: 'weekly'
    },
    {
      id: 'weekly8',
      content: 'O primeiro cartão de crédito foi criado em 1950 nos EUA. No Brasil, chegou em 1971 com o Diners Club.',
      category: 'weekly'
    },
    {
      id: 'weekly9',
      content: 'Albert Einstein supostamente disse que os juros compostos são a oitava maravilha do mundo. Quem entende, ganha. Quem não entende, paga.',
      category: 'weekly'
    },
    {
      id: 'weekly10',
      content: 'A maior nota já impressa no Brasil foi de 500.000 cruzeiros reais em 1993, durante o período de hiperinflação.',
      category: 'weekly'
    },
    {
      id: 'weekly11',
      content: 'O PIX foi lançado em 2020 e em apenas 2 anos se tornou o meio de pagamento instantâneo mais usado no mundo, com mais de 130 milhões de usuários.',
      category: 'weekly'
    },
    {
      id: 'weekly12',
      content: 'A poupança rende apenas 70% da Selic quando ela está acima de 8,5% ao ano. Quando está abaixo, rende 0,5% ao mês + TR.',
      category: 'weekly'
    }
  ];
  
  export const monthlyTips: FinancialTip[] = [
    {
      id: 'monthly1',
      content: 'Planeje seus gastos com sabedoria e garanta uma saúde financeira para o seu futuro. Uma boa gestão financeira hoje significa tranquilidade amanhã.',
      category: 'monthly'
    },
    {
      id: 'monthly2',
      content: 'Investir em educação financeira é o melhor investimento que você pode fazer. O conhecimento adquirido renderá dividendos por toda a vida e te ajudará a tomar decisões mais assertivas.',
      category: 'monthly'
    },
    {
      id: 'monthly3',
      content: 'Defina objetivos financeiros claros e mensuráveis. Seja comprar uma casa, viajar ou aposentadoria, ter metas específicas te ajuda a manter o foco e a disciplina nos investimentos.',
      category: 'monthly'
    },
    {
      id: 'monthly4',
      content: 'A disciplina é mais importante que a rentabilidade. É melhor investir R$ 100 todo mês a 8% ao ano do que R$ 500 esporadicamente a 15% ao ano.',
      category: 'monthly'
    },
    {
      id: 'monthly5',
      content: 'Revise periodicamente seus investimentos. O que era bom ontem pode não ser hoje. Mantenha-se atualizado sobre o mercado e ajuste sua estratégia conforme necessário.',
      category: 'monthly'
    },
    {
      id: 'monthly6',
      content: 'Prepare-se para a aposentadoria desde cedo. Quanto antes começar, menor será o valor mensal necessário para garantir uma aposentadoria confortável.',
      category: 'monthly'
    },
    {
      id: 'monthly7',
      content: 'Ensine educação financeira para seus filhos. Crianças que aprendem sobre dinheiro desde cedo se tornam adultos mais responsáveis financeiramente.',
      category: 'monthly'
    },
    {
      id: 'monthly8',
      content: 'Não deixe o emocional dominar suas decisões financeiras. Medo e ganância são os maiores inimigos dos investidores. Mantenha a racionalidade sempre.',
      category: 'monthly'
    }
  ];
  
  // Função para calcular qual dica mostrar baseado na data e intervalo
  export const getCurrentTip = (category: 'daily' | 'weekly' | 'monthly'): FinancialTip => {
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    
    let tips: FinancialTip[];
    let interval: number;
    
    switch (category) {
      case 'daily':
        tips = dailyTips;
        interval = 3; // A cada 3 dias
        break;
      case 'weekly':
        tips = weeklyTips;
        interval = 21; // A cada 3 semanas (21 dias)
        break;
      case 'monthly':
        tips = monthlyTips;
        interval = 45; // A cada 1 mês e meio (45 dias)
        break;
    }
    
    const index = Math.floor(daysSinceEpoch / interval) % tips.length;
    return tips[index];
  };