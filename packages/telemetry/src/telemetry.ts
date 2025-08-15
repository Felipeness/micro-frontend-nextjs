import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { 
  trace, 
  metrics, 
  Span, 
  SpanStatusCode,
  Meter,
  Histogram,
  Counter
} from '@opentelemetry/api';
import { TelemetryConfig, CustomMetrics, RedMetrics, UseMetrics } from './types';

export class TelemetryService {
  private tracerProvider: WebTracerProvider | null = null;
  private meterProvider: MeterProvider | null = null;
  private meter: Meter | null = null;
  private initialized = false;
  
  // Metrics
  private httpDurationHistogram: Histogram | null = null;
  private httpRequestCounter: Counter | null = null;
  private httpErrorCounter: Counter | null = null;
  private pageViewCounter: Counter | null = null;
  private userInteractionCounter: Counter | null = null;
  private businessMetricHistogram: Histogram | null = null;
  
  // RED/USE metrics storage
  private metricsData: Array<{
    timestamp: number;
    duration: number;
    method: string;
    status: number;
    route: string;
    error?: string;
  }> = [];

  async initialize(config: TelemetryConfig): Promise<void> {
    if (this.initialized) {
      console.warn('Telemetry already initialized');
      return;
    }

    try {
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
      });

      // Initialize tracer provider
      this.tracerProvider = new WebTracerProvider({
        resource,
      });

      // Initialize meter provider  
      this.meterProvider = new MeterProvider({
        resource,
      });

      // Register instrumentations
      registerInstrumentations({
        instrumentations: [getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-fetch': {
            propagateTraceHeaderCorsUrls: /.*/,
          },
          '@opentelemetry/instrumentation-xml-http-request': {
            propagateTraceHeaderCorsUrls: /.*/,
          },
        })],
      });

      // Register providers
      trace.setGlobalTracerProvider(this.tracerProvider);
      metrics.setGlobalMeterProvider(this.meterProvider);

      // Initialize metrics
      this.meter = metrics.getMeter(config.serviceName, config.serviceVersion);
      this.setupMetrics();

      this.initialized = true;
      console.log('Telemetry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize telemetry:', error);
      throw error;
    }
  }

  private setupMetrics(): void {
    if (!this.meter) return;

    this.httpDurationHistogram = this.meter.createHistogram('http_request_duration_ms', {
      description: 'Duration of HTTP requests in milliseconds',
    });

    this.httpRequestCounter = this.meter.createCounter('http_requests_total', {
      description: 'Total number of HTTP requests',
    });

    this.httpErrorCounter = this.meter.createCounter('http_request_errors_total', {
      description: 'Total number of HTTP request errors',
    });

    this.pageViewCounter = this.meter.createCounter('page_views_total', {
      description: 'Total number of page views',
    });

    this.userInteractionCounter = this.meter.createCounter('user_interactions_total', {
      description: 'Total number of user interactions',
    });

    this.businessMetricHistogram = this.meter.createHistogram('business_metric', {
      description: 'Custom business metrics',
    });
  }

  getCustomMetrics(): CustomMetrics {
    return {
      httpRequestDuration: (duration, method, status, route) => {
        this.httpDurationHistogram?.record(duration, { method, status: status.toString(), route });
        this.metricsData.push({ timestamp: Date.now(), duration, method, status, route });
        this.cleanupOldMetrics();
      },

      httpRequestTotal: (method, status, route) => {
        this.httpRequestCounter?.add(1, { method, status: status.toString(), route });
      },

      httpRequestErrors: (method, route, errorType) => {
        this.httpErrorCounter?.add(1, { method, route, error_type: errorType });
        this.metricsData.push({ 
          timestamp: Date.now(), 
          duration: 0, 
          method, 
          status: 0, 
          route, 
          error: errorType 
        });
        this.cleanupOldMetrics();
      },

      pageViewTotal: (page) => {
        this.pageViewCounter?.add(1, { page });
      },

      userInteraction: (action, component) => {
        this.userInteractionCounter?.add(1, { action, component });
      },

      businessMetric: (name, value, labels = {}) => {
        this.businessMetricHistogram?.record(value, { metric_name: name, ...labels });
      },
    };
  }

  createSpan(name: string, callback: (span: Span) => Promise<void> | void): Promise<void> {
    const tracer = trace.getTracer('default');
    return tracer.startActiveSpan(name, async (span) => {
      try {
        await callback(span);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        span.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  getRedMetrics(): RedMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentMetrics = this.metricsData.filter(m => m.timestamp >= oneMinuteAgo);

    const rate = recentMetrics.length;
    const errors = recentMetrics.filter(m => m.error || m.status >= 400).length;
    
    const durations = recentMetrics
      .filter(m => m.duration > 0)
      .map(m => m.duration)
      .sort((a, b) => a - b);

    const avg = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const p50 = durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;
    const p95 = durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0;
    const p99 = durations.length > 0 ? durations[Math.floor(durations.length * 0.99)] : 0;

    return {
      rate,
      errors,
      duration: { avg, p50, p95, p99 }
    };
  }

  getUseMetrics(): UseMetrics {
    const redMetrics = this.getRedMetrics();
    
    // Simplified USE metrics calculation
    const utilization = Math.min(redMetrics.rate / 100, 1) * 100; // Assume 100 RPS is 100% utilization
    const saturation = redMetrics.duration.p95 > 1000 ? 100 : 0; // High latency indicates saturation
    const errors = (redMetrics.errors / Math.max(redMetrics.rate, 1)) * 100;

    return {
      utilization,
      saturation,
      errors
    };
  }

  private cleanupOldMetrics(): void {
    const fiveMinutesAgo = Date.now() - 300000;
    this.metricsData = this.metricsData.filter(m => m.timestamp > fiveMinutesAgo);
  }

  async shutdown(): Promise<void> {
    if (this.tracerProvider) {
      await this.tracerProvider.shutdown();
    }
    if (this.meterProvider) {
      await this.meterProvider.shutdown();
    }
    this.initialized = false;
    console.log('Telemetry shutdown successfully');
  }
}

export const telemetryService = new TelemetryService();