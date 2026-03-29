"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  members: { id: string }[];
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: { name: string } | null;
  dueDate?: string | null;
  project?: { id: string; name: string } | null;
}

interface UpdateItem {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
  project: { name: string };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [projectRes, taskRes, updateRes] = await Promise.all([
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/tasks?mine=1", { cache: "no-store" }),
        fetch("/api/updates?recent=1", { cache: "no-store" }),
      ]);
      const projectData = await projectRes.json();
      const taskData = await taskRes.json();
      const updateData = await updateRes.json();
      setProjects(projectData.projects ?? []);
      setTasks(taskData.tasks ?? []);
      setUpdates(updateData.updates ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const dueThisWeek = useMemo(() => {
    const now = new Date();
    const week = new Date(now);
    week.setDate(now.getDate() + 7);
    return tasks.filter((task) =>
      task.dueDate
        ? new Date(task.dueDate) <= week && new Date(task.dueDate) >= now
        : false
    );
  }, [tasks]);

  const doneThisWeek = useMemo(() => {
    return tasks.filter((task) => task.status === "DONE");
  }, [tasks]);

  return (
    <AppShell currentPath="/dashboard" title="Dashboard">
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-5 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects in progress</p>
                  <p className="text-3xl font-semibold">{projects.length}</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                {projects.slice(0, 4).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <span>{project.name}</span>
                    <span>{project.members.length} members</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-5 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks due this week</p>
                  <p className="text-3xl font-semibold">{dueThisWeek.length}</p>
                </div>
                <Badge variant="outline">Due soon</Badge>
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                {dueThisWeek.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <span>{task.assignee?.name ?? ""}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-5 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed this week</p>
                  <p className="text-3xl font-semibold">{doneThisWeek.length}</p>
                </div>
                <Badge variant="outline">Great pace</Badge>
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                {doneThisWeek.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <span>Done</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project progress overview</h3>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10" />
                  ))}
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{project.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {project.members.length} members
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
                        style={{ width: `${Math.min(90, project.members.length * 18)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent activity</h3>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16" />
                ))
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-[linear-gradient(180deg,var(--primary),var(--accent))]" />
                    <div>
                      <p className="text-sm">{update.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.author.name} - {update.project.name} - {formatDateTime(update.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <span className="text-xs text-muted-foreground">
              {projects.length} active
            </span>
          </div>
          {loading ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-40" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No projects yet. Create one to get started.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  memberCount={project.members.length}
                />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My tasks</h2>
              <span className="text-xs text-muted-foreground">
                {tasks.length} tasks
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have no tasks assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    assignee={task.assignee?.name}
                    dueDate={task.dueDate}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent updates</h3>
              <span className="text-xs text-muted-foreground">Latest 5</span>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20" />
                ))
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-2xl border border-border bg-white/5 p-4"
                  >
                    <p className="text-xs text-muted-foreground">
                      {update.project.name} - {formatDateTime(update.createdAt)}
                    </p>
                    <p className="mt-2 text-sm">{update.content}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {update.author.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
