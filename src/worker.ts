import { validateNewTask, isValidationError, validateTaskPatch } from "./tasks";

export interface Env {
  TASKS_DB: D1Database;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.pathname === "/health") {
      return json({ status: "ok" });
    }

    if (url.pathname === "/tasks" && request.method === "GET") {
      const { results } = await env.TASKS_DB.prepare(
        "SELECT id, title, priority, done, created_at FROM tasks ORDER BY id DESC"
      ).all();
      return json(results);
    }

    if (url.pathname === "/tasks" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      const validated = validateNewTask(body);
      if (isValidationError(validated)) {
        return json({ error: validated.field, message: validated.message }, 400);
      }
      const result = await env.TASKS_DB.prepare(
        "INSERT INTO tasks (title, priority, done, created_at) VALUES (?, ?, 0, ?)"
      )
        .bind(validated.title, validated.priority, Date.now())
        .run();
      return json({ id: result.meta.last_row_id, title: validated.title, priority: validated.priority, done: 0 }, 201);
    }

    if (parts[0] === "tasks" && parts[2] === "complete" && request.method === "POST") {
      const id = Number(parts[1]);
      if (!Number.isInteger(id)) return json({ error: "invalid task id" }, 400);
      await env.TASKS_DB.prepare("UPDATE tasks SET done = 1 WHERE id = ?").bind(id).run();
      return json({ id, done: 1 });
    }

    if (parts[0] === "tasks" && parts.length === 2 && request.method === "PATCH") {
      const id = Number(parts[1]);
      if (!Number.isInteger(id)) return json({ error: "invalid task id" }, 400);
      const body = await request.json().catch(() => null);
      const patch = validateTaskPatch(body);
      if (isValidationError(patch)) {
        return json({ error: patch.field, message: patch.message }, 400);
      }
      const fields = Object.keys(patch) as (keyof typeof patch)[];
      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => patch[f]);
      await env.TASKS_DB.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`)
        .bind(...values, id)
        .run();
      return json({ id, ...patch });
    }

    if (parts[0] === "tasks" && parts.length === 2 && request.method === "DELETE") {
      const id = Number(parts[1]);
      if (!Number.isInteger(id)) return json({ error: "invalid task id" }, 400);
      await env.TASKS_DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
      return new Response(null, { status: 204 });
    }

    return json({ error: "not found" }, 404);
  }
} satisfies ExportedHandler<Env>;
