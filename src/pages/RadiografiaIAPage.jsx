import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, TextField, Button,
  FormControlLabel, Switch, MenuItem,
} from "@mui/material";
import {
  SmartToy, Token, People, CalendarMonth, AttachMoney, TrendingUp,
  Psychology, AccessTime, Settings, Key,
} from "@mui/icons-material";
import {
  obtenerStatsIA,
  obtenerLimitesIA,
  obtenerProveedorIA,
  guardarLimitesIAGlobales,
  guardarProveedorIA,
  guardarLimiteIAUsuario,
  desactivarLimiteIAUsuario,
  obtenerChatsConCosto,
} from "../api/statsApi";

const MESES_ES = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

const DIAS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const formatNumber = (n) => {
  const num = parseInt(n, 10) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString("es-PE");
};

const formatUsd = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;

const toNullableNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseFloat(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

const StatCard = ({ icon, title, value, subtitle, color = "primary.main" }) => (
  <Paper sx={{ p: 2.5, height: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box sx={{
        p: 1, borderRadius: 2, bgcolor: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.25 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

const BarChart = ({ data, maxVal, labelKey, valueKey, color = "#e8244c" }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
    {data.map((item, i) => {
      const val = parseInt(item[valueKey], 10) || 0;
      const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
      return (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ width: 80, textAlign: "right", flexShrink: 0 }}>
            {item[labelKey]}
          </Typography>
          <Box sx={{ flex: 1, position: "relative", height: 20, bgcolor: "grey.100", borderRadius: 1 }}>
            <Box sx={{
              position: "absolute", top: 0, left: 0, height: "100%",
              width: `${pct}%`, bgcolor: color, borderRadius: 1,
              transition: "width 0.5s ease",
            }} />
          </Box>
          <Typography variant="caption" fontWeight={600} sx={{ width: 50, textAlign: "right" }}>
            {formatNumber(val)}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

const RadiografiaIAPage = () => {
  const [stats, setStats] = useState(null);
  const [limitsData, setLimitsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingProvider, setSavingProvider] = useState(false);
  const [savingUserLimit, setSavingUserLimit] = useState(false);

  const [providerValue, setProviderValue] = useState("gemini");
  const [geminiApiKeyValue, setGeminiApiKeyValue] = useState("");
  const [deepseekApiKeyValue, setDeepseekApiKeyValue] = useState("");
  const [providerData, setProviderData] = useState(null);

  const [globalLimitValue, setGlobalLimitValue] = useState("");
  const [defaultUserLimitValue, setDefaultUserLimitValue] = useState("");
  const [bloquearAlSuperar, setBloquearAlSuperar] = useState(true);

  const [usuarioLimiteEmail, setUsuarioLimiteEmail] = useState("");
  const [usuarioLimiteMonto, setUsuarioLimiteMonto] = useState("");

  // Estado para tab de costos por chat
  const [chatsData, setChatsData] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsPage, setChatsPage] = useState(0);
  const [chatsFilterUsuario, setChatsFilterUsuario] = useState("");
  const [chatsFilterModelo, setChatsFilterModelo] = useState("");
  const [chatsFilterComplejidad, setChatsFilterComplejidad] = useState("");

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResp, limitsResp, providerResp] = await Promise.all([
        obtenerStatsIA(),
        obtenerLimitesIA(),
        obtenerProveedorIA(),
      ]);

      if (!statsResp?.ok) throw new Error("No se pudieron cargar las estadísticas de IA");
      if (!limitsResp?.ok) throw new Error("No se pudo cargar la configuración de límites IA");
      if (!providerResp?.ok) throw new Error("No se pudo cargar la configuración del proveedor IA");

      setStats(statsResp.data);
      setLimitsData(limitsResp.data);
      setProviderData(providerResp.data);

      const cfg = limitsResp.data?.config || {};
      setGlobalLimitValue(cfg.cfg_limite_global_usd ?? "");
      setDefaultUserLimitValue(cfg.cfg_limite_usuario_default_usd ?? "");
      setBloquearAlSuperar(cfg.cfg_bloquear_al_superar !== false);

      setProviderValue(providerResp.data?.provider || "gemini");
      setGeminiApiKeyValue("");
      setDeepseekApiKeyValue("");
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleGuardarConfig = async () => {
    setSavingConfig(true);
    setError(null);
    try {
      const globalParsed = toNullableNumber(globalLimitValue);
      const defaultParsed = toNullableNumber(defaultUserLimitValue);

      if (globalLimitValue !== "" && globalParsed === null) {
        throw new Error("El límite global debe ser un número >= 0");
      }
      if (defaultUserLimitValue !== "" && defaultParsed === null) {
        throw new Error("El límite default por usuario debe ser un número >= 0");
      }

      await guardarLimitesIAGlobales({
        limiteGlobalUsd: globalParsed,
        limiteUsuarioDefaultUsd: defaultParsed,
        bloquearAlSuperar,
      });

      await cargar();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "No se pudo guardar la configuración");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleGuardarLimiteUsuario = async () => {
    setSavingUserLimit(true);
    setError(null);
    try {
      const monto = toNullableNumber(usuarioLimiteMonto);
      if (!usuarioLimiteEmail.trim()) {
        throw new Error("Debes ingresar el email del usuario");
      }
      if (monto === null) {
        throw new Error("Debes ingresar un monto válido >= 0");
      }

      await guardarLimiteIAUsuario({
        usuario: usuarioLimiteEmail.trim().toLowerCase(),
        limiteUsd: monto,
        activo: true,
      });

      setUsuarioLimiteEmail("");
      setUsuarioLimiteMonto("");
      await cargar();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "No se pudo guardar el límite por usuario");
    } finally {
      setSavingUserLimit(false);
    }
  };

  const handleGuardarProveedor = async () => {
    setSavingProvider(true);
    setError(null);
    try {
      await guardarProveedorIA({
        provider: providerValue,
        geminiApiKey: geminiApiKeyValue.trim() || undefined,
        deepseekApiKey: deepseekApiKeyValue.trim() || undefined,
      });
      setGeminiApiKeyValue("");
      setDeepseekApiKeyValue("");
      await cargar();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "No se pudo guardar la configuración del proveedor IA");
    } finally {
      setSavingProvider(false);
    }
  };

  const handleDesactivarLimiteUsuario = async (usuario) => {
    try {
      await desactivarLimiteIAUsuario(usuario);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "No se pudo desactivar el límite del usuario");
    }
  };

  const CHATS_PER_PAGE = 20;

  const cargarChats = async (page = 0) => {
    setChatsLoading(true);
    try {
      const params = { limit: CHATS_PER_PAGE, offset: page * CHATS_PER_PAGE };
      if (chatsFilterUsuario.trim()) params.usuario = chatsFilterUsuario.trim();
      if (chatsFilterModelo) params.modelo = chatsFilterModelo;
      if (chatsFilterComplejidad) params.complejidad = chatsFilterComplejidad;

      const resp = await obtenerChatsConCosto(params);
      if (resp?.ok) {
        setChatsData(resp.data);
        setChatsPage(page);
      }
    } catch (err) {
      console.error("Error cargando chats con costo:", err);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    cargarChats(0);
  }, []);

  const handleChatsFilterApply = () => cargarChats(0);

  const consumoUsuariosConLimite = useMemo(() => {
    if (!limitsData) return [];

    const overrides = (limitsData.usuarios_limites || []).reduce((acc, row) => {
      acc[row.lim_usuario] = row;
      return acc;
    }, {});

    const defaultLimit = limitsData.config?.cfg_limite_usuario_default_usd != null
      ? parseFloat(limitsData.config.cfg_limite_usuario_default_usd)
      : null;

    return (limitsData.consumo_usuarios_mes || []).map((u) => {
      const email = String(u.usuario || "").toLowerCase();
      const override = overrides[email];
      const limit = (override?.lim_activo && override?.lim_limite_usd != null)
        ? parseFloat(override.lim_limite_usd)
        : defaultLimit;
      const cost = parseFloat(u.costo_usd) || 0;
      const ratio = limit != null && limit > 0 ? (cost / limit) : null;

      return {
        ...u,
        override,
        limit,
        ratio,
        excedido: limit != null ? cost > limit : false,
      };
    });
  }, [limitsData]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { resumen, pricing, uso_mensual, uso_diario, top_usuarios, uso_por_dia, uso_por_hora, memorias, limites_ia } = stats;
  const maxConsultasDia = Math.max(...(uso_por_dia?.map((d) => parseInt(d.consultas, 10)) || [0]), 1);
  const maxConsultasHora = Math.max(...(uso_por_hora?.map((h) => parseInt(h.consultas, 10)) || [0]), 1);
  const maxConsultasDiario = Math.max(...(uso_diario?.map((d) => parseInt(d.consultas, 10)) || [0]), 1);

  const consumoGlobalMes = parseFloat(limites_ia?.consumo_mes_actual?.costo_usd || 0);
  const limiteGlobal = limites_ia?.config?.cfg_limite_global_usd != null
    ? parseFloat(limites_ia.config.cfg_limite_global_usd)
    : null;
  const pctGlobal = limiteGlobal && limiteGlobal > 0 ? Math.min((consumoGlobalMes / limiteGlobal) * 100, 100) : null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToy color="primary" /> Radiografía de Uso IA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Métricas de uso IA + control de presupuesto mensual (global y por usuario)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<SmartToy sx={{ color: "primary.main" }} />}
            title="Total Consultas"
            value={formatNumber(resumen.total_consultas)}
            subtitle={`${formatNumber(resumen.total_sesiones)} sesiones`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Token sx={{ color: "#f59e0b" }} />}
            title="Total Tokens"
            value={formatNumber(resumen.total_tokens)}
            subtitle={`~${formatNumber(resumen.promedio_tokens_consulta)} prom/consulta`}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<People sx={{ color: "#8b5cf6" }} />}
            title="Usuarios Únicos"
            value={formatNumber(resumen.total_usuarios)}
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<AttachMoney sx={{ color: "#10b981" }} />}
            title="Costo Total Estimado"
            value={`$${parseFloat(resumen.costo_total_usd).toFixed(2)}`}
            subtitle={`Mes actual: ${formatUsd(consumoGlobalMes)}`}
            color="#10b981"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Key fontSize="small" color="primary" /> Configuración proveedor IA (Admin)
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Proveedor agente"
              value={providerValue}
              onChange={(e) => setProviderValue(e.target.value)}
            >
              <MenuItem value="gemini">Gemini</MenuItem>
              <MenuItem value="deepseek">DeepSeek</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="password"
              label="API Key Gemini (opcional)"
              value={geminiApiKeyValue}
              onChange={(e) => setGeminiApiKeyValue(e.target.value)}
              placeholder={providerData?.gemini?.api_key_masked || "Pega nueva key para actualizar"}
              helperText={providerData?.gemini?.configurado ? `Configurada: ${providerData.gemini.api_key_masked}` : "No configurada"}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="password"
              label="API Key DeepSeek (opcional)"
              value={deepseekApiKeyValue}
              onChange={(e) => setDeepseekApiKeyValue(e.target.value)}
              placeholder={providerData?.deepseek?.api_key_masked || "Pega nueva key para actualizar"}
              helperText={providerData?.deepseek?.configurado ? `Configurada: ${providerData.deepseek.api_key_masked}` : "No configurada"}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant="contained" onClick={handleGuardarProveedor} disabled={savingProvider} fullWidth>
              {savingProvider ? "..." : "Guardar"}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Proveedor activo actual: <strong>{providerData?.provider || "gemini"}</strong>.
            Las API keys se guardan cifradas en base de datos (no en texto plano).
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Settings fontSize="small" color="primary" /> Configuración de límites IA (Admin)
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Límite global mensual (USD)"
              value={globalLimitValue}
              onChange={(e) => setGlobalLimitValue(e.target.value)}
              placeholder="Ej: 50"
              inputProps={{ min: 0, step: "0.01" }}
              helperText="Vacío = sin límite global"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Límite mensual default por usuario (USD)"
              value={defaultUserLimitValue}
              onChange={(e) => setDefaultUserLimitValue(e.target.value)}
              placeholder="Ej: 10"
              inputProps={{ min: 0, step: "0.01" }}
              helperText="Vacío = sin límite default por usuario"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={bloquearAlSuperar}
                  onChange={(e) => setBloquearAlSuperar(e.target.checked)}
                />
              }
              label="Bloquear cuando supera límite"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleGuardarConfig} disabled={savingConfig}>
              {savingConfig ? "Guardando..." : "Guardar configuración"}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Consumo global del mes: <strong>{formatUsd(consumoGlobalMes)}</strong>
            {limiteGlobal != null && (
              <> de <strong>{formatUsd(limiteGlobal)}</strong> ({pctGlobal?.toFixed(1)}%)</>
            )}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Límite por usuario (override)
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Email usuario"
              value={usuarioLimiteEmail}
              onChange={(e) => setUsuarioLimiteEmail(e.target.value)}
              placeholder="usuario@empresa.com"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Límite mensual USD"
              value={usuarioLimiteMonto}
              onChange={(e) => setUsuarioLimiteMonto(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button variant="outlined" onClick={handleGuardarLimiteUsuario} disabled={savingUserLimit}>
              {savingUserLimit ? "Guardando..." : "Guardar límite usuario"}
            </Button>
          </Grid>
        </Grid>

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Costo mes</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Límite efectivo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Override</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consumoUsuariosConLimite.slice(0, 50).map((u) => (
                <TableRow key={u.usuario} hover>
                  <TableCell>{u.usuario}</TableCell>
                  <TableCell align="right">{formatUsd(u.costo_usd)}</TableCell>
                  <TableCell align="right">
                    {u.limit != null ? formatUsd(u.limit) : "Sin límite"}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={u.excedido ? "Excedido" : "OK"}
                      color={u.excedido ? "error" : "success"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {u.override?.lim_activo ? (
                      <Button size="small" color="warning" onClick={() => handleDesactivarLimiteUsuario(u.usuario)}>
                        Desactivar
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {uso_diario?.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp fontSize="small" color="primary" /> Consultas últimos 30 días
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 120, px: 1 }}>
            {uso_diario.map((d, i) => {
              const val = parseInt(d.consultas, 10) || 0;
              const pct = maxConsultasDiario > 0 ? (val / maxConsultasDiario) * 100 : 0;
              return (
                <Tooltip key={i} title={`${d.fecha}: ${val} consultas, ${formatNumber(d.tokens)} tokens`}>
                  <Box sx={{
                    flex: 1, minWidth: 4, maxWidth: 20,
                    height: `${Math.max(pct, 2)}%`,
                    bgcolor: val > 0 ? "primary.main" : "grey.200",
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.3s ease",
                    cursor: "pointer",
                    "&:hover": { bgcolor: val > 0 ? "primary.dark" : "grey.300" },
                  }} />
                </Tooltip>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", px: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {uso_diario[0]?.fecha}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {uso_diario[uso_diario.length - 1]?.fecha}
            </Typography>
          </Box>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth fontSize="small" color="primary" /> Uso Mensual
            </Typography>
            {uso_mensual?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Consultas</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Usuarios</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Costo USD</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uso_mensual.map((m) => {
                      const [year, month] = m.mes.split("-");
                      return (
                        <TableRow key={m.mes} hover>
                          <TableCell>{MESES_ES[month]} {year}</TableCell>
                          <TableCell align="right">{formatNumber(m.consultas)}</TableCell>
                          <TableCell align="right">{m.usuarios_unicos}</TableCell>
                          <TableCell align="right">{formatNumber(m.tokens)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`$${parseFloat(m.costo_estimado).toFixed(2)}`}
                              size="small"
                              color={parseFloat(m.costo_estimado) > 1 ? "warning" : "success"}
                              sx={{ fontWeight: 600, fontSize: 12 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin datos aún</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <People fontSize="small" sx={{ color: "#8b5cf6" }} /> Top Usuarios
            </Typography>
            {top_usuarios?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Consultas</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Costo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top_usuarios.slice(0, 10).map((u) => (
                      <TableRow key={u.usuario} hover>
                        <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.usuario}
                        </TableCell>
                        <TableCell align="right">{formatNumber(u.consultas)}</TableCell>
                        <TableCell align="right">{formatUsd(u.costo_estimado_usd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin datos aún</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime fontSize="small" color="primary" /> Consultas por Día de Semana
            </Typography>
            {uso_por_dia?.length > 0 ? (
              <BarChart
                data={uso_por_dia.map((d) => ({ ...d, dia: DIAS_ES[parseInt(d.dia_num, 10)] || d.dia_nombre?.trim() }))}
                maxVal={maxConsultasDia}
                labelKey="dia"
                valueKey="consultas"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">Sin datos</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime fontSize="small" sx={{ color: "#f59e0b" }} /> Consultas por Hora del Día
            </Typography>
            {uso_por_hora?.length > 0 ? (
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 100 }}>
                {Array.from({ length: 24 }, (_, h) => {
                  const item = uso_por_hora.find((x) => parseInt(x.hora, 10) === h);
                  const val = item ? parseInt(item.consultas, 10) : 0;
                  const pct = maxConsultasHora > 0 ? (val / maxConsultasHora) * 100 : 0;
                  return (
                    <Tooltip key={h} title={`${h}:00 — ${val} consultas`}>
                      <Box sx={{
                        flex: 1, minWidth: 0,
                        height: `${Math.max(pct, 3)}%`,
                        bgcolor: val > 0 ? "#f59e0b" : "grey.200",
                        borderRadius: "2px 2px 0 0",
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                      }} />
                    </Tooltip>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin datos</Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">0:00</Typography>
              <Typography variant="caption" color="text.secondary">12:00</Typography>
              <Typography variant="caption" color="text.secondary">23:00</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Psychology fontSize="small" sx={{ color: "#8b5cf6" }} /> Memorias del Agente IA
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                {formatNumber(memorias?.stats?.memorias_activas)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Memorias activas</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: "#8b5cf6" }}>
                {formatNumber(memorias?.stats?.total_usos_memoria)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Veces usadas</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            {memorias?.top?.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  Top memorias más usadas:
                </Typography>
                {memorias.top.slice(0, 5).map((m) => (
                  <Box key={m.mem_id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Chip
                      label={m.mem_categoria}
                      size="small"
                      sx={{ fontSize: 10, height: 18, minWidth: 60 }}
                      color={
                        m.mem_categoria === "patron" ? "info" :
                        m.mem_categoria === "solucion" ? "success" :
                        m.mem_categoria === "error_comun" ? "error" : "default"
                      }
                    />
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                      {m.mem_titulo}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {m.mem_veces_usado}x
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <AttachMoney fontSize="small" sx={{ color: "#10b981" }} /> Costos por Chat
        </Typography>

        {/* Resumen */}
        {chatsData?.resumen && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                  {formatNumber(chatsData.resumen.total_chats)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Total chats</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981" }}>
                  ${parseFloat(chatsData.resumen.total_costo_usd || 0).toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Costo total</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#f59e0b" }}>
                  {formatNumber(chatsData.resumen.total_tokens_input)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Tokens input</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center", p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#8b5cf6" }}>
                  {formatNumber(chatsData.resumen.total_tokens_output)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Tokens output</Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Filtros */}
        <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth size="small" label="Usuario"
              value={chatsFilterUsuario}
              onChange={(e) => setChatsFilterUsuario(e.target.value)}
              placeholder="email@..."
            />
          </Grid>
          <Grid item xs={6} sm={2.5}>
            <TextField
              select fullWidth size="small" label="Modelo"
              value={chatsFilterModelo}
              onChange={(e) => setChatsFilterModelo(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="gemini-2.5-flash-lite">Flash Lite</MenuItem>
              <MenuItem value="gemini-2.5-flash">Flash</MenuItem>
              <MenuItem value="gemini-2.5-pro">Pro</MenuItem>
              <MenuItem value="deepseek-chat">DeepSeek</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={2.5}>
            <TextField
              select fullWidth size="small" label="Complejidad"
              value={chatsFilterComplejidad}
              onChange={(e) => setChatsFilterComplejidad(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="simple">Simple</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="compleja">Compleja</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" size="small" onClick={handleChatsFilterApply} fullWidth>
              Filtrar
            </Button>
          </Grid>
        </Grid>

        {/* Tabla */}
        {chatsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : chatsData?.chats?.length > 0 ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Pregunta</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Modelo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Complejidad</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens In</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens Out</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Costo USD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatsData.chats.map((chat) => (
                    <TableRow key={chat.chat_id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap", fontSize: 12 }}>
                        {new Date(chat.chat_created_at).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>
                        {chat.chat_usuario}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>
                        <Tooltip title={chat.chat_pregunta || ""}>
                          <span>{(chat.chat_pregunta || "").slice(0, 80)}{(chat.chat_pregunta || "").length > 80 ? "..." : ""}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            chat.chat_modelo === "gemini-2.5-flash-lite" ? "Lite" :
                            chat.chat_modelo === "gemini-2.5-flash" ? "Flash" :
                            chat.chat_modelo === "gemini-2.5-pro" ? "Pro" :
                            chat.chat_modelo === "deepseek-chat" ? "DS" :
                            chat.chat_modelo || "—"
                          }
                          size="small"
                          sx={{ fontSize: 10, height: 20 }}
                          color={
                            chat.chat_modelo?.includes("pro") ? "error" :
                            chat.chat_modelo?.includes("lite") ? "success" :
                            chat.chat_modelo?.includes("flash") ? "info" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={chat.chat_complejidad || "—"}
                          size="small"
                          sx={{ fontSize: 10, height: 20 }}
                          color={
                            chat.chat_complejidad === "compleja" ? "error" :
                            chat.chat_complejidad === "normal" ? "warning" :
                            chat.chat_complejidad === "simple" ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {formatNumber(chat.chat_tokens_input || 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {formatNumber(chat.chat_tokens_output || 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>
                        ${parseFloat(chat.chat_costo_usd || 0).toFixed(5)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Mostrando {chatsPage * CHATS_PER_PAGE + 1}–{Math.min((chatsPage + 1) * CHATS_PER_PAGE, chatsData.pagination.total)} de {chatsData.pagination.total}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small" variant="outlined" disabled={chatsPage === 0}
                  onClick={() => cargarChats(chatsPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  size="small" variant="outlined"
                  disabled={(chatsPage + 1) * CHATS_PER_PAGE >= chatsData.pagination.total}
                  onClick={() => cargarChats(chatsPage + 1)}
                >
                  Siguiente
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No hay chats con datos de costo registrados aún.
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Nota sobre costos:</strong> Estimaciones basadas en precios configurados en .env —
          Input: ${pricing?.costo_input_por_millon ?? "?"}/1M tokens,
          Output: ${pricing?.costo_output_por_millon ?? "?"}/1M tokens,
          ratio ~{Math.round((pricing?.pct_input ?? 0.4) * 100)}% input / ~{Math.round((pricing?.pct_output ?? 0.6) * 100)}% output.
          Los límites configurados en esta pantalla se aplican por mes calendario.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RadiografiaIAPage;
