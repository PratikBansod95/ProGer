"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  members: { id: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/projects", { cache: "no-store" });
    const data = await res.json();
    setProjects(data.projects ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async () => {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setOpen(false);
    setName("");
    setDescription("");
    load();
  };

  return (
    <AppShell currentPath="/projects" title="Projects">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All projects</h2>
          <p className="text-sm text-muted-foreground">
            Organize work, tasks, and updates.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>New project</Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet. Create one to get started.
          </p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              memberCount={project.members.length}
            />
          ))
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Spin up a new delivery space for your team.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Textarea
              placeholder="Project description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createProject} disabled={!name}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
