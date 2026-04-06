# Widget embebible de ARCA Soporte

Este proyecto ahora expone un chat embebible en la ruta:

- `/embed/chat`

Además incluye un loader listo para terceros:

- `/arca-chat-widget.js`

## Integración mínima en otro sistema

```html
<script src="https://TU_PANEL/arca-chat-widget.js"></script>
<script>
  window.ArcaChatWidget.init({
    baseUrl: "https://TU_PANEL",
    token: "TOKEN_DEL_USUARIO",
    apiUrl: "https://TU_PANEL/api",
    contexto: "general", // general | usuarios | formularios | tareas | reportes
    title: "Soporte ARCA",
    primaryColor: "#e91e63",
    position: "right", // right | left
    startOpen: true // opcional para abrir de una
  });
</script>
```

## Prueba rápida (local)

1. Inicia el panel:

```bash
npm install
npm run dev
```

2. Abre:
   - `http://localhost:5174/embed/chat?token=TU_TOKEN`
   - `http://localhost:5174/arca-chat-widget.test.html` (playground de prueba)
   - o integra el script en cualquier HTML local.

3. Si quieres probar contra otro backend, pasa `apiUrl` en `init(...)`.

## Notas

- `token` se pasa por `postMessage` al iframe y se envía al endpoint de chat como header `x-token`.
- El widget usa `iframe`, por lo que puede incrustarse en sistemas externos sin compartir estilos.
- Si el sistema host no tiene un token fijo, se recomienda generarlo en backend y firmarlo por usuario/sesión.
