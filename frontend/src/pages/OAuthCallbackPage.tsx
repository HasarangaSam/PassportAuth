import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import { exchangeGoogleCode } from "../features/auth/api/auth.api.js";
import { useAuth } from "../features/auth/hooks/use-auth.js";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { setAuthentication } = useAuth();

  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("Google authentication failed.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await exchangeGoogleCode(code);

        setAuthentication(response.accessToken, response.user);

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ?? "Google authentication failed.",
          );
        } else {
          setError("Google authentication failed.");
        }
      }
    };

    exchangeCode();
  }, [navigate, searchParams, setAuthentication]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Completing Google sign in...</p>
    </main>
  );
};

export default OAuthCallbackPage;
