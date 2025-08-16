import React, { useState } from 'react';
import { MathEditor } from '../components/MathEditor';

export const MathFieldDemo: React.FC = () => {
  const [mathValue, setMathValue] = useState('x^2 + y^2 = r^2');
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const handleMathChange = (latex: string) => {
    setMathValue(latex);
  };

  const handleComplete = () => {
    setHistory(prev => [...prev, mathValue]);
    setIsEditorVisible(false);
    console.log('Math expression completed:', mathValue);
  };

  const handleCancel = () => {
    setIsEditorVisible(false);
    console.log('Math expression cancelled');
  };

  const showEditor = () => {
    setIsEditorVisible(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MathField Component Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Current Math Expression:</h2>
        <div style={{ 
          padding: '1rem', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          fontFamily: 'monospace',
          minHeight: '2rem'
        }}>
          {mathValue || '(empty)'}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={showEditor}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isEditorVisible ? 'Hide' : 'Show'} Math Editor
        </button>
      </div>

      {isEditorVisible && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Math Editor:</h2>
          <MathEditor
            value={mathValue}
            onChange={handleMathChange}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isVisible={isEditorVisible}
          />
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2>Expression History:</h2>
          <ul>
            {history.map((expr, index) => (
              <li key={index} style={{ fontFamily: 'monospace', margin: '0.5rem 0' }}>
                {expr}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Click "Show Math Editor" to display the MathLive editor</li>
          <li>Type mathematical expressions using LaTeX syntax</li>
          <li>Use shortcuts like "frac" for fractions, "sqrt" for square roots</li>
          <li>Press Enter or click ✓ to complete the expression</li>
          <li>Press Escape or click ✕ to cancel</li>
        </ul>
      </div>
    </div>
  );
};