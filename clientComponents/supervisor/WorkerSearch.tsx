"use client";
import { useState, useEffect } from "react";

export interface Worker {
  userId: number;
  fullname: string;
  userRole: string;
}

interface WorkerSearchProps {
  onSelect: (worker: Worker) => void;
}

export default function WorkerSearch({ onSelect }: WorkerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/search?q=${query}&role=worker`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 401) {
          console.error("Session expired or no token found.");
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchWorkers();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
          placeholder="Search worker name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-4 top-4 animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl max-h-60 overflow-y-auto p-2">
          {results.map((worker) => (
            <button
              key={worker.userId}
              type="button"
              onClick={() => {
                onSelect(worker);
                setQuery(worker.fullname);
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors flex flex-col"
            >
              <span className="font-bold text-slate-800">{worker.fullname}</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                {worker.userRole}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}