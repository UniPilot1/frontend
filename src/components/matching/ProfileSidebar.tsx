"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { getDimensionColor } from "@/lib/utils";
import { SlidersHorizontal, RefreshCw } from "lucide-react";

export function ProfileSidebar() {
  const { profile, evaluation, updateProfile, timeline } = useStore();
  const { dimensions, overallScore } = evaluation;

  const handleGPA = (v: number) => {
    updateProfile({ academics: { ...profile.academics, gpa: v } });
  };

  const handleSAT = (v: number) => {
    updateProfile({ testScores: { ...profile.testScores, sat: v } });
  };

  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (overallScore / 10) * circumference;

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-4">
      {/* Profile card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-sm">
            {profile.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{profile.name}</p>
            <p className="text-xs text-white/40">{profile.country} · {profile.intakeYear} intake</p>
          </div>
        </div>

        {/* Overall score ring */}
        <div className="flex flex-col items-center py-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <motion.circle
                cx="40" cy="40" r="36" fill="none"
                stroke="#7c63ff" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-white">{overallScore}</span>
              <span className="text-[10px] text-white/40">/10</span>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-2">Overall profile score</p>
        </div>
      </div>

      {/* Live sliders */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={14} className="text-brand-400" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Adjust profile</span>
        </div>

        <div className="flex flex-col gap-5">
          <SliderField
            label="GPA"
            value={profile.academics.gpa}
            min={2.0} max={4.0} step={0.1}
            display={profile.academics.gpa.toFixed(1)}
            onChange={handleGPA}
          />
          <SliderField
            label="SAT score"
            value={profile.testScores.sat ?? 1200}
            min={900} max={1600} step={10}
            display={String(profile.testScores.sat ?? 1200)}
            onChange={handleSAT}
          />
        </div>

        <p className="text-[10px] text-white/30 mt-4 leading-relaxed">
          Drag sliders to see how profile changes affect your university matches in real time.
        </p>
      </div>

      {/* Dimension breakdown */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw size={13} className="text-brand-400" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Dimension scores</span>
        </div>

        {dimensions.map((d, i) => (
          <motion.div key={d.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/60">{d.label}</span>
              <span className="text-xs font-medium" style={{ color: getDimensionColor(d.score) }}>
                {d.score.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getDimensionColor(d.score) }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.score / 10) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Intake countdown */}
      <div className="glass rounded-2xl p-5">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Time remaining</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: timeline.firstDeadline?.daysRemaining ?? 0, label: "days" },
            { val: Math.max(0, Math.ceil((timeline.firstDeadline?.daysRemaining ?? 0) / 7)), label: "weeks" },
            { val: timeline.monthsRemaining, label: "months" },
          ].map(({ val, label }) => (
            <div key={label} className="bg-white/5 rounded-xl p-2 text-center">
              <div className="text-lg font-semibold text-red-400">{val}</div>
              <div className="text-[10px] text-white/40">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-3">
          {timeline.firstDeadline
            ? `to ${timeline.firstDeadline.label} - ${timeline.firstDeadline.date}`
            : "No upcoming configured deadlines"}
        </p>
      </div>
    </aside>
  );
}

// ── Slider field ───────────────────────────────────────────────────────────────
function SliderField({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-medium text-brand-400">{display}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #7c63ff ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}
