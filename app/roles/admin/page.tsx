"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
};

export default function AdminDashboard() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setAdminName(payload.fullname || "Admin");
        }

        const [lastRes, allRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/last/10`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (lastRes.ok) setRecentUsers(await lastRes.json());
        if (allRes.ok) {
          const all = await allRes.json();
          setTotalUsers(all.length);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const roleColors: Record<string, string> = {
    admin: "bg-indigo-100 text-indigo-700",
    supervisor: "bg-emerald-100 text-emerald-700",
    worker: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
            Welcome back
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {adminName || "Admin"} 👋
          </h1>
        </div>
        {/* Total Users pill */}
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Total Users
          </span>
          <span className="text-xl font-black text-slate-900">
            {totalUsers ?? "—"}
          </span>
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
              Recently Added
            </p>
            <h2 className="text-xl font-black text-slate-900">Last 10 Users</h2>
          </div>
          <Link
            href="/roles/admin/users"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
            <p className="text-slate-400 font-bold">No users yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            {recentUsers.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between px-6 py-4 ${
                  index !== recentUsers.length - 1
                    ? "border-b border-slate-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {user.fullname}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      roleColors[user.userRole] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.userRole}
                  </span>
                  <Link href={`admin/${user.userId}/edit`}>
                    <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}