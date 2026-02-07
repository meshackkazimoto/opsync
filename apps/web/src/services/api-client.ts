import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/types/api";
import { clearTokens, getTokens, setTokens } from "@/lib/auth/token-store";

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: unknown, token?: string) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const refreshClient = axios.create({ baseURL });
  const response = await refreshClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    "/api/v1/auth/refresh",
    { refreshToken }
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "Refresh failed");
  }

  setTokens(response.data.data);
  return response.data.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;
    if (payload && typeof payload === "object" && "success" in payload) {
      if (payload.success) {
        return payload.data;
      }
      throw new Error(payload.error?.message || "Request failed");
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    if (!original) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && original.headers) {
                original.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const token = await refreshAccessToken();
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        if (original.headers) {
          original.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
