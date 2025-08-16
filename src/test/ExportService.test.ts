import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService, ExportError } from '../services/ExportService';
import { Note, ExportFormat } from '../types';

describe('ExportService', () => {
  let exportService: ExportService;
  let mockNote: Note;

  beforeEach(() => {
    exportService = new ExportService();
    mockNote = {
      id: 'test-note-1',
      title: 'Test Note',
      content: '# Test Content\n\nThis is a test note with some $x^2$ math.',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-02T15:30:00Z'),
      tags: ['test', 'math']
    };
  });

  describe('exportAsMarkdown', () => {
    it('should export note as markdown without metadata', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal'
        }
      };

      const result = await exportService.exportNote(mockNote, format);

      expect(result.filename).toBe('Test_Note.md');
      expect(result.mimeType).toBe('text/markdown');
      expect(result.blob.type).toBe('text/markdown;charset=utf-8');

      // Read blob content
      const content = await result.blob.text();
      expect(content).toContain('# Test Content');
      expect(content).toContain('This is a test note with some $x^2$ math.');
      expect(content).not.toContain('---'); // No metadata
    });

    it('should export note as markdown with metadata', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: true,
          mathFormat: 'latex',
          styling: 'minimal'
        }
      };

      const result = await exportService.exportNote(mockNote, format);
      const content = await result.blob.text();

      expect(content).toContain('---');
      expect(content).toContain('title: "Test Note"');
      expect(content).toContain('created: 2024-01-01T10:00:00.000Z');
      expect(content).toContain('updated: 2024-01-02T15:30:00.000Z');
      expect(content).toContain('id: test-note-1');
      expect(content).toContain('tags: ["test", "math"]');
    });

    it('should add title as H1 if content does not start with #', async () => {
      const noteWithoutTitle = {
        ...mockNote,
        content: 'This content has no title heading.'
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal'
        }
      };

      const result = await exportService.exportNote(noteWithoutTitle, format);
      const content = await result.blob.text();

      expect(content).toContain('# Test Note\n\n');
      expect(content).toContain('This content has no title heading.');
    });

    it('should sanitize filename properly', async () => {
      const noteWithBadTitle = {
        ...mockNote,
        title: 'Bad/Title<>:"|?*Name'
      };

      const format: ExportFormat = {
        type: 'markdown',
        options: {
          includeMetadata: false,
          mathFormat: 'latex',
          styling: 'minimal'
        }
      };

      const result = await exportService.exportNote(noteWithBadTitle, format);
      expect(result.filename).toBe('Bad_Title_Name.md');
    });
  });

  describe('downloadFile', () => {
    it('should create download link and trigger download', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      // Mock URL methods
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const mockResult = {
        blob: new Blob(['test content'], { type: 'text/plain' }),
        filename: 'test.txt',
        mimeType: 'text/plain'
      };

      exportService.downloadFile(mockResult);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      // Restore mocks
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('exportAsHTML', () => {
    it('should export note as HTML without metadata', async () => {
      const format: ExportFormat = {
        type: 'html',
        options: {
          includeMetadata: false,
          mathFormat: 'katex',
          styling: 'minimal'
        }
      };

      const result = await exportService.exportNote(mockNote, format);

      expect(result.filename).toBe('Test_Note.html');
      expect(result.mimeType).toBe('text/html');
      expect(result.blob.type).toBe('text/html;charset=utf-8');

      // Read blob content
      const content = await result.blob.text();
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<title>Test Note</title>');
      expect(content).toContain('katex');
      expect(content).not.toContain('Document Information'); // No metadata
    });

    it('should export note as HTML with metadata', async () => {
      const format: ExportFormat = {
        type: 'html',
        options: {
          includeMetadata: true,
          mathFormat: 'katex',
          styling: 'full'
        }
      };

      const result = await exportService.exportNote(mockNote, format);
      const content = await result.blob.text();

      expect(content).toContain('Document Information');
      expect(content).toContain('Test Note');
      expect(content).toContain('test, math');
      expect(content).toContain('test-note-1');
    });

    it('should include proper CSS styling', async () => {
      const format: ExportFormat = {
        type: 'html',
        options: {
          includeMetadata: false,
          mathFormat: 'katex',
          styling: 'full'
        }
      };

      const result = await exportService.exportNote(mockNote, format);
      const content = await result.blob.text();

      expect(content).toContain('<style>');
      expect(content).toContain('font-family:');
      expect(content).toContain('.katex');
      expect(content).toContain('katex.min.css');
    });
  });

  describe('error handling', () => {
    it('should throw ExportError for unsupported format', async () => {
      const format = {
        type: 'pdf' as any,
        options: {
          includeMetadata: false,
          mathFormat: 'latex' as const,
          styling: 'minimal' as const
        }
      };

      await expect(exportService.exportNote(mockNote, format))
        .rejects.toThrow(ExportError);
    });
  });
});