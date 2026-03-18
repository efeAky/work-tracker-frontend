"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen sm:h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Header/Nav — brand only, no buttons */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center shrink-0">
        <div className="text-lg sm:text-xl font-black tracking-tighter text-slate-900">
          Work<span className="text-indigo-600">Tracker</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 text-center py-10">
        <div className="inline-block px-3 py-1 mb-4 sm:mb-6 bg-indigo-50 text-indigo-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500">
          Team Management Reimagined
        </div>

        <h1 className="text-[32px] sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          Streamline your workflow.<br />
          <span className="text-indigo-600">Empower your team.</span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-lg text-slate-500 font-bold leading-relaxed mb-8 sm:mb-10 animate-in fade-in duration-1000 delay-200">
          The central hub for task assignments and real-time visibility.
          Keep your projects moving and your team synchronized effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
          >
            Log In
          </Link>
          <button
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all text-sm sm:text-base"
          >
            Watch Overview
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 sm:py-8 text-center shrink-0">
        <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
          WorkTracker © 2026 • Professional Productivity
        </p>
      </footer>
    </div>
  );
}