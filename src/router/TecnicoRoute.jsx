import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const TecnicoRoute = ({ children }) => {
  const { usuario } = useAuthStore();
  if (usuario?.rol !== "admin" && usuario?.rol !== "soporte_tecnico") {
    return <Navigate to="/chat" />;
  }
  return children;
};

export default TecnicoRoute;
