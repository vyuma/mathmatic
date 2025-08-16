import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useTouchDevice } from "../hooks/useTouchDevice";
import type { Note } from "../types";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
  notes?: Note[];
  selectedNoteId?: string;
  onNoteSelect?: (noteId: string) => void;
  onNoteDelete?: (noteId: string) => void;
  onNewNote?: () => void;
  isLoading?: boolean;
  hasUnsaved?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
  onClearSaveError?: () => void;
  onManualSave?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteDelete,
  onNewNote,
  isLoading,
  hasUnsaved,
  isSaving,
  lastSaved,
  saveError,
  onClearSaveError,
  onManualSave,
}) => {
  const { deviceInfo } = useTouchDevice();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      className={`layout ${deviceInfo.isTouch ? "touch-optimized" : ""} ${
        deviceInfo.isMobile ? "mobile-optimized" : ""
      } ${deviceInfo.isTablet ? "tablet-optimized" : ""}`}
    >
      <Header
        onMenuClick={toggleSidebar}
        isLoading={isLoading}
        hasUnsaved={hasUnsaved}
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        onClearSaveError={onClearSaveError}
        onManualSave={onManualSave}
      />
      <div className="layout-body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          notes={notes}
          selectedNoteId={selectedNoteId}
          onNoteSelect={onNoteSelect}
          onNoteDelete={onNoteDelete}
          onNewNote={onNewNote}
          isLoading={isLoading}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};
