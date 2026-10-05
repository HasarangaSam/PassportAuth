import { useAuth } from "../features/auth/hooks/use-auth.js";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

        <p className="mt-2 text-gray-600">
          Your authenticated account information.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">Name</span>

            <span className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </span>
          </div>

          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">Email</span>

            <span className="font-medium text-gray-900">{user.email}</span>
          </div>

          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">Role</span>

            <span className="font-medium text-gray-900">{user.role}</span>
          </div>

          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">Email verified</span>

            <span className="font-medium text-gray-900">
              {user.emailVerified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
