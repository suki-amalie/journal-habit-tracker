
import { useQuery } from "@tanstack/react-query";

import { apiClient, ApiError } from "../services/apiClient";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

interface MeResponse {
  user: CurrentUser;
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    //console.log("Fetching current user...");

    const response = await apiClient("/auth/me");
    const data: MeResponse = await response.json();

    return data.user;
  } catch (error) {
    // A 401 means the browser has no valid authenticated session.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    // Network failures and server errors are NOT equivalent to logout.
    throw error;
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
