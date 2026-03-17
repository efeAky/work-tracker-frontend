"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserFormProps = {
  mode: "create" | "edit";
  initialData?: {
    userId?: string | number;
    email?: string;
    fullname?: string;
    userRole?: string;
  };
};

export default function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    userId: initialData?.userId ? Number(initialData.userId) : 0,
    email: initialData?.email || "",
    fullname: initialData?.fullname || "",
    password: "",
    userRole: initialData?.userRole || "worker",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const endpoint =
        mode === "create"
          ? `${apiUrl}/api/users/register`
          : `${apiUrl}/api/users/${formData.userId}`;

      const generatedNumericId = Math.floor(Date.now() / 1000);

      const payload: any =
        mode === "create"
          ? {
              ...formData,
              userId: generatedNumericId,
              companyId: 1,
            }
          : {
              userId: Number(formData.userId),
              email: formData.email,
              fullname: formData.fullname,
              userRole: formData.userRole,
              companyId: 1,
            };

      if (mode === "edit" && formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Operation failed");

      setMessage({
        type: "success",
        text: mode === "create" ? "Identity registered!" : "Identity updated!",
      });
      setTimeout(() => router.push("/roles/admin/users"), 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">User Registry System</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {mode === "create" ? "Identity Creation" : "Profile Revision"}
        </h1>
      </div>

      <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        {/* Subtle decorative background flair */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">
                Full Identity Name
              </label>
              <input
                type="text"
                placeholder="Ex. Marcus Aurelius"
                className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">
                Contact Address (Email)
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">
                {mode === "create" ? "Access Key (Password)" : "New Password (Optional)"}
              </label>
              <input
                type="password"
                placeholder={mode === "create" ? "••••••••••••" : "Leave blank to keep current"}
                className="w-full bg-slate-50 border-transparent rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none border border-slate-50 focus:border-indigo-200"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1">
                System Classification
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["worker", "supervisor"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, userRole: role })}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      formData.userRole === role
                        ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
            >
              {isLoading
                ? "Indexing..."
                : mode === "create"
                ? "Authorize Registration"
                : "Commit Updates"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              Cancel Operation
            </button>
          </div>

          {message.text && (
            <div
              className={`p-5 rounded-3xl text-center font-black uppercase tracking-widest text-[10px] animate-in slide-in-from-top-2 duration-300 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}