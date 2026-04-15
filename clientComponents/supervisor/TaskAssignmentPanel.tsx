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

type UserMap = Record<number, string>;

const statusLabel: Record<string, string> = {
  toDo: "To Do",
  inProgress: "In Progress",
  done: "Done",
  failed: "Failed",
};

const statusBorder: Record<string, string> = {
  toDo: "#cbd5e1",
  inProgress: "#6366f1",
  done: "#10b981",
  failed: "#ef4444",
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
  const [showForm, setShowForm] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getWeekDays = (date: Date) => {
    const temp = new Date(date);
    const day = temp.getDay();
    const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(temp.setDate(diff));

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
        const map: UserMap = {};

        users.forEach((u: any) => {
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
      (t) =>
        new Date(t.dueDate).toDateString() === date.toDateString()
    );

  const changeWeek = (dir: "next" | "prev") => {
    const newDate = new Date(pivotDate);
    newDate.setDate(pivotDate.getDate() + (dir === "next" ? 7 : -7));
    setPivotDate(newDate);
  };

  const handleSendTask = async () => {
    if (!selectedDate || !targetWorker || !taskTitle.trim()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/tasks/create`, {
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

      if (res.ok) {
        await fetchTasks();
        setTaskTitle("");
        setInstructions("");
        setTargetWorker(null);
        setSelectedDate(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
        >
          {showForm ? "Close" : "Create Task"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="p-6 bg-white rounded-2xl border space-y-4">

          {/* IMPORTANT FIX IS HERE */}
          <WorkerSearch
            onSelect={(worker) => setTargetWorker(worker)}
          />

          {targetWorker && (
            <div className="text-sm text-gray-600">
              Selected: <b>{targetWorker.fullname}</b>
            </div>
          )}

          <input
            className="w-full border p-2 rounded"
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded"
            value={
              selectedDate
                ? selectedDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedDate(
                e.target.value
                  ? new Date(e.target.value)
                  : null
              )
            }
          />

          <button
            onClick={handleSendTask}
            disabled={!targetWorker || !taskTitle || loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl"
          >
            {loading ? "Saving..." : "Assign Task"}
          </button>
        </div>
      )}

      {/* WEEK GRID */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const dayTasks = getTasksForDate(date);

          return (
            <div key={date.toISOString()} className="border p-2 rounded">
              <div className="text-xs font-bold mb-2">
                {date.toDateString()}
              </div>

              {dayTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="p-2 mb-2 border-l-4 bg-white"
                  style={{
                    borderLeftColor: statusBorder[task.status],
                  }}
                >
                  <div className="text-xs font-bold">
                    {userMap[task.assigneeId] || task.assigneeId}
                  </div>

                  <div className="text-sm">{task.title}</div>

                  <div className="text-[10px] text-gray-400">
                    {statusLabel[task.status]}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}