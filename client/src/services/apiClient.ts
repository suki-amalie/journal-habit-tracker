const API_URL = "http://localhost:3000/api";

export async function apiClient(
  endpoint: string,
  options?: RequestInit
) {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(
      body?.error ?? `API request failed: ${response.status}`,
    );
  }

  return response;
}