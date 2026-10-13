import AuthLayout from "../layouts/AuthLayout";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useLocation } from "react-router-dom";

import { apiClient, ApiError } from "../services/apiClient";
import type { CurrentUser } from "../hooks/useCurrentUser";

interface RegisterResponse {
  user: CurrentUser;
}

interface LocationState {
  from?: {
    pathname?: string;
  };
}

async function registerRequest(
  username: string,
  email: string,
  password: string,
): Promise<CurrentUser> {
  const response = await apiClient("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data: RegisterResponse = await response.json();
  return data.user;
}

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const queryClient = useQueryClient();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const currentUser = queryClient.getQueryData<CurrentUser | null>([
    "auth",
    "me",
  ]);

  const mutation = useMutation({
    mutationFn: () => registerRequest(username.trim(), email.trim(), password),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });

  if (currentUser) {
    return <Navigate to={state?.from?.pathname ?? "/"} replace />;
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    mutation.mutate();
  }

  function getErrorMessage(error: Error): string {
    if (error instanceof ApiError && error.status === 409) {
      return "An account with this email already exists.";
    }

    if (error instanceof ApiError && error.status >= 500) {
      return "Something went wrong. Please try again.";
    }

    return "Unable to create your account. Please check your details.";
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A fresh page, just for you."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#526b49] hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm text-[#4d5148]"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            maxLength={255}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-lg border border-[#dedcd3] bg-white px-3 py-2.5 outline-none focus:border-[#84977a]"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={9}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[#dedcd3] bg-white px-3 py-2.5 outline-none focus:border-[#84977a]"
          />
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm text-[#4d5148]"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={9}
            maxLength={128}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg border border-[#dedcd3] bg-white px-3 py-2.5 outline-none focus:border-[#84977a]"
          />
        </div>

        {/* Validation or server error */}
        {formError && (
          <p role="alert" className="text-sm text-red-700">
            {formError}
          </p>
        )}

        {!formError && mutation.isError && (
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
          {mutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
