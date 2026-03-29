import { TaskCard } from "@/components/tasks/TaskCard";

interface TaskListProps {
  tasks: TaskItem[];
  onSelect: (task: TaskItem) => void;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string | null;
  createdAt?: string;
  dueDate?: string | null;
  assignee?: { id: string; name: string } | null;
}

export function TaskList({ tasks, onSelect }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
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
        />
      ))}
    </div>
  );
}
