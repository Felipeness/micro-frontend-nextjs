import { calculateDelay, isRetryableError, DEFAULT_RETRY_CONFIG } from '../retry';

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
  });
});