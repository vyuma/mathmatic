import React, { useEffect, useState } from 'react';
import type { ErrorNotification } from '../types';
import './ErrorNotification.css';

interface ErrorNotificationProps {
  notification: ErrorNotification;
  onDismiss: (id: string) => void;
}

export const ErrorNotificationItem: React.FC<ErrorNotificationProps> = ({
  notification,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-hide notification if specified
    if (notification.autoHide && notification.duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.autoHide, notification.duration]);

  const handleDismiss = () => {
    if (!notification.dismissible) return;
    
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match CSS transition duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`error-notification error-notification-${notification.type} ${
        isVisible ? 'error-notification-visible' : ''
      } ${isExiting ? 'error-notification-exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="error-notification-icon">
        {getIcon()}
      </div>
      
      <div className="error-notification-content">
        <div className="error-notification-title">
          {notification.title}
        </div>
        <div className="error-notification-message">
          {notification.message}
        </div>
        <div className="error-notification-timestamp">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {notification.dismissible && (
        <button
          className="error-notification-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
};

interface ErrorNotificationContainerProps {
  notifications: ErrorNotification[];
  onDismiss: (id: string) => void;
  maxNotifications?: number;
}

export const ErrorNotificationContainer: React.FC<ErrorNotificationContainerProps> = ({
  notifications,
  onDismiss,
  maxNotifications = 5
}) => {
  // Show only the most recent notifications
  const visibleNotifications = notifications.slice(-maxNotifications);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="error-notification-container">
      {visibleNotifications.map(notification => (
        <ErrorNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};