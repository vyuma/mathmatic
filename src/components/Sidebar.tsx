import React, { useMemo } from 'react';
import { NoteList } from './NoteList';
import { VirtualizedNoteList } from './VirtualizedNoteList';
import type { Note } from '../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notes?: Note[];
  selectedNoteId?: string;
  onNoteSelect?: (noteId: string) => void;
  onNoteDelete?: (noteId: string) => void;
  onNewNote?: () => void;
  isLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ 
  isOpen, 
  onClose, 
  notes = [], 
  selectedNoteId,
  onNoteSelect,
  onNoteDelete,
  onNewNote,
  isLoading
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Notes</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        
        <div className="sidebar-actions">
          <button 
            className="new-note-button"
            onClick={onNewNote}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Creating...' : '+ New Note'}
          </button>
        </div>
        
        <div className="notes-list">
          {useMemo(() => {
            // Use virtualized list for large numbers of notes (>50)
            if (notes.length > 50) {
              return (
                <VirtualizedNoteList
                  notes={notes}
                  selectedNoteId={selectedNoteId}
                  onNoteSelect={onNoteSelect || (() => {})}
                  onNoteDelete={onNoteDelete}
                  containerHeight={400}
                  itemHeight={120}
                />
              );
            }
            
            // Use regular list for smaller numbers
            return (
              <NoteList
                notes={notes}
                selectedNoteId={selectedNoteId}
                onNoteSelect={onNoteSelect || (() => {})}
                onNoteDelete={onNoteDelete}
              />
            );
          }, [notes, selectedNoteId, onNoteSelect, onNoteDelete])}
        </div>
      </aside>
    </>
  );
});