import { describe, expect, it } from "vitest";
import { validateNewTask, isValidationError, summarizeTasks } from "../src/tasks";

describe("validateNewTask", () => {
  it("accepts a valid task with default priority", () => {
    const result = validateNewTask({ title: "Ship the feature" });
    expect(isValidationError(result)).toBe(false);
    if (!isValidationError(result)) {
      expect(result.title).toBe("Ship the feature");
      expect(result.priority).toBe("medium");
    }
  });

  it("accepts an explicit valid priority", () => {
    const result = validateNewTask({ title: "Fix the bug", priority: "high" });
    expect(isValidationError(result)).toBe(false);
    if (!isValidationError(result)) expect(result.priority).toBe("high");
  });

  it("trims whitespace from the title", () => {
    const result = validateNewTask({ title: "  padded  " });
    if (!isValidationError(result)) expect(result.title).toBe("padded");
  });

  it("rejects a missing title", () => {
    const result = validateNewTask({});
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects an empty/whitespace-only title", () => {
    const result = validateNewTask({ title: "   " });
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects a title over 200 characters", () => {
    const result = validateNewTask({ title: "x".repeat(201) });
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects an invalid priority", () => {
    const result = validateNewTask({ title: "Task", priority: "urgent" });
    expect(isValidationError(result)).toBe(true);
  });

  it("rejects a non-object body", () => {
    expect(isValidationError(validateNewTask(null))).toBe(true);
    expect(isValidationError(validateNewTask("just a string"))).toBe(true);
  });
});

describe("summarizeTasks", () => {
  it("counts total/done/pending", () => {
    const stats = summarizeTasks([{ done: 1 }, { done: 0 }, { done: 1 }, { done: 0 }, { done: 0 }]);
    expect(stats).toEqual({ total: 5, done: 2, pending: 3 });
  });

  it("handles an empty list", () => {
    expect(summarizeTasks([])).toEqual({ total: 0, done: 0, pending: 0 });
  });
});
