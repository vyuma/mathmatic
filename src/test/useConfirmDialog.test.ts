import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

describe('useConfirmDialog', () => {
  it('should initialize with dialog closed', () => {
    const { result } = renderHook(() => useConfirmDialog());

    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.dialogState.title).toBe('');
    expect(result.current.dialogState.message).toBe('');
  });

  it('should show dialog with provided options', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const mockOnConfirm = vi.fn();

    act(() => {
      result.current.showConfirmDialog({
        title: 'Test Title',
        message: 'Test Message',
        confirmText: 'Yes',
        cancelText: 'No',
        variant: 'danger',
        onConfirm: mockOnConfirm
      });
    });

    expect(result.current.dialogState.isOpen).toBe(true);
    expect(result.current.dialogState.title).toBe('Test Title');
    expect(result.current.dialogState.message).toBe('Test Message');
    expect(result.current.dialogState.confirmText).toBe('Yes');
    expect(result.current.dialogState.cancelText).toBe('No');
    expect(result.current.dialogState.variant).toBe('danger');
    expect(result.current.dialogState.onConfirm).toBe(mockOnConfirm);
  });

  it('should use default values for optional parameters', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const mockOnConfirm = vi.fn();

    act(() => {
      result.current.showConfirmDialog({
        title: 'Test Title',
        message: 'Test Message',
        onConfirm: mockOnConfirm
      });
    });

    expect(result.current.dialogState.confirmText).toBe('Confirm');
    expect(result.current.dialogState.cancelText).toBe('Cancel');
    expect(result.current.dialogState.variant).toBe('default');
  });

  it('should hide dialog when hideConfirmDialog is called', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const mockOnConfirm = vi.fn();

    // Show dialog first
    act(() => {
      result.current.showConfirmDialog({
        title: 'Test Title',
        message: 'Test Message',
        onConfirm: mockOnConfirm
      });
    });

    expect(result.current.dialogState.isOpen).toBe(true);

    // Hide dialog
    act(() => {
      result.current.hideConfirmDialog();
    });

    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it('should call onConfirm and hide dialog when handleConfirm is called', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const mockOnConfirm = vi.fn();

    // Show dialog
    act(() => {
      result.current.showConfirmDialog({
        title: 'Test Title',
        message: 'Test Message',
        onConfirm: mockOnConfirm
      });
    });

    // Handle confirm
    act(() => {
      result.current.handleConfirm();
    });

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it('should hide dialog when handleCancel is called', () => {
    const { result } = renderHook(() => useConfirmDialog());
    const mockOnConfirm = vi.fn();

    // Show dialog
    act(() => {
      result.current.showConfirmDialog({
        title: 'Test Title',
        message: 'Test Message',
        onConfirm: mockOnConfirm
      });
    });

    expect(result.current.dialogState.isOpen).toBe(true);

    // Handle cancel
    act(() => {
      result.current.handleCancel();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(result.current.dialogState.isOpen).toBe(false);
  });
});