import { queryClient } from "../lib/queryClient";


const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let isRedirectingForAuth = false;

export async function apiClient(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 401 && !endpoint.startsWith("/auth/")) {
      queryClient.clear();

      if (!isRedirectingForAuth && window.location.pathname !== "/login") {
        isRedirectingForAuth = true;
        window.location.replace("/login");
      }
    }

    throw new ApiError(
      body?.error ?? `API request failed: ${response.status}`,
      response.status,
    );
  }

  return response;
}
