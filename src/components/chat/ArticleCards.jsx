import { Box, Card, CardActionArea, CardContent, Typography, Chip } from "@mui/material";
import { Article } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const tipoColors = {
  faq: "info",
  guia: "success",
  tecnico: "warning",
  diagnostico: "error",
};

const ArticleCards = ({ articles }) => {
  const navigate = useNavigate();

  if (!articles?.length) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5, mb: 1 }}>
      {articles.map((art) => (
        <Card key={art.id} variant="outlined" sx={{ maxWidth: 260, flex: "1 1 200px" }}>
          <CardActionArea onClick={() => navigate(`/kb/${art.slug}`)}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Article fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                    {art.titulo}
                  </Typography>
                  {art.tipo && (
                    <Chip
                      label={art.tipo}
                      size="small"
                      color={tipoColors[art.tipo] || "default"}
                      sx={{ mt: 0.5, height: 20, fontSize: 11 }}
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default ArticleCards;
