import { useEffect, useRef, useCallback, useState } from 'react';

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

export interface UseAutoSaveOptions {
  delay?: number; // Debounce delay in milliseconds
  enabled?: boolean; // Whether auto-save is enabled
  onSave: () => Promise<void>; // Save function to call
  onError?: (error: Error) => void; // Error handler
}

export interface UseAutoSaveReturn {
  autoSaveState: AutoSaveState;
  triggerSave: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for auto-save functionality with debouncing
 */
export const useAutoSave = (
  content: string,
  options: UseAutoSaveOptions
): UseAutoSaveReturn => {
  const {
    delay = 5000, // 5 seconds default
    enabled = true,
    onSave,
    onError
  } = options;

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(content);
  const lastSavedContentRef = useRef<string>(content);

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(async () => {
    if (!enabled) return;

    setAutoSaveState(prev => ({
      ...prev,
      isSaving: true,
      saveError: null
    }));

    try {
      await onSave();
      
      // Update state on successful save
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveError: null
      }));

      // Update the last saved content reference
      lastSavedContentRef.current = content;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: errorMessage
      }));

      // Call error handler if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [content, enabled, onSave, onError]);

  /**
   * Trigger immediate save (for manual save)
   */
  const triggerSave = useCallback(async () => {
    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await performSave();
  }, [performSave]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setAutoSaveState(prev => ({
      ...prev,
      saveError: null
    }));
  }, []);

  /**
   * Schedule auto-save with debouncing
   */
  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      performSave();
      timeoutRef.current = null;
    }, delay);
  }, [enabled, delay, performSave]);

  /**
   * Effect to handle content changes and trigger auto-save
   */
  useEffect(() => {
    // Check if content has actually changed
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      
      // Check if there are unsaved changes
      const hasChanges = content !== lastSavedContentRef.current;
      
      setAutoSaveState(prev => ({
        ...prev,
        hasUnsavedChanges: hasChanges
      }));

      // Schedule auto-save if there are changes
      if (hasChanges && enabled) {
        scheduleAutoSave();
      }
    }
  }, [content, enabled, scheduleAutoSave]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Initialize last saved content when enabled changes
   */
  useEffect(() => {
    if (enabled && !autoSaveState.lastSaved) {
      // If auto-save is enabled and we haven't saved yet,
      // consider the current content as the baseline
      lastSavedContentRef.current = content;
      setAutoSaveState(prev => ({
        ...prev,
        hasUnsavedChanges: false
      }));
    }
  }, [enabled, content, autoSaveState.lastSaved]);

  return {
    autoSaveState,
    triggerSave,
    clearError
  };
};