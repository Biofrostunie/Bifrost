
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
      const tutorialCompleted = localStorage.getItem(tutorialKey);
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
