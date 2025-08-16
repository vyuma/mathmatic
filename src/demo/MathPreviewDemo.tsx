import React, { useState } from 'react';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { MathEditor } from '../components/MathEditor';

const sampleContent = `# Math Preview and Editing Demo

This demo showcases the math preview and editing functionality.

## Inline Math Examples

Here are some inline math expressions you can click to edit:

- The Pythagorean theorem: $a^2 + b^2 = c^2$
- Euler's identity: $e^{i\\pi} + 1 = 0$
- The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
- A simple fraction: $\\frac{1}{2}$
- Greek letters: $\\alpha + \\beta = \\gamma$

## Block Math Examples

Click on these block math expressions to edit them:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

$$
\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1
$$

## Matrix Example

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$

## Instructions

1. **Click any math expression** to edit it with the MathLive editor
2. **Use keyboard shortcuts** like "frac" for fractions, "sqrt" for square roots
3. **Press Enter or click ✓** to save your changes
4. **Press Escape or click ✕** to cancel editing

Try clicking on the math expressions above to see the editing functionality in action!
`;

export const MathPreviewDemo: React.FC = () => {
  const [content, setContent] = useState(sampleContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMath, setEditingMath] = useState({
    latex: '',
    position: { x: 0, y: 0 },
    isInline: true,
  });

  const handleMathClick = (latex: string, position: DOMRect, isInline: boolean) => {
    setEditingMath({
      latex,
      position: { x: position.left, y: position.top + position.height + 8 },
      isInline,
    });
    setIsEditing(true);
  };

  const handleMathComplete = (newLatex: string) => {
    // For demo purposes, just show an alert with the new LaTeX
    alert(`Math expression updated to: ${newLatex}`);
    setIsEditing(false);
  };

  const handleMathCancel = () => {
    setIsEditing(false);
  };

  const handleMathChange = (latex: string) => {
    setEditingMath(prev => ({ ...prev, latex }));
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      position: 'relative'
    }}>
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h1>Math Preview and Editing Demo</h1>
        <p>
          This demo shows the integrated math preview and editing functionality. 
          Click on any math expression in the preview below to edit it with MathLive.
        </p>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        <MarkdownPreview 
          content={content} 
          onMathClick={handleMathClick}
        />
      </div>

      {/* Math Editor Overlay */}
      {isEditing && (
        <div 
          style={{
            position: 'fixed',
            left: editingMath.position.x,
            top: editingMath.position.y,
            zIndex: 1000,
            maxWidth: '400px',
            minWidth: '300px',
            backgroundColor: '#ffffff',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            padding: '8px'
          }}
        >
          <MathEditor
            value={editingMath.latex}
            onChange={handleMathChange}
            onComplete={() => handleMathComplete(editingMath.latex)}
            onCancel={handleMathCancel}
            isVisible={true}
          />
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <h2>Features Demonstrated</h2>
        <ul>
          <li>✅ remark-math and rehype-katex plugin integration</li>
          <li>✅ Inline math ($...$) and block math ($$...$$) support</li>
          <li>✅ Click-to-edit functionality for math expressions</li>
          <li>✅ Visual hover effects on math expressions</li>
          <li>✅ MathLive editor integration</li>
          <li>✅ Responsive design with mobile support</li>
          <li>✅ Dark mode support</li>
        </ul>
        
        <h3>Current Math Expression Being Edited:</h3>
        <div style={{ 
          fontFamily: 'monospace', 
          backgroundColor: '#ffffff',
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          {isEditing ? editingMath.latex || '(empty)' : '(none)'}
        </div>
      </div>
    </div>
  );
};