import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Avatar, Menu, MenuItem, Chip, useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon, SmartToy, MenuBook, AdminPanelSettings, Article,
  Category, People, Logout, ChevronLeft, PhoneAndroid, DesktopWindows,
  DataObject, Schema, Analytics, BugReport, Psychology, QueryStats, ConfirmationNumber,
} from "@mui/icons-material";
import useAuthStore from "../store/authStore";

const DRAWER_WIDTH = 260;

const rolLabels = {
  admin: "Administrador",
  soporte_tecnico: "Soporte Técnico",
  soporte: "Soporte",
};

const rolColors = {
  admin: "error",
  soporte_tecnico: "primary",
  soporte: "default",
};

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();

  const isAdmin = usuario?.rol === "admin";
  const isTecnico = usuario?.rol === "admin" || usuario?.rol === "soporte_tecnico";

  const menuItems = [
    { text: "Agente IA", icon: <SmartToy />, path: "/chat" },
    { text: "Base de Conocimiento", icon: <MenuBook />, path: "/kb" },
    { text: "Tickets", icon: <ConfirmationNumber />, path: "/tickets" },
  ];

  const docItems = [
    { text: "Radiografía APP", icon: <PhoneAndroid />, path: "/radiografia-app" },
    { text: "Radiografía Panel", icon: <DesktopWindows />, path: "/radiografia-panel" },
  ];

  const tecnicoItems = [
    { text: "Técnica APP", icon: <DataObject />, path: "/radiografia-tecnica-app" },
    { text: "Técnica Panel", icon: <Schema />, path: "/radiografia-tecnica-panel" },
  ];

  const adminItems = [
    { text: "Artículos", icon: <Article />, path: "/admin/articulos" },
    { text: "Categorías", icon: <Category />, path: "/admin/categorias" },
    { text: "Usuarios", icon: <People />, path: "/admin/usuarios" },
    { text: "Errores", icon: <BugReport />, path: "/admin/errores" },
    { text: "Memorias IA", icon: <Psychology />, path: "/admin/memorias" },
    { text: "Analytics KB", icon: <QueryStats />, path: "/admin/kb-analytics" },
    { text: "Uso IA", icon: <Analytics />, path: "/admin/uso-ia" },
  ];

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          ARCA Soporte
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.dark" },
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5 }}>
          DOCUMENTACIÓN
        </Typography>
        {docItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#fff",
                "&:hover": { bgcolor: "primary.dark" },
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        {isTecnico && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5 }}>
              TÉCNICO (DB)
            </Typography>
            {tecnicoItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": { color: "#fff" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5 }}>
              ADMINISTRACIÓN
            </Typography>
            {adminItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": { color: "#fff" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </>
        )}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}>
            {usuario?.nombre?.charAt(0) || "U"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {usuario?.nombre}
            </Typography>
            <Chip
              label={rolLabels[usuario?.rol] || usuario?.rol}
              size="small"
              color={rolColors[usuario?.rol] || "default"}
              sx={{ height: 20, fontSize: 11 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Toolbar>
            {(!drawerOpen || isMobile) && (
              <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13 }}>
                {usuario?.nombre?.charAt(0) || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">{usuario?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
