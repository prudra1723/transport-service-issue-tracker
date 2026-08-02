import axios from "axios";
import { Lock, ShieldCheck, Truck, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { saveAuthentication } from "../auth/authStorage";
import type { UserRole } from "../types/auth";

interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axios.post<LoginResponse>(
        "http://localhost:8080/api/auth/login",
        {
          username: username.trim(),
          password,
        },
      );

      const loginData = response.data;

      saveAuthentication(loginData.token, {
        userId: loginData.userId,
        username: loginData.username,
        fullName: loginData.fullName,
        email: loginData.email,
        role: loginData.role,
      });

      navigate("/", {
        replace: true,
      });
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 403
      ) {
        setError("Your account does not have permission to sign in.");
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-center bg-gradient-to-br from-blue-700 to-indigo-900 p-8 text-white sm:p-12">
          <div className="mb-8 flex items-center gap-3">
            <Truck size={42} />

            <div>
              <h1 className="text-3xl font-bold">Nexus Transport</h1>

              <p className="text-blue-100">Service Issue Tracker</p>
            </div>
          </div>

          <h2 className="mb-5 text-4xl font-bold">Welcome Back</h2>

          <p className="leading-7 text-blue-100">
            Monitor transport incidents, assign engineers, manage issue
            workflows and analyse operational performance through a secure
            dashboard.
          </p>

          <div className="mt-10 space-y-4">
            <FeatureItem text="JWT Secure Authentication" />
            <FeatureItem text="Real-time Issue Tracking" />
            <FeatureItem text="Role Based Access Control" />
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>

          <p className="mb-8 mt-2 text-slate-500">Log in to continue.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block font-medium text-slate-700"
              >
                Username
              </label>

              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Demo account</p>

            <p className="mt-2">
              Username:
              <span className="ml-2 font-semibold">rudra.admin</span>
            </p>

            <p>
              Password:
              <span className="ml-2 font-semibold">Password123!</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <ShieldCheck size={20} />
      <span>{text}</span>
    </div>
  );
}
