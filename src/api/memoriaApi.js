import axiosClient from "./axiosClient";

export const getMemorias = (params) =>
  axiosClient.get("/memorias", { params });

export const crearMemoria = (data) =>
  axiosClient.post("/memorias", data);

export const actualizarMemoria = (id, data) =>
  axiosClient.put(`/memorias/${id}`, data);

export const eliminarMemoria = (id) =>
  axiosClient.delete(`/memorias/${id}`);
