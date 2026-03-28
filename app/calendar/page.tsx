"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  project: { name: string };
  assignee?: { name: string } | null;
}

interface LeaveItem {
  id: string;
  startDate: string;
  endDate: string;
  user: { name: string };
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [taskRes, userRes] = await Promise.all([
        fetch("/api/tasks?withProject=1", { cache: "no-store" }),
        fetch("/api/users?includeLeaves=1", { cache: "no-store" }),
      ]);
      const taskData = await taskRes.json();
      const userData = await userRes.json();
      const sortedTasks = (taskData.tasks ?? []).sort(
        (a: TaskItem, b: TaskItem) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      setTasks(sortedTasks);
      setLeaves(userData.leaves ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppShell currentPath="/calendar" title="Calendar">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold">Upcoming tasks</h2>
          <p className="text-sm text-muted-foreground">
            Due dates across all projects.
          </p>
          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks with due dates yet.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-border bg-muted/50 p-4"
                >
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.project.name} · Due {formatDate(task.dueDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assignee: {task.assignee?.name ?? "Unassigned"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold">Team leaves</h2>
          <p className="text-sm text-muted-foreground">
            Planned time off to keep scheduling realistic.
          </p>
          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))
            ) : leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming leaves registered.
              </p>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-2xl border border-border bg-muted/50 p-4"
                >
                  <p className="text-sm font-semibold">{leave.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
