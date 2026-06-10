import { test, expect, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

afterEach(() => {
  cleanup();
});

// Mirrors the Preview/Code toggle wiring used in src/app/main-content.tsx
function Harness() {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");
  return (
    <div>
      <Tabs
        value={activeView}
        onValueChange={(v) => setActiveView(v as "preview" | "code")}
      >
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
      </Tabs>
      <div data-testid="content">
        {activeView === "preview" ? "PREVIEW_PANEL" : "CODE_PANEL"}
      </div>
    </div>
  );
}

test("toggle starts on Preview", () => {
  render(<Harness />);
  expect(screen.getByTestId("content").textContent).toBe("PREVIEW_PANEL");
  expect(
    screen.getByRole("tab", { name: "Preview" }).getAttribute("data-state")
  ).toBe("active");
});

test("clicking Code switches the active view to code", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("content").textContent).toBe("CODE_PANEL");
  expect(
    screen.getByRole("tab", { name: "Code" }).getAttribute("data-state")
  ).toBe("active");
});

test("clicking Preview switches back to preview", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("content").textContent).toBe("PREVIEW_PANEL");
});
