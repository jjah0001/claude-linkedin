import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ── getToolCallLabel: str_replace_editor ──────────────────────────────────────

test("str_replace_editor create in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, false)
  ).toBe("Creating /App.jsx");
});

test("str_replace_editor create done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, true)
  ).toBe("Created /App.jsx");
});

test("str_replace_editor str_replace in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }, false)
  ).toBe("Editing /components/Card.jsx");
});

test("str_replace_editor str_replace done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }, true)
  ).toBe("Edited /components/Card.jsx");
});

test("str_replace_editor insert in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "insert", path: "/index.js" }, false)
  ).toBe("Editing /index.js");
});

test("str_replace_editor insert done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "insert", path: "/index.js" }, true)
  ).toBe("Edited /index.js");
});

test("str_replace_editor view in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, false)
  ).toBe("Reading /App.jsx");
});

test("str_replace_editor view done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, true)
  ).toBe("Read /App.jsx");
});

test("str_replace_editor undo_edit in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, false)
  ).toBe("Reverting /App.jsx");
});

test("str_replace_editor undo_edit done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, true)
  ).toBe("Reverted /App.jsx");
});

test("str_replace_editor unknown command in-progress", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/App.jsx" }, false)
  ).toBe("Modifying /App.jsx");
});

test("str_replace_editor unknown command done", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/App.jsx" }, true)
  ).toBe("Modified /App.jsx");
});

// ── getToolCallLabel: str_replace_editor edge cases ───────────────────────────

test("str_replace_editor missing path omits path suffix", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create" }, false)
  ).toBe("Creating");
});

test("str_replace_editor missing command falls back to Modifying", () => {
  expect(
    getToolCallLabel("str_replace_editor", { path: "/App.jsx" }, false)
  ).toBe("Modifying /App.jsx");
});

test("str_replace_editor null args returns Modifying", () => {
  expect(getToolCallLabel("str_replace_editor", null, false)).toBe("Modifying");
});

test("str_replace_editor empty args returns Modifying", () => {
  expect(getToolCallLabel("str_replace_editor", {}, false)).toBe("Modifying");
});

// ── getToolCallLabel: file_manager ────────────────────────────────────────────

test("file_manager rename in-progress", () => {
  expect(
    getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx" }, false)
  ).toBe("Renaming /old.jsx");
});

test("file_manager rename done", () => {
  expect(
    getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx" }, true)
  ).toBe("Renamed /old.jsx");
});

test("file_manager delete in-progress", () => {
  expect(
    getToolCallLabel("file_manager", { command: "delete", path: "/old.jsx" }, false)
  ).toBe("Deleting /old.jsx");
});

test("file_manager delete done", () => {
  expect(
    getToolCallLabel("file_manager", { command: "delete", path: "/old.jsx" }, true)
  ).toBe("Deleted /old.jsx");
});

test("file_manager unknown command falls back to Modifying", () => {
  expect(
    getToolCallLabel("file_manager", { command: "unknown", path: "/x.jsx" }, false)
  ).toBe("Modifying /x.jsx");
});

test("file_manager null args returns Modifying", () => {
  expect(getToolCallLabel("file_manager", null, false)).toBe("Modifying");
});

// ── getToolCallLabel: unknown tool ────────────────────────────────────────────

test("unknown tool returns raw toolName", () => {
  expect(getToolCallLabel("some_other_tool", { path: "/x" }, false)).toBe(
    "some_other_tool"
  );
});

test("unknown tool done also returns raw toolName", () => {
  expect(getToolCallLabel("some_other_tool", {}, true)).toBe("some_other_tool");
});

// ── ToolCallBadge component ───────────────────────────────────────────────────

test("shows spinner for partial-call state", () => {
  const toolInvocation: ToolInvocation = {
    state: "partial-call",
    toolCallId: "id1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  };
  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  const spinner = container.querySelector("svg");
  expect(spinner?.getAttribute("class")).toContain("animate-spin");
});

test("shows spinner for call state", () => {
  const toolInvocation: ToolInvocation = {
    state: "call",
    toolCallId: "id2",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  };
  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  const spinner = container.querySelector("svg");
  expect(spinner?.getAttribute("class")).toContain("animate-spin");
});

test("shows green dot and no spinner for result state with non-null result", () => {
  const toolInvocation: ToolInvocation = {
    state: "result",
    toolCallId: "id3",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: "Success",
  };
  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector("svg")).toBeNull();
});

test("shows spinner for result state with null result (not done)", () => {
  const toolInvocation: ToolInvocation = {
    state: "result",
    toolCallId: "id4",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: null,
  };
  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  const spinner = container.querySelector("svg");
  expect(spinner?.getAttribute("class")).toContain("animate-spin");
});

test("renders correct label text for create in-progress", () => {
  const toolInvocation: ToolInvocation = {
    state: "call",
    toolCallId: "id5",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
  };
  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("renders correct label text for create done", () => {
  const toolInvocation: ToolInvocation = {
    state: "result",
    toolCallId: "id6",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    result: "Success",
  };
  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

test("renders correct label for file_manager delete done", () => {
  const toolInvocation: ToolInvocation = {
    state: "result",
    toolCallId: "id7",
    toolName: "file_manager",
    args: { command: "delete", path: "/old.jsx" },
    result: { success: true },
  };
  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleted /old.jsx")).toBeDefined();
});

test("falls back to toolName for unknown tools", () => {
  const toolInvocation: ToolInvocation = {
    state: "call",
    toolCallId: "id8",
    toolName: "mystery_tool",
    args: {},
  };
  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("mystery_tool")).toBeDefined();
});

test("applies correct badge styling classes", () => {
  const toolInvocation: ToolInvocation = {
    state: "call",
    toolCallId: "id9",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
  };
  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("bg-neutral-50");
  expect(badge.className).toContain("rounded-lg");
  expect(badge.className).toContain("font-mono");
  expect(badge.className).toContain("border-neutral-200");
});
