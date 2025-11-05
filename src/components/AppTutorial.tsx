import { useState, useEffect } from "react";
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
}

const tutorialSteps: TutorialStep[] = [
  {
    target: "[data-tutorial='desktop-sidebar']",
    title: "Menu de Navegação",
    description: "Use este menu lateral para navegar entre as diferentes ferramentas do aplicativo.",
    position: "right",
    arrow: "right",
    desktopOnly: true
  },
  {
    target: "[data-tutorial='mobile-nav']",
    title: "Menu de Navegação",
    description: "Use este menu inferior para navegar entre as ferramentas do aplicativo.",
    position: "top",
    arrow: "up",
    mobileOnly: true
  },
  {
    target: "[data-tutorial='profile']",
    title: "Seu Perfil",
    description: "Aqui você visualiza suas informações e seu perfil de investidor definido.",
    position: "bottom",
    arrow: "down"
  },
  {
    target: "[data-tutorial='expense-calculator']",
    title: "Calculadora de Gastos",
    description: "Registre e controle suas despesas mensais de forma organizada e visual.",
    position: "top",
    arrow: "down"
  },
  {
    target: "[data-tutorial='investment-simulator']",
    title: "Simulador de Investimentos",
    description: "Simule rendimentos de investimentos e defina metas financeiras personalizadas.",
    position: "top",
    arrow: "down"
  },
  {
    target: "[data-tutorial='financial-education']",
    title: "Educação Financeira",
    description: "Aprenda sobre indicadores econômicos e conceitos essenciais de finanças pessoais.",
    position: "top",
    arrow: "down"
  },
  {
    target: "[data-tutorial='knowledge-base']",
    title: "Base de Conhecimento",
    description: "Acesse artigos e guias sobre planejamento financeiro e investimentos.",
    position: "bottom",
    arrow: "down"
  },
  {
    target: "[data-tutorial='daily-tips']",
    title: "Dicas Financeiras",
    description: "Dicas que se atualizam periodicamente para melhorar sua saúde financeira.",
    position: "left",
    arrow: "right"
  }
];

interface AppTutorialProps {
  onComplete: () => void;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 190;

const AppTutorial = ({ onComplete }: AppTutorialProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState({ top: 0, left: 0, width: 0, height: 0, radius: 8 });

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if ((step.mobileOnly && !isMobile) || (step.desktopOnly && isMobile)) {
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        handleClose();
      }
      return;
    }

    const timer = setTimeout(() => {
      updatePosition();
      setShow(true);
    }, 350);

    const onResizeOrScroll = () => {
      updatePosition();
    };
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll);
    };
  }, [currentStep, isMobile]);

  const updatePosition = () => {
    const step = tutorialSteps[currentStep];
    const targetElement = document.querySelector(step.target) as HTMLElement | null;
    if (!targetElement) {
      // Fallback: centraliza o card se o alvo não existir
      const left = Math.max(20, (window.innerWidth - CARD_WIDTH) / 2);
      const top = Math.max(20, (window.innerHeight - CARD_HEIGHT) / 2);
      setHighlightStyle({ top: 0, left: 0, width: 0, height: 0, radius: 8 });
      setPosition({ top, left });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = 8;

    // Salvar dimensões do elemento destacado (com um pequeno padding)
    const hlTop = Math.max(0, rect.top - padding);
    const hlLeft = Math.max(0, rect.left - padding);
    const hlWidth = rect.width + padding * 2;
    const hlHeight = rect.height + padding * 2;

    setHighlightStyle({
      top: hlTop,
      left: hlLeft,
      width: hlWidth,
      height: hlHeight,
      radius: 10,
    });

    let top = 0;
    let left = 0;
    switch (step.position) {
      case "top":
        top = hlTop - CARD_HEIGHT - 24;
        left = hlLeft + hlWidth / 2 - CARD_WIDTH / 2;
        break;
      case "bottom":
        top = hlTop + hlHeight + 24;
        left = hlLeft + hlWidth / 2 - CARD_WIDTH / 2;
        break;
      case "left":
        top = hlTop + hlHeight / 2 - CARD_HEIGHT / 2;
        left = hlLeft - CARD_WIDTH - 24;
        break;
      case "right":
        top = hlTop + hlHeight / 2 - CARD_HEIGHT / 2;
        left = hlLeft + hlWidth + 24;
        break;
    }

    // Ajustes para manter na tela
    const pad = 12;
    if (left < pad) left = pad;
    if (left + CARD_WIDTH > window.innerWidth - pad) {
      left = window.innerWidth - CARD_WIDTH - pad;
    }
    if (top < pad) top = pad;
    if (top + CARD_HEIGHT > window.innerHeight - pad) {
      top = window.innerHeight - CARD_HEIGHT - pad;
    }

    setPosition({ top, left });
  };

  const handleNext = () => {
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
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  const step = tutorialSteps[currentStep];

  const ArrowIcon = ({ dir }: { dir: TutorialStep["arrow"] }) => {
    switch (dir) {
      case "right":
        return <ArrowRight className="h-4 w-4" />;
      case "left":
        return <ArrowLeft className="h-4 w-4" />;
      case "up":
        return <ArrowUp className="h-4 w-4" />;
      case "down":
        return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Overlay escurecido com recorte para o elemento destacado */}
      {show && (
        <div className="fixed inset-0 z-[100] transition-opacity duration-200">
          <svg className="w-full h-full">
            <defs>
              <mask id="tutorial-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {highlightStyle.width > 0 && highlightStyle.height > 0 && (
                  <rect
                    x={highlightStyle.left}
                    y={highlightStyle.top}
                    width={highlightStyle.width}
                    height={highlightStyle.height}
                    rx={highlightStyle.radius}
                    ry={highlightStyle.radius}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#tutorial-mask)"
            />
          </svg>
        </div>
      )}

      {/* Borda de destaque em volta do elemento */}
      {show && highlightStyle.width > 0 && highlightStyle.height > 0 && (
        <div
          className="fixed z-[101] pointer-events-none"
          style={{
            top: highlightStyle.top - 4,
            left: highlightStyle.left - 4,
            width: highlightStyle.width + 8,
            height: highlightStyle.height + 8,
            borderRadius: highlightStyle.radius + 4,
            boxShadow: "0 0 0 2px rgba(59,130,246,0.9), 0 0 16px rgba(59,130,246,0.5)",
          }}
        />
      )}

      {/* Card de instrução */}
      {show && (
        <div
          className="fixed z-[102]"
          style={{ top: position.top, left: position.left, width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          <Card className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-finance-dark dark:text-white">
                  {step.title}
                </h3>
                <button
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleClose}
                  aria-label="Fechar tutorial"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{step.description}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="text-gray-500 dark:text-gray-300 flex items-center gap-2">
                  <ArrowIcon dir={step.arrow} />
                  <span className="text-xs">Siga a seta</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSkip}>Pular</Button>
                  <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0}>Anterior</Button>
                  <Button size="sm" onClick={handleNext}>{currentStep === tutorialSteps.length - 1 ? "Concluir" : "Próximo"}</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AppTutorial;