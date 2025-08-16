import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useMathField } from '../useMathField';

// Mock MathField ref
const mockMathFieldRef = {
  current: {
    getValue: vi.fn().mockReturnValue(''),
    setValue: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    insert: vi.fn(),
    clear: vi.fn()
  }
};

describe('useMathField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock ref
    mockMathFieldRef.current.getValue.mockReturnValue('');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMathField());

    expect(result.current.value).toBe('');
    expect(result.current.isActive).toBe(false);
  });

  it('should initialize with provided initial value', () => {
    const initialValue = 'x^2 + y^2';
    const { result } = renderHook(() => useMathField({ initialValue }));

    expect(result.current.value).toBe(initialValue);
  });

  it('should update value when setValue is called', () => {
    const { result } = renderHook(() => useMathField());

    act(() => {
      result.current.setValue('\\alpha + \\beta');
    });

    expect(result.current.value).toBe('\\alpha + \\beta');
  });

  it('should get value from MathField ref', () => {
    mockMathFieldRef.current.getValue.mockReturnValue('x^3');
    const { result } = renderHook(() => useMathField());

    const value = result.current.getValue();

    expect(value).toBe('x^3');
  });

  it('should focus the MathField', () => {
    const { result } = renderHook(() => useMathField());

    act(() => {
      result.current.focus();
    });

    expect(result.current.isActive).toBe(true);
  });

  it('should blur the MathField', () => {
    const { result } = renderHook(() => useMathField());

    act(() => {
      result.current.setIsActive(true);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.blur();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('should insert LaTeX into MathField', () => {
    const { result } = renderHook(() => useMathField());

    act(() => {
      result.current.insert('\\sum');
    });

    expect(mockMathFieldRef.current.insert).toHaveBeenCalledWith('\\sum');
  });

  it('should clear the MathField', () => {
    const { result } = renderHook(() => useMathField({ initialValue: 'x^2' }));

    act(() => {
      result.current.clear();
    });

    expect(result.current.value).toBe('');
  });

  it('should handle active state changes', () => {
    const { result } = renderHook(() => useMathField());

    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.setIsActive(true);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.setIsActive(false);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('should handle errors gracefully when MathField methods fail', () => {
    mockMathFieldRef.current.setValue.mockImplementation(() => {
      throw new Error('MathField error');
    });

    const { result } = renderHook(() => useMathField());

    // Should not throw, but should still update state
    act(() => {
      result.current.setValue('x^2');
    });

    expect(result.current.value).toBe('x^2');
  });

  it('should handle null MathField ref gracefully', () => {
    const nullRef = { current: null };
    vi.spyOn(React, 'useRef').mockReturnValueOnce(nullRef);

    const { result } = renderHook(() => useMathField());

    // Should not throw errors when ref is null
    expect(() => {
      result.current.focus();
      result.current.blur();
      result.current.insert('x');
      result.current.clear();
    }).not.toThrow();

    expect(result.current.getValue()).toBe('');
  });

  it('should provide mathFieldRef', () => {
    const { result } = renderHook(() => useMathField());

    expect(result.current.mathFieldRef).toBeDefined();
    expect(result.current.mathFieldRef.current).toBeDefined();
  });
});