"use client";

import WorkerTaskList from "@/clientComponents/worker/WorkerTaskList";

export default function WorkerTasksPage() {
  return (
    <main className="p-6 sm:p-10 lg:p-16 bg-[#fafafa] min-h-screen">
      <WorkerTaskList />
    </main>
  );
}
