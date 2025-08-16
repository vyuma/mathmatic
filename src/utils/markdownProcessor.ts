import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import type { Note } from '../types';

/**
 * Process markdown content and convert to HTML with math support
 */
export async function processMarkdownToHTML(content: string): Promise<string> {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(rehypeStringify);

    const result = await processor.process(content);
    return String(result);
  } catch (error) {
    throw new Error(`Failed to process markdown: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate complete HTML document with KaTeX CSS and proper structure
 */
export function generateHTMLDocument(
  title: string, 
  htmlContent: string, 
  options: {
    includeMetadata?: boolean;
    styling?: 'minimal' | 'full';
    note?: Note;
  } = {}
): string {
  const { includeMetadata = false, styling = 'full', note } = options;
  
  // KaTeX CSS (using CDN for now, could be inlined for offline use)
  const katexCSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
  
  // Basic CSS styles
  const basicStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
      background-color: #fff;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 { font-size: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    
    p { margin-bottom: 1rem; }
    
    code {
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    pre {
      background-color: #f6f8fa;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6a737d;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid #dfe2e5;
      padding: 0.5rem 1rem;
      text-align: left;
    }
    
    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    
    ul, ol {
      padding-left: 2rem;
      margin: 1rem 0;
    }
    
    li {
      margin-bottom: 0.25rem;
    }
    
    a {
      color: #0366d6;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .katex {
      font-size: 1.1em;
    }
    
    .katex-display {
      margin: 1rem 0;
    }
    
    .metadata {
      background-color: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 2rem;
      font-size: 0.9em;
      color: #586069;
    }
    
    .metadata h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      color: #24292e;
    }
    
    .metadata-item {
      margin-bottom: 0.25rem;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      h1 { font-size: 1.5rem; }
      h2 { font-size: 1.25rem; }
      h3 { font-size: 1.1rem; }
    }
    
    @media print {
      body {
        max-width: none;
        margin: 0;
        padding: 1rem;
      }
      
      .metadata {
        break-inside: avoid;
      }
    }
  `;
  
  const minimalStyles = `
    body {
      font-family: serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .katex { font-size: 1.1em; }
    .katex-display { margin: 1rem 0; }
  `;
  
  const styles = styling === 'minimal' ? minimalStyles : basicStyles;
  
  // Generate metadata section if requested
  let metadataHTML = '';
  if (includeMetadata && note) {
    const createdDate = note.createdAt.toLocaleDateString();
    const updatedDate = note.updatedAt.toLocaleDateString();
    const tags = note.tags && note.tags.length > 0 ? note.tags.join(', ') : 'None';
    
    metadataHTML = `
      <div class="metadata">
        <h3>Document Information</h3>
        <div class="metadata-item"><strong>Title:</strong> ${escapeHtml(note.title)}</div>
        <div class="metadata-item"><strong>Created:</strong> ${createdDate}</div>
        <div class="metadata-item"><strong>Updated:</strong> ${updatedDate}</div>
        <div class="metadata-item"><strong>Tags:</strong> ${escapeHtml(tags)}</div>
        <div class="metadata-item"><strong>ID:</strong> ${escapeHtml(note.id)}</div>
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${katexCSS}" crossorigin="anonymous">
  <style>
    ${styles}
  </style>
</head>
<body>
  ${metadataHTML}
  ${htmlContent}
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate inline KaTeX CSS for offline use
 */
export async function getInlineKatexCSS(): Promise<string> {
  // This would fetch the KaTeX CSS and return it as a string
  // For now, we'll use the CDN version, but this could be enhanced
  // to include the CSS inline for truly offline HTML exports
  return `/* KaTeX CSS would be inlined here for offline use */`;
}