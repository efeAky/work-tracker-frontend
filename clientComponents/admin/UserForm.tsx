"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type UserFormProps = {
  mode: "create" | "edit";
  initialData?: {
    userId?: string | number; // Updated to accept both for flexibility
    email?: string;
    fullname?: string;
    userRole?: string;
  };
};

export default function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();

  // Initialize state
  const [formData, setFormData] = useState({
    userId: initialData?.userId?.toString() || "",
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

      if (!token) {
        setMessage({
          type: "error",
          text: "You are not logged in. Please log in again.",
        });
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }
      // 1. Generate ID if creating, use existing if editing
      const finalUserId = mode === "create" ? uuidv4() : formData.userId;

      // 2. Build the payload
      const payload = {
        ...formData,
        userId: finalUserId,
      };

      const endpoint =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/users/${formData.userId}`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage({
        type: "success",
        text:
          mode === "create"
            ? `User created! ID: ${finalUserId.slice(0, 8)}`
            : "User updated successfully!",
      });

      // Redirect after success
      setTimeout(() => router.push("/roles/admin"), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
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
        {/* FULL NAME */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1 text-black focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="w-full p-2 border rounded mt-1 text-black focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        {/* PASSWORD (Only shown in create mode) */}
        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temporary Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1 text-black focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
        )}

        {/* ROLE SELECT */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assign Role
          </label>
          <select
            className="w-full p-2 border rounded mt-1 bg-white text-black focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.userRole}
            onChange={(e) =>
              setFormData({ ...formData, userRole: e.target.value })
            }
          >
            <option value="worker">Worker</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition-colors shadow-md"
        >
          {isLoading
            ? "Processing..."
            : mode === "create"
              ? "Register User"
              : "Update User"}
        </button>

        {/* FEEDBACK MESSAGE */}
        {message.text && (
          <div
            className={`mt-4 p-3 rounded text-sm font-medium border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
