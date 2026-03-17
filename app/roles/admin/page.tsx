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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setAdminName(payload.fullname || "Admin");
        }

        const [lastRes, allRes] = await Promise.all([
          fetch(`${apiUrl}/api/users/last/10`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/users`, {
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
  }, [apiUrl]);

  const roleColors: Record<string, string> = {
    admin: "bg-indigo-50 text-indigo-700 border-indigo-100",
    supervisor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    worker: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
            System Administrator
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hi, {adminName.split(' ')[0] || "Admin"} 👋
          </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-xl shadow-slate-200/50 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Total Users</p>
            <p className="text-xl font-black text-slate-900 leading-none tracking-tight">{totalUsers ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Activity Feed</p>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recently Added Users</h2>
          </div>
          <Link
            href="/roles/admin/users"
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-600 pb-1"
          >
            All Users →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-inner">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The system is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40">
              {recentUsers.map((user, index) => (
                <div
                  key={user.userId}
                  className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 hover:bg-slate-50 transition-all ${
                    index !== recentUsers.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      {user.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base tracking-tight truncate">
                        {user.fullname}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold tracking-tight truncate uppercase">{user.email}</p>
                    </div>
                  </div>

                  {/* Actions & Role */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none border-slate-50 pt-4 sm:pt-0">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                        roleColors[user.userRole] || "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                    >
                      {user.userRole}
                    </span>
                    <Link href={`/roles/admin/users`}>
                      <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-indigo-600 transition-all">
                        Profile
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link 
          href="/roles/admin/create"
          className="group p-8 bg-indigo-600 rounded-[40px] text-white shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden"
        >
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2 relative z-10">User Management</p>
          <h3 className="text-2xl font-black tracking-tight mb-4 relative z-10">Provision New Account</h3>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </Link>

        <Link 
          href="/roles/admin/users"
          className="group p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Directory</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Manage System Users</h3>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}