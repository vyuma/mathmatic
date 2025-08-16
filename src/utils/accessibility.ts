/**
 * Accessibility utilities and improvements for the Math Markdown Notepad
 */

// ARIA labels and roles for better screen reader support
export const ARIA_LABELS = {
  // Main navigation
  MAIN_NAV: 'Main navigation',
  NOTE_LIST: 'Notes list',
  NOTE_ITEM: 'Note item',
  
  // Editor
  MARKDOWN_EDITOR: 'Markdown editor',
  MATH_EDITOR: 'Math expression editor',
  PREVIEW_PANE: 'Markdown preview',
  
  // Actions
  NEW_NOTE: 'Create new note',
  SAVE_NOTE: 'Save current note',
  DELETE_NOTE: 'Delete note',
  EXPORT_NOTE: 'Export note',
  
  // Math
  MATH_EXPRESSION: 'Math expression',
  EDIT_MATH: 'Edit math expression',
  
  // Status
  SAVING_STATUS: 'Saving status',
  ERROR_MESSAGE: 'Error message',
} as const;

// Keyboard navigation helpers
export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  NEW_NOTE: 'Ctrl+N',
  FOCUS_EDITOR: 'Ctrl+E',
  FOCUS_PREVIEW: 'Ctrl+P',
  TOGGLE_SIDEBAR: 'Ctrl+B',
} as const;

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  
  static pushFocus(element: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }
  
  static popFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }
  
  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

// Color contrast utilities
export const checkColorContrast = (foreground: string, background: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(x => {
      const val = parseInt(x) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announceElement: HTMLElement;
  
  private constructor() {
    this.announceElement = document.createElement('div');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    this.announceElement.style.position = 'absolute';
    this.announceElement.style.left = '-10000px';
    this.announceElement.style.width = '1px';
    this.announceElement.style.height = '1px';
    this.announceElement.style.overflow = 'hidden';
    document.body.appendChild(this.announceElement);
  }
  
  static getInstance(): ScreenReaderAnnouncer {
    if (!this.instance) {
      this.instance = new ScreenReaderAnnouncer();
    }
    return this.instance;
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    this.announceElement.setAttribute('aria-live', priority);
    this.announceElement.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announceElement.textContent = '';
    }, 1000);
  }
}

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Font size utilities
export const getFontSizePreference = (): 'small' | 'medium' | 'large' => {
  const fontSize = window.getComputedStyle(document.documentElement).fontSize;
  const baseFontSize = parseFloat(fontSize);
  
  if (baseFontSize >= 20) return 'large';
  if (baseFontSize >= 16) return 'medium';
  return 'small';
};

// Accessibility audit function
export const auditAccessibility = (): string[] => {
  const issues: string[] = [];
  
  // Check for missing alt text on images
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  // Check for missing form labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputs).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing labels`);
  }
  
  // Check for missing headings structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('No heading structure found');
  }
  
  // Check for missing focus indicators
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // This would need more sophisticated checking in a real implementation
  
  return issues;
};

// Export utility functions for components
export const addAccessibilityProps = (element: HTMLElement, role?: string, label?: string) => {
  if (role) {
    element.setAttribute('role', role);
  }
  if (label) {
    element.setAttribute('aria-label', label);
  }
};