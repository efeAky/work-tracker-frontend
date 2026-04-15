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

type Worker = {
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
  const [targetWorker, setTargetWorker] = useState<Worker | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [workers, setWorkers] = useState<Worker[]>([]);
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
        const users = await res.json();

        setWorkers(users);

        const map: UserMap = {};
        users.forEach((u: Worker) => {
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
            className={`px-6 py-3 rounded-2xl text-[13px] font-black transition-all active:scale-95 shadow-lg ${
              showForm
                ? "bg-white text-slate-900 border border-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {showForm ? "✕ Close" : "+ Create Task"}
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={() => changeWeek("prev")} className="p-2">
              ◀
            </button>
            <div className="px-3 text-[10px] font-black uppercase text-slate-900 min-w-[150px] text-center">
              {weekDays[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              —{" "}
              {weekDays[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <button onClick={() => changeWeek("next")} className="p-2">
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white rounded-[32px] shadow-2xl p-6 sm:p-10 border">
          <h2 className="text-xl font-black text-center mb-8">New Task</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Worker dropdown */}
            <div>
              <label className="text-[10px] font-black uppercase text-indigo-500">
                Select Worker
              </label>

              <select
                className="w-full mt-2 bg-slate-50 rounded-[20px] px-5 py-4 text-sm font-extrabold border"
                value={targetWorker?.userId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const worker =
                    workers.find((w) => w.userId === id) || null;
                  setTargetWorker(worker);
                }}
              >
                <option value="">Select a worker...</option>
                {workers.map((w) => (
                  <option key={w.userId} value={w.userId}>
                    {w.fullname}
                  </option>
                ))}
              </select>

              {targetWorker && (
                <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl">
                  <p className="font-black">{targetWorker.fullname}</p>
                  <p className="text-xs opacity-50">{targetWorker.userRole}</p>
                </div>
              )}
            </div>

            {/* Task details */}
            <div className="space-y-3">
              <input
                className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-extrabold"
                placeholder="Task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />

              <textarea
                className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-bold h-24"
                placeholder="Instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />

              <input
                type="date"
                className="w-full bg-slate-50 rounded-[20px] px-5 py-4 font-extrabold"
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
                className="w-full bg-indigo-600 text-white rounded-[20px] py-4 font-black disabled:opacity-40"
              >
                {loading ? "Saving..." : "Assign Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Grid (unchanged logic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const isToday =
            new Date().toDateString() === date.toDateString();

          const dayTasks = getTasksForDate(date);

          return (
            <div key={date.toISOString()} className="border rounded-xl p-2">
              <div className="text-center font-black">
                {date.getDate()}
              </div>

              {dayTasks.map((task) => (
                <div key={task.taskId} className="p-2 border mt-2">
                  <p className="text-xs font-bold">
                    {userMap[task.assigneeId]}
                  </p>
                  <p className="text-sm font-extrabold">{task.title}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}