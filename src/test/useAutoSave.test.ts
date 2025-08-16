import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../hooks/useAutoSave';

// Mock timers
vi.useFakeTimers();

describe('useAutoSave', () => {
  let mockSave: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSave = vi.fn().mockResolvedValue(undefined);
    mockOnError = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useAutoSave('initial content', {
        onSave: mockSave
      })
    );

    expect(result.current.autoSaveState).toEqual({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveError: null
    });
  });

  it('should detect content changes and mark as unsaved', () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave: mockSave }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed content' });

    expect(result.current.autoSaveState.hasUnsavedChanges).toBe(true);
  });

  it('should trigger auto-save after delay', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        delay: 1000
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed content' });

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should debounce multiple content changes', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        delay: 1000
      }),
      { initialProps: { content: 'initial' } }
    );

    // Multiple rapid changes
    rerender({ content: 'change 1' });
    rerender({ content: 'change 2' });
    rerender({ content: 'change 3' });

    // Fast-forward less than delay
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSave).not.toHaveBeenCalled();

    // Fast-forward to complete delay
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should handle save success correctly', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        delay: 100
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed' });

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.autoSaveState.isSaving).toBe(false);
    expect(result.current.autoSaveState.lastSaved).toBeInstanceOf(Date);
    expect(result.current.autoSaveState.hasUnsavedChanges).toBe(false);
    expect(result.current.autoSaveState.saveError).toBe(null);
  });

  it('should handle save errors correctly', async () => {
    const saveError = new Error('Save failed');
    mockSave.mockRejectedValueOnce(saveError);

    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        onError: mockOnError,
        delay: 100
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed' });

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.autoSaveState.isSaving).toBe(false);
    expect(result.current.autoSaveState.saveError).toBe('Save failed');
    expect(mockOnError).toHaveBeenCalledWith(saveError);
  });

  it('should support manual save trigger', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        delay: 5000 // Long delay
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed' });

    // Trigger manual save
    await act(async () => {
      await result.current.triggerSave();
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result.current.autoSaveState.hasUnsavedChanges).toBe(false);
  });

  it('should clear errors when requested', () => {
    const saveError = new Error('Save failed');
    mockSave.mockRejectedValueOnce(saveError);

    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        delay: 100
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content and trigger error
    rerender({ content: 'changed' });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.autoSaveState.saveError).toBe(null);
  });

  it('should not save when disabled', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { 
        onSave: mockSave,
        enabled: false,
        delay: 100
      }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'changed' });

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });
});