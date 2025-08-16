// Test script to verify MarkdownPreview functionality
import { readFileSync } from 'fs';

console.log('🧪 Testing MarkdownPreview Implementation...\n');

// Test 1: Check component structure
try {
  const componentCode = readFileSync('src/components/MarkdownPreview.tsx', 'utf8');
  
  console.log('✅ Component file exists');
  
  // Check for required features
  const features = [
    { name: 'ReactMarkdown import', pattern: /import ReactMarkdown from ['"]react-markdown['"]/ },
    { name: 'remark-gfm import', pattern: /import remarkGfm from ['"]remark-gfm['"]/ },
    { name: 'remark-math import', pattern: /import remarkMath from ['"]remark-math['"]/ },
    { name: 'rehype-katex import', pattern: /import rehypeKatex from ['"]rehype-katex['"]/ },
    { name: 'Debounce implementation', pattern: /debounceMs.*setTimeout/ },
    { name: 'Math click handler', pattern: /handleMathClick.*onMathClick/ },
    { name: 'Custom components', pattern: /components:\s*Components/ },
    { name: 'Memoized options', pattern: /useMemo.*markdownOptions/ }
  ];
  
  let passedTests = 0;
  features.forEach(feature => {
    if (feature.pattern.test(componentCode)) {
      console.log(`✅ ${feature.name}`);
      passedTests++;
    } else {
      console.log(`❌ ${feature.name}`);
    }
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${features.length} features implemented`);
  
  if (passedTests === features.length) {
    console.log('🎉 All core features are implemented!');
  } else {
    console.log('⚠️  Some features may need attention');
  }
  
} catch (error) {
  console.error('❌ Error reading component:', error.message);
}

// Test 2: Check CSS styling
try {
  const cssCode = readFileSync('src/components/MarkdownPreview.css', 'utf8');
  
  console.log('\n🎨 CSS Features:');
  
  const cssFeatures = [
    { name: 'Responsive design', pattern: /@media.*max-width/ },
    { name: 'Dark mode support', pattern: /@media.*prefers-color-scheme.*dark/ },
    { name: 'Math styling', pattern: /\.katex/ },
    { name: 'Custom components styling', pattern: /\.preview-/ },
    { name: 'Accessibility features', pattern: /@media.*prefers-contrast/ }
  ];
  
  let cssPassedTests = 0;
  cssFeatures.forEach(feature => {
    if (feature.pattern.test(cssCode)) {
      console.log(`✅ ${feature.name}`);
      cssPassedTests++;
    } else {
      console.log(`❌ ${feature.name}`);
    }
  });
  
  console.log(`\n📊 CSS Results: ${cssPassedTests}/${cssFeatures.length} styling features implemented`);
  
} catch (error) {
  console.error('❌ Error reading CSS:', error.message);
}

console.log('\n✨ Test complete!');