
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import AppTutorial from "@/components/AppTutorial";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const keyId = user?.id || localStorage.getItem('userEmail') || 'anon';
      const tutorialKey = `app-tutorial-completed:user:${keyId}`;
      let tutorialCompleted = localStorage.getItem(tutorialKey);

      // Migração: se a chave nova não existir, tentar detectar chaves antigas baseadas em token
      if (!tutorialCompleted) {
        const token = localStorage.getItem('token') || '';
        const legacyKeys = [
          `app-tutorial-completed:token:${token}`,
          `app-tutorial-completed:${token}`,
          `app-tutorial-completed`,
        ];
        // Verificar chaves legadas explicitamente
        for (const legacyKey of legacyKeys) {
          if (legacyKey && localStorage.getItem(legacyKey) === 'true') {
            localStorage.setItem(tutorialKey, 'true');
            tutorialCompleted = 'true';
            break;
          }
        }
        // Se ainda não encontrado, varrer localStorage por qualquer chave antiga "app-tutorial-completed:" marcada como true
        if (!tutorialCompleted) {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || '';
            if (k.startsWith('app-tutorial-completed:') && !k.includes(':user:')) {
              if (localStorage.getItem(k) === 'true') {
                localStorage.setItem(tutorialKey, 'true');
                tutorialCompleted = 'true';
                break;
              }
            }
          }
        }
      }

      if (!tutorialCompleted) {
        const t = setTimeout(() => setShowTutorial(true), 800);
        return () => clearTimeout(t);
      } else {
        setShowTutorial(false);
      }
    } catch {}
  }, [isAuthenticated, user?.id]);

  // Permitir reabrir o tutorial sob demanda a partir do Perfil
  useEffect(() => {
    const trigger = () => {
      try {
        const keyId = user?.id || localStorage.getItem('userEmail') || 'anon';
        const tutorialKey = `app-tutorial-completed:user:${keyId}`;
        // Limpa a flag para permitir que o tutorial execute novamente
        localStorage.removeItem(tutorialKey);
      } catch {}
      setShowTutorial(true);
    };
    window.addEventListener('app:show-tutorial', trigger as EventListener);
    return () => window.removeEventListener('app:show-tutorial', trigger as EventListener);
  }, [user?.id]);
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return (
    <>
      <Outlet />
      {showTutorial && (
        <AppTutorial
          onComplete={() => {
            try {
              const keyId = user?.id || localStorage.getItem('userEmail') || 'anon';
              const tutorialKey = `app-tutorial-completed:user:${keyId}`;
              localStorage.setItem(tutorialKey, 'true');
            } catch {}
            setShowTutorial(false);
          }}
        />
      )}
    </>
  );
};

export default ProtectedRoute;
