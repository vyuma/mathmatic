// Error handling utilities and custom error classes

// Math rendering error class
export class MathRenderError extends Error {
  constructor(message: string, public latex: string, public cause?: Error) {
    super(message);
    this.name = 'MathRenderError';
  }
}

// Generic application error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' = 'medium',
    public cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error message mapping for user-friendly messages
export const ERROR_MESSAGES = {
  // Storage errors
  STORAGE_SAVE_FAILED: 'Failed to save your note. Please try again.',
  STORAGE_LOAD_FAILED: 'Failed to load the note. It may be corrupted.',
  STORAGE_DELETE_FAILED: 'Failed to delete the note. Please try again.',
  STORAGE_NOT_FOUND: 'The requested note could not be found.',
  STORAGE_QUOTA_EXCEEDED: 'Storage is full. Please delete some notes to free up space.',
  
  // Math rendering errors
  MATH_RENDER_FAILED: 'Failed to render math expression. Please check the LaTeX syntax.',
  MATH_INVALID_SYNTAX: 'Invalid LaTeX syntax in math expression.',
  MATH_EDITOR_FAILED: 'Math editor failed to initialize. Please refresh the page.',
  
  // Export errors
  EXPORT_FAILED: 'Failed to export the note. Please try again.',
  EXPORT_UNSUPPORTED_FORMAT: 'The selected export format is not supported.',
  EXPORT_DOWNLOAD_FAILED: 'Failed to download the exported file.',
  
  // General errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  COMPONENT_ERROR: 'A component error occurred. The page will be refreshed.',
} as const;

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Error categories
export enum ErrorCategory {
  STORAGE = 'storage',
  MATH = 'math',
  EXPORT = 'export',
  NETWORK = 'network',
  COMPONENT = 'component',
  UNKNOWN = 'unknown'
}

// Error classification utility
export function classifyError(error: Error): { category: ErrorCategory; severity: ErrorSeverity; userMessage: string } {
  // Storage errors
  if (error.name === 'StorageError') {
    const storageError = error as any;
    if (storageError.message.includes('quota') || storageError.message.includes('storage full')) {
      return {
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.HIGH,
        userMessage: ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED
      };
    }
    if (storageError.operation === 'saveNote') {
      return {
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        userMessage: ERROR_MESSAGES.STORAGE_SAVE_FAILED
      };
    }
    if (storageError.operation === 'getNote') {
      return {
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        userMessage: ERROR_MESSAGES.STORAGE_LOAD_FAILED
      };
    }
    if (storageError.operation === 'deleteNote') {
      return {
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.MEDIUM,
        userMessage: ERROR_MESSAGES.STORAGE_DELETE_FAILED
      };
    }
  }
  
  // Math rendering errors
  if (error.name === 'MathRenderError') {
    return {
      category: ErrorCategory.MATH,
      severity: ErrorSeverity.LOW,
      userMessage: ERROR_MESSAGES.MATH_RENDER_FAILED
    };
  }
  
  // Export errors
  if (error.name === 'ExportError') {
    const exportError = error as any;
    if (exportError.format === 'download') {
      return {
        category: ErrorCategory.EXPORT,
        severity: ErrorSeverity.MEDIUM,
        userMessage: ERROR_MESSAGES.EXPORT_DOWNLOAD_FAILED
      };
    }
    return {
      category: ErrorCategory.EXPORT,
      severity: ErrorSeverity.MEDIUM,
      userMessage: ERROR_MESSAGES.EXPORT_FAILED
    };
  }
  
  // Network errors
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: ERROR_MESSAGES.NETWORK_ERROR
    };
  }
  
  // Component errors (React errors)
  if (error.message.includes('React') || error.stack?.includes('React')) {
    return {
      category: ErrorCategory.COMPONENT,
      severity: ErrorSeverity.HIGH,
      userMessage: ERROR_MESSAGES.COMPONENT_ERROR
    };
  }
  
  // Default unknown error
  return {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    userMessage: ERROR_MESSAGES.UNKNOWN_ERROR
  };
}

// Error logging utility
export function logError(error: Error, context?: string): void {
  const { category, severity } = classifyError(error);
  
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    category,
    severity,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Log to console with appropriate level
  if (severity === ErrorSeverity.HIGH) {
    console.error('High severity error:', errorInfo);
  } else if (severity === ErrorSeverity.MEDIUM) {
    console.warn('Medium severity error:', errorInfo);
  } else {
    console.info('Low severity error:', errorInfo);
  }
  
  // In a production app, you might also send this to an error tracking service
  // Example: sendToErrorTrackingService(errorInfo);
}

// Retry utility for operations that might fail temporarily
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, 'safeAsync operation');
    
    if (onError) {
      onError(err);
    }
    
    return fallback;
  }
}