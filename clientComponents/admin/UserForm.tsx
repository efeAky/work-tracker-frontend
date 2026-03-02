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

      // Correctly define endpoint inside handleSubmit
      const endpoint =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/users/${formData.userId}`;

      // Create a unique numeric ID for new users
      const generatedNumericId = Math.floor(Date.now() / 1000);

      const payload = {
        ...formData,
        userId:
          mode === "create" ? generatedNumericId : Number(formData.userId),
        companyId: 1, // Matching your seeded Admin's companyId
      };
      console.log("Token from storage:", token);
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

      setMessage({ type: "success", text: "User registered successfully!" });
      setTimeout(() => router.push("/roles/admin"), 1500);
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
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-2xl rounded-4xl border border-slate-100">
      <h1 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">
        {mode === "create" ? "New Team Member" : "Edit Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        {mode === "create" && (
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Role
          </label>
          <select
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
            value={formData.userRole}
            onChange={(e) =>
              setFormData({ ...formData, userRole: e.target.value })
            }
          >
            <option value="worker">Worker</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:bg-slate-200"
        >
          {isLoading ? "Saving..." : "Confirm & Register"}
        </button>

        {message.text && (
          <div
            className={`p-4 rounded-2xl text-center font-bold text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
