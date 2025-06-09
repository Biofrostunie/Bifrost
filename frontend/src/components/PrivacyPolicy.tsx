
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { ScrollArea } from "@/components/ui/scroll-area";
  
  interface PrivacyPolicyProps {
    children: React.ReactNode;
  }
  
  export function PrivacyPolicy({ children }: PrivacyPolicyProps) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-finance-blue">
              Política de Privacidade
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-lg mb-2">1. Informações que Coletamos</h3>
                <p>
                  Coletamos informações que você nos fornece diretamente, como quando você:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Cria uma conta em nossa plataforma</li>
                  <li>Preenche formulários em nosso site</li>
                  <li>Utiliza nossas calculadoras e ferramentas</li>
                  <li>Entra em contato conosco</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">2. Como Usamos suas Informações</h3>
                <p>
                  Utilizamos as informações coletadas para:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Personalizar sua experiência</li>
                  <li>Comunicar com você sobre atualizações e novidades</li>
                  <li>Garantir a segurança de nossa plataforma</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">3. Compartilhamento de Informações</h3>
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                  exceto nos seguintes casos:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprir obrigações legais</li>
                  <li>Para proteger nossos direitos e segurança</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">4. Segurança dos Dados</h3>
                <p>
                  Implementamos medidas de segurança adequadas para proteger suas informações 
                  contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">5. Seus Direitos</h3>
                <p>
                  Você tem o direito de:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Acessar suas informações pessoais</li>
                  <li>Corrigir dados incorretos</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Retirar seu consentimento a qualquer momento</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">6. Cookies</h3>
                <p>
                  Utilizamos cookies para melhorar sua experiência em nosso site. 
                  Você pode configurar seu navegador para recusar cookies, mas isso 
                  pode afetar a funcionalidade do site.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">7. Alterações nesta Política</h3>
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. 
                  Notificaremos você sobre mudanças significativas através de nosso site.
                </p>
              </section>
              
              <section>
                <h3 className="font-semibold text-lg mb-2">8. Contato</h3>
                <p>
                  Para questões sobre esta Política de Privacidade, entre em contato: 
                  nãosesabeainda@gmail.com
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }