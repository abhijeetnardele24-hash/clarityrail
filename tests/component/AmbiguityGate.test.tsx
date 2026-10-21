import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AmbiguityGate } from "../../src/ui/components/AmbiguityGate";
import { Ambiguity, SourceClause } from "../../src/domain/types";

describe("AmbiguityGate Component", () => {
  it("renders open ambiguity questions and triggers answer submission", () => {
    const ambiguities: Ambiguity[] = [
      {
        id: "amb_1",
        kind: "FORMAT",
        question: "What deliverable format should be prepared?",
        sourceClauseIds: ["c1"],
        status: "OPEN",
      },
    ];

    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Submit your final assignment.", startOffset: 0, endOffset: 30 },
    ];

    const onResolve = vi.fn();

    render(
      <AmbiguityGate
        ambiguities={ambiguities}
        clauses={clauses}
        onResolve={onResolve}
      />
    );

    expect(screen.getByText(/What deliverable format should be prepared\?/)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Type decision/);
    fireEvent.change(input, { target: { value: "PDF format" } });

    const confirmBtn = screen.getByText(/Confirm Decision/);
    fireEvent.click(confirmBtn);

    expect(onResolve).toHaveBeenCalledWith("amb_1", "ANSWERED", "PDF format");
  });

  it("handles 'Not Needed' resolution", () => {
    const ambiguities: Ambiguity[] = [
      {
        id: "amb_2",
        kind: "DEADLINE",
        question: "What cutoff time applies?",
        sourceClauseIds: ["c1"],
        status: "OPEN",
      },
    ];

    const onResolve = vi.fn();

    render(
      <AmbiguityGate
        ambiguities={ambiguities}
        clauses={[]}
        onResolve={onResolve}
      />
    );

    const notNeededBtn = screen.getByText(/Not Needed/);
    fireEvent.click(notNeededBtn);

    expect(onResolve).toHaveBeenCalledWith("amb_2", "NOT_NEEDED");
  });

  it("handles 'Mark as Blocker' resolution", () => {
    const ambiguities: Ambiguity[] = [
      {
        id: "amb_3",
        kind: "OTHER",
        question: "Unclear requirement?",
        sourceClauseIds: ["c1"],
        status: "OPEN",
      },
    ];

    const onResolve = vi.fn();

    render(
      <AmbiguityGate
        ambiguities={ambiguities}
        clauses={[]}
        onResolve={onResolve}
      />
    );

    const blockerBtn = screen.getByRole("button", { name: /Mark as Hard Blocker/i });
    fireEvent.click(blockerBtn);

    expect(onResolve).toHaveBeenCalledWith("amb_3", "BLOCKER");
  });
});
