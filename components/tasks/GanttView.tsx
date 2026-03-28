"use client";

import { TaskItem } from "@/components/tasks/TaskList";
import { formatDate } from "@/lib/utils";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDate(value?: string | null) {
  if (!value) return new Date();
  return new Date(value);
}

export function GanttView({ tasks }: { tasks: TaskItem[] }) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
        No tasks yet. Create one to see it on the timeline.
      </div>
    );
  }

  const ranges = tasks.map((task) => {
    const start = normalizeDate(task.createdAt);
    const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + MS_PER_DAY);
    return { start, end };
  });

  const minDate = new Date(Math.min(...ranges.map((range) => range.start.getTime())));
  const maxDate = new Date(Math.max(...ranges.map((range) => range.end.getTime())));
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / MS_PER_DAY));

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(minDate)}</span>
        <span>{formatDate(maxDate)}</span>
      </div>
      <div className="mt-6 space-y-4">
        {tasks.map((task) => {
          const start = normalizeDate(task.createdAt);
          const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + MS_PER_DAY);
          const offsetDays = Math.max(0, Math.floor((start.getTime() - minDate.getTime()) / MS_PER_DAY));
          const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
          const left = (offsetDays / totalDays) * 100;
          const width = (durationDays / totalDays) * 100;

          return (
            <div key={task.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{task.title}</span>
                <span className="text-xs text-muted-foreground">
                  {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted">
                <div
                  className="absolute top-0 h-3 rounded-full bg-primary"
                  style={{ left: `${left}%`, width: `${Math.max(4, width)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Gantt view uses task creation date as the start until a start date is added in V2.
      </p>
    </div>
  );
}
