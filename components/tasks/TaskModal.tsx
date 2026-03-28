"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserItem {
  id: string;
  name: string;
  role: "PM" | "DEV" | "STAKEHOLDER";
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserItem[];
  projectId: string;
  onCreated: () => void;
  currentUserId: string | null;
  currentUserRole?: "PM" | "DEV" | "STAKEHOLDER" | null;
}

export function TaskModal({
  open,
  onOpenChange,
  users,
  projectId,
  onCreated,
  currentUserId,
  currentUserRole,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && (currentUserRole === "DEV" || currentUserRole === "STAKEHOLDER")) {
      setAssigneeId(currentUserId);
    }
  }, [currentUserId, currentUserRole]);

  const createTask = async () => {
    setLoading(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        assigneeId: assigneeId || currentUserId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        projectId,
      }),
    });
    setLoading(false);
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority("MEDIUM");
    setDueDate("");
    onOpenChange(false);
    onCreated();
  };

  const assigneeLocked = currentUserRole === "DEV" || currentUserRole === "STAKEHOLDER";
  const roleHint =
    currentUserRole === "STAKEHOLDER"
      ? "Stakeholder tasks are created as requests."
      : currentUserRole === "DEV"
      ? "Developers can only assign tasks to themselves."
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Assign work instantly. Stakeholder tasks become requests.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            placeholder="Describe the task"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={assigneeId} onValueChange={setAssigneeId} disabled={assigneeLocked}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} · {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {roleHint && (
            <p className="text-xs text-muted-foreground">{roleHint}</p>
          )}
          <Input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={createTask} disabled={loading || !title}>
              {loading ? "Creating..." : "Create task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
