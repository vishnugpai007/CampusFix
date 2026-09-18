"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { FlowButton } from "./flow-button";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-[#0f1115] px-6 py-12 rounded-3xl border border-slate-800/60 my-6 shadow-2xl">
      <div
        className={`max-w-2xl text-center transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-6">
          <Wrench className="w-6 h-6 text-blue-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Track and report hostel maintenance issues seamlessly
        </h1>

        <p className="text-gray-400 text-base md:text-lg mb-8">
          Report issues, track repairs, and keep your hostel running smoothly — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register">
            <FlowButton text="Get Started" />
          </Link>
          <Link to="/login">
            <FlowButton text="Sign In" className="border-slate-700 text-slate-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
