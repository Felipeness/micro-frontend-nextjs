import { RetryConfig } from './types';

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterEnabled: true,
  retryableStatusCodes: [408, 429, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'],
};

export function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );

  if (!config.jitterEnabled) {
    return exponentialDelay;
  }

  const jitter = Math.random() * 0.1 * exponentialDelay;
  return exponentialDelay + jitter;
}

export function isRetryableError(error: any, config: RetryConfig): boolean {
  if (error.response?.status) {
    return config.retryableStatusCodes.includes(error.response.status);
  }

  if (error.code) {
    return config.retryableErrors.includes(error.code);
  }

  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}