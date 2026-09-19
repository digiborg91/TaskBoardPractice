import type { Task } from "../lib/api";

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const priorityColors: Record<string, string> = {
  low: "var(--priority-low)",
  medium: "var(--priority-medium)",
  high: "var(--priority-high)",
};

export function TaskCard({ task, onEdit, onDelete, onDragStart }: Props) {
  return (
    <div
      className="task-card"
      draggable
      onDragStart={onDragStart}
      data-testid={`task-card-${task.id}`}
    >
      <div className="task-card-header">
        <span className="task-priority-badge" style={{ backgroundColor: priorityColors[task.priority] }} data-testid={`task-priority-${task.id}`}>
          {task.priority}
        </span>
        <div className="task-card-actions">
          <button className="icon-btn" onClick={onEdit} aria-label="Edit task" data-testid={`task-edit-${task.id}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button className="icon-btn" onClick={onDelete} aria-label="Delete task" data-testid={`task-delete-${task.id}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <h4 className="task-title" data-testid={`task-title-${task.id}`}>{task.title}</h4>
      {task.description && <p className="task-desc" data-testid={`task-desc-${task.id}`}>{task.description}</p>}
    </div>
  );
}
