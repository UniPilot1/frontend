"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/dashboard/Navbar";
import { ProfileSidebar } from "./ProfileSidebar";
import { FilterBar } from "./FilterBar";
import { TierColumn } from "./TierColumn";
import { UniversityDeepDive } from "./UniversityDeepDive";
import { PersonalizedProfilePanel } from "./PersonalizedProfilePanel";
import { StrategistRoadmap } from "./StrategistRoadmap";
import { GeminiStrategistPanel } from "./GeminiStrategistPanel";
import { ExtracurricularPanel } from "./ExtracurricularPanel";
import { UniversitiesTab } from "./UniversitiesTab";
import type { MatchTier } from "@/types";

const TIERS: MatchTier[] = ["Reach", "Target", "Likely"];

export function MatchingDashboard() {
  const { matchingResult, activeFilter, searchQuery, countryFilter, activeTab, setActiveTab } = useStore();

  const filterByCountry = (matches: typeof matchingResult.reach) =>
    countryFilter === "All" ? matches : matches.filter(m => m.university.country === countryFilter);

  const tierData: Record<MatchTier, typeof matchingResult.reach> = {
    Reach:  filterByCountry(matchingResult.reach),
    Target: filterByCountry(matchingResult.target),
    Likely: filterByCountry(matchingResult.likely),
  };

  const visibleTiers = activeFilter === "All" ? TIERS : [activeFilter as MatchTier];

  const tabs = [
    { id: "strategy",     label: "Strategy"      },
    { id: "profile",      label: "Profile"        },
    { id: "roadmap",      label: "Roadmap"        },
    { id: "universities", label: "Universities"   },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      {/* Tab bar */}
      <div className="border-b border-white/6 bg-surface-0 sticky top-[52px] z-40">
        <div className="max-w-screen-xl mx-auto px-6 flex gap-1 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-400 text-brand-300 bg-brand-500/8"
                  : "border-transparent text-white/35 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-10">
        {/* ── STRATEGY TAB ── */}
        {activeTab === "strategy" && (
          <div className="flex gap-6 items-start">
            <ProfileSidebar />
            <main className="flex-1 min-w-0">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <h1 className="text-xl font-semibold text-white mb-1">UniPilot Admissions Strategist</h1>
                <p className="text-xs text-white/35">
                  Find the strongest realistic university path, the gaps that matter, and the next actions before deadlines.
                </p>
              </motion.div>
              <GeminiStrategistPanel />
              <FilterBar />
              <div className={`grid gap-5 ${visibleTiers.length === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
                {visibleTiers.map(tier => (
                  <TierColumn key={tier} tier={tier} matches={tierData[tier]} searchQuery={searchQuery} />
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/20">
                <span>Engine last ran: {new Date(matchingResult.generatedAt).toLocaleTimeString()}</span>
                <span>UniPilot Strategist v2.0</span>
              </div>
            </main>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-white mb-1">Your profile</h1>
              <p className="text-xs text-white/35">Every edit reruns the matching engine, roadmap, and gap analysis instantly.</p>
            </div>
            <PersonalizedProfilePanel />
            <div className="mt-5">
              <ExtracurricularPanel />
            </div>
          </motion.div>
        )}

        {/* ── ROADMAP TAB ── */}
        {activeTab === "roadmap" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-white mb-1">Month-by-month roadmap</h1>
              <p className="text-xs text-white/35">Personalised task plan based on your gaps, target schools, and time remaining.</p>
            </div>
            <StrategistRoadmap />
          </motion.div>
        )}

        {/* ── UNIVERSITIES TAB ── */}
        {activeTab === "universities" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-white mb-1">University deep dives</h1>
              <p className="text-xs text-white/35">All matched universities with full profile gap analysis.</p>
            </div>
            <UniversitiesTab />
          </motion.div>
        )}
      </div>

      <UniversityDeepDive />
    </div>
  );
}
