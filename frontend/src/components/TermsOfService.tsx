import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { ScrollArea } from "@/components/ui/scroll-area";
  
  interface TermsOfServiceProps {
    children: React.ReactNode;
  }
  
  export function TermsOfService({ children }: TermsOfServiceProps) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-finance-blue">
              Termos de Uso
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-lg mb-2">1. Aceitação dos Termos</h3>
                <p>
                  Ao utilizar o Bifröst, você concorda em cumprir e estar vinculado a estes 
                  Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve 
                  usar nosso serviço.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">2. Descrição do Serviço</h3>
                <p>
                  O Bifröst é uma plataforma de educação e ferramentas financeiras que oferece:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Calculadoras de gastos e investimentos</li>
                  <li>Conteúdo educacional sobre finanças pessoais</li>
                  <li>Base de conhecimento financeiro</li>
                  <li>Simuladores de investimentos</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">3. Responsabilidades do Usuário</h3>
                <p>
                  Você é responsável por manter a confidencialidade de sua conta e senha, e por 
                  todas as atividades que ocorram sob sua conta.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">4. Limitação de Responsabilidade</h3>
                <p>
                  As informações fornecidas pelo Biofrost são apenas para fins educacionais 
                  e não constituem aconselhamento financeiro profissional. Você deve consultar um 
                  consultor financeiro qualificado antes de tomar decisões de investimento.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">5. Propriedade Intelectual</h3>
                <p>
                  Todo o conteúdo disponível no Bifröst, incluindo textos, gráficos, 
                  logotipos, ícones e software, é propriedade exclusiva nossa ou de nossos 
                  licenciadores.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">6. Modificações dos Termos</h3>
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  As modificações entrarão em vigor imediatamente após a publicação.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">7. Contato</h3>
                <p>
                  Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco 
                  através do email: Nãosabeainda@gmail.com
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }