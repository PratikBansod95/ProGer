import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { priorityColors, statusColors } from "@/components/tasks/task-utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: string;
  dueDate?: string | null;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({
  title,
  description,
  status,
  priority,
  assignee,
  dueDate,
  onClick,
  draggable,
  onDragStart,
}: TaskCardProps) {
  return (
    <div
      className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-4 shadow-[var(--shadow)] transition hover:translate-y-[-2px]"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <Badge className={cn("border-0", statusColors[status])}>
          {status.replaceAll("_", " ")}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge className={cn("border-0", priorityColors[priority])}>
          {priority}
        </Badge>
        {assignee && <span>{assignee}</span>}
        {dueDate && <span>Due {formatDate(dueDate)}</span>}
      </div>
    </div>
  );
}
