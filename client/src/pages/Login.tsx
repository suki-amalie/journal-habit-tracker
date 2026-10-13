import { useState, type FormEvent } from "react";
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

async function loginRequest(email: string, password: string): Promise<CurrentUser> {
  const response = await apiClient("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();
  return data.user;
}

function getLoginError(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "That email and password don't match. Please try again.";
    }

    if (error.status === 400) {
      return "Please enter a valid email and password.";
    }

    if (error.status >= 500) {
      return "Hibi couldn't log you in right now. Please try again.";
    }
  }

  return "Something went wrong. Please check your connection and try again.";
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const mutation = useMutation({
    mutationFn: () => loginRequest(email.trim(), password),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });

  const currentUser = queryClient.getQueryData<CurrentUser | null>(["auth", "me"]);

  if (currentUser) {
    return <Navigate to={state?.from?.pathname ?? "/"} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-6 py-12">
      <section className="w-full max-w-md">
        <header className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-serif text-4xl tracking-tight text-stone-800">
            hibi<span className="mb-1 h-2 w-2 rounded-full bg-emerald-600" />
          </Link>
          <p className="mt-4 font-serif text-lg text-stone-600">
            A little space to return to yourself.
          </p>
        </header>

        <div className="rounded-3xl border border-stone-200/80 bg-white/80 p-7 shadow-sm sm:p-9">
          <h1 className="font-serif text-2xl text-stone-800">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Pick up where your thoughts left off.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-stone-700">
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
                className="w-full rounded-xl border border-stone-200 bg-[#fdfcf9] px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-stone-700">
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
                className="w-full rounded-xl border border-stone-200 bg-[#fdfcf9] px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                placeholder="Your password"
              />
            </div>

            {mutation.isError && (
              <p role="alert" className="text-sm leading-5 text-rose-700">
                {getLoginError(mutation.error)}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Returning to Hibi..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-stone-500">
          Your little corner of the world, just for you.
        </p>
      </section>
    </main>
  );
}

export default Login;