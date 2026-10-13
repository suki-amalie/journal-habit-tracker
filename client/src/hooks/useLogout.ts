import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../services/apiClient";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await apiClient("/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      // Remove cached user-specific data after the server confirms logout.
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });
}