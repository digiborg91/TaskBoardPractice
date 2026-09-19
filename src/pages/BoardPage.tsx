import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { useApi } from "../hooks/useApi";
import type { Board, Task, TaskStatus } from "../lib/api";
import { STATUSES } from "../lib/api";
import { TaskCard } from "../components/TaskCard";
import { TaskFormModal } from "../components/TaskFormModal";
import { BoardFormModal } from "../components/BoardFormModal";

const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function BoardPage() {
  const { user, signOut } = useAuth();
  const api = useApi();

  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showBoardModal, setShowBoardModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>("todo");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBoards = useCallback(async () => {
    setLoadingBoards(true);
    setError(null);
    try {
      const { boards: data } = await api.listBoards();
      setBoards(data);
      if (data.length > 0 && !activeBoard) {
        setActiveBoard(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoadingBoards(false);
    }
  }, [api]);

  const loadTasks = useCallback(async (boardId: string) => {
    setLoadingTasks(true);
    setError(null);
    try {
      const { tasks: data } = await api.listTasks(boardId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }, [api]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (activeBoard) {
      loadTasks(activeBoard.id);
    } else {
      setTasks([]);
    }
  }, [activeBoard, loadTasks]);

  const handleSaveBoard = async (title: string, description: string) => {
    if (editingBoard) {
      const updated = await api.updateBoard(editingBoard.id, title, description || undefined);
      setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setActiveBoard(updated);
    } else {
      const created = await api.createBoard(title, description || undefined);
      setBoards((prev) => [created, ...prev]);
      setActiveBoard(created);
    }
  };

  const handleDeleteBoard = async (board: Board) => {
    if (!confirm(`Delete board "${board.title}"? All tasks will be lost.`)) return;
    try {
      await api.deleteBoard(board.id);
      const remaining = boards.filter((b) => b.id !== board.id);
      setBoards(remaining);
      setActiveBoard(remaining[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  };

  const handleSaveTask = async (data: { title: string; description: string; status: TaskStatus; priority: Task["priority"] }) => {
    if (!activeBoard) return;
    if (editingTask) {
      const updated = await api.updateTask(editingTask.id, {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
      });
      if (updated.status !== data.status) {
        await api.updateTaskStatus(editingTask.id, data.status);
        updated.status = data.status;
      }
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await api.createTask(activeBoard.id, {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
      });
      setTasks((prev) => [...prev, created]);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === status) {
      setDraggedTaskId(null);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? { ...t, status } : t)));
    setDraggedTaskId(null);
    try {
      await api.updateTaskStatus(draggedTaskId, status);
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? { ...t, status: task.status } : t)));
      setError(err instanceof Error ? err.message : "Failed to move task");
    }
  };

  const filteredTasks = searchQuery
    ? tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  const tasksByStatus = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status);

  return (
    <div className="app-layout">
      <header className="app-header" data-testid="app-header">
        <div className="header-left">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="10" height="24" rx="2" fill="#3b82f6" />
              <rect x="18" y="8" width="10" height="16" rx="2" fill="#10b981" />
              <rect x="18" y="28" width="10" height="4" rx="2" fill="#10b981" opacity="0.5" />
              <rect x="32" y="8" width="4" height="24" rx="2" fill="#6b7280" />
            </svg>
          </div>
          <h1 className="app-title">TaskBoard</h1>
        </div>
        <div className="header-right">
          <span className="user-email" data-testid="user-email">{user?.email}</span>
          <button className="btn btn-ghost" onClick={signOut} data-testid="signout-btn">Sign Out</button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar" data-testid="sidebar">
          <div className="sidebar-header">
            <h3>Boards</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => { setEditingBoard(null); setShowBoardModal(true); }}
              data-testid="new-board-btn"
            >
              + New
            </button>
          </div>
          <nav className="board-list" data-testid="board-list">
            {loadingBoards ? (
              <p className="sidebar-empty">Loading...</p>
            ) : boards.length === 0 ? (
              <p className="sidebar-empty">No boards yet. Create one to get started.</p>
            ) : (
              boards.map((board) => (
                <div
                  key={board.id}
                  className={`board-item ${activeBoard?.id === board.id ? "active" : ""}`}
                  onClick={() => setActiveBoard(board)}
                  data-testid={`board-item-${board.id}`}
                >
                  <span className="board-item-title">{board.title}</span>
                  <div className="board-item-actions">
                    <button
                      className="icon-btn"
                      onClick={(e) => { e.stopPropagation(); setEditingBoard(board); setShowBoardModal(true); }}
                      aria-label="Edit board"
                      data-testid={`board-edit-${board.id}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      className="icon-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board); }}
                      aria-label="Delete board"
                      data-testid={`board-delete-${board.id}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </nav>
        </aside>

        <main className="board-main" data-testid="board-main">
          {activeBoard ? (
            <>
              <div className="board-toolbar" data-testid="board-toolbar">
                <div className="board-info">
                  <h2 data-testid="active-board-title">{activeBoard.title}</h2>
                  {activeBoard.description && <p className="board-desc">{activeBoard.description}</p>}
                </div>
                <div className="toolbar-actions">
                  <input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {error && <div className="app-error" data-testid="app-error">{error}</div>}

              <div className="kanban-board" data-testid="kanban-board">
                {STATUSES.map((status) => (
                  <div
                    key={status}
                    className={`kanban-column column-${status}`}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDrop={(e) => handleDrop(e, status)}
                    data-testid={`column-${status}`}
                  >
                    <div className="column-header">
                      <h3>{COLUMN_LABELS[status]}</h3>
                      <span className="column-count" data-testid={`column-count-${status}`}>
                        {tasksByStatus(status).length}
                      </span>
                      <button
                        className="btn btn-sm btn-ghost column-add"
                        onClick={() => {
                          setEditingTask(null);
                          setDefaultTaskStatus(status);
                          setShowTaskModal(true);
                        }}
                        data-testid={`add-task-${status}`}
                      >
                        +
                      </button>
                    </div>
                    <div className="column-body">
                      {loadingTasks ? (
                        <p className="column-empty">Loading...</p>
                      ) : tasksByStatus(status).length === 0 ? (
                        <p className="column-empty" data-testid={`column-empty-${status}`}>No tasks</p>
                      ) : (
                        tasksByStatus(status).map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => { setEditingTask(task); setShowTaskModal(true); }}
                            onDelete={() => handleDeleteTask(task)}
                            onDragStart={(e) => {
                              setDraggedTaskId(task.id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" data-testid="no-board-state">
              <h2>No Board Selected</h2>
              <p>Create a board to start managing your tasks.</p>
              <button
                className="btn btn-primary"
                onClick={() => { setEditingBoard(null); setShowBoardModal(true); }}
                data-testid="create-first-board"
              >
                Create Your First Board
              </button>
            </div>
          )}
        </main>
      </div>

      {showBoardModal && (
        <BoardFormModal
          board={editingBoard}
          onSave={handleSaveBoard}
          onClose={() => { setShowBoardModal(false); setEditingBoard(null); }}
        />
      )}

      {showTaskModal && (
        <TaskFormModal
          task={editingTask}
          defaultStatus={defaultTaskStatus}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
