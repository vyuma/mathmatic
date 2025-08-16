import React, { useMemo, useCallback } from 'react';
import type { Note } from '../types';
import './NoteList.css';

interface VirtualizedNoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (noteId: string) => void;
  onNoteDelete?: (noteId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

interface VirtualizedItem {
  index: number;
  note: Note;
  style: React.CSSProperties;
}

// Individual note item component - memoized for performance
const NoteItem: React.FC<{
  note: Note;
  isSelected: boolean;
  onSelect: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
  style: React.CSSProperties;
}> = React.memo(({ note, isSelected, onSelect, onDelete, style }) => {
  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  const getPreviewText = useCallback((content: string) => {
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
  }, []);

  const getNoteTitle = useCallback((note: Note) => {
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
  }, []);

  const handleClick = useCallback(() => {
    onSelect(note.id);
  }, [note.id, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(note.id);
  }, [note.id, onDelete]);

  return (
    <div
      style={style}
      className={`note-item ${isSelected ? 'note-item-selected' : ''}`}
      onClick={handleClick}
    >
      <div className="note-item-header">
        <h3 className="note-title">{getNoteTitle(note)}</h3>
        {onDelete && (
          <button
            className="note-delete-button"
            onClick={handleDelete}
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
  );
});

NoteItem.displayName = 'NoteItem';

export const VirtualizedNoteList: React.FC<VirtualizedNoteListProps> = React.memo(({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteDelete,
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const end = Math.min(notes.length, start + visibleCount);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, notes.length]);

  // Generate visible items
  const visibleItems: VirtualizedItem[] = useMemo(() => {
    const items: VirtualizedItem[] = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      items.push({
        index: i,
        note: notes[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    
    return items;
  }, [notes, visibleRange, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (notes.length === 0) {
    return (
      <div className="note-list-empty">
        <div className="empty-icon">📝</div>
        <p>No notes yet</p>
        <p>Create your first note to get started</p>
      </div>
    );
  }

  const totalHeight = notes.length * itemHeight;

  return (
    <div 
      className="note-list virtualized-note-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, note, style }) => (
          <NoteItem
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={onNoteSelect}
            onDelete={onNoteDelete}
            style={style}
          />
        ))}
      </div>
    </div>
  );
});

VirtualizedNoteList.displayName = 'VirtualizedNoteList';