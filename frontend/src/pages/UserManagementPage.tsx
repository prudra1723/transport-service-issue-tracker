import {
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createUser,
  getUsers,
  resetPassword,
  updateUserActive,
  updateUserRole,
} from "../api/userApi";
import { getCurrentUser } from "../auth/authStorage";
import type { CreateUserRequest, User, UserRole } from "../types/user";

const roles: UserRole[] = ["REPORTER", "SUPPORT_AGENT", "MANAGER", "ADMIN"];

const emptyCreateForm: CreateUserRequest = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  role: "REPORTER",
};

export default function UserManagementPage() {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [createForm, setCreateForm] =
    useState<CreateUserRequest>(emptyCreateForm);

  const [passwordDialogUser, setPasswordDialogUser] = useState<User | null>(
    null,
  );

  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await getUsers();

        if (!cancelled) {
          setUsers(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, "Unable to load users."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.fullName, user.email, user.role].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [search, users]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const createdUser = await createUser({
        ...createForm,
        username: createForm.username.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
      });

      setUsers((current) =>
        [...current, createdUser].sort((first, second) =>
          first.username.localeCompare(second.username),
        ),
      );

      setCreateForm(emptyCreateForm);
      setCreateDialogOpen(false);
      setSuccess("User created successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to create user."));
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(user: User, role: UserRole) {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedUser = await updateUserRole(user.id, { role });

      replaceUser(updatedUser);
      setSuccess(`${updatedUser.username}'s role was updated.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update role."));
    } finally {
      setSaving(false);
    }
  }

  async function handleActiveChange(user: User) {
    if (currentUser?.userId === user.id && user.active) {
      setError("You cannot deactivate your own account.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedUser = await updateUserActive(user.id, {
        active: !user.active,
      });

      replaceUser(updatedUser);

      setSuccess(
        updatedUser.active
          ? `${updatedUser.username} was activated.`
          : `${updatedUser.username} was deactivated.`,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update account status."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordDialogUser) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await resetPassword(passwordDialogUser.id, {
        newPassword,
      });

      setPasswordDialogUser(null);
      setNewPassword("");

      setSuccess(`Password reset for ${passwordDialogUser.username}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to reset password."));
    } finally {
      setSaving(false);
    }
  }

  function replaceUser(updatedUser: User) {
    setUsers((current) =>
      current.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }

  if (!isAdmin) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-bold text-red-800">Access denied</h1>

        <p className="mt-2 text-red-700">
          Only administrators can access user management.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        Loading users...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">User Management</h1>

          <p className="mt-1 text-slate-500">
            Create accounts, manage roles, activate users and reset passwords.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create user
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">User</th>

                <th className="px-5 py-4">Email</th>

                <th className="px-5 py-4">Role</th>

                <th className="px-5 py-4">Status</th>

                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {user.fullName}
                    </p>

                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={saving}
                      onChange={(event) =>
                        void handleRoleChange(
                          user,
                          event.target.value as UserRole,
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {formatRole(role)}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        user.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600",
                      ].join(" ")}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleActiveChange(user)}
                        className={[
                          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                          user.active
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
                        ].join(" ")}
                      >
                        {user.active ? (
                          <UserX size={15} />
                        ) : (
                          <UserCheck size={15} />
                        )}

                        {user.active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setPasswordDialogUser(user);
                          setNewPassword("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        <KeyRound size={15} />
                        Reset password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <header className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">Create user</h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a new application user.
              </p>
            </header>

            <form onSubmit={handleCreateUser} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Username"
                  value={createForm.username}
                  onChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      username: value,
                    }))
                  }
                />

                <FormField
                  label="Full name"
                  value={createForm.fullName}
                  onChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      fullName: value,
                    }))
                  }
                />
              </div>

              <FormField
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    email: value,
                  }))
                }
              />

              <FormField
                label="Temporary password"
                type="password"
                value={createForm.password}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: value,
                  }))
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>

                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      role: event.target.value as UserRole,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {formatRole(role)}
                    </option>
                  ))}
                </select>
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setCreateDialogOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <ShieldCheck size={17} />
                  {saving ? "Creating..." : "Create user"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {passwordDialogUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <header className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-950">
                Reset password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set a new password for {passwordDialogUser.username}.
              </p>
            </header>

            <form onSubmit={handleResetPassword} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New password
                </label>

                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Example: Password123!"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-700">
                    Password Requirements
                  </h3>

                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    <li>Minimum 8 characters</li>
                    <li>At least one uppercase letter (A–Z)</li>
                    <li>At least one lowercase letter (a–z)</li>
                    <li>At least one number (0–9)</li>
                    <li>Special characters are recommended (e.g. ! @ # $ %)</li>
                  </ul>
                </div>
              </div>

              <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setPasswordDialogUser(null);
                    setNewPassword("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || newPassword.length < 8}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Resetting..." : "Reset password"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}

function FormField({ label, value, type = "text", onChange }: FormFieldProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function formatRole(role: UserRole): string {
  return role.replaceAll("_", " ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
