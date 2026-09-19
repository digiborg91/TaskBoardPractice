import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Board {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  position: number;
  board_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = Task["status"];
export type TaskPriority = Task["priority"];

export const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export class ApiClient {
  private baseUrl: string;
  private supabase: SupabaseClient;

  constructor(baseUrl: string, supabase: SupabaseClient) {
    this.baseUrl = baseUrl;
    this.supabase = supabase;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      apikey: apiKey,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    }
    return data as T;
  }

  // Boards
  listBoards(): Promise<{ boards: Board[] }> {
    return this.request("GET", "/boards");
  }

  createBoard(title: string, description?: string): Promise<Board> {
    return this.request("POST", "/boards", { title, description });
  }

  getBoard(id: string): Promise<Board> {
    return this.request("GET", `/boards/${id}`);
  }

  updateBoard(id: string, title: string, description?: string): Promise<Board> {
    return this.request("PUT", `/boards/${id}`, { title, description });
  }

  deleteBoard(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request("DELETE", `/boards/${id}`);
  }

  // Tasks
  listTasks(boardId: string): Promise<{ tasks: Task[] }> {
    return this.request("GET", `/boards/${boardId}/tasks`);
  }

  createTask(boardId: string, data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority }): Promise<Task> {
    return this.request("POST", `/boards/${boardId}/tasks`, data);
  }

  getTask(id: string): Promise<Task> {
    return this.request("GET", `/tasks/${id}`);
  }

  updateTask(id: string, data: { title?: string; description?: string; priority?: TaskPriority }): Promise<Task> {
    return this.request("PUT", `/tasks/${id}`, data);
  }

  updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.request("PATCH", `/tasks/${id}/status`, { status });
  }

  deleteTask(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request("DELETE", `/tasks/${id}`);
  }
}
