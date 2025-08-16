// Touch device detection and optimization utilities

// Detect if the device supports touch
export function isTouchDevice(): boolean {
  try {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    );
  } catch (error) {
    console.error('Error detecting touch device:', error);
    return false;
  }
}

// Detect if the device is mobile based on screen size and touch support
export function isMobileDevice(): boolean {
  try {
    const isMobileSize = window.innerWidth <= 768;
    const hasTouch = isTouchDevice();
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    return isMobileSize && (hasTouch || isMobileUserAgent);
  } catch (error) {
    console.error('Error detecting mobile device:', error);
    return false;
  }
}

// Detect if the device is a tablet
export function isTabletDevice(): boolean {
  try {
    const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024;
    const hasTouch = isTouchDevice();
    const isTabletUserAgent = /iPad|Android/i.test(navigator.userAgent) && 
                              !/Mobile/i.test(navigator.userAgent);
    
    return isTabletSize && (hasTouch || isTabletUserAgent);
  } catch (error) {
    console.error('Error detecting tablet device:', error);
    return false;
  }
}

// Get optimal touch target size based on device
export function getOptimalTouchTargetSize(): number {
  try {
    if (isMobileDevice()) {
      return 44; // iOS HIG recommendation: 44pt minimum
    } else if (isTabletDevice()) {
      return 40; // Slightly smaller for tablets
    } else {
      return 32; // Desktop default
    }
  } catch (error) {
    console.error('Error getting touch target size:', error);
    return 32;
  }
}

// Get optimal spacing for touch interfaces
export function getOptimalTouchSpacing(): number {
  try {
    if (isMobileDevice()) {
      return 8; // More spacing on mobile
    } else if (isTabletDevice()) {
      return 6; // Medium spacing on tablets
    } else {
      return 4; // Compact spacing on desktop
    }
  } catch (error) {
    console.error('Error getting touch spacing:', error);
    return 4;
  }
}

// Check if the device prefers reduced motion
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    console.error('Error checking reduced motion preference:', error);
    return false;
  }
}

// Get device pixel ratio for high-DPI displays
export function getDevicePixelRatio(): number {
  try {
    return window.devicePixelRatio || 1;
  } catch (error) {
    console.error('Error getting device pixel ratio:', error);
    return 1;
  }
}

// Detect if the device has a physical keyboard
export function hasPhysicalKeyboard(): boolean {
  try {
    // This is a heuristic - not 100% accurate
    const isDesktop = !isMobileDevice() && !isTabletDevice();
    const hasLargeScreen = window.innerWidth > 1024;
    
    return isDesktop || hasLargeScreen;
  } catch (error) {
    console.error('Error detecting physical keyboard:', error);
    return true; // Default to true for safety
  }
}

// Get viewport information
export function getViewportInfo() {
  try {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      pixelRatio: getDevicePixelRatio(),
      isMobile: isMobileDevice(),
      isTablet: isTabletDevice(),
      isTouch: isTouchDevice(),
      hasPhysicalKeyboard: hasPhysicalKeyboard()
    };
  } catch (error) {
    console.error('Error getting viewport info:', error);
    return {
      width: 1024,
      height: 768,
      orientation: 'landscape' as const,
      pixelRatio: 1,
      isMobile: false,
      isTablet: false,
      isTouch: false,
      hasPhysicalKeyboard: true
    };
  }
}

// Debounce function for resize events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Add touch-friendly event listeners
export function addTouchFriendlyEventListener(
  element: HTMLElement,
  callback: (event: Event) => void,
  options?: { passive?: boolean; capture?: boolean }
) {
  try {
    const isTouchSupported = isTouchDevice();
    
    if (isTouchSupported) {
      // Use touch events for touch devices
      element.addEventListener('touchstart', callback, { passive: true, ...options });
      element.addEventListener('touchend', callback, { passive: true, ...options });
    } else {
      // Use mouse events for non-touch devices
      element.addEventListener('mousedown', callback, options);
      element.addEventListener('mouseup', callback, options);
    }
    
    // Always add click as fallback
    element.addEventListener('click', callback, options);
  } catch (error) {
    console.error('Error adding touch-friendly event listener:', error);
    // Fallback to click only
    element.addEventListener('click', callback, options);
  }
}

// Remove touch-friendly event listeners
export function removeTouchFriendlyEventListener(
  element: HTMLElement,
  callback: (event: Event) => void,
  options?: { capture?: boolean }
) {
  try {
    const isTouchSupported = isTouchDevice();
    
    if (isTouchSupported) {
      element.removeEventListener('touchstart', callback, options);
      element.removeEventListener('touchend', callback, options);
    } else {
      element.removeEventListener('mousedown', callback, options);
      element.removeEventListener('mouseup', callback, options);
    }
    
    element.removeEventListener('click', callback, options);
  } catch (error) {
    console.error('Error removing touch-friendly event listener:', error);
    // Try to remove click at least
    element.removeEventListener('click', callback, options);
  }
}