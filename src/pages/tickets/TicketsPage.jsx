import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Search as SearchIcon, ConfirmationNumber } from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import { getTickets } from "../../api/ticketApi";
import CrearTicketDialog from "./CrearTicketDialog";

const estadoColors = {
  abierto: "info", en_progreso: "warning", escalado: "error", resuelto: "success", cerrado: "default",
};
const estadoLabels = {
  abierto: "Abierto", en_progreso: "En progreso", escalado: "Escalado", resuelto: "Resuelto", cerrado: "Cerrado",
};
const prioridadColors = {
  baja: "default", media: "info", alta: "warning", critica: "error",
};

const formatFechaRelativa = (fecha) => {
  if (!fecha) return "—";
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(fecha).toLocaleDateString("es");
};

const TicketsPage = () => {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtros
  const [filtroRapido, setFiltroRapido] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const esTecnico = usuario?.rol === "admin" || usuario?.rol === "soporte_tecnico";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroPrioridad) params.prioridad = filtroPrioridad;
      if (filtroModulo) params.modulo = filtroModulo;
      if (busqueda.trim()) params.q = busqueda.trim();

      if (filtroRapido === "mis") params.mis_tickets = "true";
      else if (filtroRapido === "asignados") params.asignados_a_mi = "true";
      else if (filtroRapido === "escalados") params.estado = "escalado";

      const { data } = await getTickets(params);
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch {
      setError("Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  }, [filtroRapido, filtroEstado, filtroPrioridad, filtroModulo, busqueda]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const filtrosRapidos = [
    { key: "todos", label: esTecnico ? "Todos" : "Mis tickets" },
    { key: "mis", label: "Creados por mí" },
    { key: "asignados", label: "Asignados a mí" },
    { key: "escalados", label: "Escalados" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ConfirmationNumber color="primary" />
          <Typography variant="h5" fontWeight={700}>Tickets de Soporte</Typography>
          <Chip label={total} size="small" sx={{ ml: 1 }} />
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Nuevo Ticket
        </Button>
      </Box>

      {/* Filtros rápidos */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {filtrosRapidos.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            variant={filtroRapido === f.key ? "filled" : "outlined"}
            color={filtroRapido === f.key ? "primary" : "default"}
            onClick={() => { setFiltroRapido(f.key); setFiltroEstado(""); }}
            clickable
          />
        ))}
      </Box>

      {/* Filtros detallados */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small" placeholder="Buscar..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado} label="Estado" onChange={(e) => { setFiltroEstado(e.target.value); setFiltroRapido("todos"); }}>
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(estadoLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Prioridad</InputLabel>
          <Select value={filtroPrioridad} label="Prioridad" onChange={(e) => setFiltroPrioridad(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="baja">Baja</MenuItem>
            <MenuItem value="media">Media</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
            <MenuItem value="critica">Critica</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Módulo</InputLabel>
          <Select value={filtroModulo} label="Módulo" onChange={(e) => setFiltroModulo(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {["general", "usuarios", "formularios", "charlas", "tareas", "incidencias", "inspecciones", "reportes", "rankings", "estructura"].map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Módulo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Creado por</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Asignado a</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
            {!loading && tickets.map((t) => (
              <TableRow
                key={t.tick_id} hover
                onClick={() => navigate(`/tickets/${t.tick_id}`)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Typography variant="body2" color="primary" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
                    {t.tick_numero}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.tick_titulo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={estadoLabels[t.tick_estado] || t.tick_estado} size="small" color={estadoColors[t.tick_estado] || "default"} />
                </TableCell>
                <TableCell>
                  <Chip label={t.tick_prioridad} size="small" variant="outlined" color={prioridadColors[t.tick_prioridad] || "default"} />
                </TableCell>
                <TableCell>
                  {t.tick_modulo && <Chip label={t.tick_modulo} size="small" variant="outlined" />}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{t.creador_nombre || "—"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={t.asignado_nombre ? "text.primary" : "text.disabled"}>
                    {t.asignado_nombre || "Sin asignar"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {formatFechaRelativa(t.tick_created_at)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!loading && tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No hay tickets
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CrearTicketDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={load} />
    </Box>
  );
};

export default TicketsPage;
