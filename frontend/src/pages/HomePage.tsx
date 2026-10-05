import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/use-auth.js";

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">PassportAuth</h1>

        <p className="mt-3 text-gray-600">
          Production-ready token authentication learning project.
        </p>

        {isAuthenticated ? (
          <div className="mt-6">
            <p className="text-gray-700">Welcome, {user?.firstName}.</p>

            <Link
              to="/dashboard"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
