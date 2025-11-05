import { useEffect, useState } from "react";
import { X, ArrowRight, ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  arrow: "right" | "down" | "left" | "up";
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  // Quando verdadeiro, ao avançar o passo disparamos um clique no alvo
  autoClick?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    target: "[data-tutorial='desktop-sidebar']",
    title: "Menu de Navegação",
    description: "Use este menu lateral para navegar entre as diferentes ferramentas do aplicativo.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
  },
  {
    target: "[data-tutorial='mobile-nav']",
    title: "Menu de Navegação",
    description: "Use este menu inferior para navegar entre as ferramentas do aplicativo.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
  },
  {
    target: "[data-tutorial='profile']",
    title: "Seu Perfil",
    description: "Aqui você visualiza suas informações e seu perfil de investidor definido.",
    position: "bottom",
    arrow: "down",
  },
  {
    target: "[data-tutorial='sidebar-expense']",
    title: "Calculadora de Gastos",
    description: "Acesse a Calculadora de Gastos pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='mobile-expense']",
    title: "Calculadora de Gastos",
    description: "No mobile, use o menu inferior para acessar Gastos.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
    autoClick: true,
  },
  {
    // Removido passo duplicado de acesso via Dashboard
    // (navegação ocorre pelos menus desktop/mobile)
    target: "[data-tutorial='expense-calculator']",
    title: "Como usar a Calculadora",
    description: "Adicione despesas no formulário; acompanhe a lista e o resumo gráfico para visualizar seus gastos.",
    position: "top",
    arrow: "down",
  },
  // Imediatamente após a calculadora, navegar para investimentos e explicar
  {
    target: "[data-tutorial='sidebar-investment']",
    title: "Simulador de Investimentos",
    description: "No desktop, acesse o simulador pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='mobile-investment']",
    title: "Simulador de Investimentos",
    description: "No mobile, use o menu inferior para acessar Investir.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='investment-simulator']",
    title: "Como usar o Simulador",
    description: "Ajuste valores, taxas e período; visualize projeções e resultados com gráficos.",
    position: "top",
    arrow: "down",
  },
  // Continuação da sequência
  // Navegação para investimento será feita mais adiante
  {
    target: "[data-tutorial='sidebar-education']",
    title: "Educação Financeira",
    description: "No desktop, acesse Educação pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='mobile-education']",
    title: "Educação Financeira",
    description: "No mobile, use o menu inferior para acessar Educação.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='financial-education']",
    title: "Explorando Educação Financeira",
    description: "Veja indicadores (Selic, IPCA, CDI), recomendações e links úteis para aprendizado.",
    position: "top",
    arrow: "down",
  },
  {
    target: "[data-tutorial='sidebar-knowledge']",
    title: "Base de Conhecimento",
    description: "No desktop, acesse a Base pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='mobile-knowledge']",
    title: "Base de Conhecimento",
    description: "No mobile, use o menu inferior para acessar a Base.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='knowledge-base']",
    title: "Como usar a Base",
    description: "Busque e filtre conceitos. Abra cartões para ler guias e detalhes.",
    position: "bottom",
    arrow: "down",
  },
  {
    target: "[data-tutorial='sidebar-bank-account']",
    title: "Cadastro de Conta Bancária",
    description: "Acesse o cadastro de contas pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='bank-account-create']",
    title: "Preencha os dados da Conta",
    description: "Informe banco, tipo, saldo e moeda. Salve para cadastrar sua conta.",
    position: "top",
    arrow: "down",
  },
  {
    target: "[data-tutorial='sidebar-credit-card']",
    title: "Cadastro de Cartão de Crédito",
    description: "Acesse o cadastro de cartões pela barra lateral.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='credit-card-create']",
    title: "Preencha os dados do Cartão",
    description: "Defina emissor, dígitos finais, limite, datas e associe uma conta.",
    position: "top",
    arrow: "down",
  },
  // Voltar para o Dashboard para mostrar as dicas
  {
    target: "[data-tutorial='sidebar-home']",
    title: "Voltar ao Dashboard",
    description: "Clique para retornar à página inicial e ver as dicas.",
    position: "right",
    arrow: "right",
    desktopOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='mobile-home']",
    title: "Voltar ao Dashboard",
    description: "No mobile, use o ícone de Início para retornar.",
    position: "top",
    arrow: "up",
    mobileOnly: true,
    autoClick: true,
  },
  {
    target: "[data-tutorial='daily-tips']",
    title: "Dicas Financeiras",
    description: "Dicas que se atualizam periodicamente para melhorar sua saúde financeira.",
    position: "left",
    arrow: "right",
  },
];

interface AppTutorialProps {
  onComplete: () => void;
}

const AppTutorial = ({ onComplete }: AppTutorialProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if (!step) return;

    // Pular passo incompatível com o dispositivo
    if ((step.mobileOnly && !isMobile) || (step.desktopOnly && isMobile)) {
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        handleClose();
      }
      return;
    }

    // Garantir que elementos renderizaram
    const timeout = setTimeout(() => {
      updatePosition();
      setShow(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentStep, isMobile]);

  useEffect(() => {
    if (!show) return;
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [show, currentStep]);

  const updatePosition = () => {
    const step = tutorialSteps[currentStep];
    if (!step) return;
    const targetElement = document.querySelector(step.target) as HTMLElement | null;
    const cardWidth = 300;
    const cardHeight = 190;
    if (!targetElement) {
      // Fallback: centraliza o cartão e oculta highlight quando o alvo não existe
      setHighlightStyle({ top: 0, left: 0, width: 0, height: 0 });
      const top = window.innerHeight / 2 - cardHeight / 2;
      const left = window.innerWidth / 2 - cardWidth / 2;
      setPosition({ top, left });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    let top = 0;
    let left = 0;

    setHighlightStyle({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    // Dimensões do cartão
    // (mantidas para uso no cálculo)
    // const cardWidth = 300;
    // const cardHeight = 190;

    switch (step.position) {
      case "top":
        top = rect.top - cardHeight - 30;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + 30;
        left = rect.left + rect.width / 2 - cardWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.left - cardWidth - 30;
        break;
      case "right":
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.right + 30;
        break;
    }

    const padding = 16;
    if (left < padding) left = padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding;
    }

    setPosition({ top, left });
  };

  const handleNext = () => {
    // Se configurado, realiza um clique no elemento alvo para navegar
    try {
      const step = tutorialSteps[currentStep];
      if (step?.autoClick) {
        const el = document.querySelector(step.target) as HTMLElement | null;
        el?.click();
      }
    } catch {}

    if (currentStep < tutorialSteps.length - 1) {
      setShow(false);
      setTimeout(() => setCurrentStep((s) => s + 1), 200);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setShow(false);
      setTimeout(() => setCurrentStep((s) => s - 1), 200);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onComplete(), 200);
  };

  const step = tutorialSteps[currentStep];

  const ArrowIcon = () => {
    switch (step?.arrow) {
      case "right":
        return <ArrowRight className="h-5 w-5 text-finance-teal" />;
      case "left":
        return <ArrowLeft className="h-5 w-5 text-finance-teal" />;
      case "up":
        return <ArrowUp className="h-5 w-5 text-finance-teal" />;
      case "down":
      default:
        return <ArrowDown className="h-5 w-5 text-finance-teal" />;
    }
  };

  if (!step) return null;

  return (
    <>
      {/* Overlay com máscara e destaque */}
      <div className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} style={{ pointerEvents: show ? "auto" : "none" }}>
        <svg className="w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect x={highlightStyle.left} y={highlightStyle.top} width={highlightStyle.width} height={highlightStyle.height} rx={8} ry={8} fill="black" />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="#00000080" mask="url(#tutorial-mask)" />
        </svg>
      </div>

      {/* Borda ao redor do destaque */}
      {highlightStyle.width > 0 && highlightStyle.height > 0 && (
        <div
          className={`fixed z-[1001] transition-all duration-300 ${show ? "opacity-100" : "opacity-0"}`}
          style={{
            top: highlightStyle.top - 4,
            left: highlightStyle.left - 4,
            width: highlightStyle.width + 8,
            height: highlightStyle.height + 8,
            border: "2px solid #22c55e",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Cartão de instrução */}
      <Card
        className={`fixed z-[1002] w-[300px] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
        style={{ top: position.top, left: position.left }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-finance-dark dark:text-white">{step.title}</h3>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{step.description}</p>
          <div className="flex items-center gap-2 text-finance-teal mb-3">
            <ArrowIcon />
            <span className="text-xs">Siga a seta até o elemento destacado</span>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleSkip}>Pular</Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handlePrev} disabled={currentStep === 0}>Anterior</Button>
              <Button size="sm" onClick={handleNext}>{currentStep < tutorialSteps.length - 1 ? "Próximo" : "Concluir"}</Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AppTutorial;