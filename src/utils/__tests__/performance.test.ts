import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PerformanceMonitor,
  debounce,
  throttle,
  measureExecutionTime,
  memoizeWithCustomEquality,
  performanceFeatures,
  scheduleIdleWork,
} from '../performance';

describe('Performance utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = PerformanceMonitor.getInstance();
      monitor.clearMetrics();
    });

    it('records performance metrics', () => {
      const endMonitoring = monitor.startRenderMonitoring('TestComponent');
      
      // Simulate some work
      setTimeout(() => {
        endMonitoring();
      }, 10);

      setTimeout(() => {
        const summary = monitor.getPerformanceSummary();
        expect(summary.totalMetrics).toBe(1);
        expect(summary.averageRenderTime).toBeGreaterThan(0);
      }, 20);
    });

    it('calculates average render time correctly', () => {
      monitor.recordMetric({ renderTime: 10, componentCount: 1, timestamp: Date.now() });
      monitor.recordMetric({ renderTime: 20, componentCount: 1, timestamp: Date.now() });
      monitor.recordMetric({ renderTime: 30, componentCount: 1, timestamp: Date.now() });

      const avgTime = monitor.getAverageRenderTime(3);
      expect(avgTime).toBe(20);
    });

    it('detects performance degradation', () => {
      // Record slow render times
      monitor.recordMetric({ renderTime: 50, componentCount: 1, timestamp: Date.now() });
      monitor.recordMetric({ renderTime: 60, componentCount: 1, timestamp: Date.now() });

      expect(monitor.isPerformanceDegrading(16)).toBe(true);
      expect(monitor.isPerformanceDegrading(100)).toBe(false);
    });

    it('limits stored metrics to prevent memory leaks', () => {
      // Add more than 100 metrics
      for (let i = 0; i < 150; i++) {
        monitor.recordMetric({ renderTime: i, componentCount: 1, timestamp: Date.now() });
      }

      const summary = monitor.getPerformanceSummary();
      expect(summary.totalMetrics).toBe(100);
    });

    it('provides comprehensive performance summary', () => {
      monitor.recordMetric({ renderTime: 10, componentCount: 1, timestamp: Date.now() });
      monitor.recordMetric({ renderTime: 20, componentCount: 1, timestamp: Date.now() });
      monitor.recordMetric({ renderTime: 30, componentCount: 1, timestamp: Date.now() });

      const summary = monitor.getPerformanceSummary();
      expect(summary.averageRenderTime).toBe(20);
      expect(summary.maxRenderTime).toBe(30);
      expect(summary.minRenderTime).toBe(10);
      expect(summary.totalMetrics).toBe(3);
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('executes immediately when immediate flag is true', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1); // Should not call again
    });

    it('passes arguments correctly', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn('arg1', 'arg2');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('limits function execution frequency', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('passes arguments correctly', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1', 'arg2');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('measureExecutionTime', () => {
    it('measures synchronous function execution time', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await measureExecutionTime('test', () => {
        return 'result';
      });

      expect(result).toBe('result');
      
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('test execution time:')
        );
      }
      
      consoleSpy.mockRestore();
    });

    it('measures asynchronous function execution time', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await measureExecutionTime('async test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });

      expect(result).toBe('async result');
      
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('async test execution time:')
        );
      }
      
      consoleSpy.mockRestore();
    });

    it('handles errors and still measures time', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await expect(measureExecutionTime('error test', () => {
        throw new Error('Test error');
      })).rejects.toThrow('Test error');
      
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('error test execution time (with error):')
        );
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('memoizeWithCustomEquality', () => {
    it('memoizes function results with custom equality', () => {
      const mockFn = vi.fn((a: number, b: number) => a + b);
      const isEqual = (a: [number, number], b: [number, number]) => 
        a[0] === b[0] && a[1] === b[1];
      
      const memoizedFn = memoizeWithCustomEquality(mockFn, isEqual);

      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);
      const result3 = memoizedFn(2, 3);

      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(5);
      expect(mockFn).toHaveBeenCalledTimes(2); // Only called twice due to memoization
    });

    it('recalculates when equality check fails', () => {
      const mockFn = vi.fn((obj: { value: number }) => obj.value * 2);
      const isEqual = (a: [{ value: number }], b: [{ value: number }]) => 
        a[0].value === b[0].value;
      
      const memoizedFn = memoizeWithCustomEquality(mockFn, isEqual);

      const result1 = memoizedFn({ value: 5 });
      const result2 = memoizedFn({ value: 5 }); // Same value, should use cache
      const result3 = memoizedFn({ value: 10 }); // Different value, should recalculate

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(result3).toBe(20);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('performanceFeatures', () => {
    it('detects browser performance features', () => {
      expect(typeof performanceFeatures.supportsPerformanceObserver).toBe('boolean');
      expect(typeof performanceFeatures.supportsMemoryAPI).toBe('boolean');
      expect(typeof performanceFeatures.supportsIntersectionObserver).toBe('boolean');
      expect(typeof performanceFeatures.supportsRequestIdleCallback).toBe('boolean');
    });
  });

  describe('scheduleIdleWork', () => {
    it('schedules work using requestIdleCallback when available', () => {
      const mockRequestIdleCallback = vi.fn();
      const originalRequestIdleCallback = global.requestIdleCallback;
      
      global.requestIdleCallback = mockRequestIdleCallback;
      
      const callback = vi.fn();
      scheduleIdleWork(callback, 1000);
      
      expect(mockRequestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 1000 });
      
      global.requestIdleCallback = originalRequestIdleCallback;
    });

    it('falls back to setTimeout when requestIdleCallback is not available', () => {
      const mockSetTimeout = vi.spyOn(global, 'setTimeout');
      const originalRequestIdleCallback = global.requestIdleCallback;
      
      // @ts-ignore
      global.requestIdleCallback = undefined;
      
      const callback = vi.fn();
      scheduleIdleWork(callback);
      
      expect(mockSetTimeout).toHaveBeenCalledWith(callback, 0);
      
      global.requestIdleCallback = originalRequestIdleCallback;
      mockSetTimeout.mockRestore();
    });
  });
});