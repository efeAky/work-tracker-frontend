// app/admin/page.tsx
import UserTable from "@/clientComponents/admin/UserTable";
import { getLastUsers } from "@/helperFunctions/getLastUsers";

export default async function AdminPage() {
  const users = await getLastUsers(); // last 10 users

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserTable users={users} />
    </div>
  );
}