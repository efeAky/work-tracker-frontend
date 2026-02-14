"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Save the JWT to localStorage
      localStorage.setItem("token", token);

      // 2. Redirect to the main dashboard or home
      // Replace "/dashboard" with whatever your main app route is
      router.push("/dashboard");
    } else {
      // If no token is found, something went wrong, send them back to login
      router.push("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we sync your account.</p>
      </div>
    </div>
  );
}

// Next.js requires Suspense for useSearchParams() in client components
export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccessHandler />
    </Suspense>
  );
}
