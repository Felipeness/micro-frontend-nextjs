import { MetricsCollector, globalMetricsCollector } from '../metrics';
import { RequestMetrics } from '../types';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('startRequest', () => {
    it('should create and store request metrics', () => {
      const mockTime = 1640995200000;
      jest.setSystemTime(mockTime);

      const metrics = collector.startRequest('req-1', '/api/users', 'GET');

      expect(metrics).toEqual({
        requestId: 'req-1',
        url: '/api/users',
        method: 'GET',
        startTime: mockTime,
        retryCount: 0,
        idempotencyKey: undefined,
      });

      expect(collector.getMetrics('req-1')).toEqual(metrics);
    });

    it('should include idempotency key when provided', () => {
      const metrics = collector.startRequest(
        'req-2', 
        '/api/orders', 
        'POST', 
        'order-123'
      );

      expect(metrics.idempotencyKey).toBe('order-123');
    });
  });

  describe('recordRetry', () => {
    it('should increment retry count for existing request', () => {
      collector.startRequest('req-1', '/api/test', 'GET');
      
      collector.recordRetry('req-1');
      expect(collector.getMetrics('req-1')?.retryCount).toBe(1);
      
      collector.recordRetry('req-1');
      expect(collector.getMetrics('req-1')?.retryCount).toBe(2);
    });

    it('should handle non-existent request ID gracefully', () => {
      expect(() => {
        collector.recordRetry('non-existent');
      }).not.toThrow();
    });
  });

  describe('recordResponse', () => {
    it('should record successful response metrics', () => {
      const startTime = 1640995200000;
      const endTime = startTime + 150; // 150ms later
      
      jest.setSystemTime(startTime);
      collector.startRequest('req-1', '/api/users', 'GET');
      
      jest.setSystemTime(endTime);
      collector.recordResponse('req-1', 200, 'OK');

      const metrics = collector.getMetrics('req-1');
      expect(metrics).toEqual({
        requestId: 'req-1',
        url: '/api/users',
        method: 'GET',
        startTime,
        endTime,
        duration: 150,
        statusCode: 200,
        retryCount: 0,
        idempotencyKey: undefined,
      });
    });

    it('should record response without statusText', () => {
      const startTime = 1640995200000;
      jest.setSystemTime(startTime);
      
      collector.startRequest('req-1', '/api/test', 'POST');
      jest.setSystemTime(startTime + 100);
      collector.recordResponse('req-1', 201);

      const metrics = collector.getMetrics('req-1');
      expect(metrics?.statusCode).toBe(201);
      expect(metrics?.duration).toBe(100);
    });

    it('should handle non-existent request ID gracefully', () => {
      expect(() => {
        collector.recordResponse('non-existent', 200);
      }).not.toThrow();
    });
  });

  describe('recordError', () => {
    it('should record error metrics with status code', () => {
      const startTime = 1640995200000;
      const endTime = startTime + 200;
      
      jest.setSystemTime(startTime);
      collector.startRequest('req-1', '/api/error', 'GET');
      
      jest.setSystemTime(endTime);
      const error = new Error('Request timeout');
      collector.recordError('req-1', error, 408);

      const metrics = collector.getMetrics('req-1');
      expect(metrics).toEqual({
        requestId: 'req-1',
        url: '/api/error',
        method: 'GET',
        startTime,
        endTime,
        duration: 200,
        statusCode: 408,
        error: 'Request timeout',
        retryCount: 0,
        idempotencyKey: undefined,
      });
    });

    it('should record error metrics without status code', () => {
      const startTime = 1640995200000;
      jest.setSystemTime(startTime);
      
      collector.startRequest('req-1', '/api/network', 'GET');
      jest.setSystemTime(startTime + 50);
      
      const error = new Error('Network error');
      collector.recordError('req-1', error);

      const metrics = collector.getMetrics('req-1');
      expect(metrics?.error).toBe('Network error');
      expect(metrics?.statusCode).toBeUndefined();
      expect(metrics?.duration).toBe(50);
    });

    it('should handle non-existent request ID gracefully', () => {
      const error = new Error('Test error');
      expect(() => {
        collector.recordError('non-existent', error);
      }).not.toThrow();
    });
  });

  describe('getAllMetrics', () => {
    it('should return all stored metrics', () => {
      collector.startRequest('req-1', '/api/users', 'GET');
      collector.startRequest('req-2', '/api/orders', 'POST');
      
      const allMetrics = collector.getAllMetrics();
      
      expect(allMetrics).toHaveLength(2);
      expect(allMetrics.map(m => m.requestId)).toEqual(['req-1', 'req-2']);
    });

    it('should return empty array when no metrics exist', () => {
      expect(collector.getAllMetrics()).toEqual([]);
    });
  });

  describe('getRedMetrics', () => {
    it('should calculate RED metrics for recent requests', () => {
      const baseTime = 1640995200000;
      const recentTime = baseTime + 30000; // 30 seconds ago
      
      // Create some recent requests
      jest.setSystemTime(recentTime);
      collector.startRequest('req-1', '/api/fast', 'GET');
      collector.startRequest('req-2', '/api/slow', 'GET');
      collector.startRequest('req-3', '/api/error', 'GET');
      
      // Complete requests with different durations
      jest.setSystemTime(recentTime + 100);
      collector.recordResponse('req-1', 200); // 100ms
      
      jest.setSystemTime(recentTime + 500);
      collector.recordResponse('req-2', 200); // 500ms
      
      jest.setSystemTime(recentTime + 200);
      collector.recordError('req-3', new Error('Server error'), 500); // 200ms, error

      const redMetrics = collector.getRedMetrics();
      
      expect(redMetrics.rate).toBe(3); // 3 requests in the last minute
      expect(redMetrics.errors).toBe(1); // 1 error (status 500)
      expect(redMetrics.duration.avg).toBe((100 + 500 + 200) / 3); // Average duration
      expect(redMetrics.duration.p95).toBe(500); // 95th percentile
      expect(redMetrics.duration.p99).toBe(500); // 99th percentile
    });

    it('should only include requests from last minute', () => {
      const baseTime = 1640995200000;
      const oldTime = baseTime - 120000; // 2 minutes ago
      const recentTime = baseTime - 30000; // 30 seconds ago
      
      // Old request (should be excluded)
      jest.setSystemTime(oldTime);
      collector.startRequest('req-old', '/api/old', 'GET');
      collector.recordResponse('req-old', 200);
      
      // Recent request (should be included)
      jest.setSystemTime(recentTime);
      collector.startRequest('req-recent', '/api/recent', 'GET');
      collector.recordResponse('req-recent', 200);
      
      jest.setSystemTime(baseTime);
      const redMetrics = collector.getRedMetrics();
      
      expect(redMetrics.rate).toBe(1); // Only recent request
    });

    it('should handle empty metrics', () => {
      const redMetrics = collector.getRedMetrics();
      
      expect(redMetrics).toEqual({
        rate: 0,
        errors: 0,
        duration: { avg: 0, p95: 0, p99: 0 },
      });
    });

    it('should count 4xx and 5xx status codes as errors', () => {
      const baseTime = 1640995200000;
      jest.setSystemTime(baseTime);
      
      collector.startRequest('req-1', '/api/notfound', 'GET');
      collector.startRequest('req-2', '/api/server', 'GET');
      collector.startRequest('req-3', '/api/success', 'GET');
      
      collector.recordResponse('req-1', 404); // Client error
      collector.recordResponse('req-2', 500); // Server error  
      collector.recordResponse('req-3', 200); // Success
      
      const redMetrics = collector.getRedMetrics();
      
      expect(redMetrics.errors).toBe(2); // 404 and 500 are errors
    });

    it('should calculate percentiles correctly with many requests', () => {
      const baseTime = 1640995200000;
      
      // Create 100 requests with durations 1ms to 100ms within a 1-second window
      for (let i = 1; i <= 100; i++) {
        jest.setSystemTime(baseTime + (i - 1) * 10); // Start times 0ms, 10ms, 20ms, etc.
        collector.startRequest(`req-${i}`, '/api/test', 'GET');
        jest.setSystemTime(baseTime + (i - 1) * 10 + i); // End time (duration = i)
        collector.recordResponse(`req-${i}`, 200);
      }
      
      // Set current time for getRedMetrics call
      jest.setSystemTime(baseTime + 1000 + 100); // All requests within last minute
      
      const redMetrics = collector.getRedMetrics();
      
      expect(redMetrics.duration.p95).toBe(96); // 95th percentile (index 95 = value 96)
      expect(redMetrics.duration.p99).toBe(100); // 99th percentile (index 99 = value 100)
    });
  });

  describe('clearOldMetrics', () => {
    it('should remove metrics older than specified time', () => {
      const baseTime = 1640995200000;
      const oldTime = baseTime - 400000; // 6.67 minutes ago (older than default 5 minutes)
      const recentTime = baseTime - 200000; // 3.33 minutes ago (newer than default 5 minutes)
      
      jest.setSystemTime(oldTime);
      collector.startRequest('req-old', '/api/old', 'GET');
      
      jest.setSystemTime(recentTime);
      collector.startRequest('req-recent', '/api/recent', 'GET');
      
      jest.setSystemTime(baseTime);
      
      expect(collector.getAllMetrics()).toHaveLength(2);
      
      collector.clearOldMetrics(); // Default 5 minutes (300000ms)
      
      const remaining = collector.getAllMetrics();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].requestId).toBe('req-recent');
    });

    it('should use custom time threshold', () => {
      const baseTime = 1640995200000;
      const oldTime = baseTime - 150000; // 2.5 minutes ago
      
      jest.setSystemTime(oldTime);
      collector.startRequest('req-old', '/api/old', 'GET');
      
      jest.setSystemTime(baseTime);
      
      expect(collector.getAllMetrics()).toHaveLength(1);
      
      collector.clearOldMetrics(120000); // 2 minutes threshold
      
      expect(collector.getAllMetrics()).toHaveLength(0);
    });
  });

  describe('globalMetricsCollector', () => {
    it('should be a singleton instance', () => {
      expect(globalMetricsCollector).toBeInstanceOf(MetricsCollector);
    });
  });
});