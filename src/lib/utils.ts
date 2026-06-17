import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchTier, AdmissionOutlook, ProfileDimension } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Tier colours ───────────────────────────────────────────────────────────────
export const TIER_CONFIG: Record<MatchTier, {
  bg: string; border: string; text: string; dot: string; label: string;
}> = {
  Reach:  { bg: "bg-red-500/10",   border: "border-red-500/30",   text: "text-red-400",   dot: "#f87171", label: "Reach"  },
  Target: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "#fbbf24", label: "Target" },
  Likely: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "#4ade80", label: "Likely" },
};

export const OUTLOOK_CONFIG: Record<AdmissionOutlook, { color: string; icon: string }> = {
  "Highly Ambitious": { color: "text-red-400",    icon: "🔴" },
  "Ambitious":        { color: "text-orange-400", icon: "🟠" },
  "Competitive":      { color: "text-amber-400",  icon: "🟡" },
  "Strong Fit":       { color: "text-teal-400",   icon: "🟢" },
  "Very Strong Fit":  { color: "text-green-400",  icon: "💚" },
};

// ── Scoring helpers ────────────────────────────────────────────────────────────
export function satToPercentile(sat: number): number {
  if (sat >= 1580) return 99;
  if (sat >= 1550) return 99;
  if (sat >= 1500) return 98;
  if (sat >= 1450) return 96;
  if (sat >= 1400) return 94;
  if (sat >= 1350) return 91;
  if (sat >= 1300) return 87;
  if (sat >= 1250) return 81;
  if (sat >= 1200) return 74;
  return 60;
}

export function getDimensionColor(score: number): string {
  if (score >= 8)  return "#4ade80";
  if (score >= 6)  return "#7c63ff";
  if (score >= 4)  return "#fbbf24";
  return "#f87171";
}

export function getLevelFromScore(score: number): ProfileDimension["level"] {
  if (score >= 9)  return "Exceptional";
  if (score >= 7.5) return "Strong";
  if (score >= 6)  return "Above Average";
  if (score >= 4.5) return "Average";
  if (score >= 3)  return "Below Average";
  return "Weak";
}

// ── Formatting ─────────────────────────────────────────────────────────────────
export function formatTuition(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function urgencyColor(days: number): string {
  if (days < 30)  return "text-red-400";
  if (days < 90)  return "text-amber-400";
  if (days < 180) return "text-yellow-400";
  return "text-green-400";
}

export function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// ── Match score → tier ─────────────────────────────────────────────────────────
export function scoreToTier(matchScore: number): MatchTier {
  if (matchScore >= 75) return "Likely";
  if (matchScore >= 50) return "Target";
  return "Reach";
}

// ── Match score → outlook ──────────────────────────────────────────────────────
export function scoreToOutlook(matchScore: number): AdmissionOutlook {
  if (matchScore >= 85) return "Very Strong Fit";
  if (matchScore >= 70) return "Strong Fit";
  if (matchScore >= 55) return "Competitive";
  if (matchScore >= 40) return "Ambitious";
  return "Highly Ambitious";
}

// ── Clamp ──────────────────────────────────────────────────────────────────────
export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
