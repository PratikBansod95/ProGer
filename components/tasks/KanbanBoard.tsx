"use client";

import { useMemo } from "react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskItem } from "@/components/tasks/TaskList";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "REQUEST",
] as const;

export function KanbanBoard({
  tasks,
  onStatusChange,
  onSelect,
  canDragTask,
  onAddTask,
}: {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, status: string) => void;
  onSelect: (task: TaskItem) => void;
  canDragTask?: (task: TaskItem) => boolean;
  onAddTask?: (status: string) => void;
}) {
  const grouped = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column] = tasks.filter((task) => task.status === column);
      return acc;
    }, {} as Record<string, TaskItem[]>);
  }, [tasks]);

  const taskById = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, TaskItem>);
  }, [tasks]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {columns.map((column) => (
        <div
          key={column}
          className="flex min-h-[220px] flex-col gap-3 rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const taskId = event.dataTransfer.getData("text/plain");
            const task = taskById[taskId];
            if (taskId && task) {
              if (canDragTask && !canDragTask(task)) return;
              onStatusChange(taskId, column);
            }
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              {column.replace("_", " ")}
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                {grouped[column]?.length ?? 0}
              </span>
              {onAddTask && (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground transition hover:bg-white/10"
                  onClick={() => onAddTask(column)}
                  aria-label={`Add task to ${column}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex flex-1 flex-col gap-3",
              grouped[column]?.length === 0 && "justify-center"
            )}
          >
            {grouped[column]?.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                Drop tasks here
              </p>
            ) : (
              grouped[column].map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                  category={task.category}
                  assignee={task.assignee?.name}
                  dueDate={task.dueDate}
                  onClick={() => onSelect(task)}
                  draggable={!canDragTask || canDragTask(task)}
                  onDragStart={(event) => {
                    if (canDragTask && !canDragTask(task)) return;
                    event.dataTransfer.setData("text/plain", task.id);
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
