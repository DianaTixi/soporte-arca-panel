import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Chip, Divider, CircularProgress, Alert, IconButton, Tooltip,
} from "@mui/material";
import { ArrowBack, ThumbUp, ThumbDown, SmartToy } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { getArticuloPorSlug, votarArticulo } from "../api/articuloApi";
import SqlBlock from "../components/chat/SqlBlock";

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voted, setVoted] = useState(null);

  useEffect(() => {
    setLoading(true);
    getArticuloPorSlug(slug)
      .then(({ data }) => setArticulo(data.articulo))
      .catch(() => setError("Artículo no encontrado"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleVote = async (tipo) => {
    if (voted) return;
    try {
      await votarArticulo(articulo.art_id, tipo);
      setVoted(tipo);
      setArticulo((prev) => ({
        ...prev,
        art_votos_si: prev.art_votos_si + (tipo === "si" ? 1 : 0),
        art_votos_no: prev.art_votos_no + (tipo === "no" ? 1 : 0),
      }));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !articulo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Artículo no encontrado"}</Alert>
        <Button onClick={() => navigate("/kb")} sx={{ mt: 2 }}>
          Volver a la base de conocimiento
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/kb")}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {articulo.art_tipo && <Chip label={articulo.art_tipo} color="primary" size="small" />}
          {articulo.art_audiencia && <Chip label={articulo.art_audiencia} variant="outlined" size="small" />}
          {articulo.art_tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="h4" fontWeight={700} mb={1}>
          {articulo.art_titulo}
        </Typography>

        {articulo.art_resumen && (
          <Typography variant="body1" color="text.secondary" mb={3}>
            {articulo.art_resumen}
          </Typography>
        )}

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            "& p": { mb: 1.5, lineHeight: 1.7 },
            "& ul, & ol": { pl: 3, mb: 1.5 },
            "& li": { mb: 0.5 },
            "& h1, & h2, & h3": { mt: 3, mb: 1.5 },
            "& table": {
              borderCollapse: "collapse",
              width: "100%",
              my: 2,
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                px: 1.5,
                py: 0.75,
                fontSize: 14,
              },
              "& th": { bgcolor: "grey.100", fontWeight: 600 },
            },
          }}
        >
          <ReactMarkdown
            components={{
              code({ inline, className, children }) {
                const lang = /language-(\w+)/.exec(className || "")?.[1];
                const codeStr = String(children).replace(/\n$/, "");
                if (!inline && lang === "sql") return <SqlBlock code={codeStr} />;
                if (!inline) {
                  return (
                    <Box
                      component="pre"
                      sx={{ bgcolor: "#282c34", color: "#abb2bf", p: 2, borderRadius: 2, overflow: "auto", fontSize: 13, my: 1.5 }}
                    >
                      <code>{children}</code>
                    </Box>
                  );
                }
                return (
                  <Box
                    component="code"
                    sx={{ bgcolor: "grey.100", px: 0.8, py: 0.2, borderRadius: 1, fontSize: "0.875em", fontFamily: "monospace" }}
                  >
                    {children}
                  </Box>
                );
              },
            }}
          >
            {articulo.art_contenido}
          </ReactMarkdown>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              ¿Te fue útil este artículo?
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Sí, me ayudó">
                <IconButton
                  onClick={() => handleVote("si")}
                  color={voted === "si" ? "success" : "default"}
                  disabled={!!voted}
                >
                  <ThumbUp />
                </IconButton>
              </Tooltip>
              <Tooltip title="No me ayudó">
                <IconButton
                  onClick={() => handleVote("no")}
                  color={voted === "no" ? "error" : "default"}
                  disabled={!!voted}
                >
                  <ThumbDown />
                </IconButton>
              </Tooltip>
              {voted && (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                  Gracias por tu voto
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<SmartToy />}
            onClick={() => navigate(`/chat`)}
          >
            Preguntar al agente
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ArticleDetailPage;
