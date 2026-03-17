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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${apiUrl}/api/users/employees/stats`,
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
  }, [apiUrl]);

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
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Supervisor Portal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Worker Directory</h1>
        </div>
        <div className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest self-start sm:self-auto">
          {filtered.length} Active
        </div>
      </div>

      {/* Filters - Responsive Grid */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 outline-none shadow-sm transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none shadow-sm transition-all appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="last-task">Sort: Recent</option>
          <option value="name">Sort: A-Z</option>
          <option value="most-tasks">Most Tasks</option>
          <option value="least-tasks">Least Tasks</option>
          <option value="completion">Highest Rate</option>
          <option value="most-failed">Most Failed</option>
        </select>
      </div>

      {/* Employee List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((emp) => {
            const isExpanded = expandedId === emp.userId;
            const completionRate =
              emp.stats.total > 0
                ? Math.round((emp.stats.completed / emp.stats.total) * 100)
                : 0;

            return (
              <div key={emp.userId} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden">
                <button
                  onClick={() => toggle(emp.userId)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {emp.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">{emp.fullname}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest truncate">{emp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned</p>
                        <p className="text-sm font-black text-slate-900">{emp.stats.total}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ratio</p>
                        <p className="text-sm font-black text-indigo-600">{completionRate}%</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all ${isExpanded ? "rotate-180 bg-slate-900 text-white shadow-lg" : ""}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <StatBox label="Total" value={emp.stats.total} color="bg-slate-50 text-slate-700 border-slate-100" />
                      <StatBox label="Finished" value={emp.stats.completed} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
                      <StatBox label="Pending" value={emp.stats.pending} color="bg-blue-50 text-blue-700 border-blue-100" />
                      <StatBox label="Failed" value={emp.stats.failed} color="bg-red-50 text-red-600 border-red-100" />
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Completion Efficiency
                        </span>
                        <span>{completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 shadow-inner">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {emp.stats.lastTaskDate && (
                      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Data</p>
                        <p className="text-[11px] text-slate-600 font-bold">
                          Recently Active: <span className="text-slate-900 font-black">
                            {new Date(emp.stats.lastTaskDate).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
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
    <div className={`${color} rounded-2xl p-4 sm:p-5 border flex flex-col items-center sm:items-start`}>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-black">{value}</p>
    </div>
  );
}