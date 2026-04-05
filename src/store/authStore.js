import { create } from "zustand";
import { loginApi, renovarTokenApi } from "../api/authApi";

const useAuthStore = create((set) => ({
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  token: localStorage.getItem("token") || null,
  checking: true,

  login: async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    set({ usuario: data.usuario, token: data.token });
    return data;
  },

  renovarToken: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ checking: false });
        return;
      }
      const { data } = await renovarTokenApi();
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      set({ usuario: data.usuario, token: data.token, checking: false });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      set({ usuario: null, token: null, checking: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    set({ usuario: null, token: null });
  },
}));

export default useAuthStore;
