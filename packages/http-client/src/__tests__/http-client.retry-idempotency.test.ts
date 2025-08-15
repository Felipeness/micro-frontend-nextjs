import { HttpClient } from '../http-client';
import { sleep } from '../retry';
import { globalMetricsCollector } from '../metrics';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(),
  })),
}));

// Mock only sleep to speed up tests
jest.mock('../retry', () => {
  const actualRetry = jest.requireActual('../retry');
  return {
    ...actualRetry,
    sleep: jest.fn(() => Promise.resolve()),
  };
});

// Mock metrics
jest.mock('../metrics', () => ({
  globalMetricsCollector: {
    startRequest: jest.fn(() => ({ requestId: 'test-id' })),
    recordResponse: jest.fn(),
    recordError: jest.fn(),
    recordRetry: jest.fn(),
    getMetrics: jest.fn(() => ({ requestId: 'test-id' })),
    getRedMetrics: jest.fn(),
    clearOldMetrics: jest.fn(),
  },
}));

describe('HttpClient - Retry and Idempotency', () => {
  let httpClient: HttpClient;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.test.com');
    mockRequest = (httpClient as any).axiosInstance.request;
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retry logic', () => {
    it('should retry retryable errors', async () => {
      const retryableError = {
        message: 'Network Error',
        code: 'ECONNRESET',
      };

      const successResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      // First call fails, second succeeds
      mockRequest
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce(successResponse);

      const response = await httpClient.request({
        method: 'GET',
        url: '/test',
        retryConfig: { maxRetries: 1 },
      });

      expect(response.success).toBe(true);
      expect(globalMetricsCollector.recordRetry).toHaveBeenCalled();
      expect(sleep).toHaveBeenCalled();
    });

    it('should throw error after max retries', async () => {
      const retryableError = {
        message: 'Service Unavailable',
        response: { status: 503, statusText: 'Service Unavailable' },
      };

      mockRequest.mockRejectedValue(retryableError);

      await expect(
        httpClient.request({
          method: 'GET',
          url: '/test',
          retryConfig: { maxRetries: 2 },
        })
      ).rejects.toMatchObject({
        message: 'Service Unavailable',
        success: false,
      });

      // The actual retry logic is controlled by the real isRetryableError function
      // which should identify 503 as retryable, so we expect retries
      expect(mockRequest).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(globalMetricsCollector.recordRetry).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = {
        message: 'Not Found',
        response: { status: 404, statusText: 'Not Found' },
      };

      mockRequest.mockRejectedValue(nonRetryableError);

      await expect(
        httpClient.request({
          method: 'GET',
          url: '/test',
          retryConfig: { maxRetries: 2 },
        })
      ).rejects.toMatchObject({
        message: 'Not Found',
        success: false,
      });

      expect(mockRequest).toHaveBeenCalledTimes(1); // Only initial call
      expect(globalMetricsCollector.recordRetry).not.toHaveBeenCalled();
    });
  });

  describe('idempotency', () => {
    it('should reuse request with same idempotency key', async () => {
      const mockResponse = {
        data: { id: 1, value: 'test' },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockRequest.mockResolvedValue(mockResponse);

      const config = {
        method: 'POST' as const,
        url: '/test',
        data: { name: 'test' },
        idempotencyKey: 'unique-key-123',
      };

      // First request
      const response1 = await httpClient.request(config);
      
      // Second request with same key (should reuse)
      const response2 = await httpClient.request(config);

      expect(response1.data).toEqual({ id: 1, value: 'test' });
      expect(response2.data).toEqual({ id: 1, value: 'test' });
      expect(mockRequest).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should clean up idempotency store after timeout', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      mockRequest.mockResolvedValue(mockResponse);

      const config = {
        method: 'POST' as const,
        url: '/test',
        idempotencyKey: 'timeout-key',
      };

      // Make request
      await httpClient.request(config);

      // Verify the key is in store initially
      const idempotencyStore = (httpClient as any).idempotencyStore;
      expect(idempotencyStore.has('timeout-key')).toBe(true);

      // Fast-forward time to trigger cleanup
      jest.advanceTimersByTime(60000);

      // Wait for setTimeout to execute
      await Promise.resolve();

      // Verify the key is cleaned up
      expect(idempotencyStore.has('timeout-key')).toBe(false);
    });

    it('should handle multiple concurrent requests with same idempotency key', async () => {
      const mockResponse = {
        data: { concurrent: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };

      // Simulate slow request
      mockRequest.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const config = {
        method: 'POST' as const,
        url: '/test',
        idempotencyKey: 'concurrent-key',
      };

      // Start multiple requests concurrently
      const promises = [
        httpClient.request(config),
        httpClient.request(config),
        httpClient.request(config),
      ];

      // Advance timers to resolve the mock request
      jest.advanceTimersByTime(100);

      const responses = await Promise.all(promises);

      // All should get the same response
      responses.forEach(response => {
        expect(response.data).toEqual({ concurrent: true });
      });

      // But only one actual request should be made
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('error scenarios in retry logic', () => {
    it('should handle errors during retry delay', async () => {
      const retryableError = {
        message: 'Timeout',
        code: 'ETIMEDOUT',
      };

      mockRequest.mockRejectedValue(retryableError);
      
      // Mock sleep to reject
      (sleep as jest.Mock).mockRejectedValueOnce(new Error('Sleep interrupted'));

      await expect(
        httpClient.request({
          method: 'GET',
          url: '/test',
          retryConfig: { maxRetries: 1 },
        })
      ).rejects.toThrow();

      expect(globalMetricsCollector.recordRetry).toHaveBeenCalled();
    });
  });
});