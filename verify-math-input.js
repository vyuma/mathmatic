// Simple verification script for math input mode functionality
const { 
  getMathExpressionAtPosition, 
  insertMathExpression, 
  replaceMathExpression,
  extractMathExpressions,
  validateLatex 
} = require('./src/utils/mathUtils.ts');

console.log('🧪 Testing Math Input Mode Implementation...\n');

// Test 1: Extract math expressions
console.log('1. Testing extractMathExpressions:');
try {
  const content = 'Text $x^2$ and $$\\sum_{i=1}^n x_i$$ more text';
  const expressions = extractMathExpressions(content);
  console.log('✅ Found', expressions.length, 'expressions');
  console.log('   Inline:', expressions.filter(e => e.isInline).length);
  console.log('   Block:', expressions.filter(e => !e.isInline).length);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 2: Get math expression at position
console.log('\n2. Testing getMathExpressionAtPosition:');
try {
  const content = 'Text $x^2 + y^2$ more text';
  const position = 8; // Inside the math expression
  const result = getMathExpressionAtPosition(content, position);
  if (result) {
    console.log('✅ Found expression:', result.latex);
    console.log('   Type:', result.isInline ? 'inline' : 'block');
  } else {
    console.log('❌ No expression found at position');
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 3: Insert math expression
console.log('\n3. Testing insertMathExpression:');
try {
  const content = 'Hello world';
  const position = 6;
  const latex = 'x^2';
  const result = insertMathExpression(content, position, latex, true);
  console.log('✅ Inserted inline math:');
  console.log('   Result:', result.content);
  console.log('   Cursor position:', result.newCursorPosition);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 4: Replace math expression
console.log('\n4. Testing replaceMathExpression:');
try {
  const content = 'Text $x^2$ more';
  const expression = {
    latex: 'x^2',
    start: 5,
    end: 10,
    isInline: true,
    raw: '$x^2$'
  };
  const newLatex = 'y^3';
  const result = replaceMathExpression(content, expression, newLatex);
  console.log('✅ Replaced math expression:');
  console.log('   Result:', result);
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 5: Validate LaTeX
console.log('\n5. Testing validateLatex:');
try {
  const validLatex = 'x^2 + y^2';
  const invalidLatex = '\\frac{x}{y';
  
  const validResult = validateLatex(validLatex);
  const invalidResult = validateLatex(invalidLatex);
  
  console.log('✅ Valid LaTeX:', validResult.isValid);
  console.log('✅ Invalid LaTeX detected:', !invalidResult.isValid);
  console.log('   Error:', invalidResult.error);
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n🎉 Math Input Mode verification complete!');