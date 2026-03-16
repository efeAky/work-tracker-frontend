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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
  }, []);

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    admin: "bg-indigo-100 text-indigo-700",
    supervisor: "bg-emerald-100 text-emerald-700",
    worker: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
            Team
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Users
          </h1>
        </div>
        <span className="text-sm font-bold text-slate-400">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm appearance-none transition-all"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="worker">Worker</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
              Loading…
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400 font-bold">No users match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-50">
            <p className="col-span-4 text-xs font-black uppercase tracking-widest text-slate-400">
              Name
            </p>
            <p className="col-span-4 text-xs font-black uppercase tracking-widest text-slate-400">
              Email
            </p>
            <p className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-400">
              Role
            </p>
            <p className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-400 text-right">
              Actions
            </p>
          </div>

          {/* Rows */}
          {filtered.map((user, index) => (
            <div
              key={user.userId}
              className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors ${
                index !== filtered.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs shrink-0">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-slate-900 text-sm truncate">
                  {user.fullname}
                </p>
              </div>

              <p className="col-span-4 text-sm text-slate-400 font-medium truncate pr-4">
                {user.email}
              </p>

              <div className="col-span-2">
                <span
                  className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    roleColors[user.userRole] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.userRole}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <Link href={`/roles/admin/${user.userId}/edit`}>
                  <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    Edit
                  </button>
                </Link>
                <DeleteButton userId={user.userId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}