import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5202/api",
});

// Interceptor global: loga erros no console em desenvolvimento
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data ?? error.message ?? "Erro desconhecido";
    console.error("[API Error]", error.config?.url, mensagem);
    return Promise.reject(error);
  }
);

export default api;
