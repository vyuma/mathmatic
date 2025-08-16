import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'default' | 'danger';
  onConfirm: () => void;
}

export interface UseConfirmDialogReturn {
  dialogState: ConfirmDialogState;
  showConfirmDialog: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
  }) => void;
  hideConfirmDialog: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

/**
 * Custom hook for managing confirmation dialogs
 */
export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    onConfirm: () => {}
  });

  /**
   * Show confirmation dialog with specified options
   */
  const showConfirmDialog = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
  }) => {
    setDialogState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      variant: options.variant || 'default',
      onConfirm: options.onConfirm
    });
  }, []);

  /**
   * Hide confirmation dialog
   */
  const hideConfirmDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  /**
   * Handle confirmation action
   */
  const handleConfirm = useCallback(() => {
    dialogState.onConfirm();
    hideConfirmDialog();
  }, [dialogState.onConfirm, hideConfirmDialog]);

  /**
   * Handle cancellation action
   */
  const handleCancel = useCallback(() => {
    hideConfirmDialog();
  }, [hideConfirmDialog]);

  return {
    dialogState,
    showConfirmDialog,
    hideConfirmDialog,
    handleConfirm,
    handleCancel
  };
};