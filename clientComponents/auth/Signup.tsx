"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("worker"); // Default to worker
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Check if all required fields are filled
    if (
      !fullNameInput ||
      !emailInput ||
      !passwordInput ||
      !confirmPasswordInput
    ) {
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

    // Validate password length (minimum 8 characters)
    if (passwordInput.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Password match check
    if (passwordInput !== confirmPasswordInput) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Send signup request to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullNameInput,
            email: emailInput,
            password: passwordInput,
            confirmPassword: confirmPasswordInput, // Send confirmPassword to backend for validation
            role: roleInput, // Sending 'worker' or 'supervisor'
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to login after successful registration
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          placeholder="Full Name"
          value={fullNameInput}
          onChange={(e) => setFullNameInput(e.target.value)}
          disabled={isLoading}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          disabled={isLoading}
          required
        />

        <div className="role-selection flex flex-col gap-1">
          <label className="text-sm font-semibold">I am a:</label>
          <select
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            className="p-2 border rounded"
            disabled={isLoading}
          >
            <option value="worker">Worker (Tracking tasks)</option>
            <option value="supervisor">Supervisor (Managing team)</option>
          </select>
        </div>

        <input
          type="password"
          placeholder="Password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          disabled={isLoading}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPasswordInput}
          onChange={(e) => setConfirmPasswordInput(e.target.value)}
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        {error && !isLoading && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </form>

      <div className="divider my-4 flex items-center gap-2">
        <hr className="grow" /> <span>or sign up with</span>{" "}
        <hr className="grow" />
      </div>

      <div className="social-logins flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          className="bg-white border border-gray-300 text-black p-2 rounded hover:bg-gray-50"
        >
          Sign up with Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
          className="bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Sign up with GitHub
        </button>
      </div>
    </div>
  );
}