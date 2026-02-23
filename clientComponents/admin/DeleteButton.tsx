"use client";
import { useState } from "react";

type Props = { userId: number };

export default function DeleteButton({ userId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      // Refresh page after deletion
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 disabled:bg-gray-400"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}