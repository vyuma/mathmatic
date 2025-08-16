import { describe, it, expect } from 'vitest';
import { 
  getMathExpressionAtPosition, 
  insertMathExpression, 
  replaceMathExpression,
  extractMathExpressions,
  validateLatex 
} from '../utils/mathUtils';

describe('Math Utilities', () => {
  describe('extractMathExpressions', () => {
    it('should extract inline math expressions', () => {
      const content = 'Text $x^2$ and $y^3$ more text';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(2);
      expect(expressions[0]).toEqual({
        latex: 'x^2',
        start: 5,
        end: 10,
        isInline: true,
        raw: '$x^2$'
      });
      expect(expressions[1]).toEqual({
        latex: 'y^3',
        start: 15,
        end: 20,
        isInline: true,
        raw: '$y^3$'
      });
    });

    it('should extract block math expressions', () => {
      const content = 'Text $$\\sum_{i=1}^n x_i$$ more';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toEqual({
        latex: '\\sum_{i=1}^n x_i',
        start: 5,
        end: 25,
        isInline: false,
        raw: '$$\\sum_{i=1}^n x_i$$'
      });
    });

    it('should prioritize block math over inline math', () => {
      const content = 'Text $$x^2 + $y$ = z^2$$ more';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0].isInline).toBe(false);
      expect(expressions[0].latex).toBe('x^2 + $y$ = z^2');
    });
  });

  describe('getMathExpressionAtPosition', () => {
    it('should detect inline math expression at cursor position', () => {
      const content = 'Text $x^2 + y^2$ more text';
      const position = 8; // Inside the math expression
      
      const result = getMathExpressionAtPosition(content, position);
      
      expect(result).toEqual({
        latex: 'x^2 + y^2',
        start: 5,
        end: 16,
        isInline: true,
        raw: '$x^2 + y^2$'
      });
    });

    it('should return null when cursor is not in math expression', () => {
      const content = 'Text $x^2$ more text';
      const position = 0; // Before math expression
      
      const result = getMathExpressionAtPosition(content, position);
      
      expect(result).toBeNull();
    });
  });

  describe('insertMathExpression', () => {
    it('should insert inline math expression', () => {
      const content = 'Hello world';
      const position = 6; // After "Hello "
      const latex = 'x^2';
      
      const result = insertMathExpression(content, position, latex, true);
      
      expect(result.content).toBe('Hello $x^2$world');
      expect(result.newCursorPosition).toBe(11); // After the inserted math
    });

    it('should insert block math expression', () => {
      const content = 'Hello world';
      const position = 6; // After "Hello "
      const latex = '\\sum x_i';
      
      const result = insertMathExpression(content, position, latex, false);
      
      expect(result.content).toBe('Hello \n$$\n\\sum x_i\n$$\nworld');
      expect(result.newCursorPosition).toBe(23); // After the inserted math block
    });
  });

  describe('replaceMathExpression', () => {
    it('should replace inline math expression', () => {
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
      
      expect(result).toBe('Text $y^3$ more');
    });

    it('should replace block math expression', () => {
      const content = 'Text $$x^2$$ more';
      const expression = {
        latex: 'x^2',
        start: 5,
        end: 12,
        isInline: false,
        raw: '$$x^2$$'
      };
      const newLatex = '\\sum y_i';
      
      const result = replaceMathExpression(content, expression, newLatex);
      
      expect(result).toBe('Text $$\n\\sum y_i\n$$ more');
    });
  });

  describe('validateLatex', () => {
    it('should validate correct LaTeX', () => {
      const result = validateLatex('x^2 + y^2');
      expect(result.isValid).toBe(true);
    });

    it('should detect empty expressions', () => {
      const result = validateLatex('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty expression');
    });

    it('should detect unmatched braces', () => {
      const result = validateLatex('\\frac{x}{y');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unmatched opening brace');
    });

    it('should detect unmatched closing braces', () => {
      const result = validateLatex('x}^2');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unmatched closing brace');
    });
  });
});