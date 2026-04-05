import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import useAuth from "../hooks/useAuth";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import TecnicoRoute from "./TecnicoRoute";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/LoginPage";
import ChatPage from "../pages/ChatPage";
import KnowledgeBasePage from "../pages/KnowledgeBasePage";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import RadiografiaAppPage from "../pages/RadiografiaAppPage";
import RadiografiaPanelPage from "../pages/RadiografiaPanelPage";
import RadiografiaTecnicaAppPage from "../pages/RadiografiaTecnicaAppPage";
import RadiografiaTecnicaPanelPage from "../pages/RadiografiaTecnicaPanelPage";
import ArticulosAdmin from "../pages/admin/ArticulosAdmin";
import CategoriasAdmin from "../pages/admin/CategoriasAdmin";
import UsuariosAdmin from "../pages/admin/UsuariosAdmin";
import ErroresAdmin from "../pages/admin/ErroresAdmin";
import MemoriasAdmin from "../pages/admin/MemoriasAdmin";
import KBAnalyticsPage from "../pages/admin/KBAnalyticsPage";
import RadiografiaIAPage from "../pages/RadiografiaIAPage";
import TicketsPage from "../pages/tickets/TicketsPage";
import TicketDetailPage from "../pages/tickets/TicketDetailPage";

const AppRouter = () => {
  const { checking, isAuthenticated } = useAuth();

  if (checking) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/chat" />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="kb" element={<KnowledgeBasePage />} />
          <Route path="kb/:slug" element={<ArticleDetailPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="radiografia-app" element={<RadiografiaAppPage />} />
          <Route path="radiografia-panel" element={<RadiografiaPanelPage />} />
          <Route
            path="radiografia-tecnica-app"
            element={<TecnicoRoute><RadiografiaTecnicaAppPage /></TecnicoRoute>}
          />
          <Route
            path="radiografia-tecnica-panel"
            element={<TecnicoRoute><RadiografiaTecnicaPanelPage /></TecnicoRoute>}
          />
          <Route
            path="admin/articulos"
            element={<AdminRoute><ArticulosAdmin /></AdminRoute>}
          />
          <Route
            path="admin/categorias"
            element={<AdminRoute><CategoriasAdmin /></AdminRoute>}
          />
          <Route
            path="admin/usuarios"
            element={<AdminRoute><UsuariosAdmin /></AdminRoute>}
          />
          <Route
            path="admin/errores"
            element={<AdminRoute><ErroresAdmin /></AdminRoute>}
          />
          <Route
            path="admin/memorias"
            element={<AdminRoute><MemoriasAdmin /></AdminRoute>}
          />
          <Route
            path="admin/kb-analytics"
            element={<AdminRoute><KBAnalyticsPage /></AdminRoute>}
          />
          <Route
            path="admin/uso-ia"
            element={<AdminRoute><RadiografiaIAPage /></AdminRoute>}
          />
        </Route>
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
