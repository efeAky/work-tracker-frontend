"use client";

import { useState } from "react";
// Ensure this path matches where you just created the file
import WorkerSearch, {
  Worker,
} from "@/clientComponents/supervisor/WorkerSearch";

export default function SupervisorPage() {
  // --- STATE ---
  const [pivotDate, setPivotDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [targetWorker, setTargetWorker] = useState<Worker | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  // --- LOGIC: DATE MATH ---
  const getWeekDays = (date: Date) => {
    const tempDate = new Date(date);
    const day = tempDate.getDay();
    // Normalize to Monday as the start of the week
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(tempDate.setDate(diff));

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(pivotDate);

  const changeWeek = (direction: "next" | "prev") => {
    const newPivot = new Date(pivotDate);
    newPivot.setDate(pivotDate.getDate() + (direction === "next" ? 7 : -7));
    setPivotDate(newPivot);
  };

  const handleSendTask = async () => {
    // 1. Individual Validation Checks
    if (!selectedDate) {
      alert("Error: Please select a date from the calendar first.");
      return;
    }

    if (!targetWorker) {
      alert(
        "Error: No worker selected. Please search for and click a worker name.",
      );
      return;
    }

    if (!taskTitle || taskTitle.trim() === "") {
      alert("Error: The task needs a title before it can be sent.");
      return;
    }

    // 2. If all checks pass, proceed with the submission
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerId: targetWorker.userId,
            date: selectedDate.toISOString(),
            title: taskTitle.trim(),
            description: instructions,
            companyId: 1001, // Using your current company identifier
          }),
        },
      );

      if (response.ok) {
        alert(`Success: Task assigned to ${targetWorker.fullname}!`);

        // Clear inputs for the next task
        setTaskTitle("");
        setInstructions("");
        setTargetWorker(null);
      } else {
        const errorData = await response.json();
        alert(`Server Error: ${errorData.message || "Could not save task"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        "Network Error: Could not connect to the server. Check your backend status.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* TOP SECTION: TITLE & NAVIGATION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Supervisor
            </h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
              Assignment Portal
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <button
              onClick={() => changeWeek("prev")}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="px-6 text-sm font-black text-slate-800 min-w-[180px] text-center uppercase">
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
            <button
              onClick={() => changeWeek("next")}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* CALENDAR STRIP */}
        <div className="grid grid-cols-7 gap-3 md:gap-4 mb-12">
          {weekDays.map((date) => {
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl -translate-y-2"
                    : "bg-white border-transparent hover:border-slate-200 text-slate-600 shadow-sm"
                }`}
              >
                <span className="text-[10px] uppercase font-black mb-2 opacity-50 tracking-tighter">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-2xl font-black leading-none">
                  {date.getDate()}
                </span>
                {isToday && !isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3" />
                )}
              </button>
            );
          })}
        </div>

        {/* WORK PANEL */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100 transition-all">
          {!selectedDate ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="w-24 h-24 border-4 border-dashed border-slate-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 opacity-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold tracking-tight">
                Select a day to start assigning
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-slate-900">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                  Task Assignment
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* 1. WORKER SEARCH */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">
                    1. Choose a Worker
                  </h3>
                  <WorkerSearch
                    onSelect={(worker: Worker) => setTargetWorker(worker)}
                  />

                  {targetWorker && (
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-center gap-5 shadow-2xl shadow-slate-900/20 transform transition-transform hover:scale-[1.02]">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-black">
                        {targetWorker.fullname.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-xl leading-tight">
                          {targetWorker.fullname}
                        </p>
                        <p className="text-white/40 text-[10px] mt-1 uppercase font-black tracking-widest italic">
                          {targetWorker.role}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. TASK DETAILS */}
                <div className="space-y-8">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">
                    2. Task Parameters
                  </h3>
                  <div className="space-y-4">
                    <input
                      className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="High-level Task Title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 transition-all outline-none h-48 resize-none"
                      placeholder="Step-by-step instructions for the worker..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleSendTask}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] py-6 font-black text-xl shadow-2xl shadow-blue-200 disabled:opacity-10 disabled:grayscale transition-all transform active:scale-[0.98]"
                    disabled={!targetWorker || !taskTitle || loading}
                  >
                    {loading ? "Syncing..." : "Publish Task"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
