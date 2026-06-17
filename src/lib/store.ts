import { create } from "zustand";
import type {
  StudentProfile, MatchingResponse, UniversityMatch,
  ProfileEvaluation, ProfileDimension, MatchTier,
  RoadmapMonth, RoadmapTask, TimelineAnalysis,
} from "@/types";
import { runMatchingEngine, computeDimensionScores } from "./matchingEngine";
import { buildRoadmap, buildTimelineAnalysis } from "./roadmapEngine";
import { getLevelFromScore } from "./utils";

export const DEMO_PROFILE: StudentProfile = {
  id: "demo-student-001",
  name: "Aryan Mehta",
  country: "India",
  intakeYear: 2027,
  intendedMajor: "Computer Science",
  preferredCountries: ["United States", "United Kingdom", "Canada", "Singapore", "Germany"],
  budgetRange: "60k_plus",
  financialAidRequired: false,
  academics: {
    curriculum: "CBSE",
    gpa: 3.8,
    percentage: 94,
    predictedGrades: "A1 in Maths, Physics, CS",
  },
  testScores: { sat: 1490, ielts: 7.5 },
  extracurriculars: [
    { id: "e1", category: "Projects",     title: "AI Chatbot",      description: "Built a GPT-powered chatbot",   duration: "6 months", impact: "500 users",   leadershipLevel: "Founder"  },
    { id: "e2", category: "Hackathons",   title: "HackMIT 2025",    description: "Top 10 finish",                 duration: "48 hours", impact: "Top 10",      leadershipLevel: "Member"   },
    { id: "e3", category: "Clubs",        title: "Coding Club",     description: "Member and organiser",          duration: "2 years",  impact: "50 members",  leadershipLevel: "Officer"  },
    { id: "e4", category: "Volunteering", title: "Teach for India", description: "Tutored underprivileged kids",  duration: "1 year",   impact: "30 students", leadershipLevel: "Member"   },
    { id: "e5", category: "Internships",  title: "SDE Intern",      description: "Startup internship",            duration: "3 months", impact: "2 features",  leadershipLevel: "Member"   },
  ],
  careerGoals: {
    intendedMajor: "Computer Science",
    dreamUniversities: ["MIT", "Stanford", "CMU"],
    preferredCountries: ["United States", "United Kingdom"],
    financialAidRequired: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DIMENSION_META: Record<string, { label: string; tip: string }> = {
  academics:     { label: "Academics",      tip: "Maintain upward grade trend; take the most rigorous available courses." },
  testing:       { label: "Testing",        tip: "A score above 1520 SAT eliminates testing as a differentiator." },
  research:      { label: "Research",       tip: "A published paper or formal lab experience has outsized admissions impact." },
  leadership:    { label: "Leadership",     tip: "Found or lead a club, project, or community initiative." },
  techPortfolio: { label: "Tech portfolio", tip: "Document projects on GitHub with clear problem statements and impact metrics." },
  community:     { label: "Community",      tip: "Sustained volunteering over 12+ months reads better than multiple short stints." },
  initiative:    { label: "Initiative",     tip: "Starting something signals ownership — a startup, open-source project, or newsletter." },
};

const SCORE_WEIGHTS: Record<string, number> = {
  academics: 0.25, testing: 0.20, research: 0.18,
  leadership: 0.12, techPortfolio: 0.10, community: 0.08, initiative: 0.07,
};

function buildEvaluation(profile: StudentProfile): ProfileEvaluation {
  const scores = computeDimensionScores(profile);
  const dimensions: ProfileDimension[] = Object.entries(scores).map(([key, score]) => ({
    key,
    label:          DIMENSION_META[key].label,
    score,
    maxScore:       10 as const,
    level:          getLevelFromScore(score),
    explanation:    `Score: ${score}/10 — ${getLevelFromScore(score)}`,
    improvementTip: DIMENSION_META[key].tip,
  }));
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const overall = +(Object.entries(scores).reduce(
    (acc, [key, val]) => acc + val * (SCORE_WEIGHTS[key] ?? 0.05), 0
  )).toFixed(1);
  return {
    overallScore: overall,
    dimensions,
    strengths:     sorted.slice(0, 3).map(d => d.label),
    weaknesses:    sorted.slice(-3).map(d => d.label),
    opportunities: ["Get a research internship", "Build a leadership role", "Open-source contribution"],
  };
}

interface UniPilotStore {
  profile:        StudentProfile;
  evaluation:     ProfileEvaluation;
  matchingResult: MatchingResponse;
  timeline:       TimelineAnalysis;
  roadmap:        RoadmapMonth[];
  savedMatches:   Set<string>;
  activeFilter:   MatchTier | "All";
  countryFilter:  string;
  searchQuery:    string;
  selectedMatch:  UniversityMatch | null;
  activeTab:      "strategy" | "profile" | "roadmap" | "universities";

  setProfile:       (p: StudentProfile) => void;
  updateProfile:    (partial: Partial<StudentProfile>) => void;
  addEC:            (ec: StudentProfile["extracurriculars"][number]) => void;
  removeEC:         (id: string) => void;
  toggleSaved:      (matchId: string) => void;
  updateTaskStatus: (taskId: string, status: RoadmapTask["status"]) => void;
  setActiveFilter:  (f: MatchTier | "All") => void;
  setCountryFilter: (country: string) => void;
  setSearchQuery:   (q: string) => void;
  setSelectedMatch: (m: UniversityMatch | null) => void;
  setActiveTab:     (t: UniPilotStore["activeTab"]) => void;
  rerunEngine:      () => void;
}

function flattenMatches(result: MatchingResponse): UniversityMatch[] {
  return [...result.reach, ...result.target, ...result.likely]
    .sort((a, b) => b.matchScore - a.matchScore);
}

function buildStrategistState(profile: StudentProfile) {
  const matchingResult = runMatchingEngine(profile, { preferredCountries: profile.preferredCountries });
  const matches = flattenMatches(matchingResult);
  const timeline = buildTimelineAnalysis(matches, profile.intakeYear);
  const roadmap  = buildRoadmap(profile, matches, timeline);
  return { evaluation: buildEvaluation(profile), matchingResult, timeline, roadmap };
}

export const useStore = create<UniPilotStore>((set, get) => {
  const initialState = buildStrategistState(DEMO_PROFILE);
  return {
    profile:        DEMO_PROFILE,
    evaluation:     initialState.evaluation,
    matchingResult: initialState.matchingResult,
    timeline:       initialState.timeline,
    roadmap:        initialState.roadmap,
    savedMatches:   new Set(),
    activeFilter:   "All",
    countryFilter:  "All",
    searchQuery:    "",
    selectedMatch:  null,
    activeTab:      "strategy",

    setProfile: (p) => set({ profile: p, ...buildStrategistState(p) }),

    updateProfile: (partial) => {
      const next = { ...get().profile, ...partial, updatedAt: new Date().toISOString() };
      set({ profile: next, ...buildStrategistState(next) });
    },

    addEC: (ec) => {
      const next = { ...get().profile, extracurriculars: [...get().profile.extracurriculars, ec], updatedAt: new Date().toISOString() };
      set({ profile: next, ...buildStrategistState(next) });
    },

    removeEC: (id) => {
      const next = { ...get().profile, extracurriculars: get().profile.extracurriculars.filter(e => e.id !== id), updatedAt: new Date().toISOString() };
      set({ profile: next, ...buildStrategistState(next) });
    },

    toggleSaved: (matchId) => {
      const next = new Set(get().savedMatches);
      next.has(matchId) ? next.delete(matchId) : next.add(matchId);
      set({ savedMatches: next });
    },

    updateTaskStatus: (taskId, status) => {
      set({
        roadmap: get().roadmap.map(month => ({
          ...month,
          tasks: month.tasks.map(task => task.id === taskId ? { ...task, status } : task),
        })),
      });
    },

    setActiveFilter:  (f) => set({ activeFilter: f }),
    setCountryFilter: (country) => set({ countryFilter: country }),
    setSearchQuery:   (q) => set({ searchQuery: q }),
    setSelectedMatch: (m) => set({ selectedMatch: m }),
    setActiveTab:     (t) => set({ activeTab: t }),
    rerunEngine:      () => set(buildStrategistState(get().profile)),
  };
});
