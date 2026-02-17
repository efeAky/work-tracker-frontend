import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserFromCookie(allowedRoles?: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // If no token, redirect to login
  if (!token) {
    redirect("/auth/login");
  }

  try {
    // Verify token with backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
      {
        headers: {
          Cookie: `token=${token.value}`,
        },
        cache: "no-store", // Don't cache auth checks
      }
    );

    if (!response.ok) {
      redirect("/auth/login");
    }

    const data = await response.json();
    const user = data.user; // Returns { userId, email, userRole, companyId, fullname }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.userRole)) {
      // Redirect based on their actual role
      if (user.userRole === "admin") {
        redirect("/admin/dashboard");
      } else if (user.userRole === "supervisor") {
        redirect("/supervisor/dashboard");
      } else if (user.userRole === "worker") {
        redirect("/worker/dashboard");
      } else {
        redirect("/auth/login"); // Fallback
      }
    }

    return user;
  } catch (error) {
    redirect("/auth/login");
  }
}