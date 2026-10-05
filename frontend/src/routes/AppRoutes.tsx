import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/HomePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import DashboardPage from "../pages/DashboardPage.js";
import ProfilePage from "../pages/ProfilePage.js";
import ChangePasswordPage from "../pages/ChangePasswordPage.js";
import OAuthCallbackPage from "../pages/OAuthCallbackPage.js";

import AuthenticatedLayout from "../layouts/AuthenticatedLayout.js";
import ProtectedRoute from "./ProtectedRoute.js";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
