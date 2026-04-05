import { useState } from "react";
import {
  Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider,
  Alert, List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  ExpandMore, Dashboard, People, Assignment, Chat, Task, ReportProblem, FactCheck,
  BarChart, Settings, ArrowRight, Info, Warning, TipsAndUpdates, TableChart, Assessment,
  Security, LocalOffer, Store,
} from "@mui/icons-material";

const sections = [
  {
    id: "general",
    title: "Información General del Panel",
    icon: <Dashboard />,
    color: "#1976d2",
    content: (
      <>
        <Typography variant="body1" paragraph>
          El <strong>Panel Web ARCA</strong> es el dashboard administrativo donde los administradores y líderes gestionan todo el sistema: usuarios, formularios, tareas, reportes, etc.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Qué se hace en el Panel?</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Crear y gestionar usuarios" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Diseñar formularios para la app" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Asignar tareas a usuarios" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Programar charlas y capacitaciones" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Ver y gestionar incidencias reportadas" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Generar reportes de gestión" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Configurar la estructura organizacional" /></ListItem>
        </List>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>El Panel es el cerebro del sistema.</strong> Todo lo que los usuarios ven en la app se configura aquí. Si la app no muestra datos, el problema casi siempre está en la configuración del Panel.
        </Alert>

        <Typography variant="h6" gutterBottom>Navegación principal</Typography>
        <Typography variant="body1" paragraph>
          El Panel tiene un <strong>menú lateral izquierdo</strong> con todas las secciones. Lo que cada usuario ve depende de su tipo de usuario y los permisos configurados en <strong>Configuración → Menú</strong>.
        </Typography>
      </>
    ),
  },
  {
    id: "usuarios",
    title: "Gestión de Usuarios",
    icon: <People />,
    color: "#388e3c",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Usuarios → Seguridad / Salud / Comercial</strong>
          </Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Cada tipo de usuario tiene su propia sección. Al crear un usuario se debe indicar:
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Campo</strong></TableCell><TableCell><strong>Obligatorio</strong></TableCell><TableCell><strong>Consideración</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Nombre</TableCell><TableCell>Sí</TableCell><TableCell>Nombre completo del usuario</TableCell></TableRow>
              <TableRow><TableCell>Email</TableCell><TableCell>Sí</TableCell><TableCell>Debe ser ÚNICO. No pueden existir dos usuarios con el mismo email</TableCell></TableRow>
              <TableRow><TableCell>Contraseña</TableCell><TableCell>Sí</TableCell><TableCell>Se encripta automáticamente. Mayúsculas/minúsculas importan</TableCell></TableRow>
              <TableRow><TableCell>Tipo</TableCell><TableCell>Sí</TableCell><TableCell>Define qué módulos ve el usuario en la app</TableCell></TableRow>
              <TableRow><TableCell>Empresa</TableCell><TableCell>Sí</TableCell><TableCell>A qué empresa pertenece</TableCell></TableRow>
              <TableRow><TableCell>Localidad</TableCell><TableCell>Sí</TableCell><TableCell>Un usuario puede estar en varias localidades</TableCell></TableRow>
              <TableRow><TableCell>Activo</TableCell><TableCell>—</TableCell><TableCell>Si está inactivo, no puede iniciar sesión en la app</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error frecuente: "El email ya está registrado"</strong> — significa que ya existe un usuario con ese correo. Cada email debe ser único en todo el sistema.
        </Alert>

        <Alert severity="warning">
          <strong>Al desactivar un usuario:</strong> El usuario no podrá iniciar sesión en la app ni en el panel. Sus datos históricos (tareas completadas, inspecciones, etc.) se mantienen.
        </Alert>
      </>
    ),
  },
  {
    id: "formularios-panel",
    title: "Formularios (Creación y Gestión)",
    icon: <Assignment />,
    color: "#9c27b0",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Formularios</strong> (o Configuración → Formularios)
          </Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Aquí se crean las plantillas de formularios que luego se usan en la app. Un formulario tiene:
        </Typography>

        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Nombre: debe ser ÚNICO (el sistema convierte a mayúsculas y quita espacios)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tipo: Tipo 1 (con secciones/segmentos) o Tipo 2 (directo)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Estado: Activo o Inactivo" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Segmentos (si es Tipo 1): secciones que agrupan preguntas" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Preguntas: las preguntas que el usuario contesta en la app" /></ListItem>
        </List>

        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>No se puede desactivar un formulario si tiene actividades de seguridad activas.</strong> El sistema muestra <em>"tiene actividades activas asociadas"</em>. Primero desactivar las actividades vinculadas.
        </Alert>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Recuerda la cadena:</strong> Formulario → Actividad de Seguridad → Tarea → Usuario. Sin esta cadena completa, el formulario no aparece en la app.
        </Alert>

        <Typography variant="h6" gutterBottom>Consideraciones al editar un formulario</Typography>
        <List dense>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="Si cambias preguntas de un formulario que ya fue contestado, las respuestas antiguas podrían no coincidir con las nuevas preguntas" /></ListItem>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="Es mejor crear un formulario nuevo si los cambios son significativos" /></ListItem>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="El nombre no se puede duplicar (error: 'Ya existe un formulario con ese nombre')" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "tareas-panel",
    title: "Tareas (Asignación y Seguimiento)",
    icon: <Task />,
    color: "#ed6c02",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Tareas</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Desde aquí se crean tareas y se asignan a los usuarios. La vista muestra todas las tareas con filtros por estado, fecha, usuario, etc.
        </Typography>

        <Typography variant="h6" gutterBottom>Campos al crear una tarea</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Campo</strong></TableCell><TableCell><strong>Obligatorio</strong></TableCell><TableCell><strong>Detalle</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Descripción</TableCell><TableCell>Sí</TableCell><TableCell>Qué debe hacer el usuario</TableCell></TableRow>
              <TableRow><TableCell>Fecha</TableCell><TableCell>Sí</TableCell><TableCell>Formato DD/MM/YYYY. Si la fecha no es válida, da error</TableCell></TableRow>
              <TableRow><TableCell>Actividad vinculada</TableCell><TableCell>No</TableCell><TableCell>Si se vincula, el usuario debe llenar un formulario al completar</TableCell></TableRow>
              <TableRow><TableCell>Tipo</TableCell><TableCell>Sí</TableCell><TableCell>Normal (0) o Recurrente/Cron (3)</TableCell></TableRow>
              <TableRow><TableCell>Usuarios asignados</TableCell><TableCell>Sí</TableCell><TableCell>A quién se le asigna la tarea</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning">
          <strong>Errores frecuentes:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"La descripción de la tarea es obligatoria" — no se dejó vacío el campo' /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"La fecha no tiene formato válido" — debe ser DD/MM/YYYY exacto' /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "charlas-panel",
    title: "Charlas (Creación y Gestión)",
    icon: <Chat />,
    color: "#0288d1",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Charlas</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Se crean las capacitaciones con contenido y opcionalmente preguntas de evaluación.
        </Typography>

        <Typography variant="h6" gutterBottom>Al crear una charla</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Nombre ÚNICO (si ya existe una charla con ese nombre, dará error)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Fecha inicio y fin (la charla solo se ve en la app dentro de estas fechas)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Empresa (obligatoria — debe seleccionarse)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Usuarios asignados (quiénes deben completarla)" /></ListItem>
        </List>

        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Errores frecuentes:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"Ya existe una charla con ese nombre" — cambiar el nombre por uno diferente' /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"Debe seleccionar la empresa" — campo empresa vacío' /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "incidencias-panel",
    title: "Incidencias (Visualización y Gestión)",
    icon: <ReportProblem />,
    color: "#d32f2f",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Incidencias</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Las incidencias se <strong>crean desde la app</strong> y se <strong>gestionan desde el Panel</strong>. Aquí puedes:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Ver todas las incidencias reportadas" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Filtrar por empresa, localidad, usuario, estado, fecha" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Cambiar el estado de una incidencia (abierta → en proceso → cerrada)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Ver las fotos adjuntas como evidencia" /></ListItem>
        </List>

        <Alert severity="info">
          <strong>La numeración de incidencias</strong> es por usuario. Cada usuario tiene su propio correlativo (1, 2, 3...). Si hay gaps en la numeración, el sistema tiene una función que los corrige automáticamente.
        </Alert>
      </>
    ),
  },
  {
    id: "inspecciones-panel",
    title: "Inspecciones (Resultados)",
    icon: <FactCheck />,
    color: "#2e7d32",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Inspecciones</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Aquí se ven los resultados de las inspecciones que los usuarios completaron en la app. Cada inspección muestra:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Quién la hizo y cuándo" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Qué formulario se usó" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Calificación obtenida (puntaje)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Detalle de cada respuesta" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "reportes",
    title: "Reportes (Detalles Completos)",
    icon: <BarChart />,
    color: "#e65100",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde están?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Reportes → [Tipo de Reporte]</strong></Typography>
        </Paper>

        <Alert severity="success" icon={<TipsAndUpdates />} sx={{ mb: 3 }}>
          <strong>Todos los reportes requieren seleccionar al menos: Año y Mes.</strong> Muchos también requieren Empresa y/o Localidad. Si no se seleccionan estos filtros, el reporte no generará datos.
        </Alert>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte LV (Lecciones de Vida)</Typography>
        <Typography variant="body1" paragraph>
          Muestra las lecciones de vida registradas en el período seleccionado.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <Typography variant="body2">Los datos vienen de las <strong>actividades de seguridad</strong> tipo "Lección de Vida" que los usuarios completaron en la app. Para que aparezcan datos:</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Debe existir una actividad de seguridad de tipo LV" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Debe tener tareas asignadas a usuarios" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Los usuarios deben haber completado las tareas en la app" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Las fechas de las tareas deben estar dentro del año/mes seleccionado" /></ListItem>
          </List>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte OPE (Operacional)</Typography>
        <Typography variant="body1" paragraph>
          Muestra indicadores operacionales del período.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <Typography variant="body2">Los datos vienen de las <strong>inspecciones y actividades operacionales</strong> completadas. Para que aparezcan datos:</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Debe haber inspecciones realizadas en el período" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Las inspecciones deben estar asociadas a la empresa/localidad seleccionada" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• El reporte agrupa por localidad y muestra promedios de calificación" /></ListItem>
          </List>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte P5M (Seguridad / Comercial)</Typography>
        <Typography variant="body1" paragraph>
          Reporte de los 5 minutos de seguridad o comercial. Hay dos variantes: Seguridad y Comercial.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <Typography variant="body2">Los datos vienen de las <strong>charlas/capacitaciones</strong> tipo P5M completadas en el período:</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Las charlas deben estar marcadas como tipo P5M" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Los usuarios asignados deben haber completado la charla" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se muestra: % de cumplimiento, cuántos completaron vs cuántos faltaron" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Seguridad y Comercial se separan por el tipo de usuario asignado" /></ListItem>
          </List>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte Ratings (Seguridad / Comercial)</Typography>
        <Typography variant="body1" paragraph>
          Calificaciones de desempeño de los usuarios en seguridad o comercial.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <Typography variant="body2">Los datos vienen de las <strong>inspecciones con calificación</strong> realizadas en el período:</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se toman las inspecciones realizadas con formularios que tienen preguntas con puntuación" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se calcula el promedio de calificación por usuario" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se agrupa por localidad/área" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Seguridad y Comercial se separan por tipo de formulario/actividad" /></ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 1 }}>
            <strong>Si el rating aparece en 0 o vacío:</strong> Verificar que las inspecciones del período tengan formularios con preguntas tipo puntuación (tipos 3 u 11).
          </Alert>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte de Charlas</Typography>
        <Typography variant="body1" paragraph>
          Muestra el estado de cumplimiento de las charlas/capacitaciones.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• De todas las charlas creadas que estén dentro del período seleccionado" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se muestra: nombre de la charla, cuántos usuarios asignados, cuántos completaron" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• % de cumplimiento = completados / asignados × 100" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Si una charla no tiene usuarios asignados, aparece con 0 completados" /></ListItem>
          </List>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ color: "#e65100" }}>Reporte de Actividades</Typography>
        <Typography variant="body1" paragraph>
          Resumen de todas las actividades de seguridad y sus tareas.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
          <Typography variant="subtitle2" gutterBottom>¿De dónde salen los datos?</Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• De las actividades de seguridad activas y sus tareas asociadas" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se muestra: nombre de actividad, formulario vinculado, total de tareas, tareas completadas" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Se filtra por empresa/localidad y período" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="• Si una actividad no tiene tareas, aparece con 0 completadas" /></ListItem>
          </List>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Errores comunes en reportes:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"Debe seleccionar el año y mes" — filtros de fecha vacíos' /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary='"No se encontraron datos" — no hay actividad en el período/empresa seleccionada' /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="Reporte vacío — verificar que las actividades estén en la empresa/localidad correcta" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="Datos incompletos — los usuarios pueden no haber completado todas las tareas del período" /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "estructura-panel",
    title: "Configuración: Estructura Organizacional",
    icon: <Settings />,
    color: "#455a64",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Configuración → Regiones / Localidades / Áreas / Cargos</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Aquí se configura la jerarquía organizacional. Todo usuario debe pertenecer a esta estructura:
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#e3f2fd" }}>
          <Typography variant="body1" sx={{ textAlign: "center", fontWeight: 600 }}>
            EMPRESA → REGIÓN → LOCALIDAD → ÁREA
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Reglas importantes</Typography>
        <List dense>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="Los nombres son ÚNICOS por nivel: no puede haber dos regiones con el mismo nombre en la misma empresa" /></ListItem>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="Eliminar un nivel afecta a todo lo que está debajo (eliminar una región elimina sus localidades y áreas)" /></ListItem>
          <ListItem><ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon><ListItemText primary="Los usuarios asignados a una localidad eliminada quedarían sin localidad" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "menus",
    title: "Configuración: Menús y Permisos",
    icon: <Security />,
    color: "#5d4037",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde está?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Configuración → Menú</strong></Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Controla qué módulos ve cada tipo de usuario en el Panel. Si un usuario dice <em>"no veo tal sección"</em>, lo primero es verificar aquí.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Cada tipo de usuario tiene su configuración de menú independiente.</strong> Por ejemplo, un usuario tipo "Seguridad" puede ver módulos diferentes a uno tipo "Comercial".
        </Alert>

        <Typography variant="body1" paragraph>
          Para habilitar un módulo para un tipo de usuario:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="1. Ir a Configuración → Menú" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="2. Seleccionar el tipo de usuario" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="3. Activar/desactivar los módulos que debe ver" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="4. Guardar cambios" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "rankings-panel",
    title: "Rankings y Recompensas",
    icon: <LocalOffer />,
    color: "#ff6f00",
    content: (
      <>
        <Typography variant="h6" gutterBottom>¿Dónde están?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2"><strong>Panel → Rankings</strong> y <strong>Panel → Recompensas</strong></Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Rankings</Typography>
        <Typography variant="body1" paragraph>
          Vista del ranking general de usuarios por puntos. Se puede filtrar por período (mensual/anual), empresa y localidad.
        </Typography>

        <Typography variant="h6" gutterBottom>Recompensas</Typography>
        <Typography variant="body1" paragraph>
          Catálogo de premios canjeables. Desde aquí el administrador puede:
        </Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Crear nuevas recompensas (nombre, puntos necesarios, stock)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Ver historial de canjes" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Ajustar stock disponible" /></ListItem>
        </List>

        <Alert severity="info">
          <strong>El kardex</strong> (historial de puntos) de cada usuario muestra todos los movimientos: puntos ganados por actividades y puntos gastados en recompensas.
        </Alert>
      </>
    ),
  },
];

const RadiografiaPanelPage = () => {
  const [expanded, setExpanded] = useState("general");

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Dashboard sx={{ fontSize: 32, color: "secondary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            Radiografía del Panel
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Guía completa de cómo funciona el Panel Web ARCA. Entiende cada sección, cómo se gestionan los datos y especialmente cómo se generan los reportes.
        </Typography>

        <Alert severity="success" icon={<TipsAndUpdates />} sx={{ mb: 3 }}>
          <strong>El Panel es donde se configura TODO.</strong> Lo que los usuarios ven en la app, los datos de los reportes, la estructura organizacional — todo se gestiona desde aquí.
        </Alert>
      </Box>

      {sections.map((section) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? section.id : false)}
          sx={{
            mb: 1,
            "&:before": { display: "none" },
            border: "1px solid",
            borderColor: expanded === section.id ? section.color : "divider",
            borderRadius: "12px !important",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${section.color}15`,
                color: section.color,
              }}
            >
              {section.icon}
            </Box>
            <Typography variant="h6" fontSize={17} fontWeight={600}>
              {section.title}
            </Typography>
            {section.id === "reportes" && (
              <Chip label="Importante" size="small" color="warning" sx={{ ml: 1 }} />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            {section.content}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default RadiografiaPanelPage;
