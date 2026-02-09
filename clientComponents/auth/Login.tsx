"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!usernameInput || !passwordInput) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      window.location.href = "/api/auth/google";
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Enter username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={passwordInput}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>

        {error && !isLoading && (
          <div>
            {error}
          </div>
        )}
      </form>

      <div>
        <span>or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        Log in with Google
      </button>
    </div>
  );
}