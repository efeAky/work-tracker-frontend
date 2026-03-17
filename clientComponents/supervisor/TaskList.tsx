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
};

const statusStyles: Record<string, string> = {
  toDo: "bg-slate-100 text-slate-600",
  inProgress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  toDo: "To Do",
  inProgress: "In Progress",
  done: "Done",
  failed: "Failed",
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
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
      task.assigneeId.toString().includes(workerFilter);
    const taskDate = new Date(task.dueDate);
    const matchesFrom = dateFrom === "" || taskDate >= new Date(dateFrom);
    const matchesTo = dateTo === "" || taskDate <= new Date(dateTo + "T23:59:59");
    return matchesStatus && matchesWorker && matchesFrom && matchesTo;
  });

  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTask.taskId}`,
        {
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
        }
      );
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tasks</h1>
        </div>
        <span className="text-sm font-bold text-slate-400">
          {filtered.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm appearance-none transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="toDo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="text"
          placeholder="Filter by worker ID..."
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
        />

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
          placeholder="From"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
          placeholder="To"
        />
      </div>

      {/* Clear filters */}
      {(statusFilter !== "all" || workerFilter || dateFrom || dateTo) && (
        <button
          onClick={() => { setStatusFilter("all"); setWorkerFilter(""); setDateFrom(""); setDateTo(""); }}
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
        >
          ✕ Clear filters
        </button>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
          <p className="text-slate-400 font-bold">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-50">
            <p className="col-span-3 text-xs font-black uppercase tracking-widest text-slate-400">Title</p>
            <p className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-400">Worker ID</p>
            <p className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-400">Due Date</p>
            <p className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-400">Status</p>
            <p className="col-span-3 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</p>
          </div>

          {filtered.map((task, index) => (
            <div
              key={task.taskId}
              className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors ${
                index !== filtered.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <div className="col-span-3">
                <p className="font-bold text-slate-900 text-sm truncate">{task.title}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
              </div>
              <p className="col-span-2 text-sm text-slate-500 font-medium">#{task.assigneeId}</p>
              <p className="col-span-2 text-sm text-slate-500 font-medium">
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
              <div className="col-span-2">
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusStyles[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.taskId)}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all h-28 resize-none"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={editingTask.dueDate.split("T")[0]}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none"
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task["status"] })}
                >
                  <option value="toDo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-base hover:bg-black transition-all disabled:bg-slate-200 active:scale-[0.98]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}