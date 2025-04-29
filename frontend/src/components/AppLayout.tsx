
import { BottomNavigation } from "@/components/BottomNavigation";
import { DesktopNavigation } from "@/components/DesktopNavigation";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showProfile?: boolean;
}

export function AppLayout({ children, title, showProfile = false }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      <DesktopNavigation />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} showProfile={showProfile} />
        
        <div className={isMobile ? "page-container" : "flex-1 max-w-5xl mx-auto p-8 w-full"}>
          {children}
        </div>
        
        {isMobile && <BottomNavigation />}
      </div>
    </div>
  );
}
