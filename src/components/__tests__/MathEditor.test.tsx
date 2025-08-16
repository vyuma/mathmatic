import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MathEditor } from '../MathEditor';
import { vi } from 'vitest';

// Mock the MathField component
vi.mock('../MathField', () => ({
  MathField: React.forwardRef<any, any>(({ onChange, onFocus, onBlur, onComplete, value }, ref) => (
    <div
      data-testid="math-field"
      data-value={value}
      onClick={() => {
        onFocus?.();
        onChange?.('\\alpha');
      }}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onComplete?.();
        }
      }}
    />
  )),
}));

// Mock the useMathField hook
const mockUseMathField = {
  mathFieldRef: { current: null },
  value: '',
  setValue: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
  isActive: false,
  setIsActive: vi.fn(),
};

vi.mock('../../hooks/useMathField', () => ({
  useMathField: vi.fn(() => mockUseMathField),
}));

describe('MathEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMathField.value = '';
    mockUseMathField.isActive = false;
  });

  it('renders when visible', () => {
    render(<MathEditor isVisible={true} />);
    expect(screen.getByTestId('math-field')).toBeInTheDocument();
    expect(screen.getByTitle('Complete (Enter)')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel (Escape)')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<MathEditor isVisible={false} />);
    expect(screen.queryByTestId('math-field')).not.toBeInTheDocument();
  });

  it('calls onChange when math field value changes', () => {
    const onChange = vi.fn();
    render(<MathEditor onChange={onChange} isVisible={true} />);
    
    fireEvent.click(screen.getByTestId('math-field'));
    
    expect(mockUseMathField.setValue).toHaveBeenCalledWith('\\alpha');
    expect(onChange).toHaveBeenCalledWith('\\alpha');
  });

  it('calls onComplete when complete button is clicked', () => {
    const onComplete = vi.fn();
    render(<MathEditor onComplete={onComplete} isVisible={true} />);
    
    fireEvent.click(screen.getByTitle('Complete (Enter)'));
    
    expect(onComplete).toHaveBeenCalled();
    expect(mockUseMathField.blur).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<MathEditor onCancel={onCancel} isVisible={true} />);
    
    fireEvent.click(screen.getByTitle('Cancel (Escape)'));
    
    expect(onCancel).toHaveBeenCalled();
    expect(mockUseMathField.blur).toHaveBeenCalled();
  });

  it('focuses when becomes visible', async () => {
    const { rerender } = render(<MathEditor isVisible={false} />);
    
    rerender(<MathEditor isVisible={true} />);
    
    await waitFor(() => {
      expect(mockUseMathField.focus).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('updates internal value when prop changes', () => {
    const { rerender } = render(<MathEditor value="\\alpha" isVisible={true} />);
    
    rerender(<MathEditor value="\\beta" isVisible={true} />);
    
    expect(mockUseMathField.setValue).toHaveBeenCalledWith('\\beta');
  });

  it('applies active class when math field is active', () => {
    mockUseMathField.isActive = true;
    
    render(<MathEditor isVisible={true} />);
    
    const mathEditor = screen.getByTestId('math-field').closest('.math-editor');
    expect(mathEditor).toHaveClass('active');
  });

  it('handles focus and blur events correctly', () => {
    render(<MathEditor isVisible={true} />);
    
    // Simulate focus
    fireEvent.click(screen.getByTestId('math-field'));
    expect(mockUseMathField.setIsActive).toHaveBeenCalledWith(true);
    
    // Simulate blur
    fireEvent.blur(screen.getByTestId('math-field'));
    expect(mockUseMathField.setIsActive).toHaveBeenCalledWith(false);
  });

  it('applies custom className and style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(
      <MathEditor 
        isVisible={true} 
        className="custom-class" 
        style={customStyle}
      />
    );
    
    const mathEditor = screen.getByTestId('math-field').closest('.math-editor');
    expect(mathEditor).toHaveClass('custom-class');
    expect(mathEditor).toHaveStyle('background-color: red');
  });
});