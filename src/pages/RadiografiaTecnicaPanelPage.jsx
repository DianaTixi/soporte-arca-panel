import { useState } from "react";
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider,
} from "@mui/material";
import { ExpandMore, DesktopWindows, Storage, Assessment, AccountTree, Code } from "@mui/icons-material";

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
        border: "1px solid", borderColor: "divider", maxHeight: 500,
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

const RadiografiaTecnicaPanelPage = () => {
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (_, isExpanded) => setExpanded(isExpanded ? panel : false);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <DesktopWindows sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={800}>Radiografía Técnica — Panel Web</Typography>
        </Box>
        <Typography color="text.secondary">
          Estructura de DB, relaciones entre tablas, queries detallados de cada módulo del Panel.
          Enfoque especial en la <strong>reportería</strong>: de dónde salen los datos, JOINs, condiciones y filtros.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>API principal:</strong> api_arca (puerto 4400) — PostgreSQL.
          El panel web consume los mismos endpoints REST que alimentan los datos del APP.
        </Alert>
      </Box>

      {/* 1. GESTIÓN DE USUARIOS */}
      <Accordion expanded={expanded === "usuarios"} onChange={handleChange("usuarios")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="1. Gestión de Usuarios (CRUD desde Panel)" subtitle="usuario, usuario_cargo, cargo_nivel, usuario_localidad, responsable" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            Desde el panel se crea, edita, activa/desactiva usuarios. El flujo de inserción es:
          </Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`1. Se crea el usuario_cargo (si no existe)
   INSERT INTO usuario_cargo (uca_nombre, uca_nivel) VALUES (...)

2. Se crea el usuario
   INSERT INTO usuario (usu_nombres, usu_apellidos, usu_email, usu_password,
                        uca_id, loc_id, are_id, neg_id, usu_reporta, cme_id, ...)
   VALUES (...)

3. Se insertan localidades adicionales (si aplica)
   INSERT INTO usuario_localidad (usu_id, loc_id, are_id, emp_id, usl_activo)
   VALUES (...)

4. Se registra en bitácora
   INSERT INTO bitacora_usuario (...) VALUES (...)`}
          </Box>

          <SqlBlock title="Query: Listado de usuarios con estructura completa (usado en grids del panel)" sql={`SELECT u.usu_id, u.usu_nombres, u.usu_apellidos,
       u.usu_email, u.usu_identificacion,
       u.usu_activo, u.usu_estado,
       u.usu_seguridad, u.usu_salud,
       uc.uca_nombre AS cargo,
       cn.can_nombre AS nivel_cargo,
       l.loc_nombre, r.reg_nombre, e.emp_nombre,
       a.are_nombre, n.neg_nombre,
       jefe.usu_nombres || ' ' || jefe.usu_apellidos AS jefe_directo,
       cm.cme_nombre AS menu_asignado
FROM usuario u
LEFT JOIN usuario_cargo uc ON u.uca_id = uc.uca_id
LEFT JOIN cargo_nivel cn ON uc.uca_nivel = cn.can_id
LEFT JOIN localidad l ON u.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
LEFT JOIN area a ON u.are_id = a.are_id
LEFT JOIN negocio n ON u.neg_id = n.neg_id
LEFT JOIN usuario jefe ON u.usu_reporta = jefe.usu_id
LEFT JOIN cmenu cm ON u.cme_id = cm.cme_id
WHERE u.usu_activo = true
ORDER BY e.emp_nombre, l.loc_nombre, u.usu_apellidos;`} />

          <SqlBlock title="Query: Historial de cambios de un usuario (bitácora)" sql={`SELECT bu.btu_id, bu.usu_id,
       bu.are_id, a.are_nombre,
       bu.uca_id, uc.uca_nombre,
       bu.emp_id, e.emp_nombre,
       bu.loc_id, l.loc_nombre,
       bu.btu_fecha_modificacion
FROM bitacora_usuario bu
LEFT JOIN area a ON bu.are_id = a.are_id
LEFT JOIN usuario_cargo uc ON bu.uca_id = uc.uca_id
LEFT JOIN empresa e ON bu.emp_id = e.emp_id
LEFT JOIN localidad l ON bu.loc_id = l.loc_id
WHERE bu.usu_id = [ID_USUARIO]
ORDER BY bu.btu_fecha_modificacion DESC;`} />
        </AccordionDetails>
      </Accordion>

      {/* 2. FORMULARIOS */}
      <Accordion expanded={expanded === "formularios"} onChange={handleChange("formularios")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="2. Formularios (Diseño desde Panel)" subtitle="formulario → formulario_segmento → formulario_pregunta → formulario_pregunta_detalle" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            El panel permite diseñar formularios con segmentos, preguntas y opciones de respuesta.
            Los formularios se vinculan a actividades de seguridad, que a su vez generan tareas.
          </Typography>

          <SqlBlock title="Query: Validar si un formulario se puede desactivar" sql={`-- Un formulario NO se puede desactivar si tiene actividades activas vinculadas
SELECT acs_id, acs_nombre, acs_activo
FROM actividad_seguridad
WHERE frm_id = [ID_FORMULARIO]
  AND acs_activo = true;

-- Si este query retorna filas, NO se puede desactivar el formulario
-- Primero se deben desactivar las actividades de seguridad`} />

          <SqlBlock title="Query: Detalle de opciones de una pregunta" sql={`SELECT fpd_id, fpd_nombre, fpd_orden,
       fpd_activo, fpd_calificacion,
       fpd_imagen, fpd_numerador, fpd_denominador,
       fpd_no_contabiliza
FROM formulario_pregunta_detalle
WHERE frp_id = [ID_PREGUNTA]
ORDER BY fpd_orden;`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Integridad referencial:</strong><br />
            • <code>formulario.frm_nombre</code> es UNIQUE con comparación UPPER+TRIM<br />
            • Las preguntas tipo 3 (calificadas) necesitan <code>fpd_calificacion</code> en cada detalle<br />
            • Las preguntas tipo 12/13 (ratio) usan <code>fpd_numerador</code> y <code>fpd_denominador</code>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 3. CHARLAS - GESTIÓN */}
      <Accordion expanded={expanded === "charlas"} onChange={handleChange("charlas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="3. Charlas (Gestión desde Panel)" subtitle="charla, charla_respuesta, pregunta_charla, dcharla" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            El panel crea charlas, define preguntas de evaluación y asigna usuarios. El flujo es:
          </Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`1. Crear charla
   INSERT INTO charla (cha_nombre, cha_fecha_inicio, cha_fecha_fin,
                       tipo_charla_id, cha_rating, cha_capacitacion,
                       cha_video, cha_num_preguntas, ...)

2. Agregar preguntas de evaluación
   INSERT INTO pregunta_charla (cha_id, pch_pregunta, pch_tipo, ...)
   INSERT INTO dpregunta_charla (pch_id, dpc_nombre)  -- opciones

3. Agregar recursos/slides
   INSERT INTO dcharla (cha_id, dch_orden, dch_recurso)

4. Asignar usuarios (masivo)
   INSERT INTO charla_respuesta (cha_id, usu_id, chr_estado,
                                  usu_id_jefe, loc_id_jef, are_id_jef, emp_id_jef, uca_id_jef)
   -- chr_estado = 0 (pendiente)
   -- Se desnormalizan datos del jefe al momento de la asignación`}
          </Box>

          <SqlBlock title="Query: Resumen de avance de una charla" sql={`SELECT
  COUNT(*) AS total_asignados,
  COUNT(CASE WHEN chr_estado = 1 THEN 1 END) AS completadas,
  COUNT(CASE WHEN chr_estado = 0 THEN 1 END) AS pendientes,
  ROUND(
    COUNT(CASE WHEN chr_estado = 1 THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*), 0) * 100, 2
  ) AS porcentaje_avance
FROM charla_respuesta
WHERE cha_id = [ID_CHARLA]
  AND chr_activo = true;  -- o chu_activo según la tabla`} />

          <SqlBlock title="Query: Usuarios pendientes de una charla con datos de estructura" sql={`SELECT u.usu_id, u.usu_nombres, u.usu_apellidos,
       u.usu_email, e.emp_nombre, l.loc_nombre,
       cr.chr_estado
FROM charla_respuesta cr
JOIN usuario u ON cr.usu_id = u.usu_id
LEFT JOIN localidad l ON u.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
WHERE cr.cha_id = [ID_CHARLA]
  AND cr.chr_estado = 0  -- pendientes
ORDER BY e.emp_nombre, l.loc_nombre, u.usu_apellidos;`} />
        </AccordionDetails>
      </Accordion>

      {/* 4. TAREAS - GESTIÓN */}
      <Accordion expanded={expanded === "tareas"} onChange={handleChange("tareas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="4. Tareas (Asignación desde Panel)" subtitle="tarea, tarea_asignacion, actividad_seguridad" />
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`Flujo de creación de tarea desde Panel:

1. Seleccionar actividad_seguridad (que tiene un formulario vinculado)
2. Crear tarea
   INSERT INTO tarea (usu_id_creo, acs_id, tar_descripcion, tar_fecha,
                      tar_activo, tar_tipo, tar_movil)

3. Asignar a usuarios/localidades
   INSERT INTO tarea_asignacion (tar_id, usu_id, loc_id, neg_id,
                                  tas_fecha_inicio, tas_fecha_fin,
                                  emp_id_asignado, loc_id_asignado)

4. Para tareas recurrentes (tar_tipo = 3):
   Se crean clones periódicos con tar_clonada = true
   y tar_id_original apuntando a la tarea original`}
          </Box>

          <SqlBlock title="Query: Avance de una tarea (respuestas vs asignados)" sql={`SELECT
  t.tar_id, t.tar_descripcion,
  COUNT(ta.tas_id) AS total_asignados,
  COUNT(CASE WHEN ta.tas_estado = true THEN 1 END) AS completados,
  COUNT(CASE WHEN ta.tas_estado = false THEN 1 END) AS pendientes
FROM tarea t
JOIN tarea_asignacion ta ON t.tar_id = ta.tar_id
WHERE t.tar_id = [ID_TAREA]
  AND ta.tas_activo = true
GROUP BY t.tar_id, t.tar_descripcion;`} />
        </AccordionDetails>
      </Accordion>

      {/* 5. INCIDENCIAS - PANEL */}
      <Accordion expanded={expanded === "incidencias"} onChange={handleChange("incidencias")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="5. Incidencias (Seguimiento desde Panel)" subtitle="incidencia, incidencia_imagen, tipo_observacion, potencial" />
        </AccordionSummary>
        <AccordionDetails>
          <SqlBlock title="Query: Dashboard de incidencias por empresa/periodo" sql={`SELECT
  COUNT(*) AS total,
  COUNT(CASE WHEN inc_reincidencia = true THEN 1 END) AS reincidencias,
  MIN(inc_fecha) AS primera,
  MAX(inc_fecha) AS ultima
FROM incidencia
WHERE emp_id = [ID_EMPRESA]
  AND EXTRACT(YEAR FROM inc_fecha) = [ANIO]
  AND EXTRACT(MONTH FROM inc_fecha) = [MES];`} />

          <SqlBlock title="Query: Incidencias por tipo de observación" sql={`SELECT tob.tob_nombre AS tipo_observacion,
       COUNT(i.inc_id) AS total,
       COUNT(CASE WHEN i.inc_reincidencia = true THEN 1 END) AS reincidencias
FROM incidencia i
JOIN tipo_observacion tob ON i.tob_id = tob.tob_id
WHERE i.emp_id = [ID_EMPRESA]
  AND i.inc_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
GROUP BY tob.tob_nombre
ORDER BY total DESC;`} />

          <SqlBlock title="Query: Incidencias con imágenes" sql={`SELECT i.inc_id, i.inc_numero, i.inc_fecha,
       i.inc_desc_observacion,
       u.usu_nombres, u.usu_apellidos,
       array_agg(ii.iin_imagen) AS imagenes
FROM incidencia i
JOIN usuario u ON i.usu_id = u.usu_id
LEFT JOIN incidencia_imagen ii ON i.inc_id = ii.inc_id
WHERE i.inc_id = [ID_INCIDENCIA]
GROUP BY i.inc_id, i.inc_numero, i.inc_fecha,
         i.inc_desc_observacion, u.usu_nombres, u.usu_apellidos;`} />
        </AccordionDetails>
      </Accordion>

      {/* 6. INSPECCIONES - PANEL */}
      <Accordion expanded={expanded === "inspecciones"} onChange={handleChange("inspecciones")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Storage color="primary" />} title="6. Inspecciones (Seguimiento desde Panel)" subtitle="inspeccion, dinspeccion, inspeccion_respuesta" />
        </AccordionSummary>
        <AccordionDetails>
          <SqlBlock title="Query: Dashboard de inspecciones por localidad" sql={`SELECT
  COUNT(*) AS total_inspecciones,
  AVG(ins_calificacion) AS promedio_calificacion,
  MIN(ins_calificacion) AS min_calificacion,
  MAX(ins_calificacion) AS max_calificacion
FROM inspeccion
WHERE loc_id = [ID_LOCALIDAD]
  AND ins_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]';`} />

          <SqlBlock title="Query: Ranking de inspectores por calificación promedio" sql={`SELECT u.usu_id, u.usu_nombres, u.usu_apellidos,
       COUNT(i.ins_id) AS total_inspecciones,
       AVG(i.ins_calificacion) AS promedio,
       l.loc_nombre, e.emp_nombre
FROM inspeccion i
JOIN usuario u ON i.usu_id = u.usu_id
LEFT JOIN localidad l ON i.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
WHERE i.ins_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
  AND i.emp_id = [ID_EMPRESA]
GROUP BY u.usu_id, u.usu_nombres, u.usu_apellidos,
         l.loc_nombre, e.emp_nombre
ORDER BY promedio DESC;`} />
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 4 }}>
        <Chip label="REPORTERÍA DETALLADA" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: 14 }} />
      </Divider>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>SECCIÓN CRÍTICA:</strong> A continuación se detalla cada reporte del sistema con sus queries exactos,
        tablas involucradas, JOINs, condiciones, campos desnormalizados y lógica de cálculo.
      </Alert>

      {/* 7. REPORTE LV */}
      <Accordion expanded={expanded === "rep-lv"} onChange={handleChange("rep-lv")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#e91e63" }} />} title="7. Reporte LV (Liderazgo Visible)" subtitle="incidencia, usuario, responsable, semana_reporte" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El reporte LV mide la cantidad de <strong>incidencias</strong> registradas por cada líder/jefe
            y los subalternos que le reportan, en periodos semanales.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>Tabla de soporte: <code>semana_reporte</code></Typography>
          <TableSchema columns={[
            { name: "ser_id", type: "SERIAL PK", desc: "ID de la semana" },
            { name: "ser_week", type: "DATE", desc: "Fecha inicio de la semana" },
            { name: "ser_end_week", type: "DATE", desc: "Fecha fin de la semana" },
            { name: "ser_mes", type: "INTEGER", desc: "Mes al que pertenece la semana" },
            { name: "ser_anio", type: "INTEGER", desc: "Año" },
          ]} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Flujo del reporte LV</Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`1. Se obtienen las semanas del mes/año seleccionado (semana_reporte)
2. Por cada semana, se cuentan incidencias del usuario y sus subalternos
3. Se cruza con la tabla responsable para filtrar por empresa/localidad/área
4. Se usa usu_reporta (self-join) para armar la jerarquía jefe-subordinado
5. Los campos desnormalizados (emp_id_jef, loc_id_jef, etc.) de la incidencia
   permiten reportar según la estructura al MOMENTO de la incidencia`}
          </Box>

          <SqlBlock title="Query base: Incidencias por jefe en semanas del mes" sql={`-- Paso 1: Obtener semanas del periodo
SELECT ser_id, ser_week, ser_end_week
FROM semana_reporte
WHERE ser_mes = [MES] AND ser_anio = [ANIO]
ORDER BY ser_week;

-- Paso 2: Contar incidencias por semana para un jefe y sus subalternos
SELECT
  sr.ser_week, sr.ser_end_week,
  -- Incidencias del jefe directamente
  COUNT(CASE WHEN i.usu_id = u.usu_id THEN 1 END) AS inc_propias,
  -- Incidencias de los subalternos
  COUNT(CASE WHEN i.usu_id != u.usu_id THEN 1 END) AS inc_subalternos,
  COUNT(i.inc_id) AS total
FROM semana_reporte sr
CROSS JOIN usuario u
LEFT JOIN incidencia i ON i.inc_fecha BETWEEN sr.ser_week AND sr.ser_end_week
  AND (i.usu_id = u.usu_id OR i.usu_id_jefe = u.usu_id)
WHERE sr.ser_mes = [MES] AND sr.ser_anio = [ANIO]
  AND u.usu_id = [ID_JEFE]
GROUP BY sr.ser_week, sr.ser_end_week
ORDER BY sr.ser_week;`} />

          <SqlBlock title="Query: LV con filtros de estructura" sql={`SELECT u.usu_id, u.usu_nombres, u.usu_apellidos,
       e.emp_nombre, l.loc_nombre, a.are_nombre,
       uc.uca_nombre AS cargo,
       COUNT(i.inc_id) AS total_incidencias,
       COUNT(DISTINCT sr.ser_id) AS semanas_con_actividad
FROM usuario u
LEFT JOIN usuario_cargo uc ON u.uca_id = uc.uca_id
LEFT JOIN localidad l ON u.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
LEFT JOIN area a ON u.are_id = a.are_id
LEFT JOIN incidencia i ON (i.usu_id = u.usu_id OR i.usu_id_jefe = u.usu_id)
  AND EXTRACT(YEAR FROM i.inc_fecha) = [ANIO]
  AND EXTRACT(MONTH FROM i.inc_fecha) = [MES]
LEFT JOIN semana_reporte sr ON i.inc_fecha BETWEEN sr.ser_week AND sr.ser_end_week
WHERE e.emp_id = [ID_EMPRESA]
  AND u.usu_activo = true
GROUP BY u.usu_id, u.usu_nombres, u.usu_apellidos,
         e.emp_nombre, l.loc_nombre, a.are_nombre, uc.uca_nombre
ORDER BY total_incidencias DESC;`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Campos desnormalizados clave:</strong> Las incidencias guardan <code>usu_id_jefe</code>, <code>emp_id_jef</code>,
            <code>loc_id_jef</code>, <code>are_id_jef</code>, <code>uca_id_jef</code> al momento de creación.
            Esto garantiza que si un usuario cambia de jefe o localidad, las incidencias anteriores siguen reportándose correctamente.
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 8. REPORTE OPE */}
      <Accordion expanded={expanded === "rep-ope"} onChange={handleChange("rep-ope")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#ff9800" }} />} title="8. Reporte OPE (Observación Preventiva Ejecutiva)" subtitle="incidencia, usuario, tipo_observacion, potencial" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El reporte OPE analiza la <strong>calidad y profundidad</strong> de las observaciones/incidencias:
            tipo de observación, potencial de riesgo, acciones tomadas, y reincidencias.
          </Alert>

          <SqlBlock title="Query: OPE - Análisis por tipo de observación y potencial" sql={`SELECT
  tob.tob_nombre AS tipo_observacion,
  pot.pot_nombre AS potencial,
  COUNT(i.inc_id) AS total,
  COUNT(CASE WHEN i.inc_reincidencia = true THEN 1 END) AS reincidencias,
  COUNT(CASE WHEN i.inc_desc_accion_tomada IS NOT NULL
             AND i.inc_desc_accion_tomada != '' THEN 1 END) AS con_accion
FROM incidencia i
JOIN tipo_observacion tob ON i.tob_id = tob.tob_id
LEFT JOIN potencial pot ON i.pot_id = pot.pot_id
WHERE i.emp_id = [ID_EMPRESA]
  AND EXTRACT(YEAR FROM i.inc_fecha) = [ANIO]
  AND EXTRACT(MONTH FROM i.inc_fecha) = [MES]
GROUP BY tob.tob_nombre, pot.pot_nombre
ORDER BY total DESC;`} />

          <SqlBlock title="Query: OPE por usuario (cuántas observaciones y calidad)" sql={`SELECT
  u.usu_id, u.usu_nombres, u.usu_apellidos,
  l.loc_nombre, e.emp_nombre,
  COUNT(i.inc_id) AS total_observaciones,
  COUNT(CASE WHEN i.inc_reincidencia = true THEN 1 END) AS reincidencias,
  COUNT(CASE WHEN LENGTH(i.inc_desc_accion_tomada) > 20 THEN 1 END) AS con_accion_detallada,
  COUNT(DISTINCT i.tob_id) AS tipos_observacion_distintos
FROM incidencia i
JOIN usuario u ON i.usu_id = u.usu_id
LEFT JOIN localidad l ON i.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
WHERE i.emp_id = [ID_EMPRESA]
  AND i.inc_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
GROUP BY u.usu_id, u.usu_nombres, u.usu_apellidos,
         l.loc_nombre, e.emp_nombre
ORDER BY total_observaciones DESC;`} />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Tablas de referencia</Typography>
          <TableSchema columns={[
            { name: "tipo_observacion.tob_id", type: "SERIAL PK", desc: "Categoría de la observación (condición insegura, acto inseguro, etc.)" },
            { name: "potencial.pot_id", type: "SERIAL PK", desc: "Nivel de riesgo: leve, moderado, grave, fatal" },
            { name: "incidencia.opc_id", type: "FK → opcion", desc: "Opción adicional de clasificación" },
          ]} />
        </AccordionDetails>
      </Accordion>

      {/* 9. REPORTE P5M */}
      <Accordion expanded={expanded === "rep-p5m"} onChange={handleChange("rep-p5m")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#4caf50" }} />} title="9. Reporte P5M (Primeros 5 Minutos)" subtitle="charla_respuesta, charla, semana_reporte, usuario, cargo_nivel" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El P5M mide la <strong>asignación y cumplimiento de charlas</strong> por semana, agrupadas por jefe.
            Cuenta charlas asignadas vs completadas para cada jefe y sus subalternos.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>Lógica del reporte</Typography>
          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`1. Se filtran las semanas del mes/año (semana_reporte)
2. Se identifican los jefes (usuarios con cargo que tiene can_impartidor = true
   o can_charlas = true en cargo_nivel)
3. Por cada jefe, se cuentan charlas asignadas y completadas de sus subalternos
4. Se usa charla_respuesta.usu_id_jefe (campo desnormalizado) para asignar
   la charla al jefe correcto
5. Se filtra por empresa, localidad, área según los filtros seleccionados`}
          </Box>

          <SqlBlock title="Query: P5M - Charlas por jefe por semana" sql={`SELECT
  jefe.usu_id AS id_jefe,
  jefe.usu_nombres || ' ' || jefe.usu_apellidos AS nombre_jefe,
  e.emp_nombre, l.loc_nombre, a.are_nombre,
  uc.uca_nombre AS cargo_jefe,
  sr.ser_week, sr.ser_end_week,
  -- Charlas asignadas en la semana
  COUNT(cr.chr_id) AS asignadas,
  -- Charlas completadas en la semana
  COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END) AS completadas,
  -- Porcentaje de cumplimiento
  ROUND(
    COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END)::NUMERIC /
    NULLIF(COUNT(cr.chr_id), 0) * 100, 2
  ) AS pct_cumplimiento
FROM semana_reporte sr
CROSS JOIN usuario jefe
JOIN usuario_cargo uc ON jefe.uca_id = uc.uca_id
JOIN cargo_nivel cn ON uc.uca_nivel = cn.can_id
LEFT JOIN charla_respuesta cr ON cr.usu_id_jefe = jefe.usu_id
LEFT JOIN charla ch ON cr.cha_id = ch.cha_id
  AND ch.cha_fecha_inicio <= sr.ser_end_week
  AND ch.cha_fecha_fin >= sr.ser_week
LEFT JOIN localidad l ON jefe.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
LEFT JOIN area a ON jefe.are_id = a.are_id
WHERE sr.ser_mes = [MES] AND sr.ser_anio = [ANIO]
  AND (cn.can_impartidor = true OR cn.can_charlas = true)
  AND jefe.usu_activo = true
  AND e.emp_id = [ID_EMPRESA]
GROUP BY jefe.usu_id, jefe.usu_nombres, jefe.usu_apellidos,
         e.emp_nombre, l.loc_nombre, a.are_nombre, uc.uca_nombre,
         sr.ser_week, sr.ser_end_week
ORDER BY nombre_jefe, sr.ser_week;`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Campos clave para P5M:</strong><br />
            • <code>charla_respuesta.usu_id_jefe</code> — el jefe responsable (desnormalizado al momento de asignación)<br />
            • <code>cargo_nivel.can_impartidor</code> / <code>can_charlas</code> — filtran qué cargos aparecen como jefes en el reporte<br />
            • <code>charla.cha_fecha_inicio/fin</code> — se cruza con <code>semana_reporte</code> para ubicar en la semana correcta<br />
            • <code>charla_respuesta.chr_estado</code> — 0 = pendiente, 1 = completada
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 10. REPORTE RATINGS */}
      <Accordion expanded={expanded === "rep-ratings"} onChange={handleChange("rep-ratings")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#9c27b0" }} />} title="10. Reporte Ratings (Calificaciones)" subtitle="reporte_rating, charla (cha_rating=true), incidencia, inspeccion" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El reporte de Ratings es un <strong>consolidado mensual</strong> que combina los scores de P5M, OPE y LV
            para dar una calificación total a cada usuario/jefe.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>Tabla: <code>reporte_rating</code> (tabla precalculada)</Typography>
          <TableSchema columns={[
            { name: "rat_id", type: "SERIAL PK", desc: "ID del registro" },
            { name: "usu_id", type: "FK → usuario", desc: "Usuario evaluado" },
            { name: "usu_nombre", type: "VARCHAR", desc: "Nombre desnormalizado" },
            { name: "loc_nombre", type: "VARCHAR", desc: "Localidad desnormalizada" },
            { name: "emp_nombre", type: "VARCHAR", desc: "Empresa desnormalizada" },
            { name: "are_nombre", type: "VARCHAR", desc: "Área desnormalizada" },
            { name: "uca_nombre", type: "VARCHAR", desc: "Cargo desnormalizado" },
            { name: "mes", type: "INTEGER", desc: "Mes del rating" },
            { name: "anio", type: "INTEGER", desc: "Año del rating" },
            { name: "p5m", type: "NUMERIC", desc: "Score P5M del mes" },
            { name: "ope", type: "NUMERIC", desc: "Score OPE del mes" },
            { name: "lv", type: "NUMERIC", desc: "Score LV del mes" },
            { name: "total", type: "NUMERIC", desc: "Score total (combinación de P5M + OPE + LV)" },
          ]} />

          <SqlBlock title="Query: Rating mensual por empresa" sql={`SELECT rat_id, usu_id, usu_nombre,
       loc_nombre, emp_nombre, are_nombre, uca_nombre,
       p5m, ope, lv, total,
       mes, anio
FROM reporte_rating
WHERE anio = [ANIO] AND mes = [MES]
  AND emp_nombre = '[NOMBRE_EMPRESA]'
ORDER BY total DESC;`} />

          <SqlBlock title="Query: Evolución de rating de un usuario" sql={`SELECT mes, anio, p5m, ope, lv, total
FROM reporte_rating
WHERE usu_id = [ID_USUARIO]
  AND anio = [ANIO]
ORDER BY mes;`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Importante:</strong> <code>reporte_rating</code> es una tabla <strong>precalculada</strong>.
            Los datos se generan mediante un proceso batch que cruza P5M, OPE y LV del mes.
            Los nombres están desnormalizados para performance. Si un usuario cambia de estructura,
            los ratings históricos mantienen los datos del momento en que se calcularon.
          </Alert>

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Charlas tipo Rating</Typography>
          <SqlBlock sql={`-- Las charlas con cha_rating = true se usan para el cálculo de Ratings
-- A diferencia de las charlas normales (cha_capacitacion = true)
-- que van al reporte de Charlas

SELECT cha_id, cha_nombre, cha_rating, cha_capacitacion
FROM charla
WHERE cha_rating = true AND cha_activo = true;`} />
        </AccordionDetails>
      </Accordion>

      {/* 11. REPORTE CHARLAS */}
      <Accordion expanded={expanded === "rep-charlas"} onChange={handleChange("rep-charlas")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#2196f3" }} />} title="11. Reporte Charlas (Capacitaciones)" subtitle="charla (cha_capacitacion=true), charla_respuesta, usuario" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este reporte muestra el avance de <strong>charlas de capacitación</strong> (no ratings).
            Se filtra por <code>cha_capacitacion = true</code>.
          </Alert>

          <SqlBlock title="Query: Avance general de charlas de capacitación por periodo" sql={`SELECT
  ch.cha_id, ch.cha_nombre,
  ch.cha_fecha_inicio, ch.cha_fecha_fin,
  COUNT(cr.chr_id) AS total_asignados,
  COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END) AS completados,
  ROUND(
    COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END)::NUMERIC /
    NULLIF(COUNT(cr.chr_id), 0) * 100, 2
  ) AS pct_avance
FROM charla ch
JOIN charla_respuesta cr ON ch.cha_id = cr.cha_id
WHERE ch.cha_capacitacion = true
  AND ch.cha_activo = true
  AND ch.cha_fecha_inicio >= '[FECHA_INICIO]'
  AND ch.cha_fecha_fin <= '[FECHA_FIN]'
GROUP BY ch.cha_id, ch.cha_nombre, ch.cha_fecha_inicio, ch.cha_fecha_fin
ORDER BY ch.cha_fecha_inicio DESC;`} />

          <SqlBlock title="Query: Detalle por empresa de una charla específica" sql={`SELECT
  e.emp_nombre,
  COUNT(cr.chr_id) AS asignados,
  COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END) AS completados,
  COUNT(CASE WHEN cr.chr_estado = 0 THEN 1 END) AS pendientes,
  ROUND(
    COUNT(CASE WHEN cr.chr_estado = 1 THEN 1 END)::NUMERIC /
    NULLIF(COUNT(cr.chr_id), 0) * 100, 2
  ) AS pct
FROM charla_respuesta cr
JOIN usuario u ON cr.usu_id = u.usu_id
LEFT JOIN localidad l ON u.loc_id = l.loc_id
LEFT JOIN region r ON l.reg_id = r.reg_id
LEFT JOIN empresa e ON r.emp_id = e.emp_id
WHERE cr.cha_id = [ID_CHARLA]
GROUP BY e.emp_nombre
ORDER BY pct ASC;  -- Mostrar primero las empresas con menos avance`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Distinción clave:</strong><br />
            • <code>cha_capacitacion = true</code> → aparece en este reporte (Charlas/Capacitaciones)<br />
            • <code>cha_rating = true</code> → aparece en el reporte de Ratings<br />
            • Una charla puede tener ambos flags en <code>false</code> y no aparecer en ningún reporte
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* 12. REPORTE ACTIVIDADES */}
      <Accordion expanded={expanded === "rep-actividades"} onChange={handleChange("rep-actividades")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Assessment sx={{ color: "#009688" }} />} title="12. Reporte Actividades de Seguridad" subtitle="actividad_seguridad, tarea, tarea_asignacion, tarea_formulario_respuesta" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            Mide el cumplimiento de actividades de seguridad: cuántas tareas se asignaron vs cuántas se completaron,
            agrupadas por actividad, empresa, localidad y periodo.
          </Alert>

          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace" }}>
{`Cadena de relaciones:

actividad_seguridad
  ├── ini_id → iniciativa (programa estratégico)
  ├── pta_id → programa_tarea (programa operativo)
  ├── frm_id → formulario (formato a llenar)
  │
  └── tarea (N tareas por actividad)
        └── tarea_asignacion (N asignaciones por tarea)
              ├── tarea_asignacion_detalle (tracking de ejecución)
              └── tarea_formulario_respuesta (respuestas del formulario)
                    └── tarea_evidencia (fotos/archivos)`}
          </Box>

          <SqlBlock title="Query: Cumplimiento por actividad de seguridad" sql={`SELECT
  acs.acs_id, acs.acs_nombre,
  ini.ini_nombre AS iniciativa,
  pta.pta_nombre AS programa,
  f.frm_nombre AS formulario,
  COUNT(DISTINCT t.tar_id) AS total_tareas,
  COUNT(ta.tas_id) AS total_asignaciones,
  COUNT(CASE WHEN ta.tas_estado = true THEN 1 END) AS completadas,
  ROUND(
    COUNT(CASE WHEN ta.tas_estado = true THEN 1 END)::NUMERIC /
    NULLIF(COUNT(ta.tas_id), 0) * 100, 2
  ) AS pct_cumplimiento
FROM actividad_seguridad acs
LEFT JOIN iniciativa ini ON acs.ini_id = ini.ini_id
LEFT JOIN programa_tarea pta ON acs.pta_id = pta.pta_id
LEFT JOIN formulario f ON acs.frm_id = f.frm_id
LEFT JOIN tarea t ON t.acs_id = acs.acs_id AND t.tar_activo = true
LEFT JOIN tarea_asignacion ta ON t.tar_id = ta.tar_id AND ta.tas_activo = true
WHERE acs.emp_id = [ID_EMPRESA]
  AND acs.acs_activo = true
  AND t.tar_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
GROUP BY acs.acs_id, acs.acs_nombre, ini.ini_nombre,
         pta.pta_nombre, f.frm_nombre
ORDER BY pct_cumplimiento ASC;`} />

          <SqlBlock title="Query: Detalle por localidad de una actividad" sql={`SELECT
  l.loc_nombre,
  COUNT(ta.tas_id) AS asignadas,
  COUNT(CASE WHEN ta.tas_estado = true THEN 1 END) AS completadas,
  COUNT(DISTINCT ta.usu_id) AS usuarios_involucrados
FROM tarea t
JOIN tarea_asignacion ta ON t.tar_id = ta.tar_id
LEFT JOIN localidad l ON ta.loc_id = l.loc_id
WHERE t.acs_id = [ID_ACTIVIDAD]
  AND t.tar_activo = true
  AND ta.tas_activo = true
  AND t.tar_fecha BETWEEN '[FECHA_INICIO]' AND '[FECHA_FIN]'
GROUP BY l.loc_nombre
ORDER BY completadas DESC;`} />
        </AccordionDetails>
      </Accordion>

      {/* 13. ESTRUCTURA Y RESPONSABLES */}
      <Accordion expanded={expanded === "estructura"} onChange={handleChange("estructura")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<AccountTree color="primary" />} title="13. Tabla Responsable y Estructura" subtitle="responsable, empresa, region, subregion, localidad, area, negocio" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            La tabla <code>responsable</code> es la <strong>tabla pivote central</strong> que vincula toda la estructura organizacional.
            Es crucial para los filtros de todos los reportes.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>Tabla: <code>responsable</code></Typography>
          <TableSchema columns={[
            { name: "res_id", type: "SERIAL PK", desc: "ID del registro" },
            { name: "emp_id", type: "FK → empresa", desc: "Empresa" },
            { name: "reg_id", type: "FK → region", desc: "Región" },
            { name: "sre_id", type: "FK → subregion", desc: "Subregión (opcional)" },
            { name: "loc_id", type: "FK → localidad", desc: "Localidad" },
            { name: "are_id", type: "FK → area", desc: "Área" },
            { name: "neg_id", type: "FK → negocio", desc: "Negocio" },
          ]} />

          <SqlBlock title="Query: Estructura completa con responsable" sql={`SELECT
  e.emp_id, e.emp_nombre,
  r.reg_id, r.reg_nombre,
  sr.sre_id, sr.sre_nombre,
  l.loc_id, l.loc_nombre, l.loc_activo,
  a.are_id, a.are_nombre,
  n.neg_id, n.neg_nombre
FROM responsable res
JOIN empresa e ON res.emp_id = e.emp_id
JOIN region r ON res.reg_id = r.reg_id
LEFT JOIN subregion sr ON res.sre_id = sr.sre_id
JOIN localidad l ON res.loc_id = l.loc_id
LEFT JOIN area a ON res.are_id = a.are_id
LEFT JOIN negocio n ON res.neg_id = n.neg_id
WHERE e.emp_id = [ID_EMPRESA]
ORDER BY r.reg_nombre, l.loc_nombre, a.are_nombre;`} />

          <Box component="pre" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, fontSize: 12, fontFamily: "monospace", mt: 2 }}>
{`DIAGRAMA ER SIMPLIFICADO DE RELACIONES PRINCIPALES:

empresa ──── region ──── subregion ──── localidad ──── area
    │                                       │
    └──────── responsable ──────────────────┘
                  │
                  └── negocio

usuario ──┬── usuario_cargo ── cargo_nivel (permisos)
          ├── localidad (principal)
          ├── usuario_localidad (adicionales)
          ├── area, negocio
          ├── cmenu (permisos de menú)
          └── usuario (usu_reporta = jefe directo)

charla ──── charla_respuesta ──┬── usuario (asignado)
                               └── usuario (jefe desnormalizado)

tarea ──── tarea_asignacion ──── usuario
  │
  └── actividad_seguridad ──── formulario
                                   │
                         tarea_formulario_respuesta

incidencia ──┬── usuario (reportante)
             ├── tipo_observacion
             ├── potencial
             ├── empresa, localidad, area
             └── datos jefe desnormalizados

inspeccion ──┬── usuario (inspector)
             ├── dinspeccion (detalle)
             └── empresa, localidad, area

reporte_rating ── datos precalculados (p5m, ope, lv, total)
semana_reporte ── periodos semanales para reportes`}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 14. SISTEMA DE SOPORTE (DB SEPARADA) */}
      <Accordion expanded={expanded === "soporte"} onChange={handleChange("soporte")}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <SectionTitle icon={<Code color="primary" />} title="14. Base de Datos del Sistema de Soporte" subtitle="soporte_articulos, soporte_errores, soporte_chat_historial (DB separada)" />
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El sistema de soporte tiene su <strong>propia base de datos PostgreSQL</strong> (api_soporte, puerto 4500),
            independiente de la DB principal de ARCA.
          </Alert>

          <Typography variant="subtitle2" gutterBottom>Tablas del sistema de soporte</Typography>
          <TableSchema columns={[
            { name: "soporte_articulos", type: "KB", desc: "Base de conocimiento con full-text search en español (GIN index)" },
            { name: "soporte_categorias", type: "REF", desc: "Categorías de artículos (app, panel, tecnico, general)" },
            { name: "soporte_errores", type: "MAP", desc: "Mapeo de errores con soluciones técnicas y de usuario" },
            { name: "soporte_diagnostico_pasos", type: "TREE", desc: "Árboles de decisión (paso_si_id, paso_no_id = self-join)" },
            { name: "soporte_chat_historial", type: "LOG", desc: "Historial de conversaciones con el agente IA" },
            { name: "soporte_busquedas_log", type: "LOG", desc: "Log de búsquedas realizadas" },
            { name: "soporte_usuarios", type: "AUTH", desc: "Usuarios del sistema de soporte (roles: admin, soporte_tecnico, soporte)" },
          ]} />

          <SqlBlock title="Query: Full-text search en artículos (español)" sql={`SELECT a.art_id, a.art_titulo, a.art_slug, a.art_resumen,
       a.art_tipo, a.art_audiencia,
       c.cat_nombre, c.cat_icono,
       ts_rank(
         to_tsvector('spanish',
           coalesce(a.art_titulo,'') || ' ' ||
           coalesce(a.art_resumen,'') || ' ' ||
           a.art_contenido
         ),
         plainto_tsquery('spanish', '[TERMINO_BUSQUEDA]')
       ) AS relevancia
FROM soporte_articulos a
LEFT JOIN soporte_categorias c ON a.art_categoria_id = c.cat_id
WHERE a.art_activo = TRUE
  AND to_tsvector('spanish',
        coalesce(a.art_titulo,'') || ' ' ||
        coalesce(a.art_resumen,'') || ' ' ||
        a.art_contenido
      ) @@ plainto_tsquery('spanish', '[TERMINO_BUSQUEDA]')
ORDER BY relevancia DESC
LIMIT 10;`} />

          <SqlBlock title="Query: Buscar error mapeado (cascada: exacto → LIKE → full-text)" sql={`-- 1. Búsqueda exacta
SELECT * FROM soporte_errores
WHERE err_activo = TRUE
  AND LOWER(err_mensaje) = LOWER('[MENSAJE_ERROR]');

-- 2. Si no hay resultado: LIKE
SELECT * FROM soporte_errores
WHERE err_activo = TRUE
  AND LOWER(err_mensaje) LIKE LOWER('%[MENSAJE_ERROR]%')
ORDER BY LENGTH(err_mensaje) ASC LIMIT 5;

-- 3. Si no hay resultado: full-text
SELECT *, ts_rank(
  to_tsvector('spanish', err_mensaje || ' ' || coalesce(err_causa, '')),
  plainto_tsquery('spanish', '[MENSAJE_ERROR]')
) AS relevancia
FROM soporte_errores
WHERE err_activo = TRUE
  AND to_tsvector('spanish', err_mensaje || ' ' || coalesce(err_causa, ''))
      @@ plainto_tsquery('spanish', '[MENSAJE_ERROR]')
ORDER BY relevancia DESC LIMIT 5;`} />

          <SqlBlock title="Query: Árbol de diagnóstico (self-join)" sql={`SELECT p.*,
  si.paso_pregunta AS si_pregunta,
  si.paso_es_solucion AS si_es_solucion,
  si.paso_solucion AS si_solucion,
  no.paso_pregunta AS no_pregunta,
  no.paso_es_solucion AS no_es_solucion,
  no.paso_solucion AS no_solucion
FROM soporte_diagnostico_pasos p
LEFT JOIN soporte_diagnostico_pasos si ON p.paso_si_id = si.paso_id
LEFT JOIN soporte_diagnostico_pasos no ON p.paso_no_id = no.paso_id
WHERE p.paso_id = [ID_PASO];`} />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RadiografiaTecnicaPanelPage;
