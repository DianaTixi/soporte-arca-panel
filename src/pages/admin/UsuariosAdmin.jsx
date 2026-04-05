import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Chip, Alert, Tooltip, Switch,
} from "@mui/material";
import { Add, Edit, VpnKey } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getUsuarios, registroApi, actualizarUsuarioApi, cambiarPasswordApi } from "../../api/authApi";

const rolLabels = {
  admin: { label: "Administrador", color: "error" },
  soporte_tecnico: { label: "Soporte Técnico", color: "primary" },
  soporte: { label: "Soporte", color: "default" },
};

const emptyForm = { nombre: "", email: "", password: "", rol: "soporte" };

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdUserId, setPwdUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getUsuarios();
      setUsuarios(data.usuarios || []);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (usr = null) => {
    if (usr) {
      setEditingId(usr.usu_id);
      setForm({ nombre: usr.usu_nombre, email: usr.usu_email, password: "", rol: usr.usu_rol });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await actualizarUsuarioApi(editingId, { nombre: form.nombre, rol: form.rol });
        toast.success("Usuario actualizado");
      } else {
        await registroApi(form);
        toast.success("Usuario creado");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar usuario");
    }
  };

  const handleToggleActivo = async (usr) => {
    try {
      await actualizarUsuarioApi(usr.usu_id, { activo: !usr.usu_activo });
      toast.success(usr.usu_activo ? "Usuario desactivado" : "Usuario activado");
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al cambiar estado");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      toast.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    try {
      await cambiarPasswordApi(pwdUserId, { password: newPassword });
      toast.success("Contraseña actualizada");
      setPwdDialogOpen(false);
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al cambiar contraseña");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Usuarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nuevo usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usr) => (
              <TableRow key={usr.usu_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{usr.usu_nombre}</Typography>
                </TableCell>
                <TableCell>{usr.usu_email}</TableCell>
                <TableCell>
                  <Chip
                    label={rolLabels[usr.usu_rol]?.label || usr.usu_rol}
                    size="small"
                    color={rolLabels[usr.usu_rol]?.color || "default"}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={usr.usu_activo}
                    onChange={() => handleToggleActivo(usr)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {usr.usu_created_at ? new Date(usr.usu_created_at).toLocaleDateString("es") : "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleOpen(usr)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cambiar contraseña">
                    <IconButton size="small" onClick={() => { setPwdUserId(usr.usu_id); setPwdDialogOpen(true); }}>
                      <VpnKey fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!loading && usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No se pudieron cargar los usuarios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog crear/editar usuario */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nombre" fullWidth value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            {!editingId && (
              <>
                <TextField
                  label="Email" type="email" fullWidth value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <TextField
                  label="Contraseña" type="password" fullWidth value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select value={form.rol} label="Rol" onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <MenuItem value="soporte">Soporte</MenuItem>
                <MenuItem value="soporte_tecnico">Soporte Técnico</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cambiar contraseña */}
      <Dialog open={pwdDialogOpen} onClose={() => setPwdDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          <TextField
            label="Nueva contraseña" type="password" fullWidth sx={{ mt: 1 }}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPwdDialogOpen(false); setNewPassword(""); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleChangePassword}>Cambiar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosAdmin;
