import React from 'react';
import { SaveStatus } from './SaveStatus';
import { SaveButton } from './SaveButton';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
  isLoading?: boolean;
  hasUnsaved?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
  onClearSaveError?: () => void;
  onManualSave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  isLoading, 
  hasUnsaved, 
  isSaving,
  lastSaved,
  saveError,
  onClearSaveError,
  onManualSave
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">☰</span>
        </button>
        <h1 className="app-title">
          Math Markdown Notepad
          {isLoading && <span className="loading-indicator"> ⏳</span>}
          {hasUnsaved && <span className="unsaved-indicator"> •</span>}
        </h1>
      </div>
      <div className="header-right">
        <SaveStatus
          isSaving={isSaving || false}
          lastSaved={lastSaved || null}
          hasUnsaved={hasUnsaved || false}
          saveError={saveError || null}
          onClearError={onClearSaveError}
        />
        {onManualSave && (
          <SaveButton
            onSave={onManualSave}
            isSaving={isSaving || false}
            hasUnsaved={hasUnsaved || false}
            size="small"
            variant="primary"
          />
        )}
        <button className="header-button" aria-label="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
};