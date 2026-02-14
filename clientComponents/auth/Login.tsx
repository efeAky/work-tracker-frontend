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

    // Check if all required fields are filled
    if (!emailInput || !passwordInput) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      // Send login request with credentials to receive cookie
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // IMPORTANT: This allows cookies to be sent and received
          body: JSON.stringify({
            email: emailInput,
            password: passwordInput,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Cookie is automatically stored by browser (no localStorage needed for token!)
      // Only save user info for UI purposes (optional)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setIsLoading(true);
    // Redirecting directly to the backend OAuth URL
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
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

      <div className="divider my-4 flex items-center gap-2">
        <hr className="grow" /> <span>or</span> <hr className="grow" />
      </div>

      <div className="social-logins flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          className="bg-white border border-gray-300 text-black p-2 rounded hover:bg-gray-50"
        >
          Log in with Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
          className="bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Log in with GitHub
        </button>
      </div>
    </div>
  );
}