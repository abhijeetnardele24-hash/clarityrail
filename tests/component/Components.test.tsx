import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ResumeCapsule } from "../../src/ui/components/ResumeCapsule";
import { SafeDetourBanner } from "../../src/ui/components/SafeDetourBanner";
import { HandoffExportModal } from "../../src/ui/components/HandoffExportModal";
import { Header } from "../../src/ui/components/Header";
import { LiveAnnouncer } from "../../src/ui/components/LiveAnnouncer";
import { compileBrief } from "../../src/domain/compiler/compiler";
import { SafeDetourResult } from "../../src/domain/types";
import { useAppStore } from "../../src/application/store";

describe("UI Components Suite", () => {
  it("renders ResumeCapsule with last completed step, current focus, and source context", () => {
    const session = compileBrief("Download the lab files. Write the analysis paper.");
    session.steps[0]!.state = "DONE";

    render(<ResumeCapsule session={session} />);

    expect(screen.getByText(/Interruption Recovery Capsule/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Device Only/i)).toBeInTheDocument();
    expect(screen.getAllByText(session.steps[0]!.title).length).toBeGreaterThanOrEqual(1);
  });

  it("renders SafeDetourBanner and handles activate action", () => {
    const detour: SafeDetourResult = {
      candidateStep: {
        id: "cand_1",
        title: "Independent Research",
        state: "READY",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c1"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      isEligible: true,
      explanation: "Safe alternative task with no blocked dependencies.",
      alternateCandidatesCount: 1,
    };

    const onActivate = vi.fn();

    render(<SafeDetourBanner detour={detour} onActivate={onActivate} />);

    expect(screen.getByText(/Dependency-Safe Detour Available/i)).toBeInTheDocument();
    expect(screen.getByText("Independent Research")).toBeInTheDocument();

    const switchBtn = screen.getByRole("button", { name: /Switch focus to safe alternative/i });
    fireEvent.click(switchBtn);

    expect(onActivate).toHaveBeenCalledWith("cand_1");
  });

  it("renders SafeDetourBanner when isEligible is false", () => {
    const detour: SafeDetourResult = {
      candidateStep: null,
      isEligible: false,
      explanation: "No safe detour exists.",
      alternateCandidatesCount: 0,
    };

    render(<SafeDetourBanner detour={detour} onActivate={vi.fn()} />);

    expect(screen.getByText(/Detour Blocked/i)).toBeInTheDocument();
    expect(screen.getByText("No safe detour exists.")).toBeInTheDocument();
  });

  it("renders HandoffExportModal and allows switching tabs and downloading", () => {
    const session = compileBrief("Download rubric. Write essay.");
    const onClose = vi.fn();

    render(
      <HandoffExportModal session={session} isOpen={true} onClose={onClose} />
    );

    expect(screen.getByText(/Export Progress & Handoff Capsule/i)).toBeInTheDocument();

    // Switch to Plain Text tab
    const textTab = screen.getByRole("button", { name: /Plain Text/i });
    fireEvent.click(textTab);
    expect(screen.getByText(/CLARITYRAIL EXECUTION CAPSULE/i)).toBeInTheDocument();

    // Switch to JSON tab
    const jsonTab = screen.getByRole("button", { name: /Session Backup/i });
    fireEvent.click(jsonTab);

    // Click download button
    const downloadBtn = screen.getByRole("button", { name: /Download File/i });
    fireEvent.click(downloadBtn);

    // Click copy button
    const copyBtn = screen.getByRole("button", { name: /Copy handoff content to clipboard/i });
    fireEvent.click(copyBtn);

    // Close button
    const closeBtn = screen.getByRole("button", { name: /Close export dialog/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders Header navigation and triggers theme toggle", async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/ClarityRail Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Local & Offline/i)).toBeInTheDocument();

    const themeBtn = screen.getByRole("button", { name: /High Contrast|Warm Paper/i });
    fireEvent.click(themeBtn);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(useAppStore.getState().preferences.theme).toBe("high-contrast");
    });
  });

  it("renders LiveAnnouncer accessible live region", () => {
    useAppStore.setState({ announcement: "Test Screen Reader Update" });
    render(<LiveAnnouncer />);

    const announcer = screen.getByTestId("live-announcer");
    expect(announcer).toHaveAttribute("role", "status");
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveTextContent("Test Screen Reader Update");
  });
});
