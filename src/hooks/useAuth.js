import { useEffect } from "react";
import useAuthStore from "../store/authStore";

const useAuth = () => {
  const { usuario, token, checking, login, logout, renovarToken } = useAuthStore();

  useEffect(() => {
    renovarToken();
  }, []);

  return {
    usuario,
    token,
    checking,
    isAuthenticated: !!token && !!usuario,
    isAdmin: usuario?.rol === "admin",
    isTecnico: usuario?.rol === "soporte_tecnico",
    login,
    logout,
  };
};

export default useAuth;
