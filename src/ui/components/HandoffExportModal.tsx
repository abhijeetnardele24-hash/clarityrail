import React, { useEffect, useRef, useState } from "react";
import { RailSession } from "../../domain/types";
import {
  generateMarkdownHandoff,
  generatePlainTextHandoff,
  serializeSessionToJson,
} from "../../adapters/export";
import { Copy, Download, Check, X } from "lucide-react";

interface HandoffExportModalProps {
  session: RailSession;
  isOpen: boolean;
  onClose: () => void;
}

export const HandoffExportModal: React.FC<HandoffExportModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<"markdown" | "text" | "json">("markdown");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let content = "";
  let filename = `clarityrail-${session.id}.md`;
  let mimeType = "text/markdown";

  if (tab === "markdown") {
    content = generateMarkdownHandoff(session);
    filename = `clarityrail-${session.id}.md`;
    mimeType = "text/markdown";
  } else if (tab === "text") {
    content = generatePlainTextHandoff(session);
    filename = `clarityrail-${session.id}.txt`;
    mimeType = "text/plain";
  } else {
    content = serializeSessionToJson(session);
    filename = `clarityrail-${session.id}.json`;
    mimeType = "application/json";
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    if (typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(23, 33, 43, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-lg)",
          padding: "var(--space-6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 id="export-modal-title" style={{ fontSize: "1.3rem" }}>
            Export Progress &amp; Handoff Capsule
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="button button-ghost"
            onClick={onClose}
            aria-label="Close export dialog"
            style={{ minHeight: 36, minWidth: 36, padding: "4px" }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Format Tabs */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "var(--space-4)",
          }}
        >
          <button
            type="button"
            className={`button ${tab === "markdown" ? "button-primary" : "button-ghost"}`}
            style={{ minHeight: 36, padding: "var(--space-1) var(--space-4)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0" }}
            onClick={() => setTab("markdown")}
          >
            Markdown (.md)
          </button>
          <button
            type="button"
            className={`button ${tab === "text" ? "button-primary" : "button-ghost"}`}
            style={{ minHeight: 36, padding: "var(--space-1) var(--space-4)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0" }}
            onClick={() => setTab("text")}
          >
            Plain Text (.txt)
          </button>
          <button
            type="button"
            className={`button ${tab === "json" ? "button-primary" : "button-ghost"}`}
            style={{ minHeight: 36, padding: "var(--space-1) var(--space-4)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0" }}
            onClick={() => setTab("json")}
          >
            Session Backup (.json)
          </button>
        </div>

        {/* Content Box */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "var(--space-4)" }}>
          <pre
            tabIndex={0}
            aria-label="Handoff export preview"
            style={{
              padding: "var(--space-4)",
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {content}
          </pre>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            borderTop: "1px solid var(--color-border-light)",
            paddingTop: "var(--space-3)",
          }}
        >
          <span className="text-muted" style={{ fontSize: "0.825rem" }}>
            Generated locally. Zero tracking.
          </span>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleCopy}
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleDownload}
              aria-label={`Download file: ${filename}`}
            >
              <Download size={16} aria-hidden="true" />
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
