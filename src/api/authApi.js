import axiosClient from "./axiosClient";

export const loginApi = (email, password) =>
  axiosClient.post("/auth/login", { email, password });

export const renovarTokenApi = () =>
  axiosClient.get("/auth/renovar");

export const registroApi = (data) =>
  axiosClient.post("/auth/registro", data);

export const getUsuarios = () =>
  axiosClient.get("/auth/usuarios");

export const actualizarUsuarioApi = (id, data) =>
  axiosClient.put(`/auth/usuarios/${id}`, data);

export const cambiarPasswordApi = (id, data) =>
  axiosClient.patch(`/auth/usuarios/${id}/password`, data);
