import React from 'react';
import './SaveButton.css';

interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
  hasUnsaved: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isSaving,
  hasUnsaved,
  disabled = false,
  variant = 'primary',
  size = 'medium'
}) => {
  const getButtonText = (): string => {
    if (isSaving) return 'Saving...';
    if (hasUnsaved) return 'Save';
    return 'Saved';
  };

  const getButtonIcon = (): string => {
    if (isSaving) return '⏳';
    if (hasUnsaved) return '💾';
    return '✅';
  };

  const isDisabled = disabled || isSaving || !hasUnsaved;

  const handleClick = () => {
    if (!isDisabled) {
      onSave();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={`save-button ${variant} ${size} ${hasUnsaved ? 'has-changes' : 'no-changes'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      title={hasUnsaved ? 'Save changes (Ctrl+S)' : 'No changes to save'}
      aria-label={`${getButtonText()}${hasUnsaved ? ' - has unsaved changes' : ''}`}
    >
      <span className="save-button-icon">{getButtonIcon()}</span>
      <span className="save-button-text">{getButtonText()}</span>
    </button>
  );
};