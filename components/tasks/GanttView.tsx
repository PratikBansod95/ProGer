"use client";

import { TaskItem } from "@/components/tasks/TaskList";
import { formatDate } from "@/lib/utils";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDate(value?: string | null) {
  if (!value) return new Date();
  return new Date(value);
}

const priorityColor: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-cyan-400",
};

const statusColor: Record<string, string> = {
  DONE: "bg-emerald-500/40 border-emerald-400/60",
  IN_PROGRESS: "bg-amber-500/40 border-amber-400/60",
  TODO: "bg-slate-400/40 border-slate-300/60",
  REVIEW: "bg-yellow-500/40 border-yellow-400/60",
  REQUEST: "bg-purple-500/40 border-purple-400/60",
};

export function GanttView({ tasks }: { tasks: TaskItem[] }) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6 text-sm text-muted-foreground">
        No tasks yet. Create one to see it on the timeline.
      </div>
    );
  }

  const ranges = tasks.map((task) => {
    const start = normalizeDate(task.createdAt);
    const end = task.dueDate
      ? new Date(task.dueDate)
      : new Date(start.getTime() + MS_PER_DAY);
    return { start, end };
  });

  const minDate = new Date(Math.min(...ranges.map((range) => range.start.getTime())));
  const maxDate = new Date(Math.max(...ranges.map((range) => range.end.getTime())));
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / MS_PER_DAY));

  return (
    <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(minDate)}</span>
        <span>{formatDate(maxDate)}</span>
      </div>
      <div className="mt-6 space-y-4">
        {tasks.map((task) => {
          const start = normalizeDate(task.createdAt);
          const end = task.dueDate
            ? new Date(task.dueDate)
            : new Date(start.getTime() + MS_PER_DAY);
          const offsetDays = Math.max(0, Math.floor((start.getTime() - minDate.getTime()) / MS_PER_DAY));
          const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
          const left = (offsetDays / totalDays) * 100;
          const width = (durationDays / totalDays) * 100;

          return (
            <div key={task.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignee?.name ?? "Unassigned"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
                </span>
              </div>
              <div className="relative h-6 rounded-full border border-white/10 bg-white/5">
                <div
                  className={`absolute top-1 h-4 rounded-md border ${
                    statusColor[task.status] ?? "bg-slate-400/40 border-slate-300/60"
                  }`}
                  style={{ left: `${left}%`, width: `${Math.max(6, width)}%` }}
                >
                  <span
                    className={`absolute left-0 top-0 h-4 w-1 rounded-l-md ${
                      priorityColor[task.priority] ?? "bg-cyan-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
