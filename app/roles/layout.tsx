"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navConfig: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/roles/admin" },
    { label: "Users", href: "/roles/admin/users" },
    { label: "Create User", href: "/roles/admin/create" },
  ],
  supervisor: [
    { label: "Dashboard", href: "/roles/supervisor" },
    { label: "Tasks", href: "/roles/supervisor/tasks" },
    { label: "Employees", href: "/roles/supervisor/workers" },
  ],
  worker: [
    { label: "Dashboard", href: "/roles/worker" },
    { label: "Tasks", href: "/roles/worker/tasks" },
  ],
};

function getRoleFromPath(pathname: string): string {
  if (pathname.includes("/roles/admin")) return "admin";
  if (pathname.includes("/roles/supervisor")) return "supervisor";
  if (pathname.includes("/roles/worker")) return "worker";
  return "admin";
}

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = getRoleFromPath(pathname);
  const navItems = navConfig[role];

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    supervisor: "Supervisor",
    worker: "Worker",
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <Link href={`/roles/${role}`} className="flex items-baseline">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Work<span className="text-indigo-600">Tracker</span>
            </span>
            <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md hidden sm:block">
              {roleLabel[role]}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === `/roles/${role}`
                  ? pathname === `/roles/${role}`
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-black transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="w-px h-5 bg-slate-200 mx-3" />

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-2xl text-sm font-black text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full px-5 py-4 rounded-2xl text-sm font-black ${
                  pathname.startsWith(item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-5 py-4 rounded-2xl text-sm font-black text-red-600 bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-slate-100 text-center">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          © 2026 WorkTracker Team • Powered by Next.js
        </p>
      </footer>
    </div>
  );
}