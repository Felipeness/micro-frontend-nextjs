import { HttpClient } from '../http-client';

// Mock axios completely
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
    }),
  })),
}));

// Mock metrics
jest.mock('../metrics', () => ({
  globalMetricsCollector: {
    startRequest: jest.fn(() => ({ requestId: 'test-id' })),
    recordResponse: jest.fn(),
    recordError: jest.fn(),
    getMetrics: jest.fn(),
    getRedMetrics: jest.fn(),
    clearOldMetrics: jest.fn(),
  },
}));

// Mock retry utilities
jest.mock('../retry', () => ({
  DEFAULT_RETRY_CONFIG: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterEnabled: true,
    retryableStatusCodes: [408, 429, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'],
  },
  calculateDelay: jest.fn(() => 1000),
  isRetryableError: jest.fn(() => false),
  sleep: jest.fn(() => Promise.resolve()),
}));

describe('HttpClient - Simple Request Tests', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient('https://api.test.com');
    jest.clearAllMocks();
  });

  describe('HTTP methods', () => {
    it('should make GET request', async () => {
      const response = await httpClient.get('/users');
      
      expect(response.data).toEqual({ success: true });
      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
    });

    it('should make POST request with data', async () => {
      const data = { name: 'John', email: 'john@test.com' };
      const response = await httpClient.post('/users', data);
      
      expect(response.data).toEqual({ success: true });
      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
    });

    it('should make PUT request with data', async () => {
      const data = { name: 'Jane' };
      const response = await httpClient.put('/users/1', data);
      
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should make PATCH request with data', async () => {
      const data = { email: 'new@test.com' };
      const response = await httpClient.patch('/users/1', data);
      
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should make DELETE request', async () => {
      const response = await httpClient.delete('/users/1');
      
      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
    });
  });

  describe('request method', () => {
    it('should handle custom configuration', async () => {
      const response = await httpClient.request({
        method: 'GET',
        url: '/test',
        timeout: 10000,
        headers: { 'Authorization': 'Bearer token' },
      });
      
      expect(response.success).toBe(true);
    });

    it('should handle POST with custom config', async () => {
      const response = await httpClient.request({
        method: 'POST',
        url: '/test',
        data: { test: true },
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.success).toBe(true);
    });
  });

  describe('response properties', () => {
    it('should include duration in response', async () => {
      const response = await httpClient.get('/test');
      
      expect(response).toHaveProperty('duration');
      expect(typeof response.duration).toBe('number');
      expect(response.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include success flag', async () => {
      const response = await httpClient.get('/test');
      
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
    });

    it('should preserve original response data', async () => {
      const response = await httpClient.get('/test');
      
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('statusText');
      expect(response).toHaveProperty('headers');
    });
  });
});