import { Note, ExportFormat, ExportOptions, ExportResult } from '../types';

// Export error class
export class ExportError extends Error {
  constructor(message: string, public format: string, public cause?: Error) {
    super(message);
    this.name = 'ExportError';
  }
}

// Export service interface
export interface IExportService {
  exportNote(note: Note, format: ExportFormat): Promise<ExportResult>;
  downloadFile(result: ExportResult): void;
}

// Export service implementation
export class ExportService implements IExportService {
  
  /**
   * Export a note in the specified format
   */
  async exportNote(note: Note, format: ExportFormat): Promise<ExportResult> {
    try {
      switch (format.type) {
        case 'markdown':
          return await this.exportAsMarkdown(note, format.options);
        case 'html':
          return await this.exportAsHTML(note, format.options);
        default:
          throw new ExportError(`Unsupported export format: ${format.type}`, format.type);
      }
    } catch (error) {
      if (error instanceof ExportError) {
        throw error;
      }
      throw new ExportError(
        `Failed to export note "${note.title}" as ${format.type}`,
        format.type,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Download the exported file
   */
  downloadFile(result: ExportResult): void {
    try {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new ExportError(
        `Failed to download file: ${result.filename}`,
        'download',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Export note as Markdown file
   */
  private async exportAsMarkdown(note: Note, options: ExportOptions): Promise<ExportResult> {
    try {
      let content = '';
      
      // Add metadata if requested
      if (options.includeMetadata) {
        content += this.generateMarkdownMetadata(note);
        content += '\n\n';
      }
      
      // Add title as H1 if not already present
      if (!note.content.trim().startsWith('#')) {
        content += `# ${note.title}\n\n`;
      }
      
      // Add the main content
      content += note.content;
      
      // Ensure proper line ending
      if (!content.endsWith('\n')) {
        content += '\n';
      }
      
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const filename = this.sanitizeFilename(`${note.title}.md`);
      
      return {
        blob,
        filename,
        mimeType: 'text/markdown'
      };
    } catch (error) {
      throw new ExportError(
        `Failed to export as Markdown: ${error instanceof Error ? error.message : String(error)}`,
        'markdown',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Export note as HTML file
   */
  private async exportAsHTML(note: Note, options: ExportOptions): Promise<ExportResult> {
    try {
      const { processMarkdownToHTML, generateHTMLDocument } = await import('../utils/markdownProcessor');
      
      // Process markdown content to HTML
      const htmlContent = await processMarkdownToHTML(note.content);
      
      // Generate complete HTML document
      const fullHTML = generateHTMLDocument(note.title, htmlContent, {
        includeMetadata: options.includeMetadata,
        styling: options.styling,
        note: note
      });
      
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const filename = this.sanitizeFilename(`${note.title}.html`);
      
      return {
        blob,
        filename,
        mimeType: 'text/html'
      };
    } catch (error) {
      throw new ExportError(
        `Failed to export as HTML: ${error instanceof Error ? error.message : String(error)}`,
        'html',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Generate markdown metadata section
   */
  private generateMarkdownMetadata(note: Note): string {
    const metadata = [
      '---',
      `title: "${note.title}"`,
      `created: ${note.createdAt.toISOString()}`,
      `updated: ${note.updatedAt.toISOString()}`,
      `id: ${note.id}`
    ];
    
    if (note.tags && note.tags.length > 0) {
      metadata.push(`tags: [${note.tags.map(tag => `"${tag}"`).join(', ')}]`);
    }
    
    metadata.push('---');
    
    return metadata.join('\n');
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private sanitizeFilename(filename: string): string {
    // Remove or replace invalid characters
    const sanitized = filename
      .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid chars with underscore
      .replace(/\s+/g, '_')           // Replace spaces with underscore
      .replace(/_{2,}/g, '_')         // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '');       // Remove leading/trailing underscores
    
    // Ensure filename is not empty and has reasonable length
    const finalName = sanitized || 'untitled';
    return finalName.length > 100 ? finalName.substring(0, 100) : finalName;
  }
}

// Default export service instance
export const exportService = new ExportService();