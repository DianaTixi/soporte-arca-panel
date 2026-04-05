import { Card, CardActionArea, CardContent, Typography, Chip, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThumbUp, ThumbDown } from "@mui/icons-material";

const tipoColors = {
  faq: "info",
  guia: "success",
  tecnico: "warning",
  diagnostico: "error",
};

const ArticleCard = ({ articulo }) => {
  const navigate = useNavigate();

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        onClick={() => navigate(`/kb/${articulo.art_slug}`)}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
            {articulo.art_tipo && (
              <Chip
                label={articulo.art_tipo}
                size="small"
                color={tipoColors[articulo.art_tipo] || "default"}
                sx={{ height: 22, fontSize: 11 }}
              />
            )}
            {articulo.art_audiencia && (
              <Chip
                label={articulo.art_audiencia}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 11 }}
              />
            )}
          </Box>

          <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3, mb: 1 }}>
            {articulo.art_titulo}
          </Typography>

          {articulo.art_resumen && (
            <Typography variant="body2" color="text.secondary" sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {articulo.art_resumen}
            </Typography>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <ThumbUp sx={{ fontSize: 14, color: "success.main" }} />
              <Typography variant="caption" color="text.secondary">
                {articulo.art_votos_si || 0}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <ThumbDown sx={{ fontSize: 14, color: "error.main" }} />
              <Typography variant="caption" color="text.secondary">
                {articulo.art_votos_no || 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ArticleCard;
