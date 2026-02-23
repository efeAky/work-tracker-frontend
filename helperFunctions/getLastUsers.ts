// helpers/getLastUsers.ts
import { cookies } from "next/headers";

export type User = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
  companyId: number;
  createdAt: string;
};

export async function getLastUsers(limit = 10): Promise<User[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.warn("getLastUsers: No auth token found in cookies");
      return [];
    }

    const res = await fetch(`http://localhost:5000/api/users/last/${limit}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("getLastUsers: Fetch failed —", res.status, text);
      return [];
    }

    const users: User[] = await res.json();
    return users;
  } catch (err) {
    console.error("getLastUsers: Unexpected error —", err);
    return [];
  }
}
