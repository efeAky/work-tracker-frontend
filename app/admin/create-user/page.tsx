"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    fullname: "",
    password: "",
    userRole: "worker", // Default value
    companyId: "1", // Defaulting to 1 based on your seed script
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Required to pass the Admin's JWT cookie
          body: JSON.stringify({
            ...formData,
            userId: Number(formData.userId),
            companyId: Number(formData.companyId),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to create user");

      setMessage({ type: "success", text: "User created successfully!" });
      // Reset form or redirect
      setTimeout(() => router.push("/admin/create-user"), 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create user";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Account
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
          {isLoading ? "Creating..." : "Register User"}
        </button>

        {message.text && (
          <div
            className={`mt-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
