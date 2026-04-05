import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Box,
} from "@mui/material";
import toast from "react-hot-toast";
import { crearTicket } from "../../api/ticketApi";

const moduloOptions = [
  "general", "usuarios", "formularios", "charlas", "tareas",
  "incidencias", "inspecciones", "reportes", "rankings", "estructura", "notificaciones",
];

const prioridadOptions = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Critica" },
];

const emptyForm = { titulo: "", descripcion: "", modulo: "general", prioridad: "media", tags: "" };

const CrearTicketDialog = ({ open, onClose, onCreated, chatSessionId, tituloInicial, descripcionInicial }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        titulo: tituloInicial || "",
        descripcion: descripcionInicial || "",
        modulo: "general",
        prioridad: "media",
        tags: "",
      });
    }
  }, [open, tituloInicial, descripcionInicial]);

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        modulo: form.modulo || null,
        prioridad: form.prioridad,
        chatSessionId: chatSessionId || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const { data } = await crearTicket(payload);
      toast.success(`Ticket ${data.ticket.tick_numero} creado`);
      onCreated?.(data.ticket);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al crear ticket");
    } finally {
      setSaving(false);
    }
  };

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Ticket de Soporte</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Título" fullWidth value={form.titulo} onChange={setField("titulo")}
            placeholder="Describe brevemente el problema" />
          <TextField label="Descripción" fullWidth multiline rows={4} value={form.descripcion}
            onChange={setField("descripcion")} placeholder="Detalla el problema, pasos para reproducir, etc." />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Módulo</InputLabel>
              <Select value={form.modulo} label="Módulo" onChange={setField("modulo")}>
                {moduloOptions.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select value={form.prioridad} label="Prioridad" onChange={setField("prioridad")}>
                {prioridadOptions.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TextField label="Tags (separados por coma)" fullWidth value={form.tags} onChange={setField("tags")} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Creando..." : "Crear Ticket"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrearTicketDialog;
