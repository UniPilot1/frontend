"use client";

import { useState } from "react";
import { AlertCircle, Bot, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { computeDimensionScores } from "@/lib/matchingEngine";

interface AIResult {
  profileRead: string;
  highestROI: string;
  next30Days: string;
}

export function GeminiStrategistPanel() {
  const { profile, matchingResult, timeline } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  const runAI = async () => {
    setLoading(true);
    setError(null);

    const dims = computeDimensionScores(profile);
    const overall = +(Object.entries(dims).reduce((a, [k, v]) => {
      const w: Record<string,number> = { academics:.25,testing:.20,research:.18,leadership:.12,techPortfolio:.10,community:.08,initiative:.07 };
      return a + v * (w[k] ?? 0);
    }, 0)).toFixed(1);
    const best = matchingResult.target[0] ?? matchingResult.likely[0] ?? matchingResult.reach[0];
    const topGap = Object.entries(dims).sort(([,a],[,b]) => a - b)[0];

    const prompt = `You are a world-class university admissions strategist. A student has the following profile:

Name: ${profile.name}
Country: ${profile.country}
Intended major: ${profile.intendedMajor}
Intake: Fall ${profile.intakeYear}
GPA: ${profile.academics.gpa}/4.0 (${profile.academics.percentage}%)
SAT: ${profile.testScores.sat ?? "Not taken"}
IELTS: ${profile.testScores.ielts ?? "Not taken"}
Budget: ${profile.budgetRange}
Preferred countries: ${profile.preferredCountries.join(", ")}

Dimension scores (0-10):
${Object.entries(dims).map(([k,v]) => `- ${k}: ${v}`).join("\n")}
Overall score: ${overall}/10

Extracurriculars:
${profile.extracurriculars.map(e => `- ${e.category}: ${e.title} (${e.leadershipLevel}) – ${e.description}, ${e.duration}, Impact: ${e.impact}`).join("\n")}

Best realistic match: ${best ? `${best.university.name} – ${best.program.name} (${best.outlook}, ${best.matchScore}% match)` : "No matches"}
Biggest gap dimension: ${topGap[0]} (${topGap[1]}/10)
First deadline: ${timeline.firstDeadline ? `${timeline.firstDeadline.label} – ${timeline.firstDeadline.date} (${timeline.firstDeadline.daysRemaining} days)` : "No upcoming deadlines"}

Respond ONLY in this exact JSON format with no preamble or markdown:
{
  "profileRead": "2–3 sentence honest assessment of their strengths and weaknesses",
  "highestROI": "The single highest-ROI improvement they can make right now, in 2–3 sentences",
  "next30Days": "Concrete action plan for the next 30 days in 3 bullet points separated by |"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = (data.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError(`AI call failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass rounded-2xl p-5 mb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 mb-1">
            <Bot size={15} />
            <p className="text-xs uppercase tracking-wider">AI strategist</p>
          </div>
          <h2 className="text-base font-semibold text-white">Get personalised admissions strategy</h2>
          <p className="text-xs text-white/35 max-w-xl mt-1">
            Analyzes your exact profile, gaps, and time remaining to generate a customized strategy and highest-ROI actions.
          </p>
        </div>
        <button onClick={runAI} disabled={loading}
          className="h-9 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-medium transition-colors flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Generating…" : result ? "Regenerate" : "✦ Generate strategy"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/8 p-3 flex items-start gap-2">
          <AlertCircle size={13} className="text-red-300 mt-0.5 shrink-0" />
          <p className="text-xs text-red-100/70 leading-relaxed">{error}</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-4">
          <ResultBlock title="📋 Profile read">{result.profileRead}</ResultBlock>
          <ResultBlock title="🎯 Highest-ROI move">{result.highestROI}</ResultBlock>
          <ResultBlock title="⚡ Next 30 days">
            <ul className="space-y-1.5 pl-3">
              {result.next30Days.split("|").map((s,i) => (
                <li key={i} className="list-disc text-white/45">{s.trim()}</li>
              ))}
            </ul>
          </ResultBlock>
        </div>
      )}
    </section>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
      <p className="text-[10px] uppercase tracking-wider text-brand-300 mb-2">{title}</p>
      <div className="text-xs text-white/45 leading-relaxed">{children}</div>
    </div>
  );
}
