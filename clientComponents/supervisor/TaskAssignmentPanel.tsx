"use client";
import { useState, useEffect, useRef } from "react";

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
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
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
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (showDropdown) {
      const timer = setTimeout(fetchWorkers, 200);
      return () => clearTimeout(timer);
    }
  }, [query, showDropdown]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
          placeholder="Search worker name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />

        {loading && (
          <div className="absolute right-4 top-4 animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl max-h-60 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 font-bold">
              No workers found
            </div>
          ) : (
            results.map((worker) => (
              <button
                key={worker.userId}
                type="button"
                onClick={() => {
                  onSelect(worker);
                  setQuery(worker.fullname);
                  setResults([]);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors flex flex-col"
              >
                <span className="font-bold text-slate-800">
                  {worker.fullname}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  {worker.userRole}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}