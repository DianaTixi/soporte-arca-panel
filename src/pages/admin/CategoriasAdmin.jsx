import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "../../api/categoriaApi";

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ cat_nombre: "", cat_descripcion: "", cat_icono: "" });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCategorias();
      setCategorias(data.categorias || []);
    } catch {
      setError("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (cat = null) => {
    if (cat) {
      setEditingId(cat.cat_id);
      setForm({
        cat_nombre: cat.cat_nombre,
        cat_descripcion: cat.cat_descripcion || "",
        cat_icono: cat.cat_icono || "",
      });
    } else {
      setEditingId(null);
      setForm({ cat_nombre: "", cat_descripcion: "", cat_icono: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await actualizarCategoria(editingId, form);
        toast.success("Categoría actualizada");
      } else {
        await crearCategoria(form);
        toast.success("Categoría creada");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await eliminarCategoria(id);
      toast.success("Categoría eliminada");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Categorías</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nueva categoría
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Icono</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorias.map((cat) => (
              <TableRow key={cat.cat_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{cat.cat_nombre}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {cat.cat_descripcion || "—"}
                  </Typography>
                </TableCell>
                <TableCell>{cat.cat_icono || "—"}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpen(cat)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat.cat_id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && categorias.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay categorías
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={form.cat_nombre}
              onChange={(e) => setForm({ ...form, cat_nombre: e.target.value })}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={form.cat_descripcion}
              onChange={(e) => setForm({ ...form, cat_descripcion: e.target.value })}
            />
            <TextField
              label="Icono (emoji o nombre)"
              fullWidth
              value={form.cat_icono}
              onChange={(e) => setForm({ ...form, cat_icono: e.target.value })}
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

export default CategoriasAdmin;
