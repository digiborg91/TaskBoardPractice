import { useState, type FormEvent } from "react";
import type { Task, TaskStatus, TaskPriority } from "../lib/api";

interface Props {
  task: Task | null;
  defaultStatus: TaskStatus;
  onSave: (data: { title: string; description: string; status: TaskStatus; priority: TaskPriority }) => Promise<void>;
  onClose: () => void;
}

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "done"];
const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];

export function TaskFormModal({ task, defaultStatus, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), description: description.trim(), status, priority });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="task-modal">
        <div className="modal-header">
          <h2>{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" data-testid="modal-close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              autoFocus
              data-testid="task-title-input"
            />
          </label>
          <label className="form-label">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              data-testid="task-description-input"
            />
          </label>
          <div className="form-row">
            <label className="form-label">
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} data-testid="task-status-select">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} data-testid="task-priority-select">
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <div className="form-error" data-testid="task-form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} data-testid="task-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} data-testid="task-save">
              {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
