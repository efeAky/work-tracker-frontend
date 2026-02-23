"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserFormProps = {
  mode: "create" | "edit";
  initialData?: {
    userId?: number;
    email?: string;
    fullname?: string;
    userRole?: string;
    companyId?: number;
  };
};

export default function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userId: initialData?.userId?.toString() || "",
    email: initialData?.email || "",
    fullname: initialData?.fullname || "",
    password: "",
    userRole: initialData?.userRole || "worker",
    companyId: initialData?.companyId?.toString() || "1",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const endpoint =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/users/${formData.userId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          userId: Number(formData.userId),
          companyId: Number(formData.companyId),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Operation failed");

      setMessage({
        type: "success",
        text:
          mode === "create"
            ? "User created successfully!"
            : "User updated successfully!",
      });

      setTimeout(() => router.push("/admin"), 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Operation failed";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "create" ? "Create New Account" : "Edit User"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="w-full p-2 border rounded mt-1"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temporary Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assign Role
          </label>
          <select
            className="w-full p-2 border rounded mt-1 bg-white"
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
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Register User"
            : "Update User"}
        </button>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}