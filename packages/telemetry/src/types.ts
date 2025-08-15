export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  jaegerEndpoint?: string;
  prometheusEndpoint?: string;
  sampleRate?: number;
  enableConsoleExporter?: boolean;
}

export interface CustomMetrics {
  httpRequestDuration: (duration: number, method: string, status: number, route: string) => void;
  httpRequestTotal: (method: string, status: number, route: string) => void;
  httpRequestErrors: (method: string, route: string, errorType: string) => void;
  pageViewTotal: (page: string) => void;
  userInteraction: (action: string, component: string) => void;
  businessMetric: (name: string, value: number, labels?: Record<string, string>) => void;
}

export interface RedMetrics {
  rate: number;
  errors: number;
  duration: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface UseMetrics {
  utilization: number;
  saturation: number;
  errors: number;
}