"use client";

import { useState, useEffect } from "react";

type Task = {
  taskId: number;
  title: string;
  dueDate: string;
  status: "toDo" | "inProgress" | "done" | "failed";
  assigneeId: number;
  assignorName?: string;
  description: string;
};

const statusBadge: Record<string, string> = {
  toDo: "bg-slate-100 text-slate-500",
  inProgress: "bg-blue-50 text-blue-600",
  done: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-500",
};

const statusLabel: Record<string, string> = {
  toDo: "To Do",
  inProgress: "In Progress",
  done: "Done",
  failed: "Failed",
};

export default function WorkerDashboard() {
  const [pivotDate, setPivotDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workerName, setWorkerName] = useState("");
  const [workerId, setWorkerId] = useState<number | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getWeekDays = (date: Date) => {
    const tempDate = new Date(date);
    const day = tempDate.getDay();
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(tempDate.setDate(diff));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(pivotDate);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setWorkerName(payload.fullname || "Worker");
      setWorkerId(payload.userId);
    }
  }, []);

  useEffect(() => {
    if (workerId === null) return;
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/tasks/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setTasks(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [workerId, apiUrl]);

  const getTasksForDate = (date: Date) =>
    tasks.filter(
      (t) => new Date(t.dueDate).toDateString() === date.toDateString()
    );

  const changeWeek = (direction: "next" | "prev") => {
    const newPivot = new Date(pivotDate);
    newPivot.setDate(pivotDate.getDate() + (direction === "next" ? 7 : -7));
    setPivotDate(newPivot);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Worker</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hi, {workerName.split(" ")[0]} 👋
          </h1>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          <button onClick={() => changeWeek("prev")} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="px-3 text-[10px] font-black text-slate-900 min-w-[150px] text-center uppercase tracking-widest">
            {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" — "}
            {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
          <button onClick={() => changeWeek("next")} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={date.toISOString()}
              className={`rounded-[28px] border flex flex-col transition-all duration-300 ${
                isToday
                  ? "border-indigo-500 ring-2 ring-indigo-50 bg-white"
                  : "border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200"
              } shadow-sm overflow-hidden`}
            >
              {/* Day Header */}
              <div className={`px-4 py-4 text-center border-b ${isToday ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-50"}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isToday ? "text-indigo-100" : "text-slate-400"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className="text-2xl font-black leading-none tracking-tighter">
                  {date.getDate()}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 p-2 flex-1 min-h-[160px]">
                {dayTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center opacity-30">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">No Task</p>
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="bg-white rounded-[18px] px-3 py-3 border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4"
                      style={{
                        borderLeftColor:
                          task.status === "done" ? "#10b981" :
                          task.status === "inProgress" ? "#6366f1" :
                          task.status === "failed" ? "#ef4444" : "#cbd5e1",
                      }}
                    >
                      <div className="space-y-2">
                        {/* Assigner */}
                        <div className="pb-1.5 border-b border-slate-50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">From</p>
                          <p className="text-[10px] font-black text-indigo-600 truncate">
                            {task.assignorName || "Supervisor"}
                          </p>
                        </div>

                        {/* Title */}
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Task</p>
                          <p className="text-[11px] font-extrabold text-slate-800 leading-tight line-clamp-2">
                            {task.title}
                          </p>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[9px] text-slate-400 font-medium line-clamp-2 pb-1 border-b border-slate-50">
                            {task.description}
                          </p>
                        )}

                        {/* Status */}
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${statusBadge[task.status]}`}>
                          {statusLabel[task.status]}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}