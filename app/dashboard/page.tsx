"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

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

  return (
    <AppShell currentPath="/dashboard" title="Dashboard">
      <div className="space-y-8">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent updates</h2>
              <span className="text-xs text-muted-foreground">
                Latest 5
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20" />
                ))
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No updates yet.
                </p>
              ) : (
                updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-2xl border border-border bg-white p-4"
                  >
                    <p className="text-xs text-muted-foreground">
                      {update.project.name} · {formatDateTime(update.createdAt)}
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
