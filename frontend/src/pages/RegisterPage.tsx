import { Link } from "react-router-dom";

import RegisterForm from "../features/auth/components/RegisterForm.js";

const RegisterPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            PassportAuth
          </Link>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Get started with PassportAuth
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
