// Performance monitoring utilities
import React from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  // private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring render performance
   */
  startRenderMonitoring(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordMetric({
        renderTime,
        componentCount: 1,
        timestamp: Date.now(),
      });
      
      if (import.meta.env.DEV) {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Monitor memory usage (if available)
   */
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get average render time over last N measurements
   */
  getAverageRenderTime(count: number = 10): number {
    const recentMetrics = this.metrics.slice(-count);
    if (recentMetrics.length === 0) return 0;
    
    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / recentMetrics.length;
  }

  /**
   * Check if performance is degrading
   */
  isPerformanceDegrading(threshold: number = 16): boolean {
    const avgRenderTime = this.getAverageRenderTime();
    return avgRenderTime > threshold;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    totalMetrics: number;
    memoryUsage?: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: 0,
        totalMetrics: 0,
        memoryUsage: this.getMemoryUsage(),
      };
    }

    const renderTimes = this.metrics.map(m => m.renderTime);
    
    return {
      averageRenderTime: renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
      maxRenderTime: Math.max(...renderTimes),
      minRenderTime: Math.min(...renderTimes),
      totalMetrics: this.metrics.length,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * React hook for monitoring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    const endMonitoring = monitor.startRenderMonitoring(componentName);
    return endMonitoring;
  });
  
  return {
    getAverageRenderTime: () => monitor.getAverageRenderTime(),
    isPerformanceDegrading: () => monitor.isPerformanceDegrading(),
    getPerformanceSummary: () => monitor.getPerformanceSummary(),
  };
};

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof window.setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    // @ts-ignore
    timeout = window.setTimeout(later, wait) as number;
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`${name} execution time (with error): ${(end - start).toFixed(2)}ms`);
    }
    
    throw error;
  }
}

/**
 * Create a memoized version of a function with custom equality check
 */
export function memoizeWithCustomEquality<T extends (...args: any[]) => any>(
  fn: T,
  isEqual: (a: Parameters<T>, b: Parameters<T>) => boolean
): T {
  let lastArgs: Parameters<T> | undefined;
  let lastResult: ReturnType<T>;
  
  return ((...args: Parameters<T>) => {
    if (!lastArgs || !isEqual(args, lastArgs)) {
      lastArgs = args;
      lastResult = fn(...args);
    }
    
    return lastResult;
  }) as T;
}

/**
 * Check if the browser supports certain performance features
 */
export const performanceFeatures = {
  supportsPerformanceObserver: typeof PerformanceObserver !== 'undefined',
  supportsMemoryAPI: 'memory' in performance,
  supportsIntersectionObserver: typeof IntersectionObserver !== 'undefined',
  supportsRequestIdleCallback: typeof requestIdleCallback !== 'undefined',
};

/**
 * Schedule work during idle time if available
 */
export function scheduleIdleWork(callback: () => void, timeout: number = 5000): void {
  if (performanceFeatures.supportsRequestIdleCallback) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}