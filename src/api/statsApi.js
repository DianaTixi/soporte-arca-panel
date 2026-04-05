import axiosClient from "./axiosClient";

export const obtenerStatsIA = async () => {
  const { data } = await axiosClient.get("/stats/ia");
  return data;
};

export const obtenerLimitesIA = async () => {
  const { data } = await axiosClient.get("/stats/ia/limites");
  return data;
};

export const obtenerProveedorIA = async () => {
  const { data } = await axiosClient.get("/stats/ia/proveedor");
  return data;
};

export const guardarLimitesIAGlobales = async (payload) => {
  const { data } = await axiosClient.put("/stats/ia/limites", payload);
  return data;
};

export const guardarProveedorIA = async (payload) => {
  const { data } = await axiosClient.put("/stats/ia/proveedor", payload);
  return data;
};

export const guardarLimiteIAUsuario = async (payload) => {
  const { data } = await axiosClient.put("/stats/ia/limites/usuario", payload);
  return data;
};

export const desactivarLimiteIAUsuario = async (usuario) => {
  const { data } = await axiosClient.delete(`/stats/ia/limites/usuario/${encodeURIComponent(usuario)}`);
  return data;
};

export const obtenerChatsConCosto = async ({ limit = 50, offset = 0, usuario = "", modelo = "", complejidad = "" } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (offset) params.set("offset", offset);
  if (usuario) params.set("usuario", usuario);
  if (modelo) params.set("modelo", modelo);
  if (complejidad) params.set("complejidad", complejidad);
  const { data } = await axiosClient.get(`/stats/ia/chats?${params.toString()}`);
  return data;
};

export const obtenerStatsKB = async () => {
  const { data } = await axiosClient.get("/stats/kb");
  return data;
};
