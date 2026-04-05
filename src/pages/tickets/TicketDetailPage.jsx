import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, Button, TextField, Avatar, Divider, Alert,
  CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Switch,
} from "@mui/material";
import {
  ArrowBack, Chat as ChatIcon, Escalator, CheckCircle, Lock, LockOpen,
  Person, Schedule, ConfirmationNumber, Article, Psychology, BugReport, Send,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import {
  getTicketPorId, getComentarios, getHistorial,
  tomarTicket, escalarTicket, resolverTicket, cerrarTicket, reabrirTicket,
  crearComentario,
} from "../../api/ticketApi";
import { crearArticulo } from "../../api/articuloApi";
import { crearMemoria } from "../../api/memoriaApi";
import { crearError } from "../../api/errorApi";

const estadoColors = {
  abierto: "info", en_progreso: "warning", escalado: "error", resuelto: "success", cerrado: "default",
};
const estadoLabels = {
  abierto: "Abierto", en_progreso: "En progreso", escalado: "Escalado", resuelto: "Resuelto", cerrado: "Cerrado",
};
const prioridadColors = {
  baja: "default", media: "info", alta: "warning", critica: "error",
};

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(fecha));
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);

  const [ticket, setTicket] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment input
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [esInterno, setEsInterno] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Dialogs
  const [escalarOpen, setEscalarOpen] = useState(false);
  const [escalarMotivo, setEscalarMotivo] = useState("");
  const [resolverOpen, setResolverOpen] = useState(false);
  const [solucionTexto, setSolucionTexto] = useState("");
  const [reabrirOpen, setReabrirOpen] = useState(false);
  const [reabrirMotivo, setReabrirMotivo] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");

  const esTecnico = usuario?.rol === "admin" || usuario?.rol === "soporte_tecnico";
  const esCreador = ticket?.tick_creado_por === usuario?.id;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tickRes, comRes] = await Promise.all([
        getTicketPorId(id),
        getComentarios(id),
      ]);
      setTicket(tickRes.data.ticket);
      setComentarios(comRes.data.comentarios || []);

      if (esTecnico) {
        try {
          const histRes = await getHistorial(id);
          setHistorial(histRes.data.historial || []);
        } catch { /* ignore */ }
      }
    } catch {
      setError("Error al cargar el ticket");
    } finally {
      setLoading(false);
    }
  }, [id, esTecnico]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Actions ────────────────────────────────────────────────
  const handleTomar = async () => {
    try {
      await tomarTicket(id);
      toast.success("Ticket tomado");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
  };

  const handleEscalar = async () => {
    try {
      await escalarTicket(id, { motivo: escalarMotivo || undefined });
      toast.success("Ticket escalado a soporte técnico");
      setEscalarOpen(false);
      setEscalarMotivo("");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
  };

  const handleResolver = async () => {
    if (!solucionTexto.trim()) { toast.error("Debe incluir la solución"); return; }
    try {
      await resolverTicket(id, { solucion: solucionTexto.trim() });
      toast.success("Ticket resuelto");
      setResolverOpen(false);
      setSolucionTexto("");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
  };

  const handleCerrar = async () => {
    try {
      await cerrarTicket(id);
      toast.success("Ticket cerrado");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
  };

  const handleReabrir = async () => {
    try {
      await reabrirTicket(id, { motivo: reabrirMotivo || undefined });
      toast.success("Ticket reabierto");
      setReabrirOpen(false);
      setReabrirMotivo("");
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error"); }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      await crearComentario(id, {
        contenido: nuevoComentario.trim(),
        esInterno: esInterno && esTecnico,
      });
      setNuevoComentario("");
      setEsInterno(false);
      loadAll();
    } catch (err) { toast.error(err.response?.data?.msg || "Error al comentar"); }
    finally { setEnviando(false); }
  };

  // ── Knowledge Feedback ─────────────────────────────────────
  const handleFeedback = async () => {
    try {
      if (feedbackType === "articulo") {
        await crearArticulo({
          titulo: ticket.tick_titulo,
          contenido: `## Problema\n${ticket.tick_descripcion || ticket.tick_titulo}\n\n## Solución\n${ticket.tick_solucion}`,
          resumen: ticket.tick_descripcion || ticket.tick_titulo,
          tipo: "faq",
          audiencia: "todos",
          tags: ticket.tick_tags || [],
        });
        toast.success("Artículo KB creado");
      } else if (feedbackType === "memoria") {
        await crearMemoria({
          titulo: `Solución: ${ticket.tick_titulo}`,
          contenido: `Problema: ${ticket.tick_descripcion || ticket.tick_titulo}\nSolución: ${ticket.tick_solucion}`,
          categoria: "solucion",
          modulo: ticket.tick_modulo || "general",
          tags: (ticket.tick_tags || []).join(", "),
        });
        toast.success("Memoria del agente guardada");
      } else if (feedbackType === "error") {
        await crearError({
          modulo: ticket.tick_modulo || "general",
          mensaje: ticket.tick_titulo,
          causa: ticket.tick_descripcion || "",
          solucionTecnica: ticket.tick_solucion,
          solucionUsuario: ticket.tick_solucion,
          tags: (ticket.tick_tags || []).join(", "),
        });
        toast.success("Mapeo de error creado");
      }
      setFeedbackOpen(false);
      setFeedbackType("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al guardar");
    }
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }
  if (error || !ticket) {
    return <Alert severity="error" sx={{ m: 3 }}>{error || "Ticket no encontrado"}</Alert>;
  }

  const estado = ticket.tick_estado;

  // Build merged timeline from comments + historial
  const timeline = [
    ...comentarios.map((c) => ({ ...c, _type: "comentario", _date: c.tcom_created_at })),
    ...historial.map((h) => ({ ...h, _type: "historial", _date: h.this_created_at })),
  ].sort((a, b) => new Date(a._date) - new Date(b._date));

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate("/tickets")}><ArrowBack /></IconButton>
        <ConfirmationNumber color="primary" />
        <Typography variant="h6" fontWeight={700} color="primary">{ticket.tick_numero}</Typography>
        <Chip label={estadoLabels[estado]} size="small" color={estadoColors[estado]} />
        <Chip label={ticket.tick_prioridad} size="small" variant="outlined" color={prioridadColors[ticket.tick_prioridad]} />
        {ticket.tick_modulo && <Chip label={ticket.tick_modulo} size="small" variant="outlined" />}
      </Box>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{ticket.tick_titulo}</Typography>

      {ticket.tick_descripcion && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>{ticket.tick_descripcion}</Typography>
        </Paper>
      )}

      {/* Info panel */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Creado por</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" fontWeight={600}>{ticket.creador_nombre}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Asignado a</Typography>
            <Typography variant="body2" fontWeight={600}>
              {ticket.asignado_nombre || "Sin asignar"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Creado</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="body2">{formatFecha(ticket.tick_created_at)}</Typography>
            </Box>
          </Box>
          {ticket.tick_fecha_resolucion && (
            <Box>
              <Typography variant="caption" color="text.secondary">Resuelto</Typography>
              <Typography variant="body2">{formatFecha(ticket.tick_fecha_resolucion)}</Typography>
            </Box>
          )}
          {ticket.tick_chat_session_id && (
            <Box>
              <Button size="small" startIcon={<ChatIcon />} onClick={() => navigate("/chat")} variant="outlined">
                Ver conversación
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Solution banner */}
      {ticket.tick_solucion && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700}>Solución</Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{ticket.tick_solucion}</Typography>
        </Alert>
      )}

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {["abierto", "escalado"].includes(estado) && (
          <Button variant="contained" size="small" onClick={handleTomar}>
            Tomar ticket
          </Button>
        )}
        {["abierto", "en_progreso"].includes(estado) && (
          <Button variant="outlined" color="error" size="small" startIcon={<Escalator />}
            onClick={() => setEscalarOpen(true)}>
            Escalar a técnico
          </Button>
        )}
        {["abierto", "en_progreso", "escalado"].includes(estado) && (esCreador || esTecnico) && (
          <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />}
            onClick={() => setResolverOpen(true)}>
            Resolver
          </Button>
        )}
        {estado === "resuelto" && esTecnico && (
          <Button variant="contained" size="small" startIcon={<Lock />} onClick={handleCerrar}>
            Cerrar
          </Button>
        )}
        {["resuelto", "cerrado"].includes(estado) && (
          <Button variant="outlined" size="small" startIcon={<LockOpen />}
            onClick={() => setReabrirOpen(true)}>
            Reabrir
          </Button>
        )}
      </Box>

      {/* Knowledge feedback panel (only on resolved tickets, tecnico+admin) */}
      {estado === "resuelto" && esTecnico && ticket.tick_solucion && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: "success.main", bgcolor: "success.50" }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Contribuir al conocimiento del agente
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Transforma esta solución en conocimiento reutilizable para el agente IA:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" startIcon={<Article />}
              onClick={() => { setFeedbackType("articulo"); setFeedbackOpen(true); }}>
              Crear artículo KB
            </Button>
            <Button size="small" variant="outlined" startIcon={<Psychology />}
              onClick={() => { setFeedbackType("memoria"); setFeedbackOpen(true); }}>
              Guardar como memoria
            </Button>
            <Button size="small" variant="outlined" startIcon={<BugReport />}
              onClick={() => { setFeedbackType("error"); setFeedbackOpen(true); }}>
              Mapear error
            </Button>
          </Box>
        </Paper>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Timeline */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Actividad</Typography>

      {timeline.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sin actividad todavía</Typography>
      )}

      {timeline.map((item, idx) => (
        <Box key={idx} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          {item._type === "comentario" ? (
            <>
              <Avatar sx={{ width: 32, height: 32, bgcolor: item.tcom_es_interno ? "grey.400" : "primary.main", fontSize: 14 }}>
                {item.autor_nombre?.charAt(0) || "?"}
              </Avatar>
              <Box sx={{
                flex: 1,
                bgcolor: item.tcom_es_interno ? "grey.100" : (item.tcom_tipo === "escalamiento" ? "error.50" : item.tcom_tipo === "resolucion" ? "success.50" : "background.paper"),
                border: "1px solid",
                borderColor: item.tcom_es_interno ? "grey.300" : item.tcom_tipo === "escalamiento" ? "error.200" : item.tcom_tipo === "resolucion" ? "success.200" : "divider",
                borderRadius: 2,
                p: 1.5,
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{item.autor_nombre}</Typography>
                    {item.tcom_es_interno && <Chip label="Interno" size="small" sx={{ height: 18, fontSize: 10 }} />}
                    {item.tcom_tipo === "escalamiento" && <Chip label="Escalamiento" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />}
                    {item.tcom_tipo === "resolucion" && <Chip label="Resolución" size="small" color="success" sx={{ height: 18, fontSize: 10 }} />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{formatFecha(item.tcom_created_at)}</Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{item.tcom_contenido}</Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 5, py: 0.5 }}>
              <Schedule sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography variant="caption" color="text.secondary">
                <b>{item.usuario_nombre}</b> — {item.this_detalle || item.this_accion}
              </Typography>
              <Typography variant="caption" color="text.disabled">{formatFecha(item.this_created_at)}</Typography>
            </Box>
          )}
        </Box>
      ))}

      {/* Comment input */}
      {!["cerrado"].includes(estado) && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <TextField
            fullWidth multiline rows={3} placeholder="Escribe un comentario..."
            value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)}
            size="small"
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            {esTecnico ? (
              <FormControlLabel
                control={<Switch size="small" checked={esInterno} onChange={(e) => setEsInterno(e.target.checked)} />}
                label={<Typography variant="caption">Nota interna</Typography>}
              />
            ) : <Box />}
            <Button variant="contained" size="small" endIcon={<Send />}
              onClick={handleEnviarComentario} disabled={enviando || !nuevoComentario.trim()}>
              Comentar
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog: Escalar */}
      <Dialog open={escalarOpen} onClose={() => setEscalarOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Escalar a soporte técnico</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Motivo de escalamiento (opcional)" sx={{ mt: 1 }}
            value={escalarMotivo} onChange={(e) => setEscalarMotivo(e.target.value)}
            placeholder="Explica por qué necesitas soporte técnico..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalarOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleEscalar}>Escalar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Resolver */}
      <Dialog open={resolverOpen} onClose={() => setResolverOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolver ticket</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={4} label="Solución" sx={{ mt: 1 }}
            value={solucionTexto} onChange={(e) => setSolucionTexto(e.target.value)}
            placeholder="Describe la solución aplicada..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolverOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleResolver}>Resolver</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Reabrir */}
      <Dialog open={reabrirOpen} onClose={() => setReabrirOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reabrir ticket</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Motivo (opcional)" sx={{ mt: 1 }}
            value={reabrirMotivo} onChange={(e) => setReabrirMotivo(e.target.value)}
            placeholder="¿Por qué se necesita reabrir?" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReabrirOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleReabrir}>Reabrir</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Feedback al conocimiento */}
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {feedbackType === "articulo" && "Crear artículo en Base de Conocimiento"}
          {feedbackType === "memoria" && "Guardar como memoria del agente"}
          {feedbackType === "error" && "Crear mapeo de error"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se creará automáticamente usando los datos del ticket:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
            <Typography variant="body2"><b>Título:</b> {ticket.tick_titulo}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}><b>Problema:</b> {ticket.tick_descripcion || "—"}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}><b>Solución:</b> {ticket.tick_solucion}</Typography>
            {ticket.tick_modulo && <Typography variant="body2" sx={{ mt: 1 }}><b>Módulo:</b> {ticket.tick_modulo}</Typography>}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleFeedback}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetailPage;
