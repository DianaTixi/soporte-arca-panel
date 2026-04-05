import { Box, Typography, CircularProgress } from "@mui/material";
import { Search, Storage, BugReport } from "@mui/icons-material";

const toolLabels = {
  buscar_articulos: { label: "Buscando en la base de conocimiento...", icon: <Search fontSize="small" /> },
  obtener_articulo: { label: "Leyendo artículo...", icon: <Search fontSize="small" /> },
  buscar_por_categoria: { label: "Explorando categoría...", icon: <Search fontSize="small" /> },
  buscar_diagnostico: { label: "Buscando diagnósticos...", icon: <BugReport fontSize="small" /> },
  obtener_queries_sql: { label: "Generando queries SQL...", icon: <Storage fontSize="small" /> },
  buscar_error_exacto: { label: "Buscando error en la base de datos...", icon: <BugReport fontSize="small" /> },
};

const ChatToolIndicator = ({ tool }) => {
  if (!tool) return null;

  const info = toolLabels[tool] || { label: "Procesando...", icon: <Search fontSize="small" /> };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        mx: 2,
        mb: 1,
        bgcolor: "grey.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CircularProgress size={16} thickness={5} />
      {info.icon}
      <Typography variant="body2" color="text.secondary">
        {info.label}
      </Typography>
    </Box>
  );
};

export default ChatToolIndicator;
