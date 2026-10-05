import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/use-auth.js";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName}
        </h1>

        <p className="mt-2 text-gray-600">
          You are successfully authenticated with PassportAuth.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          to="/profile"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
        >
          <h2 className="font-semibold text-gray-900">Profile</h2>

          <p className="mt-2 text-sm text-gray-500">
            View your account information.
          </p>
        </Link>

        <Link
          to="/change-password"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm"
        >
          <h2 className="font-semibold text-gray-900">Security</h2>

          <p className="mt-2 text-sm text-gray-500">
            Change your password and invalidate existing sessions.
          </p>
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Authentication</h2>

          <p className="mt-2 text-sm text-gray-500">
            Access tokens are stored in memory and refresh tokens are stored in
            an HttpOnly cookie.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
