import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Chip, Alert, Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getMemorias, crearMemoria, actualizarMemoria, eliminarMemoria } from "../../api/memoriaApi";

const categoriaColors = {
  patron: "primary", solucion: "success", error_comun: "error", diagnostico: "warning", tip: "info",
};

const moduloOptions = [
  "general", "usuarios", "formularios", "charlas", "tareas",
  "incidencias", "inspecciones", "reportes", "rankings", "estructura", "notificaciones",
];

const emptyForm = { titulo: "", contenido: "", categoria: "patron", modulo: "general", tags: "" };

const MemoriasAdmin = () => {
  const [memorias, setMemorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroModulo) params.modulo = filtroModulo;
      if (filtroCategoria) params.categoria = filtroCategoria;
      const { data } = await getMemorias(params);
      setMemorias(data.memorias || []);
    } catch {
      setError("Error al cargar memorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filtroModulo, filtroCategoria]);

  const handleOpen = (mem = null) => {
    if (mem) {
      setEditingId(mem.mem_id);
      setForm({
        titulo: mem.mem_titulo || "",
        contenido: mem.mem_contenido || "",
        categoria: mem.mem_categoria || "patron",
        modulo: mem.mem_modulo || "general",
        tags: (mem.mem_tags || []).join(", "),
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
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await actualizarMemoria(editingId, payload);
        toast.success("Memoria actualizada");
      } else {
        await crearMemoria(payload);
        toast.success("Memoria creada");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Desactivar esta memoria?")) return;
    try {
      await eliminarMemoria(id);
      toast.success("Memoria desactivada");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Memorias del Agente</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nueva memoria
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Módulo</InputLabel>
          <Select value={filtroModulo} label="Módulo" onChange={(e) => setFiltroModulo(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {moduloOptions.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={filtroCategoria} label="Categoría" onChange={(e) => setFiltroCategoria(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {Object.keys(categoriaColors).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell align="center">Usos</TableCell>
              <TableCell>Último uso</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memorias.map((mem) => (
              <TableRow key={mem.mem_id} hover>
                <TableCell>
                  <Chip label={mem.mem_categoria} size="small" color={categoriaColors[mem.mem_categoria] || "default"} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mem.mem_titulo}
                  </Typography>
                </TableCell>
                <TableCell><Chip label={mem.mem_modulo} size="small" variant="outlined" /></TableCell>
                <TableCell align="center">
                  <Chip label={mem.mem_veces_usado} size="small" color={mem.mem_veces_usado > 5 ? "primary" : "default"} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {mem.mem_fecha_ultimo_uso ? new Date(mem.mem_fecha_ultimo_uso).toLocaleDateString("es") : "Nunca"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpen(mem)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Desactivar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(mem.mem_id)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && memorias.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No hay memorias</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Editar memoria" : "Nueva memoria"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Título" fullWidth value={form.titulo} onChange={setField("titulo")} />
            <TextField label="Contenido" fullWidth multiline rows={6} value={form.contenido} onChange={setField("contenido")} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select value={form.categoria} label="Categoría" onChange={setField("categoria")}>
                  {Object.keys(categoriaColors).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Módulo</InputLabel>
                <Select value={form.modulo} label="Módulo" onChange={setField("modulo")}>
                  {moduloOptions.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField label="Tags (separados por coma)" fullWidth value={form.tags} onChange={setField("tags")} />
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

export default MemoriasAdmin;
