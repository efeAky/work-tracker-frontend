import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Elevate Your Team’s{" "}
          <span className="text-indigo-600">Performance</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          Empower your leadership with real-time insights. Effortlessly track
          task completion and monitor time allocation for every team member in
          one centralized dashboard.
        </p>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 transition-all duration-200 text-lg"
          >
            Get Started
          </Link>

          <Link
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200 text-lg"
          >
            Learn More
          </Link>
        </div>

        {/* Subtle Decorative Element */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Trusted by forward-thinking managers
          </p>
        </div>
      </div>
    </div>
  );
}
