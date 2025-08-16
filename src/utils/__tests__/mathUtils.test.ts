import {
  extractMathExpressions,
  getMathExpressionAtPosition,
  replaceMathExpression,
  insertMathExpression,
  validateLatex,
  getMathShortcuts
} from '../mathUtils';

describe('mathUtils', () => {
  describe('extractMathExpressions', () => {
    it('extracts inline math expressions', () => {
      const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toEqual({
        latex: 'x^2 + y^2 = r^2',
        start: 12,
        end: 30,
        isInline: true,
        raw: '$x^2 + y^2 = r^2$'
      });
    });

    it('extracts block math expressions', () => {
      const content = 'Here is a formula:\n$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$\nEnd.';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toEqual({
        latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        start: 19,
        end: 66,
        isInline: false,
        raw: '$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$'
      });
    });

    it('extracts multiple math expressions', () => {
      const content = 'Inline $a + b$ and block $$c + d$$ math.';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(2);
      expect(expressions[0].latex).toBe('a + b');
      expect(expressions[0].isInline).toBe(true);
      expect(expressions[1].latex).toBe('c + d');
      expect(expressions[1].isInline).toBe(false);
    });

    it('handles empty content', () => {
      const expressions = extractMathExpressions('');
      expect(expressions).toHaveLength(0);
    });
  });

  describe('getMathExpressionAtPosition', () => {
    it('finds math expression at cursor position', () => {
      const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
      const expression = getMathExpressionAtPosition(content, 20);
      
      expect(expression).not.toBeNull();
      expect(expression?.latex).toBe('x^2 + y^2 = r^2');
    });

    it('returns null when cursor is not in math expression', () => {
      const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
      const expression = getMathExpressionAtPosition(content, 5);
      
      expect(expression).toBeNull();
    });
  });

  describe('replaceMathExpression', () => {
    it('replaces inline math expression', () => {
      const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
      const expressions = extractMathExpressions(content);
      const newContent = replaceMathExpression(content, expressions[0], 'a^2 + b^2 = c^2');
      
      expect(newContent).toBe('The formula $a^2 + b^2 = c^2$ is well known.');
    });

    it('replaces block math expression', () => {
      const content = 'Formula:\n$$x + y$$\nEnd.';
      const expressions = extractMathExpressions(content);
      const newContent = replaceMathExpression(content, expressions[0], 'a + b');
      
      expect(newContent).toBe('Formula:\n$$\na + b\n$$\nEnd.');
    });
  });

  describe('insertMathExpression', () => {
    it('inserts inline math expression', () => {
      const content = 'Hello world';
      const result = insertMathExpression(content, 5, 'x^2', true);
      
      expect(result.content).toBe('Hello$x^2$ world');
      expect(result.newCursorPosition).toBe(11);
    });

    it('inserts block math expression', () => {
      const content = 'Hello world';
      const result = insertMathExpression(content, 5, 'x^2', false);
      
      expect(result.content).toBe('Hello\n$$\nx^2\n$$\n world');
      expect(result.newCursorPosition).toBe(19);
    });
  });

  describe('validateLatex', () => {
    it('validates correct LaTeX', () => {
      const result = validateLatex('x^2 + y^2 = r^2');
      expect(result.isValid).toBe(true);
    });

    it('detects empty expression', () => {
      const result = validateLatex('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty expression');
    });

    it('detects unmatched braces', () => {
      const result = validateLatex('\\frac{a}{b');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unmatched opening brace');
    });
  });

  describe('getMathShortcuts', () => {
    it('returns math shortcuts object', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts).toHaveProperty('alpha', '\\alpha');
      expect(shortcuts).toHaveProperty('sum', '\\sum');
      expect(shortcuts).toHaveProperty('frac', '\\frac{#@}{#?}');
      expect(shortcuts).toHaveProperty('sqrt', '\\sqrt{#@}');
    });

    it('contains expected number of shortcuts', () => {
      const shortcuts = getMathShortcuts();
      const shortcutCount = Object.keys(shortcuts).length;
      
      // Should have a reasonable number of shortcuts (at least 50)
      expect(shortcutCount).toBeGreaterThan(50);
    });
  });
});