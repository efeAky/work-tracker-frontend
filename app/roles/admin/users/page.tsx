"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteButton from "@/clientComponents/admin/DeleteButton";

type User = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
  companyId: number;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    admin: "bg-indigo-50 text-indigo-700 border-indigo-100",
    supervisor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    worker: "bg-slate-50 text-slate-600 border-slate-100",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">System Administration</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Directory</h1>
        </div>
        <div className="px-5 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest self-start sm:self-auto">
          {filtered.length} Indexed Accounts
        </div>
      </div>

      {/* Global Controls - Responsive */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search by identity or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-4.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-100 transition-all outline-none shadow-sm group-hover:border-indigo-100 pr-12"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-slate-100 rounded-3xl px-8 py-4.5 text-xs sm:text-sm font-black text-slate-900 focus:ring-8 focus:ring-indigo-100 transition-all outline-none shadow-sm appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="all">Every Account</option>
          <option value="admin">Administrators</option>
          <option value="supervisor">Supervisors</option>
          <option value="worker">Workers</option>
        </select>
      </div>

      {/* Directory Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-100 p-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-400 font-extrabold uppercase tracking-[0.2em] text-[11px]">No matching identity found</p>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-0 lg:bg-white lg:rounded-[40px] lg:border lg:border-slate-100 lg:overflow-hidden lg:shadow-2xl lg:shadow-slate-200/40">
          {/* Desktop Only Header */}
          <div className="hidden lg:grid grid-cols-12 px-10 py-6 border-b border-slate-50 bg-slate-50/50">
            <p className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</p>
            <p className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Address</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">System Access</p>
          </div>

          {/* User Entries */}
          <div className="space-y-4 lg:space-y-0 relative z-0">
            {filtered.map((user, index) => (
              <div
                key={user.userId}
                className={`flex flex-col lg:grid lg:grid-cols-12 items-center px-6 py-8 lg:px-10 lg:py-6 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none border border-slate-100 lg:border-none shadow-sm lg:shadow-none hover:bg-slate-50 transition-all ${
                  index !== filtered.length - 1 ? "lg:border-b lg:border-slate-50" : ""
                }`}
              >
                {/* Mobile: Top Section / Desktop: col-span-4 */}
                <div className="w-full lg:col-span-4 flex items-center gap-5 mb-6 lg:mb-0">
                  <div className="w-14 lg:w-11 h-14 lg:h-11 rounded-2xl lg:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xl lg:text-sm shadow-inner group-hover:bg-indigo-600 transition-colors">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-lg lg:text-sm tracking-tight truncate leading-none mb-1.5">
                      {user.fullname}
                    </p>
                    <p className="lg:hidden text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.email}</p>
                    <p className="hidden lg:block text-[9px] text-indigo-500 font-black tracking-widest uppercase">ID: {user.userId}</p>
                  </div>
                </div>

                {/* Email (Desktop Only Inline) */}
                <p className="hidden lg:block col-span-4 text-sm text-slate-500 font-bold truncate pr-10">
                  {user.email}
                </p>

                {/* Classification - Centered Row on Mobile */}
                <div className="w-full flex items-center justify-between lg:col-span-2 mb-8 lg:mb-0 px-2 lg:px-0">
                  <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      roleColors[user.userRole] || "bg-slate-50 text-slate-600 border-slate-100"
                    }`}
                  >
                    {user.userRole}
                  </span>
                </div>

                {/* Access Controls - Pinned to bottom on Mobile */}
                <div className="w-full flex lg:col-span-2 items-center justify-between lg:justify-end gap-3 pt-6 lg:pt-0 border-t lg:border-none border-slate-50 px-2 lg:px-0">
                  <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">Permissions</span>
                  <div className="flex items-center gap-4">
                    <Link href={`/roles/admin/${user.userId}/edit`}>
                      <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all border-b border-transparent hover:border-indigo-600">
                        Revise
                      </button>
                    </Link>
                    <DeleteButton userId={user.userId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}