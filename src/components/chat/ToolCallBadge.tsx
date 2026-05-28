"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolCallLabel(
  toolName: string,
  args: any,
  isDone: boolean
): string {
  const path: string | undefined = args?.path;
  const pathSuffix = path ? ` ${path}` : "";

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return isDone ? `Created${pathSuffix}` : `Creating${pathSuffix}`;
      case "str_replace":
      case "insert":
        return isDone ? `Edited${pathSuffix}` : `Editing${pathSuffix}`;
      case "view":
        return isDone ? `Read${pathSuffix}` : `Reading${pathSuffix}`;
      case "undo_edit":
        return isDone ? `Reverted${pathSuffix}` : `Reverting${pathSuffix}`;
      default:
        return isDone ? `Modified${pathSuffix}` : `Modifying${pathSuffix}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename":
        return isDone ? `Renamed${pathSuffix}` : `Renaming${pathSuffix}`;
      case "delete":
        return isDone ? `Deleted${pathSuffix}` : `Deleting${pathSuffix}`;
      default:
        return isDone ? `Modified${pathSuffix}` : `Modifying${pathSuffix}`;
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && !!(toolInvocation as any).result;
  const label = getToolCallLabel(
    toolInvocation.toolName,
    toolInvocation.args,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
