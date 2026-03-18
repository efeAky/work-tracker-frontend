"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import { motion } from "motion/react";

type User = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
  companyId: number;
};

const roleColors: Record<string, string> = {
  admin: "bg-indigo-50 text-indigo-700 border-indigo-100",
  supervisor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  worker: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function UserList() {
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
    const matchesRole = roleFilter === "all" || user.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-10 pb-20"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Admin</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Users</h1>
        </div>
        <div className="px-5 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest self-start sm:self-auto">
          {filtered.length} users
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-100 transition-all outline-none shadow-sm pr-12"
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
          className="bg-white border border-slate-100 rounded-3xl px-8 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-indigo-100 outline-none shadow-sm appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="worker">Worker</option>
        </select>
      </motion.div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-100 p-24 text-center">
          <p className="text-slate-400 font-extrabold uppercase tracking-[0.2em] text-[11px]">No users found</p>
        </div>
      ) : (
        <motion.div
          className="space-y-4 lg:space-y-0 lg:bg-white lg:rounded-[40px] lg:border lg:border-slate-100 lg:overflow-hidden lg:shadow-2xl lg:shadow-slate-200/40"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-12 px-10 py-6 border-b border-slate-50 bg-slate-50/50">
            <p className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</p>
            <p className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</p>
          </div>

          {/* Rows */}
          <div className="space-y-4 lg:space-y-0">
            {filtered.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05, ease: "easeOut" }}
                className={`flex flex-col lg:grid lg:grid-cols-12 items-center px-6 py-8 lg:px-10 lg:py-6 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none border border-slate-100 lg:border-none shadow-sm lg:shadow-none hover:bg-slate-50 transition-all ${
                  index !== filtered.length - 1 ? "lg:border-b lg:border-slate-50" : ""
                }`}
              >
                {/* Name */}
                <div className="w-full lg:col-span-4 flex items-center gap-5 mb-6 lg:mb-0">
                  <div className="w-14 lg:w-11 h-14 lg:h-11 rounded-2xl lg:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xl lg:text-sm shadow-inner">
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

                {/* Email */}
                <p className="hidden lg:block col-span-4 text-sm text-slate-500 font-bold truncate pr-10">
                  {user.email}
                </p>

                {/* Role */}
                <div className="w-full flex items-center justify-between lg:col-span-2 mb-8 lg:mb-0 px-2 lg:px-0">
                  <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">Role</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${roleColors[user.userRole] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                    {user.userRole}
                  </span>
                </div>

                {/* Actions */}
                <div className="w-full flex lg:col-span-2 items-center justify-between lg:justify-end gap-3 pt-6 lg:pt-0 border-t lg:border-none border-slate-50 px-2 lg:px-0">
                  <span className="lg:hidden text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</span>
                  <div className="flex items-center gap-4">
                    <Link href={`/roles/admin/${user.userId}/edit`}>
                      <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all border-b border-transparent hover:border-indigo-600">
                        Edit
                      </button>
                    </Link>
                    {/* Hide delete for admin accounts */}
                    {user.userRole !== "admin" && (
                      <DeleteButton userId={user.userId} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}