import { renderHook, act } from '@testing-library/react';
import { useMathEditing } from '../useMathEditing';

describe('useMathEditing', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMathEditing());
    
    expect(result.current.mathEditingState).toEqual({
      isEditing: false,
      latex: '',
      position: { x: 0, y: 0 },
      isInline: true,
    });
  });

  it('starts math editing correctly', () => {
    const { result } = renderHook(() => useMathEditing());
    
    act(() => {
      result.current.startMathEditing(
        'x^2 + y^2 = r^2',
        { x: 100, y: 200 },
        false
      );
    });
    
    expect(result.current.mathEditingState).toEqual({
      isEditing: true,
      latex: 'x^2 + y^2 = r^2',
      position: { x: 100, y: 200 },
      isInline: false,
      originalExpression: undefined,
    });
  });

  it('stops math editing correctly', () => {
    const { result } = renderHook(() => useMathEditing());
    
    act(() => {
      result.current.startMathEditing('x^2', { x: 0, y: 0 }, true);
    });
    
    expect(result.current.mathEditingState.isEditing).toBe(true);
    
    act(() => {
      result.current.stopMathEditing();
    });
    
    expect(result.current.mathEditingState.isEditing).toBe(false);
    expect(result.current.mathEditingState.originalExpression).toBeUndefined();
  });

  it('updates math latex correctly', () => {
    const { result } = renderHook(() => useMathEditing());
    
    act(() => {
      result.current.startMathEditing('x^2', { x: 0, y: 0 }, true);
    });
    
    act(() => {
      result.current.updateMathLatex('y^2');
    });
    
    expect(result.current.mathEditingState.latex).toBe('y^2');
  });

  it('completes math editing with new expression', () => {
    const { result } = renderHook(() => useMathEditing());
    
    act(() => {
      result.current.startMathEditing('', { x: 0, y: 0 }, true);
    });
    
    const content = 'Hello world';
    const newLatex = 'x^2';
    
    const newContent = result.current.completeMathEditing(content, newLatex);
    
    // Should append new math expression
    expect(newContent).toBe('Hello world$x^2$');
  });

  it('detects existing math expression when starting editing', () => {
    const { result } = renderHook(() => useMathEditing());
    
    const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
    const cursorPos = 20; // Inside the math expression
    
    act(() => {
      result.current.startMathEditing(
        'x^2 + y^2 = r^2',
        { x: 0, y: 0 },
        true,
        content,
        cursorPos
      );
    });
    
    expect(result.current.mathEditingState.originalExpression).toEqual({
      start: 12,
      end: 30,
      latex: 'x^2 + y^2 = r^2',
      isInline: true,
    });
  });

  it('completes math editing by replacing existing expression', () => {
    const { result } = renderHook(() => useMathEditing());
    
    const content = 'The formula $x^2 + y^2 = r^2$ is well known.';
    const cursorPos = 20;
    
    act(() => {
      result.current.startMathEditing(
        'x^2 + y^2 = r^2',
        { x: 0, y: 0 },
        true,
        content,
        cursorPos
      );
    });
    
    const newLatex = 'a^2 + b^2 = c^2';
    const newContent = result.current.completeMathEditing(content, newLatex);
    
    expect(newContent).toBe('The formula $a^2 + b^2 = c^2$ is well known.');
  });
});