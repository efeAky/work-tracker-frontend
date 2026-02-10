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

    try {
      // Note: This relies on the Next.js rewrite we discussed to proxy to Port 5000
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save JWT Token for authenticated requests
      localStorage.setItem("token", data.token);

      // Save user info (optional, but helpful for UI)
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setIsLoading(true);
    // Redirecting directly to the backend OAuth URL
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
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

/* "use client";

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
} */
