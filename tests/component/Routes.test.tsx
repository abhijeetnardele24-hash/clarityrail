import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { CaptureRoute } from "../../src/ui/routes/CaptureRoute";
import { RailRoute } from "../../src/ui/routes/RailRoute";
import { ReviewRoute } from "../../src/ui/routes/ReviewRoute";
import { EvidenceRoute } from "../../src/ui/routes/EvidenceRoute";
import { SettingsRoute } from "../../src/ui/routes/SettingsRoute";
import { App, AppContent } from "../../src/App";
import { useAppStore } from "../../src/application/store";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Route Views Integration Suite", () => {
  beforeEach(async () => {
    await useAppStore.getState().resetAllData();
  });

  it("renders CaptureRoute and handles brief submission", async () => {
    render(
      <BrowserRouter>
        <CaptureRoute />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/From messy instructions/i);
    expect(screen.getByText(/The Intended User/i)).toBeInTheDocument();
    expect(screen.getByText(/The Specific Barrier/i)).toBeInTheDocument();
    expect(screen.getByText(/The Meaningful Change/i)).toBeInTheDocument();

    const textarea = screen.getByTestId("brief-textarea");
    fireEvent.change(textarea, { target: { value: "Download files. Build the app." } });

    const compileBtn = screen.getByTestId("compile-button");
    fireEvent.click(compileBtn);

    await waitFor(() => {
      expect(useAppStore.getState().currentSession).toBeDefined();
    });
  });

  it("renders RailRoute with active step and contract components", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    await useAppStore.getState().loadFixture(fixture.id);

    render(
      <BrowserRouter>
        <RailRoute />
      </BrowserRouter>
    );

    expect(screen.getByText(fixture.title)).toBeInTheDocument();
    expect(screen.getByTestId("focus-step-title")).toBeInTheDocument();

    // Click Mark Done
    const doneBtn = screen.getByTestId("mark-done-button");
    fireEvent.click(doneBtn);

    // Click I'm Blocked
    const blockedBtn = screen.getByTestId("mark-blocked-button");
    fireEvent.click(blockedBtn);
  });

  it("renders ReviewRoute with full pipeline and revision history", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    await useAppStore.getState().loadFixture(fixture.id);

    render(
      <BrowserRouter>
        <ReviewRoute />
      </BrowserRouter>
    );

    expect(screen.getByText(/Plan & Lineage Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Step Execution Pipeline/i)).toBeInTheDocument();

    const exportBtn = screen.getByTestId("open-export-modal-button");
    fireEvent.click(exportBtn);

    expect(screen.getByRole("dialog", { name: /Export Progress & Handoff Capsule/i })).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: /Back to Focus Rail/i });
    fireEvent.click(backBtn);
  });

  it("renders EvidenceRoute with methodology and privacy boundary", () => {
    render(<EvidenceRoute />);

    expect(screen.getByText(/ClarityRail Evidence, Methodology & Privacy Boundary/i)).toBeInTheDocument();
    expect(screen.getByText(/1. The Four-Part Clarity Contract/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Research & Cognitive Accessibility Foundations/i)).toBeInTheDocument();
    expect(screen.getByText(/5. Privacy Boundary & Threat Model/i)).toBeInTheDocument();
  });

  it("renders SettingsRoute and toggles sensory options and data reset", async () => {
    render(<SettingsRoute />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Display & Accessibility Preferences/i);

    // Toggle theme
    const highContrastBtn = screen.getByRole("button", { name: /High Contrast/i });
    fireEvent.click(highContrastBtn);
    await waitFor(() => {
      expect(useAppStore.getState().preferences.theme).toBe("high-contrast");
    });

    // Toggle text scale
    const largeBtn = screen.getByRole("button", { name: /Large \(112.5%\)/i });
    fireEvent.click(largeBtn);
    await waitFor(() => {
      expect(useAppStore.getState().preferences.textScale).toBe("large");
    });

    // Toggle density
    const compactBtn = screen.getByRole("button", { name: /Compact/i });
    fireEvent.click(compactBtn);
    await waitFor(() => {
      expect(useAppStore.getState().preferences.density).toBe("compact");
    });

    const comfortableBtn = screen.getByRole("button", { name: /Comfortable Spacing/i });
    fireEvent.click(comfortableBtn);

    // Toggle Warm Paper theme
    const warmPaperBtn = screen.getByRole("button", { name: /Warm Paper/i });
    fireEvent.click(warmPaperBtn);

    // Toggle extra large text scale
    const xlargeBtn = screen.getByRole("button", { name: /Extra Large/i });
    fireEvent.click(xlargeBtn);

    // Toggle reduced motion and cue phrases
    const reducedMotionCheckbox = screen.getByLabelText(/Reduce Interface Motion/i);
    fireEvent.click(reducedMotionCheckbox);

    const cuePhrasesCheckbox = screen.getByLabelText(/Action Cues/i);
    fireEvent.click(cuePhrasesCheckbox);

    // Click Reset
    const resetBtn = screen.getByTestId("reset-data-button");
    fireEvent.click(resetBtn);

    const confirmBtn = screen.getByTestId("confirm-reset-button");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/All local sessions and preferences have been cleared/i)).toBeInTheDocument();
    });
  });

  it("renders AppContent with skip link and full router layout", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders top-level App component with HashRouter", () => {
    render(<App />);
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
  });

  it("loads a synthetic fixture directly in CaptureRoute", async () => {
    render(
      <BrowserRouter>
        <CaptureRoute />
      </BrowserRouter>
    );

    const fixtureBtn = screen.getByTestId("load-fixture-fixture_academic_cs401");
    fireEvent.click(fixtureBtn);

    await waitFor(() => {
      expect(useAppStore.getState().currentSession?.title).toContain("CS 401");
    });
  });

  it("handles detour activation and full plan navigation in RailRoute", async () => {
    const fixture = SYNTHETIC_FIXTURES[1]!;
    await useAppStore.getState().loadFixture(fixture.id);

    render(
      <BrowserRouter>
        <RailRoute />
      </BrowserRouter>
    );

    // Click I'm Blocked to trigger detour
    const blockedBtn = screen.getByTestId("mark-blocked-button");
    fireEvent.click(blockedBtn);

    // Click navigate to full plan review
    const reviewBtn = screen.getByRole("button", { name: /View Full Plan & Export Handoff/i });
    fireEvent.click(reviewBtn);
  });
});
