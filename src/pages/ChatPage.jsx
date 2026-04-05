import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  AddComment,
  SmartToy,
  People,
  Description,
  Forum,
  Assignment,
  ReportProblem,
  Search as SearchIcon,
  BarChart,
  Event,
  EmojiEvents,
  AccountTree,
  Public,
  History,
} from "@mui/icons-material";
import useChat from "../hooks/useChat";
import useAuthStore from "../store/authStore";
import ChatInput from "../components/chat/ChatInput";
import ChatMessage from "../components/chat/ChatMessage";
import ChatToolIndicator from "../components/chat/ChatToolIndicator";
import { obtenerHistorialSesiones, buscarEnHistorial } from "../api/agenteApi";

const MODULOS = [
  { key: "usuarios", label: "Usuarios", icon: People },
  { key: "formularios", label: "Formularios", icon: Description },
  { key: "charlas", label: "Charlas", icon: Forum },
  { key: "tareas", label: "Tareas", icon: Assignment },
  { key: "incidencias", label: "Incidencias", icon: ReportProblem },
  { key: "inspecciones", label: "Inspecciones", icon: SearchIcon },
  { key: "reportes", label: "Reportes", icon: BarChart },
  { key: "actividades", label: "Actividades", icon: Event },
  { key: "rankings", label: "Rankings", icon: EmojiEvents },
  { key: "estructura", label: "Estructura", icon: AccountTree },
  { key: "general", label: "General", icon: Public },
];

const suggestedQuestions = {
  soporte: [
    "¿Cómo creo un nuevo formulario?",
    "¿Cómo asigno una tarea a un usuario?",
    "Un usuario no puede iniciar sesión, ¿qué hago?",
    "¿Cómo exporto un reporte?",
  ],
  soporte_tecnico: [
    "¿Cómo verifico los datos de un formulario en la BD?",
    "Necesito diagnosticar un error en el módulo de tareas",
    "Dame los queries para analizar actividad de un usuario",
    "¿Qué tablas están involucradas en el módulo de charlas?",
  ],
  admin: [
    "Dame un resumen del módulo de formularios",
    "¿Cómo diagnostico un problema de permisos?",
    "Queries para verificar datos del módulo de usuarios",
    "¿Cuáles son los errores más comunes del sistema?",
  ],
};

const ChatPage = () => {
  const {
    sessionId,
    messages,
    streaming,
    activeTool,
    contextoModulo,
    setContextoModulo,
    sendMessage,
    clearChat,
    loadSession,
    abort,
  } = useChat();
  const usuario = useAuthStore((s) => s.usuario);
  const messagesEndRef = useRef(null);

  const [historyQuery, setHistoryQuery] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [openingSessionId, setOpeningSessionId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTool]);

  const cargarSesiones = useCallback(async (q) => {
    setSessionsLoading(true);
    try {
      const resp = await obtenerHistorialSesiones({
        q: q || undefined,
        limit: 40,
      });
      setSessions(resp.sesiones || []);
      setSessionsTotal(resp.total || 0);
    } catch (error) {
      console.error("Error cargando sesiones:", error);
      setSessions([]);
      setSessionsTotal(0);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarSesiones(historyQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [historyQuery, cargarSesiones]);

  useEffect(() => {
    if (!streaming) {
      cargarSesiones(historyQuery.trim());
    }
  }, [streaming, messages.length, historyQuery, cargarSesiones]);

  useEffect(() => {
    const q = historyQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const resp = await buscarEnHistorial(q, { limit: 12 });
        setSearchResults(resp.resultados || []);
      } catch (error) {
        console.error("Error buscando en historial:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [historyQuery]);

  const abrirSesion = useCallback(async (targetSessionId, usuarioSesion = null) => {
    if (!targetSessionId || streaming) return;
    setOpeningSessionId(targetSessionId);
    try {
      await loadSession(targetSessionId, { usuario: usuarioSesion });
    } catch (error) {
      console.error("Error abriendo sesión:", error);
    } finally {
      setOpeningSessionId(null);
    }
  }, [loadSession, streaming]);

  const formatFecha = useMemo(() => {
    return new Intl.DateTimeFormat("es-EC", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }, []);

  const questions = suggestedQuestions[usuario?.rol] || suggestedQuestions.soporte;
  const isEmpty = messages.length === 0;
  const esTecnico = usuario?.rol === "soporte_tecnico" || usuario?.rol === "admin";
  const isAdmin = usuario?.rol === "admin";

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", minHeight: 0, flexDirection: { xs: "column", md: "row" } }}>
      <Box
        sx={{
          width: { xs: "100%", md: 360 },
          borderRight: { xs: "none", md: "1px solid" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          maxHeight: { xs: 280, md: "100%" },
          minHeight: { xs: 220, md: "auto" },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <History fontSize="small" />
            Historial de chats
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sessionsTotal} sesiones
          </Typography>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<AddComment />}
            onClick={clearChat}
            sx={{ mt: 1, textTransform: "none" }}
          >
            Nueva conversación
          </Button>
          <TextField
            size="small"
            fullWidth
            value={historyQuery}
            onChange={(e) => setHistoryQuery(e.target.value)}
            placeholder="Buscar en chats..."
            sx={{ mt: 1.2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {historyQuery.trim().length >= 2 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Coincidencias recientes
              </Typography>
            </Box>
            <List dense sx={{ pt: 0, pb: 1, maxHeight: 140, overflow: "auto" }}>
              {searchLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={18} />
                </Box>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                  Sin coincidencias.
                </Typography>
              )}
              {!searchLoading && searchResults.map((item) => (
                <ListItemButton
                  key={`search-${item.chat_id}`}
                  onClick={() => abrirSesion(item.chat_session_id, item.chat_usuario)}
                  sx={{ px: 2, py: 0.6 }}
                >
                  <ListItemText
                    primary={item.pregunta_preview || "Sin pregunta"}
                    secondary={isAdmin
                      ? `${item.chat_usuario || "sin usuario"} · ${item.respuesta_preview || "Sin respuesta"}`
                      : (item.respuesta_preview || "Sin respuesta")}
                    primaryTypographyProps={{ variant: "caption", noWrap: true, fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Sesiones
          </Typography>
        </Box>
        <List sx={{ pt: 0, pb: 1, overflow: "auto", flex: 1 }}>
          {sessionsLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          )}
          {!sessionsLoading && sessions.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
              No hay chats guardados todavía.
            </Typography>
          )}
          {!sessionsLoading && sessions.map((s) => {
            const isSelected = s.chat_session_id === sessionId && messages.length > 0;
            const loadingThis = openingSessionId === s.chat_session_id;

            return (
              <ListItemButton
                key={s.chat_session_id}
                selected={isSelected}
                onClick={() => abrirSesion(s.chat_session_id, s.chat_usuario)}
                disabled={loadingThis}
                sx={{ px: 2, py: 1 }}
              >
                <ListItemText
                  primary={s.ultima_pregunta || "Conversación sin título"}
                  secondary={isAdmin
                    ? `${s.chat_usuario || "sin usuario"} · ${formatFecha.format(new Date(s.ultima_fecha))} · ${s.total_interacciones} interacciones`
                    : `${formatFecha.format(new Date(s.ultima_fecha))} · ${s.total_interacciones} interacciones`}
                  primaryTypographyProps={{ variant: "body2", fontWeight: 600, noWrap: true }}
                  secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                />
                {loadingThis && <CircularProgress size={14} />}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {isEmpty ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                px: 3,
                textAlign: "center",
              }}
            >
              <SmartToy sx={{ fontSize: 64, color: "primary.light", mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight={700} color="text.primary" mb={1}>
                Agente de Soporte ARCA
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4} maxWidth={500}>
                {usuario?.rol === "soporte"
                  ? "Pregúntame sobre cualquier funcionalidad del sistema. Te guiaré paso a paso."
                  : "Pregúntame sobre cualquier módulo. Puedo darte diagnósticos técnicos, queries SQL y soluciones detalladas."}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", maxWidth: 600 }}>
                {questions.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    variant="outlined"
                    clickable
                    onClick={() => sendMessage(q)}
                    sx={{
                      borderRadius: 3,
                      py: 2.5,
                      px: 0.5,
                      fontSize: 13,
                      "&:hover": { bgcolor: "primary.50", borderColor: "primary.main" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  px: 2,
                  pt: 1,
                }}
              >
                <Button
                  size="small"
                  startIcon={<AddComment />}
                  onClick={clearChat}
                  sx={{ textTransform: "none" }}
                >
                  Nueva conversación
                </Button>
              </Box>

              {messages.map((msg, idx) => {
                const prevUserMsg = !msg.loading && msg.role === "assistant" && idx > 0
                  ? messages.slice(0, idx).reverse().find((m) => m.role === "user")?.content
                  : undefined;
                return (
                  <ChatMessage key={idx} message={msg} sessionId={sessionId} previousUserMessage={prevUserMsg} />
                );
              })}
              <ChatToolIndicator tool={activeTool} />
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {esTecnico && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              overflowX: "auto",
              flexShrink: 0,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 2 },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, whiteSpace: "nowrap" }}>
              Contexto:
            </Typography>
            {MODULOS.map(({ key, label, icon: Icon }) => (
              <Tooltip key={key} title={`Enfocar consultas al módulo de ${label}`} arrow>
                <Chip
                  icon={<Icon sx={{ fontSize: 16 }} />}
                  label={label}
                  size="small"
                  variant={contextoModulo === key ? "filled" : "outlined"}
                  color={contextoModulo === key ? "primary" : "default"}
                  onClick={() => setContextoModulo(contextoModulo === key ? null : key)}
                  sx={{
                    fontSize: 12,
                    height: 28,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        )}

        <ChatInput onSend={sendMessage} streaming={streaming} onAbort={abort} />
      </Box>
    </Box>
  );
};

export default ChatPage;
