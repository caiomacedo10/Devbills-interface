import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { firebaseAuth } from "../config/firebase";

// Cria uma instância do Axios para fazer requisições
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL base da API
  timeout: 10000, // Tempo limite para requisições
});

// Interceptor para adicionar o token de autenticação às requisições
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const user = firebaseAuth.currentUser; // Obtém o usuário atual

    if (user) {
      try {
        const token = await user.getIdToken(); // Obtém o token do usuário
        config.headers.Authorization = `Bearer ${token}`; // Adiciona o token ao cabeçalho
      } catch (err) {
        console.error("Erro ao obter token do usuário no Firebase", err);
      }
    }

    return config; // Retorna a configuração da requisição
  },
);
