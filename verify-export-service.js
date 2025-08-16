// Simple verification script for ExportService
import { ExportService } from './src/services/ExportService.js';

// Mock note for testing
const mockNote = {
  id: 'test-note-1',
  title: 'Test Note',
  content: '# Test Content\n\nThis is a test note with some $x^2$ math.',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-02T15:30:00Z'),
  tags: ['test', 'math']
};

const exportService = new ExportService();

async function testMarkdownExport() {
  console.log('Testing Markdown export...');
  
  try {
    const format = {
      type: 'markdown',
      options: {
        includeMetadata: true,
        mathFormat: 'latex',
        styling: 'minimal'
      }
    };

    const result = await exportService.exportNote(mockNote, format);
    console.log('✓ Export successful');
    console.log('  Filename:', result.filename);
    console.log('  MIME type:', result.mimeType);
    console.log('  Blob size:', result.blob.size, 'bytes');
    
    // Read content
    const content = await result.blob.text();
    console.log('  Content preview:');
    console.log('  ' + content.split('\n').slice(0, 5).join('\n  '));
    
    return true;
  } catch (error) {
    console.error('✗ Export failed:', error.message);
    return false;
  }
}

async function testFilenamesSanitization() {
  console.log('\nTesting filename sanitization...');
  
  const badTitleNote = {
    ...mockNote,
    title: 'Bad/Title<>:"|?*Name   with   spaces'
  };
  
  try {
    const format = {
      type: 'markdown',
      options: {
        includeMetadata: false,
        mathFormat: 'latex',
        styling: 'minimal'
      }
    };

    const result = await exportService.exportNote(badTitleNote, format);
    console.log('✓ Filename sanitization successful');
    console.log('  Original title:', badTitleNote.title);
    console.log('  Sanitized filename:', result.filename);
    
    return true;
  } catch (error) {
    console.error('✗ Filename sanitization failed:', error.message);
    return false;
  }
}

async function testHTMLExportError() {
  console.log('\nTesting HTML export error handling...');
  
  try {
    const format = {
      type: 'html',
      options: {
        includeMetadata: false,
        mathFormat: 'latex',
        styling: 'minimal'
      }
    };

    await exportService.exportNote(mockNote, format);
    console.error('✗ HTML export should have failed');
    return false;
  } catch (error) {
    if (error.message.includes('HTML export not yet implemented')) {
      console.log('✓ HTML export correctly throws error:', error.message);
      return true;
    } else {
      console.error('✗ Unexpected error:', error.message);
      return false;
    }
  }
}

// Run all tests
async function runTests() {
  console.log('=== ExportService Verification ===\n');
  
  const results = await Promise.all([
    testMarkdownExport(),
    testFilenamesSanitization(),
    testHTMLExportError()
  ]);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  
  if (passed === total) {
    console.log('✓ All tests passed! ExportService basic implementation is working.');
  } else {
    console.log('✗ Some tests failed. Please check the implementation.');
  }
}

runTests().catch(console.error);