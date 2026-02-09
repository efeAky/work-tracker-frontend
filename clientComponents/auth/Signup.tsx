"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError("");
    setIsLoading(true);

    if (!usernameInput || !passwordInput || !confirmPasswordInput) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordInput.length < 8) {
      setError("Password must contain minimum 8 characters");
      setIsLoading(false);
      return;
    } 
    else if (!/[A-Z]/.test(passwordInput)) {
      setError("Password must contain at least one uppercase letter");
      setIsLoading(false);
      return;
    } 
    else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(passwordInput)) {
      setError("Password must contain at least one special character");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
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
        throw new Error(data.error || "Signup failed");
      }

      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      <form onSubmit={handleSignup}>
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
          onChange={(e) => setPasswordInput(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPasswordInput}
          onChange={(e) => setConfirmPasswordInput(e.target.value)}
          disabled={isLoading}
        />

        <button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
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
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        Sign up with Google
      </button>
    </div>
  );
}