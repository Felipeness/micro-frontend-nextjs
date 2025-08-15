import { render } from '@testing-library/react';
import { TelemetryProvider } from '../components/TelemetryProvider';

// Mock telemetry service
jest.mock('telemetry', () => ({
  telemetryService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('TelemetryProvider', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <TelemetryProvider>
        <div>Test content</div>
      </TelemetryProvider>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('should initialize telemetry on mount', () => {
    const { telemetryService } = require('telemetry');
    
    render(
      <TelemetryProvider>
        <div>Test content</div>
      </TelemetryProvider>
    );

    expect(telemetryService.initialize).toHaveBeenCalledWith({
      serviceName: 'micro-frontend-host',
      serviceVersion: '1.0.0',
      environment: 'test',
      enableConsoleExporter: true,
      sampleRate: 1.0,
    });
  });
});