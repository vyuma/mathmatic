import React, { useEffect } from 'react';
import { LazyMathField } from './LazyMathField';
import { useMathField } from '../hooks/useMathField';
import { useTouchDevice } from '../hooks/useTouchDevice';
import './MathEditor.css';

// MathEditor component props
export interface MathEditorProps {
  value?: string;
  onChange?: (latex: string) => void;
  onComplete?: () => void;
  onCancel?: () => void;
  isVisible?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MathEditor component - Provides a user-friendly interface for math input
 * Uses MathLive for rich mathematical expression editing
 */
export const MathEditor: React.FC<MathEditorProps> = ({
  value = '',
  onChange,
  onComplete,
  onCancel,
  isVisible = true,
  className = '',
  style
}) => {
  const { deviceInfo } = useTouchDevice();
  
  const {
    mathFieldRef,
    value: mathValue,
    setValue,
    focus,
    blur,
    isActive,
    setIsActive
  } = useMathField({
    initialValue: value,
    virtualKeyboardMode: deviceInfo.isTouch && !deviceInfo.hasPhysicalKeyboard ? 'onfocus' : 'manual',
    smartMode: true
  });

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== mathValue) {
      setValue(value);
    }
  }, [value, mathValue, setValue]);

  // Handle value changes
  const handleChange = (latex: string) => {
    setValue(latex);
    onChange?.(latex);
  };

  // Handle focus
  const handleFocus = () => {
    setIsActive(true);
  };

  // Handle blur
  const handleBlur = () => {
    setIsActive(false);
  };

  // Handle completion (Enter key)
  const handleComplete = () => {
    onComplete?.();
    blur();
  };

  // Handle cancellation (Escape key)
  const handleCancel = () => {
    onCancel?.();
    blur();
  };

  // Auto-focus when visible
  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame to ensure DOM is ready, then add a small delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (mathFieldRef.current) {
            focus();
            // For touch devices, ensure virtual keyboard appears
            if (deviceInfo.isTouch) {
              // Additional focus attempt for touch devices
              focus();
            }
          }
        }, 150); // Slightly longer delay for better reliability
      });
    }
  }, [isVisible, focus, deviceInfo.isTouch]);

  if (!isVisible) {
    return null;
  }

  // Touch optimization is handled in the MathField component

  return (
    <div 
      className={`math-editor ${className} ${isActive ? 'active' : ''} ${
        deviceInfo.isTouch ? 'touch-optimized' : ''
      } ${deviceInfo.isMobile ? 'mobile-optimized' : ''}`}
      style={style}
    >
      <div className="math-editor-field">
        <LazyMathField
          value={mathValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onComplete={handleComplete}
          className="math-field"
        />
      </div>
      
      <div className="math-editor-controls">
        <button 
          type="button"
          onClick={handleComplete}
          className="math-editor-btn math-editor-btn-complete"
          title="Complete (Enter)"
          aria-label="Complete math input"
        >
          ✓
        </button>
        <button 
          type="button"
          onClick={handleCancel}
          className="math-editor-btn math-editor-btn-cancel"
          title="Cancel (Escape)"
          aria-label="Cancel math input"
        >
          ✕
        </button>
      </div>
    </div>
  );
};