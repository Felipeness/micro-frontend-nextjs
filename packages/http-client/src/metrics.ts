import { RequestMetrics } from './types';

export class MetricsCollector {
  private metrics: Map<string, RequestMetrics> = new Map();

  startRequest(
    requestId: string,
    url: string,
    method: string,
    idempotencyKey?: string
  ): RequestMetrics {
    const metrics: RequestMetrics = {
      requestId,
      url,
      method,
      startTime: Date.now(),
      retryCount: 0,
      idempotencyKey,
    };

    this.metrics.set(requestId, metrics);
    return metrics;
  }

  recordRetry(requestId: string): void {
    const metrics = this.metrics.get(requestId);
    if (metrics) {
      metrics.retryCount++;
    }
  }

  recordResponse(
    requestId: string,
    statusCode: number,
    statusText?: string
  ): void {
    const metrics = this.metrics.get(requestId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.statusCode = statusCode;
    }
  }

  recordError(requestId: string, error: Error, statusCode?: number): void {
    const metrics = this.metrics.get(requestId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.error = error.message;
      metrics.statusCode = statusCode;
    }
  }

  getMetrics(requestId: string): RequestMetrics | undefined {
    return this.metrics.get(requestId);
  }

  getAllMetrics(): RequestMetrics[] {
    return Array.from(this.metrics.values());
  }

  getRedMetrics(): {
    rate: number;
    errors: number;
    duration: { avg: number; p95: number; p99: number };
  } {
    const allMetrics = this.getAllMetrics();
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentMetrics = allMetrics.filter(
      m => m.startTime >= oneMinuteAgo && m.endTime
    );

    const errors = recentMetrics.filter(
      m => m.error || (m.statusCode && m.statusCode >= 400)
    ).length;

    const durations = recentMetrics
      .map(m => m.duration!)
      .filter(d => d !== undefined)
      .sort((a, b) => a - b);

    const avg = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const p95 = durations.length > 0 
      ? durations[Math.floor(durations.length * 0.95)] 
      : 0;

    const p99 = durations.length > 0 
      ? durations[Math.floor(durations.length * 0.99)] 
      : 0;

    return {
      rate: recentMetrics.length,
      errors,
      duration: { avg, p95, p99 },
    };
  }

  clearOldMetrics(olderThanMs: number = 300000): void {
    const cutoff = Date.now() - olderThanMs;
    for (const [id, metrics] of this.metrics.entries()) {
      if (metrics.startTime < cutoff) {
        this.metrics.delete(id);
      }
    }
  }
}

export const globalMetricsCollector = new MetricsCollector();