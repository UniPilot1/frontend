import axios from "axios";
import type {
  StudentProfile, MatchingResponse, ProfileEvaluationResponse,
  GapAnalysisResponse, AIInsightResponse, GeminiRoadmapResponse,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: `${BASE}/api/v1` });

// Attach Firebase auth token to every request
api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return config;
  }

  const { getIdToken } = await import("./firebase");
  const token = await getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── University Matching ────────────────────────────────────────────────────────
export const matchUniversities = async (
  profile: StudentProfile,
  options?: { preferredCountries?: string[]; budgetMax?: number },
): Promise<MatchingResponse> => {
  const { data } = await api.post("/match/", {
    profile,
    preferredCountries: options?.preferredCountries ?? profile.preferredCountries,
    budgetMax: options?.budgetMax,
    includeScholarships: true,
  });
  return data;
};

// ── Profile Evaluation ─────────────────────────────────────────────────────────
export const evaluateProfile = async (
  profile: StudentProfile,
): Promise<ProfileEvaluationResponse> => {
  const { data } = await api.post("/profile/evaluate", profile);
  return data;
};

// ── Gap Analysis ───────────────────────────────────────────────────────────────
export const getGapAnalysis = async (
  profile: StudentProfile,
  universityId: string,
): Promise<GapAnalysisResponse> => {
  const { data } = await api.post("/gap/", { profile, universityId });
  return data;
};

// ── AI Insights ────────────────────────────────────────────────────────────────
export const getAIInsight = async (
  profile: StudentProfile,
  focusTopic?: string,
): Promise<AIInsightResponse> => {
  const { data } = await api.post("/ai/insight", { profile, focusTopic });
  return data;
};

// ── Roadmap ────────────────────────────────────────────────────────────────────
export const generateRoadmap = async (
  profile: StudentProfile,
  months = 6,
) : Promise<GeminiRoadmapResponse> => {
  const { data } = await api.post("/ai/roadmap", profile, {
    params: { months },
  });
  return data;
};
