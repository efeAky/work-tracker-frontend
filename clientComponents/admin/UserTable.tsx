"use client";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

type User = {
  userId: number;
  fullname: string;
  email: string;
  userRole: string;
  companyId: number;
};

type Props = { users: User[] };

export default function UserTable({ users }: Props) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link href="/admin/create">
          <button className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
            + Create User
          </button>
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.userId}>
              <td className="border p-2">{user.fullname}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.userRole}</td>
              <td className="border p-2 space-x-2">
                <Link href={`/admin/${user.userId}/edit`}>
                  <button className="bg-yellow-400 text-white py-1 px-2 rounded hover:bg-yellow-500">
                    Edit
                  </button>
                </Link>
                <DeleteButton userId={user.userId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}