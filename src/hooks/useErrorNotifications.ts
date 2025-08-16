import { useState, useCallback } from 'react';
import type { ErrorNotification } from '../types';
import { classifyError, logError } from '../utils/errors';

export interface UseErrorNotificationsReturn {
  notifications: ErrorNotification[];
  showError: (error: Error, context?: string) => void;
  showNotification: (notification: Omit<ErrorNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useErrorNotifications = (): UseErrorNotificationsReturn => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showNotification = useCallback((
    notification: Omit<ErrorNotification, 'id' | 'timestamp'>
  ) => {
    const newNotification: ErrorNotification = {
      ...notification,
      id: generateId(),
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);
  }, [generateId]);

  const showError = useCallback((error: Error, context?: string) => {
    // Log the error
    logError(error, context);

    // Classify the error and get user-friendly message
    const { userMessage, severity } = classifyError(error);

    // Determine notification type based on severity
    const type = severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info';

    // Create notification
    showNotification({
      type,
      title: getErrorTitle(error),
      message: userMessage,
      dismissible: true,
      autoHide: type !== 'error', // Don't auto-hide errors
      duration: type === 'info' ? 3000 : type === 'warning' ? 5000 : undefined
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showError,
    showNotification,
    dismissNotification,
    clearAllNotifications
  };
};

// Helper function to get appropriate error title
function getErrorTitle(error: Error): string {
  switch (error.name) {
    case 'StorageError':
      return 'Storage Error';
    case 'MathRenderError':
      return 'Math Rendering Error';
    case 'ExportError':
      return 'Export Error';
    case 'AppError':
      return 'Application Error';
    default:
      return 'Error';
  }
}