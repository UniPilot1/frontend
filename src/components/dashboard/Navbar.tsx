"use client";

import { Plane, Bell, Settings, User } from "lucide-react";
import { useStore } from "@/lib/store";

export function Navbar() {
  const { profile, matchingResult } = useStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 backdrop-blur-md"
      style={{ background: "rgba(7,7,15,0.85)" }}>
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Plane size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">UniPilot</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-medium ml-1">BETA</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {["Dashboard", "Universities", "Roadmap", "Essays", "Gap Analysis"].map((link, i) => (
            <a
              key={link}
              href="#"
              className={`text-xs transition-colors ${i === 1 ? "text-brand-400" : "text-white/40 hover:text-white/70"}`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 bg-white/[0.03] border border-white/6 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {matchingResult.totalMatched} matches found
          </div>
          <button className="relative p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors">
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
          </button>
          <button className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors">
            <Settings size={15} />
          </button>
          <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-semibold">
            {profile.name.split(" ").map(n => n[0]).join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
