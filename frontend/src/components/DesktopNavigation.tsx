
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Calculator, BookOpen, TrendingUp, Lightbulb } from "lucide-react";
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
    },
    {
      title: "Calculadora de Gastos",
      path: "/calculadora",
      icon: Calculator,
    },
    {
      title: "Simulador de Investimentos",
      path: "/investimentos",
      icon: TrendingUp,
    },
    {
      title: "Educação Financeira",
      path: "/educacao",
      icon: BookOpen,
    },
    {
      title: "Base de Conhecimento",
      path: "/conhecimento",
      icon: Lightbulb,
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
                          "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
                          isActive 
                            ? "bg-finance-teal/10 text-finance-teal" 
                            : "hover:bg-muted text-foreground/80 hover:text-foreground"
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
