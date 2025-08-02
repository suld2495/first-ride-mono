import { useAuthStore } from "@repo/shared/store/auth.store";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && location.pathname.includes('/login')) {
      navigate('/');
    }

    if (!user && ['/login', 'join'].includes(location.pathname)) {
      navigate('/login');
    }
  }, [location.pathname]);

  return children;
};

export default AuthProvider;