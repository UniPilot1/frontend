"use client";

import { useStore } from "@/lib/store";
import { formatTuition, daysUntil, urgencyColor, countryFlag, TIER_CONFIG, OUTLOOK_CONFIG } from "@/lib/utils";

export function UniversitiesTab() {
  const { matchingResult, setSelectedMatch } = useStore();
  const all = [...matchingResult.reach, ...matchingResult.target, ...matchingResult.likely];

  return (
    <div className="space-y-3">
      {all.map(m => {
        const { university: uni, program, tier, matchScore, outlook, dimensionGaps } = m;
        const cfg = TIER_CONFIG[tier];
        const oInfo = OUTLOOK_CONFIG[outlook];
        const nextDl = program.deadlines.earlyAction ?? program.deadlines.earlyDecision ?? program.deadlines.regularDecision;
        const days = daysUntil(nextDl);
        const topGap = [...dimensionGaps].sort((a, b) => a.gap - b.gap)[0];
        const topStr = [...dimensionGaps].sort((a, b) => b.gap - a.gap)[0];

        return (
          <div key={m.id} className="glass rounded-xl p-4 flex gap-4 items-start">
            <div className="text-center shrink-0">
              <div className="text-2xl">{countryFlag(uni.countryCode)}</div>
              <div className="text-[10px] text-white/30 mt-0.5">#{uni.ranking}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{uni.name}</div>
                  <div className="text-xs text-white/35 mt-0.5">{program.degree} · {program.name} · {uni.city}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}>{tier}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/35">
                <span>💰 {formatTuition(program.tuitionUSD)}/yr</span>
                <span>👥 {uni.acceptanceRate}% admit</span>
                <span className={urgencyColor(days)}>⏱ {days}d · {nextDl.slice(0,7)}</span>
                <span className="text-brand-300">⚡ {matchScore}% match</span>
              </div>
              <div className="mt-2">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${matchScore}%`, background: cfg.dot }} />
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-[11px]">
                {topStr && topStr.gap > 0 && (
                  <span className="text-green-400">✅ Strength: {topStr.dimension} (+{topStr.gap.toFixed(1)})</span>
                )}
                {topGap && topGap.gap < 0 && (
                  <span className="text-red-400">❌ Gap: {topGap.dimension} ({topGap.gap.toFixed(1)})</span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-white/30">{oInfo.icon} {outlook} — {m.outlookExplanation}</div>
            </div>
            <button onClick={() => setSelectedMatch(m)}
              className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.03] text-xs text-white/40 hover:text-white/80 hover:border-white/20 transition-colors shrink-0">
              Deep dive →
            </button>
          </div>
        );
      })}
    </div>
  );
}
