import { describe, it, expect } from 'vitest';
import {
  extractMathExpressions,
  getMathExpressionAtPosition,
  replaceMathExpression,
  insertMathExpression,
  validateLatex,
  getMathShortcuts,
  type MathExpression,
} from '../mathUtils';

describe('mathUtils', () => {
  describe('extractMathExpressions', () => {
    it('extracts inline math expressions', () => {
      const content = 'This is $\\alpha$ and $\\beta$ math.';
      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(2);
      expect(expressions[0]).toEqual({
        latex: '\\alpha',
        start: 8,
        end: 16,
        isInline: true,
        raw: '$\\alpha$',
      });
      expect(expressions[1]).toEqual({
        latex: '\\beta',
        start: 21,
        end: 28,
        isInline: true,
        raw: '$\\beta$',
      });
    });

    it('extracts block math expressions', () => {
      const content = 'Here is block math:\n$$\\frac{a}{b}$$\nEnd.';
      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toEqual({
        latex: '\\frac{a}{b}',
        start: 20,
        end: 34,
        isInline: false,
        raw: '$$\\frac{a}{b}$$',
      });
    });

    it('handles mixed inline and block math', () => {
      const content = 'Inline $x$ and block $$y = mx + b$$ math.';
      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(2);
      expect(expressions[0].isInline).toBe(true);
      expect(expressions[0].latex).toBe('x');
      expect(expressions[1].isInline).toBe(false);
      expect(expressions[1].latex).toBe('y = mx + b');
    });

    it('prioritizes block math over inline when overlapping', () => {
      const content = 'Test $$\\alpha + $\\beta$ + \\gamma$$ end.';
      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(1);
      expect(expressions[0].isInline).toBe(false);
      expect(expressions[0].latex).toBe('\\alpha + $\\beta$ + \\gamma');
    });

    it('handles empty content', () => {
      const expressions = extractMathExpressions('');
      expect(expressions).toHaveLength(0);
    });

    it('handles content with no math', () => {
      const content = 'This is just regular text with no math expressions.';
      const expressions = extractMathExpressions(content);
      expect(expressions).toHaveLength(0);
    });

    it('handles malformed math expressions gracefully', () => {
      const content = 'This has $incomplete math and $$also incomplete';
      const expressions = extractMathExpressions(content);
      expect(expressions).toHaveLength(0);
    });

    it('sorts expressions by position', () => {
      const content = 'Second $$block$$ first $inline$ third $another$.';
      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(3);
      expect(expressions[0].start).toBeLessThan(expressions[1].start);
      expect(expressions[1].start).toBeLessThan(expressions[2].start);
    });
  });

  describe('getMathExpressionAtPosition', () => {
    const content = 'Start $\\alpha$ middle $$\\beta$$ end $\\gamma$.';

    it('returns expression when position is inside inline math', () => {
      const expression = getMathExpressionAtPosition(content, 10); // Inside $\alpha$
      expect(expression).not.toBeNull();
      expect(expression!.latex).toBe('\\alpha');
      expect(expression!.isInline).toBe(true);
    });

    it('returns expression when position is inside block math', () => {
      const expression = getMathExpressionAtPosition(content, 25); // Inside $$\beta$$
      expect(expression).not.toBeNull();
      expect(expression!.latex).toBe('\\beta');
      expect(expression!.isInline).toBe(false);
    });

    it('returns null when position is outside math expressions', () => {
      const expression = getMathExpressionAtPosition(content, 0); // At start
      expect(expression).toBeNull();
    });

    it('returns expression when position is at math boundary', () => {
      const expressions = extractMathExpressions(content);
      const firstExpr = expressions[0];
      
      const atStart = getMathExpressionAtPosition(content, firstExpr.start);
      const atEnd = getMathExpressionAtPosition(content, firstExpr.end);
      
      expect(atStart).not.toBeNull();
      expect(atEnd).not.toBeNull();
    });
  });

  describe('replaceMathExpression', () => {
    it('replaces inline math expression', () => {
      const content = 'This is $\\alpha$ math.';
      const expressions = extractMathExpressions(content);
      const newContent = replaceMathExpression(content, expressions[0], '\\beta');

      expect(newContent).toBe('This is $\\beta$ math.');
    });

    it('replaces block math expression', () => {
      const content = 'Block: $$\\alpha$$ end.';
      const expressions = extractMathExpressions(content);
      const newContent = replaceMathExpression(content, expressions[0], '\\beta');

      expect(newContent).toBe('Block: $$\n\\beta\n$$ end.');
    });

    it('handles multiple replacements correctly', () => {
      const content = 'First $\\alpha$ and second $\\beta$.';
      const expressions = extractMathExpressions(content);
      
      let newContent = replaceMathExpression(content, expressions[1], '\\gamma');
      expect(newContent).toBe('First $\\alpha$ and second $\\gamma$.');
      
      // Note: After first replacement, need to re-extract expressions
      const newExpressions = extractMathExpressions(newContent);
      newContent = replaceMathExpression(newContent, newExpressions[0], '\\delta');
      expect(newContent).toBe('First $\\delta$ and second $\\gamma$.');
    });
  });

  describe('insertMathExpression', () => {
    it('inserts inline math at position', () => {
      const content = 'Hello world';
      const result = insertMathExpression(content, 6, '\\alpha', true);

      expect(result.content).toBe('Hello $\\alpha$world');
      expect(result.newCursorPosition).toBe(14);
    });

    it('inserts block math at position', () => {
      const content = 'Hello world';
      const result = insertMathExpression(content, 6, '\\alpha', false);

      expect(result.content).toBe('Hello \n$$\n\\alpha\n$$\nworld');
      expect(result.newCursorPosition).toBe(21);
    });

    it('inserts at beginning of content', () => {
      const content = 'world';
      const result = insertMathExpression(content, 0, '\\alpha', true);

      expect(result.content).toBe('$\\alpha$world');
    });

    it('inserts at end of content', () => {
      const content = 'Hello';
      const result = insertMathExpression(content, 5, '\\alpha', true);

      expect(result.content).toBe('Hello$\\alpha$');
    });
  });

  describe('validateLatex', () => {
    it('validates correct LaTeX expressions', () => {
      const validExpressions = [
        '\\alpha',
        '\\frac{a}{b}',
        '\\sum_{i=1}^{n} x_i',
        'x^2 + y^2 = z^2',
        '\\int_0^1 f(x) dx',
      ];

      validExpressions.forEach(expr => {
        const result = validateLatex(expr);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('rejects empty expressions', () => {
      const result = validateLatex('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty expression');
    });

    it('rejects expressions with unmatched braces', () => {
      const invalidExpressions = [
        '\\frac{a}{b',
        '\\frac{a}b}',
        '{{{',
        '}}}',
        '\\sum_{i=1^{n} x_i',
      ];

      invalidExpressions.forEach(expr => {
        const result = validateLatex(expr);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('brace');
      });
    });

    it('rejects expressions with nested dollar signs', () => {
      const result = validateLatex('\\alpha $\\beta$ \\gamma');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid LaTeX syntax');
    });

    it('handles whitespace-only expressions', () => {
      const result = validateLatex('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty expression');
    });
  });

  describe('getMathShortcuts', () => {
    it('returns comprehensive shortcuts object', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts).toBeInstanceOf(Object);
      expect(Object.keys(shortcuts).length).toBeGreaterThan(50);
    });

    it('includes Greek letters', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.alpha).toBe('\\alpha');
      expect(shortcuts.beta).toBe('\\beta');
      expect(shortcuts.gamma).toBe('\\gamma');
      expect(shortcuts.omega).toBe('\\omega');
    });

    it('includes math operators', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.sum).toBe('\\sum');
      expect(shortcuts.int).toBe('\\int');
      expect(shortcuts.lim).toBe('\\lim');
      expect(shortcuts.inf).toBe('\\infty');
    });

    it('includes functions with placeholders', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.frac).toBe('\\frac{#@}{#?}');
      expect(shortcuts.sqrt).toBe('\\sqrt{#@}');
      expect(shortcuts.cbrt).toBe('\\sqrt[3]{#@}');
    });

    it('includes arrows and relations', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.to).toBe('\\to');
      expect(shortcuts.leq).toBe('\\leq');
      expect(shortcuts.geq).toBe('\\geq');
      expect(shortcuts.neq).toBe('\\neq');
    });

    it('includes set operations', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.cup).toBe('\\cup');
      expect(shortcuts.cap).toBe('\\cap');
      expect(shortcuts.emptyset).toBe('\\emptyset');
      expect(shortcuts.in).toBe('\\in');
    });

    it('includes logical operators', () => {
      const shortcuts = getMathShortcuts();
      
      expect(shortcuts.land).toBe('\\land');
      expect(shortcuts.lor).toBe('\\lor');
      expect(shortcuts.forall).toBe('\\forall');
      expect(shortcuts.exists).toBe('\\exists');
    });
  });

  describe('edge cases and error handling', () => {
    it('handles very long content efficiently', () => {
      const longContent = 'a'.repeat(10000) + '$\\alpha$' + 'b'.repeat(10000);
      const expressions = extractMathExpressions(longContent);
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0].latex).toBe('\\alpha');
    });

    it('handles content with many math expressions', () => {
      const manyMathContent = Array.from({ length: 100 }, (_, i) => `$x_{${i}}$`).join(' ');
      const expressions = extractMathExpressions(manyMathContent);
      
      expect(expressions).toHaveLength(100);
      expressions.forEach((expr, i) => {
        expect(expr.latex).toBe(`x_{${i}}`);
        expect(expr.isInline).toBe(true);
      });
    });

    it('handles unicode characters in math expressions', () => {
      const content = 'Math with unicode: $α + β = γ$ and $∑_{i=1}^{n} x_i$.';
      const expressions = extractMathExpressions(content);
      
      expect(expressions).toHaveLength(2);
      expect(expressions[0].latex).toBe('α + β = γ');
      expect(expressions[1].latex).toBe('∑_{i=1}^{n} x_i');
    });

    it('handles newlines in block math', () => {
      const content = `Block math:
$$
\\begin{align}
x &= a + b \\\\
y &= c + d
\\end{align}
$$
End.`;
      
      const expressions = extractMathExpressions(content);
      expect(expressions).toHaveLength(1);
      expect(expressions[0].isInline).toBe(false);
      expect(expressions[0].latex).toContain('\\begin{align}');
    });
  });
});