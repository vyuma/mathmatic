import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { MarkdownPreview } from '../components/MarkdownPreview';

// Integration test component
const EditorPreviewIntegration: React.FC = () => {
  const [content, setContent] = useState('');
  
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <MarkdownEditor 
          content={content}
          onChange={setContent}
          placeholder="Type here..."
        />
      </div>
      <div style={{ flex: 1 }}>
        <MarkdownPreview 
          content={content}
          debounceMs={50} // Faster for testing
        />
      </div>
    </div>
  );
};

describe('Editor-Preview Integration', () => {
  it('updates preview when editor content changes', async () => {
    render(<EditorPreviewIntegration />);
    
    const textarea = screen.getByPlaceholderText('Type here...');
    
    // Type markdown content
    fireEvent.change(textarea, { 
      target: { value: '# Hello World\n\nThis is **bold** text.' } 
    });
    
    // Wait for debounced update
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles math expressions in real-time', async () => {
    render(<EditorPreviewIntegration />);
    
    const textarea = screen.getByPlaceholderText('Type here...');
    
    // Type math content
    fireEvent.change(textarea, { 
      target: { value: 'Inline math: $x = 2$ and block:\n\n$$E = mc^2$$' } 
    });
    
    // Wait for debounced update and math rendering
    await waitFor(() => {
      // Check if KaTeX elements are present
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    }, { timeout: 300 });
  });

  it('handles code blocks correctly', async () => {
    render(<EditorPreviewIntegration />);
    
    const textarea = screen.getByPlaceholderText('Type here...');
    
    // Type code block
    fireEvent.change(textarea, { 
      target: { value: '```javascript\nconst hello = "world";\nconsole.log(hello);\n```' } 
    });
    
    // Wait for debounced update
    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('const hello = "world";')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles lists and formatting', async () => {
    render(<EditorPreviewIntegration />);
    
    const textarea = screen.getByPlaceholderText('Type here...');
    
    // Type list content
    fireEvent.change(textarea, { 
      target: { value: '- First item\n- Second **bold** item\n- Third *italic* item' } 
    });
    
    // Wait for debounced update
    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    }, { timeout: 200 });
  });
});