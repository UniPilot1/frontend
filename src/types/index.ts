// ── Student Profile ────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  name: string;
  country: string;
  intakeYear: number;
  intendedMajor: string;
  preferredCountries: string[];
  budgetRange: BudgetRange;
  financialAidRequired?: boolean;
  academics: AcademicProfile;
  testScores: TestScores;
  extracurriculars: Extracurricular[];
  careerGoals: CareerGoals;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicProfile {
  curriculum: "CBSE" | "ICSE" | "IB" | "A_LEVELS" | "AP" | "OTHER";
  gpa: number;
  percentage: number;
  predictedGrades?: string;
}

export interface TestScores {
  sat?: number;
  act?: number;
  ielts?: number;
  toefl?: number;
  duolingo?: number;
  apScores?: APScore[];
  jee?: number;
  bitsat?: number;
}

export interface APScore {
  subject: string;
  score: number;
}

export interface Extracurricular {
  id: string;
  category: ECCategory;
  title: string;
  description: string;
  duration: string;
  impact: string;
  awards?: string;
  leadershipLevel: "None" | "Member" | "Officer" | "President" | "Founder";
}

export type ECCategory =
  | "Projects" | "Research" | "Olympiads" | "Competitions"
  | "Hackathons" | "Leadership" | "Clubs" | "Sports"
  | "Volunteering" | "Startups" | "Internships";

export interface CareerGoals {
  intendedMajor: string;
  dreamUniversities: string[];
  preferredCountries: string[];
  financialAidRequired: boolean;
}

export type BudgetRange = "under_20k" | "20k_40k" | "40k_60k" | "60k_plus" | "any";

// ── Profile Dimensions ─────────────────────────────────────────────────────────
export interface ProfileDimension {
  key: string;
  label: string;
  score: number;
  maxScore: 10;
  level: "Weak" | "Below Average" | "Average" | "Above Average" | "Strong" | "Exceptional";
  explanation: string;
  improvementTip: string;
}

export interface ProfileEvaluation {
  overallScore: number;
  dimensions: ProfileDimension[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export interface ProfileEvaluationResponse extends ProfileEvaluation {
  aiNarrative?: string;
}

// ── University Matching ────────────────────────────────────────────────────────
export type MatchTier = "Reach" | "Target" | "Likely";
export type AdmissionOutlook =
  | "Highly Ambitious" | "Ambitious" | "Competitive"
  | "Strong Fit" | "Very Strong Fit";

export interface UniversityMatch {
  id: string;
  university: University;
  program: Program;
  tier: MatchTier;
  matchScore: number;
  outlook: AdmissionOutlook;
  outlookExplanation: string;
  matchReasons: MatchReason[];
  dimensionGaps: DimensionGap[];
  isSaved: boolean;
}

export interface MatchReason {
  dimension: string;
  status: "strength" | "gap" | "neutral";
  detail: string;
}

export interface DimensionGap {
  dimension: string;
  studentScore: number;
  requiredScore: number;
  gap: number;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  city: string;
  ranking: number;
  logoUrl?: string;
  websiteUrl: string;
  acceptanceRate: number;
  totalEnrollment: number;
  type: "Public" | "Private";
  researchOutput: "Very High" | "High" | "Medium" | "Low";
  tags: string[];
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degree: "BS" | "BE" | "BTech" | "BEng" | "BA" | "BSc";
  major: string;
  tuitionUSD: number;
  duration: number;
  deadlines: Deadlines;
  requirements: Requirements;
  scholarships: Scholarship[];
}

export interface Deadlines {
  earlyAction?: string;
  earlyDecision?: string;
  regularDecision: string;
  international?: string;
}

export interface Requirements {
  minGPA?: number;
  minSAT?: number;
  minACT?: number;
  minIELTS?: number;
  minTOEFL?: number;
  portfolioRequired: boolean;
  researchRequired: boolean;
  notes?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  currency: string;
  eligibility: string[];
  deadline?: string;
  renewable: boolean;
}

// ── Roadmap ────────────────────────────────────────────────────────────────────
export interface RoadmapMonth {
  month: string;
  monthIndex: number;
  theme?: string;
  deadlinePressure?: "low" | "medium" | "high";
  tasks: RoadmapTask[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  why: string;
  category: ECCategory | "Application" | "Test Prep" | "Essays";
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedHours: number;
  profileGain: number;
  universitiesImpacted: string[];
  status: "todo" | "in_progress" | "done";
}

export interface TimelineMilestone {
  id: string;
  label: string;
  date: string;
  daysRemaining: number;
  urgency: "past" | "critical" | "soon" | "comfortable";
  universities: string[];
}

export interface TimelineAnalysis {
  today: string;
  intakeLabel: string;
  firstDeadline: TimelineMilestone | null;
  milestones: TimelineMilestone[];
  monthsRemaining: number;
  summary: string;
}

// ── Gap Analysis ───────────────────────────────────────────────────────────────
export interface GapAnalysis {
  universityId: string;
  programId: string;
  strengths: GapItem[];
  weaknesses: GapItem[];
  topGaps: GapItem[];
  admissionLikelihood: number;
  keyInsight: string;
}

export interface GapAnalysisResponse extends GapAnalysis {
  universityName?: string;
  aiRecommendations?: string[];
}

export interface GapItem {
  dimension: string;
  studentValue: number;
  benchmarkValue: number;
  delta: number;
  severity: "Critical" | "Moderate" | "Minor" | "Positive";
}

// ── AI Report ─────────────────────────────────────────────────────────────────
export interface AIReport {
  id: string;
  profileId: string;
  generatedAt: string;
  evaluation: ProfileEvaluation;
  matches: UniversityMatch[];
  roadmap: RoadmapMonth[];
  gapAnalyses: GapAnalysis[];
  topRecommendation: string;
}

// ── API Responses ──────────────────────────────────────────────────────────────
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AIInsightResponse {
  insight: string;
  actionItems: string[];
  generatedAt: string;
}

export interface GeminiRoadmapResponse {
  roadmap: Array<{
    month: string;
    tasks: Array<Omit<RoadmapTask, "id" | "status"> & {
      id?: string;
      status?: RoadmapTask["status"];
    }>;
  }>;
  generatedAt: string;
}

export interface MatchingRequest {
  profile: StudentProfile;
  targetMajor: string;
  preferredCountries: string[];
  budgetMax?: number;
  includeScholarships?: boolean;
}

export interface MatchingResponse {
  reach: UniversityMatch[];
  target: UniversityMatch[];
  likely: UniversityMatch[];
  totalMatched: number;
  generatedAt: string;
  aiInsight: string;
}
