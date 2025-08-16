import React, { useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { MarkdownPreview } from '../components/MarkdownPreview';
import './MathInputDemo.css';

export const MathInputDemo: React.FC = () => {
  const [content, setContent] = useState(`# Math Input Mode Demo

This demo showcases the math input functionality:

## Inline Math
You can insert inline math like $x^2 + y^2 = z^2$ using:
- Ctrl+M (or Cmd+M on Mac)
- The $x$ button in the toolbar
- Double-click existing math to edit

## Block Math
You can insert block math using Ctrl+Shift+M:

$$\\sum_{i=1}^{n} x_i = \\frac{n(n+1)}{2}$$

## Try it out!
1. Click in the editor below
2. Press Ctrl+M to insert inline math
3. Press Ctrl+Shift+M to insert block math
4. Double-click any existing math to edit it

Type some text here and try the math input features:

`);

  const [cursorPosition, setCursorPosition] = useState(0);

  return (
    <div className="math-input-demo">
      <h1>Math Input Mode Demo</h1>
      
      <div className="demo-info">
        <h2>How to use Math Input Mode:</h2>
        <ul>
          <li><strong>Ctrl+M</strong> (Cmd+M): Insert inline math</li>
          <li><strong>Ctrl+Shift+M</strong> (Cmd+Shift+M): Insert block math</li>
          <li><strong>Toolbar buttons</strong>: Click $x$ for inline or $$ for block math</li>
          <li><strong>Double-click</strong>: Edit existing math expressions</li>
          <li><strong>Enter</strong>: Complete math input</li>
          <li><strong>Escape</strong>: Cancel math input</li>
        </ul>
      </div>

      <div className="demo-container">
        <div className="editor-section">
          <h3>Editor (Cursor at position: {cursorPosition})</h3>
          <MarkdownEditor
            content={content}
            onChange={setContent}
            onCursorPositionChange={setCursorPosition}
            placeholder="Try the math input features here..."
          />
        </div>
        
        <div className="preview-section">
          <h3>Preview</h3>
          <MarkdownPreview content={content} />
        </div>
      </div>

      <div className="demo-examples">
        <h3>Example LaTeX expressions to try:</h3>
        <div className="examples-grid">
          <div className="example">
            <strong>Quadratic Formula:</strong>
            <code>{'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'}</code>
          </div>
          <div className="example">
            <strong>Integral:</strong>
            <code>{'\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'}</code>
          </div>
          <div className="example">
            <strong>Matrix:</strong>
            <code>{'\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'}</code>
          </div>
          <div className="example">
            <strong>Sum:</strong>
            <code>{'\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};