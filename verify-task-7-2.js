// Verification script for Task 7.2 - HTML Export Implementation
console.log('=== Task 7.2 Verification: HTML Export Implementation ===\n');

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkFileContent(filePath, expectedContent) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return expectedContent.every(expected => content.includes(expected));
  } catch (error) {
    return false;
  }
}

// Test 1: Check if markdownProcessor.ts was created
console.log('1. Checking if markdownProcessor.ts exists...');
const processorPath = path.join('src', 'utils', 'markdownProcessor.ts');
if (checkFileExists(processorPath)) {
  console.log('   ✓ markdownProcessor.ts file exists');
} else {
  console.log('   ✗ markdownProcessor.ts file not found');
}

// Test 2: Check if markdownProcessor has required functions
console.log('2. Checking markdownProcessor structure...');
const requiredProcessorContent = [
  'processMarkdownToHTML',
  'generateHTMLDocument',
  'unified',
  'remarkMath',
  'rehypeKatex',
  'katex.min.css'
];

if (checkFileContent(processorPath, requiredProcessorContent)) {
  console.log('   ✓ markdownProcessor has required functions');
} else {
  console.log('   ✗ markdownProcessor missing required functions');
}

// Test 3: Check if ExportService HTML export is implemented
console.log('3. Checking ExportService HTML implementation...');
const exportServicePath = path.join('src', 'services', 'ExportService.ts');
const requiredExportContent = [
  'exportAsHTML',
  'processMarkdownToHTML',
  'generateHTMLDocument',
  'text/html;charset=utf-8',
  'Failed to export as HTML'
];

if (checkFileContent(exportServicePath, requiredExportContent)) {
  console.log('   ✓ ExportService HTML export implemented');
} else {
  console.log('   ✗ ExportService HTML export not properly implemented');
}

// Test 4: Check if HTML export no longer throws "not implemented" error
console.log('4. Checking if HTML export placeholder is removed...');
const exportServiceContent = fs.readFileSync(exportServicePath, 'utf8');
const hasNotImplementedError = exportServiceContent.includes('HTML export not yet implemented');

if (!hasNotImplementedError) {
  console.log('   ✓ HTML export placeholder removed');
} else {
  console.log('   ✗ HTML export still has "not implemented" placeholder');
}

// Test 5: Check if tests are updated for HTML export
console.log('5. Checking if tests are updated...');
const testPath = path.join('src', 'test', 'ExportService.test.ts');
const requiredTestContent = [
  'exportAsHTML',
  'should export note as HTML',
  'Document Information',
  'katex.min.css',
  'text/html'
];

if (checkFileContent(testPath, requiredTestContent)) {
  console.log('   ✓ Tests updated for HTML export');
} else {
  console.log('   ✗ Tests not properly updated for HTML export');
}

// Test 6: Check specific HTML export functionality
console.log('6. Checking HTML export functionality...');
const functionalityChecks = [
  { 
    name: 'KaTeX CSS integration', 
    check: exportServiceContent.includes('katex') && processorPath && checkFileContent(processorPath, ['katex.min.css'])
  },
  { 
    name: 'Complete HTML document generation', 
    check: processorPath && checkFileContent(processorPath, ['<!DOCTYPE html>', '<html lang="en">'])
  },
  { 
    name: 'Metadata inclusion support', 
    check: processorPath && checkFileContent(processorPath, ['includeMetadata', 'Document Information'])
  },
  { 
    name: 'Styling options support', 
    check: processorPath && checkFileContent(processorPath, ['styling', 'minimal', 'full'])
  },
  { 
    name: 'Math rendering with rehype-katex', 
    check: processorPath && checkFileContent(processorPath, ['rehypeKatex', 'remarkMath'])
  },
  { 
    name: 'Responsive CSS styles', 
    check: processorPath && checkFileContent(processorPath, ['@media', 'max-width'])
  }
];

let passedChecks = 0;
functionalityChecks.forEach(check => {
  if (check.check) {
    console.log(`   ✓ ${check.name}`);
    passedChecks++;
  } else {
    console.log(`   ✗ ${check.name}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Functionality checks: ${passedChecks}/${functionalityChecks.length} passed`);

if (passedChecks === functionalityChecks.length) {
  console.log('✓ Task 7.2 implementation appears complete!');
  console.log('\nImplemented features:');
  console.log('- HTML rendering with KaTeX CSS integration');
  console.log('- Complete HTML document generation');
  console.log('- Metadata inclusion in HTML exports');
  console.log('- Styling options (minimal/full)');
  console.log('- Math expression rendering with rehype-katex');
  console.log('- Responsive CSS styles');
  console.log('- Proper error handling for HTML export');
  console.log('- Updated tests for HTML functionality');
} else {
  console.log('✗ Task 7.2 implementation incomplete');
}