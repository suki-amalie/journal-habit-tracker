import AuthLayout from "../layouts/AuthLayout";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useLocation } from "react-router-dom";

import { apiClient, ApiError } from "../services/apiClient";
import type { CurrentUser } from "../hooks/useCurrentUser";

interface LoginResponse {
  user: CurrentUser;
}

interface LocationState {
  from?: {
    pathname?: string;
  };
}

async function loginRequest(
  email: string,
  password: string,
): Promise<CurrentUser> {
  const response = await apiClient("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();
  return data.user;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const queryClient = useQueryClient();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const currentUser = queryClient.getQueryData<CurrentUser | null>([
    "auth",
    "me",
  ]);

  const mutation = useMutation({
    mutationFn: () => loginRequest(email.trim(), password),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });

  if (currentUser) {
    return <Navigate to={state?.from?.pathname ?? "/"} replace />;
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  function getErrorMessage(error: Error): string {
    if (error instanceof ApiError && error.status === 401) {
      return "Email or password is incorrect.";
    }

    if (error instanceof ApiError && error.status >= 500) {
      return "Something went wrong. Please try again.";
    }

    return "Unable to log in. Please check your connection and try again.";
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where your thoughts left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-[#526b49] hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[#4d5148]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-[#dedcd3] bg-white px-3 py-2.5 outline-none focus:border-[#84977a]"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-[#4d5148]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[#dedcd3] bg-white px-3 py-2.5 outline-none focus:border-[#84977a]"
          />
        </div>

        {/* Error message */}
        {mutation.isError && (
          <p role="alert" className="text-sm text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-[#728766] px-4 py-3 text-white hover:bg-[#617655] disabled:opacity-60"
        >
          {mutation.isPending ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
