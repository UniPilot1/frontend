import type {
  StudentProfile, UniversityMatch, University, Program,
  MatchTier, AdmissionOutlook, MatchReason, DimensionGap,
  MatchingResponse,
} from "@/types";
import { scoreToTier, scoreToOutlook, clamp } from "./utils";

// ── Static university database ─────────────────────────────────────────────────
// In production this comes from Supabase. Here it's embedded for the engine demo.
export const UNIVERSITIES: (University & { programs: Program[] })[] = [
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    country: "United States",
    countryCode: "US",
    city: "Cambridge, MA",
    ranking: 1,
    websiteUrl: "https://mit.edu",
    acceptanceRate: 4,
    totalEnrollment: 11500,
    type: "Private",
    researchOutput: "Very High",
    tags: ["STEM", "Research", "Tech", "Top-3"],
    programs: [{
      id: "mit-cs",
      universityId: "mit",
      name: "Computer Science & Engineering",
      degree: "BS",
      major: "CS",
      tuitionUSD: 59750,
      duration: 4,
      deadlines: { earlyAction: "2026-11-01", regularDecision: "2027-01-01" },
      requirements: { minGPA: 3.9, minSAT: 1550, minACT: 35, minIELTS: 7.0, minTOEFL: 100, portfolioRequired: false, researchRequired: true },
      scholarships: [{ id: "mit-need", name: "MIT Need-Based Aid", amount: 55000, currency: "USD", eligibility: ["Need-based"], renewable: true }],
    }],
  },
  {
    id: "stanford",
    name: "Stanford University",
    shortName: "Stanford",
    country: "United States",
    countryCode: "US",
    city: "Stanford, CA",
    ranking: 3,
    websiteUrl: "https://stanford.edu",
    acceptanceRate: 4,
    totalEnrollment: 17000,
    type: "Private",
    researchOutput: "Very High",
    tags: ["STEM", "Research", "Entrepreneurship", "Top-5"],
    programs: [{
      id: "stanford-cs",
      universityId: "stanford",
      name: "Computer Science",
      degree: "BS",
      major: "CS",
      tuitionUSD: 62484,
      duration: 4,
      deadlines: { earlyAction: "2026-11-01", regularDecision: "2027-01-02" },
      requirements: { minGPA: 3.9, minSAT: 1540, minACT: 35, minIELTS: 7.0, minTOEFL: 100, portfolioRequired: false, researchRequired: true },
      scholarships: [{ id: "stanford-need", name: "Stanford Financial Aid", amount: 58000, currency: "USD", eligibility: ["Need-based"], renewable: true }],
    }],
  },
  {
    id: "cmu",
    name: "Carnegie Mellon University",
    shortName: "CMU",
    country: "United States",
    countryCode: "US",
    city: "Pittsburgh, PA",
    ranking: 25,
    websiteUrl: "https://cmu.edu",
    acceptanceRate: 11,
    totalEnrollment: 15000,
    type: "Private",
    researchOutput: "Very High",
    tags: ["CS", "AI", "Robotics", "Tech"],
    programs: [{
      id: "cmu-cs",
      universityId: "cmu",
      name: "Computer Science",
      degree: "BS",
      major: "CS",
      tuitionUSD: 61344,
      duration: 4,
      deadlines: { earlyDecision: "2026-11-01", regularDecision: "2027-01-01" },
      requirements: { minGPA: 3.7, minSAT: 1500, minACT: 34, minIELTS: 6.5, minTOEFL: 90, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "cmu-merit", name: "CMU Merit Scholarship", amount: 20000, currency: "USD", eligibility: ["Merit-based"], renewable: true }],
    }],
  },
  {
    id: "gatech",
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    country: "United States",
    countryCode: "US",
    city: "Atlanta, GA",
    ranking: 33,
    websiteUrl: "https://gatech.edu",
    acceptanceRate: 17,
    totalEnrollment: 39000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["Engineering", "CS", "AI", "Affordable"],
    programs: [{
      id: "gatech-cs",
      universityId: "gatech",
      name: "Computer Science",
      degree: "BS",
      major: "CS",
      tuitionUSD: 33794,
      duration: 4,
      deadlines: { earlyAction: "2026-10-15", regularDecision: "2027-01-04" },
      requirements: { minGPA: 3.6, minSAT: 1420, minACT: 32, minIELTS: 6.5, minTOEFL: 90, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "gt-intl", name: "Georgia Tech International Award", amount: 10000, currency: "USD", eligibility: ["International"], renewable: true }],
    }],
  },
  {
    id: "ucb",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    country: "United States",
    countryCode: "US",
    city: "Berkeley, CA",
    ranking: 30,
    websiteUrl: "https://berkeley.edu",
    acceptanceRate: 14,
    totalEnrollment: 45000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["CS", "Research", "Public Ivy", "West Coast"],
    programs: [{
      id: "ucb-eecs",
      universityId: "ucb",
      name: "EECS",
      degree: "BS",
      major: "CS",
      tuitionUSD: 43980,
      duration: 4,
      deadlines: { regularDecision: "2026-11-30" },
      requirements: { minGPA: 3.7, minSAT: 1450, minACT: 33, minIELTS: 6.5, minTOEFL: 80, portfolioRequired: false, researchRequired: false },
      scholarships: [],
    }],
  },
  {
    id: "imperial",
    name: "Imperial College London",
    shortName: "Imperial",
    country: "United Kingdom",
    countryCode: "GB",
    city: "London",
    ranking: 8,
    websiteUrl: "https://imperial.ac.uk",
    acceptanceRate: 14,
    totalEnrollment: 19000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["Engineering", "STEM", "London", "Top-10"],
    programs: [{
      id: "imperial-cs",
      universityId: "imperial",
      name: "Computing",
      degree: "BEng",
      major: "CS",
      tuitionUSD: 42500,
      duration: 3,
      deadlines: { regularDecision: "2027-01-15" },
      requirements: { minGPA: 3.8, minSAT: 1480, minACT: 33, minIELTS: 6.5, minTOEFL: 92, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "imperial-intl", name: "President's Scholarship", amount: 15000, currency: "GBP", eligibility: ["International", "Merit"], renewable: false }],
    }],
  },
  {
    id: "waterloo",
    name: "University of Waterloo",
    shortName: "Waterloo",
    country: "Canada",
    countryCode: "CA",
    city: "Waterloo, ON",
    ranking: 149,
    websiteUrl: "https://uwaterloo.ca",
    acceptanceRate: 53,
    totalEnrollment: 41000,
    type: "Public",
    researchOutput: "High",
    tags: ["CS", "Co-op", "Affordable", "Canada"],
    programs: [{
      id: "waterloo-cs",
      universityId: "waterloo",
      name: "Computer Science",
      degree: "BSc",
      major: "CS",
      tuitionUSD: 36000,
      duration: 4,
      deadlines: { regularDecision: "2027-04-01" },
      requirements: { minGPA: 3.5, minSAT: 1350, minIELTS: 6.5, minTOEFL: 90, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "uwaterloo-merit", name: "Waterloo Merit Scholarship", amount: 12000, currency: "CAD", eligibility: ["Merit"], renewable: false }],
    }],
  },
  {
    id: "nus",
    name: "National University of Singapore",
    shortName: "NUS",
    country: "Singapore",
    countryCode: "SG",
    city: "Singapore",
    ranking: 19,
    websiteUrl: "https://nus.edu.sg",
    acceptanceRate: 8,
    totalEnrollment: 40000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["Asia", "Research", "Affordable", "Top-20"],
    programs: [{
      id: "nus-cs",
      universityId: "nus",
      name: "Computer Science",
      degree: "BSc",
      major: "CS",
      tuitionUSD: 16000,
      duration: 4,
      deadlines: { regularDecision: "2027-03-01" },
      requirements: { minGPA: 3.7, minSAT: 1450, minIELTS: 6.5, minTOEFL: 85, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "nus-scholar", name: "NUS Global Merit Scholarship", amount: 14000, currency: "USD", eligibility: ["International", "Merit"], renewable: true }],
    }],
  },
  {
    id: "toronto",
    name: "University of Toronto",
    shortName: "U of T",
    country: "Canada",
    countryCode: "CA",
    city: "Toronto, ON",
    ranking: 25,
    websiteUrl: "https://utoronto.ca",
    acceptanceRate: 43,
    totalEnrollment: 97000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["Research", "Canada", "CS", "AI"],
    programs: [{
      id: "uoft-cs",
      universityId: "toronto",
      name: "Computer Science",
      degree: "BSc",
      major: "CS",
      tuitionUSD: 38000,
      duration: 4,
      deadlines: { regularDecision: "2027-01-13" },
      requirements: { minGPA: 3.6, minSAT: 1400, minIELTS: 6.5, minTOEFL: 89, portfolioRequired: false, researchRequired: false },
      scholarships: [],
    }],
  },
  {
    id: "tum",
    name: "Technical University of Munich",
    shortName: "TU Munich",
    country: "Germany",
    countryCode: "DE",
    city: "Munich",
    ranking: 37,
    websiteUrl: "https://tum.de",
    acceptanceRate: 8,
    totalEnrollment: 50000,
    type: "Public",
    researchOutput: "Very High",
    tags: ["Engineering", "Europe", "Affordable", "Research"],
    programs: [{
      id: "tum-cs",
      universityId: "tum",
      name: "Informatics",
      degree: "BSc",
      major: "CS",
      tuitionUSD: 3000,
      duration: 3,
      deadlines: { regularDecision: "2027-05-31" },
      requirements: { minGPA: 3.5, minIELTS: 6.5, minTOEFL: 88, portfolioRequired: false, researchRequired: false },
      scholarships: [{ id: "tum-daad", name: "DAAD Scholarship", amount: 8640, currency: "EUR", eligibility: ["International"], renewable: true }],
    }],
  },
];

// ── Scoring weights per dimension ──────────────────────────────────────────────
const WEIGHTS = {
  academics:    0.25,
  testing:      0.20,
  research:     0.18,
  leadership:   0.12,
  techPortfolio: 0.10,
  community:    0.08,
  initiative:   0.07,
};

// ── Profile → dimension scores ─────────────────────────────────────────────────
export function computeDimensionScores(profile: StudentProfile): Record<string, number> {
  const { academics, testScores, extracurriculars } = profile;

  // Academics: GPA → 0–10
  const academicsScore = clamp((academics.gpa / 4.0) * 10, 0, 10);

  // Testing: SAT-normalised
  const satScore  = testScores.sat  ? clamp(((testScores.sat  - 400) / 1200) * 10, 0, 10) : 0;
  const actScore  = testScores.act  ? clamp(((testScores.act  - 1)   / 35)   * 10, 0, 10) : 0;
  const testingScore = Math.max(satScore, actScore);

  // Research
  const researchCount = extracurriculars.filter(e =>
    ["Research", "Projects", "Olympiads"].includes(e.category)
  ).length;
  const hasLeadership = extracurriculars.some(e => e.leadershipLevel === "Founder" || e.leadershipLevel === "President");
  const researchScore = clamp(researchCount * 2 + (hasLeadership ? 1 : 0), 0, 10);

  // Leadership
  const leadershipPoints = extracurriculars.reduce((acc, e) => {
    const pts: Record<string, number> = { None: 0, Member: 1, Officer: 2, President: 3.5, Founder: 4 };
    return acc + (pts[e.leadershipLevel] || 0);
  }, 0);
  const leadershipScore = clamp(leadershipPoints * 0.8, 0, 10);

  // Tech portfolio
  const techCount = extracurriculars.filter(e =>
    ["Projects", "Hackathons", "Startups"].includes(e.category)
  ).length;
  const techScore = clamp(techCount * 1.8, 0, 10);

  // Community
  const communityCount = extracurriculars.filter(e =>
    ["Volunteering", "Clubs", "Sports"].includes(e.category)
  ).length;
  const communityScore = clamp(communityCount * 1.5, 0, 10);

  // Initiative
  const initiativeScore = clamp(
    (extracurriculars.filter(e => e.category === "Startups").length * 3) +
    (extracurriculars.filter(e => e.category === "Internships").length * 2),
    0, 10
  );

  return {
    academics: +academicsScore.toFixed(1),
    testing:   +testingScore.toFixed(1),
    research:  +researchScore.toFixed(1),
    leadership: +leadershipScore.toFixed(1),
    techPortfolio: +techScore.toFixed(1),
    community: +communityScore.toFixed(1),
    initiative: +initiativeScore.toFixed(1),
  };
}

// ── University match score ─────────────────────────────────────────────────────
function computeMatchScore(
  dims: Record<string, number>,
  program: Program,
  uni: University,
): number {
  const req = program.requirements;

  let score = 0;

  // Academic dimension: compare GPA
  const acadGpaTarget = req.minGPA ? clamp((req.minGPA / 4.0) * 10, 0, 10) : 7;
  const acadRatio = clamp(dims.academics / acadGpaTarget, 0, 1.2);
  score += acadRatio * WEIGHTS.academics * 100;

  // Testing
  const testTarget = req.minSAT
    ? clamp(((req.minSAT - 400) / 1200) * 10, 0, 10)
    : 7;
  const testRatio = clamp(dims.testing / testTarget, 0, 1.2);
  score += testRatio * WEIGHTS.testing * 100;

  // Research — very high requirement for top schools
  const researchTarget = uni.researchOutput === "Very High" ? 7 :
                         uni.researchOutput === "High"      ? 5 : 3;
  const researchRatio = clamp(dims.research / researchTarget, 0, 1.2);
  score += researchRatio * WEIGHTS.research * 100;

  // Leadership
  const leadershipTarget = uni.ranking <= 10 ? 7 : uni.ranking <= 50 ? 5 : 3;
  const leaderRatio = clamp(dims.leadership / leadershipTarget, 0, 1.2);
  score += leaderRatio * WEIGHTS.leadership * 100;

  // Tech Portfolio
  const techRatio = clamp(dims.techPortfolio / 6, 0, 1.2);
  score += techRatio * WEIGHTS.techPortfolio * 100;

  // Community
  const commRatio = clamp(dims.community / 5, 0, 1.2);
  score += commRatio * WEIGHTS.community * 100;

  // Initiative
  const initRatio = clamp(dims.initiative / 4, 0, 1.2);
  score += initRatio * WEIGHTS.initiative * 100;

  // Acceptance rate bonus: easier school = slightly higher match
  const acceptBonus = clamp((uni.acceptanceRate / 100) * 15, 0, 15);
  score = clamp(score + acceptBonus, 0, 99);

  return Math.round(score);
}

// ── Build match reasons ────────────────────────────────────────────────────────
function buildMatchReasons(
  dims: Record<string, number>,
  uni: University,
  program: Program,
): { reasons: MatchReason[]; gaps: DimensionGap[] } {
  const reasons: MatchReason[] = [];
  const gaps: DimensionGap[] = [];

  const checks = [
    { key: "academics",    label: "Academics",      required: program.requirements.minGPA ? clamp((program.requirements.minGPA / 4.0) * 10, 0, 10) : 7 },
    { key: "testing",      label: "Test scores",    required: program.requirements.minSAT ? clamp(((program.requirements.minSAT - 400) / 1200) * 10, 0, 10) : 7 },
    { key: "research",     label: "Research",       required: uni.researchOutput === "Very High" ? 7 : 5 },
    { key: "leadership",   label: "Leadership",     required: uni.ranking <= 10 ? 7 : 5 },
    { key: "techPortfolio", label: "Tech portfolio", required: 5 },
    { key: "community",    label: "Community",      required: 4 },
  ];

  for (const c of checks) {
    const val  = dims[c.key] ?? 0;
    const diff = val - c.required;

    gaps.push({ dimension: c.label, studentScore: val, requiredScore: c.required, gap: +diff.toFixed(1) });

    if (diff >= 1.5) {
      reasons.push({ dimension: c.label, status: "strength", detail: `Your ${c.label.toLowerCase()} (${val.toFixed(1)}) exceeds the typical admitted profile.` });
    } else if (diff <= -2) {
      reasons.push({ dimension: c.label, status: "gap", detail: `${c.label} is below the typical ${uni.shortName} admit threshold. Improving here has the highest ROI.` });
    } else {
      reasons.push({ dimension: c.label, status: "neutral", detail: `${c.label} is within the competitive range for ${uni.shortName}.` });
    }
  }

  return { reasons, gaps };
}

// ── Build outlook explanation ──────────────────────────────────────────────────
function buildOutlookExplanation(
  outlook: AdmissionOutlook,
  uni: University,
  dims: Record<string, number>,
): string {
  const topGap = Object.entries(dims)
    .sort(([, a], [, b]) => a - b)[0][0];

  const explanations: Record<AdmissionOutlook, string> = {
    "Highly Ambitious":
      `Your profile is well below the typical ${uni.shortName} admit. Significant improvement in ${topGap} and research is needed before applying.`,
    "Ambitious":
      `Your academics are competitive, but ${topGap} and leadership fall below the ${uni.shortName} admit median. Targeted improvements could shift this to Competitive.`,
    "Competitive":
      `Your profile aligns with the lower end of admitted students at ${uni.shortName}. Strengthening research and leadership could meaningfully improve your chances.`,
    "Strong Fit":
      `Solid match for ${uni.shortName}. Academics and testing meet expectations. A strong application essay and recommendations will be decisive.`,
    "Very Strong Fit":
      `Your profile closely mirrors the top quartile of ${uni.shortName} admits. Focus on essay quality and securing strong letters of recommendation.`,
  };

  return explanations[outlook];
}

// ── Main engine function ───────────────────────────────────────────────────────
export function runMatchingEngine(
  profile: StudentProfile,
  options?: { preferredCountries?: string[]; budgetMax?: number },
): MatchingResponse {
  const dims = computeDimensionScores(profile);
  const allMatches: UniversityMatch[] = [];

  for (const uni of UNIVERSITIES) {
    // Country filter
    if (options?.preferredCountries?.length &&
        !options.preferredCountries.includes(uni.country) &&
        !options.preferredCountries.includes("Any")) {
      continue;
    }

    for (const program of uni.programs) {
      // Budget filter
      if (options?.budgetMax && program.tuitionUSD > options.budgetMax) continue;

      const matchScore = computeMatchScore(dims, program, uni);
      const tier       = scoreToTier(matchScore) as MatchTier;
      const outlook    = scoreToOutlook(matchScore) as AdmissionOutlook;
      const { reasons, gaps } = buildMatchReasons(dims, uni, program);

      allMatches.push({
        id:          `${uni.id}-${program.id}`,
        university:  uni,
        program,
        tier,
        matchScore,
        outlook,
        outlookExplanation: buildOutlookExplanation(outlook, uni, dims),
        matchReasons: reasons,
        dimensionGaps: gaps,
        isSaved: false,
      });
    }
  }

  // Sort within tiers by matchScore desc
  const sorted = allMatches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    reach:        sorted.filter(m => m.tier === "Reach"),
    target:       sorted.filter(m => m.tier === "Target"),
    likely:       sorted.filter(m => m.tier === "Likely"),
    totalMatched: sorted.length,
    generatedAt:  new Date().toISOString(),
    aiInsight: `Based on your profile, improving research experience would unlock ${
      sorted.filter(m => m.tier === "Reach").length
    } more Reach schools. Your testing score is your strongest asset — lead with it in every application.`,
  };
}
