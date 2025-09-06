
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
