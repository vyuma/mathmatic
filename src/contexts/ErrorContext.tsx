import React, { createContext, useContext, ReactNode } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorNotificationContainer } from '../components/ErrorNotification';
import { useErrorNotifications, UseErrorNotificationsReturn } from '../hooks/useErrorNotifications';
import type { ErrorInfo } from '../types';

interface ErrorContextValue extends UseErrorNotificationsReturn {
  // Additional error handling methods can be added here
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const errorNotifications = useErrorNotifications();

  const handleBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
    // Show critical error notification
    errorNotifications.showNotification({
      type: 'error',
      title: 'Critical Error',
      message: 'A critical error occurred. The application may need to be reloaded.',
      dismissible: true,
      autoHide: false
    });
  };

  const contextValue: ErrorContextValue = {
    ...errorNotifications
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorBoundary onError={handleBoundaryError}>
        {children}
        <ErrorNotificationContainer
          notifications={errorNotifications.notifications}
          onDismiss={errorNotifications.dismissNotification}
        />
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Convenience hooks for common error scenarios
export const useStorageError = () => {
  const { showError } = useError();
  
  return {
    handleStorageError: (error: Error, operation: string) => {
      showError(error, `Storage operation: ${operation}`);
    }
  };
};

export const useMathError = () => {
  const { showError } = useError();
  
  return {
    handleMathError: (error: Error, latex?: string) => {
      showError(error, latex ? `Math rendering: ${latex}` : 'Math rendering');
    }
  };
};

export const useExportError = () => {
  const { showError } = useError();
  
  return {
    handleExportError: (error: Error, format: string) => {
      showError(error, `Export operation: ${format}`);
    }
  };
};