import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangeImpactGuard } from "../../src/ui/components/ChangeImpactGuard";
import { compileBrief } from "../../src/domain/compiler/compiler";

describe("ChangeImpactGuard Component", () => {
  it("renders revision details and allows user to confirm stale steps", () => {
    const session = compileBrief("Download the lab. Write the paper.");
    // Force a stale step
    session.steps[1] = {
      ...session.steps[1]!,
      state: "STALE",
      staleReason: "Source brief revised by professor",
    };

    const onRevise = vi.fn();
    const onConfirmStale = vi.fn();

    render(
      <ChangeImpactGuard
        session={session}
        onReviseBrief={onRevise}
        onConfirmStale={onConfirmStale}
      />
    );

    expect(screen.getByTestId("stale-alert")).toBeInTheDocument();
    expect(screen.getByText(/1 Step\(s\) Require Review/)).toBeInTheDocument();

    const confirmBtn = screen.getByTestId(`confirm-stale-${session.steps[1]!.id}`);
    fireEvent.click(confirmBtn);

    expect(onConfirmStale).toHaveBeenCalledWith(session.steps[1]!.id);
  });

  it("opens revision editor when revise button is clicked", () => {
    const session = compileBrief("Download the lab. Write the paper.");

    render(
      <ChangeImpactGuard
        session={session}
        onReviseBrief={vi.fn()}
        onConfirmStale={vi.fn()}
      />
    );

    const editBtn = screen.getByTestId("edit-brief-button");
    fireEvent.click(editBtn);

    expect(screen.getByTestId("revise-brief-textarea")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByTestId("revise-brief-textarea")).not.toBeInTheDocument();
  });
});
