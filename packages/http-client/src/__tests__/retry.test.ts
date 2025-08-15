import { calculateDelay, isRetryableError, sleep, DEFAULT_RETRY_CONFIG } from '../retry';

describe('Retry utilities', () => {
  describe('calculateDelay', () => {
    it('should calculate exponential delay correctly', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitterEnabled: false };
      
      expect(calculateDelay(1, config)).toBe(1000);
      expect(calculateDelay(2, config)).toBe(2000);
      expect(calculateDelay(3, config)).toBe(4000);
    });

    it('should respect max delay', () => {
      const config = { 
        ...DEFAULT_RETRY_CONFIG, 
        jitterEnabled: false,
        maxDelay: 5000 
      };
      
      expect(calculateDelay(10, config)).toBe(5000);
    });

    it('should add jitter when enabled', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitterEnabled: true };
      const delay1 = calculateDelay(1, config);
      const delay2 = calculateDelay(1, config);
      
      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThanOrEqual(1100);
      expect(delay1).not.toBe(delay2);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable HTTP status codes', () => {
      const error = { response: { status: 503 } };
      expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(true);
    });

    it('should identify non-retryable HTTP status codes', () => {
      const error = { response: { status: 404 } };
      expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(false);
    });

    it('should identify retryable network errors', () => {
      const error = { code: 'ECONNRESET' };
      expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      const error = { code: 'INVALID_REQUEST' };
      expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(false);
    });

    it('should handle errors without status or code', () => {
      const error = { message: 'Generic error' };
      expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(false);
    });

    it('should check all retryable status codes', () => {
      const retryableCodes = [408, 429, 502, 503, 504];
      retryableCodes.forEach(status => {
        const error = { response: { status } };
        expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(true);
      });
    });

    it('should check all retryable network error codes', () => {
      const retryableCodes = ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'];
      retryableCodes.forEach(code => {
        const error = { code };
        expect(isRetryableError(error, DEFAULT_RETRY_CONFIG)).toBe(true);
      });
    });

    it('should identify retryable error regardless of maxRetries config', () => {
      const error = { response: { status: 503 } };
      const config = { ...DEFAULT_RETRY_CONFIG, maxRetries: 0 };
      // isRetryableError only checks if error type is retryable, not maxRetries
      expect(isRetryableError(error, config)).toBe(true);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified delay', async () => {
      const promise = sleep(1000);
      
      expect(promise).toBeInstanceOf(Promise);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should work with different delay values', async () => {
      const promise500 = sleep(500);
      const promise1500 = sleep(1500);
      
      // Advance by 500ms
      jest.advanceTimersByTime(500);
      await expect(promise500).resolves.toBeUndefined();
      
      // promise1500 should still be pending
      const promise1500State = jest.runAllTimers();
      await expect(promise1500).resolves.toBeUndefined();
    });
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG).toMatchObject({
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        jitterEnabled: true,
        backoffMultiplier: 2,
        retryableStatusCodes: [408, 429, 502, 503, 504],
        retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle calculateDelay with attempt 0', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitterEnabled: false };
      expect(calculateDelay(0, config)).toBe(500); // Math.pow(2, 0-1) = 0.5, so 1000 * 0.5 = 500
    });

    it('should handle very high attempt numbers', () => {
      const config = { 
        ...DEFAULT_RETRY_CONFIG, 
        jitterEnabled: false,
        maxDelay: 10000 
      };
      expect(calculateDelay(100, config)).toBe(10000); // Should respect maxDelay
    });

    it('should handle jitter with minimal delay', () => {
      const config = { 
        ...DEFAULT_RETRY_CONFIG,
        baseDelay: 1,
        maxDelay: 1000,
        jitterEnabled: true 
      };
      const delay = calculateDelay(1, config);
      expect(delay).toBeGreaterThanOrEqual(1);
      expect(delay).toBeLessThanOrEqual(1.1);
    });
  });
});