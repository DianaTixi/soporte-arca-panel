import { useState } from "react";
import { Box, Avatar, Typography, CircularProgress, Button } from "@mui/material";
import { SmartToy, Person, ConfirmationNumber } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import SqlBlock from "./SqlBlock";
import ArticleCards from "./ArticleCards";
import CrearTicketDialog from "../../pages/tickets/CrearTicketDialog";

const ChatMessage = ({ message, sessionId, previousUserMessage, allowTickets = true }) => {
  const isUser = message.role === "user";
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        px: { xs: 2, md: 4 },
        py: 2,
        bgcolor: isUser ? "transparent" : "grey.50",
        "&:hover": { bgcolor: isUser ? "grey.25" : "grey.100" },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isUser ? "primary.main" : "secondary.main",
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {isUser ? <Person sx={{ fontSize: 18 }} /> : <SmartToy sx={{ fontSize: 18 }} />}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {isUser ? "Tú" : "Agente ARCA"}
        </Typography>

        {message.loading && !message.content ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Pensando...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              "& p": { mt: 0.5, mb: 1, lineHeight: 1.7 },
              "& ul, & ol": { pl: 3, mb: 1 },
              "& li": { mb: 0.3 },
              "& h1, & h2, & h3": { mt: 2, mb: 1 },
              "& strong": { fontWeight: 600 },
              "& a": { color: "primary.main" },
              "& table": {
                borderCollapse: "collapse",
                width: "100%",
                my: 1,
                "& th, & td": {
                  border: "1px solid",
                  borderColor: "divider",
                  px: 1.5,
                  py: 0.75,
                  fontSize: 13,
                },
                "& th": { bgcolor: "grey.100", fontWeight: 600 },
              },
            }}
          >
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match?.[1];
                  const codeStr = String(children).replace(/\n$/, "");

                  if (!inline && lang === "sql") {
                    return <SqlBlock code={codeStr} />;
                  }

                  if (!inline) {
                    return (
                      <Box
                        component="pre"
                        sx={{
                          bgcolor: "#282c34",
                          color: "#abb2bf",
                          p: 2,
                          borderRadius: 2,
                          overflow: "auto",
                          fontSize: 13,
                          my: 1.5,
                        }}
                      >
                        <code {...props}>{children}</code>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      component="code"
                      sx={{
                        bgcolor: "grey.100",
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: "0.875em",
                        fontFamily: "monospace",
                      }}
                      {...props}
                    >
                      {children}
                    </Box>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </Box>
        )}

        {message.articles?.length > 0 && (
          <ArticleCards articles={message.articles} />
        )}

        {message.error && (
          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
            No se pudo obtener una respuesta. Intenta de nuevo.
          </Typography>
        )}

        {allowTickets && !isUser && !message.loading && message.content && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small" variant="text" color="inherit"
              startIcon={<ConfirmationNumber sx={{ fontSize: 14 }} />}
              onClick={() => setTicketDialogOpen(true)}
              sx={{ fontSize: 12, color: "text.secondary", textTransform: "none", "&:hover": { color: "primary.main" } }}
            >
              ¿No resolvió tu problema? Crear ticket
            </Button>
            <CrearTicketDialog
              open={ticketDialogOpen}
              onClose={() => setTicketDialogOpen(false)}
              chatSessionId={sessionId}
              tituloInicial={previousUserMessage || ""}
              descripcionInicial={
                previousUserMessage
                  ? `Pregunta: ${previousUserMessage}\n\nRespuesta del agente: ${(message.content || "").slice(0, 500)}`
                  : ""
              }
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;
