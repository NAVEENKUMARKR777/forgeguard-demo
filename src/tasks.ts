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

export function isValidationError(result: NewTask | ValidationError): result is ValidationError {
  return "field" in result;
}

export interface TaskStats {
  total: number;
  done: number;
  pending: number;
}

/** Pure aggregation over task rows — no D1, testable in plain Node. */
export function summarizeTasks(rows: { done: number }[]): TaskStats {
  const total = rows.length;
  const done = rows.filter((r) => r.done === 1).length;
  return { total, done, pending: total - done };
}
