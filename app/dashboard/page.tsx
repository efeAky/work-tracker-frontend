import { getUserFromCookie } from "@/helperFunctions/getUserFromCookie";

export default async function DashboardPage() {
  const user = await getUserFromCookie();

  return (
    <div className="max-w-[960px] w-full mx-auto p-8">
      <div className="flex flex-col gap-8 items-center text-center">
        <div className="flex flex-col gap-6 max-w-[700px] w-full">
          <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.04em]">
            Welcome to Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed opacity-90">
            Hello, {user.email}!
          </p>
        </div>

        <div className="w-full max-w-[600px] border-2 border-slate-300 dark:border-slate-700 rounded-lg p-6 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-4">
            User Information
          </h3>
          <div className="flex flex-col gap-3 text-left">
            <p className="text-slate-900 dark:text-white text-lg">
              <span className="text-2xl mr-2">📧</span>
              Email: {user.email}
            </p>
            <p className="text-slate-900 dark:text-white text-lg">
              <span className="text-2xl mr-2">👤</span>
              Role: {user.role}
            </p>
            <p className="text-slate-900 dark:text-white text-lg">
              <span className="text-2xl mr-2">🆔</span>
              User ID: {user.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}