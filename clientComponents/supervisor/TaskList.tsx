"use client";

import { useEffect, useState } from "react";

type Task = {
  taskId: number;
  title: string;
  description: string;
  dueDate: string;
  status: "toDo" | "inProgress" | "done" | "failed";
  assigneeId: number;
  assignorId: number;
  assigneeName?: string;
};

const statusStyles: Record<string, string> = {
  toDo: "bg-slate-50 text-slate-500 border-slate-100",
  inProgress: "bg-blue-50 text-blue-600 border-blue-100",
  done: "bg-emerald-50 text-emerald-600 border-emerald-100",
  failed: "bg-red-50 text-red-500 border-red-100",
};

const statusLabels: Record<string, string> = {
  toDo: "Not Started Yet",
  inProgress: "In Progress",
  done: "Finished",
  failed: "Failed",
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks`, {
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
    fetchTasks();
  }, []);

  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesWorker =
      workerFilter === "" ||
      task.assigneeId.toString().includes(workerFilter) ||
      (task.assigneeName && task.assigneeName.toLowerCase().includes(workerFilter.toLowerCase()));
    const taskDate = new Date(task.dueDate);
    const matchesFrom = dateFrom === "" || taskDate >= new Date(dateFrom);
    const matchesTo = dateTo === "" || taskDate <= new Date(dateTo + "T23:59:59");
    return matchesStatus && matchesWorker && matchesFrom && matchesTo;
  });

  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    } catch (err) {
      console.error(err);
      alert("Could not delete task.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/tasks/${editingTask.taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          dueDate: editingTask.dueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      await fetchTasks();
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      alert("Could not update task.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Supervisor Portal</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Task Directory</h1>
        </div>
        <div className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {filtered.length} Results
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="all">Everywhere</option>
            <option value="toDo">Not Started Yet</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Finished</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
          <input
            type="text"
            placeholder="Name or ID..."
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found matching filters</p>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-0 lg:bg-white lg:rounded-[40px] lg:border lg:border-slate-100 lg:overflow-hidden lg:shadow-xl lg:shadow-slate-200/40">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-12 px-8 py-5 border-b border-slate-50 bg-slate-50/50">
            <p className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Task Information</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignee</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Deadline</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Situation</p>
            <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</p>
          </div>

          {/* List Entries */}
          <div className="space-y-4 lg:space-y-0">
            {filtered.map((task, index) => (
              <div
                key={task.taskId}
                className={`flex flex-col lg:grid lg:grid-cols-12 items-center px-6 py-6 lg:px-8 lg:py-6 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none border border-slate-100 lg:border-none shadow-sm lg:shadow-none hover:bg-slate-50 transition-colors ${
                  index !== filtered.length - 1 ? "lg:border-b lg:border-slate-50" : ""
                }`}
              >
                {/* Mobile: Title & Desc / Desktop: col-span-4 */}
                <div className="w-full lg:col-span-4 mb-4 lg:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <p className="font-extrabold text-slate-900 text-lg lg:text-sm">{task.title}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-500 lg:text-xs line-clamp-2 md:line-clamp-none pl-5">{task.description}</p>
                </div>

                {/* Mobile: Assignee Row / Desktop: col-span-2 */}
                <div className="w-full flex items-center justify-between lg:col-span-2 mb-4 lg:mb-0 lg:block px-5 lg:px-0">
                  <p className="lg:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest">Worker</p>
                  <div className="text-right lg:text-left">
                    <p className="text-sm font-black text-slate-900">{task.assigneeName || "Anonymous"}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {task.assigneeId}</p>
                  </div>
                </div>

                {/* Mobile: Deadline / Desktop: col-span-2 */}
                <div className="w-full flex items-center justify-between lg:col-span-2 mb-4 lg:mb-0 lg:text-center px-5 lg:px-0">
                  <p className="lg:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest">Deadline</p>
                  <p className="text-sm text-slate-600 font-black tracking-tight">
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>

                {/* Mobile: Status / Desktop: col-span-2 */}
                <div className="w-full flex items-center justify-between lg:col-span-2 mb-6 lg:mb-0 lg:text-center px-5 lg:px-0">
                  <p className="lg:hidden text-[9px] font-black uppercase text-slate-400 tracking-widest">Situation</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${statusStyles[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>

                {/* Actions */}
                <div className="w-full flex lg:col-span-2 items-center justify-between lg:justify-end gap-3 pt-5 lg:pt-0 border-t lg:border-none border-slate-50 px-5 lg:px-0">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="flex-1 lg:flex-none py-3 lg:py-0 bg-slate-50 lg:bg-transparent rounded-xl lg:rounded-none text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.taskId)}
                    className="flex-1 lg:flex-none py-3 lg:py-0 bg-red-50/50 lg:bg-transparent rounded-xl lg:rounded-none text-[11px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-lg p-8 sm:p-12 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Editing Entry</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Task Modification</h2>
              </div>
              <button onClick={() => setEditingTask(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">✕</button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-transparent rounded-[20px] px-6 py-4 text-slate-900 font-extrabold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Context / Details</label>
                <textarea
                  className="w-full bg-slate-50 border-transparent rounded-[20px] px-6 py-4 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none h-32 resize-none border border-slate-50"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-transparent rounded-[20px] px-6 py-4 text-slate-900 font-extrabold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50"
                    value={editingTask.dueDate.split("T")[0]}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Situation</label>
                  <select
                    className="w-full bg-slate-50 border-transparent rounded-[20px] px-6 py-4 text-slate-900 font-extrabold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 appearance-none"
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task["status"] })}
                  >
                    <option value="toDo">Not Started Yet</option>
                    <option value="inProgress">In Progress</option>
                    <option value="done">Finished</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-black shadow-xl shadow-slate-200 transition-all disabled:bg-slate-100 active:scale-[0.98]"
            >
              {saving ? "Processing..." : "Commit Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}