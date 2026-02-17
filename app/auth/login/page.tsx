import Login from "@/clientComponents/auth/Login"
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <div>
        <div>
          <h1>
            Login to your account
          </h1>
        </div>
        <Login />
      </div>
    </div>
  );
}