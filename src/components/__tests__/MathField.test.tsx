import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MathField, MathFieldProps, MathFieldRef } from '../MathField';
import { ErrorProvider } from '../../contexts/ErrorContext';
import React from 'react';

// Mock MathLive utilities
vi.mock('../../utils/mathLiveUtils', () => ({
  initializeMathLive: vi.fn().mockResolvedValue(true),
  validateLatex: vi.fn().mockReturnValue({ isValid: true }),
  isMathLiveLoaded: vi.fn().mockReturnValue(true)
}));

// Mock touch device hook
vi.mock('../../hooks/useTouchDevice', () => ({
  useTouchDevice: vi.fn().mockReturnValue({
    deviceInfo: {
      isTouch: false,
      isMobile: false,
      hasPhysicalKeyboard: true
    }
  })
}));

// Mock MathfieldElement
class MockMathfieldElement extends HTMLElement {
  value = '';
  virtualKeyboardMode = 'manual';
  smartMode = true;
  readOnly = false;
  virtualKeyboardPolicy = 'auto';
  virtualKeyboardTheme = 'material';
  keypressVibration = false;
  inlineShortcuts = {};

  focus() {
    this.dispatchEvent(new Event('focus'));
  }

  blur() {
    this.dispatchEvent(new Event('blur'));
  }

  insert(latex: string) {
    this.value += latex;
    this.dispatchEvent(new Event('input'));
  }
}

// Register the mock element
customElements.define('math-field', MockMathfieldElement);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    {children}
  </ErrorProvider>
);

describe('MathField', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnFocus: ReturnType<typeof vi.fn>;
  let mockOnBlur: ReturnType<typeof vi.fn>;
  let mockOnComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnFocus = vi.fn();
    mockOnBlur = vi.fn();
    mockOnComplete = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps: MathFieldProps = {
    value: '',
    onChange: mockOnChange,
    onFocus: mockOnFocus,
    onBlur: mockOnBlur,
    onComplete: mockOnComplete
  };

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Loading MathLive...')).toBeInTheDocument();
  });

  it('renders math field after initialization', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(document.querySelector('math-field')).toBeInTheDocument();
    });
  });

  it('sets initial value correctly', async () => {
    const initialValue = 'x^2 + y^2';
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} value={initialValue} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.value).toBe(initialValue);
    });
  });

  it('calls onChange when value changes', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      if (mathField) {
        mathField.value = 'x^2';
        mathField.dispatchEvent(new Event('input'));
      }
    });

    expect(mockOnChange).toHaveBeenCalledWith('x^2');
  });

  it('calls onFocus when focused', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      if (mathField) {
        mathField.focus();
      }
    });

    expect(mockOnFocus).toHaveBeenCalled();
  });

  it('calls onBlur when blurred', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      if (mathField) {
        mathField.blur();
      }
    });

    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('calls onComplete when Enter is pressed', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      if (mathField) {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        mathField.dispatchEvent(enterEvent);
      }
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('configures virtual keyboard mode correctly', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} virtualKeyboardMode="onfocus" />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.virtualKeyboardMode).toBe('onfocus');
    });
  });

  it('configures smart mode correctly', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} smartMode={false} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.smartMode).toBe(false);
    });
  });

  it('configures read-only mode correctly', async () => {
    render(
      <TestWrapper>
        <MathField {...defaultProps} readOnly={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.readOnly).toBe(true);
    });
  });

  it('exposes ref methods correctly', async () => {
    const ref = React.createRef<MathFieldRef>();
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} ref={ref} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.getValue).toBe('function');
      expect(typeof ref.current?.setValue).toBe('function');
      expect(typeof ref.current?.focus).toBe('function');
      expect(typeof ref.current?.blur).toBe('function');
      expect(typeof ref.current?.insert).toBe('function');
      expect(typeof ref.current?.clear).toBe('function');
    });
  });

  it('handles setValue through ref', async () => {
    const ref = React.createRef<MathFieldRef>();
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} ref={ref} />
      </TestWrapper>
    );

    await waitFor(() => {
      ref.current?.setValue('y^3');
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.value).toBe('y^3');
    });
  });

  it('handles getValue through ref', async () => {
    const ref = React.createRef<MathFieldRef>();
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} value="z^4" ref={ref} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(ref.current?.getValue()).toBe('z^4');
    });
  });

  it('handles insert through ref', async () => {
    const ref = React.createRef<MathFieldRef>();
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} ref={ref} />
      </TestWrapper>
    );

    await waitFor(() => {
      ref.current?.insert('\\alpha');
      expect(mockOnChange).toHaveBeenCalledWith('\\alpha');
    });
  });

  it('handles clear through ref', async () => {
    const ref = React.createRef<MathFieldRef>();
    
    render(
      <TestWrapper>
        <MathField {...defaultProps} value="x^2" ref={ref} />
      </TestWrapper>
    );

    await waitFor(() => {
      ref.current?.clear();
      const mathField = document.querySelector('math-field') as MockMathfieldElement;
      expect(mathField?.value).toBe('');
    });
  });
});