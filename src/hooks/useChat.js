import { useState, useCallback, useRef } from "react";
import { streamChat, obtenerMensajesSesion } from "../api/agenteApi";

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [foundArticles, setFoundArticles] = useState([]);
  const [contextoModulo, setContextoModulo] = useState(null);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const controllerRef = useRef(null);

  const sendMessage = useCallback(async (pregunta) => {
    if (!pregunta.trim() || streaming) return;

    const userMsg = { role: "user", content: pregunta };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setActiveTool(null);
    setFoundArticles([]);

    let assistantContent = "";
    const assistantIndex = { current: null };

    setMessages((prev) => {
      assistantIndex.current = prev.length;
      return [...prev, { role: "assistant", content: "", articles: [], loading: true }];
    });

    const historial = [...messages, userMsg]
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      await streamChat({
        pregunta,
        historial,
        sessionId,
        contexto_modulo: contextoModulo,
        signal: controller.signal,
        onTexto: (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const idx = assistantIndex.current;
            if (idx !== null && updated[idx]) {
              updated[idx] = { ...updated[idx], content: assistantContent };
            }
            return updated;
          });
        },
        onToolStart: (tool) => {
          setActiveTool(tool);
        },
        onToolEjecutando: () => {
          setActiveTool(null);
        },
        onArticulos: (articulos) => {
          setFoundArticles(articulos);
          setMessages((prev) => {
            const updated = [...prev];
            const idx = assistantIndex.current;
            if (idx !== null && updated[idx]) {
              updated[idx] = { ...updated[idx], articles: articulos };
            }
            return updated;
          });
        },
        onFin: (data) => {
          if (data.mensajeAsistente?.content) {
            assistantContent = data.mensajeAsistente.content;
          }
          setMessages((prev) => {
            const updated = [...prev];
            const idx = assistantIndex.current;
            if (idx !== null && updated[idx]) {
              updated[idx] = {
                ...updated[idx],
                content: assistantContent,
                loading: false,
                tokensUsados: data.tokensUsados,
              };
            }
            return updated;
          });
          setStreaming(false);
          setActiveTool(null);
        },
        onError: (msg) => {
          setMessages((prev) => {
            const updated = [...prev];
            const idx = assistantIndex.current;
            if (idx !== null && updated[idx]) {
              updated[idx] = {
                ...updated[idx],
                content: `Error: ${msg}`,
                loading: false,
                error: true,
              };
            }
            return updated;
          });
          setStreaming(false);
          setActiveTool(null);
        },
      });
    } finally {
      controllerRef.current = null;
    }
  }, [messages, streaming, sessionId, contextoModulo]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setFoundArticles([]);
    setActiveTool(null);
    setContextoModulo(null);
    setSessionId(crypto.randomUUID());
  }, []);

  const loadSession = useCallback(async (targetSessionId, options = {}) => {
    const sessionIdFinal = targetSessionId?.trim();
    if (!sessionIdFinal) return;

    const params = { limit: 500 };
    if (options.usuario) params.usuario = options.usuario;
    const data = await obtenerMensajesSesion(sessionIdFinal, params);
    const restored = [];
    (data.mensajes || []).forEach((item) => {
      if (item.chat_pregunta) {
        restored.push({
          role: "user",
          content: item.chat_pregunta,
          createdAt: item.chat_created_at,
        });
      }
      if (item.chat_respuesta) {
        restored.push({
          role: "assistant",
          content: item.chat_respuesta,
          articles: [],
          tokensUsados: item.chat_tokens_usados,
          createdAt: item.chat_created_at,
        });
      }
    });

    setMessages(restored);
    setFoundArticles([]);
    setActiveTool(null);
    setContextoModulo(null);
    setSessionId(sessionIdFinal);
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    setStreaming(false);
    setActiveTool(null);
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const idx = updated.length - 1;
      if (updated[idx]?.role === "assistant" && updated[idx]?.loading) {
        updated[idx] = { ...updated[idx], loading: false };
      }
      return updated;
    });
  }, []);

  return {
    sessionId,
    messages,
    streaming,
    activeTool,
    foundArticles,
    contextoModulo,
    setContextoModulo,
    sendMessage,
    clearChat,
    loadSession,
    abort,
  };
};

export default useChat;
