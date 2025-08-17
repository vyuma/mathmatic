import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logError, classifyError, ErrorSeverity } from '../utils/errors';
import type { ErrorInfo as CustomErrorInfo } from '../types';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: CustomErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: CustomErrorInfo;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert React ErrorInfo to our custom ErrorInfo
    const customErrorInfo: CustomErrorInfo = {
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: this.constructor.name,
      // errorBoundaryStack: errorInfo.errorBoundaryStack // Removed as it does not exist
    };

    // Log the error
    logError(error, 'ErrorBoundary');

    // Update state with error info
    this.setState({
      errorInfo: customErrorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, customErrorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const { error } = this.state;
      const { severity, userMessage } = error ? classifyError(error) : { 
        severity: ErrorSeverity.MEDIUM, 
        userMessage: 'An unexpected error occurred' 
      };

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              {severity === ErrorSeverity.HIGH ? '🚨' : '⚠️'}
            </div>
            
            <h2 className="error-title">
              {severity === ErrorSeverity.HIGH ? 'Critical Error' : 'Something went wrong'}
            </h2>
            
            <p className="error-message">
              {userMessage}
            </p>
            
            <div className="error-actions">
              <button 
                className="error-button error-button-primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              
              {severity === ErrorSeverity.HIGH && (
                <button 
                  className="error-button error-button-secondary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </button>
              )}
            </div>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-stack">
                  <strong>Error:</strong> {error.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre>{error.stack}</pre>
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: CustomErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}