import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserFromCookie() {
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
    return data.user; // Returns { id, email, role }
  } catch (error) {
    redirect("/auth/login");
  }
}