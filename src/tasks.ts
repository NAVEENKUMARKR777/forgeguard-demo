export type Priority = "low" | "medium" | "high";

export interface NewTask {
  title: string;
  priority: Priority;
}

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];

/** Pure validation — no D1, no fetch — testable in plain Node. */
export function validateNewTask(input: unknown): NewTask | ValidationError {
  if (typeof input !== "object" || input === null) {
    return { field: "body", message: "expected a JSON object" };
  }
  const body = input as Record<string, unknown>;

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return { field: "title", message: "title is required and must be a non-empty string" };
  }
  if (body.title.length > 200) {
    return { field: "title", message: "title must be 200 characters or fewer" };
  }

  const priority = body.priority ?? "medium";
  if (typeof priority !== "string" || !VALID_PRIORITIES.includes(priority as Priority)) {
    return { field: "priority", message: `priority must be one of ${VALID_PRIORITIES.join(", ")}` };
  }

  return { title: body.title.trim(), priority: priority as Priority };
}

export function isValidationError<T>(result: T | ValidationError): result is ValidationError {
  return typeof result === "object" && result !== null && "field" in result;
}

export interface TaskPatch {
  title?: string;
  priority?: Priority;
}

/** Like validateNewTask, but every field is optional — a PATCH may update
 * just the title, just the priority, or both. Rejects an empty patch (no
 * recognized fields) rather than silently no-op'ing. */
export function validateTaskPatch(input: unknown): TaskPatch | ValidationError {
  if (typeof input !== "object" || input === null) {
    return { field: "body", message: "expected a JSON object" };
  }
  const body = input as Record<string, unknown>;
  const patch: TaskPatch = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return { field: "title", message: "title must be a non-empty string" };
    }
    if (body.title.length > 200) {
      return { field: "title", message: "title must be 200 characters or fewer" };
    }
    patch.title = body.title.trim();
  }

  if ("priority" in body) {
    if (typeof body.priority !== "string" || !VALID_PRIORITIES.includes(body.priority as Priority)) {
      return { field: "priority", message: `priority must be one of ${VALID_PRIORITIES.join(", ")}` };
    }
    patch.priority = body.priority as Priority;
  }

  if (Object.keys(patch).length === 0) {
    return { field: "body", message: "patch must include at least one of: title, priority" };
  }

  return patch;
}
