"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ECCategory, Extracurricular } from "@/types";

const CATEGORIES: ECCategory[] = [
  "Projects","Research","Olympiads","Competitions","Hackathons",
  "Leadership","Clubs","Sports","Volunteering","Startups","Internships",
];

const LEADERSHIP_LEVELS = ["None","Member","Officer","President","Founder"] as const;

const CAT_COLORS: Record<string, string> = {
  Projects:"bg-brand-500/15 text-brand-300", Research:"bg-teal-500/15 text-teal-300",
  Olympiads:"bg-yellow-500/15 text-yellow-300", Hackathons:"bg-orange-500/15 text-orange-300",
  Startups:"bg-red-500/15 text-red-300", Internships:"bg-purple-500/15 text-purple-300",
  Leadership:"bg-indigo-500/15 text-indigo-300", Clubs:"bg-sky-500/15 text-sky-300",
  Sports:"bg-green-500/15 text-green-300", Volunteering:"bg-emerald-500/15 text-emerald-300",
  Competitions:"bg-pink-500/15 text-pink-300",
};

export function ExtracurricularPanel() {
  const { profile, addEC, removeEC } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "Projects" as ECCategory,
    title: "", description: "", duration: "", impact: "",
    awards: "", leadershipLevel: "Member" as Extracurricular["leadershipLevel"],
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addEC({ id: `ec-${Date.now()}`, ...form });
    setForm({ category: "Projects", title: "", description: "", duration: "", impact: "", awards: "", leadershipLevel: "Member" });
    setShowForm(false);
  };

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-brand-400 mb-0.5">Extracurriculars</p>
          <h2 className="text-sm font-semibold text-white">{profile.extracurriculars.length} activities — updates all scores live</h2>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/25 text-brand-300 text-xs hover:bg-brand-500/25 transition-colors">
          <Plus size={13} />
          Add activity
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-white/8 bg-white/[0.025]">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">New activity</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Category">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ECCategory }))} className="field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Title">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="field" placeholder="e.g. ML Research Project" />
            </Field>
            <Field label="Description">
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="field" placeholder="What did you build / do?" />
            </Field>
            <Field label="Duration">
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="field" placeholder="e.g. 6 months" />
            </Field>
            <Field label="Impact">
              <input value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} className="field" placeholder="e.g. 500 users, Top 10" />
            </Field>
            <Field label="Leadership level">
              <select value={form.leadershipLevel} onChange={e => setForm(f => ({ ...f, leadershipLevel: e.target.value as Extracurricular["leadershipLevel"] }))} className="field">
                {LEADERSHIP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">Add activity</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:text-white/70 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* EC list */}
      <div className="space-y-2">
        {profile.extracurriculars.map(ec => (
          <div key={ec.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/6 bg-white/[0.02] group">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 mt-0.5 ${CAT_COLORS[ec.category] ?? "bg-white/10 text-white/50"}`}>
              {ec.category}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/85">{ec.title}</div>
              <div className="text-xs text-white/40 mt-0.5">{ec.description} · {ec.duration} · {ec.impact}</div>
              <div className="text-[10px] text-brand-400 mt-1">{ec.leadershipLevel}</div>
            </div>
            <button onClick={() => removeEC(ec.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
        ))}
        {profile.extracurriculars.length === 0 && (
          <div className="text-center py-8 text-xs text-white/25">No activities yet. Add one above.</div>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      {children}
    </label>
  );
}
