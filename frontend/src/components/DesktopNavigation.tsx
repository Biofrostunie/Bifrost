import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Calculator, BookOpen, TrendingUp, Lightbulb, CreditCard, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DesktopNavigation() {
  const navItems = [
    {
      title: "Home",
      path: "/",
      icon: Home,
      color: "finance-blue"
    },
    {
      title: "Calculadora de Gastos",
      path: "/calculadora",
      icon: Calculator,
      color: "finance-blue"
    },
    {
      title: "Simulador de Investimentos",
      path: "/investimentos",
      icon: TrendingUp,
      color: "finance-teal"
    },
    {
      title: "Educação Financeira",
      path: "/educacao",
      icon: BookOpen,
      color: "finance-purple"
    },
    {
      title: "Base de Conhecimento",
      path: "/conhecimento",
      icon: Lightbulb,
      color: "finance-blue"
    },
    {
      title: "Conta Bancária",
      path: "/contas-bancarias/novo",
      icon: Wallet,
      color: "finance-blue"
    },
    {
      title: "Cartão de Crédito",
      path: "/cartoes/novo",
      icon: CreditCard,
      color: "finance-blue"
    }
  ];

  return (
    <Sidebar className="hidden lg:flex h-screen border-r">
      <SidebarContent>
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-finance-teal">Bifröst</h2>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-all duration-200 relative",
                          isActive 
                            ? "bg-finance-teal/20 text-finance-gray border-l-4 border-finance-teal font-semibold" 
                            : "hover:bg-finance-blue/10 hover:text-finance-blue text-foreground/80"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}