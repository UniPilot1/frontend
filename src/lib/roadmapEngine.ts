import type {
  ECCategory,
  RoadmapMonth,
  RoadmapTask,
  StudentProfile,
  TimelineAnalysis,
  TimelineMilestone,
  UniversityMatch,
} from "@/types";
import { computeDimensionScores } from "./matchingEngine";

const MS_PER_DAY = 86_400_000;

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function daysBetween(start: Date, endIso: string): number {
  const end = new Date(`${endIso}T00:00:00`);
  return Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function deadlineUrgency(days: number): TimelineMilestone["urgency"] {
  if (days < 0) return "past";
  if (days <= 45) return "critical";
  if (days <= 120) return "soon";
  return "comfortable";
}

export function buildTimelineAnalysis(
  matches: UniversityMatch[],
  intakeYear: number,
  now = new Date(),
): TimelineAnalysis {
  const deadlineMap = new Map<string, TimelineMilestone>();

  matches.forEach((match) => {
    const deadlines = match.program.deadlines;
    const entries = [
      ["Early Action", deadlines.earlyAction],
      ["Early Decision", deadlines.earlyDecision],
      ["Regular Decision", deadlines.regularDecision],
      ["International", deadlines.international],
    ].filter((entry): entry is [string, string] => Boolean(entry[1]));

    entries.forEach(([label, date]) => {
      const key = `${label}-${date}`;
      const existing = deadlineMap.get(key);
      const daysRemaining = daysBetween(now, date);

      if (existing) {
        existing.universities.push(match.university.shortName);
        return;
      }

      deadlineMap.set(key, {
        id: key,
        label,
        date,
        daysRemaining,
        urgency: deadlineUrgency(daysRemaining),
        universities: [match.university.shortName],
      });
    });
  });

  const milestones = [...deadlineMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      ...m,
      universities: [...new Set(m.universities)].slice(0, 5),
    }));

  const firstDeadline = milestones.find((m) => m.daysRemaining >= 0) ?? null;
  const monthsRemaining = firstDeadline
    ? Math.max(1, Math.ceil(firstDeadline.daysRemaining / 30))
    : 0;

  return {
    today: toDateOnly(now),
    intakeLabel: `Fall ${intakeYear}`,
    firstDeadline,
    milestones,
    monthsRemaining,
    summary: firstDeadline
      ? `${firstDeadline.daysRemaining} days until ${firstDeadline.label} for ${firstDeadline.universities.slice(0, 2).join(", ")}.`
      : "All configured deadlines have passed. Update the intake year to rebuild the plan.",
  };
}

function task(
  id: string,
  title: string,
  description: string,
  why: string,
  category: RoadmapTask["category"],
  profileGain: number,
  universitiesImpacted: string[],
  difficulty: RoadmapTask["difficulty"] = "Medium",
  estimatedHours = 12,
): RoadmapTask {
  return {
    id,
    title,
    description,
    why,
    category,
    difficulty,
    estimatedHours,
    profileGain,
    universitiesImpacted,
    status: "todo",
  };
}

function targetUniversities(matches: UniversityMatch[]): string[] {
  return matches
    .slice(0, 5)
    .map((m) => m.university.shortName);
}

function buildImprovementTasks(
  profile: StudentProfile,
  matches: UniversityMatch[],
): RoadmapTask[] {
  const dims = computeDimensionScores(profile);
  const impacted = targetUniversities(matches);
  const tasks: RoadmapTask[] = [];

  if (dims.research < 7) {
    tasks.push(task(
      "research-sprint",
      "Secure a research-style project",
      "Pick one faculty-backed, mentor-backed, or publication-oriented project in your intended major and define a four-week output.",
      "Research is the largest gap signal for selective STEM programs and matters more than a small standardized-test bump once scores are already strong.",
      "Research",
      1.2,
      impacted,
      "Hard",
      30,
    ));
  }

  if (dims.techPortfolio < 7) {
    tasks.push(task(
      "portfolio-build",
      "Ship one serious portfolio artifact",
      "Build, document, and deploy a project with a clear user, demo, GitHub README, metrics, and reflection.",
      "For CS and engineering, visible proof of building ability helps admissions readers understand initiative beyond grades.",
      "Projects",
      1,
      impacted,
      "Medium",
      24,
    ));
  }

  if (dims.leadership < 6.5) {
    tasks.push(task(
      "leadership-proof",
      "Create measurable leadership evidence",
      "Lead a club sprint, organize a cohort, recruit contributors, or run a public workshop with attendance and outcome metrics.",
      "Leadership needs proof of ownership. A named role is useful, but measurable responsibility reads stronger.",
      "Leadership",
      0.9,
      impacted,
      "Medium",
      16,
    ));
  }

  if (dims.community < 6) {
    tasks.push(task(
      "impact-thread",
      "Turn service into a sustained impact thread",
      "Choose one community problem and commit to repeat work with a before-and-after metric.",
      "Sustained community impact balances a technical profile and gives essays a more human center.",
      "Volunteering",
      0.7,
      impacted,
      "Easy",
      10,
    ));
  }

  if ((profile.testScores.sat ?? 0) > 0 && (profile.testScores.sat ?? 0) < 1520) {
    tasks.push(task(
      "testing-polish",
      "Run a targeted testing sprint",
      "Focus only on the weakest SAT/ACT section with two timed diagnostics and an error log.",
      "A stronger score can protect target schools, but only after profile gaps are being addressed in parallel.",
      "Test Prep",
      0.6,
      impacted,
      "Medium",
      18,
    ));
  }

  return tasks;
}

export function buildRoadmap(
  profile: StudentProfile,
  matches: UniversityMatch[],
  timeline: TimelineAnalysis,
  now = new Date(),
): RoadmapMonth[] {
  const improvementTasks = buildImprovementTasks(profile, matches);
  const selectedMatches = matches.slice(0, 6);
  const topSchools = targetUniversities(selectedMatches);
  const monthsToPlan = Math.min(6, Math.max(3, timeline.monthsRemaining || 5));

  const applicationTasks = [
    task(
      "school-list",
      "Finalize balanced school list",
      "Lock a list with reach, target, and likely options across budget and country preferences.",
      "A balanced list prevents the plan from optimizing only for dream schools.",
      "Application",
      0.4,
      topSchools,
      "Easy",
      6,
    ),
    task(
      "essay-bank",
      "Build essay story bank",
      "Draft five reusable stories: intellectual curiosity, leadership, community, challenge, and why major.",
      "Strong essays convert raw activities into a coherent admissions narrative.",
      "Essays",
      0.8,
      topSchools,
      "Medium",
      14,
    ),
    task(
      "recommendations",
      "Prepare recommender packets",
      "Create a one-page summary for teachers with projects, grades, intended major, and specific examples.",
      "Specific recommendation letters can validate claims that are hard to prove in the activity list.",
      "Application",
      0.5,
      topSchools,
      "Easy",
      5,
    ),
    task(
      "deadline-submission",
      "Complete application QA",
      "Check portals, transcripts, score sends, essays, scholarships, and country-specific documents.",
      "Last-mile execution protects months of strategy from avoidable deadline or document errors.",
      "Application",
      0.6,
      topSchools,
      "Medium",
      10,
    ),
  ];

  const pool = [...improvementTasks, ...applicationTasks];

  return Array.from({ length: monthsToPlan }, (_, index) => {
    const date = addMonths(now, index);
    const phase = index < monthsToPlan - 2 ? "Profile lift" : index === monthsToPlan - 2 ? "Narrative" : "Submission";
    const pressure: RoadmapMonth["deadlinePressure"] =
      timeline.firstDeadline && timeline.firstDeadline.daysRemaining <= 45 + index * 30
        ? "high"
        : index >= monthsToPlan - 2
          ? "medium"
          : "low";

    const monthTasks = pool
      .filter((_, taskIndex) => taskIndex % monthsToPlan === index)
      .slice(0, 3);

    if (monthTasks.length < 2 && pool[index]) {
      monthTasks.push(pool[index]);
    }

    return {
      month: monthLabel(date),
      monthIndex: index + 1,
      theme: phase,
      deadlinePressure: pressure,
      tasks: monthTasks.map((roadmapTask, taskIndex) => ({
        ...roadmapTask,
        id: `${roadmapTask.id}-${index}-${taskIndex}`,
      })),
    };
  });
}

export function categoryLabel(category: RoadmapTask["category"]): string {
  const labels: Record<string, string> = {
    Projects: "Portfolio",
    Research: "Research",
    Olympiads: "Olympiads",
    Competitions: "Competitions",
    Hackathons: "Hackathons",
    Leadership: "Leadership",
    Clubs: "Clubs",
    Sports: "Sports",
    Volunteering: "Impact",
    Startups: "Startup",
    Internships: "Internship",
    Application: "Application",
    "Test Prep": "Testing",
    Essays: "Essays",
  };

  return labels[category as ECCategory] ?? category;
}
