export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  idempotencyKey?: string;
  enableMetrics?: boolean;
}

export interface RequestMetrics {
  requestId: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  retryCount: number;
  error?: string;
  idempotencyKey?: string;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  metrics: RequestMetrics;
  duration: number;
  success: boolean;
}

export interface HttpError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  metrics: RequestMetrics;
  isRetryable: boolean;
  success: boolean;
}