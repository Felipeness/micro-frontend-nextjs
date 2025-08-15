import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  RequestConfig, 
  HttpResponse, 
  HttpError, 
  RetryConfig,
  RequestMetrics 
} from './types';
import { 
  DEFAULT_RETRY_CONFIG, 
  calculateDelay, 
  isRetryableError, 
  sleep 
} from './retry';
import { globalMetricsCollector } from './metrics';

// Telemetry mock - will be replaced with real implementation
const mockTelemetryService = {
  createSpan: async (name: string, callback: (span: any) => Promise<any>) => {
    const mockSpan = {
      setAttributes: () => {},
      setStatus: () => {},
      recordException: () => {},
      end: () => {}
    };
    return callback(mockSpan);
  },
  getCustomMetrics: () => ({
    httpRequestDuration: (...args: any[]) => {},
    httpRequestTotal: (...args: any[]) => {},
    httpRequestErrors: (...args: any[]) => {},
    pageViewTotal: (...args: any[]) => {},
    userInteraction: (...args: any[]) => {},
    businessMetric: (...args: any[]) => {},
  })
};

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private idempotencyStore: Map<string, Promise<HttpResponse>> = new Map();

  constructor(baseURL?: string, defaultTimeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: defaultTimeout,
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async executeRequest<T>(
    config: RequestConfig,
    retryConfig: RetryConfig,
    metrics: RequestMetrics
  ): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    
    return mockTelemetryService.createSpan(`http_${config.method.toLowerCase()}_${config.url}`, async (span: any) => {
      span.setAttributes({
        'http.method': config.method,
        'http.url': config.url,
        'http.request_id': metrics.requestId,
      });

      try {
        const response: AxiosResponse<T> = await this.axiosInstance.request({
          url: config.url,
          method: config.method,
          data: config.data,
          headers: config.headers,
          timeout: config.timeout,
          params: config.params,
        });

        const duration = Date.now() - startTime;
        
        // Record metrics
        globalMetricsCollector.recordResponse(
          metrics.requestId,
          response.status,
          response.statusText
        );

        // Record telemetry metrics
        const telemetryMetrics = mockTelemetryService.getCustomMetrics();
        telemetryMetrics.httpRequestDuration(duration, config.method, response.status, config.url);
        telemetryMetrics.httpRequestTotal(config.method, response.status, config.url);

        span.setAttributes({
          'http.status_code': response.status,
          'http.response_size': JSON.stringify(response.data).length,
        });

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          metrics: globalMetricsCollector.getMetrics(metrics.requestId)!,
          duration,
          success: true,
        };
      } catch (error: any) {
        const statusCode = error.response?.status;
        const duration = Date.now() - startTime;
        
        globalMetricsCollector.recordError(metrics.requestId, error, statusCode);

        // Record telemetry error metrics
        const telemetryMetrics = mockTelemetryService.getCustomMetrics();
        const errorType = error.code || 'unknown_error';
        telemetryMetrics.httpRequestErrors(config.method, config.url, errorType);
        
        if (statusCode) {
          telemetryMetrics.httpRequestDuration(duration, config.method, statusCode, config.url);
          telemetryMetrics.httpRequestTotal(config.method, statusCode, config.url);
        }

        span.setAttributes({
          'http.status_code': statusCode || 0,
          'error.type': errorType,
          'error.message': error.message,
        });

        const httpError: HttpError = {
          name: 'HttpError',
          message: error.message || 'Request failed',
          status: statusCode,
          statusText: error.response?.statusText,
          data: error.response?.data,
          metrics: globalMetricsCollector.getMetrics(metrics.requestId)!,
          isRetryable: isRetryableError(error, retryConfig),
          success: false,
        };

        throw httpError;
      }
    });
  }

  async request<T>(config: RequestConfig): Promise<HttpResponse<T>> {
    const requestId = this.generateRequestId();
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };

    if (config.idempotencyKey) {
      const existingRequest = this.idempotencyStore.get(config.idempotencyKey);
      if (existingRequest) {
        return existingRequest as Promise<HttpResponse<T>>;
      }
    }

    const metrics = globalMetricsCollector.startRequest(
      requestId,
      config.url,
      config.method,
      config.idempotencyKey
    );

    const requestPromise = this.executeRequestWithRetries<T>(
      config,
      retryConfig,
      metrics
    );

    if (config.idempotencyKey) {
      this.idempotencyStore.set(config.idempotencyKey, requestPromise);
      
      requestPromise.finally(() => {
        setTimeout(() => {
          this.idempotencyStore.delete(config.idempotencyKey!);
        }, 60000);
      });
    }

    return requestPromise;
  }

  private async executeRequestWithRetries<T>(
    config: RequestConfig,
    retryConfig: RetryConfig,
    metrics: RequestMetrics
  ): Promise<HttpResponse<T>> {
    let lastError: HttpError;

    for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
      try {
        return await this.executeRequest<T>(config, retryConfig, metrics);
      } catch (error: any) {
        lastError = error as HttpError;

        if (attempt > retryConfig.maxRetries || !lastError.isRetryable) {
          throw lastError;
        }

        globalMetricsCollector.recordRetry(metrics.requestId);

        const delay = calculateDelay(attempt, retryConfig);
        await sleep(delay);
      }
    }

    throw lastError!;
  }

  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  getMetrics() {
    return globalMetricsCollector.getRedMetrics();
  }

  clearMetrics() {
    globalMetricsCollector.clearOldMetrics();
  }
}

export const httpClient = new HttpClient();