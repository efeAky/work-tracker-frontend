"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      if (data.user && data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=${10 * 60 * 60}`;
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const roleRoutes: Record<string, string> = {
          admin: "/roles/admin",
          supervisor: "/roles/supervisor",
          worker: "/roles/worker",
        };

        router.push(roleRoutes[data.user.userRole] || "/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-slate-50">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-black tracking-tighter text-slate-900 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
              Work<span className="text-indigo-600">Tracker</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-5 font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-slate-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}