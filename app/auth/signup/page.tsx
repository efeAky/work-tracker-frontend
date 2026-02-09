import Signup from "@/clientComponents/auth/Signup"
import Link from "next/link";

export default function SignupPage() {
  return (
    <div>
      <div>
        <div>
          <h1>
            Create your account
          </h1>
        </div>
        <Signup />
        <p>
          Already have an account?{" "}
          <Link 
            href="/auth/login" 
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}