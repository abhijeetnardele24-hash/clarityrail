import React from "react";
import { useAppStore } from "../../application/store";

export const LiveAnnouncer: React.FC = () => {
  const announcement = useAppStore((state) => state.announcement);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="live-announcer"
    >
      {announcement}
    </div>
  );
};
