import { useState, type FormEvent } from "react";
import type { Board } from "../lib/api";

interface Props {
  board: Board | null;
  onSave: (title: string, description: string) => Promise<void>;
  onClose: () => void;
}

export function BoardFormModal({ board, onSave, onClose }: Props) {
  const [title, setTitle] = useState(board?.title ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(title.trim(), description.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save board");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="board-modal">
        <div className="modal-header">
          <h2>{board ? "Edit Board" : "New Board"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" data-testid="modal-close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Board title"
              required
              autoFocus
              data-testid="board-title-input"
            />
          </label>
          <label className="form-label">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board about?"
              rows={3}
              data-testid="board-description-input"
            />
          </label>
          {error && <div className="form-error" data-testid="board-form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} data-testid="board-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} data-testid="board-save">
              {saving ? "Saving..." : board ? "Save Changes" : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
