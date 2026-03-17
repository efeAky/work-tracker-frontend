"use client";

import { useEffect, useState } from "react";

type EmployeeStats = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
  stats: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    lastTaskDate: string | null;
  };
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("last-task");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/employees/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const toggle = (userId: number) => {
    setExpandedId(expandedId === userId ? null : userId);
  };

  const filtered = employees
    .filter((emp) =>
      emp.fullname.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.fullname.localeCompare(b.fullname);
      if (sortBy === "most-tasks") return b.stats.total - a.stats.total;
      if (sortBy === "least-tasks") return a.stats.total - b.stats.total;
      if (sortBy === "most-failed") return b.stats.failed - a.stats.failed;
      if (sortBy === "last-task") {
        const dateA = a.stats.lastTaskDate ? new Date(a.stats.lastTaskDate).getTime() : 0;
        const dateB = b.stats.lastTaskDate ? new Date(b.stats.lastTaskDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "completion") {
        const rateA = a.stats.total > 0 ? a.stats.completed / a.stats.total : 0;
        const rateB = b.stats.total > 0 ? b.stats.completed / b.stats.total : 0;
        return rateB - rateA;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Supervisor</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workers</h1>
        </div>
        <span className="text-sm font-bold text-slate-400">
          {filtered.length} of {employees.length} worker{employees.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm appearance-none transition-all"
        >
          <option value="last-task">Recently Assigned</option>
          <option value="name">Sort: Name</option>
          <option value="most-tasks">Most Tasks</option>
          <option value="least-tasks">Least Tasks</option>
          <option value="completion">Completion Rate</option>
          <option value="most-failed">Most Failed</option>
        </select>
      </div>

      {/* Employee List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400 font-bold">No workers match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((emp) => {
            const isExpanded = expandedId === emp.userId;
            const completionRate =
              emp.stats.total > 0
                ? Math.round((emp.stats.completed / emp.stats.total) * 100)
                : 0;

            return (
              <div key={emp.userId} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggle(emp.userId)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                      {emp.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900">{emp.fullname}</p>
                      <p className="text-xs text-slate-400 font-medium">{emp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <span className="font-bold text-slate-500">
                        <span className="text-slate-900 font-black">{emp.stats.total}</span> tasks
                      </span>
                      <span className="font-bold text-emerald-600">{emp.stats.completed} done</span>
                      {emp.stats.failed > 0 && (
                        <span className="font-bold text-red-500">{emp.stats.failed} failed</span>
                      )}
                      <span className="font-bold text-slate-400">{completionRate}%</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-50">
                    <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatBox label="Total" value={emp.stats.total} color="bg-slate-50 text-slate-700" />
                      <StatBox label="Completed" value={emp.stats.completed} color="bg-emerald-50 text-emerald-700" />
                      <StatBox label="Pending" value={emp.stats.pending} color="bg-blue-50 text-blue-700" />
                      <StatBox label="Failed" value={emp.stats.failed} color="bg-red-50 text-red-600" />
                    </div>

                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        <span>Completion Rate</span>
                        <span>{completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {emp.stats.lastTaskDate && (
                      <p className="mt-4 text-xs text-slate-400 font-bold">
                        Last task:{" "}
                        <span className="text-slate-600">
                          {new Date(emp.stats.lastTaskDate).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}