"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!emailInput || !passwordInput) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: emailInput, password: passwordInput }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user && data.token) {
        // ✅ set cookie on port 3000 so Next.js server components can read it
        document.cookie = `token=${data.token}; path=/; max-age=${10 * 60 * 60}`;
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.userRole === "admin") {
          router.push("/roles/admin");
        } else if (data.user.userRole === "supervisor") {
          router.push("/roles/supervisor");
        } else if (data.user.userRole === "worker") {
          router.push("/roles/worker");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          disabled={isLoading}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        {error && !isLoading && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </form>
    </div>
  );
}
