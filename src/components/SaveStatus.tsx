import React from 'react';
import './SaveStatus.css';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsaved: boolean;
  saveError: string | null;
  onClearError?: () => void;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  isSaving,
  lastSaved,
  hasUnsaved,
  saveError,
  onClearError
}) => {
  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (): string => {
    if (saveError) return '❌';
    if (isSaving) return '⏳';
    if (hasUnsaved) return '●';
    return '✅';
  };

  const getStatusText = (): string => {
    if (saveError) return 'Save failed';
    if (isSaving) return 'Saving...';
    if (hasUnsaved) return 'Unsaved changes';
    if (lastSaved) return `Saved ${formatLastSaved(lastSaved)}`;
    return 'No changes';
  };

  const getStatusClass = (): string => {
    if (saveError) return 'save-status error';
    if (isSaving) return 'save-status saving';
    if (hasUnsaved) return 'save-status unsaved';
    return 'save-status saved';
  };

  return (
    <div className={getStatusClass()}>
      <span className="save-status-icon">{getStatusIcon()}</span>
      <span className="save-status-text">{getStatusText()}</span>
      {saveError && onClearError && (
        <button 
          className="save-status-clear-error"
          onClick={onClearError}
          title="Clear error"
        >
          ×
        </button>
      )}
    </div>
  );
};