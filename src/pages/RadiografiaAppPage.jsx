import { useState } from "react";
import {
  Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider,
  Alert, List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  ExpandMore, PhoneAndroid, Login, Assignment, Chat, Task, ReportProblem, FactCheck,
  Notifications, EmojiEvents, CardGiftcard, FlagCircle, Info, Warning, CheckCircle,
  ArrowRight, TipsAndUpdates,
} from "@mui/icons-material";

const MAPA_ESCENARIOS = [
  {
    escenario: "No puede iniciar sesión",
    causa: "Usuario inactivo, credenciales erradas o app desactualizada",
    validar: "Panel -> Usuarios: activo, email correcto, tipo usuario, reset contraseña",
    accion: "Reactivar/corregir credenciales y pedir reingreso",
    escalar: "Si persiste con credenciales válidas en varios usuarios",
  },
  {
    escenario: "No aparece un módulo en APP",
    causa: "Permisos por tipo de usuario / menú / asignación incorrecta",
    validar: "Panel -> Configuración -> Menú + Panel -> Usuarios (tipo y asignaciones)",
    accion: "Ajustar permisos y cerrar/abrir sesión",
    escalar: "Si permisos están correctos y sigue oculto",
  },
  {
    escenario: "No aparecen tareas",
    causa: "Sin asignación, fecha fuera de rango o formulario inactivo",
    validar: "Panel -> Tareas (asignados, fecha, activo) + formulario/actividad activa",
    accion: "Corregir asignación/rango/estado",
    escalar: "Si tarea correcta no sincroniza",
  },
  {
    escenario: "No aparece una charla",
    causa: "Rango de fechas vencido o usuario no asignado",
    validar: "Panel -> Charlas (inicio/fin, asignados, empresa)",
    accion: "Actualizar fechas/asignación",
    escalar: "Si está vigente y asignada pero no visible",
  },
  {
    escenario: "No puede enviar incidencia",
    causa: "Sin internet, permisos cámara o datos organizacionales faltantes",
    validar: "Permisos app + conexión + usuario con empresa/localidad asignada",
    accion: "Habilitar permisos y completar asignación",
    escalar: "Si envío falla con red estable",
  },
  {
    escenario: "No llegan notificaciones push",
    causa: "Permisos deshabilitados o token Firebase no actualizado",
    validar: "Permisos sistema + abrir app + token vigente",
    accion: "Reactivar notificaciones y refrescar sesión",
    escalar: "Si varios usuarios fallan simultáneamente",
  },
  {
    escenario: "Ranking/puntos no cuadran",
    causa: "Actividad no acreditada o período de ranking distinto",
    validar: "Panel -> Rankings + Kardex + fecha/período",
    accion: "Validar eventos generadores de puntos",
    escalar: "Si kardex no registra eventos ejecutados",
  },
  {
    escenario: "No puede canjear recompensa",
    causa: "Puntos insuficientes, stock agotado o regla de canje",
    validar: "Panel -> Recompensas (stock, puntos, restricciones)",
    accion: "Ajustar catálogo o informar regla",
    escalar: "Si cumple todo y el canje falla",
  },
  {
    escenario: "Meta no avanza",
    causa: "Meta sin actividades vinculadas o fuera de vigencia",
    validar: "Panel -> Metas (actividades, fechas, estado)",
    accion: "Vincular actividades y corregir período",
    escalar: "Si hay actividad registrada sin impacto en meta",
  },
  {
    escenario: "APP lenta o se congela",
    causa: "Conectividad, dispositivo sin recursos o versión vieja",
    validar: "Red, almacenamiento, versión app, cierre de apps en segundo plano",
    accion: "Actualizar app y optimizar dispositivo",
    escalar: "Si ocurre en múltiples equipos/versiones",
  },
];

const FLUJO_RESOLUCION = [
  "Confirmar síntoma exacto y módulo afectado (qué no ve/no puede hacer).",
  "Validar primero configuración en Panel (regla de oro).",
  "Validar contexto del usuario: tipo, empresa, localidad, área, fechas vigentes.",
  "Validar condiciones del APP: internet, permisos, versión, sesión.",
  "Aplicar corrección mínima y pedir prueba inmediata.",
  "Si persiste, escalar con evidencia: usuario, módulo, hora, error exacto, pasos reproducibles.",
];

const EscenarioTable = ({ rows }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Escenario</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Causa probable</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Qué validar primero</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Acción recomendada</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Cuándo escalar</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.escenario} hover>
            <TableCell>{r.escenario}</TableCell>
            <TableCell>{r.causa}</TableCell>
            <TableCell>{r.validar}</TableCell>
            <TableCell>{r.accion}</TableCell>
            <TableCell>{r.escalar}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const sections = [
  {
    id: "general",
    title: "Información General del APP",
    icon: <PhoneAndroid />,
    color: "#1976d2",
    content: (
      <>
        <Typography variant="body1" paragraph>
          La <strong>app ARCA</strong> es la aplicación móvil que usan los colaboradores en campo para realizar sus actividades diarias de seguridad, salud y comercial. Está disponible para Android e iOS.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Importante:</strong> La app NO funciona de forma independiente. Depende de que los datos estén correctamente configurados en el <strong>Panel Web</strong>. Si algo no aparece en la app, generalmente hay que verificar primero en el Panel.
        </Alert>

        <Typography variant="h6" gutterBottom>¿Cómo se alimenta la app?</Typography>
        <Typography variant="body1" paragraph>
          Todo lo que el usuario ve en la app viene del Panel Web. El flujo es:
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace", textAlign: "center" }}>
            Administrador configura en el PANEL → Los datos llegan al servidor → La APP descarga y muestra los datos
          </Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          Esto significa que si un usuario de la app dice <em>"no me aparece tal cosa"</em>, el primer paso SIEMPRE es verificar que eso esté configurado correctamente en el Panel.
        </Typography>

        <Typography variant="h6" gutterBottom>Requisitos de la app</Typography>
        <List dense>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Conexión a internet (WiFi o datos móviles)" /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Versión actualizada desde Play Store o App Store" /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Permisos de cámara (para fotos en inspecciones e incidencias)" /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Permisos de notificaciones (para recibir alertas)" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "mapa_escenarios",
    title: "Mapa Funcional por Escenarios (Guía Operativa)",
    icon: <TipsAndUpdates />,
    color: "#00695c",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Esta matriz resume los casos más frecuentes de soporte. Úsala como referencia rápida para resolver incidencias sin perder tiempo.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Objetivo:</strong> identificar el problema, validar en el punto correcto y aplicar una acción concreta en el menor número de pasos.
        </Alert>

        <EscenarioTable rows={MAPA_ESCENARIOS} />

        <Typography variant="h6" gutterBottom>Flujo operativo recomendado (siempre en este orden)</Typography>
        <List dense sx={{ mb: 1 }}>
          {FLUJO_RESOLUCION.map((paso, idx) => (
            <ListItem key={paso}>
              <ListItemIcon><Chip size="small" label={idx + 1} color="primary" /></ListItemIcon>
              <ListItemText primary={paso} />
            </ListItem>
          ))}
        </List>

        <Alert severity="warning">
          <strong>No abrir diagnóstico técnico de entrada</strong> si primero no se validó configuración funcional en Panel y contexto del usuario.
        </Alert>
      </>
    ),
  },
  {
    id: "login",
    title: "Inicio de Sesión y Acceso",
    icon: <Login />,
    color: "#388e3c",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Para usar la app, el usuario necesita un <strong>correo electrónico</strong> y <strong>contraseña</strong> que le asigna su administrador o líder.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Cómo se crea un usuario?</Typography>
        <Typography variant="body1" paragraph>
          Los usuarios se crean <strong>únicamente desde el Panel Web</strong>. Un administrador va a:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Usuarios → Seguridad/Salud/Comercial → Botón "Nuevo Usuario"</strong>
          </Typography>
        </Paper>
        <Typography variant="body1" paragraph>
          Al crear el usuario, se le asigna: nombre, correo, contraseña, tipo de usuario, empresa, localidad y área.
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si un usuario no puede iniciar sesión, verificar:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Que el usuario EXISTA en el Panel (en la sección de Usuarios)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Que el usuario esté ACTIVO (no desactivado)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Que la contraseña sea correcta (mayúsculas/minúsculas importan)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="4. Que la app esté actualizada a la última versión" /></ListItem>
          </List>
        </Alert>

        <Typography variant="h6" gutterBottom>Tipos de Usuario</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Tipo</strong></TableCell><TableCell><strong>Qué ve en la app</strong></TableCell><TableCell><strong>Uso principal</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Seguridad</TableCell><TableCell>Formularios de seguridad, inspecciones, incidencias</TableCell><TableCell>Personal de campo en seguridad</TableCell></TableRow>
              <TableRow><TableCell>Salud</TableCell><TableCell>Formularios de salud, inspecciones</TableCell><TableCell>Personal de salud ocupacional</TableCell></TableRow>
              <TableRow><TableCell>Comercial</TableCell><TableCell>Formularios comerciales, tareas</TableCell><TableCell>Equipo comercial</TableCell></TableRow>
              <TableRow><TableCell>Líderes</TableCell><TableCell>Todo + rankings + supervisión</TableCell><TableCell>Supervisores y jefes de área</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info">
          <strong>Lo que ve cada usuario depende de su tipo.</strong> Si un usuario dice "no veo tal módulo", primero verificar qué tipo de usuario tiene asignado en el Panel.
        </Alert>
      </>
    ),
  },
  {
    id: "tareas",
    title: "Tareas",
    icon: <Task />,
    color: "#ed6c02",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>tareas</strong> son actividades que se asignan a los usuarios para que las completen desde la app. Pueden ser únicas o recurrentes.
        </Typography>

        <Typography variant="h6" gutterBottom>¿De dónde salen las tareas?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Tareas → Botón "Nueva Tarea"</strong>
          </Typography>
        </Paper>
        <Typography variant="body1" paragraph>
          Un administrador o líder crea la tarea en el Panel, la asigna a uno o varios usuarios, y estos la ven en su app.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Qué necesita una tarea para aparecer en la app?</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tener una descripción (es obligatoria)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tener una fecha asignada (formato DD/MM/YYYY)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Estar asignada al usuario (en la tabla de asignaciones)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Si tiene formulario vinculado: el formulario debe estar activo" /></ListItem>
        </List>

        <Typography variant="h6" gutterBottom>Tipos de Tarea</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Tipo</strong></TableCell><TableCell><strong>Comportamiento</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Normal (tipo 0)</TableCell><TableCell>Se crea una vez, se completa una vez</TableCell></TableRow>
              <TableRow><TableCell>Recurrente/Cron (tipo 3)</TableCell><TableCell>Se repite automáticamente según la programación configurada</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si una tarea no aparece en la app del usuario:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar en Panel → Tareas que la tarea exista" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que el usuario esté en la lista de asignados" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que la fecha de la tarea no haya pasado" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="4. Si tiene formulario vinculado, verificar que el formulario esté activo" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="5. Pedir al usuario que actualice/refresque la app" /></ListItem>
          </List>
        </Alert>

        <Typography variant="h6" gutterBottom>Relación con Formularios</Typography>
        <Typography variant="body1" paragraph>
          Una tarea puede tener un <strong>formulario vinculado</strong>. Esto significa que cuando el usuario completa la tarea en la app, debe llenar el formulario correspondiente. La cadena es:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Formulario → Actividad de Seguridad → Tarea → Usuario la completa en la APP
          </Typography>
        </Paper>
      </>
    ),
  },
  {
    id: "formularios",
    title: "Formularios",
    icon: <Assignment />,
    color: "#9c27b0",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Los <strong>formularios</strong> son plantillas de preguntas que los usuarios llenan desde la app. Se usan para inspecciones, actividades de seguridad, evaluaciones, etc.
        </Typography>

        <Typography variant="h6" gutterBottom>¿De dónde salen los formularios?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Formularios → Botón "Nuevo Formulario"</strong>
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Tipos de Formulario</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Tipo</strong></TableCell><TableCell><strong>Estructura</strong></TableCell><TableCell><strong>Ejemplo</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Tipo 1</TableCell><TableCell>Con segmentos (secciones agrupadas)</TableCell><TableCell>Inspección con varias áreas a evaluar</TableCell></TableRow>
              <TableRow><TableCell>Tipo 2</TableCell><TableCell>Directo, sin segmentos</TableCell><TableCell>Encuesta simple de satisfacción</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>Tipos de Pregunta</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Código</strong></TableCell><TableCell><strong>Tipo</strong></TableCell><TableCell><strong>Qué ve el usuario en la app</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>1</TableCell><TableCell>Texto</TableCell><TableCell>Campo para escribir una respuesta libre</TableCell></TableRow>
              <TableRow><TableCell>2</TableCell><TableCell>Opción simple</TableCell><TableCell>Seleccionar una opción (Sí/No, etc.)</TableCell></TableRow>
              <TableRow><TableCell>3</TableCell><TableCell>Opción con puntuación</TableCell><TableCell>Seleccionar opción que tiene un puntaje asignado</TableCell></TableRow>
              <TableRow><TableCell>9</TableCell><TableCell>Especial</TableCell><TableCell>Pregunta con lógica especial</TableCell></TableRow>
              <TableRow><TableCell>10</TableCell><TableCell>Con imagen</TableCell><TableCell>Debe tomar o adjuntar una foto</TableCell></TableRow>
              <TableRow><TableCell>11</TableCell><TableCell>Puntuación avanzada</TableCell><TableCell>Sistema de calificación más detallado</TableCell></TableRow>
              <TableRow><TableCell>12</TableCell><TableCell>Ratio</TableCell><TableCell>Pregunta de proporción o ratio</TableCell></TableRow>
              <TableRow><TableCell>13</TableCell><TableCell>Ratio especial</TableCell><TableCell>Variante especial de ratio</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si un formulario no aparece en la app:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar que el formulario esté ACTIVO en el Panel" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que esté vinculado a una Actividad de Seguridad activa" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que haya una Tarea asignada al usuario con esa actividad" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="4. Sin esa cadena completa (Formulario → Actividad → Tarea → Usuario), NO aparece en la app" /></ListItem>
          </List>
        </Alert>

        <Alert severity="info">
          <strong>Regla clave:</strong> Un formulario por sí solo NO aparece en la app. Debe estar conectado a una Actividad de Seguridad, y esa actividad debe estar en una Tarea asignada al usuario.
        </Alert>
      </>
    ),
  },
  {
    id: "charlas",
    title: "Charlas / Capacitaciones",
    icon: <Chat />,
    color: "#0288d1",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>charlas</strong> son capacitaciones que se programan para los usuarios. Pueden incluir preguntas de evaluación para verificar que el usuario entendió el contenido.
        </Typography>

        <Typography variant="h6" gutterBottom>¿De dónde salen las charlas?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Charlas → Botón "Nueva Charla"</strong>
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>¿Qué necesita una charla para aparecer en la app?</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tener un nombre (obligatorio y único — no puede haber dos charlas con el mismo nombre)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tener fecha de inicio y fecha de fin configuradas" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Estar dentro del rango de fechas (entre inicio y fin)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tener usuarios asignados" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Estar vinculada a la empresa correcta" /></ListItem>
        </List>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si una charla no aparece en la app del usuario:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar en Panel → Charlas que la charla exista" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que la fecha actual esté DENTRO del rango de la charla (entre inicio y fin)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que el usuario esté en la lista de asignados" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="4. Verificar que la charla pertenezca a la misma empresa del usuario" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="5. Si ya pasó la fecha fin, la charla ya NO se muestra en la app" /></ListItem>
          </List>
        </Alert>

        <Typography variant="h6" gutterBottom>Componentes de una charla</Typography>
        <List dense>
          <ListItem><ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon><ListItemText primary="Contenido: el material de la capacitación (texto, instrucciones)" /></ListItem>
          <ListItem><ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon><ListItemText primary="Preguntas (opcional): evaluación para verificar comprensión" /></ListItem>
          <ListItem><ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon><ListItemText primary="Respuestas: las respuestas del usuario a las preguntas" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: "incidencias",
    title: "Incidencias",
    icon: <ReportProblem />,
    color: "#d32f2f",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>incidencias</strong> son reportes de situaciones o problemas que los usuarios encuentran en campo. Pueden incluir fotos como evidencia.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Cómo se crea una incidencia?</Typography>
        <Typography variant="body1" paragraph>
          Las incidencias se crean <strong>desde la app</strong> por los usuarios en campo. Luego se pueden ver y gestionar desde el Panel.
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Usuario en APP crea incidencia → Se sube al servidor → Se ve en Panel → Incidencias
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Campos de una incidencia</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Número: se genera automáticamente para cada usuario (correlativo)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Observación: descripción del problema (obligatoria)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Estado: abierta, en proceso, cerrada" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Empresa y Localidad: donde ocurrió (obligatorias)" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Imágenes: fotos adjuntas como evidencia (opcional)" /></ListItem>
        </List>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Dónde ver las incidencias en el Panel:</strong> Panel → Incidencias. Ahí puedes filtrar por usuario, empresa, localidad, estado, etc.
        </Alert>

        <Alert severity="warning">
          <strong>Si un usuario dice que no puede crear incidencias:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar que tenga permisos de cámara (si adjunta fotos)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que tenga conexión a internet" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que tenga empresa y localidad asignadas en su perfil" /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "inspecciones",
    title: "Inspecciones",
    icon: <FactCheck />,
    color: "#2e7d32",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>inspecciones</strong> son evaluaciones formales que realizan los usuarios usando un formulario específico. Generan una calificación numérica.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Cómo funciona una inspección?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Se crea un Formulario de inspección en el Panel → Se vincula a una Actividad → Se asigna una Tarea al usuario → El usuario llena el formulario en la APP → Se genera la calificación
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Datos que genera una inspección</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Calificación: puntaje numérico basado en las respuestas del formulario" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Tipo: según el tipo de formulario usado" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Fecha: cuándo se realizó" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Respuestas: detalle de cada pregunta contestada" /></ListItem>
        </List>

        <Alert severity="warning">
          <strong>Si una inspección no tiene calificación o datos:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar que el formulario tenga preguntas con puntuación (tipos 3, 11)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que el usuario haya completado TODAS las preguntas" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que el formulario de inspección exista y esté activo" /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "actividades",
    title: "Actividades de Seguridad",
    icon: <Assignment />,
    color: "#f57c00",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>actividades de seguridad</strong> son el puente entre los formularios y las tareas. Conectan un formulario con las tareas que se asignan a los usuarios.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Cómo funciona la cadena?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#fff3e0", border: "2px solid #ff9800" }}>
          <Typography variant="body1" sx={{ textAlign: "center", fontWeight: 600 }}>
            FORMULARIO → ACTIVIDAD DE SEGURIDAD → TAREA → USUARIO
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Esta cadena es FUNDAMENTAL. Si falta algún eslabón, el usuario NO verá la actividad en su app.
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>¿Dónde se configuran?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Actividades</strong> (o Configuración → Actividades)
          </Typography>
        </Paper>

        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>No se puede desactivar una actividad que tiene tareas activas.</strong> Primero hay que completar o eliminar las tareas vinculadas, luego se puede desactivar la actividad. El sistema mostrará: <em>"La actividad tiene tareas activas"</em>.
        </Alert>

        <Alert severity="info">
          <strong>Verificación rápida:</strong> Si un usuario dice que no le aparece una actividad en la app, verificar los 4 eslabones de la cadena: formulario activo, actividad activa, tarea creada, tarea asignada al usuario.
        </Alert>
      </>
    ),
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    icon: <Notifications />,
    color: "#7b1fa2",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>notificaciones</strong> son alertas que se envían a los usuarios de la app. Pueden ser push (en el celular) o por correo electrónico.
        </Typography>

        <Typography variant="h6" gutterBottom>Tipos de notificación</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell><strong>Tipo</strong></TableCell><TableCell><strong>Cómo llega</strong></TableCell><TableCell><strong>Requisito</strong></TableCell></TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Push</TableCell><TableCell>Notificación en el celular (como WhatsApp)</TableCell><TableCell>Token Firebase activo + permisos habilitados</TableCell></TableRow>
              <TableRow><TableCell>Email</TableCell><TableCell>Correo electrónico</TableCell><TableCell>Email válido registrado en el sistema</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si un usuario no recibe notificaciones push:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary="1. Verificar que la app tenga permisos de notificaciones en el celular" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. Verificar que el celular NO esté en modo 'No molestar'" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. Verificar que el usuario haya abierto la app al menos una vez (para registrar el token)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="4. Pedir al usuario que cierre y abra la app para actualizar el token" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="5. Si nada funciona, puede ser un problema del servicio Firebase — escalar a soporte técnico" /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "rankings",
    title: "Rankings y Puntos",
    icon: <EmojiEvents />,
    color: "#ffa000",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Los <strong>rankings</strong> muestran la clasificación de usuarios según los puntos que acumulan al completar actividades en la app.
        </Typography>

        <Typography variant="h6" gutterBottom>¿Cómo se ganan puntos?</Typography>
        <Typography variant="body1" paragraph>
          Los usuarios ganan puntos al completar tareas, llenar formularios, realizar inspecciones y completar charlas. El sistema calcula automáticamente los puntos según la actividad.
        </Typography>

        <Typography variant="h6" gutterBottom>Períodos de ranking</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Mensual: se reinicia cada mes" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Anual: acumulado del año" /></ListItem>
        </List>

        <Typography variant="h6" gutterBottom>¿Dónde se ve el ranking?</Typography>
        <List dense>
          <ListItem><ListItemIcon><PhoneAndroid color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="En la APP: el usuario ve su posición y la de otros" /></ListItem>
          <ListItem><ListItemIcon><Info color="info" fontSize="small" /></ListItemIcon><ListItemText primary="En el PANEL: Panel → Rankings (vista completa para administradores)" /></ListItem>
        </List>

        <Alert severity="info">
          <strong>Kardex:</strong> Cada usuario tiene un historial (kardex) de todos sus movimientos de puntos. Se puede consultar para entender por qué un usuario tiene cierto puntaje.
        </Alert>
      </>
    ),
  },
  {
    id: "recompensas",
    title: "Recompensas",
    icon: <CardGiftcard />,
    color: "#c62828",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>recompensas</strong> son premios que los usuarios pueden canjear usando sus puntos acumulados.
        </Typography>

        <Typography variant="h6" gutterBottom>¿De dónde salen las recompensas?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Recompensas → Botón "Nueva Recompensa"</strong>
          </Typography>
        </Paper>
        <Typography variant="body1" paragraph>
          El administrador crea el catálogo de recompensas: nombre, descripción, puntos necesarios y stock disponible.
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si un usuario no puede canjear una recompensa:</strong>
          <List dense sx={{ mt: 0.5 }}>
            <ListItem sx={{ py: 0 }}><ListItemText primary='1. "Puntos insuficientes" — el usuario no tiene suficientes puntos' /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="2. La recompensa puede estar sin stock (agotada)" /></ListItem>
            <ListItem sx={{ py: 0 }}><ListItemText primary="3. El usuario puede haber canjeado ya esa recompensa (si tiene restricción)" /></ListItem>
          </List>
        </Alert>
      </>
    ),
  },
  {
    id: "metas",
    title: "Metas",
    icon: <FlagCircle />,
    color: "#1565c0",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Las <strong>metas</strong> son objetivos que se establecen para medir el desempeño de los usuarios o equipos.
        </Typography>

        <Typography variant="h6" gutterBottom>¿De dónde salen las metas?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Metas → Botón "Nueva Meta"</strong>
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Componentes de una meta</Typography>
        <List dense>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Nombre: descripción de la meta" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Valor objetivo: número a alcanzar" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Fecha inicio y fin: período de la meta" /></ListItem>
          <ListItem><ListItemIcon><ArrowRight color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Actividades vinculadas: qué actividades cuentan para la meta" /></ListItem>
        </List>

        <Alert severity="info">
          <strong>Una meta no se puede eliminar si tiene actividades vinculadas.</strong> Primero hay que desvincular las actividades.
        </Alert>
      </>
    ),
  },
  {
    id: "estructura",
    title: "Estructura Organizacional",
    icon: <Info />,
    color: "#455a64",
    content: (
      <>
        <Typography variant="body1" paragraph>
          La <strong>estructura organizacional</strong> define cómo está organizada la empresa en el sistema. Todo usuario pertenece a una empresa, región, localidad y área.
        </Typography>

        <Typography variant="h6" gutterBottom>Jerarquía</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#e3f2fd" }}>
          <Typography variant="body1" sx={{ textAlign: "center", fontWeight: 600 }}>
            EMPRESA → REGIÓN → LOCALIDAD → ÁREA → USUARIO
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>¿Dónde se configura?</Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
          <Typography variant="body2">
            <strong>Panel → Configuración → Regiones / Localidades / Áreas / Cargos</strong>
          </Typography>
        </Paper>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Si un usuario dice "no veo datos de mi localidad":</strong> Verificar que el usuario esté asignado a la empresa y localidad correcta en Panel → Usuarios.
        </Alert>

        <Alert severity="info">
          <strong>Los nombres son únicos por nivel.</strong> No puede haber dos regiones con el mismo nombre en la misma empresa, ni dos localidades iguales en la misma región. Si el sistema dice <em>"Ya existe una región con ese nombre"</em>, es por esto.
        </Alert>
      </>
    ),
  },
  {
    id: "checklist_cierre",
    title: "Checklist de Cierre de Caso (Soporte APP)",
    icon: <CheckCircle />,
    color: "#2e7d32",
    content: (
      <>
        <Typography variant="body1" paragraph>
          Antes de cerrar cualquier caso reportado en APP, confirma este checklist para asegurar calidad de soporte y evitar reaperturas.
        </Typography>

        <List dense>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Se identificó módulo exacto y síntoma puntual." /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Se validó configuración en Panel (permisos, estado, fechas, asignaciones)." /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Se validó contexto del usuario (tipo, empresa, localidad, área)." /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Se validó estado del dispositivo/app (internet, versión, permisos)." /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="El usuario probó en vivo y confirmó solución." /></ListItem>
          <ListItem><ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon><ListItemText primary="Si se escaló, se adjuntó evidencia completa (usuario, error, hora, pasos, módulo)." /></ListItem>
        </List>

        <Alert severity="success" sx={{ mt: 1 }}>
          Caso bien documentado = resolución más rápida en futuros incidentes.
        </Alert>
      </>
    ),
  },
];

const RadiografiaAppPage = () => {
  const [expanded, setExpanded] = useState("general");

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <PhoneAndroid sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            Radiografía del APP
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Guía completa de cómo funciona la aplicación móvil ARCA. Entiende cada módulo, qué datos necesita y cómo se alimenta desde el Panel.
        </Typography>

        <Alert severity="success" icon={<TipsAndUpdates />} sx={{ mb: 3 }}>
          <strong>Regla de oro:</strong> Si algo no aparece en la APP, el primer paso siempre es verificar que esté correctamente configurado en el <strong>Panel Web</strong>. La app muestra lo que el Panel le envía.
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
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            {section.content}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default RadiografiaAppPage;
