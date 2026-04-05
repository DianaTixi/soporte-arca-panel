import axiosClient from "./axiosClient";

export const getArticulos = (params) =>
  axiosClient.get("/articulos", { params });

export const buscarArticulos = (q, params = {}) =>
  axiosClient.get("/articulos/buscar", { params: { q, ...params } });

export const getArticuloPorSlug = (slug) =>
  axiosClient.get(`/articulos/slug/${slug}`);

export const getArticuloPorId = (id) =>
  axiosClient.get(`/articulos/${id}`);

export const votarArticulo = (id, tipo) =>
  axiosClient.patch(`/articulos/${id}/votar`, { tipo });

export const crearArticulo = (data) =>
  axiosClient.post("/articulos", data);

export const actualizarArticulo = (id, data) =>
  axiosClient.put(`/articulos/${id}`, data);

export const eliminarArticulo = (id) =>
  axiosClient.delete(`/articulos/${id}`);
