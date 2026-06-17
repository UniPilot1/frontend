"use client";

import { motion } from "framer-motion";
import { CalendarClock, Check, Circle, Clock3, Target, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { categoryLabel } from "@/lib/roadmapEngine";
import { cn, formatDate, urgencyColor } from "@/lib/utils";
import type { RoadmapTask } from "@/types";

const STATUS_OPTIONS: RoadmapTask["status"][] = ["todo", "in_progress", "done"];

export function StrategistRoadmap() {
  const { timeline, roadmap, matchingResult, updateTaskStatus } = useStore();
  const topReach = matchingResult.reach[0];
  const bestRealistic = matchingResult.target[0] ?? matchingResult.likely[0] ?? matchingResult.reach[0];
  const allTasks = roadmap.flatMap(month => month.tasks);
  const completed = allTasks.filter(task => task.status === "done").length;
  const completion = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;

  return (
    <section className="mb-6 grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-5">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 text-brand-400 mb-4">
          <Target size={15} />
          <p className="text-xs uppercase tracking-wider">Strategy answer</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/35 mb-1">Best realistic reach</p>
            <h2 className="text-xl font-semibold text-white">
              {bestRealistic ? bestRealistic.university.name : "Add more profile details"}
            </h2>
            {bestRealistic && (
              <p className="text-sm text-white/45 mt-1">
                {bestRealistic.outlook} for {bestRealistic.program.name}. Current tier: {bestRealistic.tier}.
              </p>
            )}
          </div>

          {topReach && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/7 p-3">
              <p className="text-xs text-red-300 mb-1">Stretch ceiling</p>
              <p className="text-sm text-white/70">
                {topReach.university.shortName} stays possible only if the top roadmap gaps improve before early deadlines.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Metric label="First deadline" value={timeline.firstDeadline ? `${timeline.firstDeadline.daysRemaining}d` : "N/A"} />
            <Metric label="Plan length" value={`${roadmap.length} mo`} />
            <Metric label="Progress" value={`${completion}%`} />
          </div>

          <div>
            <p className="text-xs text-white/35 uppercase tracking-wider mb-3">Timeline</p>
            <div className="space-y-2">
              {timeline.milestones.slice(0, 4).map(milestone => (
                <div key={milestone.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                  <div>
                    <p className="text-xs text-white/70">{milestone.label}</p>
                    <p className="text-[11px] text-white/35">
                      {formatDate(milestone.date)} - {milestone.universities.join(", ")}
                    </p>
                  </div>
                  <span className={cn("text-xs font-semibold", urgencyColor(milestone.daysRemaining))}>
                    {milestone.daysRemaining}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-brand-400">
            <CalendarClock size={15} />
            <p className="text-xs uppercase tracking-wider">Month-by-month roadmap</p>
          </div>
          <p className="text-xs text-white/35">{timeline.summary}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {roadmap.map((month, index) => (
            <motion.div
              key={`${month.month}-${month.monthIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-xl border border-white/6 bg-white/[0.025] p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{month.month}</p>
                  <p className="text-[11px] text-white/35">{month.theme}</p>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-1 rounded-full border",
                  month.deadlinePressure === "high"
                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                    : month.deadlinePressure === "medium"
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                      : "border-green-500/20 bg-green-500/8 text-green-300"
                )}>
                  {month.deadlinePressure} pressure
                </span>
              </div>

              <div className="space-y-3">
                {month.tasks.map(task => (
                  <div key={task.id} className="rounded-lg bg-surface-1/70 border border-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/12 text-brand-300">
                            {categoryLabel(task.category)}
                          </span>
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Clock3 size={10} /> {task.estimatedHours}h
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white/85">{task.title}</p>
                        <p className="text-xs text-white/42 leading-relaxed mt-1">{task.description}</p>
                        <p className="text-xs text-white/32 leading-relaxed mt-2">
                          <Zap size={11} className="inline mr-1 text-amber-300" />
                          {task.why}
                        </p>
                        <p className="text-[11px] text-white/28 mt-2">
                          Helps: {task.universitiesImpacted.join(", ") || "overall application strength"}
                        </p>
                      </div>
                      <StatusButton status={task.status} onNext={() => {
                        const nextIndex = (STATUS_OPTIONS.indexOf(task.status) + 1) % STATUS_OPTIONS.length;
                        updateTaskStatus(task.id, STATUS_OPTIONS[nextIndex]);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
      <p className="text-[10px] text-white/35">{label}</p>
      <p className="text-lg font-semibold text-white mt-0.5">{value}</p>
    </div>
  );
}

function StatusButton({ status, onNext }: { status: RoadmapTask["status"]; onNext: () => void }) {
  const label = status === "todo" ? "Todo" : status === "in_progress" ? "Doing" : "Done";
  return (
    <button
      onClick={onNext}
      className={cn(
        "shrink-0 h-8 min-w-16 px-2 rounded-lg border text-[11px] flex items-center justify-center gap-1.5 transition-colors",
        status === "done"
          ? "bg-green-500/12 border-green-500/25 text-green-300"
          : status === "in_progress"
            ? "bg-amber-500/12 border-amber-500/25 text-amber-300"
            : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white/70"
      )}
    >
      {status === "done" ? <Check size={12} /> : <Circle size={11} />}
      {label}
    </button>
  );
}
