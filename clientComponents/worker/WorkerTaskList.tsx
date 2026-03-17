"use client";

import { useEffect, useState } from "react";

type Task = {
  taskId: number;
  title: string;
  description: string;
  dueDate: string;
  status: "toDo" | "inProgress" | "done" | "failed";
  assignorName: string;
};

const statusStyles = {
  toDo: "bg-slate-50 text-slate-500 border-slate-100",
  inProgress: "bg-indigo-50 text-indigo-600 border-indigo-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-100",
  failed: "bg-red-50 text-red-700 border-red-100",
};

const statusLabels = {
  toDo: "Not Started Yet",
  inProgress: "In Progress",
  done: "Finished",
  failed: "Failed",
};

export default function WorkerTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchMyTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: Task["status"]) => {
    setUpdating(taskId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?.taskId === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
      alert("Could not update situation.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2 sm:px-0">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Worker Assignment Area</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">My Tasks</h1>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-4 py-2 bg-indigo-600 rounded-xl text-center shadow-lg shadow-indigo-100">
            <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-1">Pending</p>
            <p className="text-xl font-black text-white">{tasks.filter(t => t.status !== 'done' && t.status !== 'failed').length}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
            <p className="text-xl font-black text-slate-900">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-100 p-16 sm:p-32 text-center shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm rotate-3 group-hover:rotate-0 transition-transform">✨</div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Mission Accomplished!</h2>
          <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm leading-relaxed">Your queue is currently empty. Excellent work keeping things organized!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-2 sm:px-0">
          {tasks.map((task) => {
            const date = new Date(task.dueDate);
            const isOverdue = date < new Date() && task.status !== "done";

            return (
              <button
                key={task.taskId}
                onClick={() => setSelectedTask(task)}
                className="group relative bg-white rounded-[40px] border border-slate-100 p-8 text-left hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusStyles[task.status]}`}>
                    {statusLabels[task.status]}
                  </div>
                  {isOverdue && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Critical Delay</span>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight mb-2">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructed By</p>
                    <span className="text-xs font-black text-slate-600 underline decoration-indigo-200 decoration-2 underline-offset-4">{task.assignorName || "System Admin"}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-10 h-10 leading-relaxed">{task.description}</p>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black uppercase shadow-lg shadow-slate-200 ring-4 ring-slate-50">
                      {task.assignorName?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Supervisor</p>
                      <p className="text-xs font-black text-slate-900 tracking-tight">{task.assignorName || "System Admin"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Date</p>
                    <p className="text-sm font-black text-indigo-600 tracking-tighter">
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Responsive Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-10 overflow-y-auto">
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-400 relative">
            <div className="p-8 sm:p-16 space-y-10">
              <div className="flex justify-between items-center">
                <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusStyles[selectedTask.status]}`}>
                  {statusLabels[selectedTask.status]}
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                  {selectedTask.title}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-y border-slate-50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center text-xl font-black uppercase shadow-xl shadow-slate-200">
                      {selectedTask.assignorName?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Direct Supervisor</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">{selectedTask.assignorName || "System Admin"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[20px] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-indigo-50/50">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Submission By</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                        {new Date(selectedTask.dueDate).toLocaleDateString("en-US", { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Objective Context</p>
                <div className="bg-slate-50 rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-inner">
                  <p className="text-slate-700 font-bold text-base leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Update Task Situation</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {(["toDo", "inProgress", "done", "failed"] as const).map((s) => (
                    <button
                      key={s}
                      disabled={updating !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(selectedTask.taskId, s);
                      }}
                      className={`py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all border-2 relative overflow-hidden ${
                        selectedTask.status === s
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-300"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      } active:scale-[0.97] disabled:opacity-50`}
                    >
                      {updating === selectedTask.taskId && selectedTask.status !== s ? (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin mx-auto" />
                      ) : (
                        statusLabels[s]
                      )}
                      
                      {selectedTask.status === s && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="w-full bg-slate-50 text-slate-400 rounded-3xl py-6 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
              >
                Close Task View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
