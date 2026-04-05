import axiosClient from "./axiosClient";

export const getTickets = (params) => axiosClient.get("/tickets", { params });
export const getTicketPorId = (id) => axiosClient.get(`/tickets/${id}`);
export const getComentarios = (id) => axiosClient.get(`/tickets/${id}/comentarios`);
export const getHistorial = (id) => axiosClient.get(`/tickets/${id}/historial`);
export const getEstadisticasTickets = () => axiosClient.get("/tickets/estadisticas");

export const crearTicket = (data) => axiosClient.post("/tickets", data);
export const crearComentario = (id, data) => axiosClient.post(`/tickets/${id}/comentarios`, data);
export const actualizarTicket = (id, data) => axiosClient.put(`/tickets/${id}`, data);

export const tomarTicket = (id) => axiosClient.patch(`/tickets/${id}/tomar`);
export const asignarTicket = (id, data) => axiosClient.patch(`/tickets/${id}/asignar`, data);
export const escalarTicket = (id, data) => axiosClient.patch(`/tickets/${id}/escalar`, data);
export const resolverTicket = (id, data) => axiosClient.patch(`/tickets/${id}/resolver`, data);
export const cerrarTicket = (id) => axiosClient.patch(`/tickets/${id}/cerrar`);
export const reabrirTicket = (id, data) => axiosClient.patch(`/tickets/${id}/reabrir`, data);
export const eliminarTicket = (id) => axiosClient.delete(`/tickets/${id}`);
