import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <h1>Elevate Your Team's Performance</h1>
      <p>Empower your leadership with real-time insights.
        Effortlessly track task completion and monitor time
        allocation for every team member in one centralized dashboard.
      </p>
        <div>
          <Link href="/auth/login">
            Login
          </Link>
        </div>
      </div>
  );
}