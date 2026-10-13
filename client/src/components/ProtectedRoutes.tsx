
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useCurrentUser } from "../hooks/useCurrentUser";

function ProtectedRoute() {
  const location = useLocation();
  const {
    data: user,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useCurrentUser();
 //console.log("ProtectedRoute rendered");


  // We don't know the authentication state yet.
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f3]">
        <p className="text-sm text-stone-500">
          Checking your session...
        </p>
      </div>
    );
  }

  // A server or network error is not the same as being logged out.
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf8f3] px-6">
        <h1 className="font-serif text-2xl text-stone-800">
          Unable to open Hibi
        </h1>

        <p className="max-w-sm text-center text-sm text-stone-500">
          We couldn't verify your session. Please check your connection
          and try again.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isRefetching}
          className="rounded-full bg-stone-800 px-5 py-2 text-sm text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefetching ? "Trying again..." : "Try again"}
        </button>
      </div>
    );
  }

  // A successful /me request with no user means the session is invalid.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // The session is valid; render the protected child routes.
  return <Outlet />;
}

export default ProtectedRoute;
