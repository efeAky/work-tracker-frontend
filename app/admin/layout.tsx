import { getUserFromCookie } from "@/helperFunctions/getUserFromCookie";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie(["admin"]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-8 items-center">
            <h1 className="font-bold text-xl text-indigo-600">Admin Panel</h1>
            <nav className="flex gap-4 text-sm text-gray-500">
              <a
                href="/admin/create-user"
                className="hover:text-indigo-600 font-medium border-b-2 border-indigo-600"
              >
                Create User
              </a>
            </nav>
          </div>
          <p className="text-gray-600 text-sm">
            Logged in as: <span className="font-semibold">{user.fullname}</span>
          </p>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}
