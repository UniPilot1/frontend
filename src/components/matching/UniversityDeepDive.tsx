"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, MapPin, Users, DollarSign, BookOpen, Award } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  cn, TIER_CONFIG, OUTLOOK_CONFIG, formatTuition,
  countryFlag, getDimensionColor, daysUntil, urgencyColor,
} from "@/lib/utils";

export function UniversityDeepDive() {
  const { selectedMatch: m, setSelectedMatch } = useStore();

  if (!m) return null;

  const tierCfg    = TIER_CONFIG[m.tier];
  const outlookCfg = OUTLOOK_CONFIG[m.outlook];

  return (
    <AnimatePresence>
      {m && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMatch(null)}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{ background: "#0d0d1e", borderLeft: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/6"
              style={{ background: "#0d0d1e" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{countryFlag(m.university.countryCode)}</span>
                <div>
                  <h2 className="text-sm font-semibold text-white">{m.university.shortName}</h2>
                  <p className="text-xs text-white/40">{m.program.degree} · {m.program.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", tierCfg.bg, tierCfg.border, tierCfg.text)}>
                  {m.tier}
                </span>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-6">

              {/* Overview cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Users size={13} />}     label="Acceptance rate" value={`${m.university.acceptanceRate}%`} />
                <StatCard icon={<DollarSign size={13} />} label="Annual tuition"   value={formatTuition(m.program.tuitionUSD)} />
                <StatCard icon={<MapPin size={13} />}    label="Location"         value={m.university.city} />
                <StatCard icon={<BookOpen size={13} />}  label="Ranking"          value={`#${m.university.ranking} global`} />
              </div>

              {/* Match overview */}
              <div className="rounded-xl border border-white/6 p-4">
                <div className="flex justify-between mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Match score</p>
                  <span className={cn("text-xs font-medium", outlookCfg.color)}>
                    {outlookCfg.icon} {m.outlook}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: tierCfg.dot }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.matchScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{m.outlookExplanation}</p>
              </div>

              {/* Dimension gaps visual */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Profile vs requirements</p>
                <div className="flex flex-col gap-3">
                  {m.dimensionGaps.map(g => (
                    <div key={g.dimension}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/55">{g.dimension}</span>
                        <span className={g.gap >= 0 ? "text-green-400" : "text-red-400"}>
                          You: {g.studentScore.toFixed(1)} · Need: {g.requiredScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="absolute h-full bg-white/10 rounded-full"
                          style={{ width: `${(g.requiredScore / 10) * 100}%` }} />
                        <motion.div
                          className="absolute h-full rounded-full"
                          style={{ backgroundColor: getDimensionColor(g.studentScore) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.studentScore / 10) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Application deadlines</p>
                <div className="flex flex-col gap-2">
                  {m.program.deadlines.earlyAction && (
                    <DeadlineRow label="Early Action" date={m.program.deadlines.earlyAction} />
                  )}
                  {m.program.deadlines.earlyDecision && (
                    <DeadlineRow label="Early Decision" date={m.program.deadlines.earlyDecision} />
                  )}
                  <DeadlineRow label="Regular Decision" date={m.program.deadlines.regularDecision} />
                </div>
              </div>

              {/* Scholarships */}
              {m.program.scholarships.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award size={12} /> Scholarships for you
                  </p>
                  <div className="flex flex-col gap-2">
                    {m.program.scholarships.map(s => (
                      <div key={s.id} className="p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-white/80">{s.name}</p>
                          <p className="text-sm text-green-400 font-semibold">
                            {s.currency} {s.amount.toLocaleString()}{s.renewable ? "/yr" : ""}
                          </p>
                        </div>
                        <p className="text-xs text-white/35 mt-1">{s.eligibility.join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Minimum requirements</p>
                <div className="grid grid-cols-2 gap-2">
                  {m.program.requirements.minGPA && (
                    <ReqChip label="Min GPA" value={m.program.requirements.minGPA.toFixed(1)} />
                  )}
                  {m.program.requirements.minSAT && (
                    <ReqChip label="Min SAT" value={String(m.program.requirements.minSAT)} />
                  )}
                  {m.program.requirements.minACT && (
                    <ReqChip label="Min ACT" value={String(m.program.requirements.minACT)} />
                  )}
                  {m.program.requirements.minIELTS && (
                    <ReqChip label="Min IELTS" value={String(m.program.requirements.minIELTS)} />
                  )}
                  {m.program.requirements.minTOEFL && (
                    <ReqChip label="Min TOEFL" value={String(m.program.requirements.minTOEFL)} />
                  )}
                </div>
                {m.program.requirements.notes && (
                  <p className="text-xs text-white/35 mt-2">{m.program.requirements.notes}</p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {m.university.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-white/40">
                    {t}
                  </span>
                ))}
              </div>

              {/* External link */}
              <a
                href={m.university.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
              >
                Visit official website <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/6">
      <div className="flex items-center gap-1.5 text-white/35 mb-1">{icon}<span className="text-[10px]">{label}</span></div>
      <p className="text-sm font-medium text-white/80">{value}</p>
    </div>
  );
}

function DeadlineRow({ label, date }: { label: string; date: string }) {
  const days = daysUntil(date);
  return (
    <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
      <div>
        <p className="text-xs text-white/55">{label}</p>
        <p className="text-xs text-white/35">{date}</p>
      </div>
      <span className={cn("text-xs font-medium", urgencyColor(days))}>{days}d</span>
    </div>
  );
}

function ReqChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
      <p className="text-[10px] text-white/35">{label}</p>
      <p className="text-sm font-semibold text-white/75">{value}</p>
    </div>
  );
}
