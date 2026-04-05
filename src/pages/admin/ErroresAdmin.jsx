import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Chip, Alert, Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getErrores, getModulos, crearError, actualizarError, eliminarError } from "../../api/errorApi";

const emptyForm = {
  modulo: "", mensaje: "", endpoint: "", httpCode: 400, causa: "",
  solucionTecnica: "", solucionUsuario: "", navegacion: "", queryDiagnostico: "",
  articuloId: "", tags: "",
};

const ErroresAdmin = () => {
  const [errores, setErrores] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filtroModulo, setFiltroModulo] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroModulo) params.modulo = filtroModulo;
      const [errResp, modResp] = await Promise.all([getErrores(params), getModulos()]);
      setErrores(errResp.data.errores || []);
      setModulos(modResp.data.modulos || []);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filtroModulo]);

  const handleOpen = (err = null) => {
    if (err) {
      setEditingId(err.err_id);
      setForm({
        modulo: err.err_modulo || "",
        mensaje: err.err_mensaje || "",
        endpoint: err.err_endpoint || "",
        httpCode: err.err_http_code || 400,
        causa: err.err_causa || "",
        solucionTecnica: err.err_solucion_tecnica || "",
        solucionUsuario: err.err_solucion_usuario || "",
        navegacion: err.err_navegacion || "",
        queryDiagnostico: err.err_query_diagnostico || "",
        articuloId: err.err_articulo_id || "",
        tags: (err.err_tags || []).join(", "),
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
        httpCode: Number(form.httpCode) || 400,
        articuloId: form.articuloId || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await actualizarError(editingId, payload);
        toast.success("Error actualizado");
      } else {
        await crearError(payload);
        toast.success("Error creado");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Desactivar este mapeo de error?")) return;
    try {
      await eliminarError(id);
      toast.success("Error desactivado");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const f = (v) => ({ ...form, [v.target ? v.target.name || "": ""]: v.target?.value });
  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Mapeo de Errores</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nuevo error
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por módulo</InputLabel>
          <Select value={filtroModulo} label="Filtrar por módulo" onChange={(e) => setFiltroModulo(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {modulos.map((m) => (
              <MenuItem key={m.err_modulo} value={m.err_modulo}>
                {m.err_modulo} ({m.total})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Módulo</TableCell>
              <TableCell>Mensaje</TableCell>
              <TableCell>HTTP</TableCell>
              <TableCell>Causa</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errores.map((err) => (
              <TableRow key={err.err_id} hover>
                <TableCell><Chip label={err.err_modulo} size="small" /></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {err.err_mensaje}
                  </Typography>
                </TableCell>
                <TableCell><Chip label={err.err_http_code} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {err.err_causa}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpen(err)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Desactivar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(err.err_id)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && errores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No hay errores mapeados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Editar error" : "Nuevo error"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Módulo" fullWidth value={form.modulo} onChange={setField("modulo")}
                placeholder="usuario, formulario, charla..." />
              <TextField label="HTTP Code" type="number" sx={{ width: 120 }}
                value={form.httpCode} onChange={setField("httpCode")} />
            </Box>
            <TextField label="Mensaje de error" fullWidth value={form.mensaje} onChange={setField("mensaje")}
              placeholder="Texto exacto del error que muestra el backend" />
            <TextField label="Endpoint" fullWidth value={form.endpoint} onChange={setField("endpoint")}
              placeholder="POST /api/usuario, PUT /api/charla/:id" />
            <TextField label="Causa técnica" fullWidth multiline rows={2}
              value={form.causa} onChange={setField("causa")} />
            <TextField label="Solución técnica" fullWidth multiline rows={2}
              value={form.solucionTecnica} onChange={setField("solucionTecnica")} />
            <TextField label="Solución usuario (lenguaje simple)" fullWidth multiline rows={2}
              value={form.solucionUsuario} onChange={setField("solucionUsuario")} />
            <TextField label="Navegación en panel" fullWidth value={form.navegacion} onChange={setField("navegacion")}
              placeholder="Panel → Usuarios → Editar" />
            <TextField label="Query diagnóstico (SQL)" fullWidth multiline rows={2}
              value={form.queryDiagnostico} onChange={setField("queryDiagnostico")} />
            <TextField label="Tags (separados por coma)" fullWidth
              value={form.tags} onChange={setField("tags")} />
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

export default ErroresAdmin;
