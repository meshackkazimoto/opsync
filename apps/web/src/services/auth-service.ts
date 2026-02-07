import apiClient from "./api-client";
import { setTokens, clearTokens, getTokens } from "@/lib/auth/token-store";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function login(payload: LoginPayload) {
  const data = await apiClient.post<AuthTokensResponse>("/api/v1/auth/login", payload);
  setTokens(data);
  return data;
}

export async function refresh() {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  const data = await apiClient.post<AuthTokensResponse>("/api/v1/auth/refresh", { refreshToken });
  setTokens(data);
  return data;
}

export async function logout() {
  try {
    await apiClient.post("/api/v1/auth/logout");
  } finally {
    clearTokens();
  }
}
