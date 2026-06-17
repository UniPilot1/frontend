"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp,
  ExternalLink, MapPin, TrendingUp, Users, DollarSign, Clock,
  CheckCircle, XCircle, MinusCircle,
} from "lucide-react";
import type { UniversityMatch } from "@/types";
import {
  cn, TIER_CONFIG, OUTLOOK_CONFIG,
  formatTuition, daysUntil, urgencyColor, countryFlag,
  getDimensionColor,
} from "@/lib/utils";
import { useStore } from "@/lib/store";

interface Props {
  match: UniversityMatch;
  index: number;
}

export function UniversityCard({ match, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { savedMatches, toggleSaved, setSelectedMatch } = useStore();

  const { university: uni, program, tier, matchScore, outlook, outlookExplanation, matchReasons, dimensionGaps } = match;
  const tierCfg    = TIER_CONFIG[tier];
  const outlookCfg = OUTLOOK_CONFIG[outlook];
  const saved      = savedMatches.has(match.id);

  const nextDeadline = program.deadlines.earlyAction
    || program.deadlines.earlyDecision
    || program.deadlines.regularDecision;
  const days = daysUntil(nextDeadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn(
        "glass rounded-2xl border card-hover overflow-hidden",
        expanded ? "border-brand-500/30" : "border-white/5"
      )}
    >
      {/* ── Top bar ── */}
      <div className="flex items-start gap-4 p-5">
        {/* Flag + ranking */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-2xl">{countryFlag(uni.countryCode)}</span>
          <span className="text-[10px] text-white/30">#{uni.ranking}</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">{uni.name}</h3>
              <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                <MapPin size={10} /> {uni.city}
              </p>
            </div>

            {/* Tier badge */}
            <span className={cn(
              "shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border",
              tierCfg.bg, tierCfg.border, tierCfg.text
            )}>
              {tier}
            </span>
          </div>

          {/* Program */}
          <p className="text-xs text-brand-400 mt-1.5">{program.degree} · {program.name}</p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-3">
            <Stat icon={<DollarSign size={10} />} label={formatTuition(program.tuitionUSD) + "/yr"} />
            <Stat icon={<Users size={10} />}       label={`${uni.acceptanceRate}% admit`} />
            <Stat icon={<Clock size={10} />}        label={`${days}d · ${nextDeadline.slice(0,7)}`} color={urgencyColor(days)} />
            <Stat icon={<TrendingUp size={10} />}   label={`${matchScore}% match`} color="text-brand-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => toggleSaved(match.id)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              saved ? "text-brand-400 bg-brand-500/10" : "text-white/30 hover:text-white/60"
            )}
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <button
            onClick={() => setSelectedMatch(match)}
            className="text-[10px] text-white/30 hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            Deep dive <ExternalLink size={9} />
          </button>
        </div>
      </div>

      {/* ── Match score bar ── */}
      <div className="px-5 pb-3">
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>Match score</span>
          <span className={outlookCfg.color}>{outlookCfg.icon} {outlook}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: tierCfg.dot }}
            initial={{ width: 0 }}
            animate={{ width: `${matchScore}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: index * 0.06 + 0.2 }}
          />
        </div>
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-2.5 flex items-center justify-between text-[11px] text-white/30 hover:text-white/60 border-t border-white/5 transition-colors"
      >
        <span>{expanded ? "Hide analysis" : "Show full analysis"}</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* ── Expanded details ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-5 border-t border-white/5">

              {/* Outlook explanation */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] text-white/50 leading-relaxed">{outlookExplanation}</p>
              </div>

              {/* Dimension gaps */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Your profile vs requirements</p>
                <div className="flex flex-col gap-2.5">
                  {dimensionGaps.map(g => (
                    <div key={g.dimension}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">{g.dimension}</span>
                        <span className={g.gap >= 0 ? "text-green-400" : "text-red-400"}>
                          {g.studentScore.toFixed(1)} / {g.requiredScore.toFixed(1)}
                          <span className="text-[10px] ml-1 opacity-60">({g.gap >= 0 ? "+" : ""}{g.gap.toFixed(1)})</span>
                        </span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                        {/* Required bar */}
                        <div
                          className="absolute h-full rounded-full bg-white/10"
                          style={{ width: `${(g.requiredScore / 10) * 100}%` }}
                        />
                        {/* Student bar */}
                        <motion.div
                          className="absolute h-full rounded-full"
                          style={{ backgroundColor: getDimensionColor(g.studentScore) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.studentScore / 10) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match reasons */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Match analysis</p>
                <div className="flex flex-col gap-2">
                  {matchReasons.map(r => (
                    <div key={r.dimension} className="flex gap-2.5 items-start">
                      {r.status === "strength"
                        ? <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" />
                        : r.status === "gap"
                        ? <XCircle    size={13} className="text-red-400   mt-0.5 shrink-0" />
                        : <MinusCircle size={13} className="text-white/30 mt-0.5 shrink-0" />}
                      <p className="text-xs text-white/50 leading-relaxed">{r.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Key deadlines</p>
                <div className="grid grid-cols-2 gap-2">
                  {program.deadlines.earlyAction && (
                    <DeadlineChip label="Early Action" date={program.deadlines.earlyAction} />
                  )}
                  {program.deadlines.earlyDecision && (
                    <DeadlineChip label="Early Decision" date={program.deadlines.earlyDecision} />
                  )}
                  <DeadlineChip label="Regular Decision" date={program.deadlines.regularDecision} />
                </div>
              </div>

              {/* Scholarships */}
              {program.scholarships.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3">Scholarships</p>
                  {program.scholarships.map(s => (
                    <div key={s.id} className="flex justify-between text-xs p-2 rounded-lg bg-green-500/5 border border-green-500/15">
                      <span className="text-white/60">{s.name}</span>
                      <span className="text-green-400 font-medium">
                        {s.currency} {s.amount.toLocaleString()}{s.renewable ? "/yr" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {uni.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/8 text-white/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Stat({ icon, label, color = "text-white/40" }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <span className={cn("flex items-center gap-1 text-[11px]", color)}>
      {icon} {label}
    </span>
  );
}

function DeadlineChip({ label, date }: { label: string; date: string }) {
  const days = daysUntil(date);
  return (
    <div className="rounded-lg p-2 bg-white/[0.03] border border-white/5">
      <p className="text-[10px] text-white/30">{label}</p>
      <p className="text-xs font-medium text-white/70 mt-0.5">{date}</p>
      <p className={cn("text-[10px] mt-0.5", urgencyColor(days))}>{days}d left</p>
    </div>
  );
}
