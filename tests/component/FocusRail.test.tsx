import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FocusRail } from "../../src/ui/components/FocusRail";
import { compileBrief } from "../../src/domain/compiler/compiler";

describe("FocusRail Component", () => {
  it("renders the primary action title, cue phrase, and handles button clicks", () => {
    const session = compileBrief("Download the syllabus. Write the reflection paper.");
    const activeStep = session.steps[0]!;
    const clauses = session.sourceClauses;

    const onMarkDone = vi.fn();
    const onMarkBlocked = vi.fn();
    const onBreakDown = vi.fn();

    render(
      <FocusRail
        session={session}
        activeStep={activeStep}
        supportingClauses={clauses}
        onMarkDone={onMarkDone}
        onMarkBlocked={onMarkBlocked}
        onBreakDown={onBreakDown}
      />
    );

    // Verify title is rendered
    expect(screen.getByTestId("focus-step-title")).toHaveTextContent(activeStep.title);

    // Click Mark Done
    const doneBtn = screen.getByTestId("mark-done-button");
    fireEvent.click(doneBtn);
    expect(onMarkDone).toHaveBeenCalledWith(activeStep.id);

    // Click Blocked
    const blockedBtn = screen.getByTestId("mark-blocked-button");
    fireEvent.click(blockedBtn);
    expect(onMarkBlocked).toHaveBeenCalledWith(activeStep.id);
  });

  it("expands source clause evidence when disclosure is clicked", () => {
    const session = compileBrief("Download the lab code from the portal.");
    const activeStep = session.steps[0]!;
    const clauses = session.sourceClauses;

    render(
      <FocusRail
        session={session}
        activeStep={activeStep}
        supportingClauses={clauses}
        onMarkDone={vi.fn()}
        onMarkBlocked={vi.fn()}
        onBreakDown={vi.fn()}
      />
    );

    const toggleBtn = screen.getByText(/Why this step\?/);
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Direct Source Evidence/)).toBeInTheDocument();
    expect(screen.getByText(/Clause #1/)).toBeInTheDocument();
  });

  it("opens subtask breakdown modal and submits split subtasks", () => {
    const session = compileBrief("Implement large architecture module.");
    const activeStep = session.steps[0]!;
    const onBreakDown = vi.fn();

    render(
      <FocusRail
        session={session}
        activeStep={activeStep}
        supportingClauses={session.sourceClauses}
        onMarkDone={vi.fn()}
        onMarkBlocked={vi.fn()}
        onBreakDown={onBreakDown}
      />
    );

    const breakBtn = screen.getByRole("button", { name: /Break down step into smaller actions/i });
    fireEvent.click(breakBtn);

    expect(screen.getByRole("heading", { name: /Break Down into Micro-Steps/i })).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Subtask lines/i);
    fireEvent.change(textarea, { target: { value: "Part 1\nPart 2" } });

    const splitBtn = screen.getByRole("button", { name: /Split Step/i });
    fireEvent.click(splitBtn);

    expect(onBreakDown).toHaveBeenCalledWith(activeStep.id, ["Part 1", "Part 2"]);
  });
});
