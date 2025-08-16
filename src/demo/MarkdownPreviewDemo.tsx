import React, { useState } from 'react';
import { MarkdownPreview } from '../components/MarkdownPreview';

const sampleContent = `# Markdown Preview Demo

## Features Demonstration

### Text Formatting
This is **bold text** and *italic text*.

### Code Examples
Inline code: \`console.log('Hello World')\`

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### Lists
- Item 1
- Item 2
  - Nested item
- Item 3

1. First numbered item
2. Second numbered item
3. Third numbered item

### Math Examples (KaTeX)
Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### Tables
| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Full support |
| Math | ✅ | KaTeX rendering |
| GFM | ✅ | GitHub flavored |
| Debounce | ✅ | Real-time updates |

### Links and Images
[GitHub](https://github.com)

### Blockquotes
> This is a blockquote with **bold** text and *italic* text.
> 
> It can span multiple lines.

### Horizontal Rule
---

### Strikethrough (GFM)
~~This text is crossed out~~

### Task Lists (GFM)
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

### Advanced Math
Matrix example:
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

Summation: $\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$
`;

export const MarkdownPreviewDemo: React.FC = () => {
  const [content, setContent] = useState(sampleContent);
  const [debounceMs, setDebounceMs] = useState(300);

  const handleMathClick = (latex: string, position: DOMRect) => {
    console.log('Math clicked:', latex, position);
    alert(`Math expression clicked: ${latex}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Markdown Preview Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Debounce (ms): 
          <input 
            type="number" 
            value={debounceMs} 
            onChange={(e) => setDebounceMs(Number(e.target.value))}
            style={{ marginLeft: '10px', width: '80px' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: '80vh' }}>
        <div style={{ flex: 1 }}>
          <h3>Editor</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              height: '90%',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Preview</h3>
          <div style={{ height: '90%', border: '1px solid #ccc', borderRadius: '4px' }}>
            <MarkdownPreview 
              content={content}
              debounceMs={debounceMs}
              onMathClick={handleMathClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};