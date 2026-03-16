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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
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
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-2xl font-black text-slate-900">User not found</p>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={() => router.push("/roles/admin")}
            className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
          >
            ← Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto mb-6">
        <button
          onClick={() => router.push("/roles/admin")}
          className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2"
        >
          ← Back to Admin
        </button>
      </div>
      <UserForm mode="edit" initialData={user} />
    </div>
  );
}