import { useState } from "react";
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider,
} from "@mui/material";
import { ExpandMore, PhoneAndroid, Storage, AccountTree, Code } from "@mui/icons-material";

const SectionTitle = ({ icon, title, subtitle }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
    {icon}
    <Box>
      <Typography fontWeight={700}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

const SqlBlock = ({ sql, title }) => (
  <Box sx={{ my: 1.5 }}>
    {title && <Typography variant="caption" fontWeight={600} color="primary" gutterBottom>{title}</Typography>}
    <Box
      component="pre"
      sx={{
        bgcolor: "#1e1e2e", color: "#cdd6f4", p: 2, borderRadius: 1.5,
        fontSize: 12, lineHeight: 1.6, overflow: "auto", fontFamily: "monospace",
        border: "1px solid", borderColor: "divider", maxHeight: 400,
      }}
    >
      <code>{sql}</code>
    </Box>
  </Box>
);

const TableSchema = ({ columns }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ my: 1.5 }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "grey.50" }}>
          <TableCell sx={{ fontWeight: 700 }}>Columna</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {columns.map((col, i) => (
          <TableRow key={i} hover>
            <TableCell><code style={{ fontSize: 12 }}>{col.name}</code></TableCell>
            <TableCell><Chip label={col.type} size="small" variant="outlined" sx={{ fontSize: 11 }} /></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{col.desc}</Typography></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const RadiografiaTecnicaAppPage = () => {
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (_, isExpanded) => setExpanded(isExpanded ? panel : false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <PhoneAndroid sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={800}>Radiografía Técnica — APP Móvil</Typography>
        </Box>
        <Typography color="text.secondary">
          Estructura de base de datos, relaciones entre tablas, queries de consulta y flujo de datos de cada módulo del APP.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Base de datos:</strong> PostgreSQL — Todas las tablas pertenecen al esquema principal de ARCA (api_arca, puerto 4400).
          Las fechas se manejan en formato <code>dd-MM-yyyy</code> en la mayoría de módulos.
        </Alert>
      </Box>

      {/* 1. USUARIOS */}
      <Accordion expanded={expanded === "usuarios"} onChange={handleChange("usuarios")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="1. Usuarios y Autenticación" subtitle="usuario, usuario_cargo, cargo_nivel, usuario_localidad" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>Tabla principal: <code>usuario</code></Typography>
          <TableSchema columns={[
            { name: "usu_id", type: "SERIAL PK", desc: "ID único del usuario" },
            { name: "usu_nombres", type: "VARCHAR", desc: "Nombres del usuario" },
            { name: "usu_apellidos", type: "VARCHAR", desc: "Apellidos del usuario" },
            { name: "usu_identificacion", type: "VARCHAR UNIQUE", desc: "Cédula/DNI (identificación única)" },
            { name: "usu_email", type: "VARCHAR UNIQUE", desc: "Email principal (login)" },
            { name: "usu_password", type: "VARCHAR", desc: "Hash bcrypt de contraseña" },
            { name: "usu_activo", type: "BOOLEAN", desc: "true = usuario activo, false = inactivo" },
            { name: "usu_estado", type: "INTEGER", desc: "Estado numérico del usuario" },
            { name: "uca_id", type: "FK → usuario_cargo", desc: "Cargo asignado al usuario" },
            { name: "loc_id", type: "FK → localidad", desc: "Localidad principal asignada" },
            { name: "are_id", type: "FK → area", desc: "Área asignada" },
            { name: "neg_id", type: "FK → negocio", desc: "Negocio asignado" },
            { name: "emp_id", type: "FK (implícito)", desc: "Empresa (se resuelve vía localidad → región → empresa)" },
            { name: "usu_reporta", type: "FK → usuario", desc: "Self-join: jefe directo al que reporta" },
            { name: "usu_reporta_comercial", type: "FK → usuario", desc: "Jefe de reporte comercial" },
            { name: "usu_seguridad", type: "BOOLEAN", desc: "Módulo seguridad habilitado" },
            { name: "usu_salud", type: "BOOLEAN", desc: "Módulo salud habilitado" },
            { name: "cme_id", type: "FK → cmenu", desc: "Menú de permisos asignado" },
            { name: "usu_firebase_token", type: "VARCHAR", desc: "Token FCM para push notifications" },
            { name: "usu_rol", type: "INTEGER", desc: "Tipo de rol (default 1)" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Relación: <code>usuario_cargo → cargo_nivel</code></Typography>
          <TableSchema columns={[
            { name: "uca_id", type: "SERIAL PK", desc: "ID del cargo" },
            { name: "uca_nombre", type: "VARCHAR", desc: "Nombre del cargo" },
            { name: "uca_nivel → can_id", type: "FK → cargo_nivel", desc: "Nivel del cargo" },
          ]} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <code>cargo_nivel</code> define las capacidades del cargo con flags booleanos:
          </Typography>
          <TableSchema columns={[
            { name: "can_incidencias", type: "BOOLEAN", desc: "¿Puede registrar incidencias?" },
            { name: "can_inspecciones", type: "BOOLEAN", desc: "¿Puede hacer inspecciones?" },
            { name: "can_charlas", type: "BOOLEAN", desc: "¿Puede ver charlas?" },
            { name: "can_impartidor", type: "BOOLEAN", desc: "¿Puede impartir charlas?" },
            { name: "can_tareas", type: "BOOLEAN", desc: "¿Puede recibir tareas?" },
            { name: "cme_id", type: "FK → cmenu", desc: "Menú asociado al nivel de cargo" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Query: Obtener usuario completo con jerarquía</Typography>
          <SqlBlock sql={`SELECT u.usu_id, u.usu_nombres, u.usu_apellidos, u.usu_email,
       u.usu_activo, u.usu_seguridad, u.usu_salud,
       uc.uca_nombre AS cargo,
       cn.can_nombre AS nivel_cargo,
       cn.can_incidencias, cn.can_inspecciones, cn.can_charlas,
       cn.can_impartidor, cn.can_tareas,
       l.loc_nombre AS localidad,
       r.reg_nombre AS region,
       e.emp_nombre AS empresa,
       a.are_nombre AS area,
       jefe.usu_nombres || ' ' || jefe.usu_apellidos AS nombre_jefe
FROM usuario u
LEFT JOIN usuario_cargo uc ON u.uca_id = uc.uca_id
LEFT JOIN cargo_nivel cn ON uc.uca_nivel = cn.can_id
LEFT JOIN localidad l ON u.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
LEFT JOIN area a ON u.are_id = a.are_id
LEFT JOIN usuario jefe ON u.usu_reporta = jefe.usu_id
WHERE u.usu_id = [ID_USUARIO];`} />

          <SqlBlock title="Query: Buscar usuario por email" sql={`SELECT usu_id, usu_email, usu_nombres, usu_apellidos,
       usu_activo, usu_estado, usu_fecha_ingreso
FROM usuario
WHERE LOWER(usu_email) = LOWER('[EMAIL]');`} />

          <SqlBlock title="Query: Localidades asignadas al usuario" sql={`SELECT u.usu_id, u.usu_nombres,
       e.emp_nombre, l.loc_nombre, a.are_nombre, ul.usl_activo
FROM usuario u
LEFT JOIN usuario_localidad ul ON u.usu_id = ul.usu_id AND ul.usl_activo = true
LEFT JOIN localidad l ON ul.loc_id = l.loc_id
LEFT JOIN area a ON ul.are_id = a.are_id
LEFT JOIN empresa e ON ul.emp_id = e.emp_id
WHERE u.usu_id = [ID_USUARIO];`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Dato clave:</strong> Un usuario puede tener múltiples localidades vía <code>usuario_localidad</code>.
            La localidad principal está en <code>usuario.loc_id</code>, las adicionales en <code>usuario_localidad</code> con <code>usl_activo = true</code>.
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 2. TAREAS */}
      <Accordion expanded={expanded === "tareas"} onChange={handleChange("tareas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="2. Tareas" subtitle="tarea, tarea_asignacion, tarea_formulario_respuesta, tarea_evidencia" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>Tabla: <code>tarea</code></Typography>
          <TableSchema columns={[
            { name: "tar_id", type: "SERIAL PK", desc: "ID único de la tarea" },
            { name: "usu_id_creo", type: "FK → usuario", desc: "Usuario que creó la tarea" },
            { name: "acs_id", type: "FK → actividad_seguridad", desc: "Actividad de seguridad asociada (puede ser NULL)" },
            { name: "tar_descripcion", type: "VARCHAR", desc: "Descripción (se guarda UPPER+TRIM)" },
            { name: "tar_fecha", type: "DATE", desc: "Fecha de la tarea (formato dd-MM-yyyy)" },
            { name: "tar_activo", type: "BOOLEAN", desc: "true = activa" },
            { name: "tar_tipo", type: "INTEGER", desc: "0 = normal, 3 = recurrente/cron" },
            { name: "tar_principal", type: "BOOLEAN", desc: "true = tarea principal" },
            { name: "tar_movil", type: "BOOLEAN", desc: "true = disponible en app móvil" },
            { name: "tar_clonada", type: "BOOLEAN", desc: "true = fue clonada de otra tarea" },
            { name: "tar_id_original", type: "FK → tarea", desc: "Self-join: tarea original si es clonada" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Tabla: <code>tarea_asignacion</code> (pivote de asignación)</Typography>
          <TableSchema columns={[
            { name: "tas_id", type: "SERIAL PK", desc: "ID de asignación" },
            { name: "tar_id", type: "FK → tarea", desc: "Tarea asociada" },
            { name: "usu_id", type: "FK → usuario", desc: "Usuario asignado" },
            { name: "loc_id, neg_id", type: "FK", desc: "Localidad y negocio de la asignación" },
            { name: "tas_fecha_inicio", type: "DATE", desc: "Fecha inicio del rango" },
            { name: "tas_fecha_fin", type: "DATE", desc: "Fecha fin del rango" },
            { name: "tas_estado", type: "BOOLEAN", desc: "true = completada" },
            { name: "emp_id_asignado", type: "FK", desc: "Empresa donde se asigna (desnormalizado)" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Diagrama de relación</Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`tarea (1) ──── (N) tarea_asignacion (N) ──── (1) usuario
  │                       │
  │                       └── tarea_asignacion_detalle (fechas de ejecución)
  │
  └── actividad_seguridad ──── formulario
                                    │
                          tarea_formulario_respuesta (respuestas del formulario)
                                    │
                          tarea_evidencia (fotos/archivos adjuntos)`}
          </Box>

          <SqlBlock title="Query: Tareas activas de un usuario" sql={`SELECT t.tar_id, t.tar_descripcion, t.tar_fecha, t.tar_activo,
       t.tar_tipo, t.tar_movil,
       ta.tas_estado AS completada,
       ta.tas_fecha_inicio, ta.tas_fecha_fin,
       e.emp_nombre, l.loc_nombre, a.are_nombre,
       acs.acs_nombre AS actividad_seguridad
FROM tarea t
JOIN tarea_asignacion ta ON t.tar_id = ta.tar_id
LEFT JOIN empresa e ON ta.emp_id = e.emp_id
LEFT JOIN localidad l ON ta.loc_id = l.loc_id
LEFT JOIN area a ON ta.are_id = a.are_id
LEFT JOIN actividad_seguridad acs ON t.acs_id = acs.acs_id
WHERE ta.usu_id = [ID_USUARIO]
  AND t.tar_activo = true
  AND ta.tas_activo = true
ORDER BY t.tar_fecha DESC;`} />

          <SqlBlock title="Query: Respuestas de formulario de una tarea" sql={`SELECT tfr.tar_id, u.usu_nombres, tfr.frp_id,
       p.frp_pregunta, tfr.tfr_respuesta, tfr.tfr_fecha
FROM tarea_formulario_respuesta tfr
JOIN usuario u ON tfr.usu_id = u.usu_id
JOIN formulario_pregunta p ON tfr.frp_id = p.frp_id
WHERE tfr.tar_id = [ID_TAREA]
  AND tfr.usu_id = [ID_USUARIO];`} />

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Validación importante:</strong> No se puede desactivar una tarea (<code>tar_activo = false</code>) si tiene <code>tarea_asignacion</code> activas.
            La app solo muestra tareas donde <code>tar_movil = true</code>.
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 3. FORMULARIOS */}
      <Accordion expanded={expanded === "formularios"} onChange={handleChange("formularios")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="3. Formularios" subtitle="formulario, formulario_segmento, formulario_pregunta, formulario_pregunta_detalle" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>Jerarquía de tablas</Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`formulario (padre)
  ├── formulario_segmento (secciones del formulario)
  │     └── formulario_pregunta (preguntas dentro de sección)
  │           └── formulario_pregunta_detalle (opciones de respuesta)
  │
  └── actividad_seguridad (vincula formulario con actividad)
        └── tarea (las tareas ejecutan el formulario)`}
          </Box>

          <TableSchema columns={[
            { name: "frm_id", type: "SERIAL PK", desc: "ID del formulario" },
            { name: "frm_nombre", type: "VARCHAR UNIQUE", desc: "Nombre (UPPER+TRIM, único)" },
            { name: "frm_tipo", type: "INTEGER", desc: "1=con segmentos, 2=directo, 3=especial" },
            { name: "frm_activo", type: "BOOLEAN", desc: "true = activo" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Tipos de pregunta (<code>frp_tipo</code>)</Typography>
          <TableSchema columns={[
            { name: "1", type: "Texto", desc: "Respuesta abierta de texto" },
            { name: "2", type: "Opción única", desc: "Selección de una opción" },
            { name: "3", type: "Opción calificada", desc: "Opción con puntaje asociado" },
            { name: "9", type: "Especial", desc: "Tipo especial del sistema" },
            { name: "10", type: "Con imagen", desc: "Requiere captura de imagen" },
            { name: "11", type: "Calificación avanzada", desc: "Score avanzado con peso" },
            { name: "12", type: "Ratio", desc: "Numerador/denominador" },
            { name: "13", type: "Ratio especial", desc: "Ratio con reglas especiales" },
          ]} />

          <SqlBlock title="Query: Estructura completa de un formulario" sql={`SELECT f.frm_id, f.frm_nombre, f.frm_tipo, f.frm_activo,
       s.fsg_id, s.fsg_nombre, s.fsg_orden, s.fsg_activo,
       p.frp_id, p.frp_pregunta, p.frp_tipo, p.frp_orden, p.frp_activo,
       COUNT(d.fpd_id) AS num_opciones
FROM formulario f
LEFT JOIN formulario_segmento s ON f.frm_id = s.frm_id
LEFT JOIN formulario_pregunta p ON f.frm_id = p.frm_id
  AND (s.fsg_id = p.fsg_id OR p.fsg_id IS NULL)
LEFT JOIN formulario_pregunta_detalle d ON p.frp_id = d.frp_id
WHERE f.frm_id = [ID_FORMULARIO]
GROUP BY f.frm_id, f.frm_nombre, f.frm_tipo, f.frm_activo,
         s.fsg_id, s.fsg_nombre, s.fsg_orden, s.fsg_activo,
         p.frp_id, p.frp_pregunta, p.frp_tipo, p.frp_orden, p.frp_activo
ORDER BY s.fsg_orden, p.frp_orden;`} />

          <SqlBlock title="Query: Actividades que usan un formulario" sql={`SELECT acs_id, acs_nombre, acs_activo
FROM actividad_seguridad
WHERE frm_id = [ID_FORMULARIO]
ORDER BY acs_activo DESC, acs_nombre;`} />

          <SqlBlock title="Query: Conteo de respuestas de un formulario" sql={`SELECT COUNT(*) AS total_respuestas,
       COUNT(DISTINCT tar_id) AS tareas_con_respuesta
FROM tarea_formulario_respuesta
WHERE frm_id = [ID_FORMULARIO];`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Restricción:</strong> No se puede desactivar un formulario que tiene <code>actividad_seguridad</code> activas vinculadas.
            El nombre del formulario es UNIQUE (comparación UPPER+TRIM).
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 4. CHARLAS */}
      <Accordion expanded={expanded === "charlas"} onChange={handleChange("charlas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="4. Charlas" subtitle="charla, charla_respuesta/charla_usuario, pregunta_charla, dpregunta_charla" />
        </AccordionSummary>
        <AccordionDetails>
          <TableSchema columns={[
            { name: "cha_id", type: "SERIAL PK", desc: "ID de la charla" },
            { name: "cha_nombre", type: "VARCHAR UNIQUE", desc: "Nombre (UPPER+TRIM, único)" },
            { name: "cha_fecha_inicio", type: "DATE", desc: "Fecha desde la que está disponible (dd-MM-yyyy)" },
            { name: "cha_fecha_fin", type: "DATE", desc: "Fecha hasta la que está disponible" },
            { name: "cha_activo", type: "BOOLEAN", desc: "true = activa" },
            { name: "cha_video", type: "VARCHAR", desc: "URL del video (YouTube u otro)" },
            { name: "cha_tipo_video", type: "VARCHAR", desc: "Tipo de video" },
            { name: "cha_num_preguntas", type: "INTEGER", desc: "Número de preguntas de evaluación" },
            { name: "tipo_charla_id", type: "INTEGER", desc: "1 = Seguridad, 2 = Comercial" },
            { name: "cha_rating", type: "BOOLEAN", desc: "true = es charla tipo Rating (para reporte Ratings)" },
            { name: "cha_capacitacion", type: "BOOLEAN", desc: "true = es capacitación (para reporte Charlas)" },
            { name: "cha_satisfaccion", type: "BOOLEAN", desc: "¿Tiene encuesta de satisfacción?" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Tabla pivote: <code>charla_respuesta</code> / <code>charla_usuario</code></Typography>
          <TableSchema columns={[
            { name: "chr_id / chu_id", type: "SERIAL PK", desc: "ID de la asignación" },
            { name: "cha_id", type: "FK → charla", desc: "Charla asignada" },
            { name: "usu_id", type: "FK → usuario", desc: "Usuario asignado" },
            { name: "chr_estado", type: "INTEGER", desc: "0 = pendiente, 1 = completada" },
            { name: "chu_fecha_respuesta", type: "TIMESTAMP", desc: "Cuándo completó la charla (NULL = pendiente)" },
            { name: "usu_id_jefe", type: "FK → usuario", desc: "Jefe al momento de la asignación (desnormalizado)" },
            { name: "loc_id_jef, are_id_jef, emp_id_jef", type: "FK", desc: "Datos del jefe desnormalizados para reportes" },
          ]} />

          <SqlBlock title="Query: Estado de charla por usuario" sql={`SELECT u.usu_nombres, u.usu_email,
       chu.chu_fecha_respuesta,
       CASE
         WHEN chu.chu_fecha_respuesta IS NULL THEN 'PENDIENTE'
         ELSE 'COMPLETADA'
       END AS estado,
       chu.chu_duracion_video
FROM charla_usuario chu
JOIN usuario u ON chu.usu_id = u.usu_id
WHERE chu.cha_id = [ID_CHARLA]
  AND chu.chu_activo = true
ORDER BY estado, u.usu_nombres;`} />

          <SqlBlock title="Query: Buscar charla por nombre" sql={`SELECT cha_id, cha_nombre, cha_activo,
       cha_fecha_inicio, cha_fecha_fin,
       cha_rating, cha_capacitacion,
       tipo_charla_id
FROM charla
WHERE UPPER(TRIM(cha_nombre)) = UPPER(TRIM('[NOMBRE]'))
   OR LOWER(cha_nombre) LIKE LOWER('%[NOMBRE_PARCIAL]%');`} />

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Flags cruciales para reportes:</strong><br />
            • <code>cha_rating = true</code> → aparece en el <strong>Reporte de Ratings</strong><br />
            • <code>cha_capacitacion = true</code> → aparece en el <strong>Reporte de Charlas</strong><br />
            • <code>tipo_charla_id = 1</code> (Seguridad) o <code>2</code> (Comercial) determina en qué módulo se muestra
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 5. INCIDENCIAS */}
      <Accordion expanded={expanded === "incidencias"} onChange={handleChange("incidencias")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="5. Incidencias" subtitle="incidencia, incidencia_imagen, tipo_observacion, potencial" />
        </AccordionSummary>
        <AccordionDetails>
          <TableSchema columns={[
            { name: "inc_id", type: "SERIAL PK", desc: "ID interno" },
            { name: "usu_id", type: "FK → usuario", desc: "Usuario que reporta" },
            { name: "inc_numero", type: "INTEGER", desc: "Número secuencial por usuario (auto-incremento)" },
            { name: "inc_fecha", type: "TIMESTAMP", desc: "Fecha del reporte" },
            { name: "inc_estado", type: "INTEGER", desc: "Estado de la incidencia" },
            { name: "inc_est_estado", type: "INTEGER", desc: "Sub-estado" },
            { name: "inc_desc_observacion", type: "TEXT", desc: "Descripción (UPPER)" },
            { name: "inc_desc_accion_tomada", type: "TEXT", desc: "Acción tomada (UPPER)" },
            { name: "inc_reincidencia", type: "BOOLEAN", desc: "true = es reincidencia" },
            { name: "tob_id", type: "FK → tipo_observacion", desc: "Tipo de observación" },
            { name: "pot_id", type: "FK → potencial", desc: "Nivel de riesgo potencial" },
            { name: "emp_id", type: "FK → empresa", desc: "Empresa" },
            { name: "loc_id, are_id", type: "FK", desc: "Localidad y área donde ocurrió" },
            { name: "usu_id_jefe", type: "FK → usuario", desc: "Jefe al momento (desnormalizado)" },
            { name: "emp_id_usu, loc_id_usu, are_id_usu, uca_id_usu", type: "FK", desc: "Datos del reportante desnormalizados" },
            { name: "emp_id_jef, loc_id_jef, are_id_jef, uca_id_jef", type: "FK", desc: "Datos del jefe desnormalizados" },
          ]} />

          <SqlBlock title="Query: Últimas incidencias de un usuario" sql={`SELECT inc_id, inc_numero, inc_fecha, inc_estado, inc_est_estado,
       inc_desc_observacion, inc_reincidencia
FROM incidencia
WHERE usu_id = [ID_USUARIO]
ORDER BY inc_fecha DESC
LIMIT 20;`} />

          <SqlBlock title="Query: Diagnóstico de numeración" sql={`SELECT usu_id,
       COUNT(*) AS total,
       MAX(inc_numero) AS max_numero,
       array_agg(inc_numero ORDER BY inc_numero) AS numeros
FROM incidencia
WHERE usu_id = [ID_USUARIO]
GROUP BY usu_id;

-- Si hay huecos en la numeración:
SELECT fix_numbers([ID_USUARIO]);  -- Función que renumera`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Campos desnormalizados:</strong> Las incidencias guardan los datos del jefe y del reportante en el momento de creación
            (emp_id_jef, loc_id_jef, etc.). Esto es para que los reportes no se vean afectados si el usuario cambia de estructura después.
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 6. INSPECCIONES */}
      <Accordion expanded={expanded === "inspecciones"} onChange={handleChange("inspecciones")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="6. Inspecciones" subtitle="inspeccion, dinspeccion / inspeccion_respuesta" />
        </AccordionSummary>
        <AccordionDetails>
          <TableSchema columns={[
            { name: "ins_id", type: "SERIAL PK", desc: "ID interno" },
            { name: "usu_id", type: "FK → usuario", desc: "Inspector" },
            { name: "ins_numero", type: "INTEGER", desc: "Número secuencial por usuario" },
            { name: "ins_fecha", type: "TIMESTAMP", desc: "Fecha de la inspección" },
            { name: "ins_calificacion", type: "NUMERIC", desc: "Calificación total de la inspección" },
            { name: "ins_estado", type: "INTEGER", desc: "Estado" },
            { name: "emp_id, loc_id, are_id", type: "FK", desc: "Empresa, localidad, área inspeccionada" },
            { name: "usu_id_jefe, emp_id_jef, loc_id_jef...", type: "FK", desc: "Datos desnormalizados del jefe" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Detalle: <code>dinspeccion</code></Typography>
          <TableSchema columns={[
            { name: "din_id", type: "SERIAL PK", desc: "ID del detalle" },
            { name: "ins_id", type: "FK → inspeccion", desc: "Inspección padre" },
            { name: "din_pregunta", type: "TEXT", desc: "Pregunta evaluada" },
            { name: "din_respuesta", type: "TEXT", desc: "Respuesta dada" },
            { name: "din_comentario", type: "TEXT", desc: "Comentario adicional" },
            { name: "din_imagen", type: "VARCHAR", desc: "Evidencia fotográfica" },
            { name: "din_peso", type: "NUMERIC", desc: "Peso/ponderación de la pregunta" },
          ]} />

          <SqlBlock title="Query: Inspecciones por localidad en rango de fechas" sql={`SELECT i.ins_id, i.ins_fecha, u.usu_nombres, i.ins_calificacion
FROM inspeccion i
JOIN usuario u ON u.usu_id = i.usu_id
WHERE i.loc_id = [ID_LOCALIDAD]
  AND i.ins_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
ORDER BY i.ins_fecha DESC;`} />

          <SqlBlock title="Query: Detalle de respuestas de una inspección" sql={`SELECT i.ins_id, i.ins_fecha, i.ins_calificacion,
       fp.frp_pregunta, ir.inr_respuesta
FROM inspeccion i
JOIN inspeccion_respuesta ir ON ir.ins_id = i.ins_id
JOIN formulario_pregunta fp ON fp.frp_id = ir.frp_id
WHERE i.ins_id = [ID_INSPECCION]
ORDER BY fp.frp_orden;`} />
        </AccordionDetails>
      </Accordion>

      {/* 7. ACTIVIDADES DE SEGURIDAD */}
      <Accordion expanded={expanded === "actividades"} onChange={handleChange("actividades")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<AccountTree color="primary" />} title="7. Actividades de Seguridad" subtitle="actividad_seguridad, iniciativa, programa_tarea" />
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`iniciativa (1) ──── (N) actividad_seguridad (N) ──── (1) formulario
                            │
programa_tarea (1) ─────────┘
                            │
                    (1) ──── (N) tarea
                            │
              actividad_seguridad_pdf (documentos asociados)`}
          </Box>

          <TableSchema columns={[
            { name: "acs_id", type: "SERIAL PK", desc: "ID de la actividad" },
            { name: "ini_id", type: "FK → iniciativa", desc: "Iniciativa a la que pertenece" },
            { name: "pta_id", type: "FK → programa_tarea", desc: "Programa de tareas asociado" },
            { name: "frm_id", type: "FK → formulario", desc: "Formulario que se ejecuta en esta actividad" },
            { name: "acs_nombre", type: "VARCHAR", desc: "Nombre de la actividad" },
            { name: "acs_activo", type: "BOOLEAN", desc: "true = activa" },
          ]} />

          <SqlBlock title="Query: Actividades por empresa" sql={`SELECT acs_id, acs_nombre, acs_activo, frm_id,
       ini.ini_nombre AS iniciativa,
       pta.pta_nombre AS programa
FROM actividad_seguridad acs
LEFT JOIN iniciativa ini ON acs.ini_id = ini.ini_id
LEFT JOIN programa_tarea pta ON acs.pta_id = pta.pta_id
WHERE acs.emp_id = [ID_EMPRESA]
  AND acs.acs_activo = true
ORDER BY acs.acs_nombre;`} />
        </AccordionDetails>
      </Accordion>

      {/* 8. ESTRUCTURA ORGANIZACIONAL */}
      <Accordion expanded={expanded === "estructura"} onChange={handleChange("estructura")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<AccountTree color="primary" />} title="8. Estructura Organizacional" subtitle="empresa, region, subregion, localidad, area, negocio, responsable" />
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`empresa
  └── region
        └── subregion (opcional)
              └── localidad
                    └── area

responsable (tabla pivote que une todo):
  emp_id + reg_id + sre_id + loc_id + are_id + neg_id

usuario se asigna a: localidad + area + negocio
usuario_localidad permite asignaciones múltiples`}
          </Box>

          <SqlBlock title="Query: Estructura completa de una empresa" sql={`SELECT e.emp_nombre, r.reg_nombre, l.loc_nombre, l.loc_activo
FROM localidad l
JOIN region r ON r.reg_id = l.reg_id
JOIN empresa e ON e.emp_id = r.emp_id
WHERE e.emp_id = [ID_EMPRESA]
ORDER BY r.reg_nombre, l.loc_nombre;`} />

          <SqlBlock title="Query: Áreas y cargos de una empresa" sql={`SELECT are_id, are_nombre, are_activo
FROM area WHERE emp_id = [ID_EMPRESA] ORDER BY are_nombre;

SELECT car_id, car_nombre, car_activo
FROM cargo WHERE emp_id = [ID_EMPRESA] ORDER BY car_nombre;`} />
        </AccordionDetails>
      </Accordion>

      {/* 9. RANKINGS Y RECOMPENSAS */}
      <Accordion expanded={expanded === "rankings"} onChange={handleChange("rankings")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="9. Rankings y Recompensas" subtitle="ranking, recompensa, recompensa_kardex" />
        </AccordionSummary>
        <AccordionDetails>
          <SqlBlock title="Query: Ranking de un usuario" sql={`SELECT r.ran_id, r.ran_posicion, r.ran_puntos, r.ran_periodo,
       u.usu_nombres
FROM ranking r
JOIN usuario u ON u.usu_id = r.usu_id
WHERE r.usu_id = [ID_USUARIO]
ORDER BY r.ran_periodo DESC;`} />

          <SqlBlock title="Query: Top 10 ranking por empresa y periodo" sql={`SELECT r.ran_posicion, u.usu_nombres, r.ran_puntos
FROM ranking r
JOIN usuario u ON u.usu_id = r.usu_id
WHERE r.emp_id = [ID_EMPRESA]
  AND r.ran_periodo = '[PERIODO]'
ORDER BY r.ran_posicion ASC
LIMIT 10;`} />

          <SqlBlock title="Query: Kardex de puntos (movimientos)" sql={`SELECT k.kar_id, k.kar_puntos, k.kar_descripcion,
       k.kar_fecha, k.kar_tipo
FROM kardex k
WHERE k.usu_id = [ID_USUARIO]
ORDER BY k.kar_fecha DESC
LIMIT 20;`} />

          <SqlBlock title="Query: Catálogo de recompensas disponibles" sql={`SELECT rec_id, rec_nombre, rec_puntos, rec_activo, rec_stock
FROM recompensa
WHERE rec_activo = true
  AND emp_id = [ID_EMPRESA]
ORDER BY rec_puntos;`} />
        </AccordionDetails>
      </Accordion>

      {/* 10. METAS */}
      <Accordion expanded={expanded === "metas"} onChange={handleChange("metas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="10. Metas" subtitle="meta, meta_actividad, medicion_tipo" />
        </AccordionSummary>
        <AccordionDetails>
          <TableSchema columns={[
            { name: "met_id", type: "SERIAL PK", desc: "ID de la meta" },
            { name: "usu_id", type: "FK → usuario", desc: "Usuario que tiene la meta" },
            { name: "act_id", type: "FK → actividad", desc: "Actividad medida" },
            { name: "mti_id", type: "FK → medicion_tipo", desc: "Tipo de medición (unidad)" },
            { name: "met_tipo", type: "VARCHAR", desc: "Tipo de meta" },
            { name: "met_cantidad", type: "NUMERIC", desc: "Objetivo a alcanzar" },
            { name: "met_anio, met_mes, met_semana", type: "INTEGER", desc: "Periodo de la meta" },
            { name: "met_avance", type: "NUMERIC", desc: "Progreso actual" },
          ]} />

          <SqlBlock title="Query: Metas activas por empresa" sql={`SELECT met_id, met_nombre, met_activo,
       met_valor_objetivo, met_fecha_inicio, met_fecha_fin
FROM meta
WHERE emp_id = [ID_EMPRESA] AND met_activo = true
ORDER BY met_fecha_inicio DESC;`} />

          <SqlBlock title="Query: Actividades vinculadas a una meta" sql={`SELECT ma.acs_id, a.acs_nombre, a.acs_activo
FROM meta_actividad ma
JOIN actividad_seguridad a ON a.acs_id = ma.acs_id
WHERE ma.met_id = [ID_META];`} />
        </AccordionDetails>
      </Accordion>

      {/* 11. NOTIFICACIONES */}
      <Accordion expanded={expanded === "notificaciones"} onChange={handleChange("notificaciones")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Code color="primary" />} title="11. Notificaciones Push" subtitle="usuario_notificacion_seguridad, Firebase FCM" />
        </AccordionSummary>
        <AccordionDetails>
          <TableSchema columns={[
            { name: "ung_id", type: "SERIAL PK", desc: "ID de la notificación" },
            { name: "usu_id", type: "FK → usuario", desc: "Destinatario" },
            { name: "ung_token", type: "VARCHAR", desc: "Token Firebase del dispositivo" },
            { name: "ung_tipo", type: "VARCHAR", desc: "Tipo de notificación" },
            { name: "ung_titulo", type: "VARCHAR", desc: "Título mostrado" },
            { name: "ung_texto", type: "TEXT", desc: "Cuerpo del mensaje" },
            { name: "ung_estado", type: "INTEGER", desc: "Estado de envío" },
            { name: "ung_fecha", type: "TIMESTAMP", desc: "Fecha de envío" },
          ]} />

          <SqlBlock title="Query: Verificar token Firebase de un usuario" sql={`SELECT usu_id, usu_nombres, usu_email,
       usu_firebase_token,
       usu_fecha_token_update
FROM usuario
WHERE usu_id = [ID_USUARIO];`} />

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Flujo:</strong> El app registra el <code>usu_firebase_token</code> al hacer login.
            Si el token es NULL o está desactualizado, las notificaciones no llegan.
            Se usa Firebase Cloud Messaging (FCM) para el envío.
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 12. AUDITORÍA */}
      <Accordion expanded={expanded === "auditoria"} onChange={handleChange("auditoria")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Code color="primary" />} title="12. Auditoría y Bitácora" subtitle="bitacora, bitacora_usuario, bitacora_usuario_cargo, bitacora_usuario_jefe" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            El sistema mantiene un registro completo de cambios en las siguientes tablas de bitácora:
          </Typography>
          <TableSchema columns={[
            { name: "bitacora", type: "GENERAL", desc: "Registro general: reg_id, tab_id, bit_tipo, bit_fecha" },
            { name: "bitacora_usuario", type: "USUARIO", desc: "Cambios en usuario: usu_id, are_id, uca_id, emp_id, loc_id, btu_fecha_modificacion" },
            { name: "bitacora_usuario_cargo", type: "CARGO", desc: "Historial de cambios de cargo" },
            { name: "bitacora_usuario_jefe", type: "JEFE", desc: "Historial de cambios de jefe directo" },
            { name: "bitacora_charlas", type: "CHARLA", desc: "Registro de cambios en charlas: btc_fecha, cha_id, usu_id, btc_descripcion" },
            { name: "usuario_causa", type: "CAUSA", desc: "Periodos de ausencia: uca_fecha_inicio/fin, uca_motivo, uca_estado" },
          ]} />
        </AccordionDetails>
      </Accordion>

      {/* 13. MENÚS Y PERMISOS */}
      <Accordion expanded={expanded === "menus"} onChange={handleChange("menus")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Code color="primary" />} title="13. Menús y Permisos" subtitle="menu, cmenu, menu_tipo_usuario" />
        </AccordionSummary>
        <AccordionDetails>
          <SqlBlock title="Query: Menú visible para un tipo de usuario" sql={`SELECT m.men_id, m.men_nombre, m.men_ruta, m.men_activo
FROM menu m
JOIN menu_tipo_usuario mtu ON mtu.men_id = m.men_id
WHERE mtu.tip_id = [TIPO_USUARIO_ID]
  AND m.men_activo = true
ORDER BY m.men_orden;`} />

          <Alert severity="info">
            <strong>Relación:</strong> <code>usuario.cme_id → cmenu</code> define el menú base del usuario.
            <code>cargo_nivel.cme_id → cmenu</code> define el menú por nivel de cargo.
            <code>menu_tipo_usuario</code> vincula menús específicos con tipos de usuario.
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RadiografiaTecnicaAppPage;
