import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const streamChat = async ({ pregunta, historial, sessionId, contexto_modulo, tokenOverride, apiUrlOverride, signal, onTexto, onToolStart, onToolEjecutando, onArticulos, onFin, onError }) => {
  const token = tokenOverride || localStorage.getItem("token");
  const apiBase = apiUrlOverride || API_URL;

  try {
    const response = await fetch(`${apiBase}/agente/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
      body: JSON.stringify({ pregunta, historial, sessionId, contexto_modulo }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ msg: "Error de conexión" }));
      onError?.(err.msg || `Error ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = null;
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ") && currentEvent) {
          try {
            const data = JSON.parse(line.slice(6));
            switch (currentEvent) {
              case "texto":
                onTexto?.(data.chunk);
                break;
              case "tool_start":
                onToolStart?.(data.tool);
                break;
              case "tool_ejecutando":
                onToolEjecutando?.(data);
                break;
              case "articulos_encontrados":
                onArticulos?.(data.articulos);
                break;
              case "fin":
                onFin?.(data);
                break;
              case "error":
                onError?.(data.msg);
                break;
            }
          } catch {
            // ignore parse errors
          }
          currentEvent = null;
        } else if (line === "") {
          currentEvent = null;
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    onError?.(err.message || "Error de conexión");
  }
};

export const obtenerHistorialSesiones = async (params = {}) => {
  const { data } = await axiosClient.get("/agente/historial/sesiones", { params });
  return data;
};

export const obtenerMensajesSesion = async (sessionId, params = {}) => {
  const { data } = await axiosClient.get(`/agente/historial/sesiones/${encodeURIComponent(sessionId)}`, { params });
  return data;
};

export const buscarEnHistorial = async (q, params = {}) => {
  const { data } = await axiosClient.get("/agente/historial/buscar", {
    params: { q, ...params },
  });
  return data;
};
