import axiosClient from "./axiosClient";

export const getErrores = (params) =>
  axiosClient.get("/errores", { params });

export const getModulos = () =>
  axiosClient.get("/errores/modulos");

export const crearError = (data) =>
  axiosClient.post("/errores", data);

export const actualizarError = (id, data) =>
  axiosClient.put(`/errores/${id}`, data);

export const eliminarError = (id) =>
  axiosClient.delete(`/errores/${id}`);
