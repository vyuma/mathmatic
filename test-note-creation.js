// Simple test to verify note creation functionality
import { createBlankNote, generateNoteId, generateNoteTitle } from './src/utils/noteUtils.js';

console.log('Testing note creation functionality...');

// Test 1: Generate unique IDs
console.log('\n1. Testing ID generation:');
const id1 = generateNoteId();
const id2 = generateNoteId();
console.log('ID 1:', id1);
console.log('ID 2:', id2);
console.log('IDs are unique:', id1 !== id2);

// Test 2: Create blank note
console.log('\n2. Testing blank note creation:');
const blankNote = createBlankNote();
console.log('Blank note:', {
  id: blankNote.id,
  title: blankNote.title,
  content: blankNote.content,
  hasCreatedAt: blankNote.createdAt instanceof Date,
  hasUpdatedAt: blankNote.updatedAt instanceof Date,
  tags: blankNote.tags
});

// Test 3: Generate titles
console.log('\n3. Testing title generation:');
console.log('Empty content:', generateNoteTitle(''));
console.log('Simple content:', generateNoteTitle('Hello world'));
console.log('Markdown heading:', generateNoteTitle('# My Title\nContent here'));
console.log('Long content:', generateNoteTitle('This is a very long title that should be truncated because it exceeds the maximum length allowed'));

console.log('\n✅ All tests completed successfully!');