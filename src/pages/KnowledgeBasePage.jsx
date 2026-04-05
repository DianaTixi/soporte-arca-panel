import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
} from "@mui/material";
import { getArticulos, buscarArticulos } from "../api/articuloApi";
import { getCategorias } from "../api/categoriaApi";
import SearchBar from "../components/kb/SearchBar";
import ArticleCard from "../components/kb/ArticleCard";

const KnowledgeBasePage = () => {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ categoriaId: "", tipo: "", audiencia: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCategorias()
      .then(({ data }) => setCategorias(data.categorias || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadArticulos();
  }, [filters, searchQuery]);

  const loadArticulos = async () => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (searchQuery) {
        const resp = await buscarArticulos(searchQuery, {
          categoriaId: filters.categoriaId || undefined,
          tipo: filters.tipo || undefined,
          audiencia: filters.audiencia || undefined,
        });
        data = resp.data;
      } else {
        const resp = await getArticulos({
          categoriaId: filters.categoriaId || undefined,
          tipo: filters.tipo || undefined,
          audiencia: filters.audiencia || undefined,
        });
        data = resp.data;
      }
      setArticulos(data.articulos || []);
    } catch {
      setError("Error al cargar artículos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Base de Conocimiento
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Encuentra guías, FAQs y artículos de diagnóstico
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Box sx={{ flex: "1 1 300px" }}>
          <SearchBar onSearch={setSearchQuery} />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={filters.categoriaId}
            label="Categoría"
            onChange={(e) => setFilters({ ...filters, categoriaId: e.target.value })}
          >
            <MenuItem value="">Todas</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.cat_id} value={cat.cat_id}>
                {cat.cat_nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filters.tipo}
            label="Tipo"
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="faq">FAQ</MenuItem>
            <MenuItem value="guia">Guía</MenuItem>
            <MenuItem value="tecnico">Técnico</MenuItem>
            <MenuItem value="diagnostico">Diagnóstico</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Audiencia</InputLabel>
          <Select
            value={filters.audiencia}
            label="Audiencia"
            onChange={(e) => setFilters({ ...filters, audiencia: e.target.value })}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="soporte">Soporte</MenuItem>
            <MenuItem value="tecnico">Técnico</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : articulos.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron artículos
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {articulos.map((art) => (
            <Grid item xs={12} sm={6} md={4} key={art.art_id}>
              <ArticleCard articulo={art} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default KnowledgeBasePage;
