import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography, Chip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import useChat from "../hooks/useChat";
import ChatInput from "../components/chat/ChatInput";
import ChatMessage from "../components/chat/ChatMessage";
import ChatToolIndicator from "../components/chat/ChatToolIndicator";

const contextOptions = [
  { key: "general", label: "General" },
  { key: "usuarios", label: "Usuarios" },
  { key: "formularios", label: "Formularios" },
  { key: "tareas", label: "Tareas" },
  { key: "reportes", label: "Reportes" },
];

const EmbedChatPage = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialToken = params.get("token") || "";
  const defaultContext = params.get("contexto") || "general";
  const apiUrl = params.get("apiUrl") || null;
  const embedKey = params.get("embedKey") || null;
  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    if (!embedKey) return;

    const handler = (event) => {
      const payload = event?.data;
      if (
        payload?.type !== "arca:embed:init"
        || payload?.embedKey !== embedKey
      ) {
        return;
      }

      if (typeof payload.token === "string") {
        setToken(payload.token);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [embedKey]);

  const {
    sessionId,
    messages,
    streaming,
    activeTool,
    contextoModulo,
    setContextoModulo,
    sendMessage,
    abort,
  } = useChat({
    tokenOverride: token,
    apiUrlOverride: apiUrl,
    initialContextoModulo: defaultContext,
  });

  const selectedContext = contextoModulo || defaultContext;

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToyIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700}>
            ARCA Soporte
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Session: {sessionId.slice(0, 8)}
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider", display: "flex", gap: 0.75, overflowX: "auto" }}>
        {contextOptions.map((item) => (
          <Chip
            key={item.key}
            size="small"
            label={item.label}
            color={selectedContext === item.key ? "primary" : "default"}
            variant={selectedContext === item.key ? "filled" : "outlined"}
            onClick={() => setContextoModulo(item.key)}
            sx={{ borderRadius: 999 }}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "grey.50" }}>
        {!token && (
          <Box sx={{ px: 2, pt: 2 }}>
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Falta token de acceso. Configura <code>token</code> en el widget para probar.
            </Alert>
          </Box>
        )}
        {messages.length === 0 ? (
          <Box sx={{ px: 3, py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              ¡Hola! Soy tu asistente. Cuéntame qué necesitas y te ayudo.
            </Typography>
          </Box>
        ) : (
          messages.map((m, i) => (
            <ChatMessage
              key={`msg-${i}`}
              message={m}
              sessionId={sessionId}
              previousUserMessage={messages.slice(0, i).reverse().find((x) => x.role === "user")?.content}
              allowTickets={false}
            />
          ))
        )}
      </Box>

      <ChatToolIndicator tool={activeTool} />
      <ChatInput streaming={streaming} onSend={sendMessage} onAbort={abort} />
    </Box>
  );
};

export default EmbedChatPage;
