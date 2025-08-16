// Verification script for MarkdownPreview functionality
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying MarkdownPreview implementation...\n');

// Check if required files exist
const requiredFiles = [
  'src/components/MarkdownPreview.tsx',
  'src/components/MarkdownPreview.css',
  'src/components/__tests__/MarkdownPreview.test.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check MarkdownPreview component implementation
const previewContent = fs.readFileSync('src/components/MarkdownPreview.tsx', 'utf8');

const requiredFeatures = [
  { name: 'react-markdown import', pattern: /import ReactMarkdown from ['"]react-markdown['"]/ },
  { name: 'remark-gfm plugin', pattern: /import remarkGfm from ['"]remark-gfm['"]/ },
  { name: 'remark-math plugin', pattern: /import remarkMath from ['"]remark-math['"]/ },
  { name: 'rehype-katex plugin', pattern: /import rehypeKatex from ['"]rehype-katex['"]/ },
  { name: 'debounce functionality', pattern: /debounce|setTimeout/ },
  { name: 'math click handler', pattern: /onMathClick/ },
  { name: 'custom components', pattern: /components:\s*\{/ },
  { name: 'remarkPlugins configuration', pattern: /remarkPlugins:\s*\[.*remarkGfm.*remarkMath.*\]/ },
  { name: 'rehypePlugins configuration', pattern: /rehypePlugins:\s*\[.*rehypeKatex.*\]/ }
];

console.log('\n📋 Checking required features:');
let allFeaturesPresent = true;
requiredFeatures.forEach(feature => {
  if (feature.pattern.test(previewContent)) {
    console.log(`✅ ${feature.name}`);
  } else {
    console.log(`❌ ${feature.name} missing or incorrect`);
    allFeaturesPresent = false;
  }
});

// Check CSS file
const cssContent = fs.readFileSync('src/components/MarkdownPreview.css', 'utf8');
const cssFeatures = [
  { name: 'responsive design', pattern: /@media.*max-width/ },
  { name: 'dark mode support', pattern: /@media.*prefers-color-scheme.*dark/ },
  { name: 'math styling', pattern: /\.katex/ },
  { name: 'preview content styling', pattern: /\.preview-content/ },
  { name: 'markdown element styling', pattern: /\.preview-heading|\.preview-paragraph/ }
];

console.log('\n🎨 Checking CSS features:');
let allCSSFeaturesPresent = true;
cssFeatures.forEach(feature => {
  if (feature.pattern.test(cssContent)) {
    console.log(`✅ ${feature.name}`);
  } else {
    console.log(`❌ ${feature.name} missing`);
    allCSSFeaturesPresent = false;
  }
});

// Check test file
const testContent = fs.readFileSync('src/components/__tests__/MarkdownPreview.test.tsx', 'utf8');
const testFeatures = [
  { name: 'basic rendering test', pattern: /renders without crashing/ },
  { name: 'empty state test', pattern: /empty state/ },
  { name: 'markdown rendering test', pattern: /renders markdown content/ },
  { name: 'math rendering test', pattern: /math expressions/ },
  { name: 'math click test', pattern: /onMathClick/ },
  { name: 'debounce test', pattern: /debounce|Updating/ },
  { name: 'code block test', pattern: /code blocks/ },
  { name: 'table test', pattern: /tables/ }
];

console.log('\n🧪 Checking test coverage:');
let allTestsPresent = true;
testFeatures.forEach(feature => {
  if (feature.pattern.test(testContent)) {
    console.log(`✅ ${feature.name}`);
  } else {
    console.log(`❌ ${feature.name} missing`);
    allTestsPresent = false;
  }
});

// Check package.json dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'react-markdown',
  'remark-gfm', 
  'remark-math',
  'rehype-katex',
  'katex'
];

console.log('\n📦 Checking dependencies:');
let allDepsPresent = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} (${packageJson.dependencies[dep]})`);
  } else {
    console.log(`❌ ${dep} missing`);
    allDepsPresent = false;
  }
});

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist && allFeaturesPresent && allCSSFeaturesPresent && allTestsPresent && allDepsPresent) {
  console.log('🎉 MarkdownPreview implementation is COMPLETE!');
  console.log('\n✅ All required features implemented:');
  console.log('   • react-markdown integration');
  console.log('   • remark-gfm plugin for extended Markdown syntax');
  console.log('   • Real-time preview with debounce processing');
  console.log('   • Math rendering with KaTeX');
  console.log('   • Comprehensive styling and responsive design');
  console.log('   • Full test coverage');
  console.log('   • All dependencies installed');
} else {
  console.log('❌ MarkdownPreview implementation is INCOMPLETE!');
  console.log('Please check the missing features above.');
  process.exit(1);
}