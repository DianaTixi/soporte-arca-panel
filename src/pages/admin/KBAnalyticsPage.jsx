import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, CircularProgress, Grid,
} from "@mui/material";
import { Visibility, ThumbUp, ThumbDown, Search, SearchOff, Article as ArticleIcon, Category } from "@mui/icons-material";
import { obtenerStatsKB } from "../../api/statsApi";

const StatCard = ({ icon, label, value, color = "primary" }) => (
  <Paper variant="outlined" sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
    <Box sx={{ bgcolor: `${color}.main`, color: "#fff", borderRadius: 2, p: 1, display: "flex" }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={700}>{value ?? "—"}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  </Paper>
);

const MiniTable = ({ title, icon, rows, columns, emptyMsg = "Sin datos" }) => (
  <Paper variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
    </Box>
    <TableContainer sx={{ maxHeight: 360 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || "left"} sx={{ fontWeight: 600 }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>{emptyMsg}</TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={i} hover>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || "left"}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const KBAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await obtenerStatsKB();
        setData(resp);
      } catch {
        setError("Error al cargar analytics de KB");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const r = data?.resumen || {};

  const artColumns = [
    { key: "art_titulo", label: "Artículo", render: (row) => (
      <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.art_titulo}
      </Typography>
    )},
    { key: "cat_nombre", label: "Categoría", render: (row) => row.cat_nombre ? <Chip label={row.cat_nombre} size="small" variant="outlined" /> : "—" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Analytics de Base de Conocimiento</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard icon={<ArticleIcon />} label="Total artículos" value={r.total_articulos} color="primary" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<Visibility />} label="Total vistas" value={r.total_vistas} color="info" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<ThumbUp />} label="Votos positivos" value={r.total_util_si} color="success" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<ThumbDown />} label="Votos negativos" value={r.total_util_no} color="error" />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", md: "row" } }}>
        <MiniTable
          title="Artículos más vistos"
          icon={<Visibility fontSize="small" color="info" />}
          rows={data?.articulos_populares || []}
          columns={[
            ...artColumns,
            { key: "art_vistas", label: "Vistas", align: "center", render: (row) => <Chip label={row.art_vistas} size="small" color="info" /> },
          ]}
        />
        <MiniTable
          title="Artículos más útiles"
          icon={<ThumbUp fontSize="small" color="success" />}
          rows={data?.articulos_utiles || []}
          columns={[
            ...artColumns,
            { key: "art_util_si", label: "Positivos", align: "center", render: (row) => <Chip label={row.art_util_si} size="small" color="success" /> },
          ]}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", md: "row" } }}>
        <MiniTable
          title="Artículos menos útiles"
          icon={<ThumbDown fontSize="small" color="error" />}
          rows={data?.articulos_menos_utiles || []}
          columns={[
            ...artColumns,
            { key: "art_util_no", label: "Negativos", align: "center", render: (row) => <Chip label={row.art_util_no} size="small" color="error" /> },
          ]}
          emptyMsg="Ningún artículo con votos negativos"
        />
        <MiniTable
          title="Búsquedas populares"
          icon={<Search fontSize="small" color="primary" />}
          rows={data?.busquedas_populares || []}
          columns={[
            { key: "log_query", label: "Búsqueda" },
            { key: "total", label: "Veces", align: "center", render: (row) => <Chip label={row.total} size="small" /> },
          ]}
          emptyMsg="Sin búsquedas registradas"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", md: "row" } }}>
        <MiniTable
          title="Búsquedas sin resultados"
          icon={<SearchOff fontSize="small" color="warning" />}
          rows={data?.busquedas_sin_resultados || []}
          columns={[
            { key: "log_query", label: "Búsqueda" },
            { key: "total", label: "Veces", align: "center", render: (row) => <Chip label={row.total} size="small" color="warning" /> },
          ]}
          emptyMsg="Todas las búsquedas tienen resultados"
        />
        <Box sx={{ flex: 1, display: "flex", gap: 2, flexDirection: "column" }}>
          <MiniTable
            title="Por categoría"
            icon={<Category fontSize="small" color="primary" />}
            rows={data?.articulos_por_categoria || []}
            columns={[
              { key: "cat_nombre", label: "Categoría", render: (row) => row.cat_nombre || "Sin categoría" },
              { key: "total", label: "Artículos", align: "center" },
            ]}
          />
          <MiniTable
            title="Por tipo"
            icon={<ArticleIcon fontSize="small" color="secondary" />}
            rows={data?.articulos_por_tipo || []}
            columns={[
              { key: "art_tipo", label: "Tipo", render: (row) => <Chip label={row.art_tipo} size="small" variant="outlined" /> },
              { key: "total", label: "Artículos", align: "center" },
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default KBAnalyticsPage;
