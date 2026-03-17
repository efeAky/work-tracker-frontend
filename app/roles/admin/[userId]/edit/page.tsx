"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserForm from "@/clientComponents/admin/UserForm";

type User = {
  userId: string | number;
  email: string;
  fullname: string;
  userRole: string;
};

export default function EditUserPage() {
  const { userId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${apiUrl}/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, apiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center shadow-xl shadow-slate-200/40 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Identity Not Found</h2>
          <p className="text-slate-400 font-bold mb-8">{error || "The requested user ID does not exist in the registry."}</p>
          <button
            onClick={() => router.push("/roles/admin/users")}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-10 animate-in fade-in duration-700">
      <div className="max-w-xl mx-auto mb-8">
        <button
          onClick={() => router.push("/roles/admin/users")}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            ←
          </div>
          Back to Registry
        </button>
      </div>
      
      <div className="animate-in slide-in-from-bottom-6 duration-700 delay-100">
        <UserForm mode="edit" initialData={user} />
      </div>
    </div>
  );
}