import { Link } from "react-router-dom";

import LoginForm from "../features/auth/components/LoginForm.js";
import GoogleLoginButton from "../features/auth/components/GoogleLoginButton.js";

const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            PassportAuth
          </Link>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-400">OR</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleLoginButton />
      </div>
    </main>
  );
};

export default LoginPage;
