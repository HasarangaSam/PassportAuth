import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../features/auth/hooks/use-auth.js";

const ChangePasswordPage = () => {
  const { changePassword, isLoading } = useAuth();

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess("Password changed successfully. Please sign in again.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ?? "Unable to change your password.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Change password</h1>

        <p className="mt-2 text-gray-600">
          Changing your password signs you out of existing sessions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-5 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="current-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Current password
          </label>

          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            New password
          </label>

          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>

          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Changing password..." : "Change password"}
        </button>
      </form>
    </section>
  );
};

export default ChangePasswordPage;
