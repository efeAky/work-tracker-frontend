"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navConfig: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/roles/admin" },
    { label: "Users", href: "/roles/admin/users" },
    { label: "Create User", href: "/roles/admin/create" },
  ],
  supervisor: [
    { label: "Dashboard", href: "/roles/supervisor" },
    { label: "Tasks", href: "/roles/supervisor/tasks" },
    { label: "Employees", href: "/roles/supervisor/employees" },
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
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
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <span className="text-lg font-black tracking-tight text-slate-900">
            Work<span className="text-indigo-600">Tracker</span>
            <span className="ml-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              {roleLabel[role]}
            </span>
          </span>

          {/* Nav Links + Logout */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === `/roles/${role}`
                  ? pathname === `/roles/${role}`
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-2" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}