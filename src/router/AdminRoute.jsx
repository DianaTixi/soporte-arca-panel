import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const AdminRoute = ({ children }) => {
  const { usuario } = useAuthStore();
  if (usuario?.rol !== "admin") {
    return <Navigate to="/chat" />;
  }
  return children;
};

export default AdminRoute;
