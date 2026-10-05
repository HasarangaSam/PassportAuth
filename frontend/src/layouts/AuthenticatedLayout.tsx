import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/use-auth.js";

const AuthenticatedLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            PassportAuth
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Profile
            </Link>

            <Link
              to="/change-password"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Change Password
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500">Signed in as</p>

          <p className="font-medium text-gray-900">{user?.email}</p>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
