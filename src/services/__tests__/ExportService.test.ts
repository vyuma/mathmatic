import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService, ExportError } from '../ExportService';
import type { Note, ExportFormat } from '../../types';

// Mock the markdown processor
vi.mock('../../utils/markdownProcessor', () => ({
  processMarkdownToHTML: vi.fn().mockResolvedValue('<p>Test HTML content</p>'),
  generateHTMLDocument: vi.fn().mockReturnValue('<!DOCTYPE html><html><head><title>Test</title></head><body><p>Test HTML content</p></body></html>'),
}));

// Mock URL and document for download functionality
const mockURL = {
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
};

const mockDocument = {
  createElement: vi.fn().mockReturnValue({
    href: '',
    download: '',
    click: vi.fn(),
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

Object.defineProperty(global, 'URL', { value: mockURL });
Object.defineProperty(global, 'document', { value: mockDocument });

describe('ExportService', () => {
  let exportService: ExportService;
  let mockNote: Note;

  beforeEach(() => {
    exportService = new ExportService();
    mockNote = {
      id: 'test-note-1',
      title: 'Test Note',
      content: '# Test Content\n\nThis is a test note with $\\alpha$ math.',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      tags: ['test', 'math'],
    };

    vi.clearAllMocks();
  });

  describe('exportNote', () => {
    it('exports note as markdown successfully', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(mockNote, format);

      expect(result.filename).toBe('Test_Note.md');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.blob).toBeInstanceOf(Blob);
    });

    it('exports note as HTML successfully', async () => {
      const format: ExportFormat = {
        type: 'html',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(mockNote, format);

      expect(result.filename).toBe('Test_Note.html');
      expect(result.mimeType).toBe('text/html');
      expect(result.blob).toBeInstanceOf(Blob);
    });

    it('includes metadata when requested for markdown', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: true,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(mockNote, format);
      
      // Read blob content to verify metadata inclusion
      const text = await result.blob.text();
      expect(text).toContain('---');
      expect(text).toContain('title: "Test Note"');
      expect(text).toContain('created: 2024-01-01T00:00:00.000Z');
      expect(text).toContain('tags: ["test", "math"]');
    });

    it('adds title as H1 when not present in markdown', async () => {
      const noteWithoutTitle = {
        ...mockNote,
        content: 'This content has no title',
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(noteWithoutTitle, format);
      const text = await result.blob.text();
      
      expect(text).toContain('# Test Note\n\n');
      expect(text).toContain('This content has no title');
    });

    it('does not add title when already present in markdown', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(mockNote, format);
      const text = await result.blob.text();
      
      // Should not add duplicate title since content starts with #
      expect(text).not.toContain('# Test Note\n\n# Test Content');
    });

    it('throws ExportError for unsupported format', async () => {
      const format: ExportFormat = {
        type: 'pdf' as any,
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      await expect(exportService.exportNote(mockNote, format))
        .rejects
        .toThrow(ExportError);
    });

    it('handles export errors gracefully', async () => {
      // Mock markdown processor to throw error
      const { processMarkdownToHTML } = await import('../../utils/markdownProcessor');
      vi.mocked(processMarkdownToHTML).mockRejectedValueOnce(new Error('Processing failed'));

      const format: ExportFormat = {
        type: 'html',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      await expect(exportService.exportNote(mockNote, format))
        .rejects
        .toThrow(ExportError);
    });
  });

  describe('downloadFile', () => {
    it('downloads file successfully', () => {
      const mockResult = {
        blob: new Blob(['test content'], { type: 'text/plain' }),
        filename: 'test.txt',
        mimeType: 'text/plain',
      };

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.mocked(mockDocument.createElement).mockReturnValue(mockLink);

      exportService.downloadFile(mockResult);

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockResult.blob);
      expect(mockDocument.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('test.txt');
      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('handles download errors', () => {
      const mockResult = {
        blob: new Blob(['test content'], { type: 'text/plain' }),
        filename: 'test.txt',
        mimeType: 'text/plain',
      };

      vi.mocked(mockURL.createObjectURL).mockImplementationOnce(() => {
        throw new Error('Failed to create URL');
      });

      expect(() => exportService.downloadFile(mockResult))
        .toThrow(ExportError);
    });
  });

  describe('filename sanitization', () => {
    it('sanitizes invalid characters in filename', async () => {
      const noteWithInvalidTitle = {
        ...mockNote,
        title: 'Test<>:"/\\|?*Note',
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(noteWithInvalidTitle, format);
      
      expect(result.filename).toBe('Test_Note.md');
    });

    it('handles empty title gracefully', async () => {
      const noteWithEmptyTitle = {
        ...mockNote,
        title: '',
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(noteWithEmptyTitle, format);
      
      expect(result.filename).toBe('untitled.md');
    });

    it('truncates very long filenames', async () => {
      const noteWithLongTitle = {
        ...mockNote,
        title: 'A'.repeat(150),
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal',
        },
      };

      const result = await exportService.exportNote(noteWithLongTitle, format);
      
      expect(result.filename.length).toBeLessThanOrEqual(103); // 100 + '.md'
    });
  });

  describe('ExportError', () => {
    it('creates error with correct properties', () => {
      const cause = new Error('Original error');
      const error = new ExportError('Export failed', 'markdown', cause);

      expect(error.name).toBe('ExportError');
      expect(error.message).toBe('Export failed');
      expect(error.format).toBe('markdown');
      expect(error.cause).toBe(cause);
    });

    it('creates error without cause', () => {
      const error = new ExportError('Export failed', 'html');

      expect(error.name).toBe('ExportError');
      expect(error.message).toBe('Export failed');
      expect(error.format).toBe('html');
      expect(error.cause).toBeUndefined();
    });
  });
});