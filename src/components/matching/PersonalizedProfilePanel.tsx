"use client";

import { GraduationCap, Map, WalletCards } from "lucide-react";
import { useStore } from "@/lib/store";
import type { BudgetRange, StudentProfile } from "@/types";

const CURRICULA: StudentProfile["academics"]["curriculum"][] = ["CBSE", "ICSE", "IB", "A_LEVELS", "AP", "OTHER"];
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Singapore", "Germany", "Australia", "Netherlands"];
const BUDGETS: { value: BudgetRange; label: string }[] = [
  { value: "under_20k", label: "Under $20k" },
  { value: "20k_40k",   label: "$20k–$40k"  },
  { value: "40k_60k",   label: "$40k–$60k"  },
  { value: "60k_plus",  label: "$60k+"       },
  { value: "any",       label: "Any"         },
];

export function PersonalizedProfilePanel() {
  const { profile, updateProfile } = useStore();

  const updateAcademic = (key: keyof StudentProfile["academics"], value: string | number) =>
    updateProfile({ academics: { ...profile.academics, [key]: value } });

  const updateTests = (key: keyof StudentProfile["testScores"], value: number | undefined) =>
    updateProfile({ testScores: { ...profile.testScores, [key]: value } });

  const toggleCountry = (country: string) => {
    const selected = profile.preferredCountries.includes(country)
      ? profile.preferredCountries.filter(c => c !== country)
      : [...profile.preferredCountries, country];
    updateProfile({ preferredCountries: selected, careerGoals: { ...profile.careerGoals, preferredCountries: selected } });
  };

  return (
    <section className="glass rounded-2xl p-5 mb-0">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Academic */}
        <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-white/45 mb-3">
            <GraduationCap size={14} />
            <span className="text-xs uppercase tracking-wider">Academic profile</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input value={profile.name} onChange={e => updateProfile({ name: e.target.value })} className="field" />
            </Field>
            <Field label="Intake year">
              <input type="number" value={profile.intakeYear} onChange={e => updateProfile({ intakeYear: +e.target.value })} className="field" />
            </Field>
            <Field label="Country">
              <input value={profile.country} onChange={e => updateProfile({ country: e.target.value })} className="field" />
            </Field>
            <Field label="Major">
              <input value={profile.intendedMajor} onChange={e => updateProfile({ intendedMajor: e.target.value, careerGoals: { ...profile.careerGoals, intendedMajor: e.target.value } })} className="field" />
            </Field>
            <Field label="Curriculum">
              <select value={profile.academics.curriculum} onChange={e => updateAcademic("curriculum", e.target.value)} className="field">
                {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="GPA (0–4.0)">
              <input type="number" min={0} max={4} step={0.1} value={profile.academics.gpa} onChange={e => updateAcademic("gpa", +e.target.value)} className="field" />
            </Field>
            <Field label="Percentage">
              <input type="number" min={0} max={100} value={profile.academics.percentage} onChange={e => updateAcademic("percentage", +e.target.value)} className="field" />
            </Field>
            <Field label="Predicted grades">
              <input value={profile.academics.predictedGrades ?? ""} onChange={e => updateAcademic("predictedGrades", e.target.value)} className="field" placeholder="A1 Maths, A CS…" />
            </Field>
          </div>
        </div>

        {/* Testing & budget */}
        <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-white/45 mb-3">
            <WalletCards size={14} />
            <span className="text-xs uppercase tracking-wider">Testing & budget</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SAT (400–1600)">
              <input type="number" min={400} max={1600} value={profile.testScores.sat ?? ""} onChange={e => updateTests("sat", e.target.value ? +e.target.value : undefined)} className="field" />
            </Field>
            <Field label="ACT (1–36)">
              <input type="number" min={1} max={36} value={profile.testScores.act ?? ""} onChange={e => updateTests("act", e.target.value ? +e.target.value : undefined)} className="field" />
            </Field>
            <Field label="IELTS (0–9)">
              <input type="number" min={0} max={9} step={0.5} value={profile.testScores.ielts ?? ""} onChange={e => updateTests("ielts", e.target.value ? +e.target.value : undefined)} className="field" />
            </Field>
            <Field label="TOEFL (0–120)">
              <input type="number" min={0} max={120} value={profile.testScores.toefl ?? ""} onChange={e => updateTests("toefl", e.target.value ? +e.target.value : undefined)} className="field" />
            </Field>
            <Field label="Budget">
              <select value={profile.budgetRange} onChange={e => updateProfile({ budgetRange: e.target.value as BudgetRange })} className="field">
                {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </Field>
            <Field label="Financial aid">
              <select value={profile.careerGoals.financialAidRequired ? "yes" : "no"} onChange={e => updateProfile({ careerGoals: { ...profile.careerGoals, financialAidRequired: e.target.value === "yes" } })} className="field">
                <option value="no">Not required</option>
                <option value="yes">Required</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Countries */}
        <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 text-white/45 mb-3">
            <Map size={14} />
            <span className="text-xs uppercase tracking-wider">Preferred countries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(country => {
              const active = profile.preferredCountries.includes(country);
              return (
                <button key={country} onClick={() => toggleCountry(country)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                    active ? "bg-brand-500/18 border-brand-500/35 text-white" : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white/70"
                  }`}>
                  {country}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1.5">Dream universities</span>
            <input
              className="field"
              placeholder="MIT, Stanford, CMU…"
              value={profile.careerGoals.dreamUniversities.join(", ")}
              onChange={e => updateProfile({ careerGoals: { ...profile.careerGoals, dreamUniversities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })}
            />
          </div>
        </div>
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
