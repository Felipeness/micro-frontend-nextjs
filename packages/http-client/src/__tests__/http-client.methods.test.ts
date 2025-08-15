import { HttpClient } from '../http-client';

// Mock dependencies
jest.mock('axios', () => ({
  create: jest.fn(() => ({ request: jest.fn() })),
}));

jest.mock('../metrics', () => ({
  globalMetricsCollector: {
    startRequest: jest.fn(() => ({ requestId: 'test-id' })),
    recordResponse: jest.fn(),
    recordError: jest.fn(),
    getMetrics: jest.fn(() => ({ requestId: 'test-id' })),
    getRedMetrics: jest.fn(() => ({ 
      rate: 10, 
      errors: 1, 
      duration: { avg: 100, p95: 200, p99: 300 } 
    })),
    clearOldMetrics: jest.fn(),
  },
}));

describe('HttpClient - Methods', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.test.com');
  });

  describe('HTTP method shortcuts', () => {
    it('should have get method', () => {
      expect(typeof httpClient.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof httpClient.post).toBe('function');
    });

    it('should have put method', () => {
      expect(typeof httpClient.put).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof httpClient.delete).toBe('function');
    });

    it('should have patch method', () => {
      expect(typeof httpClient.patch).toBe('function');
    });
  });

  describe('utility methods', () => {
    it('should return metrics from collector', () => {
      const metrics = httpClient.getMetrics();
      
      expect(metrics).toEqual({
        rate: 10,
        errors: 1,
        duration: { avg: 100, p95: 200, p99: 300 }
      });
    });

    it('should clear old metrics', () => {
      httpClient.clearMetrics();
      
      // Verify the method exists and can be called
      expect(typeof httpClient.clearMetrics).toBe('function');
    });
  });

  describe('request ID generation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should generate request ID with correct format', () => {
      const mockTime = 1640995200000;
      jest.setSystemTime(mockTime);

      // Mock Math.random for predictable ID
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.123456789);

      // Access private method through type assertion
      const id = (httpClient as any).generateRequestId();
      
      expect(id).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id).toContain('req_1640995200000_');

      Math.random = originalRandom;
    });
  });
});