"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDateTime } from "@/lib/utils";
import { TaskItem } from "@/components/tasks/TaskList";
import { Badge } from "@/components/ui/badge";
import { statusColors } from "@/components/tasks/task-utils";

interface UserItem {
  id: string;
  name: string;
  role: "PM" | "DEV" | "STAKEHOLDER";
}

interface TaskPanelProps {
  task: TaskItem | null;
  users: UserItem[];
  onClose: () => void;
  onUpdated: () => void;
  canEdit: boolean;
  canReassign?: boolean;
  projectId: string;
}

export function TaskPanel({
  task,
  users,
  onClose,
  onUpdated,
  canEdit,
  canReassign = false,
  projectId,
}: TaskPanelProps) {
  const [form, setForm] = useState<TaskItem | null>(task);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<
    { id: string; content: string; createdAt: string; author: { name: string } }[]
  >([]);

  useEffect(() => {
    setForm(task);
  }, [task]);

  useEffect(() => {
    const loadActivity = async () => {
      if (!task) return;
      const res = await fetch(`/api/updates?projectId=${projectId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      const list = (data.updates ?? []).filter((item: any) =>
        item.content.toLowerCase().includes(task.title.toLowerCase())
      );
      setActivity(list.slice(0, 5));
    };
    loadActivity();
  }, [task, projectId]);

  if (!form) return null;

  const update = async () => {
    setSaving(true);
    await fetch(`/api/tasks/${form.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assignee?.id,
        dueDate: form.dueDate,
      }),
    });
    setSaving(false);
    onUpdated();
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 h-full w-full max-w-lg transform bg-white shadow-2xl transition duration-300",
        task ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Task detail</p>
              <div className="mt-2 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{form.title}</h2>
                <Badge className={cn("border-0", statusColors[form.status])}>
                  {form.status.replaceAll("_", " ")}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Title</p>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Description
            </p>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Status
              </p>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="REQUEST">Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Priority
              </p>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm({ ...form, priority: value })
                }
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Assignee
            </p>
            <Select
              value={form.assignee?.id ?? ""}
              onValueChange={(value) => {
                const user = users.find((item) => item.id === value);
                setForm({
                  ...form,
                  assignee: user ? { name: user.name, id: user.id } : null,
                });
              }}
              disabled={!canReassign}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Due</p>
            <Input
              type="date"
              value={form.dueDate ? form.dueDate.slice(0, 10) : ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  dueDate: event.target.value
                    ? new Date(event.target.value).toISOString()
                    : null,
                })
              }
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                Activity log
              </p>
              <span className="text-xs text-muted-foreground">
                {activity.length} items
              </span>
            </div>
            {activity.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No task-specific updates yet.
              </p>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => (
                  <div key={item.id} className="rounded-xl bg-white p-3">
                    <p className="text-xs text-muted-foreground">
                      {item.author.name} · {formatDateTime(item.createdAt)}
                    </p>
                    <p className="text-sm">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border p-6">
          <Button
            className="w-full"
            onClick={update}
            disabled={!canEdit || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
          {!canEdit && (
            <p className="mt-3 text-xs text-muted-foreground">
              You can view this task, but only assigned owners or PMs can edit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
