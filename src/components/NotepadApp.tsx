// Main notepad application component
import React, { useEffect } from 'react';
import { Layout } from './Layout';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { MathEditor } from './MathEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { useMathEditing } from '../hooks/useMathEditing';
import { useNoteManager } from '../hooks/useNoteManager';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useStorageError } from '../contexts/ErrorContext';
import { ScreenReaderAnnouncer, ARIA_LABELS } from '../utils/accessibility';
import './MarkdownEditor.css'; // For math-editor-overlay styles

export const NotepadApp: React.FC = () => {
  
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

  // Handle note selection
  const handleNoteSelect = async (noteId: string) => {
    try {
      await selectNote(noteId);
    } catch (error) {
      handleStorageError(error instanceof Error ? error : new Error(String(error)), 'select note');
    }
  };

  // Handle note deletion with confirmation
  const handleNoteDelete = async (noteId: string) => {
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
  };

  // Handle new note creation
  const handleNewNote = async () => {
    try {
      await createNewNote();
      ScreenReaderAnnouncer.getInstance().announce('New note created');
    } catch (error) {
      handleStorageError(error instanceof Error ? error : new Error(String(error)), 'create new note');
      ScreenReaderAnnouncer.getInstance().announce('Failed to create new note', 'assertive');
    }
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    updateContent(newContent);
  };

  // Handle manual save
  const handleManualSave = async () => {
    if (currentNote && hasUnsaved) {
      try {
        await saveCurrentNote();
        ScreenReaderAnnouncer.getInstance().announce('Note saved successfully');
      } catch (error) {
        handleStorageError(error instanceof Error ? error : new Error(String(error)), 'save note');
        ScreenReaderAnnouncer.getInstance().announce('Failed to save note', 'assertive');
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      
      // Ctrl+M or Cmd+M for inline math
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && !e.shiftKey) {
        e.preventDefault();
        const editorContainer = document.querySelector('.markdown-editor');
        if (editorContainer) {
          const containerRect = editorContainer.getBoundingClientRect();
          const centerPosition = {
            x: containerRect.width / 2,
            y: containerRect.height / 2,
          };
          startMathEditing('', centerPosition, true, currentContent);
        }
      }
      
      // Ctrl+Shift+M or Cmd+Shift+M for display math
      if ((e.ctrlKey || e.metaKey) && e.key === 'M' && e.shiftKey) {
        e.preventDefault();
        const editorContainer = document.querySelector('.markdown-editor');
        if (editorContainer) {
          const containerRect = editorContainer.getBoundingClientRect();
          const centerPosition = {
            x: containerRect.width / 2,
            y: containerRect.height / 2,
          };
          startMathEditing('', centerPosition, false, currentContent);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleManualSave, handleNewNote, startMathEditing, currentContent]);

  // Handle math expression click from preview
  const handleMathClick = (latex: string, position: DOMRect, isInline: boolean) => {
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
  };

  // Handle math editing completion
  const handleMathComplete = (newLatex: string) => {
    const newContent = completeMathEditing(currentContent, newLatex);
    updateContent(newContent);
    stopMathEditing();
  };

  // Handle math editing cancellation
  const handleMathCancel = () => {
    stopMathEditing();
  };

  return (
    <>
      <Layout
        notes={notes}
        selectedNoteId={currentNote?.id}
        onNoteSelect={handleNoteSelect}
        onNoteDelete={handleNoteDelete}
        onNewNote={handleNewNote}
        isLoading={isLoading}
        hasUnsaved={hasUnsaved}
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        onClearSaveError={clearSaveError}
        onManualSave={handleManualSave}
      >
      <div style={{ display: 'flex', height: '100%', position: 'relative' }} role="main">
        <div style={{ flex: 1, padding: '1rem' }} role="region" aria-label={ARIA_LABELS.MARKDOWN_EDITOR}>
          <MarkdownEditor 
            content={currentContent}
            onChange={handleContentChange}
            placeholder="Start writing your markdown note with math support..."
          />
        </div>
        <div style={{ flex: 1, padding: '1rem', borderLeft: '1px solid var(--border-color, #ccc)' }} 
             role="region" aria-label={ARIA_LABELS.PREVIEW_PANE}>
          <MarkdownPreview 
            content={currentContent} 
            onMathClick={handleMathClick}
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
};