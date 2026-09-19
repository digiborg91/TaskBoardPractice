import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

async function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!authHeader || authHeader === "Bearer undefined") {
    return { client: null, user: null, error: "Missing or invalid Authorization header" };
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    return { client: null, user: null, error: "Unauthorized" };
  }

  // Create a user-scoped client using anon key + user's token for RLS
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  return { client: userClient, user, error: null };
}

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "");
    const segments = path.split("/").filter(Boolean);

    // Health check — no auth required
    if (segments.length === 0 || segments[0] === "health") {
      return jsonResponse({
        status: "ok",
        service: "taskboard-api",
        version: "1.0.0",
        endpoints: [
          "GET /api/boards",
          "POST /api/boards",
          "GET /api/boards/:id",
          "PUT /api/boards/:id",
          "DELETE /api/boards/:id",
          "GET /api/boards/:id/tasks",
          "POST /api/boards/:id/tasks",
          "GET /api/tasks/:id",
          "PUT /api/tasks/:id",
          "PATCH /api/tasks/:id/status",
          "DELETE /api/tasks/:id",
        ],
      });
    }

    const { client, user, error } = await getSupabaseClient(req);
    if (error || !client || !user) {
      return errorResponse(error || "Unauthorized", 401);
    }

    // ---- BOARDS ----
    if (segments[0] === "boards") {
      // GET /api/boards
      if (req.method === "GET" && segments.length === 1) {
        const { data, error: dbError } = await client
          .from("boards")
          .select("*")
          .order("created_at", { ascending: false });
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse({ boards: data });
      }

      // POST /api/boards
      if (req.method === "POST" && segments.length === 1) {
        const body = await req.json();
        if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
          return errorResponse("Field 'title' is required and must be a non-empty string", 400);
        }
        const { data, error: dbError } = await client
          .from("boards")
          .insert({ title: body.title.trim(), description: body.description || null })
          .select()
          .single();
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse(data, 201);
      }

      // GET /api/boards/:id
      if (req.method === "GET" && segments.length === 2) {
        const { data, error: dbError } = await client
          .from("boards")
          .select("*")
          .eq("id", segments[1])
          .maybeSingle();
        if (dbError) return errorResponse(dbError.message, 500);
        if (!data) return errorResponse("Board not found", 404);
        return jsonResponse(data);
      }

      // PUT /api/boards/:id
      if (req.method === "PUT" && segments.length === 2) {
        const body = await req.json();
        if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
          return errorResponse("Field 'title' is required and must be a non-empty string", 400);
        }
        const { data, error: dbError } = await client
          .from("boards")
          .update({
            title: body.title.trim(),
            description: body.description ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", segments[1])
          .select()
          .maybeSingle();
        if (dbError) return errorResponse(dbError.message, 500);
        if (!data) return errorResponse("Board not found", 404);
        return jsonResponse(data);
      }

      // DELETE /api/boards/:id
      if (req.method === "DELETE" && segments.length === 2) {
        const { error: dbError } = await client
          .from("boards")
          .delete()
          .eq("id", segments[1]);
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse({ deleted: true, id: segments[1] });
      }

      // GET /api/boards/:id/tasks
      if (req.method === "GET" && segments.length === 3 && segments[2] === "tasks") {
        const { data, error: dbError } = await client
          .from("tasks")
          .select("*")
          .eq("board_id", segments[1])
          .order("position", { ascending: true });
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse({ tasks: data || [] });
      }

      // POST /api/boards/:id/tasks
      if (req.method === "POST" && segments.length === 3 && segments[2] === "tasks") {
        const body = await req.json();
        if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
          return errorResponse("Field 'title' is required and must be a non-empty string", 400);
        }
        const status = body.status && VALID_STATUSES.includes(body.status) ? body.status : "todo";
        const priority = body.priority && VALID_PRIORITIES.includes(body.priority) ? body.priority : "medium";

        const { data, error: dbError } = await client
          .from("tasks")
          .insert({
            title: body.title.trim(),
            description: body.description || null,
            status,
            priority,
            board_id: segments[1],
          })
          .select()
          .single();
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse(data, 201);
      }
    }

    // ---- TASKS ----
    if (segments[0] === "tasks") {
      // GET /api/tasks/:id
      if (req.method === "GET" && segments.length === 2) {
        const { data, error: dbError } = await client
          .from("tasks")
          .select("*")
          .eq("id", segments[1])
          .maybeSingle();
        if (dbError) return errorResponse(dbError.message, 500);
        if (!data) return errorResponse("Task not found", 404);
        return jsonResponse(data);
      }

      // PUT /api/tasks/:id
      if (req.method === "PUT" && segments.length === 2) {
        const body = await req.json();
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.title !== undefined) {
          if (typeof body.title !== "string" || body.title.trim().length === 0) {
            return errorResponse("Field 'title' must be a non-empty string", 400);
          }
          updates.title = body.title.trim();
        }
        if (body.description !== undefined) updates.description = body.description;
        if (body.priority !== undefined) {
          if (!VALID_PRIORITIES.includes(body.priority)) {
            return errorResponse(`Field 'priority' must be one of: ${VALID_PRIORITIES.join(", ")}`, 400);
          }
          updates.priority = body.priority;
        }

        const { data, error: dbError } = await client
          .from("tasks")
          .update(updates)
          .eq("id", segments[1])
          .select()
          .maybeSingle();
        if (dbError) return errorResponse(dbError.message, 500);
        if (!data) return errorResponse("Task not found", 404);
        return jsonResponse(data);
      }

      // PATCH /api/tasks/:id/status
      if (req.method === "PATCH" && segments.length === 3 && segments[2] === "status") {
        const body = await req.json();
        if (!body.status || !VALID_STATUSES.includes(body.status)) {
          return errorResponse(`Field 'status' is required and must be one of: ${VALID_STATUSES.join(", ")}`, 400);
        }
        const { data, error: dbError } = await client
          .from("tasks")
          .update({ status: body.status, updated_at: new Date().toISOString() })
          .eq("id", segments[1])
          .select()
          .maybeSingle();
        if (dbError) return errorResponse(dbError.message, 500);
        if (!data) return errorResponse("Task not found", 404);
        return jsonResponse(data);
      }

      // DELETE /api/tasks/:id
      if (req.method === "DELETE" && segments.length === 2) {
        const { error: dbError } = await client
          .from("tasks")
          .delete()
          .eq("id", segments[1]);
        if (dbError) return errorResponse(dbError.message, 500);
        return jsonResponse({ deleted: true, id: segments[1] });
      }
    }

    return errorResponse("Endpoint not found", 404);
  } catch (err) {
    return errorResponse(err.message || "Internal server error", 500);
  }
});
