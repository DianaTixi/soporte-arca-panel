import axiosClient from "./axiosClient";

export const getCategorias = () =>
  axiosClient.get("/categorias");

export const getCategoriaPorId = (id) =>
  axiosClient.get(`/categorias/${id}`);

export const crearCategoria = (data) =>
  axiosClient.post("/categorias", data);

export const actualizarCategoria = (id, data) =>
  axiosClient.put(`/categorias/${id}`, data);

export const eliminarCategoria = (id) =>
  axiosClient.delete(`/categorias/${id}`);
