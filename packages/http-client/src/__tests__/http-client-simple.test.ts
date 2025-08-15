import { HttpClient } from '../http-client';

// Mock only what we need to test basic functionality
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(),
  })),
}));

jest.mock('../metrics', () => ({
  globalMetricsCollector: {
    startRequest: jest.fn(() => ({
      requestId: 'test-id',
      url: '/test',
      method: 'GET',
      startTime: Date.now(),
    })),
    recordResponse: jest.fn(),
    recordError: jest.fn(),
    recordRetry: jest.fn(),
    getMetrics: jest.fn(() => ({ requestId: 'test-id' })),
    getRedMetrics: jest.fn(() => ({ rate: 0, errors: 0, duration: { avg: 0, p95: 0, p99: 0 } })),
    clearOldMetrics: jest.fn(),
  },
}));

describe('HttpClient - Basic Functionality', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.test.com');
  });

  describe('constructor', () => {
    it('should create HttpClient instance', () => {
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it('should create with default timeout', () => {
      const client = new HttpClient();
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('utility methods', () => {
    it('should return metrics', () => {
      const metrics = httpClient.getMetrics();
      expect(metrics).toEqual({
        rate: 0,
        errors: 0, 
        duration: { avg: 0, p95: 0, p99: 0 }
      });
    });

    it('should clear metrics', () => {
      httpClient.clearMetrics();
      expect(true).toBe(true); // Just verify no error thrown
    });
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

      // Access private method through any
      const id = (httpClient as any).generateRequestId();
      
      expect(id).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id).toContain('req_1640995200000_');

      Math.random = originalRandom;
    });
  });
});