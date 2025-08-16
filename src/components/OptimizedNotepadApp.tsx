// Performance-optimized version of the main notepad application
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './Layout';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { MathEditor } from './MathEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { useMathEditing } from '../hooks/useMathEditing';
import { useNoteManager } from '../hooks/useNoteManager';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useStorageError } from '../contexts/ErrorContext';
import { usePerformanceMonitor, debounce } from '../utils/performance';
import { preloadMathField } from './LazyMathField';
import './MarkdownEditor.css'; // For math-editor-overlay styles

export const OptimizedNotepadApp: React.FC = React.memo(() => {
  const editorRef = useRef<{ focusAtPosition: (pos: number) => void }>(null);
  
  // Performance monitoring
  const { getPerformanceSummary, isPerformanceDegrading } = usePerformanceMonitor('NotepadApp');
  
  // Note management
  const {
    notes,
    currentNote,
    currentContent,
    isLoading,
    hasUnsaved,
    isSaving,
    lastSaved,
    saveError,
    createNewNote,
    selectNote,
    updateContent,
    saveCurrentNote,
    deleteNote,
    enableAutoSave,
    clearSaveError
  } = useNoteManager();

  // Confirmation dialog
  const {
    dialogState,
    showConfirmDialog,
    handleConfirm,
    handleCancel
  } = useConfirmDialog();

  // Error handling
  const { handleStorageError } = useStorageError();
  
  // Math editing
  const {
    mathEditingState,
    startMathEditing,
    stopMathEditing,
    updateMathLatex,
    completeMathEditing,
  } = useMathEditing();

  // Preload MathField component when app loads
  useEffect(() => {
    // Preload during idle time to avoid blocking initial render
    const timer = setTimeout(() => {
      preloadMathField();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        if (isPerformanceDegrading()) {
          console.warn('Performance degradation detected:', getPerformanceSummary());
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isPerformanceDegrading, getPerformanceSummary]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleNoteSelect = useCallback(async (noteId: string) => {
    try {
      await selectNote(noteId);
    } catch (error) {
      handleStorageError(error instanceof Error ? error : new Error(String(error)), 'select note');
    }
  }, [selectNote, handleStorageError]);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    const noteTitle = noteToDelete?.title || 'Untitled Note';
    
    showConfirmDialog({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteNote(noteId);
        } catch (error) {
          handleStorageError(error instanceof Error ? error : new Error(String(error)), 'delete note');
        }
      }
    });
  }, [notes, showConfirmDialog, deleteNote, handleStorageError]);

  const handleNewNote = useCallback(async () => {
    try {
      await createNewNote();
    } catch (error) {
      handleStorageError(error instanceof Error ? error : new Error(String(error)), 'create new note');
    }
  }, [createNewNote, handleStorageError]);

  // Debounced content change handler for better performance
  const debouncedUpdateContent = useMemo(
    () => debounce((newContent: string) => {
      updateContent(newContent);
    }, 100),
    [updateContent]
  );

  const handleContentChange = useCallback((newContent: string) => {
    debouncedUpdateContent(newContent);
  }, [debouncedUpdateContent]);

  const handleManualSave = useCallback(async () => {
    if (currentNote && hasUnsaved) {
      try {
        await saveCurrentNote();
      } catch (error) {
        handleStorageError(error instanceof Error ? error : new Error(String(error)), 'save note');
      }
    }
  }, [currentNote, hasUnsaved, saveCurrentNote, handleStorageError]);

  // Memoized keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleManualSave();
    }
    
    // Ctrl+N or Cmd+N for new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      handleNewNote();
    }
  }, [handleManualSave, handleNewNote]);

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Memoized math click handler
  const handleMathClick = useCallback((latex: string, position: DOMRect, isInline: boolean) => {
    // Convert screen position to relative position for the math editor overlay
    const editorContainer = document.querySelector('.markdown-editor');
    if (editorContainer) {
      const containerRect = editorContainer.getBoundingClientRect();
      const relativePosition = {
        x: position.left - containerRect.left,
        y: position.top - containerRect.top + position.height + 8,
      };
      
      startMathEditing(latex, relativePosition, isInline, currentContent);
    }
  }, [startMathEditing, currentContent]);

  // Memoized math editing handlers
  const handleMathComplete = useCallback((newLatex: string) => {
    const newContent = completeMathEditing(currentContent, newLatex);
    updateContent(newContent);
    stopMathEditing();
  }, [completeMathEditing, currentContent, updateContent, stopMathEditing]);

  const handleMathCancel = useCallback(() => {
    stopMathEditing();
  }, [stopMathEditing]);

  // Memoized layout props to prevent unnecessary re-renders
  const layoutProps = useMemo(() => ({
    notes,
    selectedNoteId: currentNote?.id,
    onNoteSelect: handleNoteSelect,
    onNoteDelete: handleNoteDelete,
    onNewNote: handleNewNote,
    isLoading,
    hasUnsaved,
    isSaving,
    lastSaved,
    saveError,
    onClearSaveError: clearSaveError,
    onManualSave: handleManualSave,
  }), [
    notes,
    currentNote?.id,
    handleNoteSelect,
    handleNoteDelete,
    handleNewNote,
    isLoading,
    hasUnsaved,
    isSaving,
    lastSaved,
    saveError,
    clearSaveError,
    handleManualSave,
  ]);

  // Memoized editor content to prevent unnecessary re-renders
  const editorContent = useMemo(() => currentContent, [currentContent]);

  return (
    <>
      <Layout {...layoutProps}>
        <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
          <div style={{ flex: 1, padding: '1rem' }}>
            <MarkdownEditor 
              content={editorContent}
              onChange={handleContentChange}
              placeholder="Start writing your markdown note with math support..."
            />
          </div>
          <div style={{ flex: 1, padding: '1rem', borderLeft: '1px solid var(--border-color, #ccc)' }}>
            <MarkdownPreview 
              content={editorContent} 
              onMathClick={handleMathClick}
              debounceMs={200} // Slightly longer debounce for better performance
            />
          </div>
          
          {/* Math Editor Overlay for Preview Clicks */}
          {mathEditingState.isEditing && (
            <div 
              className="math-editor-overlay"
              style={{
                position: 'absolute',
                left: mathEditingState.position.x,
                top: mathEditingState.position.y,
                zIndex: 1000,
                maxWidth: '400px',
                minWidth: '300px'
              }}
            >
              <MathEditor
                value={mathEditingState.latex}
                onChange={updateMathLatex}
                onComplete={() => handleMathComplete(mathEditingState.latex)}
                onCancel={handleMathCancel}
                isVisible={true}
              />
            </div>
          )}
        </div>
      </Layout>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
});

OptimizedNotepadApp.displayName = 'OptimizedNotepadApp';