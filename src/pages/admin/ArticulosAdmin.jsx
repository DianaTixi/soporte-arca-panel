import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Chip, Alert, Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getArticulos, crearArticulo, actualizarArticulo, eliminarArticulo } from "../../api/articuloApi";
import { getCategorias } from "../../api/categoriaApi";

const emptyForm = {
  art_titulo: "", art_slug: "", art_resumen: "", art_contenido: "",
  art_tipo: "guia", art_audiencia: "soporte", art_tags: "", cat_id: "",
};

const ArticulosAdmin = () => {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [artResp, catResp] = await Promise.all([getArticulos(), getCategorias()]);
      setArticulos(artResp.data.articulos || []);
      setCategorias(catResp.data.categorias || []);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generateSlug = (titulo) =>
    titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleOpen = (articulo = null) => {
    if (articulo) {
      setEditingId(articulo.art_id);
      setForm({
        art_titulo: articulo?.art_titulo,
        art_slug: articulo?.art_slug,
        art_resumen: articulo?.art_resumen || "",
        art_contenido: articulo?.art_contenido || "",
        art_tipo: articulo?.art_tipo || "guia",
        art_audiencia: articulo?.art_audiencia || "soporte",
        art_tags: (articulo.art_tags || []).join(", "),
        cat_id: articulo?.art_categoria_id || "",
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        art_slug: form.art_slug || generateSlug(form.art_titulo),
        art_tags: form.art_tags ? form.art_tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        cat_id: form.cat_id || null,
      };
      if (editingId) {
        await actualizarArticulo(editingId, payload);
        toast.success("Artículo actualizado");
      } else {
        await crearArticulo(payload);
        toast.success("Artículo creado");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    try {
      await eliminarArticulo(id);
      toast.success("Artículo eliminado");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Artículos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nuevo artículo
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Audiencia</TableCell>
              <TableCell>Votos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulos.map((art) => (
              <TableRow key={art.art_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{art.art_titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">{art.art_slug}</Typography>
                </TableCell>
                <TableCell><Chip label={art.art_tipo} size="small" /></TableCell>
                <TableCell><Chip label={art.art_audiencia} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography variant="body2">
                    👍 {art.art_votos_si || 0} · 👎 {art.art_votos_no || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpen(art)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(art.art_id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && articulos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No hay artículos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Editar artículo" : "Nuevo artículo"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={form.art_titulo}
              onChange={(e) => setForm({ ...form, art_titulo: e.target.value })}
            />
            <TextField
              label="Slug"
              fullWidth
              value={form.art_slug}
              onChange={(e) => setForm({ ...form, art_slug: e.target.value })}
              helperText="Se genera automáticamente si se deja vacío"
            />
            <TextField
              label="Resumen"
              fullWidth
              multiline
              rows={2}
              value={form.art_resumen}
              onChange={(e) => setForm({ ...form, art_resumen: e.target.value })}
            />
            <TextField
              label="Contenido (Markdown)"
              fullWidth
              multiline
              rows={10}
              value={form?.art_contenido}
              onChange={(e) => setForm({ ...form, art_contenido: e.target.value })}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select value={form.art_tipo} label="Tipo" onChange={(e) => setForm({ ...form, art_tipo: e.target.value })}>
                  <MenuItem value="faq">FAQ</MenuItem>
                  <MenuItem value="guia">Guía</MenuItem>
                  <MenuItem value="tecnico">Técnico</MenuItem>
                  <MenuItem value="diagnostico">Diagnóstico</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Audiencia</InputLabel>
                <Select value={form.art_audiencia} label="Audiencia" onChange={(e) => setForm({ ...form, art_audiencia: e.target.value })}>
                  <MenuItem value="soporte">Soporte</MenuItem>
                  <MenuItem value="tecnico">Técnico</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select value={form.cat_id} label="Categoría" onChange={(e) => setForm({ ...form, cat_id: e.target.value })}>
                  <MenuItem value="">Sin categoría</MenuItem>
                  {categorias.map((cat) => (
                    <MenuItem key={cat.cat_id} value={cat.cat_id}>{cat.cat_nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Tags (separados por coma)"
              fullWidth
              value={form.art_tags}
              onChange={(e) => setForm({ ...form, art_tags: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticulosAdmin;
