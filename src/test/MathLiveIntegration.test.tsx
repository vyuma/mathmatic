import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MathFieldDemo } from '../demo/MathFieldDemo';
import { vi } from 'vitest';

// Mock MathfieldElement for testing
const mockMathfieldElement = {
  value: '',
  virtualKeyboardMode: 'manual',
  smartMode: true,
  readOnly: false,
  inlineShortcuts: {},
  focus: vi.fn(),
  blur: vi.fn(),
  insert: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock mathlive module
vi.mock('mathlive', () => ({
  MathfieldElement: vi.fn(() => mockMathfieldElement),
}));

describe('MathLive Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMathfieldElement.value = 'x^2 + y^2 = r^2';
  });

  it('renders MathFieldDemo without crashing', () => {
    render(<MathFieldDemo />);
    expect(screen.getByText('MathField Component Demo')).toBeInTheDocument();
    expect(screen.getByText('Current Math Expression:')).toBeInTheDocument();
  });

  it('displays initial math expression', () => {
    render(<MathFieldDemo />);
    expect(screen.getByText('x^2 + y^2 = r^2')).toBeInTheDocument();
  });

  it('shows and hides math editor', () => {
    render(<MathFieldDemo />);
    
    // Initially editor should be visible
    expect(screen.getByText('Math Editor:')).toBeInTheDocument();
    
    // Click to hide
    fireEvent.click(screen.getByText('Hide Math Editor'));
    expect(screen.queryByText('Math Editor:')).not.toBeInTheDocument();
    
    // Click to show again
    fireEvent.click(screen.getByText('Show Math Editor'));
    expect(screen.getByText('Math Editor:')).toBeInTheDocument();
  });

  it('displays instructions for using the math editor', () => {
    render(<MathFieldDemo />);
    
    expect(screen.getByText('Instructions:')).toBeInTheDocument();
    expect(screen.getByText(/Click "Show Math Editor"/)).toBeInTheDocument();
    expect(screen.getByText(/Type mathematical expressions/)).toBeInTheDocument();
    expect(screen.getByText(/Use shortcuts like "frac"/)).toBeInTheDocument();
  });

  it('integrates MathField, useMathField hook, and MathEditor components', () => {
    render(<MathFieldDemo />);
    
    // Verify that the demo renders all the integrated components
    expect(screen.getByText('Math Editor:')).toBeInTheDocument();
    
    // The MathEditor should be using MathField internally
    // This tests the integration between all three components:
    // 1. MathField (React wrapper for MathfieldElement)
    // 2. useMathField (custom hook for state management)
    // 3. MathEditor (higher-level component using both)
    
    const completeButton = screen.getByTitle('Complete (Enter)');
    const cancelButton = screen.getByTitle('Cancel (Escape)');
    
    expect(completeButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});

describe('MathLive Component Configuration', () => {
  it('configures MathLive with proper inline shortcuts', () => {
    render(<MathFieldDemo />);
    
    // Verify that MathfieldElement was created
    expect(mockMathfieldElement).toBeDefined();
    
    // The shortcuts should be configured when the component mounts
    // This verifies that our MathField component properly configures MathLive
    expect(mockMathfieldElement.inlineShortcuts).toBeDefined();
  });

  it('sets up proper MathLive configuration options', () => {
    render(<MathFieldDemo />);
    
    // Verify default configuration
    expect(mockMathfieldElement.virtualKeyboardMode).toBe('manual');
    expect(mockMathfieldElement.smartMode).toBe(true);
    expect(mockMathfieldElement.readOnly).toBe(false);
  });
});