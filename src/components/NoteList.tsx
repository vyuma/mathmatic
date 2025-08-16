import React from 'react';
import type { Note } from '../types';
import './NoteList.css';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (noteId: string) => void;
  onNoteDelete?: (noteId: string) => void;
}

export const NoteList: React.FC<NoteListProps> = React.memo(({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteDelete
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreviewText = (content: string) => {
    // Remove markdown syntax and math expressions for preview
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\$\$.*?\$\$/g, '[Math]') // Replace block math
      .replace(/\$.*?\$/g, '[Math]') // Replace inline math
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    return cleanContent.length > 100 
      ? cleanContent.substring(0, 100) + '...'
      : cleanContent;
  };

  const getNoteTitle = (note: Note) => {
    if (note.title && note.title.trim()) {
      return note.title;
    }
    
    // Extract title from first line of content
    const firstLine = note.content.split('\n')[0];
    if (firstLine) {
      const cleanTitle = firstLine
        .replace(/#{1,6}\s+/, '') // Remove markdown header syntax
        .trim();
      return cleanTitle || 'Untitled Note';
    }
    
    return 'Untitled Note';
  };

  if (notes.length === 0) {
    return (
      <div className="note-list-empty">
        <div className="empty-icon">📝</div>
        <p>No notes yet</p>
        <p>Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${selectedNoteId === note.id ? 'note-item-selected' : ''}`}
          onClick={() => onNoteSelect(note.id)}
        >
          <div className="note-item-header">
            <h3 className="note-title">{getNoteTitle(note)}</h3>
            {onNoteDelete && (
              <button
                className="note-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteDelete(note.id);
                }}
                aria-label="Delete note"
              >
                🗑️
              </button>
            )}
          </div>
          
          <p className="note-preview">{getPreviewText(note.content)}</p>
          
          <div className="note-metadata">
            <span className="note-date" title={`Created: ${note.createdAt.toLocaleString()}`}>
              {formatDate(note.updatedAt)}
            </span>
            {note.tags && note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="note-tag">
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="note-tag-more">+{note.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});