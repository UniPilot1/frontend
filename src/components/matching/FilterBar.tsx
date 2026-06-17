"use client";

import { Search, Globe, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { MatchTier } from "@/types";
import { TIER_CONFIG, cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const TIERS: (MatchTier | "All")[] = ["All", "Reach", "Target", "Likely"];
const COUNTRIES = ["All", "United States", "United Kingdom", "Canada", "Singapore", "Germany"];

export function FilterBar() {
  const {
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    countryFilter, setCountryFilter,
    matchingResult,
  } = useStore();

  const counts: Record<string, number> = {
    All:    matchingResult.totalMatched,
    Reach:  matchingResult.reach.length,
    Target: matchingResult.target.length,
    Likely: matchingResult.likely.length,
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* AI insight strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-3.5 rounded-xl bg-brand-500/8 border border-brand-500/20"
      >
        <Sparkles size={14} className="text-brand-400 mt-0.5 shrink-0" />
        <p className="text-xs text-white/55 leading-relaxed">{matchingResult.aiInsight}</p>
      </motion.div>

      {/* Controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="Search universities…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/8 text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500/50 transition-colors"
          />
        </div>

        {/* Tier filter pills */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/6">
          {TIERS.map(t => {
            const active = activeFilter === t;
            const cfg    = t !== "All" ? TIER_CONFIG[t] : null;
            return (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/65"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tier-pill"
                    className="absolute inset-0 rounded-lg bg-brand-500/20 border border-brand-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {cfg && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  )}
                  {t}
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    active ? "bg-white/15 text-white" : "bg-white/5 text-white/30"
                  )}>
                    {counts[t]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Country filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/6">
          <Globe size={12} className="text-white/30" />
          <select
            className="bg-transparent text-xs text-white/50 outline-none cursor-pointer"
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
          >
            {COUNTRIES.map(c => (
              <option key={c} value={c} className="bg-surface-2">{c}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <SlidersHorizontal size={11} />
          <span>{matchingResult.totalMatched} matches</span>
        </div>
      </div>
    </div>
  );
}
