"use client";

import { useState, useEffect } from "react";

type Task = {
  taskId: number;
  title: string;
  dueDate: string;
  status: "toDo" | "inProgress" | "done" | "failed";
  assigneeId: number;
};

type UserMap = Record<number, string>;

type User = {
  userId: number;
  fullname: string;
  userRole: string;
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

export default function TaskAssignmentPanel() {
  const [pivotDate, setPivotDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [targetWorker, setTargetWorker] = useState<User | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const usersData = await res.json();
        setUsers(usersData);

        const map: UserMap = {};
        usersData.forEach((u: User) => {
          map[u.userId] = u.fullname;
        });
        setUserMap(map);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
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
    if (!selectedDate) return alert("Please select a date.");
    if (!targetWorker) return alert("Please select a worker.");
    if (!taskTitle.trim()) return alert("Please enter a title.");

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
        alert("Task assigned!");
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
            Supervisor
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
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
            {showForm ? "✕ Close" : "+ Create Task"}
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 animate-in zoom-in-95 duration-300">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-slate-900 mb-8 text-center uppercase tracking-tighter">
              New Task
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Worker Dropdown */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">
                  1. Select Worker
                </label>

                <select
                  className="w-full bg-slate-50 border-transparent rounded-[20px] px-5 py-4 text-slate-900 font-extrabold text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                  value={targetWorker?.userId || ""}
                  onChange={(e) => {
                    const selected = users.find(
                      (u) => u.userId === Number(e.target.value)
                    );
                    setTargetWorker(selected || null);
                  }}
                >
                  <option value="">Select worker...</option>
                  {users
                    .filter((u) => u.userRole === "worker")
                    .map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.fullname}
                      </option>
                    ))}
                </select>

                {targetWorker && (
                  <div className="p-4 bg-slate-900 text-white rounded-[24px] flex items-center gap-4 shadow-xl">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black">
                      {targetWorker.fullname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black">
                        {targetWorker.fullname}
                      </p>
                      <p className="text-white/40 text-[9px] uppercase font-black">
                        {targetWorker.userRole}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Details */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">
                  2. Task Details
                </label>

                <input
                  className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-extrabold text-sm"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />

                <textarea
                  className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-bold text-sm h-24 resize-none"
                  placeholder="Instructions..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />

                <input
                  type="date"
                  className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-extrabold text-sm"
                  value={
                    selectedDate
                      ? selectedDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                        ? new Date(e.target.value + "T00:00:00")
                        : null
                    )
                  }
                />

                <button
                  onClick={handleSendTask}
                  disabled={!targetWorker || !taskTitle || !selectedDate || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] py-4 font-black text-sm"
                >
                  {loading ? "Saving..." : "Assign Task"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}