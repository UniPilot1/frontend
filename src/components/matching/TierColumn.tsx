"use client";

import { motion } from "framer-motion";
import type { UniversityMatch, MatchTier } from "@/types";
import { TIER_CONFIG, cn } from "@/lib/utils";
import { UniversityCard } from "./UniversityCard";

interface Props {
  tier: MatchTier;
  matches: UniversityMatch[];
  searchQuery: string;
}

const TIER_DESCRIPTIONS: Record<MatchTier, string> = {
  Reach:  "Acceptance is possible but will require an outstanding application. These are aspirational targets.",
  Target: "Your profile aligns well. A strong application gives you a real shot.",
  Likely: "High probability of admission based on your current profile.",
};

export function TierColumn({ tier, matches, searchQuery }: Props) {
  const cfg = TIER_CONFIG[tier];

  const filtered = matches.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.university.name.toLowerCase().includes(q) ||
      m.university.shortName.toLowerCase().includes(q) ||
      m.university.country.toLowerCase().includes(q) ||
      m.program.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className={cn("rounded-xl border p-3 mb-1", cfg.bg, cfg.border)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full dot-pulse", `bg-[${cfg.dot}]`)}
              style={{ backgroundColor: cfg.dot }} />
            <span className={cn("text-sm font-semibold", cfg.text)}>{tier}</span>
          </div>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.text, cfg.border, "border")}>
            {filtered.length}
          </span>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">{TIER_DESCRIPTIONS[tier]}</p>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState tier={tier} hasSearch={!!searchQuery} />
      ) : (
        filtered.map((m, i) => (
          <UniversityCard key={m.id} match={m} index={i} />
        ))
      )}
    </div>
  );
}

function EmptyState({ tier, hasSearch }: { tier: MatchTier; hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-10 glass rounded-2xl border border-white/5 text-center px-4"
    >
      <span className="text-3xl mb-3">
        {tier === "Reach" ? "🎯" : tier === "Target" ? "🎓" : "✅"}
      </span>
      <p className="text-sm text-white/40">
        {hasSearch
          ? `No ${tier} schools match your search.`
          : `No ${tier} schools in current filters.`}
      </p>
      {!hasSearch && tier === "Likely" && (
        <p className="text-xs text-white/25 mt-1">
          Try lowering budget filters or adding more countries.
        </p>
      )}
    </motion.div>
  );
}
