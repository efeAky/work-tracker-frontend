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
};

const statusDot: Record<string, string> = {
  toDo: "bg-slate-300",
  inProgress: "bg-blue-500",
  done: "bg-emerald-500",
  failed: "bg-red-500",
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
  const [showForm, setShowForm] = useState(false);

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
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setTasks(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
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
    if (!selectedDate) { alert("Please select a date first."); return; }
    if (!targetWorker) { alert("Please select a worker."); return; }
    if (!taskTitle.trim()) { alert("Please enter a task title."); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/create`,
        {
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
        }
      );

      if (response.ok) {
        const newTaskData = await response.json();
        setTasks((prev) => [...prev, newTaskData.task]);
        setTaskTitle("");
        setInstructions("");
        setTargetWorker(null);
        setSelectedDate(null);
        setShowForm(false);
        alert(`Task assigned to ${targetWorker.fullname}!`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Could not save task");
      }
    } catch (error) {
      alert("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Supervisor</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all active:scale-95"
          >
            {showForm ? "✕ Cancel" : "+ Create Task"}
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <button onClick={() => changeWeek("prev")} className="p-1.5 hover:bg-slate-50 rounded-xl transition-all">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="px-4 text-xs font-black text-slate-800 min-w-[160px] text-center uppercase">
              {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" — "}
              {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <button onClick={() => changeWeek("next")} className="p-1.5 hover:bg-slate-50 rounded-xl transition-all">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-black text-slate-900 mb-6">New Task</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">1. Choose a Worker</p>
              <WorkerSearch onSelect={(worker: Worker) => setTargetWorker(worker)} />
              {targetWorker && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black">
                    {targetWorker.fullname.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black leading-tight">{targetWorker.fullname}</p>
                    <p className="text-white/40 text-[10px] mt-0.5 uppercase font-black tracking-widest">{targetWorker.userRole}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">2. Task Details</p>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="Task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <textarea
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none h-28 resize-none"
                placeholder="Instructions..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">3. Date</p>
                <input
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value + "T00:00:00") : null)}
                />
              </div>
              <button
                onClick={handleSendTask}
                disabled={!targetWorker || !taskTitle || !selectedDate || loading}
                className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-4 font-black text-base shadow-xl disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-[0.98]"
              >
                {loading ? "Saving..." : "Publish Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((date) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const dayTasks = getTasksForDate(date);

          return (
            <div
              key={date.toISOString()}
              className={`rounded-3xl border overflow-hidden flex flex-col min-h-[300px] ${
                isToday ? "border-slate-900" : "border-slate-100"
              } bg-white shadow-sm`}
            >
              {/* Day Header */}
              <div className={`px-3 py-4 text-center ${isToday ? "bg-slate-900" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? "text-white/50" : "text-slate-400"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className={`text-2xl font-black leading-none ${isToday ? "text-white" : "text-slate-900"}`}>
                  {date.getDate()}
                </p>
                {dayTasks.length > 0 && (
                  <p className={`text-[9px] font-black mt-1 ${isToday ? "text-white/40" : "text-slate-400"}`}>
                    {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-slate-300 font-bold">Empty</p>
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="bg-slate-50 rounded-2xl px-3 py-2.5 border border-slate-100"
                    >
                      <p className="text-xs font-black text-slate-900 leading-snug line-clamp-2 mb-1.5">
                        {task.title}
                      </p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusBadge[task.status]}`}>
                        {statusLabel[task.status]}
                      </span>
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