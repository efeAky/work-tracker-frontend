"use client";

import { useState, useEffect } from "react";
import WorkerSearch, {
  Worker,
} from "@/clientComponents/supervisor/WorkerSearch";

type Task = {
  taskId: number;
  title: string;
  dueDate: string;
  status: "toDo" | "inProgress" | "done" | "failed";
  assigneeId: number;
  assigneeName?: string;
};

const statusBadge: Record<string, string> = {
  toDo: "bg-slate-100 text-slate-500",
  inProgress: "bg-blue-50 text-blue-600",
  done: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-500",
};

const statusLabel: Record<string, string> = {
  toDo: "Pending",
  inProgress: "In Progress",
  done: "Finished",
  failed: "Failed",
};

export default function TaskAssignmentPanel() {
  const [pivotDate, setPivotDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [targetWorker, setTargetWorker] = useState<Worker | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
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

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTasksForDate = (date: Date) =>
    tasks.filter(
      (t) => new Date(t.dueDate).toDateString() === date.toDateString()
    );

  const changeWeek = (direction: "next" | "prev") => {
    const newPivot = new Date(pivotDate);
    newPivot.setDate(pivotDate.getDate() + (direction === "next" ? 7 : -7));
    setPivotDate(newPivot);
  };

  const handleSendTask = async () => {
    if (!selectedDate) { alert("Please select a date."); return; }
    if (!targetWorker) { alert("Please select a worker."); return; }
    if (!taskTitle.trim()) { alert("Please enter a title."); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerId: targetWorker.userId,
          date: selectedDate.toISOString(),
          title: taskTitle.trim(),
          description: instructions,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setTaskTitle("");
        setInstructions("");
        setTargetWorker(null);
        setSelectedDate(null);
        setShowForm(false);
        alert(`Success! Task assigned.`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Supervisor Dashboard</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl text-[13px] font-black transition-all active:scale-95 shadow-lg ${
              showForm 
                ? "bg-white text-slate-900 border border-slate-200" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
            }`}
          >
            {showForm ? "✕ Close Form" : "+ Create New Task"}
          </button>

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
      </div>

      {/* Responsive Form */}
      {showForm && (
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 animate-in zoom-in-95 duration-300">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-slate-900 mb-8 text-center uppercase tracking-tighter">Assign New Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">1. Select Assignee</label>
                <WorkerSearch onSelect={(worker: Worker) => setTargetWorker(worker)} />
                {targetWorker && (
                  <div className="p-4 bg-slate-900 text-white rounded-[24px] flex items-center gap-4 shadow-xl shadow-slate-200 ring-4 ring-slate-50">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg font-black uppercase border border-white/10">
                      {targetWorker.fullname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black leading-tight tracking-tight">{targetWorker.fullname}</p>
                      <p className="text-white/40 text-[9px] mt-1 uppercase font-black tracking-widest">Worker Account</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">2. Task & Deadline</label>
                <div className="space-y-3">
                  <input
                    className="w-full bg-slate-50 border-transparent rounded-[20px] px-5 py-4 text-slate-900 font-extrabold text-sm placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                    placeholder="Brief objective..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full bg-slate-50 border-transparent rounded-[20px] px-5 py-4 text-slate-900 font-bold text-sm placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none h-24 resize-none border border-slate-50 focus:border-indigo-200"
                    placeholder="Details..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-transparent rounded-[20px] px-5 py-4 text-slate-900 font-extrabold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                    value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value + "T00:00:00") : null)}
                  />
                </div>
                <button
                  onClick={handleSendTask}
                  disabled={!targetWorker || !taskTitle || !selectedDate || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] py-4 font-black text-sm shadow-xl shadow-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-[0.98] mt-2"
                >
                  {loading ? "Publishing..." : "Assign Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Calendar Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={date.toISOString()}
              className={`rounded-[28px] border flex flex-col min-h-[300px] transition-all duration-300 ${
                isToday 
                  ? "border-indigo-500 ring-2 ring-indigo-50 bg-white" 
                  : "border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200"
              } shadow-sm overflow-hidden group`}
            >
              {/* Day Header - Optimized size */}
              <div className={`px-4 py-5 text-center border-b ${isToday ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-50"}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isToday ? "text-indigo-100" : "text-slate-400"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className="text-2xl font-black leading-none tracking-tighter">
                  {date.getDate()}
                </p>
              </div>

              {/* Day Tasks List */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center opacity-30">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">Free</p>
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="bg-white rounded-[18px] px-3 py-3 border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-slate-200"
                      style={{ borderLeftColor: task.status === 'done' ? '#10b981' : task.status === 'inProgress' ? '#6366f1' : '#cbd5e1' }}
                    >
                      <div className="space-y-3">
                        <div className="pb-2 border-b border-slate-50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Worker</p>
                          <p className="text-[10px] font-black text-slate-900 truncate">
                            {task.assigneeName || "Anonymous"}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Task</p>
                          <p className="text-[11px] font-extrabold text-slate-800 leading-tight line-clamp-2">
                            {task.title}
                          </p>
                        </div>

                        <div className="pt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border whitespace-nowrap inline-block max-w-full truncate ${statusBadge[task.status]}`}>
                            {statusLabel[task.status]}
                          </span>
                        </div>
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