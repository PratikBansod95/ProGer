"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskList, TaskItem } from "@/components/tasks/TaskList";
import { TaskModal } from "@/components/tasks/TaskModal";
import { TaskPanel } from "@/components/tasks/TaskPanel";
import { GanttView } from "@/components/tasks/GanttView";
import { UpdateFeed } from "@/components/updates/UpdateFeed";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/components/tasks/task-utils";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  note?: { content: string } | null;
  members: { user: UserItem; role: "PM" | "DEV" | "STAKEHOLDER" }[];
  tasks: TaskItem[];
  updates: UpdateItem[];
}

interface UpdateItem {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

interface UserItem {
  id: string;
  name: string;
  role: "PM" | "DEV" | "STAKEHOLDER";
}

interface CurrentUserInfo {
  id: string;
  role: "PM" | "DEV" | "STAKEHOLDER";
}

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserInfo | null>(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("DEV");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [taskStatusPreset, setTaskStatusPreset] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    const [projectRes, usersRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`, { cache: "no-store" }),
      fetch("/api/users", { cache: "no-store" }),
    ]);
    const projectData = await projectRes.json();
    const usersData = await usersRes.json();
    setProject(projectData.project ?? null);
    setUsers(usersData.users ?? []);
    setCurrentUser(
      usersData.meId
        ? { id: usersData.meId, role: usersData.meRole }
        : null
    );
    setNote(projectData.project?.note?.content ?? "");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, status: string) => {
    const task = project?.tasks.find((item) => item.id === taskId);
    if (!task || !canEditTask(task)) return;
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSavingNote(false);
  };

  const addMember = async () => {
    if (!newMemberId) return;
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addMemberId: newMemberId, addMemberRole: newMemberRole }),
    });
    setMemberModalOpen(false);
    setNewMemberId("");
    setNewMemberRole("DEV");
    load();
  };

  const currentRole = currentUser?.role;
  const canReassign = currentRole === "PM";

  const canEditTask = (task: TaskItem) => {
    if (!currentUser) return false;
    if (currentRole === "PM") return true;
    if (currentRole === "DEV") return task.assignee?.id === currentUser.id;
    return false;
  };

  const canDragTask = (task: TaskItem) => {
    return canEditTask(task);
  };

  const filteredTasks = useMemo(() => {
    if (!project) return [];
    if (categoryFilter === "ALL") return project.tasks;
    return project.tasks.filter((task) => task.category === categoryFilter);
  }, [project, categoryFilter]);

  const calendarItems = useMemo(() => {
    if (!project) return [];
    return project.tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.dueDate as string,
        assignee: task.assignee?.name ?? "",
      }));
  }, [project]);

  return (
    <AppShell currentPath="/projects" title={project?.name ?? "Project"}>
      {loading || !project ? (
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {project.members.map((member) => (
                  <span
                    key={member.user.id}
                    className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {member.user.name} · {member.role}
                  </span>
                ))}
                {currentRole === "PM" && (
                  <Button
                    variant="outline"
                    onClick={() => setMemberModalOpen(true)}
                  >
                    Add member
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setView("list")}>
                List view
              </Button>
              <Button variant="outline" onClick={() => setView("kanban")}>
                Kanban view
              </Button>
              <Button
                onClick={() => {
                  setTaskStatusPreset(undefined);
                  setTaskModalOpen(true);
                }}
              >
                New task
              </Button>
            </div>
          </div>
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="gantt">Gantt</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      className={`rounded-full border border-border px-3 py-1 text-xs transition ${
                        categoryFilter === cat.value
                          ? "bg-white/10 text-foreground"
                          : "text-muted-foreground hover:bg-white/5"
                      }`}
                      onClick={() => setCategoryFilter(cat.value)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <Badge variant="outline">
                  {filteredTasks.length} tasks
                </Badge>
              </div>
              {view === "kanban" ? (
                <KanbanBoard
                  tasks={filteredTasks}
                  onStatusChange={handleStatusChange}
                  onSelect={(task) => setSelectedTask(task)}
                  canDragTask={canDragTask}
                  onAddTask={(status) => {
                    setTaskStatusPreset(status);
                    setTaskModalOpen(true);
                  }}
                />
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  onSelect={(task) => setSelectedTask(task)}
                />
              )}
            </TabsContent>
            <TabsContent value="updates">
              <UpdateFeed
                updates={project.updates}
                projectId={project.id}
                onPosted={load}
              />
            </TabsContent>
            <TabsContent value="calendar">
              <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {calendarItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tasks with due dates yet.
                    </p>
                  ) : (
                    calendarItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-white/5 p-4"
                      >
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {formatDate(item.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assignee: {item.assignee}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-6">
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Capture notes for stakeholders..."
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={saveNote} disabled={savingNote}>
                    {savingNote ? "Saving..." : "Save notes"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="gantt">
              <GanttView tasks={project.tasks} />
            </TabsContent>
          </Tabs>
        </div>
      )}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={(open) => {
          setTaskModalOpen(open);
          if (!open) setTaskStatusPreset(undefined);
        }}
        users={users}
        projectId={projectId}
        onCreated={load}
        currentUserId={currentUser?.id ?? null}
        currentUserRole={currentUser?.role ?? null}
        defaultStatus={taskStatusPreset}
      />
      <TaskPanel
        task={selectedTask}
        users={users}
        onClose={() => setSelectedTask(null)}
        onUpdated={() => {
          load();
          setSelectedTask(null);
        }}
        canEdit={selectedTask ? canEditTask(selectedTask) : false}
        canReassign={canReassign}
        projectId={projectId}
      />
      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Assign a teammate to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Select value={newMemberId} onValueChange={setNewMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teammate" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} · {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newMemberRole} onValueChange={setNewMemberRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PM">PM</SelectItem>
                <SelectItem value="DEV">DEV</SelectItem>
                <SelectItem value="STAKEHOLDER">Stakeholder</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMemberModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addMember} disabled={!newMemberId}>
                Add member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
